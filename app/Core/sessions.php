<?php
/**
 * Session and Authentication Management
 * 
 * This file handles session management, authentication, and "remember me" functionality
 * using both short-lived PHP sessions and long-lived secure tokens stored in cookies and database.
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    // Set secure session parameters
    ini_set('session.use_only_cookies', 1);
    ini_set('session.use_strict_mode', 1);
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', isset($_SERVER['HTTPS']));
    ini_set('session.cookie_samesite', 'Strict');
    
    session_start();
}

/**
 * SessionManager class
 * Handles user sessions, authentication, and "remember me" functionality
 */
class SessionManager {
    // Constants for cookie and session settings
    const REMEMBER_COOKIE = 'remember_token';
    const REMEMBER_EXPIRY = 2592000; // 30 days in seconds
    const SESSION_USER_KEY = 'user_id';
    const SESSION_USER_TYPE = 'user_type';
    
    private $db = null;
    
    /**
     * Constructor
     */
    public function __construct() {
        // Get database connection
        // TEMPORARILY COMMENTED OUT FOR TESTING WITHOUT DATABASE
        /*
        try {
            $this->db = require_once __DIR__ . '/connection.php';
        } catch (Exception $e) {
            error_log("Database connection failed in SessionManager: " . $e->getMessage());
        }  
        */
        $this->db = null; // Set to null for testing
        
        // Create token table if it doesn't exist
        $this->ensureTokenTable();
        
        // Check authentication status
        $this->checkAuthentication();
    }
    
    /**
     * Ensure the remember_tokens table exists in the database
     * @return void
     */
    private function ensureTokenTable() {
        // Skip if no database connection
        if (!$this->db) {
            return;
        }
        
        $sql = "CREATE TABLE IF NOT EXISTS remember_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token_hash VARCHAR(255) NOT NULL,
            selector VARCHAR(255) NOT NULL,
            expires DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_token (selector),
            INDEX idx_expires (expires)
        )";
        
        try {
            $this->db->exec($sql);
        } catch (PDOException $e) {
            error_log("Failed to create remember_tokens table: " . $e->getMessage());
        }
    }
    
    /**
     * Set authenticated session
     * 
     * @param int $userId User ID
     * @param string $userType User type (standard, super)
     * @param bool $rememberMe Whether to create a remember me token
     * @return bool Success status
     */
    public function login($userId, $userType, $rememberMe = false) {
        // Set session variables
        $_SESSION[self::SESSION_USER_KEY] = $userId;
        $_SESSION[self::SESSION_USER_TYPE] = $userType;
        
        // Generate a new session ID to prevent session fixation attacks
        session_regenerate_id(true);
        
        // If remember me requested, create a persistent token
        if ($rememberMe) {
            $this->createRememberMeToken($userId);
        }
        
        return true;
    }
    
    /**
     * Create and store a new remember me token
     * 
     * @param int $userId User ID
     * @return bool Success status
     */
    private function createRememberMeToken($userId) {
        if (!$this->db) {
            return false;
        }
        
        // Generate a random secure token
        $selector = bin2hex(random_bytes(16));
        $token = bin2hex(random_bytes(32));
        
        // Hash the token for database storage
        $tokenHash = hash('sha256', $token);
        
        // Calculate expiry time (30 days from now)
        $expires = date('Y-m-d H:i:s', time() + self::REMEMBER_EXPIRY);
        
        // Store the token in the database
        try {
            $stmt = $this->db->prepare("
                INSERT INTO remember_tokens (user_id, token_hash, selector, expires) 
                VALUES (?, ?, ?, ?)
            ");
            
            $stmt->execute([$userId, $tokenHash, $selector, $expires]);
            
            // Set the cookie with the selector:token format
            // We'll use the selector to look up the record and the token to verify
            $cookieValue = $selector . ':' . $token;
            
            setcookie(self::REMEMBER_COOKIE, $cookieValue, [
                'expires' => time() + self::REMEMBER_EXPIRY,
                'path' => '/',
                'secure' => isset($_SERVER['HTTPS']),
                'httponly' => true,
                'samesite' => 'Strict'
            ]);
            
            return true;
        } catch (PDOException $e) {
            error_log("Failed to store remember me token: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Verify remember me token and recreate the session
     * 
     * @return bool Whether user was authenticated via remember me
     */
    private function verifyRememberMeToken() {
        if (!isset($_COOKIE[self::REMEMBER_COOKIE]) || !$this->db) {
            return false;
        }
        
        // Get cookie value
        $cookieValue = $_COOKIE[self::REMEMBER_COOKIE];
        
        // Split the cookie value into selector and token
        $parts = explode(':', $cookieValue);
        if (count($parts) !== 2) {
            $this->clearRememberMeCookie();
            return false;
        }
        
        list($selector, $token) = $parts;
        
        // Calculate token hash
        $tokenHash = hash('sha256', $token);
        
        try {
            // Find the token record by selector
            $stmt = $this->db->prepare("
                SELECT user_id, token_hash, expires 
                FROM remember_tokens 
                WHERE selector = ? AND expires > NOW()
            ");
            
            $stmt->execute([$selector]);
            $tokenData = $stmt->fetch();
            
            // If no valid token found or token hash doesn't match
            if (!$tokenData || !hash_equals($tokenData['token_hash'], $tokenHash)) {
                $this->clearRememberMeCookie();
                return false;
            }
            
            // Get the user data
            $userId = $tokenData['user_id'];
            
            $stmt = $this->db->prepare("
                SELECT id, user_type FROM users WHERE id = ?
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            
            if (!$user) {
                $this->clearRememberMeCookie();
                return false;
            }
            
            // Create a new session for the user
            $this->login($userId, $user['user_type'], true);
            
            return true;
        } catch (PDOException $e) {
            error_log("Failed to verify remember me token: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Clear remember me cookie and tokens
     * 
     * @param int|null $userId If provided, only clear tokens for this user
     * @return void
     */
    public function clearRememberMeTokens($userId = null) {
        // Clear cookie regardless of userId
        $this->clearRememberMeCookie();
        
        if (!$this->db) {
            return;
        }
        
        try {
            if ($userId) {
                // Clear all tokens for specific user
                $stmt = $this->db->prepare("DELETE FROM remember_tokens WHERE user_id = ?");
                $stmt->execute([$userId]);
            } else if (isset($_COOKIE[self::REMEMBER_COOKIE])) {
                // Clear just the current token
                $cookieValue = $_COOKIE[self::REMEMBER_COOKIE];
                $parts = explode(':', $cookieValue);
                
                if (count($parts) === 2) {
                    $selector = $parts[0];
                    $stmt = $this->db->prepare("DELETE FROM remember_tokens WHERE selector = ?");
                    $stmt->execute([$selector]);
                }
            }
        } catch (PDOException $e) {
            error_log("Failed to clear remember me tokens: " . $e->getMessage());
        }
    }
    
    /**
     * Clear remember me cookie
     * 
     * @return void
     */
    private function clearRememberMeCookie() {
        setcookie(self::REMEMBER_COOKIE, '', [
            'expires' => time() - 3600,
            'path' => '/',
            'secure' => isset($_SERVER['HTTPS']),
            'httponly' => true,
            'samesite' => 'Strict'
        ]);
    }
    
    /**
     * Check if the user is authenticated either via session or remember me token
     * 
     * @return void
     */
    public function checkAuthentication() {
        // Already logged in via session
        if (isset($_SESSION[self::SESSION_USER_KEY])) {
            return;
        }
        
        // Try to authenticate via remember me token
        if ($this->verifyRememberMeToken()) {
            return;
        }
    }
    
    /**
     * Check if user is authenticated
     * 
     * @return bool Authentication status
     */
    public function isAuthenticated() {
        return isset($_SESSION[self::SESSION_USER_KEY]);
    }
    
    /**
     * Get user ID from session
     * 
     * @return int|null User ID or null if not authenticated
     */
    public function getUserId() {
        return $_SESSION[self::SESSION_USER_KEY] ?? null;
    }
    
    /**
     * Get user type from session
     * 
     * @return string User type or 'guest' if not authenticated
     */
    public function getUserType() {
        return $_SESSION[self::SESSION_USER_TYPE] ?? 'guest';
    }
    
    /**
     * Get normalized user type for routing decisions
     * Maps 'super' to 'admin' for compatibility with web.php routing
     * @return string Normalized user type
     */
    public function getNormalizedUserType() {
        $userType = $this->getUserType();
        
        // Map super user to admin for routing compatibility
        if ($userType === 'super') {
            return 'admin';
        }
        
        return $userType;
    }

    /**
     * Logout: destroy session and clear remember me tokens
     * 
     * @return void
     */
    public function logout() {
        // Clear remember me tokens for the current user
        $userId = $this->getUserId();
        if ($userId) {
            $this->clearRememberMeTokens($userId);
        }
        
        // Destroy session
        $_SESSION = [];
        
        // If a session cookie exists, destroy it
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires' => time() - 3600,
                'path' => $params["path"],
                'domain' => $params["domain"],
                'secure' => $params["secure"],
                'httponly' => $params["httponly"],
                'samesite' => 'Strict'
            ]);
        }
        
        session_destroy();
    }
    
    /**
     * Require authentication or redirect to login
     * 
     * @param string $redirectUrl URL to redirect to if not authenticated
     * @return bool Whether user is authenticated
     */
    public function requireAuth($redirectUrl = '/auth.php') {
        if (!$this->isAuthenticated()) {
            header("Location: $redirectUrl");
            exit;
        }
        return true;
    }
    
    /**
     * Require a specific user type or redirect
     * 
     * @param string|array $requiredTypes Required user type(s)
     * @param string $redirectUrl URL to redirect to if user type doesn't match
     * @return bool Whether user has required type
     */
    public function requireUserType($requiredTypes, $redirectUrl = '/') {
        if (!$this->isAuthenticated()) {
            header("Location: /auth.php");
            exit;
        }
        
        $userType = $this->getUserType();
        
        // Convert to array for consistent checking
        if (!is_array($requiredTypes)) {
            $requiredTypes = [$requiredTypes];
        }
        
        if (!in_array($userType, $requiredTypes)) {
            header("Location: $redirectUrl");
            exit;
        }
        
        return true;
    }
    
    /**
     * Clean up expired tokens
     * 
     * @return int Number of tokens deleted
     */
    public function cleanupExpiredTokens() {
        if (!$this->db) {
            return 0;
        }
        
        try {
            $stmt = $this->db->prepare("DELETE FROM remember_tokens WHERE expires < NOW()");
            $stmt->execute();
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Failed to clean up expired tokens: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Check if user has a remember me token
     * @return bool
     */
    public function hasRememberMeToken() {
        if (!$this->db) {
            return false; // No database, no remember me tokens
        }
        
        return isset($_COOKIE['remember_token']);
    }

    /**
     * Revalidate remember me token
     * @return bool
     */
    public function revalidateRememberMeToken() {
        if (!$this->db) {
            return false; // No database, cannot revalidate
        }
        
        return $this->verifyRememberMeToken();
    }

    /**
     * Get user data (stub for when no database is available)
     * @return array|null
     */
    public function getUser() {
        if (isset($_SESSION['user_id'])) {
            $userType = $_SESSION['user_type'] ?? 'standard';
            
            // Normalize user type for routing compatibility
            if ($userType === 'super') {
                $userType = 'admin';
            }
            
            return [
                'id' => $_SESSION['user_id'],
                'user_type' => $userType
            ];
        }
        return null;
    }

    /**
     * Restart the current session
     * @return bool
     */
    public function restartSession() {
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_regenerate_id(true);
            return true;
        }
        return false;
    }

    /**
     * Start a new session for authenticated user
     * @param int $userId User ID
     * @param string $userType User type
     * @return bool Success status
     */
    public function startSession($userId = null, $userType = 'standard') {
        // If no parameters provided, use default values for testing
        if ($userId === null) {
            $userId = 1; // Default test user ID
        }
        
        // Set session variables
        $_SESSION[self::SESSION_USER_KEY] = $userId;
        $_SESSION[self::SESSION_USER_TYPE] = $userType;
        
        // Generate a new session ID to prevent session fixation attacks
        session_regenerate_id(true);
        
        return true;
    }

    /**
     * Create a new authentication token (CSRF protection or similar)
     * @return string Generated token
     */
    public function createToken() {
        // Generate a secure random token
        $token = bin2hex(random_bytes(32));
        
        // Store in session for verification
        $_SESSION['csrf_token'] = $token;
        
        return $token;
    }

    /**
     * Verify a token against the stored session token
     * @param string $token Token to verify
     * @return bool Whether token is valid
     */
    public function verifyToken($token) {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
}

// Initialize the session manager if not on CLI
if (php_sapi_name() !== 'cli') {
    $sessionManager = new SessionManager();
}

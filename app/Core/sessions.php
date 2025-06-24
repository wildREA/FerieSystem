<?php
/**
 * Session and Authentication Management
 * 
 * This file handles session management, authentication, and "remember me" functionality
 * using both short-lived PHP sessions and long-lived secure tokens stored in cookies and database.
 */

// Include UrlHelper for redirects
require_once __DIR__ . '/../Helpers/UrlHelper.php';

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    // Set secure session parameters
    ini_set('session.use_only_cookies', 1);
    ini_set('session.use_strict_mode', 1);
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', isset($_SERVER['HTTPS']));
    ini_set('session.cookie_samesite', 'Strict');
    
    // Set session cookie lifetime to 1 day (86400 seconds)
    // This is different from the remember me token which lasts 30 days
    ini_set('session.cookie_lifetime', 86400);
    ini_set('session.gc_maxlifetime', 86400);
    
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
    const SESSION_EXPIRY = 86400; // 1 day in seconds
    const SESSION_USER_KEY = 'user_id';
    const SESSION_USER_TYPE = 'user_type';
    const SESSION_CREATED_AT = 'session_created_at';
    
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
        $_SESSION[self::SESSION_CREATED_AT] = time(); // Store session creation time
        
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
        error_log('Attempting to verify remember me token');
        
        // If no cookie present or no DB connection
        if (!isset($_COOKIE[self::REMEMBER_COOKIE])) {
            error_log('No remember me cookie found');
            return false;
        }
        
        if (!$this->db) {
            error_log('No database connection available for token verification');
            return false;
        }
        
        // Get cookie value
        $cookieValue = $_COOKIE[self::REMEMBER_COOKIE];
        error_log('Remember me cookie found: ' . substr($cookieValue, 0, 10) . '...');
        
        // Split the cookie value into selector and token
        $parts = explode(':', $cookieValue);
        if (count($parts) !== 2) {
            error_log('Invalid remember me cookie format');
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
            
            // Check if token exists
            if (!$tokenData) {
                error_log('No valid token found for selector or token has expired');
                $this->clearRememberMeCookie();
                return false;
            }
            
            // Verify token hash
            if (!hash_equals($tokenData['token_hash'], $tokenHash)) {
                error_log('Token hash verification failed');
                $this->clearRememberMeCookie();
                return false;
            }
            
            // Check token expiration explicitly
            $expiresTime = strtotime($tokenData['expires']);
            if ($expiresTime < time()) {
                error_log('Token has expired: ' . $tokenData['expires']);
                $this->clearRememberMeCookie();
                return false;
            }
            
            error_log('Remember me token validated successfully. Expiry: ' . $tokenData['expires']);
            
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
     * Also handles session expiration and token revalidation
     * 
     * @return bool Whether user is authenticated
     */
    public function checkAuthentication() {
        // Check if user has an active session
        if (isset($_SESSION[self::SESSION_USER_KEY])) {
            // Check if session hasn't expired
            if (isset($_SESSION[self::SESSION_CREATED_AT])) {
                $sessionAge = time() - $_SESSION[self::SESSION_CREATED_AT];
                
                // If session has exceeded expiry time
                if ($sessionAge > self::SESSION_EXPIRY) {
                    error_log('Session expired. Age: ' . $sessionAge . ' seconds. Checking for remember me token...');
                    
                    // Check for remember me token
                    if ($this->hasRememberMeToken()) {
                        error_log('Found remember me token, attempting to revalidate');
                        // Try to revalidate and create a new session
                        return $this->revalidateRememberMeToken();
                    } else {
                        error_log('No remember me token found, logging out user');
                        $this->logout();
                        return false;
                    }
                } else {
                    // Session is still valid
                    return true;
                }
            } else {
                // No creation time - this is unusual, but we'll accept the session
                error_log('Session found without creation timestamp. Setting timestamp now.');
                $_SESSION[self::SESSION_CREATED_AT] = time();
                return true;
            }
        }
        
        // No active session, try to authenticate via remember me token
        if ($this->hasRememberMeToken()) {
            error_log('No session but remember me token found. Attempting to revalidate.');
            return $this->verifyRememberMeToken();
        }
        
        return false;
    }
    
    /**
     * Check if user is authenticated and session is not expired
     * 
     * @return bool Authentication status
     */
    public function isAuthenticated() {
        if (!isset($_SESSION[self::SESSION_USER_KEY])) {
            return false;
        }
        
        // Check if session has expired
        if (isset($_SESSION[self::SESSION_CREATED_AT])) {
            $sessionAge = time() - $_SESSION[self::SESSION_CREATED_AT];
            
            // If session has exceeded expiry time
            if ($sessionAge > self::SESSION_EXPIRY) {
                // Check for remember me token
                if ($this->hasRememberMeToken()) {
                    // Try to revalidate and create a new session
                    return $this->revalidateRememberMeToken();
                }
                
                // No remember me token, session expired
                $this->logout();
                return false;
            }
        }
        
        return true;
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
    public function requireAuth($redirectUrl = '/auth') {
        if (!$this->isAuthenticated()) {
            redirect($redirectUrl);
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
            redirect('/auth');
        }
        
        $userType = $this->getUserType();
        
        // Convert to array for consistent checking
        if (!is_array($requiredTypes)) {
            $requiredTypes = [$requiredTypes];
        }
        
        if (!in_array($userType, $requiredTypes)) {
            redirect($redirectUrl);
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
     * Revalidate remember me token and refresh session
     * @return bool
     */
    public function revalidateRememberMeToken() {
        error_log('Revalidating remember me token...');
        
        if (!$this->db) {
            error_log('No database connection, cannot revalidate token');
            return false;
        }
        
        // Verify token and create new session
        $success = $this->verifyRememberMeToken();
        
        if ($success) {
            error_log('Remember me token revalidated successfully, session refreshed');
            // The new session is created in verifyRememberMeToken if successful
            return true;
        } else {
            error_log('Remember me token revalidation failed');
            return false;
        }
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

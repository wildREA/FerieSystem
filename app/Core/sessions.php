<?php
require_once __DIR__ . '/../Helpers/UrlHelper.php';

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.use_only_cookies', 1);
    ini_set('session.use_strict_mode', 1);
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', isset($_SERVER['HTTPS']));
    ini_set('session.cookie_samesite', 'Strict');
    ini_set('session.cookie_lifetime', 86400);
    ini_set('session.gc_maxlifetime', 86400);
    
    session_start();
}

class SessionManager {
    const REMEMBER_COOKIE = 'remember_token';
    const REMEMBER_EXPIRY = 2592000; // 30 days
    const SESSION_EXPIRY = 86400; // 1 day
    const SESSION_USER_KEY = 'user_id';
    const SESSION_USER_TYPE = 'user_type';
    const SESSION_CREATED_AT = 'session_created_at';
    
    private $db = null;
    
    public function __construct() {
        // Get database connection
        try {
            $connectionPath = __DIR__ . '/connection.php';
            error_log("SessionManager: Attempting to load connection from: " . $connectionPath);
            
            if (!file_exists($connectionPath)) {
                error_log("SessionManager: Connection file not found at: " . $connectionPath);
                $this->db = null;
            } else {
                $connection = require $connectionPath;
                if ($connection instanceof PDO) {
                    $this->db = $connection;
                    error_log("SessionManager: Database connection successful");
                } else {
                    error_log("SessionManager: Database connection returned: " . gettype($connection) . " (expected PDO)");
                    $this->db = null;
                }
            }
        } catch (Exception $e) {
            error_log("SessionManager: Database connection failed with Exception: " . $e->getMessage());
            $this->db = null;
        }
        
        $this->ensureTokenTable();
        $this->checkAuthentication();
    }
    
    private function ensureTokenTable() {
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
    
    public function login($userId, $userType, $rememberMe = false) {
        $_SESSION[self::SESSION_USER_KEY] = $userId;
        $_SESSION[self::SESSION_USER_TYPE] = $userType;
        $_SESSION[self::SESSION_CREATED_AT] = time();
        
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
        
        $selector = bin2hex(random_bytes(16));
        $token = bin2hex(random_bytes(32));
        
        $tokenHash = hash('sha256', $token);
        
        $expires = date('Y-m-d H:i:s', time() + self::REMEMBER_EXPIRY);
        
        try {
            $stmt = $this->db->prepare("
                INSERT INTO remember_tokens (user_id, token_hash, selector, expires) 
                VALUES (?, ?, ?, ?)
            ");
            
            $stmt->execute([$userId, $tokenHash, $selector, $expires]);
            
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
    
    private function verifyRememberMeToken() {
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
    
    public function clearRememberMeTokens($userId = null) {
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
    
    private function clearRememberMeCookie() {
        setcookie(self::REMEMBER_COOKIE, '', [
            'expires' => time() - 3600,
            'path' => '/',
            'secure' => isset($_SERVER['HTTPS']),
            'httponly' => true,
            'samesite' => 'Strict'
        ]);
    }
    
    public function checkAuthentication() {
        if (isset($_SESSION[self::SESSION_USER_KEY])) {
            if (isset($_SESSION[self::SESSION_CREATED_AT])) {
                $sessionAge = time() - $_SESSION[self::SESSION_CREATED_AT];
                
                if ($sessionAge > self::SESSION_EXPIRY) {
                    if ($this->hasRememberMeToken()) {
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

    public function startSession($userId = null, $userType = 'standard') {
        if ($userId === null) {
            $userId = 1;
        }
        
        // Set session variables
        $_SESSION[self::SESSION_USER_KEY] = $userId;
        $_SESSION[self::SESSION_USER_TYPE] = $userType;
        
        session_regenerate_id(true);
        
        return true;
    }

    public function createToken() {
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;
        return $token;
    }

    public function verifyToken($token) {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
}

// Initialize the session manager if not on CLI
if (php_sapi_name() !== 'cli') {
    $sessionManager = new SessionManager();
}

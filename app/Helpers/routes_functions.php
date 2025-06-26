<?php
/**
 * Route helper functions
 */

if (!function_exists('redirect')) {
    /**
     * Redirect to a URL
     */
    function redirect($url, $statusCode = 302) {
        header("Location: $url", true, $statusCode);
        exit;
    }
}

if (!function_exists('url')) {
    /**
     * Generate a URL
     */
    function url($path = '') {
        $baseUrl = $_ENV['APP_URL'] ?? 'http://localhost';
        return rtrim($baseUrl, '/') . '/' . ltrim($path, '/');
    }
}

if (!function_exists('asset')) {
    /**
     * Generate an asset URL
     */
    function asset($path) {
        return url('assets/' . ltrim($path, '/'));
    }
}

if (!function_exists('getCurrentUser')) {
    /**
     * Get current logged-in user data
     */
    function getCurrentUser() {
        if (!isset($_SESSION['user_id'])) {
            return null;
        }

        try {
            require_once dirname(__DIR__) . '/Core/Database.php';
            $db = \Database::getInstance()->getConnection();
            
            if (!$db) {
                return null;
            }

            $stmt = $db->prepare("SELECT id, name, email, username, user_type FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();
            
            return $user ?: null;
        } catch (Exception $e) {
            error_log("Error getting current user: " . $e->getMessage());
            return null;
        }
    }
}

if (!function_exists('getCurrentUserName')) {
    /**
     * Get current logged-in user's display name
     */
    function getCurrentUserName() {
        $user = getCurrentUser();
        return $user ? $user['name'] : 'Unknown User';
    }
}

if (!function_exists('getCurrentUsername')) {
    /**
     * Get current logged-in user's username
     */
    function getCurrentUsername() {
        $user = getCurrentUser();
        return $user ? $user['username'] : 'unknown';
    }
}
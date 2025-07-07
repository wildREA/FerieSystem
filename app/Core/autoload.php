<?php
/**
 * Autoloader for the application
 * Loads necessary classes and helper functions
 * 
 * Note: Database initialization happens on every request for development purposes.
 * This ensures tables are created and test data is available without manual setup.
 * In production, this should be moved to a separate setup/migration process.
 */

// Load environment variables if not already loaded
if (!class_exists('Dotenv\Dotenv')) {
    require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
}

// Load .env file if it exists
if (file_exists(dirname(__DIR__, 2) . '/.env')) {
    $dotenv = \Dotenv\Dotenv::createImmutable(dirname(__DIR__, 2));
    $dotenv->load();
}

// Load core files
require_once __DIR__ . '/sessions.php';
require_once __DIR__ . '/../Helpers/UrlHelper.php';

// Initialize global SessionManager
if (!isset($GLOBALS['sessionManager'])) {
    $GLOBALS['sessionManager'] = new SessionManager();
}

// Define BASE_PATH if not already defined
if (!defined('BASE_PATH')) {
    define('BASE_PATH', dirname(__DIR__, 2));
}

// Load language helper
require_once BASE_PATH . '/app/Helpers/LanguageHelper.php';

// Initialize database (for development - ensures tables exist and test data is available)
// Note: In production, this should be moved to a proper migration/setup system
// Skip database initialization for API requests to avoid output interference
$isApiRequest = isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], '/api/') !== false;
if (!$isApiRequest) {
    try {
        require_once dirname(__DIR__, 2) . '/database/init.php';
    } catch (Exception $e) {
        // Log the error but don't stop execution
        error_log("Database initialization failed: " . $e->getMessage());
    }
}
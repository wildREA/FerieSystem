<?php
// Enable full error reporting for development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Use a static variable to ensure we only create one connection
static $pdo = null;

// Return existing connection if already established
if ($pdo !== null) {
    error_log("Database connection: Returning existing connection");
    return $pdo;
}

// Determine the correct path to the project root
$projectRoot = dirname(__DIR__, 2);
$envFile = $projectRoot . '/.env';

// Ensure environment variables are loaded
if (empty($_ENV['DB_DATABASE']) || !isset($_ENV['DB_DATABASE'])) {
    // Load Composer autoloader if not already loaded
    if (!class_exists('Dotenv\Dotenv')) {
        $autoloadPath = $projectRoot . '/vendor/autoload.php';
        if (file_exists($autoloadPath)) {
            require_once $autoloadPath;
        } else {
            error_log("Composer autoload not found at: " . $autoloadPath);
            throw new Exception("Composer autoload not found");
        }
    }
    
    // Load environment variables if not already loaded
    if (file_exists($envFile)) {
        try {
            $dotenv = \Dotenv\Dotenv::createImmutable($projectRoot);
            $dotenv->load();
            error_log("Environment file loaded from: " . $envFile);
        } catch (Exception $e) {
            error_log("Failed to load .env file: " . $e->getMessage());
            throw new Exception("Failed to load .env file: " . $e->getMessage());
        }
    } else {
        error_log("Environment file not found at: " . $envFile);
        throw new Exception("Environment file not found at: " . $envFile);
    }
}

// Database connection parameters with fallbacks
$host = $_ENV['DB_HOST'] ?? 'localhost';
$database = $_ENV['DB_DATABASE'] ?? '';
$username = $_ENV['DB_USERNAME'] ?? '';
$password = $_ENV['DB_PASSWORD'] ?? '';

// Log environment variables for debugging (without sensitive data)
error_log("Database connection attempt from: " . __FILE__);
error_log("Project root: " . $projectRoot);
error_log("DB_HOST: " . $host);
error_log("DB_DATABASE: " . $database);
error_log("DB_USERNAME: " . $username);
error_log("DB_PASSWORD: " . (empty($password) ? 'empty' : 'set (' . strlen($password) . ' chars)'));

// Check if required environment variables are set
if (empty($database) || empty($username)) {
    $error = "Missing required database environment variables - DB_DATABASE: '$database', DB_USERNAME: '$username'";
    error_log($error);
    throw new Exception($error);
}

// Create database connection
$dsn = "mysql:host=$host;dbname=$database;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    error_log("Database connection successful - created new PDO instance");
    return $pdo;
} catch (PDOException $e) {
    // Log detailed error for debugging
    error_log("Database connection failed: " . $e->getMessage());
    error_log("DSN: " . $dsn);
    error_log("Username: " . $username);
    
    // Throw the exception instead of returning null
    throw new Exception("Database connection failed: " . $e->getMessage());
}
?>
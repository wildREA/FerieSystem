<?php
// Enable full error reporting for development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Load Composer autoloader
require_once __DIR__ . '/../../vendor/autoload.php';

// Load environment variables from project root .env file
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

// Database connection parameters
$host = $_ENV['DB_HOST'];
$database = $_ENV['DB_DATABASE'];
$username = $_ENV['DB_USERNAME'];
$password = $_ENV['DB_PASSWORD'];

// Create database connection
$dsn = "mysql:host=$host;dbname=$database;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    return $pdo;
} catch (PDOException $e) {
    // Log error for debugging but don't expose details in production
    error_log("Database connection failed: " . $e->getMessage());
    die("Database connection failed. Please try again later.");
}
?>
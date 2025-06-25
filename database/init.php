<?php
/**
 * Database Initialization Script
 * 
 * Executes all SQL files in the database directory.
 */

try {
    // Get database connection
    $pdo = require __DIR__ . '/../app/Core/connection.php';
    
    if (!$pdo) {
        throw new Exception("Failed to establish database connection");
    }
    
    // Get all SQL files
    $sqlFiles = glob(__DIR__ . '/*.sql');
    
    if (empty($sqlFiles)) {
        throw new Exception("No SQL files found");
    }
    
    // Sort SQL files to ensure proper execution order
    sort($sqlFiles);
    
    // Execute each SQL file
    foreach ($sqlFiles as $sqlFile) {
        $sql = file_get_contents($sqlFile);
        
        if (!empty(trim($sql))) {
            try {
                $pdo->exec($sql);
            } catch (PDOException $e) {
                // Ignore "table already exists" errors
                if (strpos($e->getMessage(), 'already exists') === false) {
                    throw $e;
                }
            }
        }
    }
    
    // Return the PDO connection for use by the application
    return $pdo;
    
} catch (Exception $e) {
    error_log("Database initialization failed: " . $e->getMessage());
    // Don't die in production, just log the error
    return null;
}

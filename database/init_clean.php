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
    
} catch (Exception $e) {
    die("Database initialization failed: " . $e->getMessage() . "\n");
}

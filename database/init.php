<?php
/**
 * Database Initialization Script
 * 
 * This script automatically discovers and executes all SQL files in the database directory
 * to initialize the database tables needed for the system.
 */

require_once __DIR__ . '/../app/Core/connection.php';
$db = require __DIR__ . '/../app/Core/connection.php';

// Add safety check
if (!$db || !($db instanceof PDO)) {
    return; // Exit silently if database connection fails
}

try {
    // Get all SQL files in the database directory
    $databaseDir = __DIR__;
    $sqlFiles = glob($databaseDir . '/*.sql');
    
    if (empty($sqlFiles)) {
        return; // No SQL files found, nothing to do
    }
    
    // Sort files to ensure consistent execution order
    sort($sqlFiles);
    
    // Execute each SQL file
    foreach ($sqlFiles as $sqlFile) {
        $filename = basename($sqlFile);
        
        // Read the SQL file content
        $sql = file_get_contents($sqlFile);
        
        if ($sql === false) {
            continue; // Skip if can't read file
        }
        
        // Split SQL content by semicolon to handle multiple statements
        $statements = array_filter(
            array_map('trim', explode(';', $sql)),
            function($stmt) {
                return !empty($stmt) && !preg_match('/^\s*--/', $stmt);
            }
        );
        
        // Execute each statement
        foreach ($statements as $statement) {
            if (!empty(trim($statement))) {
                try {
                    $db->exec($statement);
                } catch (PDOException $e) {
                    // Silently continue on error for now
                    continue;
                }
            }
        }
    }
    
} catch (Exception $e) {
    // Silently handle any errors for now
}

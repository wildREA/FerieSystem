<?php
/**
 * Database Initialization Script
 * 
 * This script initializes the database tables needed for the authentication system
 * Run this script once to create the necessary tables
 */

require_once __DIR__ . '/../app/Core/connection.php';
$db = require_once __DIR__ . '/../app/Core/connection.php';

// Load SQL file
$sqlFile = file_get_contents(__DIR__ . '/auth_tables.sql');

// Execute the SQL
try {
    $result = $db->exec($sqlFile);
    echo "Database tables created successfully!\n";
} catch (PDOException $e) {
    echo "Error creating database tables: " . $e->getMessage() . "\n";
    
    // If error is because of multiple statements, try executing them separately
    $statements = explode(';', $sqlFile);
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        
        if (!empty($statement)) {
            try {
                $db->exec($statement . ';');
                echo "Executed statement successfully.\n";
            } catch (PDOException $e) {
                echo "Error executing statement: " . $e->getMessage() . "\n";
                echo "Statement: " . $statement . "\n";
            }
        }
    }
}

echo "Initialization complete.\n";

<?php

$sqlFiles = [
    'users.sql',
    'remember_tokens.sql',
    'requests.sql',
    'reg_keys.sql',
    'ff_balance.sql',
    'transactions.sql',
];

try {
    $pdo = require __DIR__ . '/../app/Core/connection.php';
    
    if (!$pdo) {
        throw new Exception("Failed to establish database connection");
    }
        
    foreach ($sqlFiles as $fileName) {
        $filePath = __DIR__ . '/' . $fileName;
        
        if (!file_exists($filePath)) {
            continue;
        }
                
        $sql = file_get_contents($filePath);
        
        if (!empty(trim($sql))) {
            try {
                $pdo->exec($sql);
            } catch (PDOException $e) {
                echo "✗ Error in $fileName: " . $e->getMessage() . "\n";
            }
        } else {
            echo "Warning: $fileName is empty, skipping...\n";
        }
    }    
} catch (Exception $e) {
    echo "Database initialization failed: " . $e->getMessage() . "\n";
}

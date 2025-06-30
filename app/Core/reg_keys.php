<?php
// THis file contains the registration key management logic.
// It handles the generation, storage, and retrieval of the registration key.

namespace App\Core;
use App\Controllers\AuthController;
use Exception;

// Ensure the database connection is established
require_once __DIR__ . '/connection.php';
// Ensure the Database class is included
require_once __DIR__ . '/Database.php';
// Ensure the AuthController is included for user authentication
require_once __DIR__ . '/../Controllers/AuthController.php';

class RegKeys {
    private $db;
    private $authController;

    public function __construct() {
        $this->db = \Database::getInstance()->getConnection();
        $this->authController = new AuthController();
    }

    public function generateKey() {
        // Delete all existing keys before generating a new one
        $this->deleteAllKeys();
        
        // Generate a random key and convert to uppercase
        $key = strtoupper(bin2hex(random_bytes(4))); // 8 characters long, uppercase
            
        // Store the key in the database
        $stmt = $this->db->prepare("INSERT INTO reg_keys (key_value) VALUES (:key)");
        $stmt->bindParam(':key', $key);
        if ($stmt->execute()) {
            return $key;
        } else {
            throw new Exception("Failed to generate registration key.");
        }
    }

    public function getKey() {
        // Clean up expired keys before retrieving
        $this->cleanupExpiredKeys();
        
        // Retrieve the latest key from the database
        $stmt = $this->db->query("SELECT key_value FROM reg_keys ORDER BY created_at DESC LIMIT 1");
        return $stmt->fetchColumn();
    }

    /**
     * Delete all existing registration keys from the database
     * Used when generating a new key to ensure only one key exists
     */
    private function deleteAllKeys() {
        try {
            $stmt = $this->db->prepare("DELETE FROM reg_keys");
            $stmt->execute();
        } catch (Exception $e) {
            error_log("Failed to delete all keys: " . $e->getMessage());
            // Don't throw - we'll still try to generate the new key
        }
    }

    /**
     * Clean up expired registration keys
     * Removes keys older than 30 seconds, but always keeps the latest key
     */
    private function cleanupExpiredKeys() {
        try {
            // Delete keys that are older than 30 seconds, but keep the most recent one
            $sql = "DELETE FROM reg_keys 
                    WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 SECOND) 
                    AND id NOT IN (
                        SELECT * FROM (
                            SELECT id FROM reg_keys ORDER BY created_at DESC LIMIT 1
                        ) AS latest_key
                    )";
            $this->db->exec($sql);
        } catch (Exception $e) {
            // Log error but don't throw - cleanup failure shouldn't break key operations
            error_log("Failed to cleanup expired keys: " . $e->getMessage());
        }
    }
}
?>
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
        // Generate a random key
        $key = bin2hex(random_bytes(4)); // 8 characters long
        
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
        // Retrieve the latest key from the database
        $stmt = $this->db->query("SELECT key_value FROM reg_keys ORDER BY created_at DESC LIMIT 1");
        return $stmt->fetchColumn();
    }
}
?>
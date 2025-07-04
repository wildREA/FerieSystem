<?php
/**
 * Registration Keys API Controller
 * 
 * This file provides API wrapper methods for the RegKeys class that:
 * - Handle authentication and authorization
 * - Return proper JSON responses
 * - Set appropriate HTTP headers and status codes
 * 
 * Purpose: Separate API logic from core RegKeys functionality while
 * maintaining clean separation of concerns.
 */

namespace App\Controllers;

require_once __DIR__ . '/../Core/reg_keys.php';
require_once __DIR__ . '/../Core/sessions.php';

class RegKeysController {
    private $regKeys;
    private $sessionManager;

    public function __construct() {
        $this->regKeys = new \App\Core\RegKeys();
        // SessionManager is in the global namespace
        $this->sessionManager = new \SessionManager();
    }

    /**
     * API method to get registration key with authentication and JSON response
     */
    public function getKeyAPI() {
        // Set JSON header
        header('Content-Type: application/json');
        
        try {
            // Check authentication
            if (!$this->sessionManager->isAuthenticated()) {
                http_response_code(401);
                echo json_encode(['success' => false, 'error' => 'Not authenticated']);
                exit;
            }
            
            // Check user type
            $userType = $this->sessionManager->getUserType();
            if ($userType !== 'super') {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'Insufficient permissions']);
                exit;
            }
            
            // Get the key
            $key = $this->regKeys->getKey();
            
            // Return JSON response
            echo json_encode(['success' => true, 'key' => $key]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        exit;
    }

    /**
     * API method to generate registration key with authentication and JSON response
     */
    public function generateKeyAPI() {
        // Set JSON header
        header('Content-Type: application/json');
        
        try {
            // Check authentication
            if (!$this->sessionManager->isAuthenticated()) {
                http_response_code(401);
                echo json_encode(['success' => false, 'error' => 'Not authenticated']);
                exit;
            }
            
            // Check user type
            $userType = $this->sessionManager->getUserType();
            if ($userType !== 'super') {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'Insufficient permissions']);
                exit;
            }
            
            // Generate the new key (this will automatically delete all old keys)
            $key = $this->regKeys->generateKey();
            
            // Return JSON response
            echo json_encode(['success' => true, 'key' => $key]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        exit;
    }
}
?>

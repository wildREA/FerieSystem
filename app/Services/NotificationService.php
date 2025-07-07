<?php
namespace App\Services;

require_once dirname(__DIR__) . '/Core/sessions.php';
require_once dirname(__DIR__) . '/Core/connection.php';

class NotificationService {
    private $sessionManager;
    private $db;
    
    public function __construct() {
        $this->sessionManager = new \SessionManager();
        
        try {
            $this->db = require dirname(__DIR__) . '/Core/connection.php';
        } catch (\Exception $e) {
            error_log("Database connection failed in NotificationService: " . $e->getMessage());
            $this->db = null;
        }
    }

    /**
     * Get notification counts for standard user
     */
    public function getStandardUserNotifications($userId) {
        try {
            if (!$this->db) {
                return ['pendingRequests' => 0];
            }

            if (!$userId) {
                return ['pendingRequests' => 0];
            }

            // Count pending requests for the user
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as pending_count 
                FROM requests 
                WHERE user_id = ? AND status = 'pending'
            ");
            $stmt->execute([$userId]);
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            $count = (int)($result['pending_count'] ?? 0);
            
            return [
                'pendingRequests' => $count
            ];
        } catch (\Exception $e) {
            error_log("Error getting standard user notifications for user $userId: " . $e->getMessage());
            return ['pendingRequests' => 0];
        }
    }

    /**
     * Get notification counts for superuser
     */
    public function getSuperuserNotifications() {
        try {
            if (!$this->db) {
                return ['pendingRequests' => 0];
            }

            // Count all pending requests in the system
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as pending_count 
                FROM requests 
                WHERE status = 'pending'
            ");
            $stmt->execute();
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            return [
                'pendingRequests' => (int)($result['pending_count'] ?? 0)
            ];
        } catch (\Exception $e) {
            error_log("Error getting superuser notifications: " . $e->getMessage());
            return ['pendingRequests' => 0];
        }
    }

    /**
     * Get notification counts based on user type
     */
    public function getNotificationCounts() {
        try {
            if (!$this->sessionManager->isAuthenticated()) {
                return ['pendingRequests' => 0];
            }

            $userType = $this->sessionManager->getUserType();
            
            if ($userType === 'super') {
                return $this->getSuperuserNotifications();
            } elseif ($userType === 'standard') {
                $userId = $this->sessionManager->getUserId();
                if (!$userId) {
                    return ['pendingRequests' => 0];
                }
                return $this->getStandardUserNotifications($userId);
            } else {
                return ['pendingRequests' => 0];
            }
        } catch (\Exception $e) {
            error_log("Error getting notification counts: " . $e->getMessage());
            return ['pendingRequests' => 0];
        }
    }

    /**
     * API endpoint to get notification counts
     */
    public function getNotificationCountsAPI() {
        // Set headers first to ensure clean JSON response
        header('Content-Type: application/json; charset=UTF-8');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        try {
            if (!$this->sessionManager->isAuthenticated()) {
                http_response_code(401);
                $response = ['error' => __('user_not_authenticated'), 'success' => false];
                echo json_encode($response);
                return;
            }

            $counts = $this->getNotificationCounts();
            
            // Log for debugging
            error_log("NotificationService API: User authenticated, returning counts: " . json_encode($counts));
            
            $response = ['success' => true, 'notifications' => $counts];
            $json = json_encode($response);
            
            if ($json === false) {
                throw new \Exception('Failed to encode JSON response');
            }
            
            echo $json;
            
        } catch (\Exception $e) {
            error_log("Error in getNotificationCountsAPI: " . $e->getMessage());
            
            http_response_code(500);
            $response = ['error' => __('internal_server_error'), 'success' => false];
            echo json_encode($response);
        }
    }
}

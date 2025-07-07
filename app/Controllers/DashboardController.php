<?php
namespace App\Controllers;

require_once dirname(__D        } catch (Exception $e) {
            error_log("Error in getDashboardData: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => __('internal_server_error')]);
        } . '/Core/sessions.php';
require_once dirname(__DIR__) . '/Core/connection.php';

class DashboardController {
    private $sessionManager;
    private $db;
    
    public function __construct() {
        $this->sessionManager = new \SessionManager();
        
        try {
            $this->db = require dirname(__DIR__) . '/Core/connection.php';
        } catch (\Exception $e) {
            error_log("Database connection failed in DashboardController: " . $e->getMessage());
            $this->db = null;
        }
    }

    public function getDashboardData() {
        // Clear any potential output buffer to ensure clean JSON response
        if (ob_get_level()) {
            ob_clean();
        }
        
        header('Content-Type: application/json');
        
        try {
            if (!$this->sessionManager->isAuthenticated()) {
                http_response_code(401);
                echo json_encode(['error' => __('user_not_authenticated')]);
                return;
            }
            
            $userType = $this->sessionManager->getUserType();
            if ($userType !== 'standard') {
                http_response_code(403);
                echo json_encode(['error' => __('only_students_access_dashboard')]);
                return;
            }
            
            $userId = $this->sessionManager->getUserId();
            
            // Get user's balance and transaction data
            $balanceData = $this->getBalanceData($userId);
            $recentRequests = $this->getRecentRequests($userId);
            $transactionHistory = $this->getTransactionHistory($userId);
            
            $response = [
                'balance' => $balanceData,
                'recentRequests' => $recentRequests,
                'transactionHistory' => $transactionHistory
            ];
            
            echo json_encode($response);
            
        } catch (\Exception $e) {
            error_log("Error in getDashboardData: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => __('internal_server_error')]);
        }
    }
    
    public function getBalanceData($userId) {
        try {
            // Calculate balance from transactions table
            $stmt = $this->db->prepare("
                SELECT 
                    SUM(CASE WHEN type = 'allocation' THEN amount ELSE 0 END) as total_allocated,
                    SUM(CASE WHEN type = 'deduction' THEN amount ELSE 0 END) as total_used,
                    SUM(amount) as current_balance
                FROM transactions 
                WHERE user_id = ?
            ");
            $stmt->execute([$userId]);
            $balance = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            // Get pending hours from requests
            $stmt = $this->db->prepare("
                SELECT SUM(total_hours) as pending_hours 
                FROM requests 
                WHERE user_id = ? AND status = 'pending'
            ");
            $stmt->execute([$userId]);
            $pending = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            return [
                'totalAllocated' => (float)($balance['total_allocated'] ?? 0),
                'totalUsed' => (float)($balance['total_used'] ?? 0),
                'currentBalance' => (float)($balance['current_balance'] ?? 0),
                'pendingHours' => (float)($pending['pending_hours'] ?? 0)
            ];
        } catch (\Exception $e) {
            error_log("Error in getBalanceData for user $userId: " . $e->getMessage());
            // Return default data if database query fails
            return [
                'totalAllocated' => 0,
                'totalUsed' => 0,
                'currentBalance' => 0,
                'pendingHours' => 0
            ];
        }
    }
    
    public function getRecentRequests($userId) {
        $stmt = $this->db->prepare("
            SELECT id, start_datetime, end_datetime, reason, status, 
                   created_at, total_hours
            FROM requests 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 3
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    public function getTransactionHistory($userId) {
        $stmt = $this->db->prepare("
            SELECT date, description, amount 
            FROM transactions 
            WHERE user_id = ? 
            ORDER BY created_at DESC, date DESC 
            LIMIT 10
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    public function getBalanceAPI() {
        // Clear any potential output buffer to ensure clean JSON response
        if (ob_get_level()) {
            ob_clean();
        }
        
        header('Content-Type: application/json');
        
        try {
            // Check if database connection is available
            if ($this->db === null) {
                error_log("Database connection not available in getBalanceAPI");
                http_response_code(500);
                echo json_encode(['error' => __('database_connection_failed')]);
                return;
            }
            
            if (!$this->sessionManager->isAuthenticated()) {
                error_log("User not authenticated in getBalanceAPI");
                http_response_code(401);
                echo json_encode(['error' => __('user_not_authenticated')]);
                return;
            }
            
            $userType = $this->sessionManager->getUserType();
            if ($userType !== 'standard') {
                error_log("Non-standard user trying to access balance API: " . $userType);
                http_response_code(403);
                echo json_encode(['error' => __('only_students_access_balance')]);
                return;
            }
            
            $userId = $this->sessionManager->getUserId();
            if (!$userId) {
                error_log("No user ID available in getBalanceAPI");
                http_response_code(400);
                echo json_encode(['error' => __('user_id_not_available')]);
                return;
            }
            
            $balanceData = $this->getBalanceData($userId);
            
            echo json_encode([
                'success' => true,
                'balance' => $balanceData
            ]);
            
        } catch (\Exception $e) {
            error_log("Error in getBalanceAPI: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode(['error' => __('internal_server_error')]);
        }
    }
}

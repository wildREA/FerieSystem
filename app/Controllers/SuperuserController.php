<?php
namespace App\Controllers;

require_once dirname(__DIR__) . '/Core/sessions.php';
require_once dirname(__DIR__) . '/Core/connection.php';

class SuperuserController {
    private $sessionManager;
    private $db;
    
    public function __construct() {
        $this->sessionManager = new \SessionManager();
        
        try {
            $this->db = require dirname(__DIR__) . '/Core/connection.php';
        } catch (\Exception $e) {
            error_log("Database connection failed in SuperuserController: " . $e->getMessage());
            $this->db = null;
        }
    }

    /**
     * Get all requests for superuser view, separated by status
     */
    public function getAllRequestsData() {
        try {
            if (!$this->sessionManager->isAuthenticated()) {
                throw new \Exception('User not authenticated');
            }
            
            $userType = $this->sessionManager->getUserType();
            if ($userType !== 'super') {
                throw new \Exception('Only superusers can access this data');
            }
            
            // Get all requests with user information
            $stmt = $this->db->prepare("
                SELECT 
                    r.id,
                    r.user_id,
                    r.start_datetime,
                    r.end_datetime,
                    r.reason,
                    r.status,
                    r.created_at,
                    r.total_hours,
                    u.username,
                    u.email
                FROM requests r
                JOIN users u ON r.user_id = u.id
                ORDER BY r.created_at DESC
            ");
            $stmt->execute();
            $requests = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            // Process requests and add calculated fields
            $processedRequests = [];
            foreach ($requests as $request) {
                $startDate = new \DateTime($request['start_datetime']);
                $endDate = new \DateTime($request['end_datetime']);
                $today = new \DateTime();
                
                // Generate avatar initials
                $username = $request['username'] ?? '';
                if (empty($username)) {
                    $avatar = 'U'; // Default avatar for unknown user
                } else {
                    $nameParts = explode(' ', $username);
                    $avatar = '';
                    foreach ($nameParts as $part) {
                        if (!empty($part)) {
                            $avatar .= strtoupper($part[0]);
                        }
                    }
                    if (strlen($avatar) > 2) {
                        $avatar = substr($avatar, 0, 2);
                    }
                    if (empty($avatar)) {
                        $avatar = strtoupper($username[0]); // Use first character if no spaces
                    }
                }
                
                // Calculate request days (convert hours to days)
                $requestDays = ceil($request['total_hours'] / 8);
                
                // Calculate days since request
                $createdDate = new \DateTime($request['created_at']);
                $daysSinceRequest = $today->diff($createdDate)->days;
                
                $processedRequests[] = [
                    'id' => $request['user_id'], // Using user_id as the identifier
                    'request_id' => $request['id'],
                    'name' => $request['username'] ?? 'Unknown User',
                    'email' => $request['email'] ?? '',
                    'course' => 'N/A', // You might want to add this to users table
                    'year' => 'N/A', // You might want to add this to users table
                    'status' => $request['status'] ?? 'pending',
                    'vacationDays' => 25, // Default - you might want to calculate this
                    'requestDate' => $startDate->format('Y-m-d'),
                    'requestEndDate' => $endDate->format('Y-m-d'),
                    'requestDays' => $requestDays,
                    'requestReason' => $request['reason'] ?? 'No reason provided',
                    'avatar' => $avatar,
                    'daysSinceRequest' => $daysSinceRequest,
                    'total_hours' => $request['total_hours'] ?? 0
                ];
            }
            
            return $processedRequests;
            
        } catch (\Exception $e) {
            error_log("Error in getAllRequestsData: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get pending requests only
     */
    public function getPendingRequests() {
        $allRequests = $this->getAllRequestsData();
        return array_filter($allRequests, function($request) {
            return $request['status'] === 'pending';
        });
    }
    
    /**
     * Get approved requests separated by active/completed
     */
    public function getApprovedRequests() {
        $allRequests = $this->getAllRequestsData();
        $approvedRequests = array_filter($allRequests, function($request) {
            return $request['status'] === 'approved';
        });
        
        $today = new \DateTime();
        $active = [];
        $completed = [];
        
        foreach ($approvedRequests as $request) {
            $endDate = new \DateTime($request['requestEndDate']);
            
            if ($endDate >= $today) {
                $active[] = $request;
            } else {
                $completed[] = $request;
            }
        }
        
        return [
            'active' => $active,
            'completed' => $completed
        ];
    }
    
    /**
     * Approve a request
     */
    public function approveRequest($requestId) {
        try {
            if (!$this->sessionManager->isAuthenticated() || $this->sessionManager->getUserType() !== 'super') {
                throw new \Exception('Unauthorized');
            }
            
            // Start transaction
            $this->db->beginTransaction();
            
            // Update request status
            $stmt = $this->db->prepare("UPDATE requests SET status = 'approved' WHERE id = ?");
            $result = $stmt->execute([$requestId]);
            
            if (!$result) {
                $this->db->rollback();
                throw new \Exception('Failed to approve request');
            }
            
            // Confirm the pending transaction
            $transactionResult = $this->confirmPendingTransaction($requestId);
            
            if (!$transactionResult) {
                $this->db->rollback();
                throw new \Exception('Failed to confirm transaction');
            }
            
            $this->db->commit();
            return ['success' => true, 'message' => 'Request approved successfully'];
            
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollback();
            }
            error_log("Error approving request: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error approving request'];
        }
    }
    
    /**
     * Deny a request
     */
    public function denyRequest($requestId) {
        try {
            if (!$this->sessionManager->isAuthenticated() || $this->sessionManager->getUserType() !== 'super') {
                throw new \Exception('Unauthorized access');
            }
            
            if (!$this->db) {
                throw new \Exception('Database connection not available');
            }
            
            // First check if the request exists
            $checkStmt = $this->db->prepare("SELECT id, status FROM requests WHERE id = ?");
            $checkStmt->execute([$requestId]);
            $request = $checkStmt->fetch(\PDO::FETCH_ASSOC);
            
            if (!$request) {
                throw new \Exception('Request not found');
            }
            
            if ($request['status'] !== 'pending') {
                throw new \Exception('Only pending requests can be denied');
            }
            
            // Start transaction
            $this->db->beginTransaction();
            
            // Update the request status
            $stmt = $this->db->prepare("UPDATE requests SET status = 'denied' WHERE id = ?");
            $result = $stmt->execute([$requestId]);
            
            if (!$result || $stmt->rowCount() === 0) {
                $this->db->rollback();
                throw new \Exception('Failed to update request status');
            }
            
            // Cancel the pending transaction
            $transactionResult = $this->cancelPendingTransaction($requestId);
            
            if (!$transactionResult) {
                $this->db->rollback();
                throw new \Exception('Failed to cancel transaction');
            }
            
            $this->db->commit();
            return ['success' => true, 'message' => 'Request denied successfully'];
            
        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollback();
            }
            error_log("Error denying request ID $requestId: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    /**
     * API endpoint for approving requests
     */
    public function approveRequestAPI() {
        header('Content-Type: application/json');
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $requestId = $input['request_id'] ?? null;
            
            if (!$requestId) {
                http_response_code(400);
                echo json_encode(['error' => 'Request ID is required']);
                return;
            }
            
            $result = $this->approveRequest($requestId);
            
            if ($result['success']) {
                echo json_encode($result);
            } else {
                http_response_code(500);
                echo json_encode($result);
            }
            
        } catch (\Exception $e) {
            error_log("Error in approveRequestAPI: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }
    
    /**
     * API endpoint for denying requests
     */
    public function denyRequestAPI() {
        header('Content-Type: application/json');
        
        try {
            if (!$this->sessionManager->isAuthenticated() || $this->sessionManager->getUserType() !== 'super') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Only superusers can deny requests']);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $requestId = $input['request_id'] ?? null;
            
            if (!$requestId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Request ID is required']);
                return;
            }
            
            $result = $this->denyRequest($requestId);
            
            if ($result['success']) {
                echo json_encode($result);
            } else {
                http_response_code(500);
                echo json_encode($result);
            }
            
        } catch (\Exception $e) {
            error_log("Error in denyRequestAPI: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Internal server error']);
        }
    }
    
    /**
     * Get user balance data for superusers
     */
    public function getUserBalance($userId) {
        try {
            // Calculate current available balance from transactions table only
            // This excludes pending requests and only counts processed allocations/deductions
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
            
            return [
                'currentBalance' => (float)($balance['current_balance'] ?? 0)
            ];
            
        } catch (\Exception $e) {
            error_log("Error getting user balance: " . $e->getMessage());
            return [
                'currentBalance' => 0
            ];
        }
    }

    /**
     * API endpoint for getting user balance (for superusers)
     */
    public function getUserBalanceAPI() {
        header('Content-Type: application/json');
        
        try {
            if (!$this->sessionManager->isAuthenticated() || $this->sessionManager->getUserType() !== 'super') {
                http_response_code(403);
                echo json_encode(['error' => 'Only superusers can access this data']);
                return;
            }
            
            $userId = $_GET['user_id'] ?? null;
            
            if (!$userId) {
                http_response_code(400);
                echo json_encode(['error' => 'User ID is required']);
                return;
            }
            
            $balanceData = $this->getUserBalance($userId);
            
            echo json_encode([
                'success' => true,
                'balance' => $balanceData
            ]);
            
        } catch (\Exception $e) {
            error_log("Error in getUserBalanceAPI: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }
    
    /**
     * API endpoint for getting absolute user balance (excluding pending requests)
     */
    public function getUserAbsoluteBalanceAPI() {
        header('Content-Type: application/json');
        
        try {
            if (!$this->sessionManager->isAuthenticated() || $this->sessionManager->getUserType() !== 'super') {
                http_response_code(403);
                echo json_encode(['error' => 'Only superusers can access this data']);
                return;
            }
            
            $userId = $_GET['user_id'] ?? null;
            
            if (!$userId) {
                http_response_code(400);
                echo json_encode(['error' => 'User ID is required']);
                return;
            }
            
            $balanceData = $this->getUserAbsoluteBalance($userId);
            
            echo json_encode([
                'success' => true,
                'balance' => $balanceData
            ]);
            
        } catch (\Exception $e) {
            error_log("Error in getUserAbsoluteBalanceAPI: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        }
    }

    /**
     * Get absolute user balance (excluding pending requests)
     */
    public function getUserAbsoluteBalance($userId) {
        try {
            if (!$this->db) {
                throw new \Exception('Database connection not available');
            }
            
            // Calculate absolute balance from confirmed transactions only
            // This excludes pending transactions and only counts processed allocations/deductions
            $stmt = $this->db->prepare("
                SELECT 
                    SUM(amount) as current_balance
                FROM transactions 
                WHERE user_id = ? AND status = 'confirmed'
            ");
            $stmt->execute([$userId]);
            $balance = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            return [
                'currentBalance' => (float)($balance['current_balance'] ?? 0)
            ];
            
        } catch (\Exception $e) {
            error_log("Error getting absolute user balance: " . $e->getMessage());
            return [
                'currentBalance' => 0
            ];
        }
    }
    
    /**
     * Create a pending transaction when a request is submitted
     */
    public function createPendingTransaction($userId, $requestId, $hours, $description) {
        try {
            if (!$this->db) {
                throw new \Exception('Database connection not available');
            }
            
            // Create a pending deduction transaction for the vacation request
            $stmt = $this->db->prepare("
                INSERT INTO transactions (user_id, request_id, date, description, amount, type, status)
                VALUES (?, ?, CURDATE(), ?, ?, 'deduction', 'pending')
            ");
            
            $result = $stmt->execute([
                $userId,
                $requestId,
                $description,
                -abs($hours) // Negative amount for deduction
            ]);
            
            if (!$result) {
                throw new \Exception('Failed to create pending transaction');
            }
            
            return true;
            
        } catch (\Exception $e) {
            error_log("Error creating pending transaction: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Confirm a pending transaction when request is approved
     */
    public function confirmPendingTransaction($requestId) {
        try {
            if (!$this->db) {
                throw new \Exception('Database connection not available');
            }
            
            $stmt = $this->db->prepare("
                UPDATE transactions 
                SET status = 'confirmed' 
                WHERE request_id = ? AND status = 'pending'
            ");
            
            $result = $stmt->execute([$requestId]);
            
            if (!$result) {
                throw new \Exception('Failed to confirm pending transaction');
            }
            
            return true;
            
        } catch (\Exception $e) {
            error_log("Error confirming pending transaction: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Cancel a pending transaction when request is denied
     */
    public function cancelPendingTransaction($requestId) {
        try {
            if (!$this->db) {
                throw new \Exception('Database connection not available');
            }
            
            $stmt = $this->db->prepare("
                DELETE FROM transactions 
                WHERE request_id = ? AND status = 'pending'
            ");
            
            $result = $stmt->execute([$requestId]);
            
            if (!$result) {
                throw new \Exception('Failed to cancel pending transaction');
            }
            
            return true;
            
        } catch (\Exception $e) {
            error_log("Error canceling pending transaction: " . $e->getMessage());
            return false;
        }
    }
}

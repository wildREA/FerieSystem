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
            
            $stmt = $this->db->prepare("UPDATE requests SET status = 'approved' WHERE id = ?");
            $result = $stmt->execute([$requestId]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Request approved successfully'];
            } else {
                throw new \Exception('Failed to approve request');
            }
            
        } catch (\Exception $e) {
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
                throw new \Exception('Unauthorized');
            }
            
            $stmt = $this->db->prepare("UPDATE requests SET status = 'rejected' WHERE id = ?");
            $result = $stmt->execute([$requestId]);
            
            if ($result) {
                return ['success' => true, 'message' => 'Request denied successfully'];
            } else {
                throw new \Exception('Failed to deny request');
            }
            
        } catch (\Exception $e) {
            error_log("Error denying request: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error denying request'];
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
            $input = json_decode(file_get_contents('php://input'), true);
            $requestId = $input['request_id'] ?? null;
            
            if (!$requestId) {
                http_response_code(400);
                echo json_encode(['error' => 'Request ID is required']);
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
            echo json_encode(['error' => 'Internal server error']);
        }
    }
}

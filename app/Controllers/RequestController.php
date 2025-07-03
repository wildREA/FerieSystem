<?php
namespace App\Controllers;

require_once dirname(__DIR__) . '/Core/sessions.php';
require_once dirname(__DIR__) . '/Core/connection.php';

class RequestController {
    private $sessionManager;
    private $db;
    
    public function __construct() {
        $this->sessionManager = new \SessionManager();
        
        try {
            $this->db = require dirname(__DIR__) . '/Core/connection.php';
        } catch (\Exception $e) {
            error_log("Database connection failed in RequestController: " . $e->getMessage());
            $this->db = null;
        }
    }

    /**
     * Get user requests for the requests view
     */
    public function getUserRequestsForView() {
        try {
            if (!$this->sessionManager->isAuthenticated()) {
                throw new \Exception('User not authenticated');
            }
            
            $userId = $this->sessionManager->getUserId();
            
            // Get all requests for the current user
            $stmt = $this->db->prepare("
                SELECT 
                    id,
                    start_datetime,
                    end_datetime,
                    reason,
                    status,
                    created_at,
                    total_hours
                FROM requests 
                WHERE user_id = ?
                ORDER BY created_at DESC
            ");
            $stmt->execute([$userId]);
            $requests = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            // Process requests and add calculated fields
            $processedRequests = [];
            foreach ($requests as $request) {
                $startDate = new \DateTime($request['start_datetime']);
                $endDate = new \DateTime($request['end_datetime']);
                $createdDate = new \DateTime($request['created_at']);
                
                // Calculate request days (convert hours to days)
                $requestDays = ceil($request['total_hours'] / 8);
                
                // Calculate cost (assuming 8 vacation hours per day)
                $ffCost = $request['total_hours'];
                
                // Calculate time period
                $interval = $startDate->diff($endDate);
                $calendarDays = $interval->days + 1; // +1 to include both start and end date
                
                $processedRequests[] = [
                    'requestId' => $request['id'],
                    'studentName' => $this->sessionManager->getUser()['username'] ?? 'Student',
                    'status' => ucfirst($request['status']),
                    'reason' => $request['reason'] ?? 'No reason provided',
                    'startDate' => $startDate->format('M j, Y'),
                    'endDate' => $endDate->format('M j, Y'),
                    'days' => $requestDays,
                    'ffCost' => $ffCost,
                    'timePeriod' => $calendarDays . ' calendar days',
                    'requestSubmitted' => $createdDate->format('M j, Y \a\t h:i A'),
                    'rawStartDate' => $request['start_datetime'],
                    'rawEndDate' => $request['end_datetime'],
                    'totalHours' => $request['total_hours']
                ];
            }
            
            return $processedRequests;
            
        } catch (\Exception $e) {
            error_log("Error in getUserRequestsForView: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Submit a new vacation request
     */
    public function submitRequest() {
        // Clear any potential output buffer to ensure clean JSON response
        if (ob_get_level()) {
            ob_clean();
        }
        
        header('Content-Type: application/json');
        
        try {
            if (!$this->sessionManager->isAuthenticated()) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'User not authenticated']);
                return;
            }
            
            // Get input data
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid input data']);
                return;
            }
            
            $startDate = $input['startDateTime'] ?? null;
            $endDate = $input['endDateTime'] ?? null;
            $reason = $input['reason'] ?? '';
            $totalHours = isset($input['hours']) ? floatval($input['hours']) : 0;
            
            if (!$startDate || !$endDate || $totalHours <= 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Missing required fields']);
                return;
            }
            
            $userId = $this->sessionManager->getUserId();
            
            // Start transaction
            $this->db->beginTransaction();
            
            try {
                // Insert the request
                $stmt = $this->db->prepare("
                    INSERT INTO requests (user_id, start_datetime, end_datetime, reason, status, total_hours, created_at)
                    VALUES (?, ?, ?, ?, 'pending', ?, NOW())
                ");
                
                $result = $stmt->execute([
                    $userId,
                    $startDate,
                    $endDate,
                    $reason,
                    $totalHours
                ]);
                
                if (!$result) {
                    throw new \Exception('Failed to insert request');
                }
                
                $requestId = $this->db->lastInsertId();
                
                // Create a pending transaction for this request
                $transactionDescription = "Vacation request: " . ($reason ?: 'No reason provided');
                $transactionHours = -abs($totalHours);

                $transStmt = $this->db->prepare("
                    INSERT INTO transactions (user_id, request_id, date, description, amount, type, status)
                    VALUES (?, ?, CURDATE(), ?, ?, 'deduction', 'pending')
                ");

                $transactionResult = $transStmt->execute([
                    $userId,
                    $requestId,
                    $transactionDescription,
                    $transactionHours
                ]);
                
                if (!$transactionResult) {
                    throw new \Exception('Failed to create pending transaction');
                }
                
                $this->db->commit();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Request submitted successfully',
                    'requestId' => $requestId
                ]);
                
            } catch (\Exception $e) {
                $this->db->rollback();
                throw $e;
            }
            
        } catch (\Exception $e) {
            error_log("Error in submitRequest: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Internal server error']);
        }
    }
}

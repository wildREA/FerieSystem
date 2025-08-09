<?php
namespace App\Controllers;

require_once dirname(__DIR__) . '/Core/sessions.php';
require_once dirname(__DIR__) . '/Core/connection.php';
require_once dirname(__DIR__) . '/Services/EmailService.php';

class RequestController {
    private $sessionManager;
    private $db;
    private $emailService;
    
    public function __construct() {
        $this->sessionManager = new \SessionManager();
        
        try {
            $this->db = require dirname(__DIR__) . '/Core/connection.php';
        } catch (\Exception $e) {
            error_log("Database connection failed in RequestController: " . $e->getMessage());
            $this->db = null;
        }
        
        // Initialize EmailService
        $this->emailService = new \App\Services\EmailService();
    }

    /**
     * Get user requests for the requests view
     */
    public function getUserRequestsForView() {
        try {
            if (!$this->sessionManager->isAuthenticated()) {
                throw new \Exception(__('user_not_authenticated'));
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
                echo json_encode(['success' => false, 'message' => __('user_not_authenticated')]);
                return;
            }
            
            // Get input data
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => __('invalid_input_data')]);
                return;
            }
            
            $startDate = $input['startDateTime'] ?? null;
            $endDate = $input['endDateTime'] ?? null;
            $reason = $input['reason'] ?? '';
            $totalHours = isset($input['hours']) ? floatval($input['hours']) : 0;
            
            if (!$startDate || !$endDate || $totalHours <= 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => __('missing_required_fields')]);
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
                
                // Send email notification to instructor
                $emailResult = $this->sendRequestNotification($userId, $requestId, $startDate, $endDate, $reason, $totalHours);
                
                $response = [
                    'success' => true,
                    'message' => __('request_submitted_successfully'),
                    'requestId' => $requestId
                ];
                
                // Add email status to response for debugging
                if ($emailResult['success']) {
                    $response['email_status'] = 'Email sent successfully to instructor';
                } else {
                    $response['email_status'] = 'Request submitted but email failed: ' . $emailResult['error'];
                    $response['email_error'] = $emailResult['error'];
                }
                
                echo json_encode($response);
                
            } catch (\Exception $e) {
                $this->db->rollback();
                throw $e;
            }
            
        } catch (\Exception $e) {
            error_log("Error in submitRequest: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => __('internal_server_error')]);
        }
    }
    
    /**
     * Send email notification to instructor when a request is submitted
     * Returns array with success status and error message if failed
     */
    private function sendRequestNotification($userId, $requestId, $startDate, $endDate, $reason, $totalHours) {
        try {
            // Get student information
            $stmt = $this->db->prepare("SELECT name, email FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $student = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if (!$student) {
                $error = "Could not find student information for user ID: $userId";
                error_log($error);
                return ['success' => false, 'error' => $error];
            }
            
            // Prepare email data
            $emailData = [
                'student_name' => $student['name'] ?? 'Unknown Student',
                'student_email' => $student['email'] ?? '',
                'start_date' => $startDate,
                'end_date' => $endDate,
                'reason' => $reason,
                'total_hours' => $totalHours,
                'submitted_at' => date('Y-m-d H:i:s'),
                'request_id' => $requestId
            ];
            
            // Send the email
            $emailSent = $this->emailService->sendVacationRequestNotification($emailData);
            
            if ($emailSent) {
                error_log("Email notification sent successfully for request ID: $requestId");
                return ['success' => true, 'error' => null];
            } else {
                $error = "Email service returned false - check EmailService logs for details";
                error_log("Failed to send email notification for request ID: $requestId - $error");
                return ['success' => false, 'error' => $error];
            }
            
        } catch (\Exception $e) {
            $error = "Exception in sendRequestNotification: " . $e->getMessage();
            error_log($error);
            return ['success' => false, 'error' => $error];
        }
    }
}

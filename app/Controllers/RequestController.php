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
        } catch (Exception $e) {
            error_log("Database connection failed in RequestController: " . $e->getMessage());
            $this->db = null;
        }
    }

    public function submitRequest() {
        header('Content-Type: application/json');
        
        try {
            if (!$this->sessionManager->isAuthenticated()) {
                http_response_code(401);
                return json_encode(['error' => 'User not authenticated']);
            }
            
            $userType = $this->sessionManager->getUserType();
            if ($userType !== 'standard') {
                http_response_code(403);
                return json_encode(['error' => 'Only students can submit requests']);
            }
            
            $jsonData = file_get_contents('php://input');
            $data = json_decode($jsonData, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                return json_encode(['error' => 'Invalid JSON data']);
            }
            
            $requiredFields = ['requestType', 'startDate', 'endDate', 'reason'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty(trim($data[$field]))) {
                    http_response_code(400);
                    return json_encode(['error' => "Missing required field: $field"]);
                }
            }
            
            $startDate = $data['startDate'];
            $endDate = $data['endDate'];
            
            if (!$this->isValidDate($startDate) || !$this->isValidDate($endDate)) {
                http_response_code(400);
                return json_encode(['error' => 'Invalid date format']);
            }
            
            if (strtotime($startDate) > strtotime($endDate)) {
                http_response_code(400);
                return json_encode(['error' => 'Start date cannot be after end date']);
            }
            
            if (strtotime($startDate) < strtotime('today')) {
                http_response_code(400);
                return json_encode(['error' => 'Start date cannot be in the past']);
            }
            
            $userId = $this->sessionManager->getUserId();
            
            $start = new DateTime($startDate);
            $end = new DateTime($endDate);
            $interval = $start->diff($end);
            $days = $interval->days + 1; // Include both start and end dates in count
            
            if (!$this->db) {
                http_response_code(500);
                return json_encode(['error' => 'Database connection failed']);
            }
            
            $stmt = $this->db->prepare("
                INSERT INTO requests (
                    user_id, 
                    request_type, 
                    start_date, 
                    end_date, 
                    days_requested, 
                    reason, 
                    status, 
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
            ");
            
            if (!$stmt) {
                http_response_code(500);
                return json_encode(['error' => 'Failed to prepare database statement']);
            }
            
            $result = $stmt->execute([
                $userId,
                $data['requestType'],
                $startDate,
                $endDate,
                $days,
                trim($data['reason'])
            ]);
            
            if (!$result) {
                http_response_code(500);
                return json_encode(['error' => 'Failed to save request to database']);
            }
            
            $requestId = $this->db->lastInsertId();
            
            return json_encode([
                'success' => true,
                'message' => 'Request submitted successfully',
                'data' => [
                    'id' => $requestId,
                    'requestType' => $data['requestType'],
                    'startDate' => $startDate,
                    'endDate' => $endDate,
                    'days' => $days,
                    'reason' => trim($data['reason']),
                    'status' => 'pending',
                    'submittedAt' => date('Y-m-d H:i:s')
                ]
            ]);
            
        } catch (Exception $e) {
            error_log("Error in RequestController::submitRequest: " . $e->getMessage());
            http_response_code(500);
            return json_encode(['error' => 'An unexpected error occurred']);
        }
    }
    
    private function isValidDate($date) {
        $d = DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }
    
    public function getUserRequests() {
        header('Content-Type: application/json');
        
        try {
            if (!$this->sessionManager->isAuthenticated()) {
                http_response_code(401);
                return json_encode(['error' => 'User not authenticated']);
            }
            
            $userId = $this->sessionManager->getUserId();
            
            if (!$this->db) {
                http_response_code(500);
                return json_encode(['error' => 'Database connection failed']);
            }
            
            $stmt = $this->db->prepare("
                SELECT 
                    id,
                    request_type,
                    start_date,
                    end_date,
                    days_requested,
                    reason,
                    status,
                    created_at,
                    updated_at
                FROM requests 
                WHERE user_id = ? 
                ORDER BY created_at DESC
            ");
            
            if (!$stmt) {
                http_response_code(500);
                return json_encode(['error' => 'Failed to prepare database statement']);
            }
            
            $stmt->execute([$userId]);
            $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return json_encode([
                'success' => true,
                'data' => $requests
            ]);
            
        } catch (Exception $e) {
            error_log("Error in RequestController::getUserRequests: " . $e->getMessage());
            http_response_code(500);
            return json_encode(['error' => 'An unexpected error occurred']);
        }
    }
}

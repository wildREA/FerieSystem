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

    public function submitRequest() {
        // Ensure we don't output anything before the JSON response
        if (ob_get_length()) {
            ob_clean();
        }
        header('Content-Type: application/json');
        
        try {
            if (!$this->sessionManager->isAuthenticated()) {
                http_response_code(401);
                if (ob_get_length()) {
                    ob_clean();
                }
                return json_encode(['error' => 'User not authenticated']);
            }
            
            $userType = $this->sessionManager->getUserType();
            if ($userType !== 'standard') {
                http_response_code(403);
                if (ob_get_length()) {
                    ob_clean();
                }
                return json_encode(['error' => 'Only students can submit requests']);
            }
            
            $jsonData = file_get_contents('php://input');
            $data = json_decode($jsonData, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                if (ob_get_length()) {
                    ob_clean();
                }
                return json_encode(['error' => 'Invalid JSON data']);
            }
            
            $requiredFields = ['requestType', 'startDateTime', 'endDateTime'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty(trim($data[$field]))) {
                    http_response_code(400);
                    if (ob_get_length()) {
                        ob_clean();
                    }
                    return json_encode(['error' => "Missing required field: $field"]);
                }
            }
            
            // Handle optional reason field
            $reason = isset($data['reason']) ? trim($data['reason']) : '';
            
            $startDateTime = $data['startDateTime'];
            $endDateTime = $data['endDateTime'];
            
            // Calculate total hours server-side for data integrity
            $totalHours = $this->calculateTotalHours($startDateTime, $endDateTime);
            
            if (!$this->isValidDateTime($startDateTime) || !$this->isValidDateTime($endDateTime)) {
                http_response_code(400);
                if (ob_get_length()) {
                    ob_clean();
                }
                return json_encode(['error' => 'Invalid datetime format']);
            }
            
            if (strtotime($startDateTime) > strtotime($endDateTime)) {
                http_response_code(400);
                if (ob_get_length()) {
                    ob_clean();
                }
                return json_encode(['error' => 'Start datetime cannot be after end datetime']);
            }
            
            if (strtotime($startDateTime) < time()) {
                http_response_code(400);
                if (ob_get_length()) {
                    ob_clean();
                }
                return json_encode(['error' => 'Start datetime cannot be in the past']);
            }
            
            $userId = $this->sessionManager->getUserId();
            
            if (!$this->db) {
                http_response_code(500);
                if (ob_get_length()) {
                    ob_clean();
                }
                return json_encode(['error' => 'Database connection failed']);
            }
            
            $stmt = $this->db->prepare("
                INSERT INTO requests (
                    user_id, 
                    request_type, 
                    start_datetime, 
                    end_datetime, 
                    total_hours, 
                    reason, 
                    status, 
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
            ");
            
            if (!$stmt) {
                http_response_code(500);
                if (ob_get_length()) {
                    ob_clean();
                }
                return json_encode(['error' => 'Failed to prepare database statement']);
            }
            
            $result = $stmt->execute([
                $userId,
                $data['requestType'],
                $startDateTime,
                $endDateTime,
                $totalHours,
                $reason
            ]);
            
            if (!$result) {
                http_response_code(500);
                if (ob_get_length()) {
                    ob_clean();
                }
                return json_encode(['error' => 'Failed to save request to database']);
            }
            
            $requestId = $this->db->lastInsertId();
            
            return json_encode([
                'success' => true,
                'message' => 'Request submitted successfully',
                'data' => [
                    'id' => $requestId,
                    'requestType' => $data['requestType'],
                    'startDateTime' => $startDateTime,
                    'endDateTime' => $endDateTime,
                    'totalHours' => $totalHours,
                    'reason' => $reason,
                    'status' => 'pending',
                    'submittedAt' => date('Y-m-d H:i:s')
                ]
            ]);
            
        } catch (\Exception $e) {
            error_log("Error in RequestController::submitRequest: " . $e->getMessage());
            http_response_code(500);
            
            // Clean any previous output
            if (ob_get_length()) {
                ob_clean();
            }
            
            return json_encode(['error' => 'An unexpected error occurred']);
        }
    }
    
    private function isValidDate($date) {
        $d = \DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }
    
    private function isValidDateTime($datetime) {
        $d = \DateTime::createFromFormat('Y-m-d\TH:i:s', $datetime);
        return $d && $d->format('Y-m-d\TH:i:s') === $datetime;
    }
    
    private function calculateTotalHours($startDateTime, $endDateTime) {
        $start = new \DateTime($startDateTime);
        $end = new \DateTime($endDateTime);
        
        $totalHours = 0;
        $current = clone $start;
        
        while ($current < $end) {
            $dayEnd = clone $current;
            $dayEnd->setTime(17, 0, 0); // 5 PM
            
            $dayStart = clone $current;
            $dayStart->setTime(9, 0, 0); // 9 AM
            
            // If this is the start day, use the actual start time if after 9 AM
            if ($current->format('Y-m-d') === $start->format('Y-m-d')) {
                $dayStart = $start->getTimestamp() > $dayStart->getTimestamp() ? $start : $dayStart;
            }
            
            // If this is the end day, use the actual end time if before 5 PM
            if ($current->format('Y-m-d') === $end->format('Y-m-d')) {
                $dayEnd = $end->getTimestamp() < $dayEnd->getTimestamp() ? $end : $dayEnd;
            }
            
            // Only count hours within working hours (9 AM - 5 PM)
            if ($dayStart < $dayEnd && $dayStart->format('H') < 17 && $dayEnd->format('H') >= 9) {
                $hoursThisDay = ($dayEnd->getTimestamp() - $dayStart->getTimestamp()) / 3600;
                $totalHours += $hoursThisDay;
            }
            
            // Move to next day
            $current->add(new \DateInterval('P1D'));
            $current->setTime(9, 0, 0);
        }
        
        return round($totalHours, 2);
    }
    
    public function getUserRequests() {
        // Ensure we don't output anything before the JSON response
        if (ob_get_length()) {
            ob_clean();
        }
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
                    start_datetime,
                    end_datetime,
                    total_hours,
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
            $requests = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            return json_encode([
                'success' => true,
                'data' => $requests
            ]);
            
        } catch (\Exception $e) {
            error_log("Error in RequestController::getUserRequests: " . $e->getMessage());
            http_response_code(500);
            return json_encode(['error' => 'An unexpected error occurred']);
        }
    }
    
    public function getUserRequestsForView() {
        try {
            if (!$this->sessionManager->isAuthenticated()) {
                return [];
            }
            
            $userId = $this->sessionManager->getUserId();
            
            if (!$this->db) {
                error_log("Database connection failed in getUserRequestsForView");
                return [];
            }
            
            $stmt = $this->db->prepare("
                SELECT 
                    id,
                    request_type,
                    start_datetime,
                    end_datetime,
                    total_hours,
                    reason,
                    status,
                    created_at,
                    updated_at
                FROM requests 
                WHERE user_id = ? 
                ORDER BY created_at DESC
            ");
            
            if (!$stmt) {
                error_log("Failed to prepare database statement in getUserRequestsForView");
                return [];
            }
            
            $stmt->execute([$userId]);
            $requests = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            return $requests;
            
        } catch (\Exception $e) {
            error_log("Error in RequestController::getUserRequestsForView: " . $e->getMessage());
            return [];
        }
    }
}

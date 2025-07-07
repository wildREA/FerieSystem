<?php
namespace App\Controllers;

require_once dirname(__DIR__) . '/Core/sessions.php';

class CalendarController {
    private $sessionManager;
    private $uploadDir;
    
    public function __construct() {
        $this->sessionManager = new \SessionManager();
        // Define upload directory for calendar PDFs
        $this->uploadDir = dirname(__DIR__, 2) . '/public/uploads/calendar/';
        
        // Create upload directory if it doesn't exist
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    /**
     * Upload calendar PDF file
     */
    public function uploadCalendar() {
        // Ensure we don't output anything before the JSON response
        if (ob_get_length()) {
            ob_clean();
        }
        header('Content-Type: application/json');
        
        try {
            if (!$this->sessionManager->isAuthenticated()) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => __('user_not_authenticated')]);
                exit;
            }
            
            $userType = $this->sessionManager->getUserType();
            if ($userType !== 'super') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => __('only_superusers_upload_calendar')]);
                exit;
            }
            
            if (!isset($_FILES['calendar']) || $_FILES['calendar']['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => __('no_file_uploaded')]);
                exit;
            }
            
            $uploadedFile = $_FILES['calendar'];
            
            // Validate file type
            $fileType = mime_content_type($uploadedFile['tmp_name']);
            if ($fileType !== 'application/pdf') {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => __('only_pdf_files_allowed')]);
                exit;
            }
            
            // Validate file size (max 10MB)
            $maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if ($uploadedFile['size'] > $maxSize) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => __('file_size_limit_10mb')]);
                exit;
            }
            
            // Define target filename (always the same to replace existing)
            $targetFilename = 'calendar.pdf';
            $targetPath = $this->uploadDir . $targetFilename;
            
            // Remove existing file if it exists
            if (file_exists($targetPath)) {
                unlink($targetPath);
            }
            
            // Move uploaded file to target location
            if (move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
                echo json_encode([
                    'success' => true,
                    'message' => __('calendar_uploaded_successfully'),
                    'filename' => $targetFilename,
                    'url' => '/uploads/calendar/' . $targetFilename
                ]);
                exit;
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => __('failed_to_save_file')]);
                exit;
            }
            
        } catch (\Exception $e) {
            error_log("Error in CalendarController::uploadCalendar: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => __('unexpected_error_occurred')]);
            exit;
        }
    }

    /**
     * Get current calendar file info
     */
    public function getCalendarInfo() {
        // Ensure we don't output anything before the JSON response
        if (ob_get_length()) {
            ob_clean();
        }
        header('Content-Type: application/json');
        
        try {
            if (!$this->sessionManager->isAuthenticated()) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => __('user_not_authenticated')]);
                exit;
            }
            
            $filename = 'calendar.pdf';
            $filePath = $this->uploadDir . $filename;
            
            if (file_exists($filePath)) {
                $fileSize = filesize($filePath);
                $uploadTime = filemtime($filePath);
                
                echo json_encode([
                    'success' => true,
                    'exists' => true,
                    'filename' => $filename,
                    'url' => '/uploads/calendar/' . $filename,
                    'size' => $fileSize,
                    'uploadTime' => date('Y-m-d H:i:s', $uploadTime)
                ]);
                exit;
            } else {
                echo json_encode([
                    'success' => true,
                    'exists' => false,
                    'message' => 'No calendar file uploaded'
                ]);
                exit;
            }
            
        } catch (\Exception $e) {
            error_log("Error in CalendarController::getCalendarInfo: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => __('unexpected_error_occurred')]);
            exit;
        }
    }

    /**
     * Delete calendar file
     */
    public function deleteCalendar() {
        // Ensure we don't output anything before the JSON response
        if (ob_get_length()) {
            ob_clean();
        }
        header('Content-Type: application/json');
        
        try {
            if (!$this->sessionManager->isAuthenticated()) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => __('user_not_authenticated')]);
                exit;
            }
            
            $userType = $this->sessionManager->getUserType();
            if ($userType !== 'super') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => __('only_superusers_delete_calendar')]);
                exit;
            }
            
            $filename = 'calendar.pdf';
            $filePath = $this->uploadDir . $filename;
            
            if (file_exists($filePath)) {
                if (unlink($filePath)) {
                    echo json_encode([
                        'success' => true,
                        'message' => __('calendar_deleted_successfully')
                    ]);
                    exit;
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => __('failed_to_delete_calendar')]);
                    exit;
                }
            } else {
                echo json_encode([
                    'success' => true,
                    'message' => __('calendar_file_not_found')
                ]);
                exit;
            }
            
        } catch (\Exception $e) {
            error_log("Error in CalendarController::deleteCalendar: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => __('unexpected_error_occurred')]);
            exit;
        }
    }
}

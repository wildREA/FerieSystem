<?php
namespace App\Helpers;

/**
 * Trait ResponseHelper
 * Provides common response formatting methods
 */
trait ResponseHelper
{
    /**
     * Send a JSON error response
     * 
     * @param string $message Error message
     * @param int $statusCode HTTP status code
     * @return never Exits script execution after sending response
     */
    protected function respondWithError(string $message, int $statusCode = 400): never
    {
        // Clear any potential output buffer to ensure clean JSON response
        if (ob_get_level()) {
            ob_clean();
        }
        
        header('Content-Type: application/json');
        http_response_code($statusCode);
        echo json_encode([
            'success' => false,
            'message' => $message
        ]);
        exit;
    }
    
    /**
     * Send a JSON success response
     * 
     * @param array $data Response data
     * @param int $statusCode HTTP status code
     * @return never Exits script execution after sending response
     */
    protected function respondWithSuccess(array $data, int $statusCode = 200): never
    {
        // Clear any potential output buffer to ensure clean JSON response
        if (ob_get_level()) {
            ob_clean();
        }
        
        header('Content-Type: application/json');
        http_response_code($statusCode);
        echo json_encode(array_merge([
            'success' => true
        ], $data));
        exit;
    }
    
    /**
     * Redirect user to a page with an optional session message
     * 
     * @param string $path Path to redirect to
     * @param string|null $message Optional message to store in session
     * @param string $messageType Type of message (error or success)
     * @return never Exits script execution after redirect
     */
    protected function redirectWithMessage(string $path, ?string $message = null, string $messageType = 'error'): never
    {
        if ($message !== null) {
            $key = $messageType === 'error' ? 'error_message' : 'success_message';
            $_SESSION[$key] = $message;
        }
        
        header('Location: ' . $path);
        exit;
    }
}
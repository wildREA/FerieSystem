<?php

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class EmailService {
    private $mailer;
    private $config;
    
    public function __construct() {
        $this->mailer = new PHPMailer(true);
        $this->loadConfig();
        $this->setupMailer();
    }
    
    private function loadConfig() {
        $this->config = [
            'host' => $_ENV['MAIL_HOST'] ?? 'smtp.gmail.com',
            'port' => $_ENV['MAIL_PORT'] ?? 587,
            'username' => $_ENV['MAIL_USERNAME'] ?? '',
            'password' => $_ENV['MAIL_PASSWORD'] ?? '',
            'encryption' => $_ENV['MAIL_ENCRYPTION'] ?? 'tls',
            'from_address' => $_ENV['MAIL_FROM_ADDRESS'] ?? '',
            'from_name' => $_ENV['MAIL_FROM_NAME'] ?? 'FerieSystem',
            'instructor_email' => $_ENV['INSTRUCTOR_EMAIL'] ?? ''
        ];
    }
    
    private function setupMailer() {
        try {
            // Server settings
            $this->mailer->isSMTP();
            $this->mailer->Host = $this->config['host'];
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $this->config['username'];
            $this->mailer->Password = $this->config['password'];
            $this->mailer->SMTPSecure = $this->config['encryption'];
            $this->mailer->Port = $this->config['port'];
            
            // Character encoding settings
            $this->mailer->CharSet = 'UTF-8';
            $this->mailer->Encoding = 'base64';
            
            // Default sender
            $this->mailer->setFrom($this->config['from_address'], $this->config['from_name']);
            
        } catch (Exception $e) {
            error_log("EmailService setup failed: " . $e->getMessage());
        }
    }
    
    /**
     * Send vacation request notification to instructor
     */
    public function sendVacationRequestNotification($requestData) {
        try {
            // Validate configuration first
            if (empty($this->config['instructor_email'])) {
                error_log("EmailService: Instructor email not configured in .env");
                return false;
            }
            
            if (empty($this->config['username']) || empty($this->config['password'])) {
                error_log("EmailService: MAIL_USERNAME or MAIL_PASSWORD not configured in .env");
                return false;
            }
            
            // Clear any previous recipients
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();
            
            // Recipients
            $this->mailer->addAddress($this->config['instructor_email']);
            
            // Content
            $this->mailer->isHTML(true);
            $this->mailer->Subject = "New Vacation Request from " . $requestData['student_name'];
            
            $htmlBody = $this->generateRequestEmailHTML($requestData);
            $this->mailer->Body = $htmlBody;
            
            // Alternative plain text body
            $this->mailer->AltBody = $this->generateRequestEmailPlainText($requestData);
            
            // Attempt to send
            $result = $this->mailer->send();
            
            if ($result) {
                error_log("EmailService: Vacation request email sent successfully to " . $this->config['instructor_email']);
                return true;
            } else {
                error_log("EmailService: Failed to send email - PHPMailer returned false");
                return false;
            }
            
        } catch (Exception $e) {
            error_log("EmailService: Exception occurred - " . $e->getMessage());
            error_log("EmailService: Full error details - " . $e->getFile() . ":" . $e->getLine());
            return false;
        } finally {
            // Clear all addresses and attachments for next iteration
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();
        }
    }
    
    /**
     * Generate HTML email body for vacation request
     */
    private function generateRequestEmailHTML($data) {
        $startDate = date('F j, Y \a\t g:i A', strtotime($data['start_date']));
        $endDate = date('F j, Y \a\t g:i A', strtotime($data['end_date']));
        $submittedAt = date('F j, Y \a\t g:i A', strtotime($data['submitted_at']));
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1'>
            <title>New Vacation Request</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px; 
                }
                .header { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin-bottom: 20px; 
                }
                .content { 
                    background: #f8f9fa; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin-bottom: 20px; 
                }
                .detail-row { 
                    margin: 10px 0; 
                    padding: 8px 0; 
                    border-bottom: 1px solid #e9ecef; 
                }
                .label { 
                    font-weight: bold; 
                    color: #495057; 
                }
                .value { 
                    margin-left: 10px; 
                    color: #212529; 
                }
                .reason-box { 
                    background: white; 
                    padding: 15px; 
                    border-left: 4px solid #667eea; 
                    margin: 15px 0; 
                    border-radius: 4px; 
                }
                .footer { 
                    text-align: center; 
                    color: #6c757d; 
                    font-size: 0.9em; 
                }
            </style>
        </head>
        <body>
            <div class='header'>
                <h1>New Vacation Request</h1>
                <p>A new vacation request has been submitted and requires your review.</p>
            </div>
            
            <div class='content'>
                <h2>Request Details</h2>
                
                <div class='detail-row'>
                    <span class='label'>Student:</span>
                    <span class='value'>{$data['student_name']}</span>
                </div>
                
                <div class='detail-row'>
                    <span class='label'>Start Date:</span>
                    <span class='value'>{$startDate}</span>
                </div>
                
                <div class='detail-row'>
                    <span class='label'>End Date:</span>
                    <span class='value'>{$endDate}</span>
                </div>
                
                <div class='detail-row'>
                    <span class='label'>Duration:</span>
                    <span class='value'>{$data['total_hours']} hours</span>
                </div>
                
                <div class='detail-row'>
                    <span class='label'>Submitted:</span>
                    <span class='value'>{$submittedAt}</span>
                </div>
                
                " . (!empty($data['reason']) ? "
                <div class='reason-box'>
                    <div class='label'>Reason:</div>
                    <div style='margin-top: 8px;'>" . nl2br(htmlspecialchars($data['reason'])) . "</div>
                </div>
                " : "") . "
            </div>
            
            <div class='footer'>
                <p>Please review this request in the FerieSystem dashboard.</p>
                <p><em>This is an automated notification from FerieSystem.</em></p>
            </div>
        </body>
        </html>";
    }
    
    /**
     * Generate plain text email body for vacation request
     */
    private function generateRequestEmailPlainText($data) {
        $startDate = date('F j, Y \a\t g:i A', strtotime($data['start_date']));
        $endDate = date('F j, Y \a\t g:i A', strtotime($data['end_date']));
        $submittedAt = date('F j, Y \a\t g:i A', strtotime($data['submitted_at']));
        
        $text = "NEW VACATION REQUEST\n";
        $text .= "=====================\n\n";
        $text .= "A new vacation request has been submitted and requires your review.\n\n";
        $text .= "REQUEST DETAILS:\n";
        $text .= "Student: {$data['student_name']}\n";
        $text .= "Start Date: {$startDate}\n";
        $text .= "End Date: {$endDate}\n";
        $text .= "Duration: {$data['total_hours']} hours\n";
        $text .= "Submitted: {$submittedAt}\n";
        
        if (!empty($data['reason'])) {
            $text .= "\nReason:\n{$data['reason']}\n";
        }
        
        $text .= "\n---\n";
        $text .= "Please review this request in the FerieSystem dashboard.\n";
        $text .= "This is an automated notification from FerieSystem.";
        
        return $text;
    }
}

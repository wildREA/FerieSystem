<?php
/**
 * Enhanced Email Configuration Test Script
 * 
 * Run this script to test if your email configuration is working properly.
 * Usage: php test_email.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'vendor/autoload.php';

// Load environment variables
if (file_exists('.env')) {
    try {
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
        $dotenv->load();
        echo "✅ .env file loaded successfully\n";
    } catch (Exception $e) {
        echo "❌ Error loading .env file: " . $e->getMessage() . "\n";
        exit(1);
    }
} else {
    echo "❌ .env file not found\n";
    exit(1);
}

require_once 'app/Services/EmailService.php';

echo "Enhanced Email Configuration Test\n";
echo "==================================\n\n";

// Check if required environment variables are set
$requiredVars = [
    'MAIL_HOST' => 'SMTP server hostname',
    'MAIL_PORT' => 'SMTP server port',
    'MAIL_USERNAME' => 'SMTP username',
    'MAIL_PASSWORD' => 'SMTP password', 
    'MAIL_FROM_ADDRESS' => 'From email address',
    'INSTRUCTOR_EMAIL' => 'Recipient email address'
];

$missing = [];
$configured = [];

foreach ($requiredVars as $var => $description) {
    if (empty($_ENV[$var])) {
        $missing[] = "$var ($description)";
    } else {
        $configured[] = $var;
        // Mask password for display
        $displayValue = ($var === 'MAIL_PASSWORD') ? str_repeat('*', strlen($_ENV[$var])) : $_ENV[$var];
        echo "✅ $var: $displayValue\n";
    }
}

if (!empty($missing)) {
    echo "\n❌ Missing required environment variables:\n";
    foreach ($missing as $var) {
        echo "   - $var\n";
    }
    echo "\nPlease configure these in your .env file before testing.\n";
    exit(1);
}

echo "\n📧 Configuration Summary:\n";
echo "SMTP Server: " . $_ENV['MAIL_HOST'] . ":" . $_ENV['MAIL_PORT'] . "\n";
echo "From: " . ($_ENV['MAIL_FROM_NAME'] ?? 'FerieSystem') . " <" . $_ENV['MAIL_FROM_ADDRESS'] . ">\n";
echo "To: " . $_ENV['INSTRUCTOR_EMAIL'] . "\n";
echo "Encryption: " . ($_ENV['MAIL_ENCRYPTION'] ?? 'tls') . "\n\n";

// Test basic PHPMailer functionality
echo "Testing PHPMailer classes...\n";
try {
    $mailer = new PHPMailer\PHPMailer\PHPMailer(true);
    echo "✅ PHPMailer class loaded successfully\n";
} catch (Exception $e) {
    echo "❌ Error loading PHPMailer: " . $e->getMessage() . "\n";
    exit(1);
}

// Create test email data
$testEmailData = [
    'student_name' => 'Test Student (Email Configuration Test)',
    'student_email' => 'test.student@example.com',
    'start_date' => '2025-08-15 09:00:00',
    'end_date' => '2025-08-20 17:00:00',
    'reason' => 'This is a test email to verify the FerieSystem email configuration is working properly.',
    'total_hours' => 40,
    'submitted_at' => date('Y-m-d H:i:s'),
    'request_id' => 999
];

echo "\nSending test email...\n";
echo "Subject: New Vacation Request from " . $testEmailData['student_name'] . "\n";

try {
    $emailService = new App\Services\EmailService();
    echo "✅ EmailService created successfully\n";
    
    echo "Attempting to send email...\n";
    $result = $emailService->sendVacationRequestNotification($testEmailData);
    
    if ($result) {
        echo "\n🎉 SUCCESS! Test email sent successfully!\n";
        echo "Check the instructor email: " . $_ENV['INSTRUCTOR_EMAIL'] . "\n";
        echo "\nIf you don't see the email:\n";
        echo "1. Check spam/junk folder\n";
        echo "2. Wait a few minutes for delivery\n";
        echo "3. Verify the recipient email address is correct\n";
    } else {
        echo "\n❌ FAILED! Email was not sent\n";
        echo "Check the error logs above for specific error messages\n";
        echo "\nCommon issues:\n";
        echo "1. Incorrect SMTP credentials\n";
        echo "2. App password not set up correctly for Gmail\n";
        echo "3. SMTP server settings incorrect\n";
        echo "4. Firewall blocking SMTP connections\n";
    }
    
} catch (Exception $e) {
    echo "\n❌ EXCEPTION: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
    echo "\nFull trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "Test completed at " . date('Y-m-d H:i:s') . "\n";
echo "Check PHP error logs for additional details if needed.\n";

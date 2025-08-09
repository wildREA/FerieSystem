<?php
/**
 * Web-based Email Test Page
 * Access this through your web browser at: yoursite.com/email_test_web.php
 */

// Start output buffering and error reporting
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type to HTML
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FerieSystem Email Test</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f5f5f5;
        }
        .container { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .success { 
            color: #28a745; 
            background: #d4edda; 
            padding: 10px; 
            border-radius: 5px; 
            margin: 10px 0;
        }
        .error { 
            color: #dc3545; 
            background: #f8d7da; 
            padding: 10px; 
            border-radius: 5px; 
            margin: 10px 0;
        }
        .warning { 
            color: #856404; 
            background: #fff3cd; 
            padding: 10px; 
            border-radius: 5px; 
            margin: 10px 0;
        }
        .info { 
            color: #0c5460; 
            background: #d1ecf1; 
            padding: 10px; 
            border-radius: 5px; 
            margin: 10px 0;
        }
        pre { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
            overflow-x: auto;
        }
        .config-item {
            margin: 5px 0;
            padding: 8px;
            background: #f8f9fa;
            border-left: 4px solid #007bff;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 FerieSystem Email Configuration Test</h1>
        <p><strong>Test Date:</strong> <?= date('Y-m-d H:i:s') ?></p>

<?php
try {
    // Load autoloader and environment
    echo "<h2>1. Loading Dependencies</h2>";
    
    if (!file_exists('vendor/autoload.php')) {
        throw new Exception('Composer autoload not found. Run: composer install');
    }
    require_once 'vendor/autoload.php';
    echo "<div class='success'>✅ Composer autoload loaded</div>";

    if (!file_exists('.env')) {
        throw new Exception('.env file not found');
    }
    
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
    echo "<div class='success'>✅ Environment variables loaded</div>";

    // Check PHPMailer
    if (!class_exists('PHPMailer\\PHPMailer\\PHPMailer')) {
        throw new Exception('PHPMailer not found. Run: composer require phpmailer/phpmailer');
    }
    echo "<div class='success'>✅ PHPMailer class available</div>";

    echo "<h2>2. Email Configuration Check</h2>";
    
    $config = [
        'MAIL_HOST' => $_ENV['MAIL_HOST'] ?? 'NOT SET',
        'MAIL_PORT' => $_ENV['MAIL_PORT'] ?? 'NOT SET', 
        'MAIL_USERNAME' => $_ENV['MAIL_USERNAME'] ?? 'NOT SET',
        'MAIL_PASSWORD' => !empty($_ENV['MAIL_PASSWORD']) ? '***CONFIGURED***' : 'NOT SET',
        'MAIL_FROM_ADDRESS' => $_ENV['MAIL_FROM_ADDRESS'] ?? 'NOT SET',
        'INSTRUCTOR_EMAIL' => $_ENV['INSTRUCTOR_EMAIL'] ?? 'NOT SET'
    ];
    
    $allConfigured = true;
    foreach ($config as $key => $value) {
        $status = ($value !== 'NOT SET') ? 'success' : 'error';
        if ($value === 'NOT SET') $allConfigured = false;
        echo "<div class='config-item'><strong>$key:</strong> <span class='$status'>$value</span></div>";
    }
    
    if (!$allConfigured) {
        throw new Exception('Some email configuration values are missing. Check your .env file.');
    }

    echo "<h2>3. Loading Email Service</h2>";
    
    if (!file_exists('app/Services/EmailService.php')) {
        throw new Exception('EmailService.php not found');
    }
    require_once 'app/Services/EmailService.php';
    echo "<div class='success'>✅ EmailService loaded</div>";

    $emailService = new App\Services\EmailService();
    echo "<div class='success'>✅ EmailService instantiated</div>";

    echo "<h2>4. Sending Test Email</h2>";
    
    $testEmailData = [
        'student_name' => '🧪 Test Student (Email Configuration Test)',
        'student_email' => 'test.student@example.com',
        'start_date' => '2025-08-15 09:00:00',
        'end_date' => '2025-08-20 17:00:00',
        'reason' => 'This is a test email to verify the FerieSystem email configuration is working properly through the web interface.',
        'total_hours' => 40,
        'submitted_at' => date('Y-m-d H:i:s'),
        'request_id' => 999
    ];

    echo "<div class='info'>";
    echo "<strong>Test Email Details:</strong><br>";
    echo "From: " . ($_ENV['MAIL_FROM_NAME'] ?? 'FerieSystem') . " &lt;" . $_ENV['MAIL_FROM_ADDRESS'] . "&gt;<br>";
    echo "To: " . $_ENV['INSTRUCTOR_EMAIL'] . "<br>";
    echo "Subject: New Vacation Request from " . $testEmailData['student_name'] . "<br>";
    echo "</div>";

    echo "<p>Attempting to send email...</p>";
    
    $result = $emailService->sendVacationRequestNotification($testEmailData);
    
    if ($result) {
        echo "<div class='success'>";
        echo "<h3>🎉 SUCCESS!</h3>";
        echo "<p>Test email sent successfully!</p>";
        echo "<p><strong>Check your inbox at:</strong> " . $_ENV['INSTRUCTOR_EMAIL'] . "</p>";
        echo "<p><strong>If you don't see the email:</strong></p>";
        echo "<ul>";
        echo "<li>Check spam/junk folder</li>";
        echo "<li>Wait a few minutes for delivery</li>";
        echo "<li>Verify the recipient email address</li>";
        echo "</ul>";
        echo "</div>";
    } else {
        echo "<div class='error'>";
        echo "<h3>❌ FAILED</h3>";
        echo "<p>Email was not sent. Check the error details below.</p>";
        echo "</div>";
    }

} catch (Exception $e) {
    echo "<div class='error'>";
    echo "<h3>❌ EXCEPTION OCCURRED</h3>";
    echo "<p><strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p><strong>File:</strong> " . $e->getFile() . "</p>";
    echo "<p><strong>Line:</strong> " . $e->getLine() . "</p>";
    echo "</div>";
    
    if ($e->getMessage() === 'SMTP Error: Could not authenticate.') {
        echo "<div class='warning'>";
        echo "<h4>🔑 Authentication Issue - Common Solutions:</h4>";
        echo "<ol>";
        echo "<li><strong>Gmail App Password:</strong> Make sure you're using an App Password, not your regular Gmail password</li>";
        echo "<li><strong>2-Factor Authentication:</strong> Must be enabled on your Google account</li>";
        echo "<li><strong>Username:</strong> Should be your full email address</li>";
        echo "<li><strong>Password Format:</strong> Remove spaces from app password or keep it quoted</li>";
        echo "</ol>";
        echo "</div>";
    }
}

echo "<h2>5. Gmail Setup Instructions</h2>";
echo "<div class='info'>";
echo "<ol>";
echo "<li>Go to your <a href='https://myaccount.google.com/' target='_blank'>Google Account</a></li>";
echo "<li>Select <strong>Security</strong></li>";
echo "<li>Under 'Signing in to Google', select <strong>2-Step Verification</strong></li>";
echo "<li>At the bottom, select <strong>App passwords</strong></li>";
echo "<li>Enter a name that helps you remember where you'll use the app password</li>";
echo "<li>Select <strong>Generate</strong></li>";
echo "<li>Copy the 16-character app password and use it as MAIL_PASSWORD</li>";
echo "</ol>";
echo "</div>";

?>
    </div>
</body>
</html>

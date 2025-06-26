<?php

function debugError($message, $file = '', $line = '') {
    $errorMsg = "Error: " . $message;
    if ($file) {
        $errorMsg .= " in " . $file;
    }
    if ($line) {
        $errorMsg .= " on line " . $line;
    }
    
    // Log the error
    error_log($errorMsg);
    
    // Display the error if debugging is enabled
    if (defined('APP_DEBUG') && APP_DEBUG) {
        echo "<pre>" . htmlspecialchars($errorMsg) . "</pre>";
    } else {
        echo "An error occurred. Please check the error logs.";
    }
}

// Set error handler
function customErrorHandler($errno, $errstr, $errfile, $errline) {
    debugError($errstr, $errfile, $errline);
    return true;
}

// Set exception handler
function customExceptionHandler($exception) {
    debugError($exception->getMessage(), $exception->getFile(), $exception->getLine());
}

set_error_handler('customErrorHandler');
set_exception_handler('customExceptionHandler');

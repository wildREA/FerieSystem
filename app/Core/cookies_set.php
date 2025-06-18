<?php
session_start();

// Upon login of valid user, set cookies
define('COOKIES_FILE', __DIR__ . '/../../storage/tmp_cookies/cookies.json');

// Check if temp cookie directory exists
if (!is_dir(dirname(COOKIES_FILE))) {
    mkdir(dirname(COOKIES_FILE), 0700, true);
}

// Set cookies
setcookie([
    'name' => 'remember_me',
    'value' => $token,
    'expires' => time() * 30 * 86400,  // 30 days, 86400 seconds in a day
    'path' => '/',
    'domain' => '',  // Current domain only
    'secure' => true,  // Only send over HTTPS
    'httponly' => true,  // Prevent JavaScript access (XSS protection)
    'samesite' => 'Strict'  // Strict SameSite policy (prevents CSRF); recommended for security
])
?>
<?php
session_start();

define('USERS_FILE', __DIR__ . '/..//users.json');
define('COOKIES_FILE', __DIR__ . '/../Data/cookies.json');
define('TEMP_COOKIE_DIR', sys_get_temp_dir() . '/feriesystem_cookies/');

// Ensure temp cookie directory exists
if (!is_dir(TEMP_COOKIE_DIR)) {
    mkdir(TEMP_COOKIE_DIR, 0700, true);
}

// Helper to read JSON files
function read_json($file) {
    if (!file_exists($file)) return [];
    return json_decode(file_get_contents($file), true) ?: [];
}

// Check for existing cookies
if (!isset($_COOKIE['user']) || empty($_COOKIE['user'])) {
    // No cookie, require authentication
    header('Location: /login.php');
    exit;
}

$username = $_COOKIE['user'];
$users = read_json(USERS_FILE);
$cookies = read_json(COOKIES_FILE);

// Check if user exists and cookie is valid
if (!isset($users[$username]) || !isset($cookies[$username])) {
    // Invalid cookie or user, force re-auth
    setcookie('user', '', time() - 3600, '/');
    header('Location: /login.php');
    exit;
}

// Check if user is superuser
$is_super = isset($users[$username]['role']) && $users[$username]['role'] === 'super';

// Set/refresh cookie in temp folder
$temp_cookie_file = TEMP_COOKIE_DIR . $username . '.cookie';
file_put_contents($temp_cookie_file, json_encode([
    'username' => $username,
    'role' => $users[$username]['role'] ?? 'user',
    'timestamp' => time()
]));

// Example: you can now use $username and $is_super in your app
// ...

?>

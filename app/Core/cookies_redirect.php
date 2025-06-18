<?<php
session_start();

// Users checked through database
define ('COOKIES_FILE', __DIR__ . '/../../storage/cookies.json');
define ('TEMP_COOKIE_DIR', sys_get_temp_dir() . '/feriesystem_cookies/');

// Check if temp cookie directory exists
if (!is_dir(TEMP_COOKIE_DIR)) {
    mkdir(TEMP_COOKIE_DIR, 3600, true)
}
?>

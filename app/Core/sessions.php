<?php
// Start session and store session ID in a cookie
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1); // Prevent JavaScript access (XSS protection
    ini_set('session.cookie_secure', 1); // Use secure cookies (HTTPS only; MITM protection)
    ini_set('session.use_strict_mode', 1); // Prevent session fixation attacks (session hijacking protection)
    session_start();
}

// Login functions
function storeSessionID() {
    $session_id = session_id();
    $stmt = $db->prepaire("INSERT INTO sessions (session_id, created_at) VALUES (?, NOW()) ON DUPLICATE KEY UPDATE created_at = NOW()");
    $stmt->execute([$user['id'], $session_id]);
}

// Logout functions
function destroySessionID() {
    $stmt = $db->prepare("DELETE FROM sessions WHERE session_id = ?");
    $stmt->execute([session_id()]);
}

// Revisit functions
function validateSessionID($session_id) {
    $stmt = $db->prepare("SELECT user_id FROM sessions WHERE session_id = ?");
    $stmt->execute([$session_id]);
    return $stmt->fetchColumn();
}

function restartSession() {
    session_regenerate_id(true); // Regenerate session ID to prevent session fixation attacks
    storeSessionID(); // Store the new session ID
}
function getUserIdFromSession() {
    $session_id = session_id();
    $stmt = $db->prepare("SELECT user_id FROM sessions WHERE session_id = ?");
    $stmt->execute([$session_id]);
    return $stmt->fetchColumn();
}

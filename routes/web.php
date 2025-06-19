<?php

/**
 * Web Routes
 * 
 * Here is where you can register web routes for your application.
 */

// Define routes as an array that will be processed by the router
// Import necessary files
require_once BASE_PATH . '/app/Core/sessions.php';  // For remember me and session ID management
require_once BASE_PATH . '/app/Core/sessions.php';
$sessionManager = new SessionManager();

$routes = [];

// Home page
$routes['GET']['/'] = function() {

    if (!$sessionManager->isAuthenticated()) {
        if (!$sessionManager->hasRememberMeToken()) {
            // If no session and no remember me token, redirect to login
            header('Location: /auth');
            exit;
        } else {
            // If remember me token exists, revalidate it
            $sessionManager->revalidateRememberMeToken();
            // Restart session to ensure session ID is valid
            $sessionManager->restartSession();
        }
    }

    $user = $sessionManager->getUser();
    if ($user['user_type'] === 'admin') {
        return view('/admin/index');
    } elseif ($user['user_type'] === 'standard') {
        return view('/standarduser/index');
    } else {
        // Handle other user types or redirect to a default page
        header('Location: /auth');
    }
    

};

// Example routes
$routes['GET']['/about'] = function() {
    return view('about');
};

$routes['GET']['/contact'] = function() {
    return view('contact');
};

// Login page
$routes['GET']['/auth'] = function() {
    return view('auth');
};

// Handle login form submission
$routes['POST']['/login'] = function() {
    require_once BASE_PATH . '/app/Controllers/AuthController.php';
    $auth = new App\Controllers\AuthController();
    return $auth->login();
};

// Logout route
$routes['POST']['/logout'] = function() {
    require_once BASE_PATH . '/app/Controllers/AuthController.php';
    $auth = new App\Controllers\AuthController();
    return $auth->logout();
};

// Standard user routes
$routes['GET']['/standarduser/'] = function() use ($sessionManager) {
    $sessionManager->requireAuth('/auth');
    $sessionManager->requireUserType(['standard'], '/auth');
    return view('standarduser/index');
};

$routes['GET']['/standarduser/requests'] = function() use ($sessionManager) {
    $sessionManager->requireAuth('/auth');
    $sessionManager->requireUserType(['standard'], '/auth');
    return view('standarduser/requests');
};

$routes['GET']['/standarduser/new-request'] = function() use ($sessionManager) {
    $sessionManager->requireAuth('/auth');
    $sessionManager->requireUserType(['standard'], '/auth');
    return view('standarduser/new-request');
};

// Super user routes
$routes['GET']['/superuser/'] = function() use ($sessionManager) {
    $sessionManager->requireAuth('/auth');
    $sessionManager->requireUserType(['super'], '/auth');
    return view('superuser/requests');
};

$routes['GET']['/superuser/requests'] = function() use ($sessionManager) {
    $sessionManager->requireAuth('/auth');
    $sessionManager->requireUserType(['super'], '/auth');
    return view('superuser/requests');
};

$routes['GET']['/superuser/students'] = function() use ($sessionManager) {
    $sessionManager->requireAuth('/auth');
    $sessionManager->requireUserType(['super'], '/auth');
    return view('superuser/students');
};

$routes['GET']['/superuser/calendar'] = function() use ($sessionManager) {
    $sessionManager->requireAuth('/auth');
    $sessionManager->requireUserType(['super'], '/auth');
    return view('superuser/calendar');
};

// Example route with parameters
$routes['GET']['/user/{id}'] = function($id) {
    return "User ID: " . $id;
};

// Example route with controller
// $routes['GET']['/users'] = ['controller' => 'UserController', 'method' => 'index'];

// Example route with middleware
// $routes['GET']['/admin'] = [
//     'middleware' => 'auth',
//     'controller' => 'AdminController',
//     'method' => 'index'
// ];

// Example API routes
$routes['GET']['/api/users'] = function() {
    return json_encode([
        ['id' => 1, 'name' => 'John Doe'],
        ['id' => 2, 'name' => 'Jane Doe']
    ]);
};

// Return the routes array to be processed by the router
return $routes;

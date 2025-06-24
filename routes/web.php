<?php

/**
 * Web Routes
 * 
 * Here is where you can register web routes for your application.
 */

// Define routes as an array that will be processed by the router
$routes = [];

// Helper function to get SessionManager
function getSessionManager() {
    static $sessionManager = null;
    if ($sessionManager === null) {
        require_once BASE_PATH . '/app/Core/sessions.php';
        $sessionManager = new SessionManager();
    }
    return $sessionManager;
}

// Home page
$routes['GET']['/'] = function() {
    $sessionManager = getSessionManager();

    // This will check session validity, expiration, and remember me token in one call
    if (!$sessionManager->checkAuthentication()) {
        // Not authenticated via session or remember me token
        redirect('/auth');
    }

    // User is authenticated, redirect based on user type
    $userType = $sessionManager->getUserType();
    if ($userType === 'super') {
        redirect('/superuser');
    } elseif ($userType === 'standard') {
        redirect('/dashboard');
    } else {
        // Handle other user types or redirect to a default page
        redirect('/auth');
    }
};

// Example routes (both with and without trailing slash where applicable)
$routes['GET']['/about'] = function() {
    return view('about');
};

$routes['GET']['/about/'] = function() {
    return view('about');
};

$routes['GET']['/contact'] = function() {
    return view('contact');
};

$routes['GET']['/contact/'] = function() {
    return view('contact');
};

// Login page (both variants)
$routes['GET']['/auth'] = function() {
    return view('auth');
};

$routes['GET']['/auth/'] = function() {
    return view('auth');
};

// Handle login form submission (both variants)
$routes['POST']['/login'] = function() {
    require_once BASE_PATH . '/app/Controllers/AuthController.php';
    $auth = new App\Controllers\AuthController();
    return $auth->login();
};

$routes['POST']['/login/'] = function() {
    require_once BASE_PATH . '/app/Controllers/AuthController.php';
    $auth = new App\Controllers\AuthController();
    return $auth->login();
};

// Logout route (both variants)
$routes['POST']['/logout'] = function() {
    require_once BASE_PATH . '/app/Controllers/AuthController.php';
    $auth = new App\Controllers\AuthController();
    return $auth->logout();
};

$routes['POST']['/logout/'] = function() {
    require_once BASE_PATH . '/app/Controllers/AuthController.php';
    $auth = new App\Controllers\AuthController();
    return $auth->logout();
};
// test
// Simple route pattern (as decided)
$routes['GET']['/dashboard'] = function() {
    $sessionManager = getSessionManager();
    $sessionManager->requireAuth('/auth');
    
    // Route users based on their type
    $userType = $sessionManager->getUserType();
    if ($userType === 'super') {
        // Redirect super users to their superuser page
        redirect('/superuser');
    } else {
        $sessionManager->requireUserType(['standard'], '/auth');
        return view('standarduser/index');
    }
};

$routes['GET']['/dashboard/'] = function() {
    $sessionManager = getSessionManager();
    $sessionManager->requireAuth('/auth');
    
    // Route users based on their type
    $userType = $sessionManager->getUserType();
    if ($userType === 'super') {
        // Redirect super users to their superuser page
        redirect('/superuser');
    } else {
        $sessionManager->requireUserType(['standard'], '/auth');
        return view('standarduser/index');
    }
};

$routes['GET']['/requests'] = function() {
    $sessionManager = getSessionManager();
    $sessionManager->requireAuth('/auth');
    
    // Route super users to super requests, standard users to standard requests
    $userType = $sessionManager->getUserType();
    if ($userType === 'super') {
        return view('superuser/requests');
    } else {
        $sessionManager->requireUserType(['standard'], '/auth');
        return view('standarduser/requests');
    }
};

$routes['GET']['/requests/'] = function() {
    $sessionManager = getSessionManager();
    $sessionManager->requireAuth('/auth');
    
    // Route super users to super requests, standard users to standard requests
    $userType = $sessionManager->getUserType();
    if ($userType === 'super') {
        return view('superuser/requests');
    } else {
        $sessionManager->requireUserType(['standard'], '/auth');
        return view('standarduser/requests');
    }
};

$routes['GET']['/new-request'] = function() {
    $sessionManager = getSessionManager();
    $sessionManager->requireAuth('/auth');
    $sessionManager->requireUserType(['standard'], '/auth');
    return view('standarduser/new-request');
};

$routes['GET']['/new-request/'] = function() {
    $sessionManager = getSessionManager();
    $sessionManager->requireAuth('/auth');
    $sessionManager->requireUserType(['standard'], '/auth');
    return view('standarduser/new-request');
};

// Calendar and admin routes for super users
$routes['GET']['/calendar'] = function() {
    $sessionManager = getSessionManager();
    $sessionManager->requireAuth('/auth');
    $sessionManager->requireUserType(['super'], '/auth');
    return view('superuser/calendar');
};

$routes['GET']['/calendar/'] = function() {
    $sessionManager = getSessionManager();
    $sessionManager->requireAuth('/auth');
    $sessionManager->requireUserType(['super'], '/auth');
    return view('superuser/calendar');
};

$routes['GET']['/students'] = function() {
    $sessionManager = getSessionManager();
    $sessionManager->requireAuth('/auth');
    $sessionManager->requireUserType(['super'], '/auth');
    return view('superuser/students');
};

$routes['GET']['/students/'] = function() {
    $sessionManager = getSessionManager();
    $sessionManager->requireAuth('/auth');
    $sessionManager->requireUserType(['super'], '/auth');
    return view('superuser/students');
};


// Request submission route
$routes['POST']['/api/submit-request'] = function() {
    require_once BASE_PATH . '/app/Controllers/RequestController.php';
    $controller = new App\Controllers\RequestController();
    return $controller->submitRequest();
};

// Return the routes array to be processed by the router
return $routes;

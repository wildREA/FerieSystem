<?php

// Define application routes here

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
        redirect('/students');
    } elseif ($userType === 'standard') {
        redirect('/dashboard');
    } else {
        // Handle other user types or redirect to a default page
        redirect('/auth');
    }
};

// Example routes (normalized without trailing slash)
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

// Logout routes (both GET and POST)
$routes['POST']['/logout'] = function() {
    require_once BASE_PATH . '/app/Controllers/AuthController.php';
    $auth = new App\Controllers\AuthController();
    return $auth->logout();
};

$routes['GET']['/logout'] = function() {
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
        // Redirect super users to their students page
        redirect('/students');
    } else {
        $sessionManager->requireUserType(['standard'], '/auth');
        return view('standarduser/dashboard');
    }
};

$routes['GET']['/requests'] = function() {
    $sessionManager = getSessionManager();
    $sessionManager->requireAuth('/auth');
    
    // Route super users to super requests, standard users to standard requests
    $userType = $sessionManager->getUserType();
    if ($userType === 'super') {
        // Get all requests from database for superuser management
        require_once BASE_PATH . '/app/Controllers/RequestController.php';
        $controller = new App\Controllers\RequestController();
        $requestsData = $controller->getAllRequestsForView();
        
        return view('superuser/requests', [
            'requests' => $requestsData
        ]);
    } else {
        $sessionManager->requireUserType(['standard'], '/auth');
        
        // Get user's requests from database
        require_once BASE_PATH . '/app/Controllers/RequestController.php';
        $controller = new App\Controllers\RequestController();
        $requestsData = $controller->getUserRequestsForView();
        
        // Load helper functions for current user name
        require_once BASE_PATH . '/app/Helpers/UrlHelper.php';
        $userName = function_exists('getCurrentUserName') ? getCurrentUserName() : 'Student';
        
        return view('standarduser/requests', [
            'requests' => $requestsData,
            'userName' => $userName
        ]);
    }
};

$routes['GET']['/new-request'] = function() {
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

$routes['GET']['/students'] = function() {
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

// API route to get user's own requests
$routes['GET']['/api/user-requests'] = function() {
    require_once BASE_PATH . '/app/Controllers/RequestController.php';
    $controller = new App\Controllers\RequestController();
    return $controller->getUserRequests();
};

// API Login route
$routes['POST']['/api/login'] = function() {
    require_once BASE_PATH . '/app/Controllers/AuthController.php';
    $auth = new App\Controllers\AuthController();
    return $auth->login();
};

// API Register route
$routes['POST']['/api/register'] = function() {
    require_once BASE_PATH . '/app/Controllers/AuthController.php';
    $auth = new App\Controllers\AuthController();
    return $auth->register();
};

// Create Super User page route (hidden)
$routes['GET']['/create-superuser'] = function() {
    return view('create_superuser');
};

// API Create Super User route
$routes['POST']['/api/create-superuser'] = function() {
    require_once BASE_PATH . '/app/Controllers/AuthController.php';
    $auth = new App\Controllers\AuthController();
    return $auth->createSuperUser();
};

// API Verify Registration Key route
$routes['POST']['/api/verify-key'] = function() {
    require_once BASE_PATH . '/app/Controllers/AuthController.php';
    $auth = new App\Controllers\AuthController();
    return $auth->verifyRegistrationKey();
};

// Registration key retrieval for super users
$routes['GET']['/api/reg-key'] = function() {
    require_once BASE_PATH . '/app/Controllers/RegKeysController.php';
    $controller = new App\Controllers\RegKeysController();
    $controller->getKeyAPI();
};

// Registration key generation for super users
$routes['POST']['/api/reg-key'] = function() {
    require_once BASE_PATH . '/app/Controllers/RegKeysController.php';
    $controller = new App\Controllers\RegKeysController();
    $controller->generateKeyAPI();
};

// API route to get all requests for superusers
$routes['GET']['/api/requests'] = function() {
    require_once BASE_PATH . '/app/Controllers/RequestController.php';
    $controller = new App\Controllers\RequestController();
    return $controller->getAllRequests();
};

// API route to approve a request (superuser only)
$routes['POST']['/api/requests/approve'] = function() {
    require_once BASE_PATH . '/app/Controllers/RequestController.php';
    $controller = new App\Controllers\RequestController();
    return $controller->approveRequest();
};

// API route to deny a request (superuser only)
$routes['POST']['/api/requests/deny'] = function() {
    require_once BASE_PATH . '/app/Controllers/RequestController.php';
    $controller = new App\Controllers\RequestController();
    return $controller->denyRequest();
};

// Return the routes array to be processed by the router
return $routes;

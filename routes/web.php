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

    if (!$sessionManager->isAuthenticated()) {
        if (!$sessionManager->hasRememberMeToken()) {
            // If no session and no remember me token, redirect to login
            redirect('/auth');
        } else {
            // If remember me token exists, revalidate it
            $sessionManager->revalidateRememberMeToken();
            // Restart session to ensure session ID is valid
            $sessionManager->restartSession();
        }
    }

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

// Legacy/fallback routes for old URL patterns - redirect to simple routes
$routes['GET']['/standarduser'] = function() {
    // Redirect to the simple dashboard route
    redirect('/dashboard');
};

$routes['GET']['/standarduser/'] = function() {
    // Redirect to the simple dashboard route
    redirect('/dashboard');
};

$routes['GET']['/standarduser/requests'] = function() {
    // Redirect to the simple requests route
    redirect('/requests');
};

$routes['GET']['/standarduser/requests/'] = function() {
    // Redirect to the simple requests route
    redirect('/requests');
};

$routes['GET']['/standarduser/new-request'] = function() {
    // Redirect to the simple new-request route
    redirect('/new-request');
};

$routes['GET']['/standarduser/new-request/'] = function() {
    // Redirect to the simple new-request route
    redirect('/new-request');
};

$routes['GET']['/superuser'] = function() {
    // Redirect to the simple requests route (super users see requests by default)
    redirect('/requests');
};

$routes['GET']['/superuser/'] = function() {
    // Redirect to the simple requests route
    redirect('/requests');
};

$routes['GET']['/superuser/requests'] = function() {
    // Redirect to the simple requests route
    redirect('/requests');
};

$routes['GET']['/superuser/requests/'] = function() {
    // Redirect to the simple requests route
    redirect('/requests');
};

$routes['GET']['/superuser/students'] = function() {
    // Redirect to the simple students route
    redirect('/students');
};

$routes['GET']['/superuser/students/'] = function() {
    // Redirect to the simple students route
    redirect('/students');
};

$routes['GET']['/superuser/calendar'] = function() {
    // Redirect to the simple calendar route
    redirect('/calendar');
};

$routes['GET']['/superuser/calendar/'] = function() {
    // Redirect to the simple calendar route
    redirect('/calendar');
};

// Return the routes array to be processed by the router
return $routes;

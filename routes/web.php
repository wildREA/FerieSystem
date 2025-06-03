<?php

/**
 * Web Routes
 * 
 * Here is where you can register web routes for your application.
 */

// Define routes as an array that will be processed by the router
$routes = [];

// Home page
$routes['GET']['/'] = function() {
    return view('home');
};

// Example routes
$routes['GET']['/about'] = function() {
    return view('about');
};

$routes['GET']['/contact'] = function() {
    return view('contact');
};

// Login page
$routes['GET']['/login'] = function() {
    return view('login');
};

// Handle login form submission
$routes['POST']['/login'] = function() {
    // In a real application, you would validate credentials here
    // For now, just redirect to home page
    header('Location: /');
    exit;
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

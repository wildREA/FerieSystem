<?php

/**
 * Routes configuration
 * 
 * This file contains the configuration for the router.
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Route Files
    |--------------------------------------------------------------------------
    |
    | Here you may specify which route files should be loaded by the router.
    | The files are loaded in the order they are defined.
    |
    */
    'files' => [
        __DIR__ . '/../routes/web.php',
        // Add more route files as needed
    ],

    /*
    |--------------------------------------------------------------------------
    | Route Caching
    |--------------------------------------------------------------------------
    |
    | Here you may specify whether route caching should be enabled.
    | Route caching can significantly improve performance in production.
    |
    */
    'cache' => [
        'enabled' => false,
        'path' => __DIR__ . '/../storage/cache/routes.php',
    ],

    /*
    |--------------------------------------------------------------------------
    | Route Middleware
    |--------------------------------------------------------------------------
    |
    | Here you may define the middleware groups that can be applied to routes.
    | Middleware are executed in the order they are defined.
    |
    */
    'middleware' => [
        'web' => [
            // Add middleware for web routes
        ],
        'api' => [
            // Add middleware for API routes
        ],
    ],
];
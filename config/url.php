<?php
/**
 * URL Configuration
 * 
 * Configure URL handling based on server capabilities
 */

return [
    // Set to true if .htaccess is available and working
    'htaccess_available' => false,
    
    // Set to true if you want to use index.php in URLs
    'use_index_php' => true,
    
    // Base URL of your application (leave empty for auto-detection)
    'base_url' => '',
    
    // URL patterns to try when .htaccess is not available
    'url_patterns' => [
        'query_string',  // Using query string (domain.com/index.php?route=/path) - most compatible
        'path_info',     // Using PATH_INFO (domain.com/index.php/route)
        'direct',        // Direct routing through main index.php
    ],
    
    // Current pattern being used
    'active_pattern' => 'query_string',
    
    // Force HTTPS
    'force_https' => false,
    
    // Asset URL configuration
    'assets' => [
        'base_path' => '/public',
        'css_path' => '/public/css',
        'js_path' => '/public/js',
        'img_path' => '/public/assets',
        'cache_duration' => 31536000, // 1 year
        'allowed_extensions' => [
            'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg',
            'woff', 'woff2', 'ttf', 'eot', 'pdf', 'txt'
        ],
    ],
    
    /*
    |--------------------------------------------------------------------------
    | URL Examples for Different Patterns
    |--------------------------------------------------------------------------
    |
    | query_string: https://yoursite.com/index.php?route=/dashboard
    | path_info:    https://yoursite.com/index.php/dashboard
    | direct:       https://yoursite.com/dashboard (requires .htaccess)
    |
    */
];

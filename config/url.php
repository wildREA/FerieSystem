<?php

return [
    'htaccess_available' => false,
    'use_index_php' => true,
    'base_url' => '',
    
    'url_patterns' => [
        'query_string',  // domain.com/index.php?route=/path - most compatible
        'path_info',     // domain.com/index.php/route  
        'direct',        // domain.com/dashboard - requires .htaccess
    ],
    
    'active_pattern' => 'query_string',
    'force_https' => false,
    
    'assets' => [
        'base_path' => '/public',
        'css_path' => '/public/css',
        'js_path' => '/public/js',
        'img_path' => '/public/assets',
        'cache_duration' => 31536000, // 1 year in seconds
        'allowed_extensions' => [
            'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg',
            'woff', 'woff2', 'ttf', 'eot', 'pdf', 'txt'
        ],
    ],
];

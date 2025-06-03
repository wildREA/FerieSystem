<?php

/**
 * Main configuration file
 * 
 * This file contains all the configuration settings for the application.
 * It loads values from the .env file and provides default values when needed.
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Application Settings
    |--------------------------------------------------------------------------
    |
    | These are the core settings for the application.
    |
    */
    'app' => [
        'name' => 'Ferie System',
        'env' => $_ENV['APP_ENV'] ?? 'production',
        'debug' => filter_var($_ENV['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOLEAN),
        'url' => $_ENV['APP_URL'] ?? 'http://localhost',
        'timezone' => 'UTC',
        'locale' => 'en',
        'key' => $_ENV['APP_KEY'] ?? null,
    ],

    /*
    |--------------------------------------------------------------------------
    | Database Settings
    |--------------------------------------------------------------------------
    |
    | Database connection settings.
    |
    */
    'database' => [
        'default' => $_ENV['DB_CONNECTION'] ?? 'mysql',
        'connections' => [
            'mysql' => [
                'driver' => 'mysql',
                'host' => $_ENV['DB_HOST'] ?? '127.0.0.1',
                'port' => $_ENV['DB_PORT'] ?? '3306',
                'database' => $_ENV['DB_DATABASE'] ?? 'ferie_system',
                'username' => $_ENV['DB_USERNAME'] ?? 'root',
                'password' => $_ENV['DB_PASSWORD'] ?? '',
                'charset' => 'utf8mb4',
                'collation' => 'utf8mb4_unicode_ci',
                'prefix' => '',
                'strict' => true,
                'engine' => null,
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging Settings
    |--------------------------------------------------------------------------
    |
    | Configure logging behavior.
    |
    */
    'logging' => [
        'channel' => $_ENV['LOG_CHANNEL'] ?? 'stack',
        'level' => $_ENV['LOG_LEVEL'] ?? 'debug',
        'path' => __DIR__ . '/../storage/logs/app.log',
    ],

    /*
    |--------------------------------------------------------------------------
    | Session Settings
    |--------------------------------------------------------------------------
    |
    | Configure session behavior.
    |
    */
    'session' => [
        'driver' => 'file',
        'lifetime' => 120,
        'path' => __DIR__ . '/../storage/sessions',
        'secure' => false,
        'http_only' => true,
    ],
];
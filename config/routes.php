<?php

return [
    'files' => [
        __DIR__ . '/../routes/web.php',
    ],

    'cache' => [
        'enabled' => false,
        'path' => __DIR__ . '/../storage/cache/routes.php',
    ],

    'middleware' => [
        'web' => [
        ],
        'api' => [
        ],
    ],
];
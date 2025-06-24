<?php
/**
 * Application Entry Point
 * 
 * This file handles routing when .htaccess is not available.
 * It forwards requests to the appropriate handler.
 */

// Get the request URI
$requestUri = $_SERVER['REQUEST_URI'];
$parsedUrl = parse_url($requestUri);
$path = $parsedUrl['path'] ?? '/';

// Get the script directory to handle subdirectory installations
$scriptDir = dirname($_SERVER['SCRIPT_NAME']);
$scriptDir = rtrim($scriptDir, '/');

// Remove script directory from path if present
if (!empty($scriptDir) && strpos($path, $scriptDir) === 0) {
    $path = substr($path, strlen($scriptDir));
}

// Handle static assets from public directory
$publicAssets = [
    '/css', '/js', '/assets', '/favicon.ico', '/robots.txt', '/images'
];

foreach ($publicAssets as $assetPath) {
    if (strpos($path, $assetPath) === 0) {
        // Try multiple possible file locations
        $possiblePaths = [
            __DIR__ . '/public' . $path,  // Standard location
            __DIR__ . $path,              // Direct path
        ];
        
        foreach ($possiblePaths as $filePath) {
            if (file_exists($filePath) && is_file($filePath)) {
                
                // Set appropriate content type
                $extension = pathinfo($filePath, PATHINFO_EXTENSION);
                $contentTypes = [
                    'css' => 'text/css',
                    'js' => 'application/javascript',
                    'png' => 'image/png',
                    'jpg' => 'image/jpeg',
                    'jpeg' => 'image/jpeg',
                    'gif' => 'image/gif',
                    'ico' => 'image/x-icon',
                    'svg' => 'image/svg+xml',
                    'woff' => 'font/woff',
                    'woff2' => 'font/woff2',
                    'ttf' => 'font/ttf',
                    'eot' => 'application/vnd.ms-fontobject',
                    'pdf' => 'application/pdf',
                ];
                
                if (isset($contentTypes[$extension])) {
                    header('Content-Type: ' . $contentTypes[$extension]);
                }
                
                // Set cache headers for assets
                header('Cache-Control: public, max-age=31536000');
                header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
                
                readfile($filePath);
                exit;
            }
        }
        
        // If we get here, the asset wasn't found
        // Return 404 for missing assets
        header("HTTP/1.0 404 Not Found");
        echo "Asset not found: " . htmlspecialchars($path);
        exit;
    }
}

// For all other requests, forward to public/index.php
require_once __DIR__ . '/public/index.php';
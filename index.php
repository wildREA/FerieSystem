<?php
// Application entry point - handles routing when .htaccess is unavailable


$requestUri = $_SERVER['REQUEST_URI'];
$parsedUrl = parse_url($requestUri);
$path = $parsedUrl['path'] ?? '/';

$scriptDir = dirname($_SERVER['SCRIPT_NAME']);
$scriptDir = rtrim($scriptDir, '/');

if (!empty($scriptDir) && strpos($path, $scriptDir) === 0) {
    $path = substr($path, strlen($scriptDir));
}

$publicAssets = [
    '/css', '/js', '/assets', '/favicon.ico', '/robots.txt', '/images'
];

foreach ($publicAssets as $assetPath) {
    if (strpos($path, $assetPath) === 0) {
        $possiblePaths = [
            __DIR__ . '/public' . $path,
            __DIR__ . $path,
        ];
        
        foreach ($possiblePaths as $filePath) {
            if (file_exists($filePath) && is_file($filePath)) {
                
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
                
                header('Cache-Control: public, max-age=31536000');
                header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT'); // 1 year cache
                
                readfile($filePath);
                exit;
            }
        }
        
        header("HTTP/1.0 404 Not Found");
        echo "Asset not found: " . htmlspecialchars($path);
        exit;
    }
}

require_once __DIR__ . '/public/index.php';

<?php

/**
 * URL Helper Functions
 * 
 * Provides functions to generate URLs that work without .htaccess
 */

class UrlHelper 
{
    /**
     * Generate a URL for the given route
     * 
     * @param string $route The route path (e.g., '/dashboard', '/login')
     * @param array $params Additional query parameters
     * @return string The complete URL
     */
    public static function route($route, $params = [])
    {
        // Get the base URL
        $baseUrl = self::getBaseUrl();
        
        // Build the URL manually to avoid encoding the route parameter
        $url = $baseUrl . '/index.php?route=' . $route;
        
        // Add additional parameters if any
        if (!empty($params)) {
            $url .= '&' . http_build_query($params);
        }
        
        return $url;
    }
    
    /**
     * Generate URL for assets (CSS, JS, images)
     * 
     * @param string $asset The asset path relative to public directory
     * @return string The complete asset URL
     */
    public static function asset($asset)
    {
        $baseUrl = self::getBaseUrl();
        
        // Remove leading slash if present
        $asset = ltrim($asset, '/');
        
        return $baseUrl . '/' . $asset;
    }
    
    /**
     * Get the base URL of the application
     * 
     * @return string The base URL
     */
    private static function getBaseUrl()
    {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        
        // Get the directory where index.php is located
        $scriptDir = dirname($_SERVER['SCRIPT_NAME']);
        
        // Remove trailing slash
        $scriptDir = rtrim($scriptDir, '/');
        
        return $protocol . '://' . $host . $scriptDir;
    }
    
    /**
     * Redirect to a route
     * 
     * @param string $route The route to redirect to
     * @param array $params Additional parameters
     */
    public static function redirect($route, $params = [])
    {
        $url = self::route($route, $params);
        header("Location: $url");
        exit;
    }
    
    /**
     * Get current route
     * 
     * @return string Current route
     */
    public static function getCurrentRoute()
    {
        if (isset($_GET['route'])) {
            return $_GET['route'];
        }
        
        if (isset($_SERVER['PATH_INFO'])) {
            return $_SERVER['PATH_INFO'];
        }
        
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $uri = preg_replace('#^/index\.php#', '', $uri);
        
        return empty($uri) ? '/' : $uri;
    }
}

// Global helper functions
if (!function_exists('url')) {
    function url($route, $params = []) {
        return UrlHelper::route($route, $params);
    }
}

if (!function_exists('asset')) {
    function asset($path) {
        return UrlHelper::asset($path);
    }
}

if (!function_exists('redirect')) {
    function redirect($route, $params = []) {
        return UrlHelper::redirect($route, $params);
    }
}

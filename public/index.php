<?php

/**
 * Front Controller
 * 
 * This is the entry point for the application.
 * All requests are directed here by the web server.
 */

// Define the application start time
define('APP_START', microtime(true));

// Define the application base path
define('BASE_PATH', dirname(__DIR__));

// Load the bootstrap file
require_once BASE_PATH . '/bootstrap.php';

// Load the configuration
$config = require_once BASE_PATH . '/config/config.php';

// Set up error handling based on environment
if ($config['app']['debug']) {
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    error_reporting(0);
}

// Simple router implementation
class Router
{
    protected $routes = [];
    protected $config;
    
    public function __construct($config)
    {
        $this->config = $config;
        $this->loadRoutes();
    }
    
    protected function loadRoutes()
    {
        // Load routes from the routes configuration
        $routeFiles = $this->config['routes']['files'] ?? [];
        
        foreach ($routeFiles as $file) {
            if (file_exists($file)) {
                $routes = require_once $file;
                $this->routes = array_merge_recursive($this->routes, $routes);
            }
        }
    }
    
    public function dispatch()
    {
        // Get the request method and URI
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Look for a matching route
        if (isset($this->routes[$method][$uri])) {
            $handler = $this->routes[$method][$uri];
            
            // If the handler is a closure, execute it
            if ($handler instanceof Closure) {
                return $handler();
            }
            
            // If the handler is an array with controller and method, execute it
            if (is_array($handler) && isset($handler['controller']) && isset($handler['method'])) {
                // This is a simplified implementation
                // In a real application, you would instantiate the controller and call the method
                return "Controller: {$handler['controller']}, Method: {$handler['method']}";
            }
        }
        
        // Handle routes with parameters
        foreach ($this->routes[$method] ?? [] as $route => $handler) {
            if (strpos($route, '{') !== false) {
                $pattern = preg_replace('/{[^}]+}/', '([^/]+)', $route);
                $pattern = "#^" . $pattern . "$#";
                
                if (preg_match($pattern, $uri, $matches)) {
                    array_shift($matches); // Remove the full match
                    
                    // If the handler is a closure, execute it with parameters
                    if ($handler instanceof Closure) {
                        return call_user_func_array($handler, $matches);
                    }
                }
            }
        }
        
        // No route found, return 404
        header("HTTP/1.0 404 Not Found");
        return "404 Not Found";
    }
}

// Helper function for views
if (!function_exists('view')) {
    function view($name, $data = [])
    {
        $viewPath = BASE_PATH . '/resources/views/' . $name . '.php';
        
        if (file_exists($viewPath)) {
            // Extract data to make it available in the view
            extract($data);
            
            // Start output buffering
            ob_start();
            
            // Include the view file
            include $viewPath;
            
            // Get the contents of the buffer and clean it
            $content = ob_get_clean();
            
            return $content;
        }
        
        return "View not found: " . $name;
    }
}

// Load the routes configuration
$routesConfig = require_once BASE_PATH . '/config/routes.php';

// Create a new router instance
$router = new Router([
    'routes' => $routesConfig
]);

// Dispatch the request and output the response
echo $router->dispatch();
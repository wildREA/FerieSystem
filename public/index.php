<?php
// Define the application base path
define('BASE_PATH', dirname(__DIR__));

// Load the configuration
$config = require_once BASE_PATH . '/config/config.php';

// Simple router implementation
class Router
{
    protected $routes = [];

    public function __construct($config)
    {
        // Load routes from the routes configuration
        $routeFiles = $config['routes']['files'] ?? [];

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
        
        // Special case for favicon.ico
        if ($uri === '/favicon.ico') {
            $faviconPath = __DIR__ . '/favicon.ico';
            if (file_exists($faviconPath)) {
                header('Content-Type: image/x-icon');
                readfile($faviconPath);
                exit;
            }
        }

        // Look for a matching route
        if (isset($this->routes[$method][$uri])) {
            $handler = $this->routes[$method][$uri];

            // If the handler is a closure, execute it
            if ($handler instanceof Closure) {
                return $handler();
            }

            // If the handler is an array with controller and method, execute it
            if (is_array($handler) && isset($handler['controller']) && isset($handler['method'])) {
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
        $viewPath = BASE_PATH . '/app/Views/' . $name . '.php';

        if (file_exists($viewPath)) {
            extract($data);
            ob_start();
            include $viewPath;
            return ob_get_clean();
        }

        return "View not found: " . $name;
    }
}

// Initialize router and dispatch the request
$router = new Router(['routes' => require_once BASE_PATH . '/config/routes.php']);
echo $router->dispatch();

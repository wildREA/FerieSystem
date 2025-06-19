<?php
/**
 * Authentication Middleware
 * 
 * This middleware handles authentication checks for routes
 */

namespace App\Middleware;

require_once dirname(__DIR__) . '/Core/cookies.php';

class AuthMiddleware
{
    /**
     * Handle the request - check if user is authenticated
     * 
     * @param array $request Request data
     * @param callable $next Next middleware
     * @return mixed
     */
    public function handle($request, $next)
    {
        // Initialize session manager
        $sessionManager = new \SessionManager();
        
        // Check if user is authenticated
        if (!$sessionManager->isAuthenticated()) {
            // Remember the requested URL for redirect after login
            $_SESSION['requested_url'] = $_SERVER['REQUEST_URI'];
            
            // Redirect to login page
            header('Location: /auth.php');
            exit;
        }
        
        // User is authenticated, proceed to next middleware/controller
        return $next($request);
    }
}

/**
 * Role Middleware
 * 
 * This middleware checks if the authenticated user has the required role
 */
class RoleMiddleware
{
    /**
     * @var string|array $roles Allowed roles
     */
    protected $roles;
    
    /**
     * Constructor
     * 
     * @param string|array $roles Allowed roles
     */
    public function __construct($roles)
    {
        $this->roles = is_array($roles) ? $roles : [$roles];
    }
    
    /**
     * Handle the request - check if user has required role
     * 
     * @param array $request Request data
     * @param callable $next Next middleware
     * @return mixed
     */
    public function handle($request, $next)
    {
        // Initialize session manager
        $sessionManager = new \SessionManager();
        
        // Check if user is authenticated
        if (!$sessionManager->isAuthenticated()) {
            // Remember the requested URL for redirect after login
            $_SESSION['requested_url'] = $_SERVER['REQUEST_URI'];
            
            // Redirect to login page
            header('Location: /auth.php');
            exit;
        }
        
        // Get user type
        $userType = $sessionManager->getUserType();
        
        // Check if user has required role
        if (!in_array($userType, $this->roles)) {
            // Redirect based on user type
            $redirectUrl = $userType === 'super' ? '/superuser/' : '/standarduser/';
            header("Location: $redirectUrl");
            exit;
        }
        
        // User has required role, proceed to next middleware/controller
        return $next($request);
    }
}

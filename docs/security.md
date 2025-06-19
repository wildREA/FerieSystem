# Security Implementation Guide

This document outlines the security measures implemented in the FerieSystem application.

## Authentication System

### 1. Session Management

- **Short-lived PHP Sessions**: Standard PHP sessions with secure configuration for immediate authentication
- **Long-lived "Remember Me" Tokens**: Secure tokens stored in cookies and database for persistent authentication
- **Token Security**: All tokens are hashed in the database using SHA-256
- **Session Fixation Protection**: Session IDs are regenerated after login

### 2. Cookie Security

- **HttpOnly Flag**: Prevents JavaScript access to sensitive cookies, protecting against XSS attacks
- **Secure Flag**: Ensures cookies are only sent over HTTPS connections
- **SameSite Policy**: Set to "Strict" to prevent CSRF attacks
- **Expiration**: Short expiration for session cookies, configurable expiration for "Remember Me" tokens

### 3. Database Security

- **Hashed Tokens**: All tokens are hashed before storage
- **Selector/Token Pattern**: Uses the selector/token pattern for "Remember Me" functionality
  - Selector: Used to look up the token record (unique, indexed)
  - Token: Used to verify the authenticity (never stored in plain text)
- **Token Expiration**: All tokens have an expiration date
- **Automatic Cleanup**: Expired tokens are automatically removed

### 4. Authentication Flow

1. **Login Process**:
   - Validate credentials against the database
   - Create a PHP session
   - If "Remember Me" is checked, create a secure token
   - Store the hashed token in the database with expiration
   - Set a cookie with the selector:token

2. **Authentication Check**:
   - Check if a PHP session exists
   - If not, check for a "Remember Me" cookie
   - If cookie exists, verify the token against the database
   - If valid, create a new session
   - If invalid, clear the cookie

3. **Logout Process**:
   - Destroy the PHP session
   - Remove the "Remember Me" token from the database
   - Clear the cookie

## Usage Guidelines

### Securing Routes

Use the provided middleware to secure routes:

```php
// For standard authentication check
$router->add('middleware', new \App\Middleware\AuthMiddleware());

// For role-based access control
$router->add('middleware', new \App\Middleware\RoleMiddleware(['super']));
```

### Database Setup

Run the database initialization script to create the necessary tables:

```bash
php database/init.php
```

### Testing Authentication

Default test users:

- Admin: `admin@example.com` (password: admin123)
- Student: `user@example.com` (password: user123)

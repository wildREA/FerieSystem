<?php
/**
 * Route helper functions
 */

if (!function_exists('redirect')) {
    /**
     * Redirect to a URL
     */
    function redirect($url, $statusCode = 302) {
        header("Location: $url", true, $statusCode);
        exit;
    }
}

if (!function_exists('url')) {
    /**
     * Generate a URL
     */
    function url($path = '') {
        $baseUrl = $_ENV['APP_URL'] ?? 'http://localhost';
        return rtrim($baseUrl, '/') . '/' . ltrim($path, '/');
    }
}

if (!function_exists('asset')) {
    /**
     * Generate an asset URL
     */
    function asset($path) {
        return url('assets/' . ltrim($path, '/'));
    }
}
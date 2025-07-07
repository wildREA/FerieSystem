<?php

/**
 * Language Helper for FerieSystem
 * Provides functions to translate text to Danish
 */

class LanguageHelper {
    private static $translations = null;
    
    /**
     * Load Danish translations
     */
    private static function loadTranslations() {
        if (self::$translations === null) {
            self::$translations = require_once __DIR__ . '/../../config/language_da.php';
        }
        return self::$translations;
    }
    
    /**
     * Get Danish translation for a key
     * @param string $key The translation key
     * @param string $fallback Fallback text if translation not found
     * @return string The translated text
     */
    public static function translate($key, $fallback = null) {
        $translations = self::loadTranslations();
        return $translations[$key] ?? $fallback ?? $key;
    }
    
    /**
     * Alias for translate function
     */
    public static function t($key, $fallback = null) {
        return self::translate($key, $fallback);
    }
}

/**
 * Global helper function for translations
 * @param string $key The translation key
 * @param string $fallback Fallback text if translation not found
 * @return string The translated text
 */
function __($key, $fallback = null) {
    return LanguageHelper::translate($key, $fallback);
}

/**
 * Short alias for translation function
 */
function t($key, $fallback = null) {
    return LanguageHelper::translate($key, $fallback);
}

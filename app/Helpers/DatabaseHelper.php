<?php
namespace App\Helpers;

use PDO;
use PDOException;
use Exception;

/**
 * Trait DatabaseHelper
 * Provides common database operation methods to reduce code duplication
 */
trait DatabaseHelper
{
    /**
     * Execute a database query with prepared statements
     * 
     * @param string $query SQL query with placeholders
     * @param array $params Parameters for prepared statement
     * @param string $errorContext Context for error logging
     * @return false|array False on failure, result array on success
     */
    protected function dbQuery(string $query, array $params = [], string $errorContext = 'Database'): false|array
    {
        if (!$this->db) {
            error_log("{$errorContext}: No database connection available");
            return false;
        }
        
        try {
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("{$errorContext}: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Execute a database query that returns multiple rows
     * 
     * @param string $query SQL query with placeholders
     * @param array $params Parameters for prepared statement
     * @param string $errorContext Context for error logging
     * @return false|array False on failure, result array on success
     */
    protected function dbQueryAll(string $query, array $params = [], string $errorContext = 'Database'): false|array
    {
        if (!$this->db) {
            error_log("{$errorContext}: No database connection available");
            return false;
        }
        
        try {
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("{$errorContext}: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Execute a database action (insert, update, delete)
     * 
     * @param string $query SQL query with placeholders
     * @param array $params Parameters for prepared statement
     * @param string $errorContext Context for error logging
     * @return false|int False on failure, last insert ID or affected rows on success
     */
    protected function dbExecute(string $query, array $params = [], string $errorContext = 'Database'): false|int
    {
        if (!$this->db) {
            error_log("{$errorContext}: No database connection available");
            return false;
        }
        
        try {
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute($params);
            
            if (!$result) {
                error_log("{$errorContext}: Failed to execute query");
                return false;
            }
            
            // For INSERT statements, return last insert ID
            if (stripos($query, 'INSERT') === 0) {
                return (int)$this->db->lastInsertId();
            }
            
            // For other statements, return affected rows
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("{$errorContext}: " . $e->getMessage());
            return false;
        }
    }
}
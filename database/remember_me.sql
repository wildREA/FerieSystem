-- Database schema for remember_me tokens
-- This table stores persistent login tokens for the "Remember Me" functionality

CREATE TABLE IF NOT EXISTS remember_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    selector VARCHAR(255) NOT NULL,
    expires DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_token (selector),
    INDEX idx_expires (expires)
);

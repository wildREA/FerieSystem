-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('standard', 'super') DEFAULT 'standard',
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- Create remember_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS remember_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    selector VARCHAR(255) NOT NULL,
    expires DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_token (selector),
    INDEX idx_expires (expires),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default users if they don't exist
INSERT INTO users (name, email, password, user_type)
VALUES 
    ('Admin User', 'admin@example.com', '$2y$10$8jN1/XBJ4pXNBVL01YdmNuqbJ.CXuqgJAynC2X5dGUXle6lBSFhZK', 'super'),
    ('Student User', 'user@example.com', '$2y$10$lYbpOtqyYZpQCKgzQYch7.PBSJQAXn7q/0HHJmCG1KzEOq.zcSfQK', 'standard')
ON DUPLICATE KEY UPDATE 
    updated_at = CURRENT_TIMESTAMP;

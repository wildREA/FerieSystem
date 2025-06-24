-- Create users table first
CREATE TABLE IF NOT EXISTS users (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    username  VARCHAR(50)   UNIQUE,
    password  CHAR(60)      NOT NULL,      -- store a hashed password (e.g., bcrypt)
    name      VARCHAR(100)  NOT NULL,
    email     VARCHAR(254)  NOT NULL UNIQUE,
    user_type ENUM('standard', 'super') NOT NULL DEFAULT 'standard',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
INSERT IGNORE INTO users (name, email, password, user_type)
VALUES 
    ('Admin User', 'admin@example.com', '$2y$10$8jN1/XBJ4pXNBVL01YdmNuqbJ.CXuqgJAynC2X5dGUXle6lBSFhZK', 'super'),
    ('Student User', 'user@example.com', '$2y$10$lYbpOtqyYZpQCKgzQYch7.PBSJQAXn7q/0HHJmCG1KzEOq.zcSfQK', 'standard');

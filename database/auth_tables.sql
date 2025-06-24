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

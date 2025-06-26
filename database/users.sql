-- Users table
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

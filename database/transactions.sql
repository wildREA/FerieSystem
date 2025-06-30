-- Simple vacation balance transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(5, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- Added type column
    FOREIGN KEY (user_id) REFERENCES users(id)
);
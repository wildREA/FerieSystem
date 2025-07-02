-- Vacation balance transactions table with request linking
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    request_id INT NULL, -- Links to requests table
    date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(5, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'allocation', 'deduction'
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed', -- 'pending', 'confirmed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);




INSERT INTO transactions (user_id, date, description, amount, type, status) VALUES (19, '2024-07-15', 'Vacation day used', 8.00, 'allocation', 'confirmed');
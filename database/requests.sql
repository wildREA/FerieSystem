-- Example SQL requests for FerieSystem

-- Create table for storing requests
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a sample request
INSERT INTO requests (user_id, start_date, end_date, status, reason)
VALUES (1, '2024-07-01', '2024-07-10', 'pending', 'Summer vacation');

-- Update request status
UPDATE requests
SET status = 'approved', updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

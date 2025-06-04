CREATE TABLE ferie_system.ff_balance (
                                         id         SERIAL PRIMARY KEY,                  -- unique entry ID
                                         username   VARCHAR(50) NOT NULL,                -- refers to user
                                         amount     DECIMAL(10, 2) NOT NULL,             -- can be + or -
                                         timestamp  TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- when the change occurred
                                         FOREIGN KEY (username) REFERENCES ferie_system.users(username)
);

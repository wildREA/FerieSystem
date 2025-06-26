-- Standard user registration keys
CREATE TABLE IF NOT EXISTS reg_keys (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL
);

CREATE UNIQUE INDEX idx_reg_keys_key ON reg_keys (key);

-- Standard user registration keys
CREATE TABLE reg_keys {
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
}

CREATE UNIQUE INDEX idx_reg_keys_key ON reg_keys (key);

-- Super user registration keys
CREATE TABLE reg_keys_super {
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
}

CREATE UNIQUE INDEX idx_reg_keys_super_key ON reg_keys_super (key);

-- Creates the table `users` in the `ferie_system` database.
CREATE TABLE ferie_system.users (
    username  VARCHAR(50)   PRIMARY KEY,
    password  CHAR(60)      NOT NULL,      -- store a hashed password (e.g., bcrypt)
    name      VARCHAR(100)  NOT NULL,
    email     VARCHAR(254)  NOT NULL UNIQUE,
    superuser BOOLEAN       NOT NULL DEFAULT FALSE
);

-- Seed a default authority user for the Authority Console login
INSERT INTO authority_credentials (username, password, name)
VALUES ('admin', 'admin123', 'Hospital Authority')
ON CONFLICT (username) DO NOTHING;

ALTER TABLE users
ADD COLUMN password_hash VARCHAR(255);

UPDATE users
SET password_hash = '$2a$10$placeholderplaceholderplaceholderplaceholderplaceh'
WHERE password_hash IS NULL;

ALTER TABLE users
ALTER COLUMN password_hash SET NOT NULL;
ALTER TABLE job_applications
    ADD COLUMN chat_enabled BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE job_applications SET chat_enabled = TRUE
WHERE status IN ('REVIEWING', 'SHORTLISTED', 'ACCEPTED');

CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000 AND length(trim(body)) > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_application_id ON chat_messages(application_id, id DESC);

ALTER TABLE notifications
    ADD COLUMN chat_message_id BIGINT REFERENCES chat_messages(id) ON DELETE CASCADE;

CREATE INDEX idx_notifications_chat_unread ON notifications(recipient_id, chat_message_id)
    WHERE read_at IS NULL AND chat_message_id IS NOT NULL;

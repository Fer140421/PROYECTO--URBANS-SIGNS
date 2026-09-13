-- Apply before starting the new backend when Hibernate schema updates are disabled.
CREATE TABLE IF NOT EXISTS password_recovery (
    user_id BIGINT PRIMARY KEY REFERENCES users(id_user),
    code_hash VARCHAR(64), code_expires_at TIMESTAMP WITH TIME ZONE,
    token_hash VARCHAR(64), token_expires_at TIMESTAMP WITH TIME ZONE,
    next_send_at TIMESTAMP WITH TIME ZONE, attempts INTEGER NOT NULL DEFAULT 0
);

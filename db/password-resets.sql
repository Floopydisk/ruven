CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(token)
);

CREATE INDEX IF NOT EXISTS password_resets_token_idx ON password_resets(token);
CREATE INDEX IF NOT EXISTS password_resets_user_id_idx ON password_resets(user_id);

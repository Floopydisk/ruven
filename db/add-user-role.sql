-- Add role field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Create index on role field
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

-- Create first admin user if none exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin') THEN
    -- Check if any user exists
    IF EXISTS (SELECT 1 FROM users LIMIT 1) THEN
      -- Make the first user an admin
      UPDATE users SET role = 'admin' WHERE id = (SELECT MIN(id) FROM users);
    END IF;
  END IF;
END
$$;

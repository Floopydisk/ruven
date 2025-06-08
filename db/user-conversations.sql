-- Create user_conversations table for user-to-user messaging
CREATE TABLE IF NOT EXISTS user_conversations (
  id SERIAL PRIMARY KEY,
  user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_encrypted BOOLEAN DEFAULT true,
  UNIQUE(user1_id, user2_id)
);

-- Add conversation_type to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_type VARCHAR(20) DEFAULT 'user_vendor';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT true;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS recipient_id INTEGER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_conversations_user1 ON user_conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_user_conversations_user2 ON user_conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_type ON messages(conversation_type);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);

-- Add privacy settings table
CREATE TABLE IF NOT EXISTS user_privacy_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  allow_messages_from_strangers BOOLEAN DEFAULT true,
  allow_vendor_messages BOOLEAN DEFAULT true,
  message_encryption_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

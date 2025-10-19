-- Quick fix for missing conversation_logs table
-- Run this in Supabase SQL Editor if you just want to create the missing table

CREATE TABLE IF NOT EXISTS conversation_logs (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    chat_id VARCHAR(100) NOT NULL,
    chat_type VARCHAR(50) NOT NULL,
    contact_name VARCHAR(255),
    contact_id VARCHAR(100),
    conversation_summary TEXT,
    message_count INTEGER DEFAULT 0,
    flagged_message_count INTEGER DEFAULT 0,
    highest_severity VARCHAR(20) DEFAULT 'safe',
    last_message_date TIMESTAMP WITH TIME ZONE,
    last_flagged_date TIMESTAMP WITH TIME ZONE,
    risk_score DECIMAL(3,2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(child_id, chat_id)
);

-- Enable RLS
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Enable all operations for all users" ON conversation_logs FOR ALL USING (true);

-- Insert sample data
INSERT INTO conversation_logs (child_id, chat_id, chat_type, contact_name, contact_id, conversation_summary, message_count, flagged_message_count, highest_severity, last_message_date, last_flagged_date, risk_score, is_active)
VALUES 
('olivia', '123456789', 'private', 'Alex Smith', '123456789', 'Conversation with Alex Smith containing drug-related content and meeting arrangements', 3, 2, 'high', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes', 0.85, true)
ON CONFLICT (child_id, chat_id) DO NOTHING;

SELECT 'conversation_logs table created successfully!' as status;

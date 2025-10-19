-- Guardian AI Database Setup Script
-- Run this script in your Supabase SQL Editor to create all necessary tables

-- First, let's create the tables if they don't exist
-- This script will create all the tables needed for the Telegram monitoring system

-- Child Profiles Table
CREATE TABLE IF NOT EXISTS child_profiles (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    grade VARCHAR(50),
    school VARCHAR(255),
    telegram_username VARCHAR(255),
    telegram_phone VARCHAR(50),
    parent_email VARCHAR(255) NOT NULL,
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(50),
    timezone VARCHAR(100) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT TRUE,
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monitoring Settings Table
CREATE TABLE IF NOT EXISTS monitoring_settings (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL UNIQUE,
    telegram_monitoring_enabled BOOLEAN DEFAULT TRUE,
    text_analysis_enabled BOOLEAN DEFAULT TRUE,
    image_analysis_enabled BOOLEAN DEFAULT TRUE,
    voice_analysis_enabled BOOLEAN DEFAULT TRUE,
    link_analysis_enabled BOOLEAN DEFAULT TRUE,
    sticker_analysis_enabled BOOLEAN DEFAULT TRUE,
    real_time_alerts BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    email_alerts BOOLEAN DEFAULT TRUE,
    sms_alerts BOOLEAN DEFAULT FALSE,
    confidence_threshold DECIMAL(3,2) DEFAULT 0.7,
    severity_thresholds JSONB DEFAULT '{"high": 0.8, "medium": 0.6, "low": 0.4}',
    monitored_chat_types TEXT[] DEFAULT ARRAY['private', 'group', 'supergroup'],
    blocked_contacts TEXT[] DEFAULT ARRAY[],
    safe_contacts TEXT[] DEFAULT ARRAY[],
    alert_cooldown_minutes INTEGER DEFAULT 5,
    max_daily_alerts INTEGER DEFAULT 50,
    analysis_retention_days INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Telegram Contacts Table
CREATE TABLE IF NOT EXISTS telegram_contacts (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    contact_id VARCHAR(100) NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone_number VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_bot BOOLEAN DEFAULT FALSE,
    is_contact BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE,
    profile_photo_url TEXT,
    bio TEXT,
    mutual_contacts INTEGER DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'unknown',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(child_id, contact_id)
);

-- Telegram Messages Table
CREATE TABLE IF NOT EXISTS telegram_messages (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    message_id VARCHAR(100) NOT NULL,
    chat_id VARCHAR(100) NOT NULL,
    chat_type VARCHAR(50) NOT NULL,
    sender_id VARCHAR(100),
    sender_username VARCHAR(255),
    sender_name VARCHAR(255),
    message_text TEXT,
    message_type VARCHAR(50) DEFAULT 'text',
    reply_to_message_id VARCHAR(100),
    forward_from_chat_id VARCHAR(100),
    forward_from_message_id VARCHAR(100),
    forward_date TIMESTAMP WITH TIME ZONE,
    edit_date TIMESTAMP WITH TIME ZONE,
    message_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_outgoing BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    reactions_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    media_group_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(child_id, message_id)
);

-- AI Analysis Results Table
CREATE TABLE IF NOT EXISTS ai_analysis_results (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    message_id VARCHAR(100) NOT NULL,
    analysis_type VARCHAR(50) NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    analysis_data JSONB NOT NULL,
    severity VARCHAR(20) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    flagged_phrases TEXT[],
    flagged_categories TEXT[],
    contextual_patterns TEXT[],
    risk_factors TEXT[],
    processing_time_ms INTEGER,
    ai_model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flagged Content Table
CREATE TABLE IF NOT EXISTS flagged_content (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    message_id VARCHAR(100) NOT NULL,
    chat_id VARCHAR(100) NOT NULL,
    chat_type VARCHAR(50) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    content_data TEXT,
    severity VARCHAR(20) NOT NULL,
    flagged_phrases TEXT[],
    flagged_categories TEXT[],
    confidence DECIMAL(3,2) NOT NULL,
    analysis_reasons TEXT[],
    contextual_indicators TEXT[],
    is_reviewed BOOLEAN DEFAULT FALSE,
    review_notes TEXT,
    review_status VARCHAR(50) DEFAULT 'pending',
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time Alerts Table
CREATE TABLE IF NOT EXISTS real_time_alerts (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message_id VARCHAR(100),
    chat_id VARCHAR(100),
    chat_type VARCHAR(50),
    contact_id VARCHAR(100),
    contact_name VARCHAR(255),
    alert_title VARCHAR(255) NOT NULL,
    alert_message TEXT NOT NULL,
    flagged_content TEXT,
    confidence DECIMAL(3,2) NOT NULL,
    risk_factors TEXT[],
    is_read BOOLEAN DEFAULT FALSE,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    is_escalated BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    parent_notified BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation Logs Table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_telegram_messages_child_id ON telegram_messages(child_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_chat_id ON telegram_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_date ON telegram_messages(message_date);
CREATE INDEX IF NOT EXISTS idx_telegram_contacts_child_id ON telegram_contacts(child_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_child_id ON ai_analysis_results(child_id);
CREATE INDEX IF NOT EXISTS idx_flagged_content_child_id ON flagged_content(child_id);
CREATE INDEX IF NOT EXISTS idx_real_time_alerts_child_id ON real_time_alerts(child_id);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_child_id ON conversation_logs(child_id);

-- Insert sample data
INSERT INTO child_profiles (child_id, name, age, grade, school, telegram_username, parent_email) 
VALUES ('olivia', 'Olivia Johnson', 15, '10th Grade', 'Lincoln High School', '@olivia_j', 'parent@example.com')
ON CONFLICT (child_id) DO NOTHING;

INSERT INTO monitoring_settings (child_id, telegram_monitoring_enabled, text_analysis_enabled, image_analysis_enabled, voice_analysis_enabled, link_analysis_enabled, real_time_alerts)
VALUES ('olivia', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (child_id) DO NOTHING;

INSERT INTO telegram_contacts (child_id, contact_id, username, first_name, last_name, risk_level, is_contact)
VALUES 
('olivia', '123456789', '@alex_smith', 'Alex', 'Smith', 'medium', true),
('olivia', '987654321', '@unknown_user', 'Unknown', 'User', 'high', false)
ON CONFLICT (child_id, contact_id) DO NOTHING;

INSERT INTO telegram_messages (child_id, message_id, chat_id, chat_type, sender_id, sender_username, sender_name, message_text, message_type, message_date, is_outgoing)
VALUES 
('olivia', 'msg001', '123456789', 'private', '123456789', '@alex_smith', 'Alex Smith', 'Hey Olivia, want to smoke some greens tonight? I got some bud', 'text', NOW() - INTERVAL '2 hours', false),
('olivia', 'msg002', '123456789', 'private', 'olivia', '@olivia_j', 'Olivia Johnson', 'Sure, where should we meet?', 'text', NOW() - INTERVAL '1 hour', true),
('olivia', 'msg003', '123456789', 'private', '123456789', '@alex_smith', 'Alex Smith', 'Come over to my place, I have a bong ready', 'text', NOW() - INTERVAL '30 minutes', false)
ON CONFLICT (child_id, message_id) DO NOTHING;

INSERT INTO ai_analysis_results (child_id, message_id, analysis_type, content_hash, analysis_data, severity, confidence, flagged_phrases, flagged_categories, contextual_patterns, risk_factors)
VALUES 
('olivia', 'msg001', 'text', 'hash001', '{"flagged": true, "reasons": ["marijuana smoking context", "late night drug activity context"]}', 'medium', 0.85, ARRAY['greens', 'smoke', 'bud'], ARRAY['drugs'], ARRAY['marijuana smoking context', 'late night drug activity context'], ARRAY['drug_use', 'peer_pressure']),
('olivia', 'msg003', 'text', 'hash003', '{"flagged": true, "reasons": ["marijuana smoking context", "home meeting context"]}', 'high', 0.90, ARRAY['bong', 'place'], ARRAY['drugs', 'personal_info'], ARRAY['marijuana smoking context', 'home meeting context'], ARRAY['drug_use', 'home_meeting', 'paraphernalia'])
ON CONFLICT DO NOTHING;

INSERT INTO flagged_content (child_id, message_id, chat_id, chat_type, content_type, content_data, severity, flagged_phrases, flagged_categories, confidence, analysis_reasons, contextual_indicators)
VALUES 
('olivia', 'msg001', '123456789', 'private', 'text', 'Hey Olivia, want to smoke some greens tonight? I got some bud', 'medium', ARRAY['greens', 'smoke', 'bud'], ARRAY['drugs'], 0.85, ARRAY['marijuana smoking context', 'late night drug activity context'], ARRAY['drug_slang', 'smoking_reference', 'time_context']),
('olivia', 'msg003', '123456789', 'private', 'text', 'Come over to my place, I have a bong ready', 'high', ARRAY['bong', 'place'], ARRAY['drugs', 'personal_info'], 0.90, ARRAY['marijuana smoking context', 'home meeting context'], ARRAY['drug_paraphernalia', 'home_meeting', 'high_risk'])
ON CONFLICT DO NOTHING;

INSERT INTO real_time_alerts (child_id, alert_type, severity, message_id, chat_id, chat_type, contact_id, contact_name, alert_title, alert_message, flagged_content, confidence, risk_factors)
VALUES 
('olivia', 'content_flag', 'medium', 'msg001', '123456789', 'private', '123456789', 'Alex Smith', 'Drug Slang Detected', 'Marijuana-related language detected in conversation with Alex Smith', 'Hey Olivia, want to smoke some greens tonight? I got some bud', 0.85, ARRAY['drug_use', 'peer_pressure']),
('olivia', 'content_flag', 'high', 'msg003', '123456789', 'private', '123456789', 'Alex Smith', 'High-Risk Drug Content', 'Drug paraphernalia and home meeting context detected', 'Come over to my place, I have a bong ready', 0.90, ARRAY['drug_use', 'home_meeting', 'paraphernalia'])
ON CONFLICT DO NOTHING;

INSERT INTO conversation_logs (child_id, chat_id, chat_type, contact_name, contact_id, conversation_summary, message_count, flagged_message_count, highest_severity, last_message_date, last_flagged_date, risk_score, is_active)
VALUES 
('olivia', '123456789', 'private', 'Alex Smith', '123456789', 'Conversation with Alex Smith containing drug-related content and meeting arrangements', 3, 2, 'high', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes', 0.85, true)
ON CONFLICT (child_id, chat_id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE flagged_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_time_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for development)
CREATE POLICY "Enable all operations for all users" ON child_profiles FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON monitoring_settings FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON telegram_contacts FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON telegram_messages FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON ai_analysis_results FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON flagged_content FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON real_time_alerts FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON conversation_logs FOR ALL USING (true);

-- Success message
SELECT 'Database setup completed successfully! All tables created and sample data inserted.' as status;

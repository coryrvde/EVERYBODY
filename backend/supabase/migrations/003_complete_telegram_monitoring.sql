-- Guardian AI - Complete Telegram Monitoring Database Schema
-- This schema is specifically designed for comprehensive Telegram monitoring

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS telegram_messages CASCADE;
DROP TABLE IF EXISTS telegram_contacts CASCADE;
DROP TABLE IF EXISTS telegram_groups CASCADE;
DROP TABLE IF EXISTS telegram_channels CASCADE;
DROP TABLE IF EXISTS telegram_media CASCADE;
DROP TABLE IF EXISTS ai_analysis_results CASCADE;
DROP TABLE IF EXISTS flagged_content CASCADE;
DROP TABLE IF EXISTS real_time_alerts CASCADE;
DROP TABLE IF EXISTS conversation_logs CASCADE;
DROP TABLE IF EXISTS monitoring_settings CASCADE;
DROP TABLE IF EXISTS child_profiles CASCADE;
DROP TABLE IF EXISTS parent_accounts CASCADE;
DROP TABLE IF EXISTS parent_child_relationships CASCADE;
DROP TABLE IF EXISTS telegram_sessions CASCADE;
DROP TABLE IF EXISTS telegram_forwarded_messages CASCADE;
DROP TABLE IF EXISTS telegram_reactions CASCADE;
DROP TABLE IF EXISTS telegram_voice_messages CASCADE;
DROP TABLE IF EXISTS telegram_stickers CASCADE;
DROP TABLE IF EXISTS telegram_links CASCADE;

-- Telegram Contacts Table
CREATE TABLE telegram_contacts (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    contact_id VARCHAR(100) NOT NULL, -- Telegram user ID
    username VARCHAR(255), -- @username
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone_number VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_bot BOOLEAN DEFAULT FALSE,
    is_contact BOOLEAN DEFAULT FALSE, -- Is in child's contacts
    is_blocked BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE,
    profile_photo_url TEXT,
    bio TEXT,
    mutual_contacts INTEGER DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'unknown', -- 'low', 'medium', 'high', 'unknown'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(child_id, contact_id)
);

-- Telegram Groups Table
CREATE TABLE telegram_groups (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    group_id VARCHAR(100) NOT NULL, -- Telegram group ID
    group_name VARCHAR(255) NOT NULL,
    group_type VARCHAR(50) DEFAULT 'group', -- 'group', 'supergroup', 'megagroup'
    description TEXT,
    member_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    invite_link TEXT,
    group_photo_url TEXT,
    admin_count INTEGER DEFAULT 0,
    is_child_admin BOOLEAN DEFAULT FALSE,
    is_child_member BOOLEAN DEFAULT TRUE,
    risk_level VARCHAR(20) DEFAULT 'unknown',
    last_activity TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(child_id, group_id)
);

-- Telegram Channels Table
CREATE TABLE telegram_channels (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    channel_id VARCHAR(100) NOT NULL, -- Telegram channel ID
    channel_name VARCHAR(255) NOT NULL,
    channel_type VARCHAR(50) DEFAULT 'channel', -- 'channel', 'broadcast'
    description TEXT,
    subscriber_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    invite_link TEXT,
    channel_photo_url TEXT,
    is_child_subscriber BOOLEAN DEFAULT TRUE,
    risk_level VARCHAR(20) DEFAULT 'unknown',
    last_post TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(child_id, channel_id)
);

-- Telegram Messages Table (Main conversation data)
CREATE TABLE telegram_messages (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    message_id VARCHAR(100) NOT NULL, -- Telegram message ID
    chat_id VARCHAR(100) NOT NULL, -- Can be user ID, group ID, or channel ID
    chat_type VARCHAR(50) NOT NULL, -- 'private', 'group', 'supergroup', 'channel'
    sender_id VARCHAR(100), -- NULL for child's own messages
    sender_username VARCHAR(255),
    sender_name VARCHAR(255),
    message_text TEXT,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'photo', 'video', 'voice', 'sticker', 'document', 'location', 'contact', 'poll'
    reply_to_message_id VARCHAR(100),
    forward_from_chat_id VARCHAR(100),
    forward_from_message_id VARCHAR(100),
    forward_date TIMESTAMP WITH TIME ZONE,
    edit_date TIMESTAMP WITH TIME ZONE,
    message_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_outgoing BOOLEAN DEFAULT FALSE, -- TRUE if sent by child
    is_deleted BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    reactions_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    media_group_id VARCHAR(100), -- For grouped media
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(child_id, message_id)
);

-- Telegram Media Table (Photos, videos, documents, etc.)
CREATE TABLE telegram_media (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    message_id VARCHAR(100) NOT NULL,
    media_type VARCHAR(50) NOT NULL, -- 'photo', 'video', 'voice', 'document', 'sticker', 'animation', 'audio'
    file_id VARCHAR(255) NOT NULL,
    file_unique_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    duration INTEGER, -- For video/audio/voice
    width INTEGER, -- For photos/videos
    height INTEGER, -- For photos/videos
    thumbnail_url TEXT,
    file_url TEXT,
    caption TEXT,
    is_analyzed BOOLEAN DEFAULT FALSE,
    analysis_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (child_id, message_id) REFERENCES telegram_messages(child_id, message_id) ON DELETE CASCADE
);

-- Telegram Voice Messages Table
CREATE TABLE telegram_voice_messages (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    message_id VARCHAR(100) NOT NULL,
    file_id VARCHAR(255) NOT NULL,
    file_unique_id VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    waveform BYTEA, -- Audio waveform data
    transcription TEXT, -- AI-generated transcription
    is_transcribed BOOLEAN DEFAULT FALSE,
    transcription_confidence DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (child_id, message_id) REFERENCES telegram_messages(child_id, message_id) ON DELETE CASCADE
);

-- Telegram Stickers Table
CREATE TABLE telegram_stickers (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    message_id VARCHAR(100) NOT NULL,
    sticker_id VARCHAR(255) NOT NULL,
    sticker_set_name VARCHAR(255),
    emoji VARCHAR(10),
    file_id VARCHAR(255) NOT NULL,
    file_unique_id VARCHAR(255) NOT NULL,
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    is_animated BOOLEAN DEFAULT FALSE,
    is_video BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (child_id, message_id) REFERENCES telegram_messages(child_id, message_id) ON DELETE CASCADE
);

-- Telegram Links Table (URLs shared in messages)
CREATE TABLE telegram_links (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    message_id VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    domain VARCHAR(255),
    title TEXT,
    description TEXT,
    preview_image_url TEXT,
    is_safe BOOLEAN DEFAULT NULL, -- NULL = unknown, TRUE = safe, FALSE = unsafe
    safety_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (child_id, message_id) REFERENCES telegram_messages(child_id, message_id) ON DELETE CASCADE
);

-- Telegram Forwarded Messages Table
CREATE TABLE telegram_forwarded_messages (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    original_message_id VARCHAR(100) NOT NULL,
    forwarded_message_id VARCHAR(100) NOT NULL,
    forward_from_chat_id VARCHAR(100) NOT NULL,
    forward_from_message_id VARCHAR(100) NOT NULL,
    forward_date TIMESTAMP WITH TIME ZONE NOT NULL,
    forward_signature TEXT, -- Channel signature for forwarded messages
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (child_id, forwarded_message_id) REFERENCES telegram_messages(child_id, message_id) ON DELETE CASCADE
);

-- Telegram Reactions Table
CREATE TABLE telegram_reactions (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    message_id VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    count INTEGER DEFAULT 1,
    users TEXT[], -- Array of user IDs who reacted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (child_id, message_id) REFERENCES telegram_messages(child_id, message_id) ON DELETE CASCADE
);

-- Telegram Sessions Table (Active sessions/devices)
CREATE TABLE telegram_sessions (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    device_model VARCHAR(255),
    app_version VARCHAR(50),
    platform VARCHAR(50), -- 'android', 'ios', 'desktop', 'web'
    ip_address INET,
    country VARCHAR(100),
    city VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(child_id, session_id)
);

-- AI Analysis Results Table (Comprehensive AI analysis)
CREATE TABLE ai_analysis_results (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    message_id VARCHAR(100) NOT NULL,
    analysis_type VARCHAR(50) NOT NULL, -- 'text', 'image', 'voice', 'link', 'context'
    content_hash VARCHAR(64) NOT NULL, -- Hash for deduplication
    analysis_data JSONB NOT NULL, -- Full analysis result
    severity VARCHAR(20) NOT NULL, -- 'high', 'medium', 'low', 'safe'
    confidence DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    flagged_phrases TEXT[],
    flagged_categories TEXT[], -- 'drugs', 'violence', 'sexual', 'bullying', 'personal_info'
    contextual_patterns TEXT[],
    risk_factors TEXT[],
    processing_time_ms INTEGER,
    ai_model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (child_id, message_id) REFERENCES telegram_messages(child_id, message_id) ON DELETE CASCADE
);

-- Flagged Content Table (Content that triggered alerts)
CREATE TABLE flagged_content (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    message_id VARCHAR(100) NOT NULL,
    chat_id VARCHAR(100) NOT NULL,
    chat_type VARCHAR(50) NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'text', 'image', 'voice', 'link', 'sticker'
    content_data TEXT,
    severity VARCHAR(20) NOT NULL,
    flagged_phrases TEXT[],
    flagged_categories TEXT[],
    confidence DECIMAL(3,2) NOT NULL,
    analysis_reasons TEXT[],
    contextual_indicators TEXT[],
    is_reviewed BOOLEAN DEFAULT FALSE,
    review_notes TEXT,
    review_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'false_positive', 'escalated'
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (child_id, message_id) REFERENCES telegram_messages(child_id, message_id) ON DELETE CASCADE
);

-- Real-time Alerts Table
CREATE TABLE real_time_alerts (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- 'content_flag', 'suspicious_contact', 'dangerous_link', 'voice_analysis', 'context_pattern'
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

-- Conversation Logs Table (Summary of conversations)
CREATE TABLE conversation_logs (
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
    risk_score DECIMAL(3,2) DEFAULT 0.0, -- Overall risk score for this conversation
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(child_id, chat_id)
);

-- Monitoring Settings Table
CREATE TABLE monitoring_settings (
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

-- Child Profiles Table
CREATE TABLE child_profiles (
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

-- Parent Accounts Table
CREATE TABLE parent_accounts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parent-Child Relationships Table
CREATE TABLE parent_child_relationships (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES parent_accounts(id) ON DELETE CASCADE,
    child_id VARCHAR(50) NOT NULL,
    relationship_type VARCHAR(50) DEFAULT 'parent', -- 'parent', 'guardian', 'relative'
    is_primary BOOLEAN DEFAULT FALSE,
    access_level VARCHAR(50) DEFAULT 'full', -- 'full', 'limited', 'emergency_only'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_telegram_messages_child_id ON telegram_messages(child_id);
CREATE INDEX idx_telegram_messages_chat_id ON telegram_messages(chat_id);
CREATE INDEX idx_telegram_messages_date ON telegram_messages(message_date);
CREATE INDEX idx_telegram_messages_sender ON telegram_messages(sender_id);
CREATE INDEX idx_telegram_messages_type ON telegram_messages(message_type);
CREATE INDEX idx_telegram_messages_outgoing ON telegram_messages(is_outgoing);

CREATE INDEX idx_telegram_contacts_child_id ON telegram_contacts(child_id);
CREATE INDEX idx_telegram_contacts_risk_level ON telegram_contacts(risk_level);
CREATE INDEX idx_telegram_contacts_username ON telegram_contacts(username);

CREATE INDEX idx_telegram_groups_child_id ON telegram_groups(child_id);
CREATE INDEX idx_telegram_groups_risk_level ON telegram_groups(risk_level);

CREATE INDEX idx_telegram_channels_child_id ON telegram_channels(child_id);
CREATE INDEX idx_telegram_channels_risk_level ON telegram_channels(risk_level);

CREATE INDEX idx_ai_analysis_results_child_id ON ai_analysis_results(child_id);
CREATE INDEX idx_ai_analysis_results_severity ON ai_analysis_results(severity);
CREATE INDEX idx_ai_analysis_results_confidence ON ai_analysis_results(confidence);
CREATE INDEX idx_ai_analysis_results_date ON ai_analysis_results(created_at);

CREATE INDEX idx_flagged_content_child_id ON flagged_content(child_id);
CREATE INDEX idx_flagged_content_severity ON flagged_content(severity);
CREATE INDEX idx_flagged_content_review_status ON flagged_content(review_status);
CREATE INDEX idx_flagged_content_date ON flagged_content(created_at);

CREATE INDEX idx_real_time_alerts_child_id ON real_time_alerts(child_id);
CREATE INDEX idx_real_time_alerts_severity ON real_time_alerts(severity);
CREATE INDEX idx_real_time_alerts_read ON real_time_alerts(is_read);
CREATE INDEX idx_real_time_alerts_date ON real_time_alerts(created_at);

CREATE INDEX idx_conversation_logs_child_id ON conversation_logs(child_id);
CREATE INDEX idx_conversation_logs_risk_score ON conversation_logs(risk_score);
CREATE INDEX idx_conversation_logs_active ON conversation_logs(is_active);

-- Row Level Security (RLS) policies
ALTER TABLE telegram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE flagged_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_time_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_child_relationships ENABLE ROW LEVEL SECURITY;

-- Sample data for testing
INSERT INTO child_profiles (child_id, name, age, grade, school, telegram_username, parent_email) 
VALUES ('olivia', 'Olivia Johnson', 15, '10th Grade', 'Lincoln High School', '@olivia_j', 'parent@example.com')
ON CONFLICT (child_id) DO NOTHING;

INSERT INTO monitoring_settings (child_id, telegram_monitoring_enabled, text_analysis_enabled, image_analysis_enabled, voice_analysis_enabled, link_analysis_enabled, real_time_alerts)
VALUES ('olivia', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (child_id) DO NOTHING;

-- Sample Telegram contacts
INSERT INTO telegram_contacts (child_id, contact_id, username, first_name, last_name, risk_level, is_contact)
VALUES 
('olivia', '123456789', '@alex_smith', 'Alex', 'Smith', 'medium', true),
('olivia', '987654321', '@unknown_user', 'Unknown', 'User', 'high', false),
('olivia', '555666777', '@sarah_jones', 'Sarah', 'Jones', 'low', true)
ON CONFLICT (child_id, contact_id) DO NOTHING;

-- Sample Telegram groups
INSERT INTO telegram_groups (child_id, group_id, group_name, group_type, member_count, risk_level, is_child_member)
VALUES 
('olivia', 'g123456789', 'School Friends', 'group', 15, 'low', true),
('olivia', 'g987654321', 'Random Chat', 'supergroup', 250, 'medium', true)
ON CONFLICT (child_id, group_id) DO NOTHING;

-- Sample Telegram messages with drug slang detection
INSERT INTO telegram_messages (child_id, message_id, chat_id, chat_type, sender_id, sender_username, sender_name, message_text, message_type, message_date, is_outgoing)
VALUES 
('olivia', 'msg001', '123456789', 'private', '123456789', '@alex_smith', 'Alex Smith', 'Hey Olivia, want to smoke some greens tonight? I got some bud', 'text', NOW() - INTERVAL '2 hours', false),
('olivia', 'msg002', '123456789', 'private', 'olivia', '@olivia_j', 'Olivia Johnson', 'Sure, where should we meet?', 'text', NOW() - INTERVAL '1 hour', true),
('olivia', 'msg003', '123456789', 'private', '123456789', '@alex_smith', 'Alex Smith', 'Come over to my place, I have a bong ready', 'text', NOW() - INTERVAL '30 minutes', false),
('olivia', 'msg004', 'g123456789', 'group', '555666777', '@sarah_jones', 'Sarah Jones', 'Hey everyone, how was your weekend?', 'text', NOW() - INTERVAL '3 hours', false),
('olivia', 'msg005', '987654321', 'private', '987654321', '@unknown_user', 'Unknown User', 'Send me some photos', 'text', NOW() - INTERVAL '4 hours', false)
ON CONFLICT (child_id, message_id) DO NOTHING;

-- Sample AI analysis results
INSERT INTO ai_analysis_results (child_id, message_id, analysis_type, content_hash, analysis_data, severity, confidence, flagged_phrases, flagged_categories, contextual_patterns, risk_factors)
VALUES 
('olivia', 'msg001', 'text', 'hash001', '{"flagged": true, "reasons": ["marijuana smoking context", "late night drug activity context"]}', 'medium', 0.85, ARRAY['greens', 'smoke', 'bud'], ARRAY['drugs'], ARRAY['marijuana smoking context', 'late night drug activity context'], ARRAY['drug_use', 'peer_pressure']),
('olivia', 'msg002', 'text', 'hash002', '{"flagged": true, "reasons": ["meeting context"]}', 'medium', 0.70, ARRAY['meet'], ARRAY['personal_info'], ARRAY['meeting context'], ARRAY['meeting_alone']),
('olivia', 'msg003', 'text', 'hash003', '{"flagged": true, "reasons": ["marijuana smoking context", "home meeting context"]}', 'high', 0.90, ARRAY['bong', 'place'], ARRAY['drugs', 'personal_info'], ARRAY['marijuana smoking context', 'home meeting context'], ARRAY['drug_use', 'home_meeting', 'paraphernalia']),
('olivia', 'msg005', 'text', 'hash005', '{"flagged": true, "reasons": ["photo request"]}', 'high', 0.95, ARRAY['send', 'photos'], ARRAY['inappropriate_requests'], ARRAY['photo request'], ARRAY['photo_request', 'stranger_danger'])
ON CONFLICT DO NOTHING;

-- Sample flagged content
INSERT INTO flagged_content (child_id, message_id, chat_id, chat_type, content_type, content_data, severity, flagged_phrases, flagged_categories, confidence, analysis_reasons, contextual_indicators)
VALUES 
('olivia', 'msg001', '123456789', 'private', 'text', 'Hey Olivia, want to smoke some greens tonight? I got some bud', 'medium', ARRAY['greens', 'smoke', 'bud'], ARRAY['drugs'], 0.85, ARRAY['marijuana smoking context', 'late night drug activity context'], ARRAY['drug_slang', 'smoking_reference', 'time_context']),
('olivia', 'msg003', '123456789', 'private', 'text', 'Come over to my place, I have a bong ready', 'high', ARRAY['bong', 'place'], ARRAY['drugs', 'personal_info'], 0.90, ARRAY['marijuana smoking context', 'home meeting context'], ARRAY['drug_paraphernalia', 'home_meeting', 'high_risk']),
('olivia', 'msg005', '987654321', 'private', 'text', 'Send me some photos', 'high', ARRAY['send', 'photos'], ARRAY['inappropriate_requests'], 0.95, ARRAY['photo request'], ARRAY['photo_request', 'stranger_danger'])
ON CONFLICT DO NOTHING;

-- Sample real-time alerts
INSERT INTO real_time_alerts (child_id, alert_type, severity, message_id, chat_id, chat_type, contact_id, contact_name, alert_title, alert_message, flagged_content, confidence, risk_factors)
VALUES 
('olivia', 'content_flag', 'medium', 'msg001', '123456789', 'private', '123456789', 'Alex Smith', 'Drug Slang Detected', 'Marijuana-related language detected in conversation with Alex Smith', 'Hey Olivia, want to smoke some greens tonight? I got some bud', 0.85, ARRAY['drug_use', 'peer_pressure']),
('olivia', 'content_flag', 'high', 'msg003', '123456789', 'private', '123456789', 'Alex Smith', 'High-Risk Drug Content', 'Drug paraphernalia and home meeting context detected', 'Come over to my place, I have a bong ready', 0.90, ARRAY['drug_use', 'home_meeting', 'paraphernalia']),
('olivia', 'content_flag', 'high', 'msg005', '987654321', 'private', '987654321', 'Unknown User', 'Inappropriate Photo Request', 'Stranger requesting photos from child', 'Send me some photos', 0.95, ARRAY['photo_request', 'stranger_danger'])
ON CONFLICT DO NOTHING;

-- Sample conversation logs
INSERT INTO conversation_logs (child_id, chat_id, chat_type, contact_name, contact_id, conversation_summary, message_count, flagged_message_count, highest_severity, last_message_date, last_flagged_date, risk_score, is_active)
VALUES 
('olivia', '123456789', 'private', 'Alex Smith', '123456789', 'Conversation with Alex Smith containing drug-related content and meeting arrangements', 3, 2, 'high', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes', 0.85, true),
('olivia', '987654321', 'private', 'Unknown User', '987654321', 'Conversation with unknown contact requesting inappropriate content', 1, 1, 'high', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours', 0.95, true),
('olivia', 'g123456789', 'group', 'School Friends', 'g123456789', 'Group chat with school friends - generally safe content', 1, 0, 'safe', NOW() - INTERVAL '3 hours', NULL, 0.10, true)
ON CONFLICT (child_id, chat_id) DO NOTHING;

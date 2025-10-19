-- Guardian AI Database Schema
-- This file contains the database tables needed for the AI monitoring system

-- Table for storing monitored messages from various apps
CREATE TABLE IF NOT EXISTS monitored_messages (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    app_name VARCHAR(100) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'video', 'audio'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_analyzed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing flagged content detected by AI
CREATE TABLE IF NOT EXISTS flagged_content (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    app_name VARCHAR(100) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'text', 'image', 'video', 'audio'
    content_data TEXT,
    severity VARCHAR(20) NOT NULL, -- 'high', 'medium', 'low'
    flagged_phrases TEXT[], -- Array of flagged phrases
    confidence DECIMAL(3,2) DEFAULT 0.0, -- Confidence score 0.00 to 1.00
    analysis_reasons TEXT[], -- Array of analysis reasons
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing real-time alerts
CREATE TABLE IF NOT EXISTS real_time_alerts (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- 'content_flag', 'suspicious_activity', 'emergency'
    severity VARCHAR(20) NOT NULL, -- 'high', 'medium', 'low'
    app_name VARCHAR(100) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    flagged_content TEXT NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 0.0,
    is_read BOOLEAN DEFAULT FALSE,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing conversation logs
CREATE TABLE IF NOT EXISTS conversation_logs (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    app_name VARCHAR(100) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'high', 'medium', 'low'
    flagged_content TEXT,
    confidence DECIMAL(3,2) DEFAULT 0.0,
    message_count INTEGER DEFAULT 1,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing monitoring settings
CREATE TABLE IF NOT EXISTS monitoring_settings (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT TRUE,
    text_monitoring BOOLEAN DEFAULT TRUE,
    image_monitoring BOOLEAN DEFAULT TRUE,
    real_time_alerts BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    email_alerts BOOLEAN DEFAULT TRUE,
    confidence_threshold DECIMAL(3,2) DEFAULT 0.7,
    severity_thresholds JSONB DEFAULT '{"high": 0.8, "medium": 0.6, "low": 0.4}',
    monitored_apps TEXT[] DEFAULT ARRAY['WhatsApp', 'Telegram', 'Instagram', 'Snapchat', 'TikTok', 'Discord'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing AI analysis history
CREATE TABLE IF NOT EXISTS ai_analysis_history (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    content_hash VARCHAR(64) NOT NULL, -- Hash of the content for deduplication
    content_type VARCHAR(50) NOT NULL, -- 'text', 'image', 'video', 'audio'
    analysis_result JSONB NOT NULL, -- Full analysis result
    processing_time_ms INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing child profiles
CREATE TABLE IF NOT EXISTS child_profiles (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    grade VARCHAR(50),
    school VARCHAR(255),
    parent_email VARCHAR(255) NOT NULL,
    emergency_contact VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing parent accounts
CREATE TABLE IF NOT EXISTS parent_accounts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing parent-child relationships
CREATE TABLE IF NOT EXISTS parent_child_relationships (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES parent_accounts(id) ON DELETE CASCADE,
    child_id VARCHAR(50) NOT NULL,
    relationship_type VARCHAR(50) DEFAULT 'parent', -- 'parent', 'guardian', 'relative'
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_monitored_messages_child_id ON monitored_messages(child_id);
CREATE INDEX IF NOT EXISTS idx_monitored_messages_timestamp ON monitored_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_monitored_messages_app_name ON monitored_messages(app_name);

CREATE INDEX IF NOT EXISTS idx_flagged_content_child_id ON flagged_content(child_id);
CREATE INDEX IF NOT EXISTS idx_flagged_content_severity ON flagged_content(severity);
CREATE INDEX IF NOT EXISTS idx_flagged_content_timestamp ON flagged_content(timestamp);

CREATE INDEX IF NOT EXISTS idx_real_time_alerts_child_id ON real_time_alerts(child_id);
CREATE INDEX IF NOT EXISTS idx_real_time_alerts_severity ON real_time_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_real_time_alerts_is_read ON real_time_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_real_time_alerts_timestamp ON real_time_alerts(timestamp);

CREATE INDEX IF NOT EXISTS idx_conversation_logs_child_id ON conversation_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_severity ON conversation_logs(severity);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_timestamp ON conversation_logs(timestamp);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_history_child_id ON ai_analysis_history(child_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_history_content_hash ON ai_analysis_history(content_hash);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_history_timestamp ON ai_analysis_history(timestamp);

-- Row Level Security (RLS) policies
ALTER TABLE monitored_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE flagged_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_time_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_child_relationships ENABLE ROW LEVEL SECURITY;

-- Sample data for testing
INSERT INTO child_profiles (child_id, name, age, grade, school, parent_email) 
VALUES ('olivia', 'Olivia Johnson', 15, '10th Grade', 'Lincoln High School', 'parent@example.com')
ON CONFLICT (child_id) DO NOTHING;

INSERT INTO monitoring_settings (child_id, enabled, text_monitoring, image_monitoring, real_time_alerts)
VALUES ('olivia', TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (child_id) DO NOTHING;

-- Sample flagged content for testing
INSERT INTO flagged_content (child_id, app_name, contact, content_type, content_data, severity, flagged_phrases, confidence, analysis_reasons)
VALUES 
('olivia', 'WhatsApp', 'Unknown Number', 'text', 'Hey, want to meet up alone? Send me some photos', 'high', ARRAY['meet up alone', 'send photos'], 0.85, ARRAY['meeting alone request', 'photo request']),
('olivia', 'Telegram', 'Unknown Contact', 'text', 'Want to smoke some greens tonight? I got some bud', 'medium', ARRAY['greens', 'smoke', 'bud'], 0.75, ARRAY['marijuana smoking context', 'late night drug activity context']),
('olivia', 'Instagram', '@stranger_account', 'text', 'You look really beautiful today', 'low', ARRAY['beautiful'], 0.45, ARRAY['compliment context'])
ON CONFLICT DO NOTHING;

-- Sample conversation logs for testing
INSERT INTO conversation_logs (child_id, app_name, contact, severity, flagged_content, confidence, message_count)
VALUES 
('olivia', 'WhatsApp', 'Unknown Number', 'high', 'Explicit language detected', 0.85, 12),
('olivia', 'Telegram', 'Unknown Contact', 'medium', 'Drug slang detected', 0.75, 6),
('olivia', 'Instagram', '@stranger_account', 'medium', 'Suspicious behavior', 0.65, 8)
ON CONFLICT DO NOTHING;

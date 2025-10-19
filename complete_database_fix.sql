-- Complete Database Schema Fix
-- This script fixes all database schema issues including missing columns and tables
-- Run this in your Supabase SQL Editor

-- First, let's ensure the profiles table exists with the role column
DO $$
BEGIN
    -- Create profiles table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
            full_name TEXT,
            avatar_url TEXT,
            phone TEXT,
            emergency_contact TEXT,
            location_enabled BOOLEAN DEFAULT true,
            notification_preferences JSONB DEFAULT '{
                "security_alerts": true,
                "system_updates": true,
                "emergency_contacts": true,
                "ai_insights": false
            }'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
    END IF;

    -- Add role column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT CHECK (role IN ('parent','child'));
    END IF;
END $$;

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles RLS policy if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON public.profiles
            FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.profiles
            FOR UPDATE USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Create family_links table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.family_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(parent_id, child_id)
);

-- Create link_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.link_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    parent_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_by_child_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create custom_filters table with proper syntax
CREATE TABLE IF NOT EXISTS public.custom_filters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    filter_text TEXT NOT NULL,
    filter_type TEXT NOT NULL CHECK (filter_type IN ('exact', 'similar', 'context')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create ai_analysis_results table with ALL required columns
CREATE TABLE IF NOT EXISTS public.ai_analysis_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    flagged BOOLEAN NOT NULL DEFAULT FALSE,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    category TEXT,
    confidence DECIMAL(3,2) DEFAULT 0.0,
    reasoning TEXT,
    suggested_action TEXT,
    keywords_detected TEXT[],
    context_analysis TEXT,
    app_name VARCHAR(100),
    contact VARCHAR(255),
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create smart_monitoring_settings table
CREATE TABLE IF NOT EXISTS public.smart_monitoring_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    ai_enabled BOOLEAN DEFAULT TRUE,
    custom_filters_enabled BOOLEAN DEFAULT TRUE,
    context_analysis_enabled BOOLEAN DEFAULT TRUE,
    confidence_threshold DECIMAL(3,2) DEFAULT 0.7,
    severity_thresholds JSONB DEFAULT '{
        "low": 0.3,
        "medium": 0.5,
        "high": 0.7,
        "critical": 0.9
    }'::jsonb,
    monitored_apps TEXT[] DEFAULT ARRAY['WhatsApp', 'Telegram', 'Instagram', 'Snapchat', 'TikTok', 'Discord', 'Messenger'],
    alert_preferences JSONB DEFAULT '{
        "immediate_alerts": true,
        "daily_summary": true,
        "weekly_report": true,
        "email_notifications": true,
        "push_notifications": true
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create ai_learning_feedback table
CREATE TABLE IF NOT EXISTS public.ai_learning_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    analysis_result_id UUID REFERENCES public.ai_analysis_results(id) ON DELETE CASCADE NOT NULL,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('false_positive', 'false_negative', 'accurate', 'needs_improvement')),
    feedback_comment TEXT,
    corrected_severity TEXT CHECK (corrected_severity IN ('low', 'medium', 'high', 'critical')),
    corrected_category TEXT,
    is_helpful BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create real_time_alerts table
CREATE TABLE IF NOT EXISTS public.real_time_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('ai_flagged_content', 'suspicious_activity', 'emergency', 'system_alert')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    flagged_content TEXT NOT NULL,
    app_name VARCHAR(100),
    contact VARCHAR(255),
    confidence DECIMAL(3,2) DEFAULT 0.0,
    ai_reasoning TEXT,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create conversation_logs table
CREATE TABLE IF NOT EXISTS public.conversation_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    app_name VARCHAR(100) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    message_content TEXT,
    flagged_content TEXT,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    confidence DECIMAL(3,2) DEFAULT 0.0,
    analysis_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create monitored_messages table
CREATE TABLE IF NOT EXISTS public.monitored_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    app_name VARCHAR(100) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    message_text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    flagged BOOLEAN DEFAULT FALSE,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    confidence DECIMAL(3,2) DEFAULT 0.0,
    flagged_phrases TEXT[],
    flagged_categories TEXT[],
    analysis_result JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create telegram_messages table
CREATE TABLE IF NOT EXISTS public.telegram_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    chat_id VARCHAR(255) NOT NULL,
    message_id VARCHAR(255) NOT NULL,
    message_text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    sender_name VARCHAR(255),
    flagged BOOLEAN DEFAULT FALSE,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    confidence DECIMAL(3,2) DEFAULT 0.0,
    flagged_phrases TEXT[],
    flagged_categories TEXT[],
    analysis_result JSONB,
    message_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create recent_alerts table
CREATE TABLE IF NOT EXISTS public.recent_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    guardian_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('ai_flagged_content', 'suspicious_activity', 'emergency', 'system_alert')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    app_name VARCHAR(100),
    flagged_content TEXT,
    confidence DECIMAL(3,2) DEFAULT 0.0,
    ai_reasoning TEXT,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_filters_parent_id ON public.custom_filters(parent_id);
CREATE INDEX IF NOT EXISTS idx_custom_filters_active ON public.custom_filters(is_active);
CREATE INDEX IF NOT EXISTS idx_custom_filters_type ON public.custom_filters(filter_type);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_child_id ON public.ai_analysis_results(child_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_parent_id ON public.ai_analysis_results(parent_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_flagged ON public.ai_analysis_results(flagged);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_severity ON public.ai_analysis_results(severity);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_analyzed_at ON public.ai_analysis_results(analyzed_at DESC);

CREATE INDEX IF NOT EXISTS idx_smart_monitoring_settings_parent_id ON public.smart_monitoring_settings(parent_id);

CREATE INDEX IF NOT EXISTS idx_ai_learning_feedback_parent_id ON public.ai_learning_feedback(parent_id);
CREATE INDEX IF NOT EXISTS idx_ai_learning_feedback_type ON public.ai_learning_feedback(feedback_type);

CREATE INDEX IF NOT EXISTS idx_real_time_alerts_parent_id ON public.real_time_alerts(parent_id);
CREATE INDEX IF NOT EXISTS idx_real_time_alerts_child_id ON public.real_time_alerts(child_id);
CREATE INDEX IF NOT EXISTS idx_real_time_alerts_created_at ON public.real_time_alerts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_logs_child_id ON public.conversation_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_parent_id ON public.conversation_logs(parent_id);

CREATE INDEX IF NOT EXISTS idx_monitored_messages_child_id ON public.monitored_messages(child_id);
CREATE INDEX IF NOT EXISTS idx_monitored_messages_parent_id ON public.monitored_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_monitored_messages_flagged ON public.monitored_messages(flagged);

CREATE INDEX IF NOT EXISTS idx_telegram_messages_child_id ON public.telegram_messages(child_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_parent_id ON public.telegram_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_flagged ON public.telegram_messages(flagged);

CREATE INDEX IF NOT EXISTS idx_recent_alerts_guardian_id ON public.recent_alerts(guardian_id);
CREATE INDEX IF NOT EXISTS idx_recent_alerts_child_id ON public.recent_alerts(child_id);

-- Enable Row Level Security
ALTER TABLE public.custom_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_monitoring_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_time_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitored_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Parents can manage own custom filters" ON public.custom_filters;
DROP POLICY IF EXISTS "Parents can view AI analysis for their children" ON public.ai_analysis_results;
DROP POLICY IF EXISTS "System can insert AI analysis results" ON public.ai_analysis_results;
DROP POLICY IF EXISTS "Parents can manage own monitoring settings" ON public.smart_monitoring_settings;
DROP POLICY IF EXISTS "Parents can provide feedback on AI analysis" ON public.ai_learning_feedback;
DROP POLICY IF EXISTS "Parents can view own family links" ON public.family_links;
DROP POLICY IF EXISTS "Parents can insert own family links" ON public.family_links;
DROP POLICY IF EXISTS "Parents manage own link codes" ON public.link_codes;

-- Create RLS Policies for custom_filters
CREATE POLICY "Parents can manage own custom filters" ON public.custom_filters
    USING (auth.uid() = parent_id)
    WITH CHECK (auth.uid() = parent_id);

-- Create RLS Policies for ai_analysis_results
CREATE POLICY "Parents can view AI analysis for their children" ON public.ai_analysis_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.family_links
            WHERE family_links.child_id = ai_analysis_results.child_id
            AND family_links.parent_id = auth.uid()
        )
    );

CREATE POLICY "System can insert AI analysis results" ON public.ai_analysis_results
    FOR INSERT WITH CHECK (true);

-- Create RLS Policies for smart_monitoring_settings
CREATE POLICY "Parents can manage own monitoring settings" ON public.smart_monitoring_settings
    USING (auth.uid() = parent_id)
    WITH CHECK (auth.uid() = parent_id);

-- Create RLS Policies for ai_learning_feedback
CREATE POLICY "Parents can provide feedback on AI analysis" ON public.ai_learning_feedback
    USING (auth.uid() = parent_id)
    WITH CHECK (auth.uid() = parent_id);

-- Create RLS Policies for real_time_alerts
CREATE POLICY "Parents can view own real-time alerts" ON public.real_time_alerts
    FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "System can insert real-time alerts" ON public.real_time_alerts
    FOR INSERT WITH CHECK (true);

-- Create RLS Policies for conversation_logs
CREATE POLICY "Parents can view conversation logs for their children" ON public.conversation_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.family_links
            WHERE family_links.child_id = conversation_logs.child_id
            AND family_links.parent_id = auth.uid()
        )
    );

CREATE POLICY "System can insert conversation logs" ON public.conversation_logs
    FOR INSERT WITH CHECK (true);

-- Create RLS Policies for monitored_messages
CREATE POLICY "Parents can view monitored messages for their children" ON public.monitored_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.family_links
            WHERE family_links.child_id = monitored_messages.child_id
            AND family_links.parent_id = auth.uid()
        )
    );

CREATE POLICY "System can insert monitored messages" ON public.monitored_messages
    FOR INSERT WITH CHECK (true);

-- Create RLS Policies for telegram_messages
CREATE POLICY "Parents can view telegram messages for their children" ON public.telegram_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.family_links
            WHERE family_links.child_id = telegram_messages.child_id
            AND family_links.parent_id = auth.uid()
        )
    );

CREATE POLICY "System can insert telegram messages" ON public.telegram_messages
    FOR INSERT WITH CHECK (true);

-- Create RLS Policies for recent_alerts
CREATE POLICY "Parents can view own recent alerts" ON public.recent_alerts
    FOR SELECT USING (auth.uid() = guardian_id);

CREATE POLICY "System can insert recent alerts" ON public.recent_alerts
    FOR INSERT WITH CHECK (true);

-- Family links: a user can see links where they are parent or child
CREATE POLICY "Users can view own family links" ON public.family_links
    FOR SELECT USING (auth.uid() = parent_id OR auth.uid() = child_id);

-- Parents can create links with their user id as parent
CREATE POLICY "Parents can insert own family links" ON public.family_links
    FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Link codes: parents can manage their own codes; children can check a code by value
CREATE POLICY "Parents manage own link codes" ON public.link_codes
    USING (auth.uid() = parent_user_id)
    WITH CHECK (auth.uid() = parent_user_id);

-- Allow anonymous check by code value only to read minimally needed columns
GRANT SELECT (code, parent_user_id, expires_at, used_by_child_id) ON public.link_codes TO anon, authenticated;

-- Create or replace the handle_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS handle_updated_at_custom_filters ON public.custom_filters;
CREATE TRIGGER handle_updated_at_custom_filters
    BEFORE UPDATE ON public.custom_filters
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_smart_monitoring_settings ON public.smart_monitoring_settings;
CREATE TRIGGER handle_updated_at_smart_monitoring_settings
    BEFORE UPDATE ON public.smart_monitoring_settings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create function to get AI monitoring settings for a parent
CREATE OR REPLACE FUNCTION public.get_ai_monitoring_settings(parent_uuid UUID)
RETURNS TABLE (
    ai_enabled BOOLEAN,
    custom_filters_enabled BOOLEAN,
    context_analysis_enabled BOOLEAN,
    confidence_threshold DECIMAL,
    severity_thresholds JSONB,
    monitored_apps TEXT[],
    alert_preferences JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(sms.ai_enabled, TRUE),
        COALESCE(sms.custom_filters_enabled, TRUE),
        COALESCE(sms.context_analysis_enabled, TRUE),
        COALESCE(sms.confidence_threshold, 0.7),
        COALESCE(sms.severity_thresholds, '{"low": 0.3, "medium": 0.5, "high": 0.7, "critical": 0.9}'::jsonb),
        COALESCE(sms.monitored_apps, ARRAY['WhatsApp', 'Telegram', 'Instagram', 'Snapchat', 'TikTok', 'Discord', 'Messenger']),
        COALESCE(sms.alert_preferences, '{"immediate_alerts": true, "daily_summary": true, "weekly_report": true, "email_notifications": true, "push_notifications": true}'::jsonb)
    FROM public.smart_monitoring_settings sms
    WHERE sms.parent_id = parent_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get active custom filters for a parent
CREATE OR REPLACE FUNCTION public.get_active_custom_filters(parent_uuid UUID)
RETURNS TABLE (
    filter_id UUID,
    filter_text TEXT,
    filter_type TEXT,
    severity TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cf.id,
        cf.filter_text,
        cf.filter_type,
        cf.severity
    FROM public.custom_filters cf
    WHERE cf.parent_id = parent_uuid
    AND cf.is_active = TRUE
    ORDER BY cf.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default monitoring settings for existing parents
INSERT INTO public.smart_monitoring_settings (parent_id, ai_enabled, custom_filters_enabled, context_analysis_enabled)
SELECT id, TRUE, TRUE, TRUE
FROM public.profiles
WHERE role = 'parent'
ON CONFLICT (parent_id) DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_filters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_analysis_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.smart_monitoring_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_learning_feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.real_time_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monitored_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recent_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.link_codes TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_ai_monitoring_settings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_custom_filters(UUID) TO authenticated;

-- Verify the tables were created successfully
SELECT 'custom_filters table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'custom_filters');

SELECT 'ai_analysis_results table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_analysis_results');

SELECT 'smart_monitoring_settings table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'smart_monitoring_settings');

SELECT 'ai_learning_feedback table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_learning_feedback');

SELECT 'real_time_alerts table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'real_time_alerts');

SELECT 'conversation_logs table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversation_logs');

SELECT 'monitored_messages table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'monitored_messages');

SELECT 'telegram_messages table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'telegram_messages');

SELECT 'recent_alerts table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'recent_alerts');

SELECT 'family_links table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'family_links');

SELECT 'link_codes table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'link_codes');

-- Final verification - check if flagged column exists in ai_analysis_results
SELECT 'flagged column exists in ai_analysis_results' as status
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_analysis_results' 
    AND column_name = 'flagged'
);

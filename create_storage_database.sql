-- Complete Storage Database Setup for Guardian AI
-- This creates all necessary tables for local storage and data management
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    notifications BOOLEAN DEFAULT TRUE,
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    privacy_mode BOOLEAN DEFAULT FALSE,
    auto_sync BOOLEAN DEFAULT TRUE,
    cache_duration INTEGER DEFAULT 24, -- hours
    max_stored_alerts INTEGER DEFAULT 100,
    max_stored_messages INTEGER DEFAULT 500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. App Settings Table
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    app_version TEXT DEFAULT '1.0.0',
    last_login TIMESTAMP WITH TIME ZONE,
    total_sessions INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- seconds
    features_used JSONB DEFAULT '{}',
    alerts_created INTEGER DEFAULT 0,
    filters_added INTEGER DEFAULT 0,
    sync_frequency INTEGER DEFAULT 300, -- seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Notification Settings Table
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    alert_sound BOOLEAN DEFAULT TRUE,
    vibration BOOLEAN DEFAULT TRUE,
    quiet_hours JSONB DEFAULT '{"enabled": false, "start_time": "22:00", "end_time": "07:00"}',
    notification_types JSONB DEFAULT '{"alerts": true, "sync": false, "updates": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Parental Controls Table
CREATE TABLE IF NOT EXISTS public.parental_controls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content_filtering BOOLEAN DEFAULT TRUE,
    location_tracking BOOLEAN DEFAULT TRUE,
    app_monitoring BOOLEAN DEFAULT TRUE,
    time_restrictions JSONB DEFAULT '{"enabled": false, "bedtime": "22:00", "wake_time": "07:00"}',
    blocked_apps TEXT[] DEFAULT '{}',
    allowed_apps TEXT[] DEFAULT '{}',
    website_filters JSONB DEFAULT '{"blocked_categories": [], "allowed_sites": [], "blocked_sites": []}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(parent_id, child_id)
);

-- 5. App Usage Statistics Table
CREATE TABLE IF NOT EXISTS public.app_usage_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id UUID DEFAULT uuid_generate_v4(),
    app_version TEXT,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    session_end TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    features_used TEXT[],
    screens_visited TEXT[],
    actions_performed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Location History Table
CREATE TABLE IF NOT EXISTS public.location_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(8, 2),
    altitude DECIMAL(8, 2),
    speed DECIMAL(8, 2),
    heading DECIMAL(8, 2),
    address TEXT,
    location_type TEXT CHECK (location_type IN ('home', 'school', 'other', 'unknown')),
    is_safe BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Content Blocking Data Table
CREATE TABLE IF NOT EXISTS public.content_blocking_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    blocked_content_type TEXT CHECK (blocked_content_type IN ('website', 'app', 'keyword', 'category')),
    blocked_content TEXT NOT NULL,
    block_reason TEXT,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    times_blocked INTEGER DEFAULT 1,
    first_blocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_blocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Data Sync Log Table
CREATE TABLE IF NOT EXISTS public.data_sync_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sync_type TEXT CHECK (sync_type IN ('full', 'incremental', 'manual', 'auto')),
    sync_status TEXT CHECK (sync_status IN ('success', 'failed', 'partial')),
    data_types TEXT[] NOT NULL,
    items_synced INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    sync_duration_ms INTEGER,
    sync_started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    sync_completed_at TIMESTAMP WITH TIME ZONE,
    error_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Storage Statistics Table
CREATE TABLE IF NOT EXISTS public.storage_statistics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    data_type TEXT NOT NULL,
    storage_size_bytes BIGINT DEFAULT 0,
    item_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, data_type)
);

-- 10. Data Export Log Table
CREATE TABLE IF NOT EXISTS public.data_export_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    export_type TEXT CHECK (export_type IN ('full', 'partial', 'specific')),
    export_format TEXT CHECK (export_format IN ('json', 'csv', 'xml')),
    data_types TEXT[] NOT NULL,
    export_size_bytes BIGINT,
    export_status TEXT CHECK (export_status IN ('completed', 'failed', 'in_progress')),
    export_started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    export_completed_at TIMESTAMP WITH TIME ZONE,
    download_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parental_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocking_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_log ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- User Preferences Policies
DROP POLICY IF EXISTS "Users can manage their own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- App Settings Policies
DROP POLICY IF EXISTS "Users can manage their own app settings" ON public.app_settings;
CREATE POLICY "Users can manage their own app settings" ON public.app_settings
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Notification Settings Policies
DROP POLICY IF EXISTS "Users can manage their own notification settings" ON public.notification_settings;
CREATE POLICY "Users can manage their own notification settings" ON public.notification_settings
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Parental Controls Policies
DROP POLICY IF EXISTS "Parents can manage parental controls for their children" ON public.parental_controls;
CREATE POLICY "Parents can manage parental controls for their children" ON public.parental_controls
    USING (
        EXISTS (
            SELECT 1 FROM public.family_links
            WHERE family_links.child_id = parental_controls.child_id
            AND family_links.parent_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.family_links
            WHERE family_links.child_id = parental_controls.child_id
            AND family_links.parent_id = auth.uid()
        )
    );

-- App Usage Stats Policies
DROP POLICY IF EXISTS "Users can manage their own usage stats" ON public.app_usage_stats;
CREATE POLICY "Users can manage their own usage stats" ON public.app_usage_stats
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Location History Policies
DROP POLICY IF EXISTS "Parents can view location history for their children" ON public.location_history;
CREATE POLICY "Parents can view location history for their children" ON public.location_history
    USING (
        EXISTS (
            SELECT 1 FROM public.family_links
            WHERE family_links.child_id = location_history.child_id
            AND family_links.parent_id = auth.uid()
        )
    );

-- Content Blocking Data Policies
DROP POLICY IF EXISTS "Parents can manage content blocking for their children" ON public.content_blocking_data;
CREATE POLICY "Parents can manage content blocking for their children" ON public.content_blocking_data
    USING (
        EXISTS (
            SELECT 1 FROM public.family_links
            WHERE family_links.child_id = content_blocking_data.child_id
            AND family_links.parent_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.family_links
            WHERE family_links.child_id = content_blocking_data.child_id
            AND family_links.parent_id = auth.uid()
        )
    );

-- Data Sync Log Policies
DROP POLICY IF EXISTS "Users can view their own sync logs" ON public.data_sync_log;
CREATE POLICY "Users can view their own sync logs" ON public.data_sync_log
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert sync logs" ON public.data_sync_log;
CREATE POLICY "System can insert sync logs" ON public.data_sync_log
    FOR INSERT WITH CHECK (true);

-- Storage Statistics Policies
DROP POLICY IF EXISTS "Users can manage their own storage stats" ON public.storage_statistics;
CREATE POLICY "Users can manage their own storage stats" ON public.storage_statistics
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Data Export Log Policies
DROP POLICY IF EXISTS "Users can view their own export logs" ON public.data_export_log;
CREATE POLICY "Users can view their own export logs" ON public.data_export_log
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create export logs" ON public.data_export_log;
CREATE POLICY "Users can create export logs" ON public.data_export_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parental_controls TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_usage_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.location_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_blocking_data TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_sync_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.storage_statistics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_export_log TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_app_settings_user_id ON public.app_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON public.notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_parental_controls_parent_id ON public.parental_controls(parent_id);
CREATE INDEX IF NOT EXISTS idx_parental_controls_child_id ON public.parental_controls(child_id);
CREATE INDEX IF NOT EXISTS idx_app_usage_stats_user_id ON public.app_usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_app_usage_stats_session_start ON public.app_usage_stats(session_start);
CREATE INDEX IF NOT EXISTS idx_location_history_child_id ON public.location_history(child_id);
CREATE INDEX IF NOT EXISTS idx_location_history_parent_id ON public.location_history(parent_id);
CREATE INDEX IF NOT EXISTS idx_location_history_timestamp ON public.location_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_content_blocking_data_child_id ON public.content_blocking_data(child_id);
CREATE INDEX IF NOT EXISTS idx_content_blocking_data_parent_id ON public.content_blocking_data(parent_id);
CREATE INDEX IF NOT EXISTS idx_data_sync_log_user_id ON public.data_sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_data_sync_log_sync_started_at ON public.data_sync_log(sync_started_at);
CREATE INDEX IF NOT EXISTS idx_storage_statistics_user_id ON public.storage_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_log_user_id ON public.data_export_log(user_id);

-- Verify tables were created successfully
SELECT 'user_preferences table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences');

SELECT 'app_settings table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'app_settings');

SELECT 'notification_settings table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notification_settings');

SELECT 'parental_controls table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'parental_controls');

SELECT 'app_usage_stats table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'app_usage_stats');

SELECT 'location_history table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'location_history');

SELECT 'content_blocking_data table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'content_blocking_data');

SELECT 'data_sync_log table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'data_sync_log');

SELECT 'storage_statistics table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'storage_statistics');

SELECT 'data_export_log table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'data_export_log');

-- Show table structure summary
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_preferences', 'app_settings', 'notification_settings', 'parental_controls',
    'app_usage_stats', 'location_history', 'content_blocking_data', 
    'data_sync_log', 'storage_statistics', 'data_export_log'
)
ORDER BY table_name, ordinal_position;

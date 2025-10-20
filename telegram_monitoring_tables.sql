-- Telegram Real-time Monitoring Database Tables
-- Run this in your Supabase SQL Editor

-- 1. Telegram sessions table
CREATE TABLE IF NOT EXISTS public.telegram_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    session_string TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(child_id)
);

-- 2. Telegram chats table
CREATE TABLE IF NOT EXISTS public.telegram_chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    chat_id TEXT NOT NULL,
    title TEXT,
    type TEXT CHECK (type IN ('private', 'group', 'supergroup', 'channel')),
    is_monitored BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(child_id, chat_id)
);

-- 3. Telegram messages table (if not exists)
CREATE TABLE IF NOT EXISTS public.telegram_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    chat_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    message_text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    sender_name VARCHAR(255),
    sender_id TEXT,
    flagged BOOLEAN DEFAULT FALSE,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    confidence DECIMAL(3,2) DEFAULT 0.0,
    flagged_phrases TEXT[],
    flagged_categories TEXT[],
    analysis_result JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(child_id, chat_id, message_id)
);

-- 4. Telegram monitoring settings
CREATE TABLE IF NOT EXISTS public.telegram_monitoring_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    monitoring_enabled BOOLEAN DEFAULT TRUE,
    monitor_private_chats BOOLEAN DEFAULT TRUE,
    monitor_group_chats BOOLEAN DEFAULT TRUE,
    monitor_channels BOOLEAN DEFAULT FALSE,
    real_time_alerts BOOLEAN DEFAULT TRUE,
    alert_threshold DECIMAL(3,2) DEFAULT 0.7,
    blocked_chats TEXT[],
    allowed_chats TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.telegram_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_monitoring_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DROP POLICY IF EXISTS "Parents can manage telegram sessions for their children" ON public.telegram_sessions;
CREATE POLICY "Parents can manage telegram sessions for their children" ON public.telegram_sessions
    USING (auth.uid() = parent_id)
    WITH CHECK (auth.uid() = parent_id);

DROP POLICY IF EXISTS "Parents can view telegram chats for their children" ON public.telegram_chats;
CREATE POLICY "Parents can view telegram chats for their children" ON public.telegram_chats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.family_links
            WHERE family_links.child_id = telegram_chats.child_id
            AND family_links.parent_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Parents can manage telegram chats for their children" ON public.telegram_chats;
CREATE POLICY "Parents can manage telegram chats for their children" ON public.telegram_chats
    USING (
        EXISTS (
            SELECT 1 FROM public.family_links
            WHERE family_links.child_id = telegram_chats.child_id
            AND family_links.parent_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.family_links
            WHERE family_links.child_id = telegram_chats.child_id
            AND family_links.parent_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Parents can view telegram messages for their children" ON public.telegram_messages;
CREATE POLICY "Parents can view telegram messages for their children" ON public.telegram_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.family_links
            WHERE family_links.child_id = telegram_messages.child_id
            AND family_links.parent_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "System can insert telegram messages" ON public.telegram_messages;
CREATE POLICY "System can insert telegram messages" ON public.telegram_messages
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "System can update telegram messages" ON public.telegram_messages;
CREATE POLICY "System can update telegram messages" ON public.telegram_messages
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Parents can manage telegram monitoring settings" ON public.telegram_monitoring_settings;
CREATE POLICY "Parents can manage telegram monitoring settings" ON public.telegram_monitoring_settings
    USING (auth.uid() = parent_id)
    WITH CHECK (auth.uid() = parent_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_chats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_monitoring_settings TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_child_id ON public.telegram_sessions(child_id);
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_parent_id ON public.telegram_sessions(parent_id);
CREATE INDEX IF NOT EXISTS idx_telegram_chats_child_id ON public.telegram_chats(child_id);
CREATE INDEX IF NOT EXISTS idx_telegram_chats_parent_id ON public.telegram_chats(parent_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_child_id ON public.telegram_messages(child_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_parent_id ON public.telegram_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_timestamp ON public.telegram_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_flagged ON public.telegram_messages(flagged);

-- Insert default monitoring settings for existing parents
INSERT INTO public.telegram_monitoring_settings (parent_id, monitoring_enabled, monitor_private_chats, monitor_group_chats, real_time_alerts)
SELECT id, TRUE, TRUE, TRUE, TRUE
FROM public.profiles
WHERE role = 'parent'
ON CONFLICT (parent_id) DO NOTHING;

-- Verify tables were created
SELECT 'telegram_sessions table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'telegram_sessions');

SELECT 'telegram_chats table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'telegram_chats');

SELECT 'telegram_messages table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'telegram_messages');

SELECT 'telegram_monitoring_settings table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'telegram_monitoring_settings');

-- Complete Telegram Bot Database Setup
-- This creates all required tables with proper schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Drop existing tables if they exist (to ensure clean setup)
DROP TABLE IF EXISTS public.telegram_messages CASCADE;
DROP TABLE IF EXISTS public.telegram_chats CASCADE;
DROP TABLE IF EXISTS public.parent_telegram_chats CASCADE;
DROP TABLE IF EXISTS public.telegram_bot_configs CASCADE;
DROP TABLE IF EXISTS public.telegram_bot_webhooks CASCADE;

-- 2. Create telegram_bot_configs table
CREATE TABLE public.telegram_bot_configs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    bot_token TEXT NOT NULL,
    bot_username TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(parent_id, child_id)
);

-- 3. Create parent_telegram_chats table
CREATE TABLE public.parent_telegram_chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    chat_id TEXT NOT NULL,
    chat_type TEXT DEFAULT 'private',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create telegram_chats table
CREATE TABLE public.telegram_chats (
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

-- 5. Create telegram_messages table (with all required columns)
CREATE TABLE public.telegram_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    chat_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    message_text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    sender_name VARCHAR(255),
    sender_id TEXT,
    chat_type TEXT,
    chat_title TEXT,
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

-- 6. Create telegram_bot_webhooks table
CREATE TABLE public.telegram_bot_webhooks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bot_token TEXT NOT NULL,
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_update_id BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(bot_token)
);

-- 7. Enable Row Level Security on all tables
ALTER TABLE public.telegram_bot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_telegram_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_bot_webhooks ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies
-- telegram_bot_configs policies
DROP POLICY IF EXISTS "Parents can manage telegram bot configs for their children" ON public.telegram_bot_configs;
CREATE POLICY "Parents can manage telegram bot configs for their children" ON public.telegram_bot_configs
    USING (auth.uid() = parent_id)
    WITH CHECK (auth.uid() = parent_id);

-- parent_telegram_chats policies
DROP POLICY IF EXISTS "Parents can manage their own telegram chats" ON public.parent_telegram_chats;
CREATE POLICY "Parents can manage their own telegram chats" ON public.parent_telegram_chats
    USING (auth.uid() = parent_id)
    WITH CHECK (auth.uid() = parent_id);

-- telegram_chats policies
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

-- telegram_messages policies
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

-- telegram_bot_webhooks policies
DROP POLICY IF EXISTS "System can manage telegram bot webhooks" ON public.telegram_bot_webhooks;
CREATE POLICY "System can manage telegram bot webhooks" ON public.telegram_bot_webhooks
    USING (true)
    WITH CHECK (true);

-- 9. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_bot_configs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_telegram_chats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_chats TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_bot_webhooks TO authenticated;

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_telegram_bot_configs_parent_id ON public.telegram_bot_configs(parent_id);
CREATE INDEX IF NOT EXISTS idx_telegram_bot_configs_child_id ON public.telegram_bot_configs(child_id);
CREATE INDEX IF NOT EXISTS idx_telegram_bot_configs_active ON public.telegram_bot_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_parent_telegram_chats_parent_id ON public.parent_telegram_chats(parent_id);
CREATE INDEX IF NOT EXISTS idx_telegram_chats_child_id ON public.telegram_chats(child_id);
CREATE INDEX IF NOT EXISTS idx_telegram_chats_parent_id ON public.telegram_chats(parent_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_child_id ON public.telegram_messages(child_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_parent_id ON public.telegram_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_chat_id ON public.telegram_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_timestamp ON public.telegram_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_flagged ON public.telegram_messages(flagged);
CREATE INDEX IF NOT EXISTS idx_telegram_bot_webhooks_token ON public.telegram_bot_webhooks(bot_token);

-- 11. Verify tables were created successfully
SELECT 'telegram_bot_configs table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'telegram_bot_configs');

SELECT 'parent_telegram_chats table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'parent_telegram_chats');

SELECT 'telegram_chats table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'telegram_chats');

SELECT 'telegram_messages table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'telegram_messages');

SELECT 'telegram_bot_webhooks table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'telegram_bot_webhooks');

-- 12. Show table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('telegram_bot_configs', 'parent_telegram_chats', 'telegram_chats', 'telegram_messages', 'telegram_bot_webhooks')
ORDER BY table_name, ordinal_position;

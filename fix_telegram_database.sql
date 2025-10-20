-- Fix Telegram Database Schema Issues
-- Run this in your Supabase SQL Editor to fix the missing columns

-- First, let's check if the telegram_messages table exists and what columns it has
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'telegram_messages' 
AND table_schema = 'public';

-- If the table doesn't exist or is missing columns, recreate it properly
DROP TABLE IF EXISTS public.telegram_messages CASCADE;

-- Recreate the telegram_messages table with all required columns
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

-- Enable Row Level Security
ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for telegram_messages
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

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.telegram_messages TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_telegram_messages_child_id ON public.telegram_messages(child_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_parent_id ON public.telegram_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_chat_id ON public.telegram_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_timestamp ON public.telegram_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_flagged ON public.telegram_messages(flagged);

-- Verify the table was created correctly
SELECT 'telegram_messages table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'telegram_messages');

-- Check all columns are present
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'telegram_messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

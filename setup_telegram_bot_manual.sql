-- Manual setup for Telegram Bot configuration
-- Run this in your Supabase SQL Editor

-- Replace these values with your actual data:
-- 1. Replace 'YOUR_PARENT_ID_HERE' with your actual parent user ID from auth.users
-- 2. Replace 'YOUR_CHILD_ID_HERE' with your actual child user ID
-- 3. The bot token and chat ID are already set from your API response

-- Get your user ID first (run this to find your parent ID):
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- 1. Insert bot configuration
INSERT INTO public.telegram_bot_configs (
    parent_id,
    child_id,
    bot_token,
    bot_username,
    is_active
) VALUES (
    'YOUR_PARENT_ID_HERE', -- Replace with your actual parent ID
    'YOUR_CHILD_ID_HERE',  -- Replace with your actual child ID
    '8368442573:AAGU1cZ6ylgFkpQ4wummVtKInbSZoc383rw',
    'guardian_ai_bot',
    true
) ON CONFLICT (parent_id, child_id) DO UPDATE SET
    bot_token = EXCLUDED.bot_token,
    bot_username = EXCLUDED.bot_username,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 2. Insert parent Telegram chat configuration
INSERT INTO public.parent_telegram_chats (
    parent_id,
    chat_id,
    chat_type,
    is_active
) VALUES (
    'YOUR_PARENT_ID_HERE', -- Replace with your actual parent ID
    '5305648844', -- Chat ID from your API response
    'private',
    true
) ON CONFLICT (parent_id) DO UPDATE SET
    chat_id = EXCLUDED.chat_id,
    chat_type = EXCLUDED.chat_type,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 3. Insert webhook configuration
INSERT INTO public.telegram_bot_webhooks (
    bot_token,
    webhook_url,
    is_active,
    last_update_id
) VALUES (
    '8368442573:AAGU1cZ6ylgFkpQ4wummVtKInbSZoc383rw',
    NULL, -- Using polling for now
    true,
    0
) ON CONFLICT (bot_token) DO UPDATE SET
    webhook_url = EXCLUDED.webhook_url,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Verify the configuration was inserted
SELECT 'telegram_bot_configs' as table_name, COUNT(*) as records FROM public.telegram_bot_configs
UNION ALL
SELECT 'parent_telegram_chats' as table_name, COUNT(*) as records FROM public.parent_telegram_chats
UNION ALL
SELECT 'telegram_bot_webhooks' as table_name, COUNT(*) as records FROM public.telegram_bot_webhooks;

-- View the inserted data
SELECT 
    'Bot Config' as type,
    parent_id,
    child_id,
    '***' || RIGHT(bot_token, 4) as bot_token_preview,
    is_active
FROM public.telegram_bot_configs
UNION ALL
SELECT 
    'Parent Chat' as type,
    parent_id,
    NULL as child_id,
    chat_id,
    is_active
FROM public.parent_telegram_chats
UNION ALL
SELECT 
    'Webhook' as type,
    NULL as parent_id,
    NULL as child_id,
    '***' || RIGHT(bot_token, 4) as bot_token_preview,
    is_active
FROM public.telegram_bot_webhooks;

-- Create remaining tables for the alert system
-- Run this in your Supabase SQL Editor

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

-- Enable RLS
ALTER TABLE public.real_time_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_monitoring_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Parents can view own real-time alerts" ON public.real_time_alerts;
CREATE POLICY "Parents can view own real-time alerts" ON public.real_time_alerts
    FOR SELECT USING (auth.uid() = parent_id);

DROP POLICY IF EXISTS "System can insert real-time alerts" ON public.real_time_alerts;
CREATE POLICY "System can insert real-time alerts" ON public.real_time_alerts
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Parents can manage own monitoring settings" ON public.smart_monitoring_settings;
CREATE POLICY "Parents can manage own monitoring settings" ON public.smart_monitoring_settings
    USING (auth.uid() = parent_id)
    WITH CHECK (auth.uid() = parent_id);

DROP POLICY IF EXISTS "Parents can provide feedback on AI analysis" ON public.ai_learning_feedback;
CREATE POLICY "Parents can provide feedback on AI analysis" ON public.ai_learning_feedback
    USING (auth.uid() = parent_id)
    WITH CHECK (auth.uid() = parent_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.real_time_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.smart_monitoring_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_learning_feedback TO authenticated;

-- Insert default monitoring settings for existing parents
INSERT INTO public.smart_monitoring_settings (parent_id, ai_enabled, custom_filters_enabled, context_analysis_enabled)
SELECT id, TRUE, TRUE, TRUE
FROM public.profiles
WHERE role = 'parent'
ON CONFLICT (parent_id) DO NOTHING;

-- Verify tables were created
SELECT 'real_time_alerts table created' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'real_time_alerts');

SELECT 'smart_monitoring_settings table created' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'smart_monitoring_settings');

SELECT 'ai_learning_feedback table created' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_learning_feedback');

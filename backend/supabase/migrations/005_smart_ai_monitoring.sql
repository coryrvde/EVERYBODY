-- Smart AI Monitoring System Migration
-- This migration adds tables for custom filters and AI analysis results

-- Create custom_filters table for parent-defined filters
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

-- Create ai_analysis_results table for storing AI analysis results
CREATE TABLE IF NOT EXISTS public.ai_analysis_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
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

-- Create smart_monitoring_settings table for AI configuration
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

-- Create ai_learning_feedback table for improving AI accuracy
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_filters_parent_id ON public.custom_filters(parent_id);
CREATE INDEX IF NOT EXISTS idx_custom_filters_active ON public.custom_filters(is_active);
CREATE INDEX IF NOT EXISTS idx_custom_filters_type ON public.custom_filters(filter_type);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_child_id ON public.ai_analysis_results(child_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_flagged ON public.ai_analysis_results(flagged);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_severity ON public.ai_analysis_results(severity);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_analyzed_at ON public.ai_analysis_results(analyzed_at DESC);

CREATE INDEX IF NOT EXISTS idx_smart_monitoring_settings_parent_id ON public.smart_monitoring_settings(parent_id);

CREATE INDEX IF NOT EXISTS idx_ai_learning_feedback_parent_id ON public.ai_learning_feedback(parent_id);
CREATE INDEX IF NOT EXISTS idx_ai_learning_feedback_type ON public.ai_learning_feedback(feedback_type);

-- Enable Row Level Security
ALTER TABLE public.custom_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_monitoring_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_filters
CREATE POLICY "Parents can manage own custom filters" ON public.custom_filters
    USING (auth.uid() = parent_id)
    WITH CHECK (auth.uid() = parent_id);

-- RLS Policies for ai_analysis_results
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

-- RLS Policies for smart_monitoring_settings
CREATE POLICY "Parents can manage own monitoring settings" ON public.smart_monitoring_settings
    USING (auth.uid() = parent_id)
    WITH CHECK (auth.uid() = parent_id);

-- RLS Policies for ai_learning_feedback
CREATE POLICY "Parents can provide feedback on AI analysis" ON public.ai_learning_feedback
    USING (auth.uid() = parent_id)
    WITH CHECK (auth.uid() = parent_id);

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_custom_filters
    BEFORE UPDATE ON public.custom_filters
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_smart_monitoring_settings
    BEFORE UPDATE ON public.smart_monitoring_settings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to get AI monitoring settings for a parent
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

-- Function to get active custom filters for a parent
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

-- Sample data for testing (remove in production)
INSERT INTO public.smart_monitoring_settings (parent_id, ai_enabled, custom_filters_enabled, context_analysis_enabled)
SELECT id, TRUE, TRUE, TRUE
FROM public.profiles
WHERE role = 'parent'
ON CONFLICT (parent_id) DO NOTHING;

-- Grant permissions
GRANT SELECT ON public.custom_filters TO authenticated;
GRANT SELECT ON public.ai_analysis_results TO authenticated;
GRANT SELECT ON public.smart_monitoring_settings TO authenticated;
GRANT SELECT ON public.ai_learning_feedback TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_ai_monitoring_settings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_custom_filters(UUID) TO authenticated;

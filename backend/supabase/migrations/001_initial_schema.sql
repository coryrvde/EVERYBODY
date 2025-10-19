-- Guardian AI Database Schema
-- This migration creates the initial database structure for the Guardian AI application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users profile extension (extends auth.users)
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

-- Security alerts table
CREATE TABLE public.security_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('intrusion', 'suspicious_activity', 'emergency', 'system_alert', 'ai_detection')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    description TEXT,
    location JSONB, -- {lat, lng, address}
    media_urls TEXT[], -- Array of image/video URLs
    ai_confidence DECIMAL(3,2), -- AI confidence score 0.00-1.00
    ai_analysis JSONB, -- Detailed AI analysis results
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'false_positive')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Activity logs table
CREATE TABLE public.activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    location JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- AI insights table
CREATE TABLE public.ai_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    insight_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    confidence_score DECIMAL(3,2),
    data JSONB,
    recommendation TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Devices table
CREATE TABLE public.devices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL,
    device_model TEXT,
    os_version TEXT,
    app_version TEXT,
    fcm_token TEXT, -- For push notifications
    is_active BOOLEAN DEFAULT true,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Emergency contacts table
CREATE TABLE public.emergency_contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    relationship TEXT,
    priority INTEGER DEFAULT 1, -- 1 = highest priority
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- System settings table
CREATE TABLE public.system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    setting_key TEXT NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, setting_key)
);

-- Guardians table (stores user accounts)
CREATE TABLE public.guardians (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    expo_push_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Child profiles
CREATE TABLE public.child_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Quick actions (e.g. "lock device", "track location")
CREATE TABLE public.quick_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE,
    action_name TEXT NOT NULL,
    executed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE
);

-- Summary (daily activity summary or analytics)
CREATE TABLE public.summary (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    child_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE,
    total_screen_time INTEGER DEFAULT 0,
    total_alerts INTEGER DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(child_id, date)
);

-- Recent alerts (used for notifications)
CREATE TABLE public.recent_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    alert_type TEXT DEFAULT 'general' CHECK (alert_type IN ('general', 'security', 'activity', 'emergency')),
    severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_security_alerts_user_id ON public.security_alerts(user_id);
CREATE INDEX idx_security_alerts_status ON public.security_alerts(status);
CREATE INDEX idx_security_alerts_created_at ON public.security_alerts(created_at DESC);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX idx_devices_user_id ON public.devices(user_id);
CREATE INDEX idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);

-- Indexes for new tables
CREATE INDEX idx_guardians_email ON public.guardians(email);
CREATE INDEX idx_child_profiles_guardian_id ON public.child_profiles(guardian_id);
CREATE INDEX idx_child_profiles_status ON public.child_profiles(status);
CREATE INDEX idx_quick_actions_guardian_id ON public.quick_actions(guardian_id);
CREATE INDEX idx_quick_actions_child_id ON public.quick_actions(child_id);
CREATE INDEX idx_quick_actions_executed ON public.quick_actions(executed);
CREATE INDEX idx_summary_child_id ON public.summary(child_id);
CREATE INDEX idx_summary_date ON public.summary(date);
CREATE INDEX idx_recent_alerts_guardian_id ON public.recent_alerts(guardian_id);
CREATE INDEX idx_recent_alerts_child_id ON public.recent_alerts(child_id);
CREATE INDEX idx_recent_alerts_read ON public.recent_alerts(read);
CREATE INDEX idx_recent_alerts_created_at ON public.recent_alerts(created_at DESC);

-- Row Level Security Policies

-- Profiles policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Security alerts policies
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own alerts" ON public.security_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.security_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert alerts" ON public.security_alerts FOR INSERT WITH CHECK (true);

-- Activity logs policies
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- AI insights policies
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own insights" ON public.ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON public.ai_insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert insights" ON public.ai_insights FOR INSERT WITH CHECK (true);

-- Devices policies
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own devices" ON public.devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own devices" ON public.devices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own devices" ON public.devices FOR UPDATE USING (auth.uid() = user_id);

-- Emergency contacts policies
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own contacts" ON public.emergency_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own contacts" ON public.emergency_contacts FOR ALL USING (auth.uid() = user_id);

-- System settings policies
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own settings" ON public.system_settings FOR ALL USING (auth.uid() = user_id);

-- New tables RLS policies
-- Guardians policies (using auth.users)
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own guardian profile" ON public.guardians FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own guardian profile" ON public.guardians FOR UPDATE USING (auth.uid() = id);

-- Child profiles policies
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guardians can manage their child profiles" ON public.child_profiles FOR ALL USING (auth.uid() = guardian_id);

-- Quick actions policies
ALTER TABLE public.quick_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guardians can manage their quick actions" ON public.quick_actions FOR ALL USING (auth.uid() = guardian_id);

-- Summary policies
ALTER TABLE public.summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guardians can view summaries for their children" ON public.summary FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.child_profiles
        WHERE child_profiles.id = summary.child_id
        AND child_profiles.guardian_id = auth.uid()
    )
);
CREATE POLICY "Guardians can update summaries for their children" ON public.summary FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.child_profiles
        WHERE child_profiles.id = summary.child_id
        AND child_profiles.guardian_id = auth.uid()
    )
);

-- Recent alerts policies
ALTER TABLE public.recent_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guardians can view their alerts" ON public.recent_alerts FOR SELECT USING (auth.uid() = guardian_id);
CREATE POLICY "Guardians can update their alerts" ON public.recent_alerts FOR UPDATE USING (auth.uid() = guardian_id);
CREATE POLICY "System can create alerts" ON public.recent_alerts FOR INSERT WITH CHECK (true);

-- Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_security_alerts
    BEFORE UPDATE ON public.security_alerts
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_devices
    BEFORE UPDATE ON public.devices
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_emergency_contacts
    BEFORE UPDATE ON public.emergency_contacts
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_system_settings
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

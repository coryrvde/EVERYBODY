-- Create essential tables one by one
-- Run this in your Supabase SQL Editor

-- Step 1: Ensure profiles table exists with role column
CREATE TABLE IF NOT EXISTS public.profiles (
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
    role TEXT CHECK (role IN ('parent','child')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Step 2: Create custom_filters table
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

-- Step 3: Create ai_analysis_results table
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

-- Step 4: Create family_links table
CREATE TABLE IF NOT EXISTS public.family_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(parent_id, child_id)
);

-- Step 5: Enable RLS and create basic policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_links ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
CREATE POLICY "Users can manage own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Parents can manage own custom filters" ON public.custom_filters;
CREATE POLICY "Parents can manage own custom filters" ON public.custom_filters
    FOR ALL USING (auth.uid() = parent_id);

DROP POLICY IF EXISTS "System can manage AI analysis results" ON public.ai_analysis_results;
CREATE POLICY "System can manage AI analysis results" ON public.ai_analysis_results
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can manage own family links" ON public.family_links;
CREATE POLICY "Users can manage own family links" ON public.family_links
    FOR ALL USING (auth.uid() = parent_id OR auth.uid() = child_id);

-- Step 6: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_filters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_analysis_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_links TO authenticated;

-- Step 7: Verify tables were created
SELECT 'custom_filters table exists' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'custom_filters');

SELECT 'ai_analysis_results table exists' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_analysis_results');

SELECT 'profiles table exists' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles');

SELECT 'family_links table exists' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'family_links');

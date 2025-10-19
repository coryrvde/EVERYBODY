-- Force recreate ai_analysis_results table with flagged column
-- Run this in your Supabase SQL Editor

-- First, drop the existing ai_analysis_results table if it exists
DROP TABLE IF EXISTS public.ai_analysis_results CASCADE;

-- Recreate ai_analysis_results table with ALL required columns including flagged
CREATE TABLE public.ai_analysis_results (
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

-- Create indexes for the recreated table
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_child_id ON public.ai_analysis_results(child_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_parent_id ON public.ai_analysis_results(parent_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_flagged ON public.ai_analysis_results(flagged);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_severity ON public.ai_analysis_results(severity);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_analyzed_at ON public.ai_analysis_results(analyzed_at DESC);

-- Enable Row Level Security
ALTER TABLE public.ai_analysis_results ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for ai_analysis_results
DROP POLICY IF EXISTS "Parents can view AI analysis for their children" ON public.ai_analysis_results;
DROP POLICY IF EXISTS "System can insert AI analysis results" ON public.ai_analysis_results;

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

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_analysis_results TO authenticated;

-- Verify the flagged column exists
SELECT 'flagged column exists in ai_analysis_results' as status
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_analysis_results' 
    AND column_name = 'flagged'
);

-- Show all columns in the table for verification
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'ai_analysis_results'
ORDER BY ordinal_position;

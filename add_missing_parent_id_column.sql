-- Add missing parent_id column to ai_analysis_results table
-- Run this in your Supabase SQL Editor

-- Add parent_id column to ai_analysis_results if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'ai_analysis_results' 
        AND column_name = 'parent_id'
    ) THEN
        ALTER TABLE public.ai_analysis_results 
        ADD COLUMN parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
        
        -- Update existing records to set parent_id based on family_links
        UPDATE public.ai_analysis_results 
        SET parent_id = (
            SELECT fl.parent_id 
            FROM public.family_links fl 
            WHERE fl.child_id = ai_analysis_results.child_id 
            LIMIT 1
        )
        WHERE parent_id IS NULL;
    END IF;
END $$;

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_parent_id ON public.ai_analysis_results(parent_id);

-- Verify the column was added
SELECT 'parent_id column added to ai_analysis_results' as status
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_analysis_results' 
    AND column_name = 'parent_id'
);

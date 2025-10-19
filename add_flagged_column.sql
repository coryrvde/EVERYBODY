-- Add missing flagged column to ai_analysis_results table
-- Run this in your Supabase SQL Editor

-- Add flagged column to ai_analysis_results if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'ai_analysis_results' 
        AND column_name = 'flagged'
    ) THEN
        ALTER TABLE public.ai_analysis_results 
        ADD COLUMN flagged BOOLEAN NOT NULL DEFAULT FALSE;
        
        -- Update existing records to set flagged based on severity
        UPDATE public.ai_analysis_results 
        SET flagged = CASE 
            WHEN severity IN ('high', 'critical') THEN TRUE 
            ELSE FALSE 
        END
        WHERE flagged IS NULL;
    END IF;
END $$;

-- Create index for the flagged column
CREATE INDEX IF NOT EXISTS idx_ai_analysis_results_flagged ON public.ai_analysis_results(flagged);

-- Verify the column was added
SELECT 'flagged column added to ai_analysis_results' as status
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_analysis_results' 
    AND column_name = 'flagged'
);

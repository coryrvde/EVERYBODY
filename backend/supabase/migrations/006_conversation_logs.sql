-- Create conversation_logs table for storing Telegram and other app conversations
CREATE TABLE IF NOT EXISTS public.conversation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID NOT NULL,
    parent_id UUID NOT NULL,
    app_name VARCHAR(50) NOT NULL DEFAULT 'Telegram',
    contact VARCHAR(255) NOT NULL,
    severity VARCHAR(20) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    flagged_content TEXT,
    confidence DECIMAL(3,2) DEFAULT 0.1 CHECK (confidence >= 0 AND confidence <= 1),
    message_count INTEGER DEFAULT 1,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_logs_child_id ON public.conversation_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_parent_id ON public.conversation_logs(parent_id);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_app_name ON public.conversation_logs(app_name);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_timestamp ON public.conversation_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_severity ON public.conversation_logs(severity);

-- Enable Row Level Security
ALTER TABLE public.conversation_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Parents can view their children's conversation logs" ON public.conversation_logs
    FOR SELECT USING (
        parent_id = auth.uid() OR 
        child_id IN (
            SELECT child_id FROM public.family_links 
            WHERE parent_id = auth.uid()
        )
    );

CREATE POLICY "Parents can insert conversation logs for their children" ON public.conversation_logs
    FOR INSERT WITH CHECK (
        parent_id = auth.uid() OR 
        child_id IN (
            SELECT child_id FROM public.family_links 
            WHERE parent_id = auth.uid()
        )
    );

CREATE POLICY "Parents can update conversation logs for their children" ON public.conversation_logs
    FOR UPDATE USING (
        parent_id = auth.uid() OR 
        child_id IN (
            SELECT child_id FROM public.family_links 
            WHERE parent_id = auth.uid()
        )
    );

-- Create function to automatically set parent_id from family_links
CREATE OR REPLACE FUNCTION set_parent_id_from_family_links()
RETURNS TRIGGER AS $$
BEGIN
    -- If parent_id is not provided, get it from family_links
    IF NEW.parent_id IS NULL THEN
        SELECT parent_id INTO NEW.parent_id 
        FROM public.family_links 
        WHERE child_id = NEW.child_id 
        LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set parent_id
CREATE TRIGGER trigger_set_parent_id
    BEFORE INSERT ON public.conversation_logs
    FOR EACH ROW
    EXECUTE FUNCTION set_parent_id_from_family_links();

-- Add some sample data for testing
INSERT INTO public.conversation_logs (child_id, app_name, contact, severity, flagged_content, confidence, message_count, timestamp) VALUES
    (gen_random_uuid(), 'Telegram', 'Test Contact 1', 'low', NULL, 0.1, 5, NOW() - INTERVAL '1 hour'),
    (gen_random_uuid(), 'Telegram', 'Test Contact 2', 'medium', 'Inappropriate content detected', 0.7, 3, NOW() - INTERVAL '2 hours'),
    (gen_random_uuid(), 'WhatsApp', 'Test Contact 3', 'high', 'Suspicious activity', 0.9, 1, NOW() - INTERVAL '3 hours')
ON CONFLICT DO NOTHING;

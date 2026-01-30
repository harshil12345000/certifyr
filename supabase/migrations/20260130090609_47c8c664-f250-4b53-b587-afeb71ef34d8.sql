-- Add AI context country to organizations for Ultra plan AI Agent feature
ALTER TABLE organizations 
ADD COLUMN ai_context_country TEXT DEFAULT 'global';
-- Nova User Sessions Mapping Table
-- Maps Nova session IDs to actual users for campaign ownership tracking

CREATE TABLE nova_user_sessions (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,  -- Nova session ID (NOVA-POT****-****)
    user_id UUID,                     -- References auth.users(id) but allows NULL 
    user_email TEXT NOT NULL,         -- User email for linking campaigns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_nova_sessions_session_id ON nova_user_sessions(session_id);
CREATE INDEX idx_nova_sessions_email ON nova_user_sessions(user_email);

-- RLS policies
ALTER TABLE nova_user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can see their own sessions
CREATE POLICY "Users can view own sessions" ON nova_user_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can create own sessions" ON nova_user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role has full access (for n8n)
CREATE POLICY "Service role full access" ON nova_user_sessions
    FOR ALL TO service_role USING (true);
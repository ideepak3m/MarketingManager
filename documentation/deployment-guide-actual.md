# Deployment Guide - Marketing Manager

This guide covers deploying the complete Marketing Manager system with React frontend and n8n backend.

## System Architecture

```
React Frontend (GitHub Pages) → n8n Workflow (Cloud/Self-hosted) → Supabase Database
```

## Prerequisites

### Required Services
- **GitHub Account**: For hosting React frontend
- **n8n Instance**: Cloud subscription or self-hosted
- **Supabase Account**: For database and authentication
- **OpenAI API Account**: For GPT-4o model access

### Environment Variables

#### React Frontend (.env)
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_N8N_CHAT_URL=your_n8n_webhook_url_with_chat_widget
REACT_APP_API_BASE_URL=your_api_endpoint_for_campaigns
```

## n8n Workflow Deployment

### 1. Import Workflow
1. Copy the contents of `n8n/MarketingManager.json`
2. In n8n interface, go to Workflows → Import from JSON
3. Paste the workflow content and save

### 2. Configure Credentials

#### OpenAI Credentials
1. Go to Credentials → Add New
2. Select "OpenAI" type
3. Add your OpenAI API key
4. Name it "OpenAi account" (matches workflow reference)

#### Supabase Credentials  
1. Go to Credentials → Add New
2. Select "Supabase" type
3. Configure:
   - **Host**: Your Supabase project URL
   - **Service Role Key**: Your Supabase service role key (not anon key)
4. Name it "Supabase account" (matches workflow reference)

### 3. Activate Workflow
1. Open the imported MarketingManager workflow
2. Click "Activate" to enable the webhook
3. Copy the webhook URL from the Chat Trigger node
4. This URL will be used in the React frontend

## Database Setup (Supabase)

### 1. Create Database Table
Run this SQL in Supabase SQL Editor:

```sql
-- Create the main table
CREATE TABLE campaign_capture_byNova (
    id SERIAL PRIMARY KEY,
    campaign JSONB NOT NULL,
    summaryText TEXT,
    missingFields JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_campaign_capture_created_at ON campaign_capture_byNova(created_at);
CREATE INDEX idx_campaign_type ON campaign_capture_byNova USING GIN ((campaign->'campaign'->>'campaign_type'));
CREATE INDEX idx_summary_text_search ON campaign_capture_byNova USING GIN (to_tsvector('english', summaryText));

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaign_capture_updated_at 
    BEFORE UPDATE ON campaign_capture_byNova 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Configure Row Level Security (Optional)
If you need multi-user support:

```sql
-- Enable RLS
ALTER TABLE campaign_capture_byNova ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for n8n)
CREATE POLICY "Service role full access" ON campaign_capture_byNova
    FOR ALL TO service_role USING (true);

-- Add user_id column if needed for user-specific access
ALTER TABLE campaign_capture_byNova ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- User access policy
CREATE POLICY "Users can access their own campaigns" ON campaign_capture_byNova
    FOR ALL USING (auth.uid() = user_id);
```

## React Frontend Deployment

### 1. Configure Environment
Create `.env` file with your actual values:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
REACT_APP_N8N_CHAT_URL=https://your-n8n.app/webhook/chat-widget-url
REACT_APP_API_BASE_URL=https://your-api.supabase.co/rest/v1
```

### 2. Build for Production
```bash
npm run build
```

### 3. Deploy to GitHub Pages
```bash
# Install gh-pages if not already installed
npm install --save-dev gh-pages

# Add to package.json scripts
"predeploy": "npm run build",
"deploy": "gh-pages -d build"

# Deploy
npm run deploy
```

### 4. Configure GitHub Pages
1. Go to repository Settings → Pages
2. Select "Deploy from a branch"
3. Choose "gh-pages" branch
4. Your app will be available at `https://username.github.io/repository-name`

## API Endpoints (Optional)

If you want to create API endpoints for campaign data:

### Supabase Edge Functions
Create edge functions for:

```typescript
// Get campaigns
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { data, error } = await supabase
    .from('campaign_capture_byNova')
    .select('*')
    .order('created_at', { ascending: false })

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
```

## Testing the Complete System

### 1. Test n8n Workflow
1. Open the webhook URL directly to test chat interface
2. Have a conversation with Nova to create a campaign
3. Check Supabase table for saved data

### 2. Test React Integration
1. Deploy React app to GitHub Pages
2. Test authentication flow
3. Test chat integration (ChatBot page)
4. Test campaign display (Campaign Reports page)

### 3. Test PDF Generation
1. Create a campaign through Nova
2. View it in Campaign Reports
3. Generate PDF to verify formatting

## Monitoring and Maintenance

### n8n Monitoring
- Check workflow execution history
- Monitor error rates in n8n interface
- Set up alerts for workflow failures

### Database Monitoring
- Monitor table growth and performance
- Check for missing fields in validation
- Regular backup of campaign data

### Frontend Monitoring
- Monitor GitHub Pages deployment status
- Check console for JavaScript errors
- Monitor user authentication flows

## Troubleshooting

### Common Issues

#### n8n Webhook Not Responding
- Check if workflow is activated
- Verify webhook URL is correct
- Check n8n credentials configuration

#### Database Connection Issues
- Verify Supabase credentials in n8n
- Check RLS policies if data isn't saving
- Ensure service role key has proper permissions

#### React App Not Loading
- Check GitHub Pages deployment status
- Verify environment variables are set
- Check browser console for errors

#### Chat Widget Not Embedding
- Verify n8n chat URL is correct
- Check CORS settings if applicable
- Ensure iframe permissions are allowed

## Security Considerations

1. **API Keys**: Never commit API keys to Git
2. **CORS**: Configure appropriate CORS headers
3. **Authentication**: Implement proper user authentication
4. **Rate Limiting**: Consider rate limiting on n8n webhooks
5. **Data Validation**: Rely on n8n validation for data integrity

This deployment guide ensures a complete, production-ready Marketing Manager system with proper monitoring and security considerations.
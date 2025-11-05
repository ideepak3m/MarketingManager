import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project details
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || 'YOUR_SUPABASE_SERVICE_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names - you can customize these based on your Supabase setup
export const TABLES = {
    PROFILES: 'profiles',
    CAMPAIGNS: 'campaigns',
    CAMPAIGN_PHASES: 'campaign_phases',
    CONTENT: 'content',
    SOCIAL_METRICS: 'social_metrics',
    POSTS: 'posts',
    CAMPAIGN_POSTS: 'campaign_posts',
    CAMPAIGN_POST_PLATFORMS: 'campaign_post_platforms'
}
import { supabase, TABLES } from './supabase'
// =============================================
// CAMPAIGN POSTS OPERATIONS
export const getCampaignPosts = async (userId, campaignId, platform) => {
    try {
        let query = supabase
            .from(TABLES.CAMPAIGN_POSTS)
            .select('*')
            .eq('user_id', userId)
            .eq('campaign_id', campaignId);
        if (platform) {
            query = query.eq('platform', platform);
        }
        const { data, error } = await query;
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
}
// =============================================

export const createCampaignPost = async (postData) => {
    try {
        console.log('Inserting into campaign_posts:', postData);
        const { data, error } = await supabase
            .from(TABLES.CAMPAIGN_POSTS)
            .insert([postData])
            .select()
            .single();
        console.log('Insert result:', { data, error });
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.log('Insert error:', error);
        return { data: null, error };
    }
}

// Add this function after createCampaignPost in database.js

// Add this function after createCampaignPost in database.js

export const updateCampaignPost = async (id, updates) => {
    try {
        console.log('Updating campaign_post:', id, updates);
        const { data, error } = await supabase
            .from(TABLES.CAMPAIGN_POSTS)
            .update({
                asset_url: updates.asset_url,
                asset_name: updates.asset_name,
                status: updates.status
            })
            .eq('id', id)
            .select()
            .single();

        console.log('Update result:', { data, error });
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.log('Update error:', error);
        return { data: null, error };
    }
}
// ...existing code...

// =============================================
// USER PROFILE OPERATIONS
// =============================================

export const getUserProfile = async (userId) => {
    try {
        const { data, error } = await supabase
            .from(TABLES.PROFILES)
            .select('*')
            .eq('id', userId)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

export const updateUserProfile = async (userId, updates) => {
    try {
        const { data, error } = await supabase
            .from(TABLES.PROFILES)
            .update(updates)
            .eq('id', userId)
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

// =============================================
// CAMPAIGNS OPERATIONS
// =============================================

export const getCampaigns = async (userId) => {
    try {
        const { data, error } = await supabase
            .from(TABLES.CAMPAIGNS)
            .select(`
        *,
        campaign_phases (
          id,
          name,
          status,
          start_date,
          end_date
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

export const createCampaign = async (campaignData) => {
    try {
        const { data, error } = await supabase
            .from(TABLES.CAMPAIGNS)
            .insert([campaignData])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

export const updateCampaign = async (campaignId, updates) => {
    try {
        const { data, error } = await supabase
            .from(TABLES.CAMPAIGNS)
            .update(updates)
            .eq('id', campaignId)
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

// =============================================
// CAMPAIGN PHASES OPERATIONS
// =============================================

export const getCampaignPhases = async (campaignId) => {
    try {
        const { data, error } = await supabase
            .from(TABLES.CAMPAIGN_PHASES)
            .select('*')
            .eq('campaign_id', campaignId)
            .order('phase_order', { ascending: true })

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

export const createCampaignPhase = async (phaseData) => {
    try {
        const { data, error } = await supabase
            .from(TABLES.CAMPAIGN_PHASES)
            .insert([phaseData])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

// =============================================
// CONTENT OPERATIONS
// =============================================

export const getContent = async (userId, filters = {}) => {
    try {
        let query = supabase
            .from(TABLES.CONTENT)
            .select(`
        *,
        campaigns (
          id,
          name
        ),
        campaign_phases (
          id,
          name
        )
      `)
            .eq('user_id', userId)

        if (filters.status) {
            query = query.eq('status', filters.status)
        }

        if (filters.campaign_id) {
            query = query.eq('campaign_id', filters.campaign_id)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

export const createContent = async (contentData) => {
    try {
        const { data, error } = await supabase
            .from(TABLES.CONTENT)
            .insert([contentData])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

// =============================================
// SOCIAL METRICS OPERATIONS
// =============================================

export const getSocialMetrics = async (userId, platform = null, dateRange = null) => {
    try {
        let query = supabase
            .from(TABLES.SOCIAL_METRICS)
            .select('*')
            .eq('user_id', userId)

        if (platform) {
            query = query.eq('platform', platform)
        }

        if (dateRange) {
            query = query
                .gte('metric_date', dateRange.start)
                .lte('metric_date', dateRange.end)
        }

        const { data, error } = await query.order('metric_date', { ascending: false })

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

export const upsertSocialMetrics = async (metricsData) => {
    try {
        const { data, error } = await supabase
            .from(TABLES.SOCIAL_METRICS)
            .upsert(metricsData, {
                onConflict: 'user_id,platform,metric_date'
            })
            .select()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

// =============================================
// POSTS OPERATIONS
// =============================================

export const getPosts = async (userId, filters = {}) => {
    try {
        let query = supabase
            .from(TABLES.POSTS)
            .select(`
        *,
        content (
          id,
          title,
          content_type
        ),
        campaigns (
          id,
          name
        )
      `)
            .eq('user_id', userId)

        if (filters.platform) {
            query = query.eq('platform', filters.platform)
        }

        if (filters.campaign_id) {
            query = query.eq('campaign_id', filters.campaign_id)
        }

        const { data, error } = await query.order('published_at', { ascending: false })

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

export const createPost = async (postData) => {
    try {
        const { data, error } = await supabase
            .from(TABLES.POSTS)
            .insert([postData])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        return { data: null, error }
    }
}

// =============================================
// ANALYTICS OPERATIONS
// =============================================

export const getDashboardStats = async (userId) => {
    try {
        // Get campaigns stats
        const { data: campaigns, error: campaignsError } = await supabase
            .from(TABLES.CAMPAIGNS)
            .select('id, status, total_reach, total_engagement, total_conversions')
            .eq('user_id', userId)

        if (campaignsError) throw campaignsError

        // Get latest social metrics
        const { data: metrics, error: metricsError } = await supabase
            .from(TABLES.SOCIAL_METRICS)
            .select('platform, followers_count, reach, impressions, likes_count')
            .eq('user_id', userId)
            .order('metric_date', { ascending: false })
            .limit(4) // One for each platform

        if (metricsError) throw metricsError

        // Get recent posts
        const { data: posts, error: postsError } = await supabase
            .from(TABLES.POSTS)
            .select('platform, engagement_rate, published_at')
            .eq('user_id', userId)
            .order('published_at', { ascending: false })
            .limit(10)

        if (postsError) throw postsError

        return {
            data: {
                campaigns: campaigns || [],
                metrics: metrics || [],
                posts: posts || []
            },
            error: null
        }
    } catch (error) {
        return { data: null, error }
    }
}
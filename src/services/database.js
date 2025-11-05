import { supabase, TABLES } from './supabase'

// =============================================
// CAMPAIGN POSTS OPERATIONS (New Multi-Platform Schema)
// =============================================

/**
 * Get campaign posts with platform details
 * @param {string} userId - User ID
 * @param {string} campaignId - Campaign ID
 * @param {string} platform - Optional platform filter
 * @returns {Object} { data, error }
 */
export const getCampaignPosts = async (userId, campaignId, platform = null) => {
    try {
        // Query campaign_posts with nested platform details
        let query = supabase
            .from(TABLES.CAMPAIGN_POSTS)
            .select(`
                *,
                platforms:campaign_post_platforms(*)
            `)
            .eq('user_id', userId)
            .eq('campaign_id', campaignId)
            .order('scheduled_time', { ascending: true });

        const { data, error } = await query;
        if (error) throw error;

        // If platform filter is specified, filter the results
        if (platform && data) {
            return {
                data: data.map(post => ({
                    ...post,
                    platforms: post.platforms.filter(p => p.platform === platform)
                })).filter(post => post.platforms.length > 0),
                error: null
            };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Get campaign posts error:', error);
        return { data: null, error };
    }
}

/**
 * Get posts with platforms for a specific phase
 * @param {string} userId - User ID
 * @param {string} campaignPhaseId - Campaign Phase ID
 * @param {string} platform - Optional platform filter
 */
export const getCampaignPostsByPhase = async (userId, campaignPhaseId, platform = null) => {
    try {
        let query = supabase
            .from(TABLES.CAMPAIGN_POSTS)
            .select(`
                *,
                platforms:campaign_post_platforms(*)
            `)
            .eq('user_id', userId)
            .eq('campaign_phase_id', campaignPhaseId)
            .order('scheduled_time', { ascending: true });

        const { data, error } = await query;
        if (error) throw error;

        if (platform && data) {
            return {
                data: data.map(post => ({
                    ...post,
                    platforms: post.platforms.filter(p => p.platform === platform)
                })).filter(post => post.platforms.length > 0),
                error: null
            };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Get campaign posts by phase error:', error);
        return { data: null, error };
    }
}

/**
 * Bulk create campaign posts (for campaign launch)
 * @param {Array} postsData - Array of post objects
 * @returns {Object} { data, error }
 */
export const bulkCreateCampaignPosts = async (postsData) => {
    try {
        console.log('Bulk creating campaign posts:', postsData.length);

        const { data, error } = await supabase
            .from(TABLES.CAMPAIGN_POSTS)
            .insert(postsData)
            .select();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Bulk create campaign posts error:', error);
        return { data: null, error };
    }
}

/**
 * Bulk create platform entries for posts
 * @param {Array} platformEntries - Array of platform entry objects
 * @returns {Object} { data, error }
 */
export const bulkCreatePlatformEntries = async (platformEntries) => {
    try {
        console.log('Bulk creating platform entries:', platformEntries.length);

        const { data, error } = await supabase
            .from(TABLES.CAMPAIGN_POST_PLATFORMS)
            .insert(platformEntries)
            .select();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Bulk create platform entries error:', error);
        return { data: null, error };
    }
}

/**
 * Create a campaign post with platforms
 * @param {Object} postData - Post data
 * @param {Array} platforms - Array of platform names to publish to
 */
export const createCampaignPost = async (postData, platforms = []) => {
    try {
        console.log('Creating campaign post:', postData, 'for platforms:', platforms);

        // Insert the main campaign post
        const { data: post, error: postError } = await supabase
            .from(TABLES.CAMPAIGN_POSTS)
            .insert([{
                user_id: postData.user_id,
                campaign_id: postData.campaign_id,
                campaign_phase_id: postData.campaign_phase_id,
                scheduled_time: postData.scheduled_time,
                asset_url: postData.asset_url,
                asset_name: postData.asset_name,
                asset_type: postData.asset_type || 'image',
                caption: postData.caption || ''
            }])
            .select()
            .single();

        if (postError) throw postError;

        // Insert platform entries if platforms array is provided
        if (platforms.length > 0) {
            const platformEntries = platforms.map(platform => ({
                campaign_post_id: post.id,
                user_id: postData.user_id,
                platform: platform,
                platform_caption: postData.caption || '',
                hashtags: postData.hashtags || [],
                status: postData.status || 'pending'
            }));

            const { data: platformData, error: platformError } = await supabase
                .from(TABLES.CAMPAIGN_POST_PLATFORMS)
                .insert(platformEntries)
                .select();

            if (platformError) {
                console.error('Platform insert error:', platformError);
                // Don't throw - post was created, just platforms failed
            }

            return { data: { ...post, platforms: platformData }, error: null };
        }

        return { data: post, error: null };
    } catch (error) {
        console.error('Create campaign post error:', error);
        return { data: null, error };
    }
}

/**
 * Update campaign post (asset info)
 */
export const updateCampaignPost = async (id, updates) => {
    try {
        console.log('Updating campaign_post:', id, updates);
        const { data, error } = await supabase
            .from(TABLES.CAMPAIGN_POSTS)
            .update({
                asset_url: updates.asset_url,
                asset_name: updates.asset_name,
                asset_type: updates.asset_type,
                caption: updates.caption
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Update campaign post error:', error);
        return { data: null, error };
    }
}

/**
 * Update multiple platform entries (for caption modal save)
 * @param {Array} platforms - Array of platform objects with id, platform_caption, hashtags
 */
export const updatePlatformCaptions = async (platforms) => {
    try {
        console.log('Updating platform captions:', platforms);

        // Update each platform entry
        const updatePromises = platforms.map(platform =>
            supabase
                .from(TABLES.CAMPAIGN_POST_PLATFORMS)
                .update({
                    platform_caption: platform.platform_caption,
                    hashtags: platform.hashtags
                })
                .eq('id', platform.id)
                .select()
                .single()
        );

        const results = await Promise.all(updatePromises);

        // Check for errors
        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
            console.error('Some platform updates failed:', errors);
            return { data: null, error: errors[0].error };
        }

        const data = results.map(r => r.data);
        return { data, error: null };
    } catch (error) {
        console.error('Update platform captions error:', error);
        return { data: null, error };
    }
}

/**
 * Add platform to existing post
 */
export const addPlatformToPost = async (campaignPostId, userId, platformData) => {
    try {
        const { data, error } = await supabase
            .from(TABLES.CAMPAIGN_POST_PLATFORMS)
            .insert([{
                campaign_post_id: campaignPostId,
                user_id: userId,
                platform: platformData.platform,
                platform_caption: platformData.caption,
                hashtags: platformData.hashtags || [],
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Add platform to post error:', error);
        return { data: null, error };
    }
}

/**
 * Update platform entry (for n8n after publishing)
 */
export const updatePlatformEntry = async (platformEntryId, updates) => {
    try {
        const { data, error } = await supabase
            .from(TABLES.CAMPAIGN_POST_PLATFORMS)
            .update({
                status: updates.status,
                platform_post_id: updates.platform_post_id,
                platform_url: updates.platform_url,
                published_at: updates.published_at,
                error_message: updates.error_message,
                retry_count: updates.retry_count,
                last_retry_at: updates.last_retry_at
            })
            .eq('id', platformEntryId)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Update platform entry error:', error);
        return { data: null, error };
    }
}

/**
 * Get posts ready to publish (for n8n workflow)
 */
export const getPostsReadyToPublish = async () => {
    try {
        const { data, error } = await supabase
            .from(TABLES.CAMPAIGN_POST_PLATFORMS)
            .select(`
                *,
                post:campaign_posts(*)
            `)
            .eq('status', 'pending')
            .lte('post.scheduled_time', new Date().toISOString())
            .lt('retry_count', 3)
            .order('post.scheduled_time', { ascending: true });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Get posts ready to publish error:', error);
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
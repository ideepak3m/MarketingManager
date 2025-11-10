import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Analytics = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [analytics, setAnalytics] = useState({
        overview: {
            totalPosts: 0,
            totalReach: 0,
            engagementRate: 0,
            responseRate: 0,
            totalComments: 0,
            activePlatforms: 0
        },
        engagementOverTime: [],
        platformPerformance: [],
        phasePerformance: [],
        topPosts: [],
        sentimentDistribution: []
    });

    // Fetch campaigns on load
    useEffect(() => {
        if (user) {
            fetchCampaigns();
        }
    }, [user]);

    // Fetch analytics when campaign is selected
    useEffect(() => {
        if (selectedCampaign) {
            fetchAnalytics();
        }
    }, [selectedCampaign]);

    const fetchCampaigns = async () => {
        try {
            console.log('Fetching campaigns for user:', user.id);

            // First, get all sessions for this user
            const { data: sessions, error: sessionsError } = await supabase
                .from('nova_user_sessions')
                .select('session_id')
                .eq('user_id', user.id);

            if (sessionsError) throw sessionsError;

            console.log('User sessions:', sessions);

            if (!sessions || sessions.length === 0) {
                console.log('No sessions found for this user');
                setLoading(false);
                return;
            }

            const sessionIds = sessions.map(s => s.session_id);
            console.log('Session IDs:', sessionIds);

            // Now get campaigns for these sessions
            const { data, error } = await supabase
                .from('campaigns')
                .select('id, name, status, start_date, end_date, session_id')
                .in('session_id', sessionIds)
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log('Raw campaigns data:', data);
            console.log('Total campaigns found:', data?.length);

            // Filter for active or completed campaigns (case-insensitive)
            const filteredData = (data || []).filter(campaign => {
                const status = campaign.status?.toLowerCase();
                console.log(`Campaign "${campaign.name}" - session_id: ${campaign.session_id}, status: "${campaign.status}"`);
                return status === 'active' || status === 'completed';
            });

            console.log('Filtered campaigns:', filteredData);

            setCampaigns(filteredData);
            if (filteredData.length > 0) {
                setSelectedCampaign(filteredData[0].id);
            } else {
                // No campaigns found, stop loading
                console.log('No active/completed campaigns found');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            setLoading(false);
        }
    }; const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // Fetch overview metrics
            await fetchOverviewMetrics();

            // Fetch engagement over time
            await fetchEngagementOverTime();

            // Fetch platform performance
            await fetchPlatformPerformance();

            // Fetch phase performance
            await fetchPhasePerformance();

            // Fetch top posts
            await fetchTopPosts();

            // Fetch sentiment distribution
            await fetchSentimentDistribution();

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOverviewMetrics = async () => {
        try {
            // Get all campaign_posts for this campaign
            const { data: campaignPosts } = await supabase
                .from('campaign_posts')
                .select('id')
                .eq('campaign_id', selectedCampaign);

            if (!campaignPosts || campaignPosts.length === 0) {
                setAnalytics(prev => ({
                    ...prev, overview: {
                        totalPosts: 0,
                        totalReach: 0,
                        totalEngagement: 0,
                        engagementRate: 0,
                        responseRate: 0,
                        platforms: 0
                    }
                }));
                return;
            }

            const postIds = campaignPosts.map(p => p.id);

            // Get total posts count
            const { count: postsCount } = await supabase
                .from('campaign_post_platforms')
                .select('id', { count: 'exact', head: true })
                .in('campaign_post_id', postIds);

            // Get engagement metrics
            const { data: platformData } = await supabase
                .from('campaign_post_platforms')
                .select('likes_count, comments_count, shares_count, views_count, reach, impressions, platform')
                .in('campaign_post_id', postIds);

            // Get comments
            const { data: commentsData, count: commentsCount } = await supabase
                .from('social_comments')
                .select('id, replied, campaign_post_platform_id')
                .in('campaign_post_platform_id',
                    (await supabase
                        .from('campaign_post_platforms')
                        .select('id')
                        .in('campaign_post_id', postIds)
                    ).data?.map(p => p.id) || []
                );

            // Calculate metrics
            const totalReach = platformData?.reduce((sum, p) => sum + (p.reach || 0), 0) || 0;
            const totalImpressions = platformData?.reduce((sum, p) => sum + (p.impressions || 0), 0) || 0;
            const totalEngagement = platformData?.reduce((sum, p) =>
                sum + (p.likes_count || 0) + (p.comments_count || 0) + (p.shares_count || 0), 0) || 0;
            const engagementRate = totalImpressions > 0
                ? ((totalEngagement / totalImpressions) * 100).toFixed(1)
                : 0;

            const repliedCount = commentsData?.filter(c => c.replied).length || 0;
            const responseRate = commentsCount > 0
                ? ((repliedCount / commentsCount) * 100).toFixed(0)
                : 0;

            const uniquePlatforms = new Set(platformData?.map(p => p.platform)).size;

            setAnalytics(prev => ({
                ...prev,
                overview: {
                    totalPosts: postsCount || 0,
                    totalReach: totalReach,
                    engagementRate: engagementRate,
                    responseRate: responseRate,
                    totalComments: commentsCount || 0,
                    activePlatforms: uniquePlatforms
                }
            }));

        } catch (error) {
            console.error('Error fetching overview metrics:', error);
        }
    };

    const fetchEngagementOverTime = async () => {
        try {
            // Get all campaign_posts for this campaign
            const { data: campaignPosts } = await supabase
                .from('campaign_posts')
                .select('id')
                .eq('campaign_id', selectedCampaign);

            if (!campaignPosts || campaignPosts.length === 0) {
                setAnalytics(prev => ({ ...prev, engagementOverTime: [] }));
                return;
            }

            const postIds = campaignPosts.map(p => p.id);

            // Get platform IDs
            const { data: platforms } = await supabase
                .from('campaign_post_platforms')
                .select('id')
                .in('campaign_post_id', postIds);

            if (!platforms || platforms.length === 0) {
                setAnalytics(prev => ({ ...prev, engagementOverTime: [] }));
                return;
            }

            const platformIds = platforms.map(p => p.id);

            // Get comments with timestamps
            const { data } = await supabase
                .from('social_comments')
                .select('timestamp, like_count')
                .in('campaign_post_platform_id', platformIds)
                .order('timestamp');

            // Group by date
            const groupedData = {};
            data?.forEach(comment => {
                const date = new Date(comment.timestamp).toLocaleDateString();
                if (!groupedData[date]) {
                    groupedData[date] = { date, comments: 0, likes: 0 };
                }
                groupedData[date].comments += 1;
                groupedData[date].likes += comment.like_count || 0;
            });

            const chartData = Object.values(groupedData).slice(0, 15); // Last 15 days

            setAnalytics(prev => ({
                ...prev,
                engagementOverTime: chartData
            }));

        } catch (error) {
            console.error('Error fetching engagement over time:', error);
        }
    };

    const fetchPlatformPerformance = async () => {
        try {
            // Get all campaign_posts for this campaign
            const { data: campaignPosts } = await supabase
                .from('campaign_posts')
                .select('id')
                .eq('campaign_id', selectedCampaign);

            if (!campaignPosts || campaignPosts.length === 0) {
                setAnalytics(prev => ({ ...prev, platformPerformance: [] }));
                return;
            }

            const postIds = campaignPosts.map(p => p.id);

            // Get platform metrics
            const { data } = await supabase
                .from('campaign_post_platforms')
                .select('platform, likes_count, comments_count, shares_count, reach, impressions, engagement_rate')
                .in('campaign_post_id', postIds);

            // Group by platform
            const platformStats = {};
            data?.forEach(item => {
                if (!platformStats[item.platform]) {
                    platformStats[item.platform] = {
                        platform: item.platform,
                        posts: 0,
                        reach: 0,
                        engagement: 0,
                        impressions: 0
                    };
                }
                platformStats[item.platform].posts += 1;
                platformStats[item.platform].reach += item.reach || 0;
                platformStats[item.platform].impressions += item.impressions || 0;
                platformStats[item.platform].engagement +=
                    (item.likes_count || 0) + (item.comments_count || 0) + (item.shares_count || 0);
            });

            // Calculate engagement rate
            const chartData = Object.values(platformStats).map(p => ({
                ...p,
                engagementRate: p.impressions > 0
                    ? ((p.engagement / p.impressions) * 100).toFixed(1)
                    : 0
            }));

            setAnalytics(prev => ({
                ...prev,
                platformPerformance: chartData
            }));

        } catch (error) {
            console.error('Error fetching platform performance:', error);
        }
    };

    const fetchPhasePerformance = async () => {
        try {
            const { data: phases } = await supabase
                .from('campaign_phases')
                .select('id, name, phase_order')
                .eq('campaign_id', selectedCampaign)
                .order('phase_order');

            const phaseStats = await Promise.all(phases?.map(async (phase) => {
                const { count: postsCount } = await supabase
                    .from('campaign_posts')
                    .select('id', { count: 'exact', head: true })
                    .eq('campaign_phase_id', phase.id);

                // Get post IDs for this phase
                const { data: phasePosts } = await supabase
                    .from('campaign_posts')
                    .select('id')
                    .eq('campaign_phase_id', phase.id);

                const postIds = phasePosts?.map(p => p.id) || [];

                const { data: platformData } = await supabase
                    .from('campaign_post_platforms')
                    .select('likes_count, comments_count, shares_count')
                    .in('campaign_post_id', postIds);

                // Get platform IDs for comments query
                const { data: phasePlatforms } = await supabase
                    .from('campaign_post_platforms')
                    .select('id')
                    .in('campaign_post_id', postIds);

                const platformIds = phasePlatforms?.map(p => p.id) || [];

                const { count: commentsCount } = await supabase
                    .from('social_comments')
                    .select('id', { count: 'exact', head: true })
                    .in('campaign_post_platform_id', platformIds);

                const { count: repliedCount } = await supabase
                    .from('social_comments')
                    .select('id', { count: 'exact', head: true })
                    .eq('replied', true)
                    .in('campaign_post_platform_id', platformIds);

                const totalEngagement = platformData?.reduce((sum, p) =>
                    sum + (p.likes_count || 0) + (p.comments_count || 0) + (p.shares_count || 0), 0) || 0;

                const responseRate = commentsCount > 0
                    ? Math.round((repliedCount / commentsCount) * 100)
                    : 0;

                return {
                    name: phase.name,
                    posts: postsCount || 0,
                    engagement: totalEngagement,
                    responseRate: responseRate
                };
            }) || []);

            setAnalytics(prev => ({
                ...prev,
                phasePerformance: phaseStats
            }));

        } catch (error) {
            console.error('Error fetching phase performance:', error);
        }
    };

    const fetchTopPosts = async () => {
        try {
            // Get all campaign_posts for this campaign
            const { data: campaignPosts } = await supabase
                .from('campaign_posts')
                .select('id, scheduled_time, campaign_phase_id')
                .eq('campaign_id', selectedCampaign);

            if (!campaignPosts || campaignPosts.length === 0) {
                setAnalytics(prev => ({ ...prev, topPosts: [] }));
                return;
            }

            const postIds = campaignPosts.map(p => p.id);

            // Get platform data with engagement
            const { data } = await supabase
                .from('campaign_post_platforms')
                .select('id, platform, likes_count, comments_count, shares_count, engagement_rate, campaign_post_id')
                .in('campaign_post_id', postIds)
                .order('engagement_rate', { ascending: false })
                .limit(5);

            // Get phase names for the posts
            const phaseIds = [...new Set(campaignPosts.map(p => p.campaign_phase_id))];
            const { data: phases } = await supabase
                .from('campaign_phases')
                .select('id, name')
                .in('id', phaseIds);

            const phaseMap = {};
            phases?.forEach(phase => {
                phaseMap[phase.id] = phase.name;
            });

            const postMap = {};
            campaignPosts.forEach(post => {
                postMap[post.id] = {
                    scheduled_time: post.scheduled_time,
                    phase_name: phaseMap[post.campaign_phase_id]
                };
            });

            const formattedData = data?.map((item, index) => ({
                rank: index + 1,
                platform: item.platform,
                phase: postMap[item.campaign_post_id]?.phase_name || 'Unknown',
                posted: new Date(postMap[item.campaign_post_id]?.scheduled_time).toLocaleDateString(),
                likes: item.likes_count || 0,
                comments: item.comments_count || 0,
                engagement: `${item.engagement_rate || 0}%`
            })) || [];

            setAnalytics(prev => ({
                ...prev,
                topPosts: formattedData
            }));

        } catch (error) {
            console.error('Error fetching top posts:', error);
        }
    };

    const fetchSentimentDistribution = async () => {
        try {
            // Get all campaign_posts for this campaign
            const { data: campaignPosts } = await supabase
                .from('campaign_posts')
                .select('id')
                .eq('campaign_id', selectedCampaign);

            if (!campaignPosts || campaignPosts.length === 0) {
                setAnalytics(prev => ({ ...prev, sentimentDistribution: [] }));
                return;
            }

            const postIds = campaignPosts.map(p => p.id);

            // Get platform IDs
            const { data: platforms } = await supabase
                .from('campaign_post_platforms')
                .select('id')
                .in('campaign_post_id', postIds);

            if (!platforms || platforms.length === 0) {
                setAnalytics(prev => ({ ...prev, sentimentDistribution: [] }));
                return;
            }

            const platformIds = platforms.map(p => p.id);

            // Get comments
            const { data, error } = await supabase
                .from('social_comments')
                .select('text, campaign_post_platform_id')
                .in('campaign_post_platform_id', platformIds);

            if (error) {
                console.error('Error fetching comments:', error);
                setAnalytics(prev => ({ ...prev, sentimentDistribution: [] }));
                return;
            }

            // Simple sentiment detection based on keywords (can be enhanced)
            const sentimentCounts = {
                positive: 0,
                question: 0,
                neutral: 0,
                negative: 0
            };

            data?.forEach(comment => {
                const text = comment.text?.toLowerCase() || '';
                if (text.includes('?')) {
                    sentimentCounts.question++;
                } else if (text.match(/love|great|awesome|perfect|excellent|fantastic|thank/)) {
                    sentimentCounts.positive++;
                } else if (text.match(/bad|worry|concern|disappointed|not sure|trust/)) {
                    sentimentCounts.negative++;
                } else {
                    sentimentCounts.neutral++;
                }
            });

            const total = data?.length || 1;
            const chartData = [
                { name: 'Positive', value: sentimentCounts.positive, percentage: ((sentimentCounts.positive / total) * 100).toFixed(0) },
                { name: 'Questions', value: sentimentCounts.question, percentage: ((sentimentCounts.question / total) * 100).toFixed(0) },
                { name: 'Neutral', value: sentimentCounts.neutral, percentage: ((sentimentCounts.neutral / total) * 100).toFixed(0) },
                { name: 'Negative', value: sentimentCounts.negative, percentage: ((sentimentCounts.negative / total) * 100).toFixed(0) }
            ];

            setAnalytics(prev => ({
                ...prev,
                sentimentDistribution: chartData
            }));

        } catch (error) {
            console.error('Error fetching sentiment distribution:', error);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];

    if (loading && !selectedCampaign) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading campaigns...</div>
            </div>
        );
    }

    if (campaigns.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Analytics</h1>
                <p className="text-gray-600">No active or completed campaigns found. Launch a campaign to see analytics.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Campaign Analytics</h1>
                    <div className="flex items-center space-x-4">
                        <select
                            value={selectedCampaign || ''}
                            onChange={(e) => setSelectedCampaign(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            {campaigns.map(campaign => (
                                <option key={campaign.id} value={campaign.id}>
                                    {campaign.name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={fetchAnalytics}
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : '🔄 Refresh'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <MetricCard
                    title="Total Posts"
                    value={analytics.overview.totalPosts}
                    icon="📊"
                    color="blue"
                />
                <MetricCard
                    title="Total Reach"
                    value={formatNumber(analytics.overview.totalReach)}
                    icon="👥"
                    color="green"
                />
                <MetricCard
                    title="Engagement Rate"
                    value={`${analytics.overview.engagementRate}%`}
                    icon="💬"
                    color="purple"
                />
                <MetricCard
                    title="Response Rate"
                    value={`${analytics.overview.responseRate}%`}
                    icon="✅"
                    color="indigo"
                />
                <MetricCard
                    title="Total Comments"
                    value={analytics.overview.totalComments}
                    icon="💭"
                    color="pink"
                />
                <MetricCard
                    title="Active Platforms"
                    value={analytics.overview.activePlatforms}
                    icon="📱"
                    color="orange"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement Over Time */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Engagement Over Time</h2>
                    {analytics.engagementOverTime.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analytics.engagementOverTime}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="comments" stroke="#8b5cf6" strokeWidth={2} name="Comments" />
                                <Line type="monotone" dataKey="likes" stroke="#10b981" strokeWidth={2} name="Likes" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            No engagement data available
                        </div>
                    )}
                </div>

                {/* Platform Performance */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Platform Performance</h2>
                    {analytics.platformPerformance.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.platformPerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="engagementRate" fill="#8b5cf6" name="Engagement Rate (%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            No platform data available
                        </div>
                    )}
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Phase Performance */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Phase Performance</h2>
                    {analytics.phasePerformance.length > 0 ? (
                        <div className="space-y-4">
                            {analytics.phasePerformance.map((phase, index) => (
                                <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-gray-800">{phase.name}</span>
                                        <span className="text-sm text-gray-600">{phase.posts} posts</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Engagement: {phase.engagement}</span>
                                        <span>Response Rate: {phase.responseRate}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            No phase data available
                        </div>
                    )}
                </div>

                {/* Sentiment Distribution */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Comment Sentiment</h2>
                    {analytics.sentimentDistribution.length > 0 ? (
                        <div className="flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={analytics.sentimentDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {analytics.sentimentDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            No sentiment data available
                        </div>
                    )}
                </div>
            </div>

            {/* Top Performing Posts */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Posts</h2>
                {analytics.topPosts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likes</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {analytics.topPosts.map((post) => (
                                    <tr key={post.rank} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{post.rank}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.platform}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.phase}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.posted}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.likes}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.comments}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">{post.engagement}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-32 text-gray-400">
                        No posts data available
                    </div>
                )}
            </div>
        </div>
    );
};

// Metric Card Component
const MetricCard = ({ title, value, icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        pink: 'bg-pink-50 text-pink-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                </div>
                <div className={`text-3xl ${colorClasses[color]} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        socialMetrics: [],
        activeCampaigns: [],
        todaySchedule: []
    });

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch user's campaigns
            const { data: sessions } = await supabase
                .from('nova_user_sessions')
                .select('session_id')
                .eq('user_id', user.id);

            if (!sessions || sessions.length === 0) {
                setLoading(false);
                return;
            }

            const sessionIds = sessions.map(s => s.session_id);

            // Fetch campaigns with phases
            const { data: campaigns } = await supabase
                .from('campaigns')
                .select(`
                    id,
                    name,
                    status,
                    start_date,
                    end_date,
                    campaign_phases (
                        id,
                        name,
                        phase_order,
                        campaign_posts (
                            id,
                            campaign_post_platforms (
                                id,
                                platform,
                                likes_count,
                                comments_count,
                                shares_count,
                                reach,
                                impressions
                            )
                        )
                    )
                `)
                .in('session_id', sessionIds)
                .order('created_at', { ascending: false });

            // Calculate social metrics by platform
            const metricsMap = {};
            campaigns?.forEach(campaign => {
                campaign.campaign_phases?.forEach(phase => {
                    phase.campaign_posts?.forEach(post => {
                        post.campaign_post_platforms?.forEach(platform => {
                            if (!metricsMap[platform.platform]) {
                                metricsMap[platform.platform] = {
                                    platform: platform.platform,
                                    posts: 0,
                                    totalLikes: 0,
                                    totalComments: 0,
                                    totalShares: 0,
                                    totalReach: 0,
                                    totalImpressions: 0
                                };
                            }
                            const m = metricsMap[platform.platform];
                            m.posts += 1;
                            m.totalLikes += platform.likes_count || 0;
                            m.totalComments += platform.comments_count || 0;
                            m.totalShares += platform.shares_count || 0;
                            m.totalReach += platform.reach || 0;
                            m.totalImpressions += platform.impressions || 0;
                        });
                    });
                });
            });

            const socialMetrics = Object.values(metricsMap).map(m => ({
                platform: m.platform,
                posts: m.posts,
                reach: formatNumber(m.totalReach),
                engagement: m.totalImpressions > 0
                    ? ((m.totalLikes + m.totalComments + m.totalShares) / m.totalImpressions * 100).toFixed(1) + '%'
                    : '0%',
                followers: formatNumber(m.totalReach * 0.15) // Estimated followers from reach
            }));

            // Format active campaigns
            const activeCampaigns = campaigns
                ?.filter(c => c.status?.toLowerCase() === 'active')
                .slice(0, 4)
                .map(campaign => {
                    const totalPhases = campaign.campaign_phases?.length || 0;
                    const completedPhases = campaign.campaign_phases?.filter(p =>
                        p.status?.toLowerCase() === 'completed'
                    ).length || 0;
                    const progress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

                    // Get unique platforms
                    const platforms = new Set();
                    campaign.campaign_phases?.forEach(phase => {
                        phase.campaign_posts?.forEach(post => {
                            post.campaign_post_platforms?.forEach(plat => {
                                platforms.add(plat.platform);
                            });
                        });
                    });

                    // Get current phase
                    const currentPhase = campaign.campaign_phases
                        ?.find(p => p.status?.toLowerCase() === 'active')
                        || campaign.campaign_phases?.[0];

                    return {
                        id: campaign.id,
                        name: campaign.name,
                        status: 'Active',
                        phase: currentPhase?.name || 'Not Started',
                        progress: progress,
                        endDate: campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'N/A',
                        platforms: Array.from(platforms)
                    };
                }) || [];

            // Fetch today's scheduled posts
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const { data: todayPosts } = await supabase
                .from('campaign_posts')
                .select(`
                    id,
                    content_text,
                    scheduled_time,
                    campaign_post_platforms (
                        platform,
                        post_id,
                        posted_at
                    )
                `)
                .gte('scheduled_time', today.toISOString())
                .lt('scheduled_time', tomorrow.toISOString())
                .order('scheduled_time');

            const todaySchedule = todayPosts?.map(post => ({
                content: post.content_text?.substring(0, 50) + '...' || 'Post content',
                time: new Date(post.scheduled_time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }),
                platforms: post.campaign_post_platforms?.map(p => p.platform).join(' & ') || 'Unknown',
                status: post.campaign_post_platforms?.some(p => p.posted_at) ? 'Posted' :
                    new Date(post.scheduled_time) < new Date() ? 'Pending' : 'Scheduled'
            })) || [];

            setDashboardData({
                socialMetrics,
                activeCampaigns,
                todaySchedule
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const getPlatformIcon = (platform) => {
        const icons = {
            'facebook': 'fab fa-facebook',
            'instagram': 'fab fa-instagram',
            'twitter': 'fab fa-twitter',
            'x': 'fab fa-x-twitter',
            'linkedin': 'fab fa-linkedin',
            'tiktok': 'fab fa-tiktok',
            'youtube': 'fab fa-youtube',
            'whatsapp': 'fab fa-whatsapp',
            'pinterest': 'fab fa-pinterest',
            'email': 'fas fa-envelope',
            'email marketing': 'fas fa-envelope',
            'website': 'fas fa-globe',
            'blog': 'fas fa-blog',
            'reddit': 'fab fa-reddit',
            'snapchat': 'fab fa-snapchat',
            'telegram': 'fab fa-telegram'
        };
        return icons[platform?.toLowerCase()] || 'fab fa-share-alt';
    };

    const getPlatformColor = (platform) => {
        const colors = {
            'facebook': 'bg-blue-600',
            'instagram': 'bg-gradient-to-br from-purple-600 to-pink-500',
            'twitter': 'bg-sky-500',
            'x': 'bg-black',
            'linkedin': 'bg-blue-700',
            'tiktok': 'bg-black',
            'youtube': 'bg-red-600',
            'whatsapp': 'bg-green-500',
            'pinterest': 'bg-red-500',
            'email': 'bg-gray-600',
            'email marketing': 'bg-gray-600',
            'website': 'bg-indigo-600',
            'blog': 'bg-orange-500',
            'reddit': 'bg-orange-600',
            'snapchat': 'bg-yellow-400',
            'telegram': 'bg-blue-400'
        };
        return colors[platform?.toLowerCase()] || 'bg-gray-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading dashboard...</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading dashboard...</div>
            </div>
        );
    }

    // Use real data if available, fallback to demo data
    const displayMetrics = dashboardData.socialMetrics.length > 0
        ? dashboardData.socialMetrics
        : [
            { platform: 'Facebook', posts: 0, reach: '0', engagement: '0%', followers: '0' },
            { platform: 'Instagram', posts: 0, reach: '0', engagement: '0%', followers: '0' },
            { platform: 'Twitter', posts: 0, reach: '0', engagement: '0%', followers: '0' },
            { platform: 'LinkedIn', posts: 0, reach: '0', engagement: '0%', followers: '0' }
        ];

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">Welcome to Your Marketing Command Center</h1>
                <p className="text-blue-100">Manage your social media campaigns across all platforms from one dashboard</p>
            </div>

            {/* Social Media Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayMetrics.map((metric, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6 card-hover">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${getPlatformColor(metric.platform)} rounded-lg flex items-center justify-center`}>
                                <i className={`${getPlatformIcon(metric.platform)} text-white text-xl`}></i>
                            </div>
                            {metric.posts > 0 && (
                                <span className="text-sm text-green-500 font-medium">↗ {metric.posts} posts</span>
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{metric.platform}</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Followers</span>
                                <span className="text-sm font-medium">{metric.followers}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Engagement</span>
                                <span className="text-sm font-medium">{metric.engagement}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Posts</span>
                                <span className="text-sm font-medium">{metric.posts}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Reach</span>
                                <span className="text-sm font-medium">{metric.reach}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Active Campaigns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Campaigns</h2>
                    {dashboardData.activeCampaigns.length > 0 ? (
                        <div className="space-y-4">
                            {dashboardData.activeCampaigns.map((campaign, index) => (
                                <div
                                    key={index}
                                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => navigate('/campaigns')}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium text-gray-800">{campaign.name}</h3>
                                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                            {campaign.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">Phase: {campaign.phase}</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${campaign.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex space-x-2">
                                            {campaign.platforms.slice(0, 4).map((platform) => (
                                                <i key={platform} className={`${getPlatformIcon(platform)} text-gray-600`}></i>
                                            ))}
                                            {campaign.platforms.length > 4 && (
                                                <span className="text-xs text-gray-500">+{campaign.platforms.length - 4}</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500">Ends: {campaign.endDate}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No active campaigns</p>
                            <button
                                onClick={() => navigate('/campaigns')}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Create Campaign
                            </button>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/campaigns')}
                            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                            <i className="fas fa-plus text-2xl text-gray-400 mb-2"></i>
                            <p className="text-sm text-gray-600">New Campaign</p>
                        </button>
                        <button
                            onClick={() => navigate('/content')}
                            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                        >
                            <i className="fas fa-image text-2xl text-gray-400 mb-2"></i>
                            <p className="text-sm text-gray-600">Create Content</p>
                        </button>
                        <button
                            onClick={() => navigate('/chatbot')}
                            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                        >
                            <i className="fas fa-robot text-2xl text-gray-400 mb-2"></i>
                            <p className="text-sm text-gray-600">AI Assistant</p>
                        </button>
                        <button
                            onClick={() => navigate('/analytics')}
                            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                        >
                            <i className="fas fa-chart-bar text-2xl text-gray-400 mb-2"></i>
                            <p className="text-sm text-gray-600">View Analytics</p>
                        </button>
                    </div>
                </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Content Schedule</h2>
                {dashboardData.todaySchedule.length > 0 ? (
                    <div className="space-y-3">
                        {dashboardData.todaySchedule.map((item, index) => (
                            <div key={index} className={`flex items-center p-3 rounded-lg ${item.status === 'Posted' ? 'bg-green-50' :
                                item.status === 'Pending' ? 'bg-yellow-50' :
                                    'bg-blue-50'
                                }`}>
                                <div className={`w-2 h-2 rounded-full mr-3 ${item.status === 'Posted' ? 'bg-green-500' :
                                    item.status === 'Pending' ? 'bg-yellow-500' :
                                        'bg-blue-500'
                                    }`}></div>
                                <div className="flex-1">
                                    <p className="font-medium">{item.content}</p>
                                    <p className="text-sm text-gray-600">{item.platforms} • {item.time}</p>
                                </div>
                                <span className={`text-sm ${item.status === 'Posted' ? 'text-green-600' :
                                    item.status === 'Pending' ? 'text-yellow-600' :
                                        'text-blue-600'
                                    }`}>{item.status}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <i className="fas fa-calendar-day text-4xl mb-3 text-gray-300"></i>
                        <p>No posts scheduled for today</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
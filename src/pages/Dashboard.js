import React from 'react';

const Dashboard = () => {
    const socialMetrics = [
        {
            platform: 'X (Twitter)',
            icon: 'fab fa-twitter',
            color: 'bg-twitter',
            followers: '12.5K',
            engagement: '4.2%',
            posts: 45,
            reach: '89.2K'
        },
        {
            platform: 'Facebook',
            icon: 'fab fa-facebook',
            color: 'bg-facebook',
            followers: '8.3K',
            engagement: '3.8%',
            posts: 32,
            reach: '67.1K'
        },
        {
            platform: 'Instagram',
            icon: 'fab fa-instagram',
            color: 'bg-instagram',
            followers: '15.7K',
            engagement: '6.1%',
            posts: 28,
            reach: '102.3K'
        },
        {
            platform: 'LinkedIn',
            icon: 'fab fa-linkedin',
            color: 'bg-linkedin',
            followers: '5.2K',
            engagement: '2.9%',
            posts: 18,
            reach: '34.8K'
        }
    ];

    const activeCampaigns = [
        {
            name: 'AI Audit Campaign',
            status: 'Active',
            phase: 'Awareness',
            progress: 65,
            endDate: '2025-11-15',
            platforms: ['twitter', 'linkedin']
        },
        {
            name: 'Holiday Promotion',
            status: 'Scheduled',
            phase: 'Planning',
            progress: 25,
            endDate: '2025-12-25',
            platforms: ['facebook', 'instagram']
        }
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
                {socialMetrics.map((metric, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6 card-hover">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center`}>
                                <i className={`${metric.icon} text-white text-xl`}></i>
                            </div>
                            <span className="text-sm text-green-500 font-medium">↗ +5.2%</span>
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
                    <div className="space-y-4">
                        {activeCampaigns.map((campaign, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-gray-800">{campaign.name}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs ${campaign.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
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
                                        {campaign.platforms.map((platform) => (
                                            <i key={platform} className={`fab fa-${platform} text-gray-600`}></i>
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-500">Ends: {campaign.endDate}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                            <i className="fas fa-plus text-2xl text-gray-400 mb-2"></i>
                            <p className="text-sm text-gray-600">New Campaign</p>
                        </button>
                        <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                            <i className="fas fa-image text-2xl text-gray-400 mb-2"></i>
                            <p className="text-sm text-gray-600">Create Content</p>
                        </button>
                        <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
                            <i className="fas fa-robot text-2xl text-gray-400 mb-2"></i>
                            <p className="text-sm text-gray-600">AI Assistant</p>
                        </button>
                        <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
                            <i className="fas fa-chart-bar text-2xl text-gray-400 mb-2"></i>
                            <p className="text-sm text-gray-600">View Analytics</p>
                        </button>
                    </div>
                </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Content Schedule</h2>
                <div className="space-y-3">
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                            <p className="font-medium">AI Audit awareness post</p>
                            <p className="text-sm text-gray-600">Twitter & LinkedIn • 10:00 AM</p>
                        </div>
                        <span className="text-sm text-blue-600">Scheduled</span>
                    </div>
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                            <p className="font-medium">Customer testimonial</p>
                            <p className="text-sm text-gray-600">Instagram & Facebook • 2:00 PM</p>
                        </div>
                        <span className="text-sm text-green-600">Posted</span>
                    </div>
                    <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                        <div className="flex-1">
                            <p className="font-medium">Weekly tips carousel</p>
                            <p className="text-sm text-gray-600">All platforms • 5:00 PM</p>
                        </div>
                        <span className="text-sm text-yellow-600">Pending</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
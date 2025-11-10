import React from 'react';

const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(dateObj)) return dateString;
    return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const formatBudget = (budget) => {
    if (!budget || budget === 0) return 'TBD';
    if (typeof budget === 'string' && isNaN(Number(budget))) return budget;
    return `$${parseFloat(budget).toLocaleString()}`;
};

const formatGoals = (goals) => {
    if (!goals) return [];
    if (typeof goals === 'string' && goals[0] !== '{' && goals[0] !== '[') return [goals];
    try {
        const goalsObj = typeof goals === 'string' ? JSON.parse(goals) : goals;
        const formattedGoals = [];
        Object.entries(goalsObj).forEach(([key, value]) => {
            if (typeof value === 'string' && value.length > 5) {
                formattedGoals.push(value);
            }
        });
        return formattedGoals;
    } catch (e) {
        return [goals.toString()];
    }
};

const getPlatformIcon = (platform) => {
    const platformName = platform.toLowerCase();
    if (platformName.includes('facebook')) return 'fab fa-facebook-f';
    if (platformName.includes('instagram')) return 'fab fa-instagram';
    if (platformName.includes('twitter') || platformName.includes('x.com')) return 'fab fa-twitter';
    if (platformName.includes('linkedin')) return 'fab fa-linkedin-in';
    if (platformName.includes('youtube')) return 'fab fa-youtube';
    if (platformName.includes('tiktok')) return 'fab fa-tiktok';
    if (platformName.includes('pinterest')) return 'fab fa-pinterest';
    if (platformName.includes('google')) return 'fab fa-google';
    return 'fas fa-globe';
};

const formatPlatforms = (campaign) => {
    let platforms = [];
    if (Array.isArray(campaign.platforms)) {
        platforms = campaign.platforms;
    } else if (typeof campaign.platforms === 'string') {
        try {
            platforms = JSON.parse(campaign.platforms);
        } catch (e) {
            platforms = [campaign.platforms];
        }
    }
    if (platforms.length === 0) {
        platforms = ['Facebook', 'Instagram'];
    }
    return platforms;
};

const CampaignCard = ({ campaign, openModal, generatePDF, setLaunchingCampaign, setShowLaunchModal, handleCompleteCampaign }) => {
    const isLaunched = campaign.status && campaign.status.toLowerCase() !== 'draft';
    const isActive = campaign.status && campaign.status.toLowerCase() === 'active';
    const isCompleted = campaign.status && campaign.status.toLowerCase() === 'completed';
    console.log('status:', campaign.status, 'isLaunched:', isLaunched, 'isActive:', isActive, 'isCompleted:', isCompleted);
    return (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100" data-sessionid={campaign.userSessionID || ''}>
            {/* Header with greenish tinge if campaign is not draft */}
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex justify-between items-start">
                    <div style={{ minWidth: 0, width: '100%', paddingRight: 5 }}>
                        <h3
                            className="text-2xl font-bold mb-2"
                            style={{
                                height: '2.8em', // ~2 lines
                                overflow: 'auto',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                            }}
                            title={campaign.name}
                        >
                            {campaign.name}
                        </h3>
                        <div
                            style={{
                                height: '5.6em', // ~4 lines
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                paddingRight: 12,
                                marginRight: -12,
                                background: 'transparent',
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#c7d2fe #1e293b',
                            }}
                        >
                            <p
                                className="text-blue-100 text-sm"
                                style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 4,
                                    WebkitBoxOrient: 'vertical',
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word',
                                    margin: 0,
                                    paddingRight: 8,
                                }}
                                title={campaign.description}
                            >
                                {campaign.description}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2" style={{ marginTop: 8 }}>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'active' ? 'bg-green-500 text-white' : campaign.status === 'draft' ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-800'}`}>{campaign.status}</span>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <div className="mb-6">
                    <div className="border-2 border-purple-800 rounded-xl shadow-sm bg-white">
                        <table className="w-full text-sm rounded-lg overflow-hidden">
                            <tbody>
                                <tr className="bg-green-50 border-b">
                                    <td className="p-3 font-medium text-green-700">Total Budget</td>
                                    <td className="p-3 text-green-600">{formatBudget(campaign.budget)}</td>
                                </tr>
                                <tr className="bg-blue-50 border-b">
                                    <td className="p-3 font-medium text-blue-700">Duration</td>
                                    <td className="p-3 text-blue-600">{campaign.campaign_length || 'TBD'}</td>
                                </tr>
                                <tr className="bg-purple-50">
                                    <td className="p-3 font-medium text-purple-700">Phases</td>
                                    <td className="p-3 text-purple-600">{campaign.number_of_phases}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Timeline Section with Active Phase */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <i className="fas fa-calendar-alt mr-2 text-blue-600"></i>
                        Campaign Timeline
                    </h4>
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-center">
                            <div className="text-sm text-gray-500">Start Date</div>
                            <div className="font-medium text-gray-800">{formatDate(campaign.start_date)}</div>
                        </div>
                        <div className="flex-1 mx-4">
                            <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-500">End Date</div>
                            <div className="font-medium text-gray-800">{formatDate(campaign.end_date)}</div>
                        </div>
                    </div>
                    {/* Phase Indicators */}
                    {campaign.phases && campaign.phases.length > 0 && (
                        <div className="mt-4">
                            <div className="text-sm font-medium text-gray-600 mb-2">Campaign Phases</div>
                            <div className="flex space-x-2 ">
                                {(campaign.phases
                                    .slice() // copy array
                                    .sort((a, b) => {
                                        // Prefer explicit order field, fallback to start_date
                                        if (a.order !== undefined && b.order !== undefined) {
                                            return a.order - b.order;
                                        } else if (a.start_date && b.start_date) {
                                            return new Date(a.start_date) - new Date(b.start_date);
                                        } else {
                                            return 0;
                                        }
                                    })
                                ).map((phase, index) => {
                                    // Calculate phase status
                                    const now = new Date();
                                    const start = phase.start_date ? new Date(phase.start_date) : null;
                                    const end = phase.end_date ? new Date(phase.end_date) : null;
                                    let statusLabel = '⏳ Upcoming';
                                    let bgColor = 'bg-rose-50';
                                    if (!start || !end) {
                                        statusLabel = '🟡 Not Scheduled';
                                        bgColor = 'bg-yellow-50';
                                    } else if (start && end) {
                                        if (now < start) {
                                            statusLabel = '⏳ Upcoming';
                                            bgColor = 'bg-rose-50';
                                        } else if (now >= start && now <= end) {
                                            statusLabel = '🟢 Active';
                                            bgColor = 'bg-green-50';
                                        } else if (now > end) {
                                            statusLabel = '✅ Completed';
                                            bgColor = 'bg-gray-100';
                                        }
                                    }
                                    // Calculate phase length
                                    let length = '';
                                    if (start && end) {
                                        const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
                                        length = `${diff} day${diff !== 1 ? 's' : ''}`;
                                    }
                                    return (
                                        <div key={phase.id || index} className={`flex-1 text-center p-2 rounded-lg text-xs font-medium transition-all ${bgColor} text-gray-600 flex flex-col justify-between`} style={{ minWidth: 0 }}>
                                            <div className="font-semibold break-words leading-tight min-h-[2.5em] max-h-[2.5em] overflow-hidden" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                                {phase.name || `Phase ${index + 1}`}
                                            </div>
                                            <div className="flex flex-col justify-between flex-1">
                                                <div className="text-xs mt-1">{start ? start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}</div>
                                                <div className="text-xs mt-1">{length}</div>
                                                <div className="text-xs mt-1">{statusLabel}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex flex-col text-gray-500" style={{ minWidth: 90, maxWidth: 140 }}>
                        <span className="text-sm">Created</span>
                        <span className="text-xs">{formatDate(campaign.created_at)}</span>
                    </div>
                    <div className="flex space-x-3">
                        <button onClick={() => { console.log('View Details clicked', campaign); openModal && openModal(campaign); }} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"><i className="fas fa-eye mr-1"></i>View Details</button>
                        <button onClick={() => { console.log('Generate Report clicked', campaign); generatePDF && generatePDF(campaign); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><i className="fas fa-file-pdf mr-2"></i>Generate Report</button>

                        {/* Show Launch button only for draft/planned campaigns */}
                        {!isActive && !isCompleted && (
                            <button
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                onClick={() => {
                                    console.log('Launch clicked', campaign);
                                    setLaunchingCampaign && setLaunchingCampaign(campaign);
                                    setShowLaunchModal && setShowLaunchModal(true);
                                }}
                            >
                                <i className="fas fa-play mr-2"></i>Launch
                            </button>
                        )}

                        {/* Show Complete button for active campaigns */}
                        {isActive && (
                            <button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                onClick={() => {
                                    console.log('Complete clicked', campaign);
                                    handleCompleteCampaign && handleCompleteCampaign(campaign);
                                }}
                            >
                                <i className="fas fa-check-circle mr-2"></i>Complete
                            </button>
                        )}

                        {/* Completed campaigns show no action button */}
                        {isCompleted && (
                            <div className="text-green-600 font-semibold px-4 py-2 flex items-center">
                                <i className="fas fa-check-circle mr-2"></i>Completed
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignCard;

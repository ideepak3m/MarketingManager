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
    // If it's a plain string, just show it
    if (typeof goals === 'string' && goals[0] !== '{' && goals[0] !== '[') return [goals];
    try {
        const goalsObj = typeof goals === 'string' ? JSON.parse(goals) : goals;
        const formattedGoals = [];
        if (goalsObj.target_audience) {
            formattedGoals.push(`Target ${goalsObj.target_audience}`);
        }
        if (goalsObj.budget) {
            formattedGoals.push(`Budget: $${parseFloat(goalsObj.budget).toLocaleString()}`);
        }
        if (goalsObj.primary_goal) {
            formattedGoals.push(goalsObj.primary_goal);
        }
        if (goalsObj.secondary_goals && Array.isArray(goalsObj.secondary_goals)) {
            formattedGoals.push(...goalsObj.secondary_goals);
        }
        if (formattedGoals.length === 0) {
            Object.entries(goalsObj).forEach(([key, value]) => {
                if (typeof value === 'string' && value.length > 5) {
                    formattedGoals.push(value);
                }
            });
        }
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

const CampaignCard = ({ campaign, openModal, generatePDF, setLaunchingCampaign, setShowLaunchModal }) => (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100" data-sessionid={campaign.userSessionID || ''}>
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-bold mb-2">{campaign.name}</h3>
                    <p className="text-blue-100 text-sm">{campaign.description}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
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
                {campaign.number_of_phases > 0 && (
                    <div className="mt-4">
                        <div className="text-sm font-medium text-gray-600 mb-2">Campaign Phases</div>
                        <div className="flex space-x-2">
                            {Array.from({ length: campaign.number_of_phases }, (_, index) => (
                                <div key={index} className="flex-1 text-center p-2 rounded-lg text-xs font-medium transition-all bg-gray-100 text-gray-600">
                                    <div className="font-semibold">Phase {index + 1}</div>
                                    <div className="text-xs mt-1">⏳ Upcoming</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">Created: {formatDate(campaign.created_at)}</div>
                <div className="flex space-x-3">
                    <button onClick={() => { console.log('View Details clicked', campaign); openModal && openModal(campaign); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><i className="fas fa-eye mr-2"></i>View Details</button>
                    <button onClick={() => { console.log('Generate Report clicked', campaign); generatePDF && generatePDF(campaign); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><i className="fas fa-file-pdf mr-2"></i>Generate Report</button>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors" onClick={() => { console.log('Launch clicked', campaign); setLaunchingCampaign && setLaunchingCampaign(campaign); setShowLaunchModal && setShowLaunchModal(true); }}><i className="fas fa-play mr-2"></i>Launch</button>
                </div>
            </div>
        </div>
    </div>
);

export default CampaignCard;

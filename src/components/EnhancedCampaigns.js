// Enhanced Campaign Display Component
// Inspired by professional campaign presentations

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const EnhancedCampaigns = () => {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    // ... (existing fetch logic)

    const CampaignCard = ({ campaign }) => (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Campaign Header with Status Badge */}
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">{campaign.name}</h3>
                        <p className="text-blue-100 text-sm">{campaign.description}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'active' ? 'bg-green-500 text-white' :
                            campaign.status === 'draft' ? 'bg-yellow-500 text-white' :
                                'bg-gray-500 text-white'
                            }`}>
                            {campaign.status.toUpperCase()}
                        </span>
                        <span className="text-blue-100 text-xs">
                            <i className="fas fa-robot mr-1"></i>Nova AI
                        </span>
                    </div>
                </div>
            </div>

            {/* Campaign Metrics Dashboard */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Budget Card */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-green-600 text-2xl font-bold">
                            {formatBudget(campaign.budget)}
                        </div>
                        <div className="text-green-700 text-sm font-medium">Total Budget</div>
                    </div>

                    {/* Duration Card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <div className="text-blue-600 text-2xl font-bold">
                            {campaign.campaign_length || 'TBD'}
                        </div>
                        <div className="text-blue-700 text-sm font-medium">Duration</div>
                    </div>

                    {/* Phases Card */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                        <div className="text-purple-600 text-2xl font-bold">
                            {campaign.number_of_phases}
                        </div>
                        <div className="text-purple-700 text-sm font-medium">Phases</div>
                    </div>
                </div>

                {/* Timeline Section with Active Phase */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <i className="fas fa-calendar-alt mr-2 text-blue-600"></i>
                        Campaign Timeline
                    </h4>

                    {/* Main Timeline Bar */}
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
                                {Array.from({ length: campaign.number_of_phases }, (_, index) => {
                                    const currentPhase = getCurrentPhase(campaign, index + 1);
                                    return (
                                        <div
                                            key={index}
                                            className={`flex-1 text-center p-2 rounded-lg text-xs font-medium transition-all ${currentPhase === 'active'
                                                    ? 'bg-green-100 text-green-800 border-2 border-green-500'
                                                    : currentPhase === 'completed'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            <div className="font-semibold">Phase {index + 1}</div>
                                            <div className="text-xs mt-1">
                                                {currentPhase === 'active' && '🔄 Active'}
                                                {currentPhase === 'completed' && '✅ Done'}
                                                {currentPhase === 'upcoming' && '⏳ Upcoming'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Goals & Platforms Section */}
                {campaign.goals && (
                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <i className="fas fa-target mr-2 text-green-600"></i>
                            Campaign Goals
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                {JSON.stringify(campaign.goals, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Created: {formatDate(campaign.created_at)}
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setSelectedCampaign(campaign)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <i className="fas fa-eye mr-2"></i>View Details
                        </button>
                        <button
                            onClick={() => generatePDF(campaign)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <i className="fas fa-file-pdf mr-2"></i>Generate PDF
                        </button>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <i className="fas fa-play mr-2"></i>Launch
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const generatePDF = async (campaign) => {
        // TODO: Implement PDF generation
        console.log('Generating PDF for campaign:', campaign.name);
        // This will call our PDF generation service
    };

    const getCurrentPhase = (campaign, phaseNumber) => {
        const now = new Date();
        const startDate = campaign.start_date ? new Date(campaign.start_date) : null;
        const endDate = campaign.end_date ? new Date(campaign.end_date) : null;

        if (!startDate || !endDate) return 'upcoming';

        const totalDuration = endDate.getTime() - startDate.getTime();
        const phaseDuration = totalDuration / campaign.number_of_phases;
        const phaseStartTime = startDate.getTime() + (phaseNumber - 1) * phaseDuration;
        const phaseEndTime = startDate.getTime() + phaseNumber * phaseDuration;

        if (now.getTime() < phaseStartTime) return 'upcoming';
        if (now.getTime() > phaseEndTime) return 'completed';
        return 'active';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatBudget = (budget) => {
        if (!budget || budget === 0) return 'TBD';
        return `$${parseFloat(budget).toLocaleString()}`;
    };

    // ... rest of component logic

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            {/* Enhanced Header */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                            <i className="fas fa-bullhorn mr-3 text-blue-600"></i>
                            Your Campaigns
                        </h1>
                        <p className="text-gray-600 mt-2">Manage and track your AI-generated marketing campaigns</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{campaigns.length}</div>
                        <div className="text-sm text-gray-500">Active Campaigns</div>
                    </div>
                </div>
            </div>

            {/* Enhanced Campaign Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {campaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
            </div>
        </div>
    );
};

export default EnhancedCampaigns;
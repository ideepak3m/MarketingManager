import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const Campaigns = () => {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch campaigns when component mounts
    useEffect(() => {
        if (user) {
            fetchCampaigns();
        }
    }, [user]);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching campaigns for user:', user?.email);

            // First, let's check what campaigns exist at all
            const { data: allCampaigns, error: allError } = await supabase
                .from('campaigns')
                .select('id, name, user_id, created_by_ai, ai_model_version, created_at')
                .order('created_at', { ascending: false });

            console.log('All campaigns in database:', allCampaigns);
            console.log('Any errors fetching all campaigns:', allError);

            // Fetch campaigns created by AI for the current user
            const { data, error } = await supabase
                .from('campaigns')
                .select(`
                    id,
                    name,
                    description,
                    campaign_type,
                    status,
                    start_date,
                    end_date,
                    budget,
                    number_of_phases,
                    created_at,
                    created_by_ai,
                    ai_model_version,
                    user_id
                `)
                .eq('created_by_ai', true)
                .eq('user_id', user?.email)
                .order('created_at', { ascending: false });

            console.log('AI campaigns query result:', data);
            console.log('AI campaigns query error:', error);

            if (error) {
                throw error;
            }

            setCampaigns(data || []);
        } catch (err) {
            console.error('Error fetching campaigns:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString();
    };

    const formatBudget = (budget) => {
        if (!budget || budget === 0) return 'Not specified';
        return `$${parseFloat(budget).toLocaleString()}`;
    };

    if (!user) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
                    <i className="fas fa-lock text-4xl text-gray-400 mb-4"></i>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
                    <p className="text-gray-600">
                        Please log in to view your campaigns.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Your Campaigns</h1>
                        <p className="text-gray-600 mt-1">
                            AI-generated campaigns from your conversations with Nova
                        </p>
                    </div>
                    <button
                        onClick={fetchCampaigns}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <i className="fas fa-sync-alt mr-2"></i>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your campaigns...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <i className="fas fa-exclamation-circle text-red-400 mr-3 mt-1"></i>
                        <div>
                            <h3 className="text-red-800 font-medium">Error Loading Campaigns</h3>
                            <p className="text-red-700 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* No Campaigns State */}
            {!loading && !error && campaigns.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <i className="fas fa-bullhorn text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Campaigns Yet</h3>
                    <p className="text-gray-600 mb-4">
                        You haven't created any campaigns yet. Start by chatting with Nova AI!
                    </p>
                    <a
                        href="/chatbot"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        <i className="fas fa-comments mr-2"></i>
                        Chat with Nova AI
                    </a>
                </div>
            )}

            {/* Campaigns List */}
            {!loading && !error && campaigns.length > 0 && (
                <div className="space-y-4">
                    {campaigns.map((campaign) => (
                        <div key={campaign.id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        {campaign.name || 'Untitled Campaign'}
                                    </h3>
                                    {campaign.description && (
                                        <p className="text-gray-600 mb-3">
                                            {campaign.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {campaign.status || 'draft'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Campaign Type</label>
                                    <p className="text-gray-800">{campaign.campaign_type || 'Not specified'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Budget</label>
                                    <p className="text-gray-800">{formatBudget(campaign.budget)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Phases</label>
                                    <p className="text-gray-800">{campaign.number_of_phases || 0} phases</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Start Date</label>
                                    <p className="text-gray-800">{formatDate(campaign.start_date)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">End Date</label>
                                    <p className="text-gray-800">{formatDate(campaign.end_date)}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                    Created: {formatDate(campaign.created_at)}
                                </div>
                                <div className="flex space-x-2">
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        <i className="fas fa-eye mr-1"></i>
                                        View Details
                                    </button>
                                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                        <i className="fas fa-file-pdf mr-1"></i>
                                        Generate PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Campaigns;
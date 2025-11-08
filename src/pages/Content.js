import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { createCampaignPost, getCampaignPosts, updateCampaignPost, updatePlatformCaptions } from '../services/database';
import CampaignPostsGrid from './Campaigns/CampaignPostsGrid';
import CaptionModal from '../components/CaptionModal';
import useCampaigns from './Campaigns/useCampaigns';
import { useAuth } from '../context/AuthContext';

const Content = () => {
    const [showGrid, setShowGrid] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showCaptionModal, setShowCaptionModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [dbPosts, setDbPosts] = useState([]); // posts from DB
    const { campaigns } = useCampaigns();
    const { user } = useAuth();
    // Show both planned and active campaigns (campaigns that have posts)
    const activeCampaigns = campaigns.filter(c =>
        c.status?.toLowerCase() === 'planned' || c.status?.toLowerCase() === 'active'
    );
    const [selectedCampaignId, setSelectedCampaignId] = useState('');

    useEffect(() => {
        // Only set default campaign if none is selected yet
        if (activeCampaigns.length > 0 && !selectedCampaignId) {
            setSelectedCampaignId(activeCampaigns[0].id);
        }
    }, [activeCampaigns, selectedCampaignId]);

    // Fetch campaign posts from DB
    useEffect(() => {
        fetchDbPosts();
    }, [user?.id, selectedCampaignId]);

    async function fetchDbPosts() {
        if (!user?.id || !selectedCampaignId) {
            console.log('Content: No user or campaign selected');
            setDbPosts([]);
            return;
        }
        console.log('Content: Fetching posts for user:', user.id, 'campaign:', selectedCampaignId);
        // Fetch all posts with all platforms (no platform filter)
        const { data, error } = await getCampaignPosts(user.id, selectedCampaignId);
        console.log('Content: DB Posts fetched:', data);
        console.log('Content: Error:', error);
        if (!error && Array.isArray(data)) {
            console.log('Content: Setting posts count:', data.length);
            setDbPosts(data);
        } else {
            console.log('Content: No data or error, setting empty');
            setDbPosts([]);
        }
    }

    const selectedCampaign = activeCampaigns.find(c => c.id === selectedCampaignId);
    const campaignPlatforms = selectedCampaign?.platforms || [];

    // Handler to show caption modal
    const handleShowCaptionModal = (post) => {
        setSelectedPost(post);
        setShowCaptionModal(true);
    };

    // Handler to save caption changes
    const handleSaveCaptions = async (platforms) => {
        try {
            await updatePlatformCaptions(platforms);
            // Refresh posts to show updated captions
            await fetchDbPosts();
        } catch (error) {
            console.error('Error saving captions:', error);
        }
    };

    // Handler to refresh caption data (for AI check)
    const handleRefreshCaptions = async () => {
        await fetchDbPosts();
        // Update the selected post with fresh data
        if (selectedPost) {
            const updatedPost = dbPosts.find(p => p.id === selectedPost.id);
            if (updatedPost) {
                setSelectedPost(updatedPost);
            }
        }
    };

    // Handler for file upload
    const handleFileUpload = async (post, file) => {
        setShowUploadModal(true);
        try {
            const filePath = `${user.id}/${selectedCampaignId}/${post.id}-${Date.now()}-${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('campaign-media')
                .upload(filePath, file);

            let assetUrl = '';
            if (uploadData && !uploadError) {
                const { data: publicUrlData } = supabase.storage
                    .from('campaign-media')
                    .getPublicUrl(filePath);
                assetUrl = publicUrlData?.publicUrl || '';
            }

            // Update the post with asset info
            if (post.id) {
                await updateCampaignPost(post.id, {
                    asset_url: assetUrl,
                    asset_name: file.name,
                    asset_type: file.type.startsWith('video') ? 'video' : 'image'
                });
            }

            // Fetch fresh posts from database
            const { data: freshPosts, error } = await getCampaignPosts(user.id, selectedCampaignId);

            if (!error && Array.isArray(freshPosts)) {
                setDbPosts(freshPosts);

                // Find the updated post from fresh data
                const updatedPost = freshPosts.find(p => p.id === post.id);
                if (updatedPost) {
                    setShowUploadModal(false);
                    handleShowCaptionModal(updatedPost);
                }
            }
        } catch (err) {
            console.error('Upload error:', err);
        } finally {
            setShowUploadModal(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Content Management</h1>

                <div className="mb-6 flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0">
                    <div>
                        <label className="font-semibold text-gray-700 mr-3">Select Campaign:</label>
                        <select
                            className="border rounded px-3 py-2 text-gray-700"
                            value={selectedCampaignId}
                            onChange={e => setSelectedCampaignId(e.target.value)}
                        >
                            {activeCampaigns.map(campaign => (
                                <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                            ))}
                        </select>
                    </div>
                    {campaignPlatforms.length > 0 && (
                        <div>
                            <label className="font-semibold text-gray-700 mr-3">Selected Platforms (AI-Chosen):</label>
                            <div className="flex gap-2 items-center">
                                {campaignPlatforms.map(platform => (
                                    <span
                                        key={platform}
                                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                    >
                                        {platform}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-6 flex space-x-4">
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors"
                        onClick={() => setShowGrid(v => !v)}
                    >
                        {showGrid ? 'Hide Grid' : 'Show Grid'}
                    </button>
                </div>

                {selectedCampaign && showGrid && dbPosts.length > 0 && (
                    <CampaignPostsGrid
                        key={selectedCampaignId}
                        campaign={selectedCampaign}
                        phases={selectedCampaign.phases || []}
                        posts={dbPosts}
                        onUpload={handleFileUpload}
                        onShowCaptionModal={handleShowCaptionModal}
                    />
                )}

                {selectedCampaign && showGrid && dbPosts.length === 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                        <i className="fas fa-info-circle text-amber-600 text-3xl mb-3"></i>
                        <p className="text-amber-800 font-semibold">No posts found for this campaign.</p>
                        <p className="text-amber-700 text-sm mt-2">
                            Please launch the campaign first to generate the content schedule.
                        </p>
                    </div>
                )}

                {showUploadModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                        <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
                            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                            <div className="text-lg font-semibold text-gray-700 mb-2">Uploading file...</div>
                            <div className="text-gray-500 text-sm">Please wait while your file is being uploaded.</div>
                        </div>
                    </div>
                )}

                {showCaptionModal && selectedPost && (
                    <CaptionModal
                        post={selectedPost}
                        onClose={() => setShowCaptionModal(false)}
                        onSave={handleSaveCaptions}
                        onRefresh={handleRefreshCaptions}
                    />
                )}
            </div>
        </div>
    );
}

export default Content;
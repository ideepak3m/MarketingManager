import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { createCampaignPost } from '../services/database';
import CampaignPostsGrid from './Campaigns/CampaignPostsGrid';
import useCampaigns from './Campaigns/useCampaigns';
import { useAuth } from '../context/AuthContext';

const PLATFORMS = [
    'Facebook', 'Instagram', 'Pinterest', 'TikTok', 'LinkedIn', 'Reddit', 'WhatsApp', 'Email', 'PrintMedia'
];

const Content = () => {
    const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0]);
    const [showGrid, setShowGrid] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [uploadingAll, setUploadingAll] = useState(false);
    const [mediaChosen, setMediaChosen] = useState({}); // { postId: true }
    const mediaFilesRef = useRef({}); // { postId: File }
    const { campaigns } = useCampaigns();
    const { user } = useAuth();
    const plannedCampaigns = campaigns.filter(c => c.status?.toLowerCase() === 'planned');
    const [selectedCampaignId, setSelectedCampaignId] = useState('');
    useEffect(() => {
        if (plannedCampaigns.length > 0) {
            setSelectedCampaignId(plannedCampaigns[0].id);
        }
    }, [plannedCampaigns]);
    const selectedCampaign = plannedCampaigns.find(c => c.id === selectedCampaignId);

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
                            {plannedCampaigns.map(campaign => (
                                <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="font-semibold text-gray-700 mr-3">Select Platform:</label>
                        <select
                            className="border rounded px-3 py-2 text-gray-700"
                            value={selectedPlatform}
                            onChange={e => setSelectedPlatform(e.target.value)}
                        >
                            {PLATFORMS.map(platform => (
                                <option key={platform} value={platform}>{platform}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mb-6 flex space-x-4">
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors"
                        onClick={() => setShowGrid(v => !v)}
                    >
                        {showGrid ? 'Hide Grid' : 'Show Grid'}
                    </button>
                    {showGrid && (
                        <button
                            className={`px-4 py-2 rounded font-semibold transition-colors text-white ${Object.keys(mediaChosen).length > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                            disabled={Object.keys(mediaChosen).length === 0}
                            onClick={async () => {
                                if (Object.keys(mediaChosen).length === 0) return;
                                setShowModal(true);
                                setUploadingAll(true);
                                try {
                                    // Bulk upload logic
                                    const postsToUpload = Object.keys(mediaChosen);
                                    for (const postId of postsToUpload) {
                                        const file = mediaFilesRef.current[postId];
                                        if (!file) continue;
                                        // Upload to Supabase Storage
                                        const filePath = `${user.id}/${selectedCampaignId}/${selectedPlatform}/${postId}-${Date.now()}-${file.name}`;
                                        const { data: uploadData, error: uploadError } = await supabase.storage.from('campaign-media').upload(filePath, file);
                                        let publicUrl = '';
                                        if (uploadData && !uploadError) {
                                            const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('campaign-media').createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days
                                            publicUrl = signedUrlData?.signedUrl || '';
                                        }
                                        // Insert into campaign_posts table
                                        // Use the generated grid post info for correct phase and time
                                        const gridPosts = (() => {
                                            const platformPosts = (selectedCampaign.posts || []).filter(p => p.platform?.toLowerCase() === selectedPlatform.toLowerCase());
                                            if (platformPosts.length > 0) return platformPosts;
                                            const generated = [];
                                            (selectedCampaign.phases || []).forEach(phase => {
                                                const start = phase.start_date ? new Date(phase.start_date) : null;
                                                const end = phase.end_date ? new Date(phase.end_date) : null;
                                                if (!start || !end) return;
                                                const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
                                                const weeks = Math.ceil(days / 7);
                                                let postNum = 1;
                                                for (let w = 0; w < weeks; w++) {
                                                    for (let p = 0; p < 3; p++) {
                                                        const scheduled = new Date(start.getTime() + (w * 7 + p * 2) * 24 * 60 * 60 * 1000);
                                                        if (scheduled > end) break;
                                                        generated.push({
                                                            id: `${phase.id}-${w}-${p}`,
                                                            campaign_phase_id: phase.id,
                                                            scheduled_time: scheduled,
                                                            phase_name: phase.name,
                                                            platform: selectedPlatform,
                                                            file_name: '',
                                                            status: 'Pending',
                                                        });
                                                        postNum++;
                                                    }
                                                }
                                            });
                                            return generated;
                                        })();
                                        const gridPostInfo = gridPosts.find(p => p.id === postId) || {};
                                        await createCampaignPost({
                                            user_id: user?.id || '',
                                            campaign_id: selectedCampaignId,
                                            campaign_phase_id: gridPostInfo.campaign_phase_id || '',
                                            platform: selectedPlatform,
                                            scheduled_time: gridPostInfo.scheduled_time || '',
                                            asset_url: publicUrl,
                                            asset_name: file.name,
                                            status: uploadError ? 'Error' : 'Uploaded',
                                        });
                                    }
                                } catch (err) {
                                    console.error('Bulk upload error:', err);
                                } finally {
                                    setUploadingAll(false);
                                    setShowModal(false);
                                }
                            }}
                        >
                            Upload All
                        </button>
                    )}
                </div>
                {/* Render grid for selected campaign and platform only when showGrid is true */}
                {selectedCampaign && showGrid && (
                    <CampaignPostsGrid
                        key={selectedCampaign.id}
                        campaign={selectedCampaign}
                        phases={selectedCampaign.phases || []}
                        posts={(() => {
                            // Filter posts for platform
                            const platformPosts = (selectedCampaign.posts || []).filter(p => p.platform?.toLowerCase() === selectedPlatform.toLowerCase());
                            if (platformPosts.length > 0) return platformPosts;
                            // Generate default posts for each phase and 3 posts/week
                            const generated = [];
                            (selectedCampaign.phases || []).forEach(phase => {
                                // Calculate number of weeks in phase
                                const start = phase.start_date ? new Date(phase.start_date) : null;
                                const end = phase.end_date ? new Date(phase.end_date) : null;
                                if (!start || !end) return;
                                const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
                                const weeks = Math.ceil(days / 7);
                                let postNum = 1;
                                for (let w = 0; w < weeks; w++) {
                                    for (let p = 0; p < 3; p++) {
                                        const scheduled = new Date(start.getTime() + (w * 7 + p * 2) * 24 * 60 * 60 * 1000);
                                        if (scheduled > end) break;
                                        generated.push({
                                            id: `${phase.id}-${w}-${p}`,
                                            campaign_phase_id: phase.id,
                                            scheduled_time: scheduled,
                                            phase_name: phase.name,
                                            platform: selectedPlatform,
                                            file_name: '',
                                            status: 'Pending',
                                        });
                                        postNum++;
                                    }
                                }
                            });
                            return generated;
                        })()}
                        onUpload={(post, file, done) => {
                            setMediaChosen(prev => ({ ...prev, [post.id]: true }));
                            mediaFilesRef.current[post.id] = file;
                            done();
                        }}
                    />
                )}

                {/* Modal with spinner for bulk upload */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                        <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
                            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                            <div className="text-lg font-semibold text-gray-700 mb-2">Uploading files...</div>
                            <div className="text-gray-500 text-sm">Please wait while your files are being uploaded.</div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Content;
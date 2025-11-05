import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { createCampaignPost, getCampaignPosts, updateCampaignPost } from '../services/database';
import CampaignPostsGrid from './Campaigns/CampaignPostsGrid';
import useCampaigns from './Campaigns/useCampaigns';
import { useAuth } from '../context/AuthContext';

const Content = () => {
    const [showGrid, setShowGrid] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [mediaChosen, setMediaChosen] = useState({}); // { postId: true }
    const [pendingFileNames, setPendingFileNames] = useState({}); // { postId: fileName }
    const [dbPosts, setDbPosts] = useState([]); // posts from DB
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

    // Fetch campaign posts from DB
    useEffect(() => {
        fetchDbPosts();
    }, [user?.id, selectedCampaignId]);

    async function fetchDbPosts() {
        if (!user?.id || !selectedCampaignId) {
            setDbPosts([]);
            return;
        }
        // Fetch all posts with all platforms (no platform filter)
        const { data, error } = await getCampaignPosts(user.id, selectedCampaignId);
        console.log('DB Posts fetched:', data);
        if (!error && Array.isArray(data)) {
            setDbPosts(data);
        } else {
            setDbPosts([]);
        }
    }

    const selectedCampaign = plannedCampaigns.find(c => c.id === selectedCampaignId);
    const campaignPlatforms = selectedCampaign?.platforms || [];

    // Generate grid posts with DB data merged in
    const generateGridPosts = () => {
        if (!selectedCampaign) return [];

        const gridPosts = [];
        (selectedCampaign.phases || []).forEach(phase => {
            const start = phase.start_date ? new Date(phase.start_date) : null;
            const end = phase.end_date ? new Date(phase.end_date) : null;
            if (!start || !end) return;

            const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
            const weeks = Math.ceil(days / 7);

            for (let w = 0; w < weeks; w++) {
                for (let p = 0; p < 3; p++) {
                    const scheduled = new Date(start.getTime() + (w * 7 + p * 2) * 24 * 60 * 60 * 1000);
                    if (scheduled > end) break;

                    // Try to find matching DB post by phase and date (regardless of platform)
                    const dbMatch = dbPosts.find(dbPost => {
                        if (dbPost.campaign_phase_id !== phase.id) return false;

                        const dbDate = new Date(dbPost.scheduled_time);
                        // Compare dates only (ignore time) by converting to date strings
                        const dbDateStr = dbDate.toISOString().split('T')[0];
                        const scheduledDateStr = scheduled.toISOString().split('T')[0];
                        return dbDateStr === scheduledDateStr;
                    });

                    gridPosts.push({
                        id: `${phase.id}-${w}-${p}`,
                        campaign_phase_id: phase.id,
                        scheduled_time: scheduled,
                        phase_name: phase.name,
                        platforms: dbMatch?.platforms || [], // Array of platform objects
                        file_name: pendingFileNames[`${phase.id}-${w}-${p}`] || dbMatch?.asset_name || '',
                        status: dbMatch?.platforms?.length > 0 ? 'Uploaded' : 'Pending',
                        isUploaded: !!dbMatch,
                        db_id: dbMatch?.id || null
                    });
                }
            }
        });

        console.log('Generated grid posts:', gridPosts);
        return gridPosts;
    };

    const handleUploadAll = async () => {
        if (Object.keys(mediaChosen).length === 0) return;

        setShowModal(true);
        try {
            const gridPosts = generateGridPosts();
            const postsToUpload = Object.keys(mediaChosen);

            for (const postId of postsToUpload) {
                const file = mediaFilesRef.current[postId];
                if (!file) continue;

                const gridPost = gridPosts.find(p => p.id === postId);
                if (!gridPost) continue;

                // Upload to storage (no platform-specific path)
                const filePath = `${user.id}/${selectedCampaignId}/${postId}-${Date.now()}-${file.name}`;
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

                // Check if this is an update or insert
                if (gridPost.isUploaded && gridPost.db_id) {
                    // UPDATE existing record (only update asset info, not platforms)
                    console.log('UPDATING post:', gridPost.db_id, 'with file:', file.name);
                    const { data: updateData, error: updateError } = await updateCampaignPost(gridPost.db_id, {
                        asset_url: assetUrl,
                        asset_name: file.name,
                        asset_type: file.type.startsWith('video') ? 'video' : 'image'
                    });
                    console.log('Update result:', { updateData, updateError });
                } else {
                    // INSERT new record with platforms auto-created
                    console.log('INSERTING new post for:', postId, 'with platforms:', campaignPlatforms);
                    await createCampaignPost({
                        user_id: user.id,
                        campaign_id: selectedCampaignId,
                        campaign_phase_id: gridPost.campaign_phase_id,
                        scheduled_time: gridPost.scheduled_time.toISOString(),
                        asset_url: assetUrl,
                        asset_name: file.name,
                        asset_type: file.type.startsWith('video') ? 'video' : 'image',
                        caption: '',
                        status: uploadError ? 'failed' : 'pending'
                    }, campaignPlatforms); // Pass platforms array
                }
            }

            // Refresh DB posts and clear selections
            await fetchDbPosts();
            setMediaChosen({});
            setPendingFileNames({});
            mediaFilesRef.current = {};

        } catch (err) {
            console.error('Upload error:', err);
        } finally {
            setShowModal(false);
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
                            {plannedCampaigns.map(campaign => (
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
                    {showGrid && (
                        <button
                            className={`px-4 py-2 rounded font-semibold transition-colors text-white ${Object.keys(mediaChosen).length > 0
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            disabled={Object.keys(mediaChosen).length === 0}
                            onClick={handleUploadAll}
                        >
                            Upload All ({Object.keys(mediaChosen).length})
                        </button>
                    )}
                </div>

                {selectedCampaign && showGrid && (
                    <CampaignPostsGrid
                        key={selectedCampaign.id}
                        campaign={selectedCampaign}
                        phases={selectedCampaign.phases || []}
                        posts={generateGridPosts()}
                        pendingFileNames={pendingFileNames}
                        onUpload={(post, file, done) => {
                            setMediaChosen(prev => ({ ...prev, [post.id]: true }));
                            setPendingFileNames(prev => ({ ...prev, [post.id]: file.name }));
                            mediaFilesRef.current[post.id] = file;
                            done();
                        }}
                    />
                )}

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
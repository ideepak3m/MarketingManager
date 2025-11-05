import React, { useState } from 'react';
import { bulkCreateCampaignPosts, bulkCreatePlatformEntries } from '../../services/database';

const ConfirmTimelineModal = ({ timeline, campaign, onClose, onConfirm }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const formatDate = (date) => {
        if (!date) return '-';
        if (typeof date === 'string') return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Generate post schedule (3 posts per week)
    const generatePostSchedule = () => {
        const posts = [];
        const platforms = campaign.platforms || [];

        timeline.phases.forEach((phase, phaseIdx) => {
            const start = new Date(phase.start);
            const end = new Date(phase.end);
            const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
            const weeks = Math.ceil(days / 7);

            // Generate 3 posts per week
            for (let w = 0; w < weeks; w++) {
                for (let p = 0; p < 3; p++) {
                    const scheduled = new Date(start.getTime() + (w * 7 + p * 2) * 24 * 60 * 60 * 1000);
                    if (scheduled > end) break;

                    posts.push({
                        user_id: campaign.user_id,
                        campaign_id: timeline.campaignId,
                        campaign_phase_id: phase.id || `phase-${phaseIdx}`, // Will need actual phase ID
                        scheduled_time: scheduled.toISOString(),
                        asset_url: null,
                        asset_name: null,
                        asset_type: 'image',
                        caption: null
                    });
                }
            }
        });

        return posts;
    };

    const handleConfirmLaunch = async () => {
        setIsProcessing(true);
        
        try {
            // Step 1: Call original onConfirm to update campaign/phase dates
            await onConfirm();

            // Step 2: Generate post schedule
            const posts = generatePostSchedule();
            console.log('Generated posts:', posts.length);

            // Step 3: Bulk insert campaign_posts
            const { data: createdPosts, error: postsError } = await bulkCreateCampaignPosts(posts);
            
            if (postsError) {
                console.error('Error creating posts:', postsError);
                alert('Failed to create campaign posts. Please try again.');
                setIsProcessing(false);
                return;
            }

            console.log('Created posts:', createdPosts.length);

            // Step 4: Create platform entries for each post
            const platformEntries = [];
            const platforms = campaign.platforms || [];
            
            createdPosts.forEach(post => {
                platforms.forEach(platform => {
                    platformEntries.push({
                        campaign_post_id: post.id,
                        user_id: campaign.user_id,
                        platform: platform,
                        platform_caption: null, // Will be filled by AI
                        hashtags: [],
                        status: 'pending'
                    });
                });
            });

            const { error: platformsError } = await bulkCreatePlatformEntries(platformEntries);
            
            if (platformsError) {
                console.error('Error creating platform entries:', postsError);
                // Don't fail - posts are created, platforms can be fixed later
            }

            console.log('Created platform entries:', platformEntries.length);

            // Step 5: Trigger n8n webhook for AI caption generation
            const n8nWebhookUrl = process.env.REACT_APP_N8N_WEBHOOK_URL;
            if (n8nWebhookUrl) {
                try {
                    await fetch(n8nWebhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            campaign_id: timeline.campaignId,
                            user_id: campaign.user_id,
                            campaign_name: campaign.name,
                            post_count: createdPosts.length
                        })
                    });
                    console.log('n8n webhook triggered successfully');
                } catch (webhookError) {
                    console.error('n8n webhook failed (captions will need manual generation):', webhookError);
                    // Don't fail the launch - AI generation is optional
                }
            }

            // Step 6: Show success modal
            setShowSuccessModal(true);
            
        } catch (error) {
            console.error('Launch error:', error);
            alert('Failed to launch campaign. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (showSuccessModal) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 text-center">
                    <div className="mb-6">
                        <i className="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Campaign Launched!
                        </h2>
                        <p className="text-gray-600">
                            AI is generating captions and hashtags for your posts.
                        </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-center gap-2 text-blue-700">
                            <i className="fas fa-robot"></i>
                            <span className="text-sm">
                                You can now upload assets in the Content page. Captions will be ready shortly.
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold w-full"
                    >
                        OK, Got It!
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    <i className="fas fa-check-circle text-green-600 mr-2"></i>
                    Confirm Campaign Timeline
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Campaign Start Date</div>
                            <div className="text-lg font-semibold text-blue-700">
                                {formatDate(timeline.campaignStart)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Campaign End Date</div>
                            <div className="text-lg font-semibold text-blue-700">
                                {formatDate(timeline.campaignEnd)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">
                        <i className="fas fa-layer-group mr-2 text-purple-600"></i>
                        Phase Timeline
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 border text-left">Phase Name</th>
                                    <th className="p-3 border text-left">Start Date</th>
                                    <th className="p-3 border text-left">End Date</th>
                                    <th className="p-3 border text-left">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timeline.phases && timeline.phases.length > 0 ? (
                                    timeline.phases.map((phase, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="p-3 border font-semibold text-indigo-700">
                                                {phase.name || `Phase ${idx + 1}`}
                                            </td>
                                            <td className="p-3 border text-gray-700">
                                                {formatDate(phase.start)}
                                            </td>
                                            <td className="p-3 border text-gray-700">
                                                {formatDate(phase.end)}
                                            </td>
                                            <td className="p-3 border text-gray-700">
                                                {phase.length} days
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-4 border text-center text-gray-400">
                                            No phase details available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <i className="fas fa-info-circle text-yellow-600 mr-3 mt-1"></i>
                        <div className="text-sm text-gray-700">
                            <strong className="text-gray-800">Please review carefully:</strong>
                            <p className="mt-1">
                                Once confirmed, this campaign will be launched with the timeline shown above.
                                The campaign and phase dates will be updated in the system.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        className="px-5 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700 transition-colors disabled:opacity-50"
                        onClick={onClose}
                        disabled={isProcessing}
                    >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Go Back
                    </button>
                    <button
                        className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleConfirmLaunch}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Launching...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-rocket mr-2"></i>
                                Confirm & Launch Campaign
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmTimelineModal;
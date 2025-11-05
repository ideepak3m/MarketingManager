import React, { useState, useRef } from 'react';

export default function CampaignPostsGrid({ campaign, phases, posts, onUpload, onShowCaptionModal }) {
    const [uploading, setUploading] = useState({});
    const fileInputRefs = useRef({});

    if (!campaign || campaign.status?.toLowerCase() !== 'planned') return null;

    const getPostsForPhase = (phaseId) => posts.filter(p => p.campaign_phase_id === phaseId);

    // Check if post has AI-generated captions
    const hasCaptions = (post) => {
        return post.platforms?.some(p => p.platform_caption && p.platform_caption.length > 0) || false;
    };

    const handleFileChange = async (post, file) => {
        if (file) {
            setUploading(u => ({ ...u, [post.id]: true }));
            await onUpload(post, file);
            setUploading(u => ({ ...u, [post.id]: false }));
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Scheduled Posts</h2>
            <table className="w-full text-sm rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Phase</th>
                        <th className="p-3 text-left">Post #</th>
                        <th className="p-3 text-left">Upload Media</th>
                        <th className="p-3 text-left">File Name</th>
                        <th className="p-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {phases.map(phase => (
                        getPostsForPhase(phase.id).map((post, idx) => {
                            const captionsReady = hasCaptions(post);
                            const hasAsset = post.asset_url && post.asset_name;
                            
                            return (
                                <tr key={post.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">
                                        {post.scheduled_time ? new Date(post.scheduled_time).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-3">{phase.name}</td>
                                    <td className="p-3">{idx + 1}</td>
                                    <td className="p-3">
                                        {hasAsset ? (
                                            <>
                                                <button
                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded font-semibold text-xs"
                                                    onClick={() => {
                                                        fileInputRefs.current[post.id]?.click();
                                                    }}
                                                >
                                                    Replace
                                                </button>
                                                <input
                                                    ref={el => fileInputRefs.current[post.id] = el}
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    style={{ display: 'none' }}
                                                    onChange={e => handleFileChange(post, e.target.files[0])}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded font-semibold text-xs"
                                                    disabled={uploading[post.id]}
                                                    onClick={() => fileInputRefs.current[post.id]?.click()}
                                                >
                                                    {uploading[post.id] ? 'Uploading...' : 'Choose File'}
                                                </button>
                                                <input
                                                    ref={el => fileInputRefs.current[post.id] = el}
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    style={{ display: 'none' }}
                                                    onChange={e => handleFileChange(post, e.target.files[0])}
                                                />
                                            </>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {post.asset_name || <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => onShowCaptionModal(post)}
                                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                                            title="View/Edit Captions"
                                        >
                                            <span className="text-xl">⋮</span>
                                            <span className={`w-2 h-2 rounded-full ${
                                                captionsReady ? 'bg-green-500' : 'bg-gray-300'
                                            }`}></span>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    ))}
                </tbody>
            </table>
        </div>
    );
}

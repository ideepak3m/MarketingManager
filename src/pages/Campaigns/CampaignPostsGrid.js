import React, { useState } from 'react';

// Example props: phases, posts, onUpload
export default function CampaignPostsGrid({ campaign, phases, posts, onUpload }) {
    const [uploading, setUploading] = useState({});

    // Only show grid for planned campaigns
    if (!campaign || campaign.status?.toLowerCase() !== 'planned') return null;

    // Helper to get posts for a phase
    const getPostsForPhase = (phaseId) => posts.filter(p => p.campaign_phase_id === phaseId);

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
                        <th className="p-3 text-left">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {phases.map(phase => (
                        getPostsForPhase(phase.id).map((post, idx) => (
                            <tr key={post.id || `${phase.id}-${idx}`} className="border-b">
                                <td className="p-3">{post.scheduled_time ? new Date(post.scheduled_time).toLocaleDateString() : '-'}</td>
                                <td className="p-3">{phase.name}</td>
                                <td className="p-3">{idx + 1}</td>
                                <td className="p-3">
                                    <input
                                        type="file"
                                        disabled={uploading[post.id]}
                                        onChange={e => {
                                            if (e.target.files[0]) {
                                                setUploading(u => ({ ...u, [post.id]: true }));
                                                onUpload(post, e.target.files[0], () => setUploading(u => ({ ...u, [post.id]: false })));
                                            }
                                        }}
                                    />
                                </td>
                                <td className="p-3">{post.file_name || '-'}</td>
                                <td className="p-3">{post.status || 'Pending'}</td>
                            </tr>
                        ))
                    ))}
                </tbody>
            </table>
        </div>
    );
}

import React, { useState, useRef } from 'react';

export default function CampaignPostsGrid({ campaign, phases, posts, onUpload, pendingFileNames = {} }) {
    const [uploading, setUploading] = useState({});
    const fileInputRefs = useRef({});

    if (!campaign || campaign.status?.toLowerCase() !== 'planned') return null;

    const getPostsForPhase = (phaseId) => posts.filter(p => p.campaign_phase_id === phaseId);

    const handleFileChange = (post, file) => {
        if (file) {
            setUploading(u => ({ ...u, [post.id]: true }));
            onUpload(post, file, () => {
                setUploading(u => ({ ...u, [post.id]: false }));
            });
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
                        <th className="p-3 text-left">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {phases.map(phase => (
                        getPostsForPhase(phase.id).map((post, idx) => {
                            const hasPendingChange = !!pendingFileNames[post.id];
                            return (
                                <tr key={post.id} className="border-b">
                                    <td className="p-3">
                                        {post.scheduled_time ? new Date(post.scheduled_time).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-3">{phase.name}</td>
                                    <td className="p-3">{idx + 1}</td>
                                    <td className="p-3">
                                        {post.isUploaded ? (
                                            <>
                                                <button
                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded font-semibold"
                                                    onClick={() => {
                                                        fileInputRefs.current[post.id]?.click();
                                                    }}
                                                >
                                                    Edit
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
                                            <input
                                                type="file"
                                                accept="image/*,video/*"
                                                disabled={uploading[post.id]}
                                                onChange={e => handleFileChange(post, e.target.files[0])}
                                            />
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <span className={hasPendingChange ? 'text-blue-600 font-semibold' : ''}>
                                            {post.file_name || '-'}
                                        </span>
                                        {hasPendingChange && (
                                            <span className="ml-2 text-xs text-blue-600">(pending)</span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${post.status === 'Uploaded' ? 'bg-green-100 text-green-800' :
                                                post.status === 'Error' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {post.status}
                                        </span>
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
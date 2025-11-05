import React, { useState, useEffect } from 'react';
import { getCampaignPosts } from '../services/database';

const CaptionModal = ({ post, onClose, onSave, onRefresh }) => {
    const [platforms, setPlatforms] = useState(post?.platforms || []);
    const [isGenerating, setIsGenerating] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState(new Date());

    useEffect(() => {
        setPlatforms(post?.platforms || []);
        // Check if any platform is still generating
        const generating = post?.platforms?.some(p => !p.platform_caption) || false;
        setIsGenerating(generating);
    }, [post]);

    const handlePlatformChange = (platformId, field, value) => {
        setPlatforms(prev => prev.map(p => 
            p.id === platformId ? { ...p, [field]: value } : p
        ));
    };

    const handleHashtagsChange = (platformId, value) => {
        // Convert comma-separated string to array
        const hashtagArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
        setPlatforms(prev => prev.map(p => 
            p.id === platformId ? { ...p, hashtags: hashtagArray } : p
        ));
    };

    const handleSave = () => {
        onSave(platforms);
        onClose();
    };

    const handleRefresh = async () => {
        setLastRefreshed(new Date());
        if (onRefresh) {
            await onRefresh();
        }
    };

    const renderAssetPreview = () => {
        if (!post?.asset_url) {
            return (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">No asset uploaded</p>
                </div>
            );
        }

        if (post.asset_type === 'video') {
            return (
                <video 
                    src={post.asset_url} 
                    controls 
                    className="w-full h-64 object-contain rounded-lg bg-black"
                />
            );
        }

        return (
            <img 
                src={post.asset_url} 
                alt={post.asset_name} 
                className="w-full h-64 object-contain rounded-lg bg-gray-100"
            />
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Post Content</h2>
                        <p className="text-sm text-gray-500">
                            Scheduled: {post?.scheduled_time ? new Date(post.scheduled_time).toLocaleDateString() : '-'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {isGenerating && (
                            <button
                                onClick={handleRefresh}
                                className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                            >
                                <i className="fas fa-sync-alt"></i>
                                Refresh
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Asset Preview */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Asset Preview</h3>
                        {renderAssetPreview()}
                        {post?.asset_name && (
                            <p className="text-sm text-gray-500 mt-2">
                                File: {post.asset_name}
                            </p>
                        )}
                    </div>

                    {/* Platform Captions */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-gray-700">Platform Content</h3>
                            {isGenerating && (
                                <span className="text-sm text-amber-600 flex items-center gap-2">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Last checked: {lastRefreshed.toLocaleTimeString()}
                                </span>
                            )}
                        </div>

                        <div className="space-y-4">
                            {platforms.map((platform) => (
                                <div 
                                    key={platform.id} 
                                    className="border rounded-lg p-4 bg-gray-50"
                                >
                                    {/* Platform Header */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <h4 className="font-semibold text-gray-800">{platform.platform}</h4>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            platform.status === 'published' ? 'bg-green-100 text-green-800' :
                                            platform.status === 'failed' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-200 text-gray-700'
                                        }`}>
                                            {platform.status}
                                        </span>
                                    </div>

                                    {/* Caption */}
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Caption
                                        </label>
                                        {!platform.platform_caption && isGenerating ? (
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-700 flex items-center gap-2">
                                                <i className="fas fa-robot"></i>
                                                <span>AI is generating caption, please check back later...</span>
                                            </div>
                                        ) : (
                                            <textarea
                                                value={platform.platform_caption || ''}
                                                onChange={(e) => handlePlatformChange(platform.id, 'platform_caption', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                rows="3"
                                                placeholder="Enter caption..."
                                            />
                                        )}
                                    </div>

                                    {/* Hashtags */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Hashtags
                                        </label>
                                        {!platform.hashtags?.length && isGenerating ? (
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-700 flex items-center gap-2">
                                                <i className="fas fa-robot"></i>
                                                <span>AI is generating hashtags, please check back later...</span>
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={platform.hashtags?.join(', ') || ''}
                                                onChange={(e) => handleHashtagsChange(platform.id, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="hashtag1, hashtag2, hashtag3..."
                                            />
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Separate hashtags with commas
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isGenerating}
                        className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors ${
                            isGenerating 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {isGenerating ? 'Waiting for AI...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CaptionModal;

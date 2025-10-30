import React, { useState } from 'react';

const PLATFORMS = [
    { key: 'facebook', label: 'Facebook', icon: 'fab fa-facebook-f' },
    { key: 'instagram', label: 'Instagram', icon: 'fab fa-instagram' },

    { key: 'pinterest', label: 'Pinterest', icon: 'fab fa-pinterest' },
    { key: 'tiktok', label: 'TikTok', icon: 'fab fa-tiktok' },

    { key: 'linkedin', label: 'LinkedIn', icon: 'fab fa-linkedin-in' },
    { key: 'reddit', label: 'Reddit', icon: 'fab fa-reddit' },

    { key: 'whatsapp', label: 'WhatsApp', icon: 'fab fa-whatsapp' },
    { key: 'email', label: 'Email', icon: 'fas fa-envelope' },
    { key: 'printmedia', label: 'Print Media', icon: 'fas fa-newspaper' },
];

export default function SocialPlatforms() {
    const [selected, setSelected] = useState('facebook');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-6">
                    <i className="fas fa-share-alt mr-3 text-blue-600"></i>
                    Social Platforms
                </h1>
                {/* Platform Tabs */}
                <div className="flex space-x-4 border-b border-gray-200 mb-8 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {PLATFORMS.map(platform => (
                        <button
                            key={platform.key}
                            className={`pb-2 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center space-x-2 flex-shrink-0 ${selected === platform.key ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
                            onClick={() => setSelected(platform.key)}
                        >
                            <i className={`${platform.icon} text-lg`}></i>
                            <span>{platform.label}</span>
                        </button>
                    ))}
                </div>
                {/* Platform Details */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">{PLATFORMS.find(p => p.key === selected).label} Integration</h2>
                    <div className="bg-gray-50 rounded-lg p-6 shadow-inner">
                        {/* Placeholder for platform-specific integration/settings */}
                        <p className="text-gray-600">Integration and settings for <b>{PLATFORMS.find(p => p.key === selected).label}</b> will appear here.</p>
                        {selected === 'facebook' || selected === 'instagram' ? (
                            <div className="mt-4">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                                    Connect to Meta ({PLATFORMS.find(p => p.key === selected).label})
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

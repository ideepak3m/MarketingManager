import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ChatBot = () => {
    const { user } = useAuth();

    // n8n chat widget URL - replace with your actual n8n chat URL
    const N8N_CHAT_URL = process.env.REACT_APP_N8N_CHAT_URL || 'https://your-n8n-instance.app.n8n.cloud/chat/your-chat-id';

    useEffect(() => {
        // Optional: You can send user context to n8n via URL parameters or postMessage
        if (user) {
            console.log('User authenticated for AI assistant:', user.email);
        }
    }, [user]);

    const handleIframeLoad = () => {
        // Optional: Send user context to the n8n chat widget when it loads
        const iframe = document.getElementById('n8n-chat-iframe');
        if (iframe && user) {
            // You can send user data to n8n chat via postMessage if needed
            const userContext = {
                user_id: user.id,
                user_email: user.email,
                user_name: user.user_metadata?.full_name || user.email
            };

            // Send context to n8n chat (if n8n supports receiving messages)
            iframe.contentWindow?.postMessage({
                type: 'USER_CONTEXT',
                data: userContext
            }, '*');
        }
    };

    if (!user) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
                    <i className="fas fa-lock text-4xl text-gray-400 mb-4"></i>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
                    <p className="text-gray-600">
                        Please log in to access the AI Campaign Assistant.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <i className="fas fa-robot text-white text-lg"></i>
                        </div>
                        <div className="ml-3">
                            <h1 className="text-xl font-semibold text-gray-800">AI Campaign Assistant</h1>
                            <p className="text-sm text-gray-500">
                                Powered by AI • Create campaigns through natural conversation
                            </p>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">
                        Welcome, {user.user_metadata?.full_name || user.email}
                    </div>
                </div>
            </div>

            {/* n8n Chat Widget Container */}
            <div className="flex-1 relative">
                {N8N_CHAT_URL.includes('your-n8n-instance') ? (
                    // Development placeholder when n8n URL is not configured
                    <div className="h-full flex items-center justify-center p-8">
                        <div className="text-center max-w-2xl">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <i className="fas fa-cog text-orange-600 text-2xl"></i>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Setup Required</h2>
                            <p className="text-gray-600 mb-6">
                                To enable the AI Campaign Assistant, you need to configure your n8n chat widget URL.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-6 text-left">
                                <h3 className="font-semibold text-gray-800 mb-3">Setup Instructions:</h3>
                                <ol className="space-y-2 text-sm text-gray-600">
                                    <li>1. Create an AI chat workflow in your n8n instance</li>
                                    <li>2. Enable the chat widget feature</li>
                                    <li>3. Copy the chat widget URL</li>
                                    <li>4. Add it to your <code className="bg-gray-200 px-1 rounded">.env.local</code> file:</li>
                                </ol>
                                <div className="mt-3 p-3 bg-gray-800 text-green-400 rounded text-sm font-mono">
                                    REACT_APP_N8N_CHAT_URL=https://your-n8n-instance.app.n8n.cloud/chat/your-chat-id
                                </div>
                            </div>
                            <div className="mt-6">
                                <a
                                    href="./n8n-integration-guide.md"
                                    target="_blank"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <i className="fas fa-book mr-2"></i>
                                    View Integration Guide
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Production: Embedded n8n chat widget
                    <iframe
                        id="n8n-chat-iframe"
                        src={N8N_CHAT_URL}
                        className="w-full h-full border-0"
                        title="AI Campaign Assistant"
                        onLoad={handleIframeLoad}
                        allow="microphone; camera; clipboard-read; clipboard-write"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
                    />
                )}
            </div>

            {/* Footer Info */}
            <div className="bg-white border-t border-gray-200 px-6 py-3 flex-shrink-0">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                        <span>🔒 Secure AI conversation</span>
                        <span>💾 Auto-saves to your campaigns</span>
                        <span>🎯 Database schema aware</span>
                    </div>
                    <div>
                        Powered by n8n AI
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;
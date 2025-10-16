import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ChatBot = () => {
    const { user } = useAuth();
    const [chatLoaded, setChatLoaded] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);

    // n8n chat widget URL - replace with your actual n8n chat URL
    const N8N_CHAT_URL = process.env.REACT_APP_N8N_CHAT_URL || 'https://your-n8n-instance.app.n8n.cloud/chat/your-chat-id';

    // Generate unique session ID for each chat conversation
    const generateSessionId = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : ((r & 0x3) | 0x8);
            return v.toString(16);
        });
    };

    useEffect(() => {
        if (user && !N8N_CHAT_URL.includes('your-n8n-instance')) {
            // Generate a new session ID for this chat conversation
            const sessionId = generateSessionId();
            setCurrentSessionId(sessionId);
            console.log('Generated session ID for user:', user.email, 'session:', sessionId);
        }
    }, [user]);

    const handleIframeLoad = () => {
        setChatLoaded(true);

        // Auto-send initial session data after chat loads
        if (currentSessionId && user) {
            setTimeout(() => {
                const initMessage = JSON.stringify({
                    sessionId: currentSessionId,
                    userEmail: user.email,
                    userName: user.user_metadata?.full_name || user.email,
                    action: 'initialize_session'
                });

                console.log('Auto-sending session initialization:', initMessage);

                // This would work if n8n chat accepts postMessage
                // iframe.contentWindow.postMessage(initMessage, '*');
            }, 1000); // Wait 1 second for chat to fully load
        }
    };

    // Build chat URL with session tracking parameters and auto-initialization
    const getChatUrl = () => {
        if (!currentSessionId || !user) return N8N_CHAT_URL;

        const url = new URL(N8N_CHAT_URL);
        url.searchParams.set('sessionId', currentSessionId);
        url.searchParams.set('userEmail', user.email);
        url.searchParams.set('userName', user.user_metadata?.full_name || user.email);

        // Auto-send initial session data as JSON
        const initData = {
            sessionId: currentSessionId,
            userEmail: user.email,
            userName: user.user_metadata?.full_name || user.email,
            action: 'initialize_session'
        };
        url.searchParams.set('autoMessage', JSON.stringify(initData));

        return url.toString();
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
                                Create campaigns through conversation • Powered by n8n AI
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
                                To enable the AI Campaign Assistant, configure your n8n chat widget URL.
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
                        </div>
                    </div>
                ) : (
                    // Production: n8n hosted chat with URL parameters for session tracking
                    <div className="relative w-full h-full">
                        {!chatLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading AI Assistant...</p>
                                </div>
                            </div>
                        )}
                        <iframe
                            src={getChatUrl()}
                            className="w-full h-full border-0"
                            style={{ minHeight: '500px' }}
                            onLoad={handleIframeLoad}
                            title="AI Campaign Assistant"
                        />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-center">
                    <div className="text-xs text-gray-500">
                        🤖 AI-powered conversation • 💾 Auto-saves campaigns • Powered by n8n & Priority One Tech
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NovaSessionService from '../services/NovaSessionService';

const ChatBot = () => {
    const { user } = useAuth();
    const [chatLoaded, setChatLoaded] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [copyStatus, setCopyStatus] = useState('Copy');
    const [showTooltip, setShowTooltip] = useState(false);
    const [sessionSaved, setSessionSaved] = useState(false);
    const [saveStatus, setSaveStatus] = useState('Save Campaign');

    // n8n chat widget URL - replace with your actual n8n chat URL
    const N8N_CHAT_URL = process.env.REACT_APP_N8N_CHAT_URL || 'https://your-n8n-instance.app.n8n.cloud/chat/your-chat-id';

    // Generate Nova session ID in format: NOVA-POT****-****
    const generateNovaSessionId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const getRandomChars = (length) => {
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };

        return `NOVA-POT${getRandomChars(4)}-${getRandomChars(4)}`;
    };

    // Copy session ID to clipboard
    const copySessionId = async () => {
        try {
            await navigator.clipboard.writeText(currentSessionId);
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus('Copy'), 2000);
        } catch (err) {
            console.error('Failed to copy session ID:', err);
            setCopyStatus('Failed');
            setTimeout(() => setCopyStatus('Copy'), 2000);
        }
    };

    // Handle clicking anywhere on the session ID area
    const handleSessionAreaClick = () => {
        copySessionId();
    };

    // Save Nova session to database
    const saveNovaSession = async () => {
        if (!currentSessionId || !user) {
            console.error('Session ID or user not available');
            return;
        }

    setSaveStatus('Saving...');

        try {
            const result = await NovaSessionService.registerSession(currentSessionId, user);

            if (result.success) {
                setSessionSaved(true);
                setSaveStatus('Saved ✓');
                console.log('Session saved successfully:', result.data);

                // Reset status after 3 seconds
                setTimeout(() => {
                    setSaveStatus('Saved ✓');
                }, 3000);
            } else {
                setSaveStatus('Save Failed');
                console.error('Failed to save session:', result.error);

                // Reset status after 3 seconds
                setTimeout(() => {
                    setSaveStatus('Save Campaign');
                }, 3000);
            }
        } catch (error) {
            setSaveStatus('Save Failed');
            console.error('Error saving session:', error);

            // Reset status after 3 seconds
            setTimeout(() => {
                setSaveStatus('Save Campaign');
            }, 3000);
        }
    };

    useEffect(() => {
        if (user && !N8N_CHAT_URL.includes('your-n8n-instance')) {
            // Check for existing session in localStorage first
            const storedSessionId = localStorage.getItem('nova_session_id');
            const storedTimestamp = localStorage.getItem('nova_session_created');

            if (storedSessionId && storedTimestamp) {
                // Use existing session if it exists (no expiration for now)
                setCurrentSessionId(storedSessionId);
                console.log('Restored Nova session ID:', storedSessionId);
                return;
            }

            // Generate new session if none exists
            const sessionId = generateNovaSessionId();
            const timestamp = new Date().toISOString();

            setCurrentSessionId(sessionId);

            // Store in localStorage for persistence
            localStorage.setItem('nova_session_id', sessionId);
            localStorage.setItem('nova_session_created', timestamp);

            console.log('Generated new Nova session ID for user:', user.email, 'session:', sessionId);
        }
    }, [user, N8N_CHAT_URL]);

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
            <div className="bg-white border-b border-gray-200 px-4 py-1 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <i className="fas fa-robot text-white text-sm"></i>
                        </div>
                        <div className="ml-2">
                            <h1 className="text-lg font-semibold text-gray-800">AI Campaign Assistant</h1>
                            <p className="text-xs text-gray-500">
                                Create campaigns through conversation • Powered by Priority One Tech AI
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">
                            Welcome, {user.user_metadata?.full_name || user.email}
                        </div>
                        {currentSessionId && (
                            <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-3">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Session ID:</span>
                                    <div className="relative">
                                        <button
                                            onClick={handleSessionAreaClick}
                                            onMouseEnter={() => setShowTooltip(true)}
                                            onMouseLeave={() => setShowTooltip(false)}
                                            className="flex items-center bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                                        >
                                            <span className="text-sm font-mono text-gray-800 select-all bg-white px-2 py-1 rounded border group-hover:bg-blue-50 transition-colors">
                                                {currentSessionId}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copySessionId();
                                                }}
                                                className={`ml-3 text-sm px-3 py-1 rounded transition-all duration-200 flex items-center space-x-1 ${copyStatus === 'Copied!'
                                                    ? 'bg-green-100 text-green-700 scale-105'
                                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                    }`}
                                            >
                                                {copyStatus === 'Copied!' && <i className="fas fa-check text-xs"></i>}
                                                <span>{copyStatus}</span>
                                            </button>
                                            <i className="fas fa-hand-pointer text-yellow-400 ml-2 text-xl transform -rotate-90 animate-pulse"></i>
                                        </button>

                                        {/* Tooltip */}
                                        {showTooltip && (
                                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                                                Copy this ID to use with Nova AI
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>


                            </div>
                        )}
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
                            style={{ minHeight: '400px', height: '400px' }}
                            onLoad={handleIframeLoad}
                            title="AI Campaign Assistant"
                        />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                        🤖 AI-powered conversation • 💾 Auto-saves campaigns • Powered by Priority One Tech
                    </div>

                    {/* Save Campaign Button */}
                    {currentSessionId && user && (
                        <button
                            onClick={saveNovaSession}
                            disabled={sessionSaved || saveStatus === 'Saving...'}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${sessionSaved
                                    ? 'bg-green-100 text-green-700 cursor-default'
                                    : saveStatus === 'Saving...'
                                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                                }`}
                        >
                            {saveStatus}
                        </button>
                    )}
                </div>
            </div>


        </div>
    );
};

export default ChatBot;
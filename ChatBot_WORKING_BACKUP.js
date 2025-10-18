import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveCampaignFromNova } from '../services/campaignSaveService';

const ChatBot = () => {
    const { user } = useAuth();
    const [chatLoaded, setChatLoaded] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [copyStatus, setCopyStatus] = useState('Copy');
    const [showTooltip, setShowTooltip] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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

    // Save campaign function
    const saveCampaign = async () => {
        if (!user || !currentSessionId) {
            alert('Session information is missing. Please refresh the page and try again.');
            return;
        }

        setIsSaving(true);
        try {
            const result = await saveCampaignFromNova(currentSessionId, user.email);

            if (result.success) {
                // Generate new session ID for next campaign AFTER successful save
                generateNewSession();

                alert('🎉 Campaign saved successfully! A new session ID has been generated for your next campaign. Check console for details.');

                // NO REDIRECT - let's debug first
            } else {
                alert(`Failed to save campaign: ${result.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Save campaign error:', error);
            alert(`An error occurred while saving the campaign: ${error.message}`);
        } finally {
            setIsSaving(false);
            setShowConfirmDialog(false);
        }
    };

    // Generate new session ID
    const generateNewSession = () => {
        const newSessionId = generateNovaSessionId();
        const timestamp = new Date().toISOString();

        setCurrentSessionId(newSessionId);

        // Store in localStorage for persistence
        localStorage.setItem('nova_session_id', newSessionId);
        localStorage.setItem('nova_session_created', timestamp);

        console.log('Generated new Nova session ID:', newSessionId);
    };

    // Handle save campaign confirmation
    const handleSaveCampaign = () => {
        setShowConfirmDialog(true);
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
                    <button
                        onClick={handleSaveCampaign}
                        disabled={!currentSessionId || isSaving}
                        className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center space-x-2 ${!currentSessionId || isSaving
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                            }`}
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save"></i>
                                <span>Save Campaign</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-2xl">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                                <i className="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Confirm Campaign Save</h3>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-600 mb-3">
                                Are you sure you want to save this campaign? Please confirm that:
                            </p>
                            <ul className="text-sm text-gray-600 space-y-2 ml-4">
                                <li>• ✅ You have finalized the campaign plan with Nova</li>
                                <li>• ✅ You are happy with the campaign strategy</li>
                                <li>• ⚠️ <strong>Once saved, the campaign cannot be modified</strong></li>
                            </ul>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveCampaign}
                                disabled={isSaving}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Campaign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
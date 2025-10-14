import React from 'react';

const ChatBot = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">AI Marketing Assistant</h1>
                <p className="text-gray-600">
                    This page will contain the AI chatbot for conversational campaign creation.
                </p>
                <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-semibold text-orange-800">Coming Soon:</h3>
                    <ul className="mt-2 text-orange-700">
                        <li>• Conversational campaign creation</li>
                        <li>• AI-powered content suggestions</li>
                        <li>• Natural language processing</li>
                        <li>• Automatic database population</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;
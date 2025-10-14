import React from 'react';

const Content = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Content Management</h1>
                <p className="text-gray-600">
                    This page will contain content creation and management for multiple social media platforms.
                </p>
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800">Coming Soon:</h3>
                    <ul className="mt-2 text-green-700">
                        <li>• Multi-platform content creation</li>
                        <li>• Template library</li>
                        <li>• Asset management</li>
                        <li>• Content calendar</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Content;
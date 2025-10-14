import React from 'react';

const Campaigns = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Campaign Management</h1>
                <p className="text-gray-600">
                    This page will contain campaign phase management with timelines and content scheduling.
                </p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Coming Soon:</h3>
                    <ul className="mt-2 text-blue-700">
                        <li>• Campaign creation wizard</li>
                        <li>• Phase management with timelines</li>
                        <li>• Content scheduling system</li>
                        <li>• Multi-platform coordination</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Campaigns;
import React from 'react';

const ConfirmTimelineModal = ({ timeline, onClose, onConfirm }) => {
    const formatDate = (date) => {
        if (!date) return '-';
        if (typeof date === 'string') return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    <i className="fas fa-check-circle text-green-600 mr-2"></i>
                    Confirm Campaign Timeline
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Campaign Start Date</div>
                            <div className="text-lg font-semibold text-blue-700">
                                {formatDate(timeline.campaignStart)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 mb-1">Campaign End Date</div>
                            <div className="text-lg font-semibold text-blue-700">
                                {formatDate(timeline.campaignEnd)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">
                        <i className="fas fa-layer-group mr-2 text-purple-600"></i>
                        Phase Timeline
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 border text-left">Phase Name</th>
                                    <th className="p-3 border text-left">Start Date</th>
                                    <th className="p-3 border text-left">End Date</th>
                                    <th className="p-3 border text-left">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timeline.phases && timeline.phases.length > 0 ? (
                                    timeline.phases.map((phase, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="p-3 border font-semibold text-indigo-700">
                                                {phase.name || `Phase ${idx + 1}`}
                                            </td>
                                            <td className="p-3 border text-gray-700">
                                                {formatDate(phase.start)}
                                            </td>
                                            <td className="p-3 border text-gray-700">
                                                {formatDate(phase.end)}
                                            </td>
                                            <td className="p-3 border text-gray-700">
                                                {phase.length} days
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-4 border text-center text-gray-400">
                                            No phase details available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <i className="fas fa-info-circle text-yellow-600 mr-3 mt-1"></i>
                        <div className="text-sm text-gray-700">
                            <strong className="text-gray-800">Please review carefully:</strong>
                            <p className="mt-1">
                                Once confirmed, this campaign will be launched with the timeline shown above.
                                The campaign and phase dates will be updated in the system.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        className="px-5 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700 transition-colors"
                        onClick={onClose}
                    >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Go Back
                    </button>
                    <button
                        className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        onClick={onConfirm}
                    >
                        <i className="fas fa-rocket mr-2"></i>
                        Confirm & Launch Campaign
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmTimelineModal;
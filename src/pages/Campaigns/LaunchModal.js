import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const LaunchModal = ({ campaign, onClose, onTimelineCalculated }) => {
    const [localLaunchDate, setLocalLaunchDate] = useState('');
    const [phases, setPhases] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch campaign phases
    useEffect(() => {
        const fetchPhases = async () => {
            if (!campaign.user_id) {
                setLoading(false);
                return;
            }

            try {
                console.log('Fetching phases for user_id:', campaign.user_id);
                const { data, error } = await supabase
                    .from('campaign_phases')
                    .select('id, name, start_date, end_date, Phase_length, phase_order')
                    .eq('user_id', campaign.user_id)
                    .order('phase_order', { ascending: true });

                if (error) {
                    console.error('Error fetching phases:', error);
                    setPhases([]);
                } else {
                    console.log('Fetched phases:', data);
                    setPhases(data || []);
                }
            } catch (err) {
                console.error('Exception fetching phases:', err);
                setPhases([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPhases();
    }, [campaign.user_id]);

    const handleCalculate = () => {
        if (!localLaunchDate) {
            alert('Please select a launch date');
            return;
        }

        console.log('=== CALCULATE BUTTON CLICKED ===');
        console.log('Launch date:', localLaunchDate);
        console.log('Phases:', phases);
        console.log('onTimelineCalculated function:', onTimelineCalculated);

        // Parse date string as local date to avoid timezone issues
        // localLaunchDate is in format "YYYY-MM-DD"
        const [year, month, day] = localLaunchDate.split('-').map(Number);
        const startDate = new Date(year, month - 1, day); // month is 0-indexed

        console.log('Parsed start date:', startDate.toLocaleDateString());

        let phaseTimings = [];
        let prevPhaseEnd = null;

        phases.forEach((phase, idx) => {
            let weeks = parseInt(phase.Phase_length, 10);
            if (isNaN(weeks) || weeks <= 0) weeks = 1;
            let phaseLengthDays = weeks * 7;

            let phaseStart;
            if (idx === 0) {
                // Phase 1 starts at campaign start date
                phaseStart = new Date(startDate);
            } else {
                // Next phase starts one day after previous phase ends
                phaseStart = new Date(prevPhaseEnd);
                phaseStart.setDate(phaseStart.getDate() + 1);
            }

            let phaseEnd = new Date(phaseStart);
            phaseEnd.setDate(phaseEnd.getDate() + phaseLengthDays - 1);

            phaseTimings.push({
                id: phase.id,  // Include phase ID
                name: phase.name || `Phase ${idx + 1}`,
                start: new Date(phaseStart),
                end: new Date(phaseEnd),
                length: phaseLengthDays
            });

            prevPhaseEnd = phaseEnd;
        });

        // Set campaign end date to last phase's end date
        const campaignEndDate = phaseTimings.length > 0
            ? phaseTimings[phaseTimings.length - 1].end
            : null;

        const timeline = {
            campaignId: campaign.id,
            campaignStart: startDate,
            campaignEnd: campaignEndDate,
            phases: phaseTimings
        };

        console.log('Calculated timeline:', timeline);
        console.log('Calling onTimelineCalculated...');

        // Call the parent's callback to show the confirmation modal
        if (onTimelineCalculated && typeof onTimelineCalculated === 'function') {
            onTimelineCalculated(timeline);
            console.log('onTimelineCalculated called successfully');
        } else {
            console.error('ERROR: onTimelineCalculated is not a function!', onTimelineCalculated);
            alert('Error: Unable to proceed. Please check console for details.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    <i className="fas fa-rocket text-purple-600 mr-2"></i>
                    Launch Campaign
                </h2>
                <p className="mb-4 text-gray-700">
                    Select a start date for <span className="font-semibold text-purple-700">{campaign.name}</span>:
                </p>

                <input
                    type="date"
                    className={`border-2 rounded-lg px-4 py-3 w-full mb-4 focus:outline-none focus:ring-2 transition-all ${!localLaunchDate
                        ? 'border-gray-300 bg-gray-50 focus:ring-purple-200 focus:border-purple-400'
                        : 'border-green-400 bg-green-50 focus:ring-green-200'
                        }`}
                    value={localLaunchDate}
                    onChange={e => setLocalLaunchDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                />

                <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <i className="fas fa-layer-group text-indigo-600 mr-2"></i>
                        Campaign Phases
                    </h3>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">
                            <i className="fas fa-spinner fa-spin text-2xl mr-2"></i>
                            <p className="mt-2">Loading phase information...</p>
                        </div>
                    ) : (
                        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-100 to-gray-50">
                                        <th className="p-3 border-b-2 text-left font-semibold text-gray-700">Phase Name</th>
                                        <th className="p-3 border-b-2 text-left font-semibold text-gray-700">Start Date</th>
                                        <th className="p-3 border-b-2 text-left font-semibold text-gray-700">End Date</th>
                                        <th className="p-3 border-b-2 text-left font-semibold text-gray-700">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {phases.length > 0 ? (
                                        phases.map((phase, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-3 border-b font-semibold text-indigo-700">
                                                    {phase.name || `Phase ${idx + 1}`}
                                                </td>
                                                <td className="p-3 border-b text-gray-600">
                                                    {phase.start_date
                                                        ? new Date(phase.start_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })
                                                        : 'Not set'}
                                                </td>
                                                <td className="p-3 border-b text-gray-600">
                                                    {phase.end_date
                                                        ? new Date(phase.end_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })
                                                        : 'Not set'}
                                                </td>
                                                <td className="p-3 border-b text-gray-600">
                                                    {phase.Phase_length ? `${parseInt(phase.Phase_length) * 7} days` : 'Not set'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-gray-400">
                                                <i className="fas fa-info-circle mr-2"></i>
                                                No phase details available for this campaign
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700 transition-colors font-medium"
                        onClick={onClose}
                    >
                        <i className="fas fa-times mr-2"></i>
                        Cancel
                    </button>
                    <button
                        className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
                        disabled={!localLaunchDate || localLaunchDate === '' || loading}
                        onClick={handleCalculate}
                    >
                        <i className="fas fa-calculator mr-2"></i>
                        Calculate Timeline
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LaunchModal;
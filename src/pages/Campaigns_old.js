import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import CampaignReportGenerator from '../services/CampaignReportGenerator';
import NovaSessionService from '../services/NovaSessionService';

const Campaigns = () => {
    // Helper to fetch campaign phases by user_id
    async function fetchCampaignPhases(userId) {
        console.log('Fetching campaign phases for userId:', userId);
        const { data, error } = await supabase
            .from('campaign_phases')
            .select('name, start_date, end_date, Phase_length, phase_order')
            .eq('user_id', userId)
            .order('phase_order', { ascending: true });
        if (error) {
            console.error('Error fetching campaign phases:', error);
            return [];
        }
        console.log('Fetched campaign phases:', data);
        return data || [];
    }
    // State for confirmation modal and calculated dates
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [calculatedTimeline, setCalculatedTimeline] = useState(null);
    // LaunchModal must be defined before the return statement
    function LaunchModal({ campaign, onClose }) {
        const [localLaunchDate, setLocalLaunchDate] = useState(launchDate || '');
        const [phases, setPhases] = useState([]);
        useEffect(() => {
            if (campaign.user_id) {
                fetchCampaignPhases(campaign.user_id).then(setPhases);
                console.log("Fetched phases:", phases);
            }
        }, [campaign.user_id]);

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Launch Campaign</h2>
                    <p className="mb-4 text-gray-700">Select a start date for <span className="font-semibold">{campaign.name}</span>:</p>
                    <input
                        type="date"
                        className={`border rounded px-3 py-2 w-full mb-4 focus:outline-none ${!localLaunchDate ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}
                        value={localLaunchDate}
                        onChange={e => setLocalLaunchDate(e.target.value)}
                    />
                    <div className="mb-4">
                        <h3 className="font-semibold text-gray-800 mb-2">Phase Timings</h3>
                        <table className="w-full text-sm border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border">Phase Name</th>
                                    <th className="p-2 border">Start Date</th>
                                    <th className="p-2 border">End Date</th>
                                    <th className="p-2 border">Length (days)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {phases.length > 0 ? phases.map((phase, idx) => (
                                    <tr key={idx}>
                                        <td className="p-2 border font-semibold text-indigo-700">{phase.name}</td>
                                        <td className="p-2 border">{phase.start_date ? new Date(phase.start_date).toISOString().slice(0, 10) : ''}</td>
                                        <td className="p-2 border">{phase.end_date ? new Date(phase.end_date).toISOString().slice(0, 10) : ''}</td>
                                        <td className="p-2 border">{phase.Phase_length || ''}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="p-2 border text-center text-gray-400">No phase details available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700"
                            onClick={onClose}
                        >Cancel</button>
                        <button
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                            disabled={!localLaunchDate || localLaunchDate === ''}
                            onClick={() => {
                                // Calculate campaign start/end from launch date and phases
                                console.log('Calculating timeline with launch date:', localLaunchDate);
                                if (!localLaunchDate) return;
                                const startDate = new Date(localLaunchDate);
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
                                    phaseEnd.setDate(phaseEnd.getDate() + phaseLengthDays);
                                    phaseTimings.push({
                                        name: phase.name || `Phase ${idx + 1}`,
                                        start: new Date(phaseStart),
                                        end: new Date(phaseEnd),
                                        length: phaseLengthDays
                                    });
                                    prevPhaseEnd = phaseEnd;
                                });
                                // Set campaign end date to last phase's end date
                                let campaignEndDate = phaseTimings.length > 0 ? phaseTimings[phaseTimings.length - 1].end : null;
                                setCalculatedTimeline({
                                    campaignStart: startDate,
                                    campaignEnd: campaignEndDate,
                                    phases: phaseTimings
                                });
                                setShowLaunchModal(false);
                                setShowConfirmModal(true);
                            }}
                        >Calculate</button>
                    </div>
                </div>
            </div>
        );
    }
    //}
    // Confirmation modal for calculated timeline
    const ConfirmTimelineModal = ({ timeline, onClose, onConfirm }) => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Campaign Timeline</h2>
                    <div className="mb-4">
                        <div className="mb-2 text-gray-700"><strong>Campaign Start:</strong> {timeline.campaignStart?.toISOString?.().slice(0, 10) || ''}</div>
                        <div className="mb-2 text-gray-700"><strong>Campaign End:</strong> {timeline.campaignEnd?.toISOString?.().slice(0, 10) || ''}</div>
                    </div>
                    <div className="mb-4">
                        <h3 className="font-semibold text-gray-800 mb-2">Phase Timings</h3>
                        <table className="w-full text-sm border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border">Phase Name</th>
                                    <th className="p-2 border">Start Date</th>
                                    <th className="p-2 border">End Date</th>
                                    <th className="p-2 border">Length (days)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(Array.isArray(timeline.phases) && timeline.phases.length > 0) ? timeline.phases.map((phase, idx) => (
                                    <tr key={idx}>
                                        <td className="p-2 border font-semibold text-indigo-700">{phase.name || `Phase ${idx + 1}`}</td>
                                        <td className="p-2 border">{phase.start?.toISOString?.().slice(0, 10) || ''}</td>
                                        <td className="p-2 border">{phase.end?.toISOString?.().slice(0, 10) || ''}</td>
                                        <td className="p-2 border">{phase.length || ''}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="p-2 border text-center text-gray-400">No phase details available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end space-x-3 mt-4">
                        <button
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700"
                            onClick={onClose}
                        >Cancel</button>
                        <button
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            onClick={() => {
                                if (window && window.open) {
                                    // Open the report in a new tab (simulate)
                                    window.open(`/api/generate-report?campaignId=${timeline.campaignId || ''}`, '_blank');
                                }
                                onConfirm();
                            }}
                        >Confirm & Launch</button>
                    </div>
                </div>
            </div>
        );
    };
    const [showLaunchModal, setShowLaunchModal] = useState(false);
    const [launchDate, setLaunchDate] = useState(null);
    const [launchingCampaign, setLaunchingCampaign] = useState(null);
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Fetch campaigns when component mounts
    useEffect(() => {
        if (user) {
            fetchCampaigns();
        }
    }, [user]);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get all session_ids for the logged-in user from nova_user_sessions
            const { data: sessionRows, error: sessionError } = await supabase
                .from('nova_user_sessions')
                .select('session_id')
                .eq('user_email', user.email);

            if (sessionError) {
                throw sessionError;
            }

            const sessionIds = sessionRows ? sessionRows.map(row => row.session_id.trim()) : [];
            console.log('Session IDs for user:', sessionIds);

            if (!sessionIds.length) {
                setCampaigns([]);
                setLoading(false);
                return;
            }

            // Try Supabase .in() query first
            const { data: campaignRows, error: campaignError } = await supabase
                .from('campaigns')
                .select('*')
                .in('user_id', sessionIds);
            const { data, error, status } = await supabase.from('campaigns').select('*');
            console.log({ status, error, data });

            console.log('Supabase .in() campaignRows:', campaignRows);
            const sessionResult = await supabase.auth.getSession();
            console.log('Session:', sessionResult);

            // Fallback: If .in() returns empty, fetch all campaigns and filter in JS
            let filteredCampaigns = campaignRows || [];
            if (!filteredCampaigns.length) {
                const { data: allCampaigns, error: allError } = await supabase
                    .from('campaigns')
                    .select('*');
                if (allError) throw allError;
                filteredCampaigns = allCampaigns.filter(c => sessionIds.includes(c.user_id.trim()));
                console.log('JS filtered campaigns:', filteredCampaigns);
            }

            setCampaigns(filteredCampaigns);
        } catch (err) {
            console.error('Error fetching campaigns:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async (campaign) => {
        try {
            const reportGenerator = new CampaignReportGenerator();
            const result = await reportGenerator.generateCampaignReport(campaign);

            if (result.success) {
                // Success message is shown by the generator itself
                console.log(`✅ ${result.message}`);
            } else {
                alert(`❌ Report Generation Failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Report Generation Error:', error);
            alert(`❌ Error: ${error.message}`);
        }
    };

    // Modal and Carousel functions
    const openModal = (campaign) => {
        console.log('openModal called with campaign:', campaign);
        setSelectedCampaign(campaign);
        setCurrentSlide(0);
    };

    const closeModal = () => {
        setSelectedCampaign(null);
        setCurrentSlide(0);
    };

    const nextSlide = () => {
        if (selectedCampaign) {
            const totalPhases = selectedCampaign.number_of_phases || 3;
            const totalSlides = 1 + totalPhases + 1; // Overview + Phases + Performance
            setCurrentSlide((prev) => (prev + 1) % totalSlides);
        }
    };

    const prevSlide = () => {
        if (selectedCampaign) {
            const totalPhases = selectedCampaign.number_of_phases || 3;
            const totalSlides = 1 + totalPhases + 1; // Overview + Phases + Performance
            setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
        }
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const getCurrentPhase = (campaign, phaseNumber) => {
        const now = new Date();
        const startDate = campaign.start_date ? new Date(campaign.start_date) : null;
        const endDate = campaign.end_date ? new Date(campaign.end_date) : null;

        if (!startDate || !endDate) return 'upcoming';

        const totalDuration = endDate.getTime() - startDate.getTime();
        const phaseDuration = totalDuration / campaign.number_of_phases;
        const phaseStartTime = startDate.getTime() + (phaseNumber - 1) * phaseDuration;
        const phaseEndTime = startDate.getTime() + phaseNumber * phaseDuration;

        if (now.getTime() < phaseStartTime) return 'upcoming';
        if (now.getTime() > phaseEndTime) return 'completed';
        return 'active';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatBudget = (budget) => {
        if (!budget || budget === 0) return 'TBD';
        return `$${parseFloat(budget).toLocaleString()}`;
    };

    const formatGoals = (goals) => {
        if (!goals) return [];

        try {
            const goalsObj = typeof goals === 'string' ? JSON.parse(goals) : goals;
            const formattedGoals = [];

            // Extract common goal fields
            if (goalsObj.target_audience) {
                formattedGoals.push(`Target ${goalsObj.target_audience}`);
            }
            if (goalsObj.budget) {
                formattedGoals.push(`Budget: $${parseFloat(goalsObj.budget).toLocaleString()}`);
            }
            if (goalsObj.primary_goal) {
                formattedGoals.push(goalsObj.primary_goal);
            }
            if (goalsObj.secondary_goals && Array.isArray(goalsObj.secondary_goals)) {
                formattedGoals.push(...goalsObj.secondary_goals);
            }

            // If no structured goals found, extract from any string values
            if (formattedGoals.length === 0) {
                Object.entries(goalsObj).forEach(([key, value]) => {
                    if (typeof value === 'string' && value.length > 5) {
                        formattedGoals.push(value);
                    }
                });
            }

            return formattedGoals;
        } catch (e) {
            // If parsing fails, return the original as a single goal
            return [goals.toString()];
        }
    };

    const getPlatformIcon = (platform) => {
        const platformName = platform.toLowerCase();
        if (platformName.includes('facebook')) return 'fab fa-facebook-f';
        if (platformName.includes('instagram')) return 'fab fa-instagram';
        if (platformName.includes('twitter') || platformName.includes('x.com')) return 'fab fa-twitter';
        if (platformName.includes('linkedin')) return 'fab fa-linkedin-in';
        if (platformName.includes('youtube')) return 'fab fa-youtube';
        if (platformName.includes('tiktok')) return 'fab fa-tiktok';
        if (platformName.includes('pinterest')) return 'fab fa-pinterest';
        if (platformName.includes('google')) return 'fab fa-google';
        return 'fas fa-globe'; // Default icon
    };

    const formatPlatforms = (campaign) => {
        // Try to get platforms from multiple possible sources
        let platforms = [];

        if (campaign.platforms && Array.isArray(campaign.platforms)) {
            platforms = campaign.platforms;
        } else if (campaign.goals) {
            try {
                const goalsObj = typeof campaign.goals === 'string' ? JSON.parse(campaign.goals) : campaign.goals;
                if (goalsObj.recommended_platforms && Array.isArray(goalsObj.recommended_platforms)) {
                    platforms = goalsObj.recommended_platforms;
                }
            } catch (e) {
                // Ignore parsing errors
            }
        }

        // Default platforms if none found
        if (platforms.length === 0) {
            platforms = ['Facebook', 'Instagram'];
        }

        return platforms;
    };

    const CampaignCard = ({ campaign }) => (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100" data-sessionid={campaign.userSessionID || ''}>
            {/* Campaign Header with Status Badge */}
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">{campaign.name}</h3>
                        <p className="text-blue-100 text-sm">{campaign.description}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'active' ? 'bg-green-500 text-white' :
                            campaign.status === 'draft' ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-800'}`}>
                            {campaign.status}
                        </span>
                    </div>
                </div>
            </div>
            {/* Campaign Metrics Dashboard */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Budget Card */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-green-600 text-2xl font-bold">
                            {formatBudget(campaign.budget)}
                        </div>
                        <div className="text-green-700 text-sm font-medium">Total Budget</div>
                    </div>
                    {/* Duration Card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <div className="text-blue-600 text-2xl font-bold">
                            {campaign.campaign_length || 'TBD'}
                        </div>
                        <div className="text-blue-700 text-sm font-medium">Duration</div>
                    </div>
                    {/* Phases Card */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                        <div className="text-purple-600 text-2xl font-bold">
                            {campaign.number_of_phases}
                        </div>
                        <div className="text-purple-700 text-sm font-medium">Phases</div>
                    </div>
                </div>
                {/* Timeline Section with Active Phase */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <i className="fas fa-calendar-alt mr-2 text-blue-600"></i>
                        Campaign Timeline
                    </h4>
                    {/* Main Timeline Bar */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-center">
                            <div className="text-sm text-gray-500">Start Date</div>
                            <div className="font-medium text-gray-800">{formatDate(campaign.start_date)}</div>
                        </div>
                        <div className="flex-1 mx-4">
                            <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-500">End Date</div>
                            <div className="font-medium text-gray-800">{formatDate(campaign.end_date)}</div>
                        </div>
                    </div>
                    {/* Phase Indicators */}
                    {campaign.number_of_phases > 0 && (
                        <div className="mt-4">
                            <div className="text-sm font-medium text-gray-600 mb-2">Campaign Phases</div>
                            <div className="flex space-x-2">
                                {Array.from({ length: campaign.number_of_phases }, (_, index) => {
                                    const currentPhase = getCurrentPhase(campaign, index + 1);
                                    return (
                                        <div key={index} className={`flex-1 text-center p-2 rounded-lg text-xs font-medium transition-all ${currentPhase === 'active'
                                            ? 'bg-green-100 text-green-800 border-2 border-green-500'
                                            : currentPhase === 'completed'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            <div className="font-semibold">Phase {index + 1}</div>
                                            <div className="text-xs mt-1">
                                                {currentPhase === 'active' && '🔄 Active'}
                                                {currentPhase === 'completed' && '✅ Done'}
                                                {currentPhase === 'upcoming' && '⏳ Upcoming'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                {/* Goals & Platforms Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Campaign Goals */}
                    {campaign.goals && (
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <i className="fas fa-target mr-2 text-green-600"></i>
                                Campaign Goals
                            </h4>
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <ul className="space-y-2">
                                    {formatGoals(campaign.goals).map((goal, index) => (
                                        <li key={index} className="flex items-start text-sm text-gray-700">
                                            <i className="fas fa-check-circle text-green-500 mr-2 mt-0.5 text-xs"></i>
                                            <span>{goal}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    {/* Recommended Platforms */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <i className="fas fa-share-alt mr-2 text-blue-600"></i>
                            Recommended Platforms
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex flex-wrap gap-3">
                                {formatPlatforms(campaign).map((platform, index) => (
                                    <div key={index} className="flex items-center bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                                        <i className={`${getPlatformIcon(platform)} mr-2 text-blue-600`}></i>
                                        <span className="text-sm font-medium text-gray-700">{platform}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Created: {formatDate(campaign.created_at)}
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => openModal(campaign)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <i className="fas fa-eye mr-2"></i>View Details
                        </button>
                        <button
                            onClick={() => generatePDF(campaign)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <i className="fas fa-file-pdf mr-2"></i>Generate Report
                        </button>
                        <button
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            onClick={() => {
                                setLaunchingCampaign(campaign);
                                setShowLaunchModal(true);
                            }}
                        >
                            <i className="fas fa-play mr-2"></i>Launch
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
    // ...existing code...
    if (!user) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
                    <i className="fas fa-lock text-4xl text-gray-400 mb-4"></i>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
                    <p className="text-gray-600">
                        Please log in to view your campaigns.
                    </p>
                </div>
            </div>
        );
    }

    // Campaign Modal Component with Carousel
    const CampaignModal = ({ campaign, currentSlide, onClose, onNext, onPrev, onGoToSlide }) => {
        const [showDebug, setShowDebug] = useState(false);
        if (!campaign || Object.keys(campaign).length === 0) {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-8 text-center">
                        <h2 className="text-xl font-bold text-red-700 mb-4">Error: No campaign data found</h2>
                        <p className="text-gray-700 mb-4">The campaign details could not be loaded. Please check the campaign object and try again.</p>
                        <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700" onClick={onClose}>Close</button>
                    </div>
                </div>
            );
        }
        console.log('CampaignModal props:', { campaign, currentSlide });
        const getPhaseTitle = (phaseNumber) => {
            const titles = {
                1: 'Awareness Building',
                2: 'Engagement & Interest',
                3: 'Conversion Push'
            };
            return titles[phaseNumber] || 'Campaign Phase';
        };
        const totalPhases = campaign.number_of_phases || 3;
        const slides = [
            { type: 'overview', title: 'Campaign Overview' },
            ...Array.from({ length: totalPhases }, (_, i) => ({
                type: 'phase',
                phaseNumber: i + 1,
                title: `Phase ${i + 1}: ${getPhaseTitle(i + 1)}`
            })),
            { type: 'performance', title: 'Performance Tracking' }
        ];
        const renderSlideContent = (slide) => {
            switch (slide.type) {
                case 'overview':
                    return (
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">{campaign.name}</h2>
                                <p className="text-gray-600">Your Roadmap to Success</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                    <div className="flex items-center mb-2">
                                        <i className="fas fa-calendar-alt text-blue-600 mr-2"></i>
                                        <h3 className="font-semibold text-gray-800">Duration</h3>
                                    </div>
                                    <p className="text-gray-700">{campaign.campaign_length || '8 weeks'}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                                    <div className="flex items-center mb-2">
                                        <i className="fas fa-dollar-sign text-green-600 mr-2"></i>
                                        <h3 className="font-semibold text-gray-800">Budget</h3>
                                    </div>
                                    <p className="text-gray-700">{campaign.budget ? `$${campaign.budget.toLocaleString()}` : 'TBD'}</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                                    <div className="flex items-center mb-2">
                                        <i className="fas fa-layer-group text-purple-600 mr-2"></i>
                                        <h3 className="font-semibold text-gray-800">Phases</h3>
                                    </div>
                                    <p className="text-gray-700">{campaign.number_of_phases || 3} Strategic Phases</p>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                                    <div className="flex items-center mb-2">
                                        <i className="fas fa-rocket text-orange-600 mr-2"></i>
                                        <h3 className="font-semibold text-gray-800">Launch Date</h3>
                                    </div>
                                    <p className="text-gray-700">{campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'TBD'}</p>
                                </div>
                            </div>
                            {campaign.description && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-2">Campaign Description</h3>
                                    <p className="text-gray-700 leading-relaxed">{campaign.description}</p>
                                </div>
                            )}
                        </div>
                    );
                case 'phase':
                    const phaseData = getPhaseData(slide.phaseNumber);
                    return (
                        <div className="p-6">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg mb-6">
                                <h2 className="text-2xl font-bold mb-2">Phase {slide.phaseNumber}: {phaseData.title}</h2>
                                <p className="opacity-90">{phaseData.subtitle}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                        <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                                        Content Strategy
                                    </h3>
                                    <ul className="space-y-2">
                                        {phaseData.contentStrategy.map((item, index) => (
                                            <li key={index} className="flex items-start">
                                                <i className="fas fa-check-circle text-green-500 mr-2 mt-1 text-sm"></i>
                                                <span className="text-gray-700 text-sm">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                        <i className="fas fa-chart-line text-blue-500 mr-2"></i>
                                        Success Metrics
                                    </h3>
                                    <ul className="space-y-2">
                                        {phaseData.successMetrics.map((metric, index) => (
                                            <li key={index} className="flex items-start">
                                                <i className="fas fa-bullseye text-indigo-500 mr-2 mt-1 text-sm"></i>
                                                <span className="text-gray-700 text-sm">{metric}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                                <p className="text-gray-700 italic text-sm">{phaseData.description}</p>
                            </div>
                        </div>
                    );
                case 'performance':
                    return (
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Performance Tracking</h2>
                                <p className="text-gray-600">Monitor, measure, and optimize your campaign</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-indigo-600">20K</div>
                                    <div className="text-sm text-gray-600">Total Reach</div>
                                </div>
                                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">3%</div>
                                    <div className="text-sm text-gray-600">Engagement Rate</div>
                                </div>
                                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-purple-600">10%</div>
                                    <div className="text-sm text-gray-600">Conversion Lift</div>
                                </div>
                                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">{campaign.budget ? '$' + Math.round(campaign.budget / 1000) + 'K' : '$2K'}</div>
                                    <div className="text-sm text-gray-600">Smart Budget</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                        <i className="fas fa-tools text-gray-600 mr-2"></i>
                                        Tracking Tools
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Google Analytics 4</li>
                                        <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Facebook Pixel</li>
                                        <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>UTM Parameters</li>
                                        <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Conversion Tracking</li>
                                    </ul>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                        <i className="fas fa-calendar text-gray-600 mr-2"></i>
                                        Reporting Schedule
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center"><i className="fas fa-circle text-blue-500 mr-2 text-xs"></i>Daily: Monitor key metrics</li>
                                        <li className="flex items-center"><i className="fas fa-circle text-green-500 mr-2 text-xs"></i>Weekly: Performance review</li>
                                        <li className="flex items-center"><i className="fas fa-circle text-purple-500 mr-2 text-xs"></i>Bi-weekly: Optimization</li>
                                        <li className="flex items-center"><i className="fas fa-circle text-red-500 mr-2 text-xs"></i>Monthly: Full analysis</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                default:
                    return <div>Loading...</div>;
            }
        };
        // Main modal return
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-8 relative">
                    <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={onClose}>
                        <i className="fas fa-times text-xl"></i>
                    </button>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 text-center">{slides[currentSlide].title}</h2>
                    </div>
                    <div>{renderSlideContent(slides[currentSlide])}</div>
                    {/* Carousel Controls */}
                    <div className="flex justify-between items-center mt-6">
                        <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700" onClick={onPrev}>
                            <i className="fas fa-chevron-left"></i> Prev
                        </button>
                        <div className="flex space-x-2">
                            {slides.map((slide, idx) => (
                                <button
                                    key={idx}
                                    className={`w-3 h-3 rounded-full border-2 ${idx === currentSlide ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-400'}`}
                                    onClick={() => onGoToSlide(idx)}
                                    aria-label={`Go to ${slide.title}`}
                                />
                            ))}
                        </div>
                        <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700" onClick={onNext}>
                            Next <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    {/* Debug Section */}
                    <div className="mt-4">
                        <button
                            className="px-3 py-1 bg-gray-200 rounded text-xs text-gray-700 hover:bg-gray-300"
                            onClick={() => setShowDebug((prev) => !prev)}
                        >
                            {showDebug ? 'Hide' : 'Show'} Debug Campaign Object
                        </button>
                        {showDebug && (
                            <pre className="bg-gray-100 p-3 mt-2 rounded text-xs overflow-x-auto max-h-64">
                                {JSON.stringify(campaign, null, 2)}
                            </pre>
                        )}
                    </div>
                </div>
            </div>
        );

        const getPhaseData = (phaseNumber) => {
            const phaseData = {
                1: {
                    title: 'Awareness Building',
                    subtitle: 'Capturing Hearts and Minds',
                    description: 'Focus on making a memorable first impression with visually stunning content that stops the scroll and sparks curiosity.',
                    contentStrategy: [
                        'High-quality product imagery highlighting condition and quality',
                        'Before-and-after style posts showing value comparison',
                        'Carousel posts featuring diverse product categories',
                        'Short video clips demonstrating product quality',
                        'Brand story content building trust and credibility'
                    ],
                    successMetrics: [
                        'Reach: 10,000 unique viewers',
                        'Engagement Rate: 2% across all content',
                        'Key Focus: Initial reach and engagement metrics',
                        'Platform Mix: 50% Facebook, 50% Instagram',
                        'Content Types: Images, videos, carousels'
                    ]
                },
                2: {
                    title: 'Engagement & Interest',
                    subtitle: 'Building Community and Trust',
                    description: 'Create meaningful engagement through strategy, authenticity, and understanding of what makes your audience tick.',
                    contentStrategy: [
                        'Conversation starters with engaging questions',
                        'Customer story features and testimonials',
                        'Interactive polls and community engagement',
                        'Behind-the-scenes content and transparency',
                        'User-generated content campaigns'
                    ],
                    successMetrics: [
                        'Engagement quality improvement',
                        'Lead generation and email signups',
                        'Social shares and saves increase',
                        'Community growth and interaction',
                        'Brand sentiment monitoring'
                    ]
                },
                3: {
                    title: 'Conversion Push',
                    subtitle: 'Converting Interest into Revenue',
                    description: 'Strategic sales offensive designed to convert engaged followers into enthusiastic customers with time-sensitive offers.',
                    contentStrategy: [
                        'Limited-time offers and flash sales',
                        'Retargeting campaigns for warm prospects',
                        'Social proof and customer testimonials',
                        'Urgency-driven messaging and countdowns',
                        'Clear calls-to-action and purchase paths'
                    ],
                    successMetrics: [
                        'Total Reach: 20,000 users',
                        'Engagement Rate: 3%',
                        'Conversion Increase: 10%',
                        'ROI Focus: Revenue per ad dollar',
                        'Customer Acquisition: New buyers'
                    ]
                }
            };

            return phaseData[phaseNumber] || phaseData[1];
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                {/* ...existing code... */}
                {/* Enhanced Header */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                                <i className="fas fa-bullhorn mr-3 text-blue-600"></i>
                                Your Campaigns
                            </h1>
                            <p className="text-gray-600 mt-2">Manage and track your AI-generated marketing campaigns</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{campaigns.length}</div>
                            <div className="text-sm text-gray-500">Active Campaigns</div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-4"></i>
                        <p className="text-gray-600">Loading campaigns...</p>
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center space-x-3 text-red-600">
                            <i className="fas fa-exclamation-triangle text-xl"></i>
                            <div>
                                <h3 className="text-red-800 font-medium">Error Loading Campaigns</h3>
                                <p className="text-red-700 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* No Campaigns State */}
                {!loading && !error && campaigns.length === 0 && (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <i className="fas fa-bullhorn text-4xl text-gray-400 mb-4"></i>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Campaigns Yet</h3>
                        <p className="text-gray-600 mb-4">
                            You haven't created any campaigns yet. Start by chatting with Nova AI!
                        </p>
                        <a
                            href="/chatbot"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <i className="fas fa-comments mr-2"></i>
                            Chat with Nova AI
                        </a>
                    </div>
                )}

                {/* Enhanced Campaign Grid */}
                {!loading && !error && campaigns.length > 0 && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {campaigns.map((campaign) => (
                            <CampaignCard key={campaign.id} campaign={campaign} />
                        ))}
                    </div>
                )}

                {/* Campaign Details Modal with Carousel */}
                {selectedCampaign && (
                    <CampaignModal
                        campaign={selectedCampaign}
                        currentSlide={currentSlide}
                        onClose={closeModal}
                        onNext={nextSlide}
                        onPrev={prevSlide}
                        onGoToSlide={goToSlide}
                    />
                )}

                {/* Launch Campaign Modal */}
                {showLaunchModal && launchingCampaign && (
                    <LaunchModal
                        campaign={launchingCampaign}
                        onClose={() => {
                            setShowLaunchModal(false);
                            setLaunchingCampaign(null);
                            setLaunchDate(null);
                        }}
                    />
                )}

                {/* Confirm Timeline Modal */}
                {showConfirmModal && calculatedTimeline && (
                    <ConfirmTimelineModal
                        timeline={calculatedTimeline}
                        onClose={() => {
                            setShowConfirmModal(false);
                            setCalculatedTimeline(null);
                            setShowLaunchModal(true);
                        }}
                        onConfirm={() => {
                            // Next step: update DB with calculated dates
                            setShowConfirmModal(false);
                            setCalculatedTimeline(null);
                            // TODO: Implement DB update logic in next phase
                        }}
                    />
                )}
            </div>
        );
    }

    export default Campaigns;

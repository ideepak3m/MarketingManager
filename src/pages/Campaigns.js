import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import CampaignReportGenerator from '../services/CampaignReportGenerator';

const Campaigns = () => {
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

            console.log('Fetching campaigns for user:', user?.email);

            // First, let's check what campaigns exist at all
            const { data: allCampaigns, error: allError } = await supabase
                .from('campaigns')
                .select('id, name, user_id, created_by_ai, ai_model_version, created_at')
                .order('created_at', { ascending: false });

            console.log('All campaigns in database:', allCampaigns);
            console.log('Any errors fetching all campaigns:', allError);

            // Fetch campaigns created by AI for the current user
            const { data, error } = await supabase
                .from('campaigns')
                .select(`
                    id,
                    name,
                    description,
                    campaign_type,
                    status,
                    start_date,
                    end_date,
                    budget,
                    number_of_phases,
                    created_at,
                    created_by_ai,
                    ai_model_version,
                    user_id,
                    campaign_length,
                    goals,
                    target_audience,
                    platforms
                `)
                .eq('created_by_ai', true)
                .eq('user_id', user?.email)
                .order('created_at', { ascending: false });

            console.log('AI campaigns query result:', data);
            console.log('AI campaigns query error:', error);

            if (error) {
                throw error;
            }

            setCampaigns(data || []);
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
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Campaign Header with Status Badge */}
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">{campaign.name}</h3>
                        <p className="text-blue-100 text-sm">{campaign.description}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${campaign.status === 'active' ? 'bg-green-500 text-white' :
                            campaign.status === 'draft' ? 'bg-yellow-500 text-white' :
                                'bg-gray-500 text-white'
                            }`}>
                            {campaign.status?.toUpperCase() || 'DRAFT'}
                        </span>
                        <span className="text-blue-100 text-xs">
                            <i className="fas fa-robot mr-1"></i>Nova AI
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
                                        <div
                                            key={index}
                                            className={`flex-1 text-center p-2 rounded-lg text-xs font-medium transition-all ${currentPhase === 'active'
                                                ? 'bg-green-100 text-green-800 border-2 border-green-500'
                                                : currentPhase === 'completed'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
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
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <i className="fas fa-play mr-2"></i>Launch
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

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
        const getPhaseTitle = (phaseNumber) => {
            const titles = {
                1: 'Awareness Building',
                2: 'Engagement & Interest',
                3: 'Conversion Push'
            };
            return titles[phaseNumber] || `Phase ${phaseNumber}`;
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
        ]; const renderSlideContent = (slide) => {
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
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                        <h1 className="text-xl font-bold text-gray-800">{slides[currentSlide]?.title}</h1>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    {/* Carousel Content */}
                    <div className="relative overflow-hidden flex-1">
                        <div
                            className="flex transition-transform duration-300 ease-in-out h-full"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                            {slides.map((slide, index) => (
                                <div key={index} className="w-full flex-shrink-0 overflow-y-auto">
                                    {renderSlideContent(slide)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between p-4 border-t border-gray-200 flex-shrink-0 bg-white">
                        <button
                            onClick={onPrev}
                            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <i className="fas fa-chevron-left mr-2"></i>
                            Previous
                        </button>

                        {/* Slide Indicators */}
                        <div className="flex space-x-2">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => onGoToSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide
                                        ? 'bg-indigo-600'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={onNext}
                            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            Next
                            <i className="fas fa-chevron-right ml-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
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
        </div>
    );
};

export default Campaigns;
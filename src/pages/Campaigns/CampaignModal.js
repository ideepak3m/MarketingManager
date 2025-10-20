

import React, { useState } from 'react';

const CampaignModal = ({ campaign, currentSlide = 0, onClose, onNext, onPrev, onGoToSlide }) => {
    const [showDebug, setShowDebug] = useState(false);
    // Slide logic: overview, phases, performance
    const totalPhases = campaign?.number_of_phases || (Array.isArray(campaign?.campaign_phases) ? campaign.campaign_phases.length : 3);
    const slides = [
        { type: 'overview', title: 'Campaign Overview' },
        ...Array.from({ length: totalPhases }, (_, i) => ({ type: 'phase', phaseNumber: i + 1, title: `Phase ${i + 1}` })),
        { type: 'performance', title: 'Performance Tracking' }
    ];
    const [slide, setSlide] = useState(currentSlide);

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

    // Helper for phase data (fallback to hardcoded if missing)
    const getPhaseData = (phaseNumber) => {
        if (Array.isArray(campaign.campaign_phases) && campaign.campaign_phases[phaseNumber - 1]) {
            return campaign.campaign_phases[phaseNumber - 1];
        }
        // fallback
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

    // Slide content rendering
    const renderSlideContent = (slideObj) => {
        switch (slideObj.type) {
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
                const phaseData = getPhaseData(slideObj.phaseNumber);
                return (
                    <div className="p-6">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg mb-6">
                            <h2 className="text-2xl font-bold mb-2">Phase {slideObj.phaseNumber}: {phaseData.title}</h2>
                            <p className="opacity-90">{phaseData.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                    <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                                    Content Strategy
                                </h3>
                                <ul className="space-y-2">
                                    {Array.isArray(phaseData.contentStrategy) && phaseData.contentStrategy.map((item, index) => (
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
                                    {Array.isArray(phaseData.successMetrics) && phaseData.successMetrics.map((metric, index) => (
                                        <li key={index} className="flex items-start">
                                            <i className="fas fa-bullseye text-indigo-500 mr-2 mt-1 text-sm"></i>
                                            <span className="text-gray-700 text-sm">{metric}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case 'performance':
                return (
                    <div className="p-6 text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Performance Tracking</h2>
                        <p className="text-gray-600">Monitor, measure, and optimize your campaign.</p>
                    </div>
                );
            default:
                return <div>Loading...</div>;
        }
    };

    // Navigation handlers
    const handlePrev = () => setSlide(slide > 0 ? slide - 1 : slides.length - 1);
    const handleNext = () => setSlide(slide < slides.length - 1 ? slide + 1 : 0);
    const handleGoToSlide = idx => setSlide(idx);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-8 relative">
                <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={onClose}>
                    <i className="fas fa-times text-xl"></i>
                </button>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">{slides[slide].title}</h2>
                </div>
                <div>{renderSlideContent(slides[slide])}</div>
                <div className="flex justify-between items-center mt-6">
                    <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700" onClick={handlePrev}>
                        <i className="fas fa-chevron-left"></i> Prev
                    </button>
                    <div className="flex space-x-2">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                className={`w-3 h-3 rounded-full border-2 ${idx === slide ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-400'}`}
                                onClick={() => handleGoToSlide(idx)}
                            />
                        ))}
                    </div>
                    <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700" onClick={handleNext}>
                        Next <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div className="mt-4">
                    <button className="px-3 py-1 bg-gray-200 rounded text-xs text-gray-700 hover:bg-gray-300" onClick={() => setShowDebug((prev) => !prev)}>
                        {showDebug ? 'Hide' : 'Show'} Debug Campaign Object
                    </button>
                    {showDebug && (
                        <pre className="bg-gray-100 p-3 mt-2 rounded text-xs overflow-x-auto max-h-64">{JSON.stringify(campaign, null, 2)}</pre>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignModal;

import { supabase } from '../../services/supabase';
import CampaignReportGenerator from '../../services/CampaignReportGenerator';
import React, { useState } from 'react';
import CampaignCard from './CampaignCard';
import useCampaigns from './useCampaigns';
import CampaignModal from './CampaignModal';
import LaunchModal from './LaunchModal';
import ConfirmTimelineModal from './ConfirmTimelineModal';

const Campaigns = () => {
    const { campaigns, loading, error, refetch } = useCampaigns();
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [showLaunchModal, setShowLaunchModal] = useState(false);
    const [launchingCampaign, setLaunchingCampaign] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [calculatedTimeline, setCalculatedTimeline] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Modal and Carousel functions
    const openModal = (campaign) => {
        console.log('Opening modal for campaign:', campaign);
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
            const totalSlides = 1 + totalPhases + 1;
            setCurrentSlide((prev) => (prev + 1) % totalSlides);
        }
    };

    const prevSlide = () => {
        if (selectedCampaign) {
            const totalPhases = selectedCampaign.number_of_phases || 3;
            const totalSlides = 1 + totalPhases + 1;
            setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
        }
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    // PDF generation using CampaignReportGenerator
    const generatePDF = (campaign) => {
        try {
            const reportGenerator = new CampaignReportGenerator();
            const result = reportGenerator.generateCampaignReport(campaign);
            if (result.success) {
                console.log(`✅ ${result.message}`);
            } else {
                alert(`❌ Report Generation Failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Report Generation Error:', error);
            alert(`❌ Error: ${error.message}`);
        }
    };

    // Handler for when timeline is calculated in LaunchModal
    const handleTimelineCalculated = (timeline) => {
        console.log('Timeline calculated in parent:', timeline);
        setCalculatedTimeline(timeline);
        setShowConfirmModal(true);
        setShowLaunchModal(false);
    };

    // Handler for confirming and launching the campaign
    const handleConfirmLaunch = async () => {
        // Log Supabase connection details for debugging
        // Log Supabase connection details for debugging
        // Import the raw values from supabase.js
        // eslint-disable-next-line

        console.log('Confirming launch with timeline:', calculatedTimeline);
        console.log('launchingCampaign:', launchingCampaign);
        console.log('launchingCampaign.id:', launchingCampaign && launchingCampaign.id);
        console.log('Current campaigns list:', campaigns);
        if (!launchingCampaign || !calculatedTimeline) return;
        try {
            // Update campaign table: status, start_date, end_date
            const { data: campaignUpdate, error: campaignError, status } = await supabase
                .from('campaigns')
                .update({
                    status: 'planned',
                    start_date: calculatedTimeline.campaignStart,
                    end_date: calculatedTimeline.campaignEnd
                })
                .eq('id', launchingCampaign.id)
                .select();
            console.log('Campaign update result:', campaignUpdate, 'Error:', campaignError, 'Status:', status);
            if (campaignError) throw campaignError;
            if (!campaignUpdate || campaignUpdate.length === 0) {
                throw new Error('No campaign rows updated. Check campaign ID and DB connection.');
            }

            // Update campaign_phases table: status, start_date, end_date for each phase
            for (const phase of calculatedTimeline.phases) {
                console.log('Updating campaign_phase:', phase);
                const { data: phaseUpdate, error: phaseError } = await supabase
                    .from('campaign_phases')
                    .update({
                        status: 'planned',
                        start_date: phase.start,
                        end_date: phase.end
                    })
                    .eq('campaign_id', launchingCampaign.id)
                    .eq('name', phase.name)
                    .select();
                console.log(`Phase update for ${phase.name}:`, phaseUpdate, 'Error:', phaseError, 'Phase ID:', phase.id);
                if (phaseError) throw phaseError;
                if (!phaseUpdate || phaseUpdate.length === 0) {
                    throw new Error(`No rows updated for phase ${phase.name}. Check phase name, campaign_id, and phase id.`);
                }
            }

            alert('Campaign launched and timeline updated!');
            setShowConfirmModal(false);
            setCalculatedTimeline(null);
            setLaunchingCampaign(null);
            // Refresh campaigns list to show updated dates
            refetch();
        } catch (err) {
            console.error('Error launching campaign:', err);
            alert('Failed to launch campaign: ' + (err.message || err));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-4"></i>
                    <p className="text-gray-600">Loading campaigns...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center space-x-3 text-red-600">
                        <i className="fas fa-exclamation-triangle text-xl"></i>
                        <div>
                            <h3 className="text-red-800 font-medium">Error Loading Campaigns</h3>
                            <p className="text-red-700 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            {/* Header */}
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

            {/* Campaign Cards Grid */}
            {campaigns.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <i className="fas fa-bullhorn text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Campaigns Yet</h3>
                    <p className="text-gray-600 mb-4">
                        You haven't created any campaigns yet. Start by chatting with Nova AI!
                    </p>
                    <a
                        href="/chatbot"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        <i className="fas fa-comments mr-2"></i>
                        Chat with Nova AI
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {campaigns.map(campaign => (
                        <CampaignCard
                            key={campaign.id}
                            campaign={campaign}
                            openModal={openModal}
                            generatePDF={generatePDF}
                            setLaunchingCampaign={setLaunchingCampaign}
                            setShowLaunchModal={setShowLaunchModal}
                        />
                    ))}
                </div>
            )}

            {/* Campaign Details Modal */}
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

            {/* Launch Modal - Date Selection */}
            {showLaunchModal && launchingCampaign && (
                <LaunchModal
                    campaign={launchingCampaign}
                    onClose={() => {
                        console.log('Closing Launch Modal');
                        setShowLaunchModal(false);
                        setLaunchingCampaign(null);
                    }}
                    onTimelineCalculated={handleTimelineCalculated}
                />
            )}

            {/* Confirmation Modal - Review Timeline */}
            {showConfirmModal && calculatedTimeline && (
                <ConfirmTimelineModal
                    timeline={calculatedTimeline}
                    onClose={() => {
                        console.log('Going back to Launch Modal');
                        setShowConfirmModal(false);
                        setCalculatedTimeline(null);
                        setShowLaunchModal(true); // Re-open launch modal to allow editing
                    }}
                    onConfirm={handleConfirmLaunch}
                />
            )}
        </div>
    );
};

export default Campaigns;
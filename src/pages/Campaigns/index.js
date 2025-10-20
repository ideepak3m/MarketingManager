// Main Campaigns page
import React from 'react';
import CampaignCard from './CampaignCard';
import useCampaigns from './useCampaigns';

const Campaigns = () => {
    const { campaigns, loading } = useCampaigns();
    if (loading) return <div>Loading...</div>;
    return (
        <div>
            {campaigns.map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
        </div>
    );
};

export default Campaigns;

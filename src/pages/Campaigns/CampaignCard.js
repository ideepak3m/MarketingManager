// Renders each campaign summary card
import React from 'react';

const CampaignCard = ({ campaign }) => (
    <div className="campaign-card">
        <h3>{campaign.name}</h3>
        {/* Add more campaign summary details here */}
    </div>
);

export default CampaignCard;

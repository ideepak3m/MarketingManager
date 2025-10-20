// Handles the carousel modal
import React from 'react';

const CampaignModal = ({ campaign, onClose }) => (
    <div className="modal">
        <button onClick={onClose}>Close</button>
        {/* Carousel and campaign details go here */}
    </div>
);

export default CampaignModal;

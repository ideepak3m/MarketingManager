// Handles launch + date selection
import React from 'react';

const LaunchModal = ({ campaign, onLaunch }) => (
    <div className="modal">
        {/* Date selection UI goes here */}
        <button onClick={onLaunch}>Confirm & Launch</button>
    </div>
);

export default LaunchModal;

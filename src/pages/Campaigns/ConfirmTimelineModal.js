// Handles final confirmation modal
import React from 'react';

const ConfirmTimelineModal = ({ campaign, onConfirm }) => (
    <div className="modal">
        {/* Final confirmation UI goes here */}
        <button onClick={onConfirm}>Confirm Timeline</button>
    </div>
);

export default ConfirmTimelineModal;

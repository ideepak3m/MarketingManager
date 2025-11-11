import React from 'react';
import { useAuth } from '../context/AuthContext';

const DemoBanner = () => {
    const { isDemoMode } = useAuth();

    if (!isDemoMode) return null;

    return (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 text-center text-sm font-medium shadow-lg">
            <div className="flex items-center justify-center space-x-2">
                <i className="fas fa-info-circle"></i>
                <span>
                    🎭 <strong>DEMO MODE</strong> - Explore freely! All data is fake and for demonstration purposes only.
                </span>
            </div>
        </div>
    );
};

export default DemoBanner;

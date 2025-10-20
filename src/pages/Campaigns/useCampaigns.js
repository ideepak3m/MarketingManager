// Custom hook for Supabase logic
import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

const useCampaigns = () => {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            console.log('Fetched sessionRows:', sessionRows);
            console.log('Session IDs:', sessionIds);
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
            console.log('Fetched campaignRows:', campaignRows);
            if (campaignError) console.error('Campaign fetch error:', campaignError);

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
            console.log('Final campaigns set in state:', filteredCampaigns);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { campaigns, loading, error };
};

export default useCampaigns;
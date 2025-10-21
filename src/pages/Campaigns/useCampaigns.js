// Custom hook for Supabase logic
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

const useCampaigns = () => {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const fetchCampaigns = useCallback(async () => {
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
            if (!sessionIds.length) {
                setCampaigns([]);
                setLoading(false);
                return;
            }

            // Fetch campaigns for these session IDs
            const { data: campaignRows, error: campaignError } = await supabase
                .from('campaigns')
                .select('*')
                .in('user_id', sessionIds);
            if (campaignError) throw campaignError;

            // Fetch all campaign_phases for these campaigns
            const campaignIds = (campaignRows || []).map(c => c.id);
            let phasesByCampaign = {};
            if (campaignIds.length > 0) {
                const { data: phaseRows, error: phaseError } = await supabase
                    .from('campaign_phases')
                    .select('*')
                    .in('campaign_id', campaignIds);
                if (phaseError) throw phaseError;
                // Group phases by campaign_id
                phasesByCampaign = (phaseRows || []).reduce((acc, phase) => {
                    if (!acc[phase.campaign_id]) acc[phase.campaign_id] = [];
                    acc[phase.campaign_id].push(phase);
                    return acc;
                }, {});
            }

            // Attach phases to each campaign
            const campaignsWithPhases = (campaignRows || []).map(c => ({
                ...c,
                phases: phasesByCampaign[c.id] || []
            }));

            setCampaigns(campaignsWithPhases);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchCampaigns();
        }
    }, [user, fetchCampaigns]);

    // Expose refetch for parent
    return { campaigns, loading, error, refetch: fetchCampaigns };
};

export default useCampaigns;
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

            // Check if user is admin - fetch with better error handling
            let isAdmin = false;
            try {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                console.log('Profile query result:', profile, profileError);
                isAdmin = profile?.role === 'admin';
            } catch (profileErr) {
                console.error('Error fetching profile:', profileErr);
                // Continue as regular user if profile fetch fails
            }

            let campaignRows;
            console.log('Fetching campaigns for user:', user.id, 'isAdmin:', isAdmin);
            if (isAdmin) {
                // Admin sees ALL campaigns
                const { data, error: campaignError } = await supabase
                    .from('campaigns')
                    .select('*')
                    .order('created_at', { ascending: false });
                console.log('Admin campaign fetch result:', data, campaignError);
                if (campaignError) throw campaignError;
                campaignRows = data;
                console.log('Admin fetched campaigns:', campaignRows);
            } else {
                // Regular users see only their campaigns
                // Get all session_ids for the logged-in user from nova_user_sessions
                const { data: sessionRows, error: sessionError } = await supabase
                    .from('nova_user_sessions')
                    .select('session_id')
                    .eq('user_id', user.id);

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
                const { data, error: campaignError } = await supabase
                    .from('campaigns')
                    .select('*')
                    .in('session_id', sessionIds);

                if (campaignError) throw campaignError;
                campaignRows = data;
            }

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
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
);

/**
 * Campaign Processing Service
 * Handles moving data from campaign_capture_byNova to structured tables
 */
export class CampaignProcessingService {

    /**
     * Process the most recent campaign by user email
     * @param {string} userEmail - The user email to process campaigns for
     * @returns {Promise<{success: boolean, campaignId?: string, error?: string}>}
     */
    static async processCampaignByUserEmail(userEmail) {
        try {
            console.log('Processing most recent campaign for user:', userEmail);

            // Find the most recent capture record by user_email
            const { data: captureData, error: captureError } = await supabase
                .from('campaign_capture_byNova')
                .select('id, campaign, summaryText, session_id, user_email, created_at')
                .eq('user_email', userEmail)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (captureError || !captureData) {
                return {
                    success: false,
                    error: `No campaign data found for user ${userEmail}: ${captureError?.message || 'Not found'}`
                };
            }

            console.log('Found capture data:', captureData);

            // Validate that we have campaign data
            if (!captureData.campaign || captureData.campaign.trim() === '') {
                return {
                    success: false,
                    error: 'No campaign data available to process'
                };
            }

            // Call the processing function
            const { data: campaignId, error: processError } = await supabase
                .rpc('process_campaign_from_capture', {
                    p_capture_id: captureData.id
                });

            if (processError) {
                return {
                    success: false,
                    error: `Processing failed: ${processError.message}`
                };
            }

            console.log('Campaign processing completed successfully!');
            console.log('New campaign ID:', campaignId);

            return {
                success: true,
                campaignId: campaignId,
                captureData: captureData
            };

        } catch (error) {
            console.error('Error in processCampaignByUserEmail:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Process a single campaign by session ID
     * @param {string} sessionId - The session ID to process
     * @returns {Promise<{success: boolean, campaignId?: string, error?: string}>}
     */
    static async processCampaignBySessionId(sessionId) {
        try {
            console.log('Processing campaign for session:', sessionId);

            // Find the capture record by session_id
            const { data: captureData, error: captureError } = await supabase
                .from('campaign_capture_byNova')
                .select('id, campaign, summaryText, session_id, user_email, created_at')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (captureError || !captureData) {
                return {
                    success: false,
                    error: `No campaign data found for session ${sessionId}: ${captureError?.message || 'Not found'}`
                };
            }

            console.log('Found capture data:', captureData);

            // Validate that we have campaign data
            if (!captureData.campaign || captureData.campaign.trim() === '') {
                return {
                    success: false,
                    error: 'No campaign data available to process'
                };
            }

            // Call the processing function
            const { data: campaignId, error: processError } = await supabase
                .rpc('process_campaign_from_capture', {
                    p_capture_id: captureData.id
                });

            if (processError) {
                return {
                    success: false,
                    error: `Processing failed: ${processError.message}`
                };
            }

            console.log('Campaign processing completed successfully!');
            console.log('New campaign ID:', campaignId);

            return {
                success: true,
                campaignId: campaignId,
                captureData: captureData
            };

        } catch (error) {
            console.error('Error in processCampaignBySessionId:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Process a specific campaign capture by ID
     * @param {number} captureId - The capture record ID to process
     * @returns {Promise<{success: boolean, campaignId?: string, error?: string}>}
     */
    static async processCampaignById(captureId) {
        try {
            console.log('Processing campaign capture ID:', captureId);

            // Call the processing function directly
            const { data: campaignId, error: processError } = await supabase
                .rpc('process_campaign_from_capture', {
                    p_capture_id: captureId
                });

            if (processError) {
                return {
                    success: false,
                    error: `Processing failed: ${processError.message}`
                };
            }

            return {
                success: true,
                campaignId: campaignId
            };

        } catch (error) {
            console.error('Error in processCampaignById:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Process all unprocessed campaigns
     * @returns {Promise<{success: boolean, results?: Array, error?: string}>}
     */
    static async processAllUnprocessedCampaigns() {
        try {
            console.log('Processing all unprocessed campaigns...');

            const { data: results, error: processError } = await supabase
                .rpc('process_all_unprocessed_campaigns');

            if (processError) {
                return {
                    success: false,
                    error: `Batch processing failed: ${processError.message}`
                };
            }

            console.log('Batch processing completed:', results);

            return {
                success: true,
                results: results
            };

        } catch (error) {
            console.error('Error in processAllUnprocessedCampaigns:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get campaign capture data by session ID
     * @param {string} sessionId - The session ID to lookup
     * @returns {Promise<{success: boolean, data?: object, error?: string}>}
     */
    static async getCaptureDataBySessionId(sessionId) {
        try {
            const { data, error } = await supabase
                .from('campaign_capture_byNova')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: false });

            if (error) {
                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: true,
                data: data
            };

        } catch (error) {
            console.error('Error in getCaptureDataBySessionId:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get processed campaign data by campaign ID
     * @param {string} campaignId - The campaign ID to lookup
     * @returns {Promise<{success: boolean, campaign?: object, phases?: Array, error?: string}>}
     */
    static async getProcessedCampaignData(campaignId) {
        try {
            // Get campaign data
            const { data: campaign, error: campaignError } = await supabase
                .from('campaigns')
                .select('*')
                .eq('id', campaignId)
                .single();

            if (campaignError) {
                return {
                    success: false,
                    error: `Campaign not found: ${campaignError.message}`
                };
            }

            // Get campaign phases
            const { data: phases, error: phasesError } = await supabase
                .from('campaign_phases')
                .select('*')
                .eq('campaign_id', campaignId)
                .order('phase_order');

            if (phasesError) {
                console.warn('Error fetching phases:', phasesError.message);
            }

            return {
                success: true,
                campaign: campaign,
                phases: phases || []
            };

        } catch (error) {
            console.error('Error in getProcessedCampaignData:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default CampaignProcessingService;
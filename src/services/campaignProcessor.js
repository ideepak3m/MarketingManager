// Campaign Processing Service
// Handles calling the SQL function to process campaigns from raw data

import { supabase } from './supabase';

export class CampaignProcessor {
    /**
     * Process campaign data from raw capture table to structured tables
     * @param {string} userEmail - User's email address  
     * @returns {Promise<Object>} Processing result
     */
    static async processCampaignByEmail(userEmail) {
        try {
            console.log('Processing campaign for email:', userEmail);

            // Step 1: Check and update missing userEmail in raw data
            const updateResult = await this.ensureUserEmailInRawData(userEmail);
            if (!updateResult.success) {
                return updateResult;
            }

            // Step 2: Call the SQL function to process the campaign
            const { data, error } = await supabase.rpc('process_campaign_by_email', {
                input_email: userEmail
            });

            if (error) {
                console.error('Supabase RPC error:', error);
                return {
                    success: false,
                    error: error.message || 'Database function call failed'
                };
            }

            console.log('Campaign processing result:', data);

            // The function returns JSON, so return it directly
            return data;

        } catch (error) {
            console.error('Campaign processing error:', error);
            return {
                success: false,
                error: error.message || 'Unknown error occurred'
            };
        }
    }

    /**
     * Ensure userEmail is filled in campaign_capture_byNova records
     * @param {string} userEmail - User's email to fill in missing records
     * @returns {Promise<Object>} Update result
     */
    static async ensureUserEmailInRawData(userEmail) {
        try {
            console.log('Checking for missing userEmail in raw data...');

            // Find records with missing userEmail that have campaign data
            const { data: missingEmailRecords, error: findError } = await supabase
                .from('campaign_capture_byNova')
                .select('id, "sessionId", created_at')
                .is('userEmail', null)
                .not('campaign', 'is', null)
                .order('created_at', { ascending: false });

            if (findError) {
                console.error('Error finding missing email records:', findError);
                return {
                    success: false,
                    error: 'Failed to check for missing email records'
                };
            }

            if (missingEmailRecords && missingEmailRecords.length > 0) {
                console.log(`Found ${missingEmailRecords.length} records with missing userEmail, updating...`);

                // Update all records with missing userEmail
                const { error: updateError } = await supabase
                    .from('campaign_capture_byNova')
                    .update({ userEmail: userEmail })
                    .is('userEmail', null)
                    .not('campaign', 'is', null);

                if (updateError) {
                    console.error('Error updating missing emails:', updateError);
                    return {
                        success: false,
                        error: 'Failed to update missing email records'
                    };
                }

                console.log(`✅ Updated ${missingEmailRecords.length} records with userEmail: ${userEmail}`);
            } else {
                console.log('✅ All records already have userEmail filled');
            }

            return {
                success: true,
                updatedRecords: missingEmailRecords?.length || 0
            };

        } catch (error) {
            console.error('Error ensuring userEmail in raw data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Check if user has raw campaign data available for processing
     * @param {string} userEmail - User's email address
     * @returns {Promise<Object>} Check result
     */
    static async hasUnprocessedCampaigns(userEmail) {
        try {
            const { data, error, count } = await supabase
                .from('campaign_capture_byNova')
                .select('id, created_at, "sessionId"', { count: 'exact' })
                .eq('userEmail', userEmail)
                .not('campaign', 'is', null)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error checking raw data:', error);
                return {
                    hasData: false,
                    error: error.message
                };
            }

            return {
                hasData: count > 0,
                totalRecords: count,
                latestSession: data?.[0]?.sessionId || null,
                latestCreated: data?.[0]?.created_at || null
            };

        } catch (error) {
            console.error('Error checking raw campaign data:', error);
            return {
                hasData: false,
                error: error.message
            };
        }
    }
}
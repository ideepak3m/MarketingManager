import { supabase } from './supabase';

/**
 * Nova Session Service
 * Handles mapping Nova session IDs to authenticated users
 */
export class NovaSessionService {

    /**
     * Register a Nova session ID for the current user
     * @param {string} sessionId - Nova session ID (NOVA-POT****-****)
     * @param {Object} user - Supabase user object
     * @returns {Promise<{success: boolean, data?: object, error?: string}>}
     */
    static async registerSession(sessionId, user) {
        try {
            if (!sessionId || !user) {
                return {
                    success: false,
                    error: 'Session ID and user are required'
                };
            }

            // Check if session already exists
            const { data: existingSession, error: checkError } = await supabase
                .from('nova_user_sessions')
                .select('id, user_email')
                .eq('session_id', sessionId)
                .single();

            if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
                console.error('Error checking existing session:', checkError);
                return {
                    success: false,
                    error: checkError.message
                };
            }

            if (existingSession) {
                console.log('Session already registered:', sessionId);
                return {
                    success: true,
                    data: existingSession,
                    message: 'Session already registered'
                };
            }

            // Register new session
            const { data, error } = await supabase
                .from('nova_user_sessions')
                .insert({
                    session_id: sessionId,
                    user_id: user.id,
                    user_email: user.email
                })
                .select()
                .single();

            if (error) {
                console.error('Error registering Nova session:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            console.log('Successfully registered Nova session:', sessionId, 'for user:', user.email);
            return {
                success: true,
                data: data
            };

        } catch (error) {
            console.error('Error in registerSession:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get all Nova sessions for a user
     * @param {Object} user - Supabase user object
     * @returns {Promise<{success: boolean, sessions?: Array, error?: string}>}
     */
    static async getUserSessions(user) {
        try {
            if (!user) {
                return {
                    success: false,
                    error: 'User is required'
                };
            }

            const { data, error } = await supabase
                .from('nova_user_sessions')
                .select('*')
                .eq('user_email', user.email)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching user sessions:', error);
                return {
                    success: false,
                    error: error.message
                };
            }

            return {
                success: true,
                sessions: data || []
            };

        } catch (error) {
            console.error('Error in getUserSessions:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default NovaSessionService;
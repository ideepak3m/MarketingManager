// Supabase Connection Test Utility
import { supabase } from './supabase'

export const testSupabaseConnection = async () => {
    console.log('🔍 Testing Supabase Connection...')

    // Check environment variables
    console.log('Environment Variables:')
    console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL)
    console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set' : 'Not Set')

    try {
        // Test basic connection
        const { data, error } = await supabase.auth.getSession()

        if (error) {
            console.error('❌ Supabase Connection Error:', error)
            return {
                success: false,
                error: error.message,
                details: 'Failed to get session from Supabase'
            }
        }

        console.log('✅ Supabase Connection Successful')
        console.log('Session Data:', data)

        return {
            success: true,
            data,
            message: 'Supabase connection is working'
        }

    } catch (err) {
        console.error('❌ Connection Test Failed:', err)
        return {
            success: false,
            error: err.message,
            details: 'Network or configuration error'
        }
    }
}

export const validateEnvironment = () => {
    const errors = []

    if (!process.env.REACT_APP_SUPABASE_URL) {
        errors.push('REACT_APP_SUPABASE_URL is not set')
    } else if (!process.env.REACT_APP_SUPABASE_URL.includes('supabase.co')) {
        errors.push('REACT_APP_SUPABASE_URL does not appear to be a valid Supabase URL')
    }

    if (!process.env.REACT_APP_SUPABASE_ANON_KEY) {
        errors.push('REACT_APP_SUPABASE_ANON_KEY is not set')
    } else if (process.env.REACT_APP_SUPABASE_ANON_KEY.length < 100) {
        errors.push('REACT_APP_SUPABASE_ANON_KEY appears to be invalid (too short)')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}
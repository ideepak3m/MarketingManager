import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                setUser(session?.user ?? null)
            } catch (error) {
                console.error('Failed to get session:', error)
                toast.error('Failed to connect to authentication service')
            }
            setLoading(false)
        }

        getSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => subscription?.unsubscribe()
    }, [])    // Sign in with email and password
    const signIn = async (email, password) => {
        try {
            setLoading(true)
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                toast.error(error.message)
                return { error }
            }

            toast.success('Successfully signed in!')
            return { error: null }
        } catch (error) {
            toast.error('An unexpected error occurred')
            return { error }
        } finally {
            setLoading(false)
        }
    }

    // Sign up with email and password
    const signUp = async (email, password, userData = {}) => {
        try {
            setLoading(true)
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: userData
                }
            })

            if (error) {
                toast.error(error.message)
                return { error }
            }

            toast.success('Check your email for verification link!')
            return { error: null }
        } catch (error) {
            toast.error('An unexpected error occurred')
            return { error }
        } finally {
            setLoading(false)
        }
    }

    // Sign out
    const signOut = async () => {
        try {
            setLoading(true)
            const { error } = await supabase.auth.signOut()

            if (error) {
                toast.error(error.message)
                return { error }
            }

            toast.success('Successfully signed out!')
            return { error: null }
        } catch (error) {
            toast.error('An unexpected error occurred')
            return { error }
        } finally {
            setLoading(false)
        }
    }

    // Reset password
    const resetPassword = async (email) => {
        try {
            setLoading(true)
            const { error } = await supabase.auth.resetPasswordForEmail(email)

            if (error) {
                toast.error(error.message)
                return { error }
            }

            toast.success('Password reset email sent!')
            return { error: null }
        } catch (error) {
            toast.error('An unexpected error occurred')
            return { error }
        } finally {
            setLoading(false)
        }
    }

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
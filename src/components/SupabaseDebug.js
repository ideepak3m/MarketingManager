import React, { useState, useEffect } from 'react'
import { testSupabaseConnection, validateEnvironment } from '../services/debug'

const SupabaseDebug = () => {
    const [connectionStatus, setConnectionStatus] = useState(null)
    const [envStatus, setEnvStatus] = useState(null)

    useEffect(() => {
        const runTests = async () => {
            // Test environment
            const envTest = validateEnvironment()
            setEnvStatus(envTest)

            // Test connection
            const connectionTest = await testSupabaseConnection()
            setConnectionStatus(connectionTest)
        }

        runTests()
    }, [])

    return (
        <div className="fixed top-4 right-4 bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-md">
            <h3 className="font-bold text-lg mb-3">🔍 Supabase Debug Info</h3>

            {/* Environment Status */}
            <div className="mb-3">
                <h4 className="font-semibold text-sm">Environment Variables:</h4>
                {envStatus ? (
                    <div>
                        <p className={`text-sm ${envStatus.isValid ? 'text-green-600' : 'text-red-600'}`}>
                            {envStatus.isValid ? '✅ Valid' : '❌ Invalid'}
                        </p>
                        {envStatus.errors.length > 0 && (
                            <ul className="text-xs text-red-600 mt-1">
                                {envStatus.errors.map((error, index) => (
                                    <li key={index}>• {error}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">Testing...</p>
                )}
            </div>

            {/* Connection Status */}
            <div className="mb-3">
                <h4 className="font-semibold text-sm">Connection Status:</h4>
                {connectionStatus ? (
                    <div>
                        <p className={`text-sm ${connectionStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                            {connectionStatus.success ? '✅ Connected' : '❌ Failed'}
                        </p>
                        {connectionStatus.error && (
                            <p className="text-xs text-red-600 mt-1">{connectionStatus.error}</p>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">Testing...</p>
                )}
            </div>

            {/* Current Config */}
            <div className="text-xs text-gray-600">
                <p><strong>URL:</strong> {process.env.REACT_APP_SUPABASE_URL || 'Not set'}</p>
                <p><strong>Key:</strong> {process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
            </div>
        </div>
    )
}

export default SupabaseDebug
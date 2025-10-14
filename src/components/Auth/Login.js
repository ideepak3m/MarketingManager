import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const { signIn, signUp, resetPassword } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        if (isSignUp) {
            await signUp(email, password, {
                first_name: firstName,
                last_name: lastName
            })
        } else {
            await signIn(email, password)
        }

        setIsLoading(false)
    }

    const handleResetPassword = async () => {
        if (!email) {
            alert('Please enter your email address first')
            return
        }
        await resetPassword(email)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <img
                        src="/assets/logo.png"
                        alt="Logo"
                        className="mx-auto h-16 w-auto"
                        onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'block'
                        }}
                    />
                    <div className="hidden">
                        <div className="mx-auto h-16 w-16 bg-blue-500 rounded-lg flex items-center justify-center">
                            <i className="fas fa-bullhorn text-white text-2xl"></i>
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Social Media Marketing Manager
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {isSignUp ? 'Create your account' : 'Sign in to your account'}
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        {isSignUp && (
                            <>
                                <div>
                                    <input
                                        type="text"
                                        required={isSignUp}
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                        placeholder="First Name"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        required={isSignUp}
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                        placeholder="Last Name"
                                    />
                                </div>
                            </>
                        )}
                        <div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isSignUp ? '' : 'rounded-t-md'
                                    } focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                                <>
                                    <i className={`fas ${isSignUp ? 'fa-user-plus' : 'fa-sign-in-alt'} mr-2`}></i>
                                    {isSignUp ? 'Sign Up' : 'Sign In'}
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-blue-600 hover:text-blue-500 text-sm"
                        >
                            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>

                        {!isSignUp && (
                            <button
                                type="button"
                                onClick={handleResetPassword}
                                className="text-blue-600 hover:text-blue-500 text-sm"
                            >
                                Forgot password?
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login
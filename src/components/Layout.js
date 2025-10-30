import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const { user, signOut } = useAuth();

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: 'fas fa-tachometer-alt' },
        { name: 'Campaigns', path: '/campaigns', icon: 'fas fa-bullhorn' },
        { name: 'Content', path: '/content', icon: 'fas fa-image' },
        { name: 'Analytics', path: '/analytics', icon: 'fas fa-chart-line' },
        { name: 'AI Assistant', path: '/chatbot', icon: 'fas fa-robot' },
        { name: 'Social Media', path: '/social-platforms', icon: 'fas fa-share-alt' },
        // { name: 'Reports', path: '/reports', icon: 'fas fa-file-pdf' }, // Temporarily disabled
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-48' : 'w-12'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className={`flex items-center p-4 border-b ${sidebarOpen ? 'justify-between' : 'flex-col space-y-2'}`}>
                        {sidebarOpen && (
                            <div className="flex items-center">
                                <img
                                    src={`${process.env.PUBLIC_URL}/assets/logo-full.png`}
                                    alt="Logo"
                                    className="h-8 w-auto"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                        e.target.nextSibling.style.display = 'flex'
                                    }}
                                />
                                <div className="w-8 h-8 bg-blue-500 rounded-lg items-center justify-center hidden">
                                    <i className="fas fa-bullhorn text-white text-sm"></i>
                                </div>
                                <h1 className="font-bold text-xl text-gray-800 ml-3 hidden">
                                    SM Manager
                                </h1>
                            </div>
                        )}
                        {!sidebarOpen && (
                            <img
                                src={`${process.env.PUBLIC_URL}/assets/logo-icon.png`}
                                alt="Logo"
                                className="h-6 w-auto"
                                onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'flex'
                                }}
                            />
                        )}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className={`p-1 rounded-lg hover:bg-gray-100 transition-colors ${!sidebarOpen ? 'text-xs' : ''}`}
                        >
                            <i className={`fas ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4">
                        <div className="space-y-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center p-3 rounded-lg transition-colors ${location.pathname === item.path
                                        ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <i className={`${item.icon} w-5 h-5`}></i>
                                    <span className={`ml-3 ${!sidebarOpen && 'hidden'}`}>{item.name}</span>
                                </Link>
                            ))}
                        </div>


                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t">
                        <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <i className="fas fa-user text-white text-sm"></i>
                            </div>
                            {sidebarOpen && (
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-700">
                                        {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500">Marketing Manager</p>
                                </div>
                            )}
                            {sidebarOpen && (
                                <button
                                    onClick={signOut}
                                    className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                    title="Sign Out"
                                >
                                    <i className="fas fa-sign-out-alt text-sm"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <div className="border-b border-gray-200">
                    <header className="bg-gradient-to-r from-rose-100 via-white to-rose-50 shadow-sm p-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                                <i className="fas fa-arrows-to-eye mr-3 text-purple-700 text-4xl"></i>
                                Campaign Marketing Dashboard
                            </h2>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600">
                                    Welcome, {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'}!
                                </span>
                                <button className="p-2 rounded-lg hover:bg-gray-100">
                                    <i className="fas fa-bell text-gray-600"></i>
                                </button>
                                <button className="p-2 rounded-lg hover:bg-gray-100">
                                    <i className="fas fa-cog text-gray-600"></i>
                                </button>
                                <button
                                    onClick={signOut}
                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-red-600"
                                    title="Sign Out"
                                >
                                    <i className="fas fa-sign-out-alt"></i>
                                </button>
                            </div>
                        </div>
                    </header>
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
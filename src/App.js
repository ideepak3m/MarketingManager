import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SocialPlatforms from './pages/SocialPlatforms';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Content from './pages/Content';
import Analytics from './pages/Analytics';
import ChatBot from './pages/ChatBot';
// import CampaignReports from './pages/CampaignReports'; // Temporarily disabled
import './App.css';

function App() {
    return (
        <AuthProvider>
            <div className="App">
                <ProtectedRoute>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/campaigns" element={<Campaigns />} />
                            <Route path="/content" element={<Content />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/chatbot" element={<ChatBot />} />
                            {/* <Route path="/reports" element={<CampaignReports />} /> */}
                            <Route path="/social-platforms" element={<SocialPlatforms />} />
                        </Routes>
                    </Layout>
                </ProtectedRoute>
            </div>
        </AuthProvider>
    );
}

export default App;
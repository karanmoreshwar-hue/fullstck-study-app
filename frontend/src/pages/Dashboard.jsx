import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-premium-dark text-white p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-7xl mx-auto"
            >
                <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-gold to-orange-500 bg-clip-text text-transparent">
                        Study Dashboard
                    </h1>
                    <div className="flex items-center gap-4">
                        {user?.role === 'owner' && (
                            <Link to="/owner" className="text-accent-gold hover:text-white transition-colors">Owner Panel</Link>
                        )}
                        {(user?.role === 'admin' || user?.role === 'owner') && (
                            <Link to="/admin" className="text-accent-gold hover:text-white transition-colors">Admin Console</Link>
                        )}
                        <span className="text-gray-400">Welcome, {user?.username} ({user?.role})</span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Feature Cards Placeholder */}
                    <Link to="/study" className="block">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-accent-gold/50 transition-all cursor-pointer group h-full">
                            <h3 className="text-xl font-semibold mb-2 group-hover:text-accent-gold transition-colors">Start New Session</h3>
                            <p className="text-gray-400">Begin a new AI-assisted study session.</p>
                        </div>
                    </Link>

                    <Link to="/courses" className="block">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-accent-gold/50 transition-all cursor-pointer group h-full">
                            <h3 className="text-xl font-semibold mb-2 group-hover:text-accent-gold transition-colors">Browse Marketplace</h3>
                            <p className="text-gray-400">Purchase premium courses and materials.</p>
                        </div>
                    </Link>
                    <Link to="/notes" className="block">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-accent-gold/50 transition-all cursor-pointer group h-full">
                            <h3 className="text-xl font-semibold mb-2 group-hover:text-accent-gold transition-colors">My Study Notes</h3>
                            <p className="text-gray-400">View and edit your personal notes.</p>
                        </div>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;

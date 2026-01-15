import React, { useState, useEffect } from 'react';
import api from '../services/api';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { TrendingUp, Users, BookOpen, DollarSign } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6"
    >
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">{title}</h3>
            <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
        <div className="text-3xl font-bold">{value}</div>
    </motion.div>
);

const OwnerDashboard = () => {
    const [stats, setStats] = useState({
        total_users: 0,
        total_courses: 0,
        total_enrollments: 0,
        total_revenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/analytics/dashboard');
            setStats(response.data);
        } catch {
            console.error("Failed to fetch analytics");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-premium-dark text-white p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-7xl mx-auto"
            >
                <header className="mb-12">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-gold to-orange-500 bg-clip-text text-transparent">
                        Owner Analytics
                    </h1>
                    <p className="text-gray-400 mt-2">Real-time platform performance overview.</p>
                </header>

                {loading ? (
                    <div>Loading stats...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Revenue"
                            value={`$${(stats.total_revenue / 100).toFixed(2)}`}
                            icon={DollarSign}
                            color="bg-green-500"
                        />
                        <StatCard
                            title="Total Users"
                            value={stats.total_users}
                            icon={Users}
                            color="bg-blue-500"
                        />
                        <StatCard
                            title="Total Enrollments"
                            value={stats.total_enrollments}
                            icon={TrendingUp}
                            color="bg-purple-500"
                        />
                        <StatCard
                            title="Active Courses"
                            value={stats.total_courses}
                            icon={BookOpen}
                            color="bg-orange-500"
                        />
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default OwnerDashboard;

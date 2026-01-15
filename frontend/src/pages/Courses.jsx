import React, { useState, useEffect } from 'react';
import api from '../services/api';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ShoppingCart, Check, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(null);

    const [ownedIds, setOwnedIds] = useState(new Set());
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [coursesRes, myCoursesRes] = await Promise.all([
                api.get('/courses'),
                api.get('/courses/my')
            ]);
            setCourses(coursesRes.data);
            setOwnedIds(new Set(myCoursesRes.data.map(c => c.id)));
        } catch {
            console.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (courseId) => {
        setPurchasing(courseId);
        try {
            await api.post(`/courses/${courseId}/buy`);
            alert("Course Purchased Successfully!");
            // Update owned list
            setOwnedIds(prev => new Set(prev).add(courseId));
        } catch {
            alert("Failed to purchase course or already owned.");
        } finally {
            setPurchasing(null);
        }
    };

    return (
        <div className="min-h-screen bg-premium-dark text-white p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-7xl mx-auto"
            >
                <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-gold to-orange-500 bg-clip-text text-transparent">
                        Course Marketplace
                    </h1>
                    <Link to="/" className="text-gray-400 hover:text-white">Back to Dashboard</Link>
                </header>

                {loading ? (
                    <div className="text-center text-gray-400">Loading courses...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map(course => (
                            <motion.div
                                key={course.id}
                                whileHover={{ y: -5 }}
                                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-accent-gold/50 transition-all flex flex-col"
                            >
                                <div className="h-48 bg-gray-800 relative">
                                    <img src={course.image_url} alt={course.title} className="w-full h-full object-cover opacity-80" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <div className="absolute bottom-4 left-4 font-bold text-xl">{course.title}</div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <p className="text-gray-400 text-sm mb-4 flex-1">{course.description}</p>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-2xl font-bold text-accent-gold">${(course.price / 100).toFixed(2)}</span>
                                        {ownedIds.has(course.id) ? (
                                            <button
                                                onClick={() => navigate(`/courses/${course.id}`)}
                                                className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                                            >
                                                <Play className="w-4 h-4" /> View Content
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBuy(course.id)}
                                                disabled={purchasing === course.id}
                                                className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {purchasing === course.id ? 'Processing...' : (
                                                    <>
                                                        <ShoppingCart className="w-4 h-4" /> Buy Now
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Courses;

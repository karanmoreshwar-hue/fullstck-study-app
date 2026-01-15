import React, { useState, useEffect } from 'react';
import api from '../services/api';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Plus, Video, FileText, Layout } from 'lucide-react';

const AdminDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showContentModal, setShowContentModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Create Course Form
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        image_url: ''
    });

    // Add Content Form
    const [contentData, setContentData] = useState({
        title: '',
        type: 'video', // 'video' or 'text'
        data: ''
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
            setCourses(response.data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/courses', {
                ...formData,
                price: parseInt(formData.price) * 100 // Convert to cents
            });
            alert("Course Created!");
            setShowCreateModal(false);
            setFormData({ title: '', description: '', price: '', image_url: '' });
            fetchCourses();
        } catch (error) {
            console.error("Failed to create course", error);
            alert("Failed to create course");
        }
    };

    const handleAddContent = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/admin/courses/${selectedCourse.id}/content`, contentData);
            alert("Content Added Successfully!");
            setShowContentModal(false);
            setContentData({ title: '', type: 'video', data: '' });
        } catch (error) {
            console.error("Failed to add content", error);
            alert("Failed to add content");
        }
    };

    const openContentModal = (course) => {
        setSelectedCourse(course);
        setShowContentModal(true);
    };

    return (
        <div className="min-h-screen bg-premium-dark text-white p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-7xl mx-auto"
            >
                <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-gold to-orange-500 bg-clip-text text-transparent">
                            Admin Console
                        </h1>
                        <p className="text-gray-400 mt-2">Manage your courses and curriculum.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-accent-gold text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2 shadow-lg hover:shadow-accent-gold/20"
                    >
                        <Plus className="w-5 h-5" /> New Course
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-accent-gold/50 transition-all group">
                            <div className="h-40 bg-gray-800 relative">
                                <img src={course.image_url} alt={course.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                                    ID: {course.id}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 truncate">{course.title}</h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                                    <span className="text-accent-gold font-bold">${(course.price / 100).toFixed(2)}</span>
                                    <button
                                        onClick={() => openContentModal(course)}
                                        className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Layout className="w-4 h-4" /> Manage Content
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Course Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
                            <form onSubmit={handleCreateCourse} className="space-y-4">
                                <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent-gold transition-colors" required />
                                <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent-gold transition-colors" required />
                                <input type="number" placeholder="Price ($)" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent-gold transition-colors" required />
                                <input type="text" placeholder="Image URL" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent-gold transition-colors" required />
                                <div className="flex justify-end gap-2 mt-6">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 hover:bg-white/10 rounded-lg">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-accent-gold text-black font-bold rounded-lg hover:bg-yellow-500">Create</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Add Content Modal */}
                {showContentModal && selectedCourse && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                            <h2 className="text-2xl font-bold mb-2">Add Content</h2>
                            <p className="text-gray-400 text-sm mb-6">Adding to: <span className="text-white">{selectedCourse.title}</span></p>

                            <form onSubmit={handleAddContent} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Content Title</label>
                                    <input type="text" value={contentData.title} onChange={e => setContentData({ ...contentData, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent-gold transition-colors" required />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Type</label>
                                    <div className="flex gap-4">
                                        <button type="button" onClick={() => setContentData({ ...contentData, type: 'video' })} className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${contentData.type === 'video' ? 'bg-accent-gold/20 border-accent-gold text-accent-gold' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                                            <Video className="w-4 h-4" /> Video
                                        </button>
                                        <button type="button" onClick={() => setContentData({ ...contentData, type: 'text' })} className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${contentData.type === 'text' ? 'bg-accent-gold/20 border-accent-gold text-accent-gold' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                                            <FileText className="w-4 h-4" /> Note
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">
                                        {contentData.type === 'video' ? 'Video URL (YouTube/MP4)' : 'Content Text'}
                                    </label>
                                    {contentData.type === 'video' ? (
                                        <input type="text" value={contentData.data} onChange={e => setContentData({ ...contentData, data: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent-gold transition-colors" placeholder="https://..." required />
                                    ) : (
                                        <textarea value={contentData.data} onChange={e => setContentData({ ...contentData, data: e.target.value })} className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent-gold transition-colors" placeholder="Write your content here..." required />
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 mt-6">
                                    <button type="button" onClick={() => setShowContentModal(false)} className="px-4 py-2 hover:bg-white/10 rounded-lg">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 shadow-lg shadow-green-500/20">Add Content</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import api from '../services/api';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Plus, X, Edit, Trash2, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingNote, setEditingNote] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '' });

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const response = await api.get('/notes');
            setNotes(response.data);
        } catch {
            console.error("Failed to fetch notes");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/notes', formData);
            setNotes([...notes, response.data]);
            setIsCreating(false);
            setFormData({ title: '', content: '' });
        } catch {
            console.error("Failed to create note");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/notes/${editingNote.id}`, formData);
            setNotes(notes.map(n => n.id === editingNote.id ? response.data : n));
            setEditingNote(null);
            setFormData({ title: '', content: '' });
        } catch {
            console.error("Failed to update note");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/notes/${id}`);
            setNotes(notes.filter(n => n.id !== id));
        } catch {
            console.error("Failed to delete note");
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
                        My Study Notes
                    </h1>
                    <div className="flex gap-4 items-center">
                        <Link to="/" className="text-gray-400 hover:text-white">Back to Dashboard</Link>
                        <button
                            onClick={() => { setIsCreating(true); setEditingNote(null); setFormData({ title: '', content: '' }); }}
                            className="px-4 py-2 bg-accent-gold text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" /> New Note
                        </button>
                    </div>

                </header>

                {(isCreating || editingNote) && (
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-6">
                        <form onSubmit={editingNote ? handleUpdate : handleCreate} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Note Title"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none text-xl font-bold placeholer-gray-500"
                                required
                            />
                            <textarea
                                placeholder="Write your thoughts here..."
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                className="w-full h-40 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-accent-gold outline-none"
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => { setIsCreating(false); setEditingNote(null); }} className="px-4 py-2 hover:bg-white/10 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 flex items-center gap-2">
                                    <Save className="w-4 h-4" /> Save
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {loading ? <div>Loading...</div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notes.map(note => (
                            <motion.div
                                key={note.id}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-accent-gold/50 transition-all flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold truncate">{note.title}</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingNote(note); setFormData({ title: note.title, content: note.content }); setIsCreating(false); }} className="text-gray-400 hover:text-white"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(note.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <p className="text-gray-400 whitespace-pre-wrap line-clamp-4 flex-1">{note.content}</p>
                                <p className="text-xs text-gray-600 mt-4">{new Date(note.created_at).toLocaleDateString()}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Notes;

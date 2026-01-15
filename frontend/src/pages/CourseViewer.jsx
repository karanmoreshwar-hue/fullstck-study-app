import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, PlayCircle, FileText } from 'lucide-react';

const CourseViewer = () => {
    const { courseId } = useParams();
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentContent, setCurrentContent] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await api.get(`/courses/${courseId}/content`);
                setContents(response.data);
                if (response.data.length > 0) {
                    setCurrentContent(response.data[0]);
                }
            } catch (error) {
                console.error("Failed to fetch content", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [courseId]);

    return (
        <div className="min-h-screen bg-premium-dark text-white flex flex-col">
            <header className="p-4 border-b border-white/10 flex items-center gap-4 bg-black/20">
                <Link to="/courses" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                </Link>
                <h1 className="text-xl font-bold">Course Viewer</h1>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 bg-black/20 border-r border-white/10 overflow-y-auto p-4 hidden md:block">
                    <h2 className="text-gray-400 font-semibold mb-4 text-sm uppercase tracking-wider">Course Content</h2>
                    <div className="space-y-2">
                        {contents.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setCurrentContent(item)}
                                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${currentContent?.id === item.id
                                    ? 'bg-accent-gold/20 text-accent-gold'
                                    : 'hover:bg-white/5 text-gray-300'
                                    }`}
                            >
                                {item.type === 'video' ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                <span className="truncate">{item.title}</span>
                            </button>
                        ))}
                        {contents.length === 0 && !loading && <div className="text-gray-500 text-sm">No content available yet.</div>}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center">
                    {loading ? (
                        <div>Loading content...</div>
                    ) : currentContent ? (
                        <div className="max-w-4xl w-full">
                            <h2 className="text-3xl font-bold mb-6">{currentContent.title}</h2>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 min-h-[400px]">
                                {currentContent.type === 'video' ? (
                                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center border border-white/10">
                                        <p className="text-gray-500">Video Player Placeholder: {currentContent.data}</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-invert max-w-none">
                                        <p className="whitespace-pre-wrap">{currentContent.data}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-400">Select an item to view.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseViewer;

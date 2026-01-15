import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Send, Bot, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const StudyChat = () => {
    const suggestedPrompts = [
        "Explain Quantum Physics like I'm 5",
        "Create a study plan for Python",
        "Summarize the French Revolution",
        "How do Neural Networks work?"
    ];

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (messageContent) => {
        if (!messageContent.trim()) return;

        const userMessage = { role: 'user', content: messageContent };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/llm/chat', {
                message: userMessage.content,
                session_id: sessionId
            });

            const aiMessage = { role: 'ai', content: response.data.content };
            setMessages(prev => [...prev, aiMessage]);

            if (response.data.session_id && !sessionId) {
                setSessionId(response.data.session_id);
            }
        } catch (error) {
            console.error("Failed to send message", error);
            setMessages(prev => [...prev, { role: 'ai', content: "Error: Could not reach the study assistant." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSend(input);
    };

    return (
        <div className="flex flex-col h-screen bg-[#050505] text-white relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="flex items-center justify-between p-6 border-b border-white/5 bg-black/10 backdrop-blur-xl z-10">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-white/5 rounded-full transition-colors group">
                        <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            AI Study Assistant
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <p className="text-xs text-green-400 font-medium tracking-wide">ONLINE • V2.0</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setMessages([])}
                        className="text-xs text-gray-500 hover:text-white px-3 py-1 rounded-full border border-white/5 hover:bg-white/5 transition-all"
                    >
                        Clear Chat
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth z-10">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center animate-in fade-in duration-700">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-purple-600/20 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl backdrop-blur-sm">
                            <Bot className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3">How can I help you learn today?</h2>
                        <p className="text-gray-400 mb-10 max-w-md text-lg">I can explain complex topics, create study plans, or quiz you on any subject.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                            {suggestedPrompts.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(prompt)}
                                    className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-amber-500/30 hover:shadow-lg hover:translate-y-[-2px] transition-all text-left group"
                                >
                                    <span className="text-gray-300 group-hover:text-white font-medium">{prompt}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-8">
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-amber-600'
                                        } shadow-lg`}>
                                        {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                    </div>

                                    <div className={`p-6 rounded-3xl backdrop-blur-md shadow-xl ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-indigo-600/80 to-blue-700/80 text-white rounded-tr-none border border-indigo-500/30'
                                        : 'bg-white/5 text-gray-100 rounded-tl-none border border-white/10'
                                        }`}>
                                        <div className={`prose prose-invert max-w-none text-[15px] leading-relaxed ${msg.role === 'ai' ? 'markdown-body' : ''}`}>
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start max-w-4xl mx-auto mt-8 px-14"
                    >
                        <div className="flex gap-2 items-center text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                            <span className="text-xs font-mono ml-2">THINKING</span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-6 pt-2 z-20">
                <div className="max-w-4xl mx-auto relative">
                    <form onSubmit={handleFormSubmit} className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-amber-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative flex items-center bg-[#0F0F0F] rounded-2xl border border-white/10 p-2 shadow-2xl">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask your study assistant..."
                                className="flex-1 bg-transparent text-white px-4 py-3 outline-none placeholder-gray-500 text-lg"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="p-3 bg-white text-black rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                    <p className="text-center text-xs text-gray-600 mt-3">
                        AI can make mistakes. Verify important information.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudyChat;

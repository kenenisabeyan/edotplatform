import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi there! I am the EDOT Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const isDarkMode = useThemeMode();
    const telegramUrl = 'https://t.me/edotplatform';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const { data } = await api.post('/chatbot/message', {
                message: userMessage,
                history: messages
            });

            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. " + (data.message || "") }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg = error.response?.data?.message || "I'm having trouble connecting to my servers right now. Please try again later.";
            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                        className={`mb-4 w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden border flex flex-col h-[520px] max-h-[80vh] ${isDarkMode ? 'bg-gradient-to-b from-[#071224] to-[#071827] border-white/10 text-white' : 'bg-white/95 border-slate-200 text-slate-900'}`}
                    >
                        {/* Header */}
                        <div className={`p-4 flex items-center justify-between border-b ${isDarkMode ? 'border-white/10 bg-white/3' : 'border-slate-100 bg-slate-50/60'}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg" style={{background: 'linear-gradient(135deg,#00D4FF,#19C2E8)'}}>
                                    <span className="font-black">E</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">EDOT Assistant</h3>
                                    <p className={`text-xs ${isDarkMode ? 'text-cyan-300' : 'text-cyan-600'}`}>Online</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => setIsOpen(false)}
                                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                            {messages.map((msg, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={idx} 
                                    className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-[#06b6d4] text-white' : 'bg-gradient-to-tr from-sky-700 to-cyan-600 text-white'}`}>
                                        {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                                    </div>

                                    <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-[#06b6d4] text-white rounded-tr-sm border-transparent' : isDarkMode ? 'bg-gradient-to-tr from-sky-700 to-cyan-600 text-white rounded-tl-sm border-transparent' : 'bg-slate-100 border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-2 flex-row">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-700 to-cyan-600 flex items-center justify-center shrink-0 mt-1 text-white">
                                        <Loader2 size={12} />
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm rounded-tl-sm flex items-center gap-2 ${isDarkMode ? 'bg-white/6 border border-white/8 text-slate-200' : 'bg-slate-100 border border-slate-200 text-slate-700'}`}>
                                        <Loader2 size={14} className="animate-spin text-sky-500" />
                                        <span className={isDarkMode ? 'text-slate-200' : 'text-slate-500'}>Thinking...</span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className={`p-3 border-t ${isDarkMode ? 'border-white/10 bg-[#071124]' : 'border-slate-100 bg-white'}`}>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message..."
                                    className={`w-full py-3 pl-4 pr-12 rounded-xl text-sm focus:outline-none transition-all ${isDarkMode ? 'bg-white/5 border-white/10 focus:border-cyan-400 focus:bg-white/8 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 focus:border-cyan-500 focus:bg-white text-slate-900 placeholder-slate-400 border'}`}
                                />

                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className={`absolute right-2 p-2 rounded-lg transition-colors ${!input.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : 'text-sky-500 hover:bg-sky-500/10'}`}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Telegram Link Button */}
            <a
                href={telegramUrl}
                target="_blank"
                rel="noreferrer"
                title="Open EDOT on Telegram"
                className="mb-3 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all"
                style={{background: 'linear-gradient(135deg,#00D4FF,#19C2E8)', color: '#021127'}}
            >
                {/* Telegram paper plane SVG */}
                <svg width="18" height="18" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 120c0 55.2 44.8 100 100 100s100-44.8 100-100S175.2 20 120 20 20 64.8 20 120z" fill="#00bcd4" />
                    <path d="M52 118l132-56c7-3 13 4 9 11l-49 74c-3 6-8 7-14 4l-36-22-18 17c-3 3-6 6-11 2l-24-19c-7-5-2-13 6-15l44-14 77-43" fill="#fff" opacity="0.95" />
                </svg>
            </a>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${isOpen ? 'bg-rose-500 text-white rotate-90 hover:bg-rose-600' : 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white hover:shadow-sky-500/25'}`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </motion.button>
        </div>
    );
}

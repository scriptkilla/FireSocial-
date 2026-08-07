
import React, { useState, useEffect, useRef } from 'react';
import { X, Bot, Send, User, Sparkles } from 'lucide-react';
import { Theme } from '../types';
import { GoogleGenAI, Chat } from '@google/genai';
import AvatarDisplay from './AvatarDisplay';

interface AIChatbotModalProps {
    show: boolean;
    onClose: () => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

type ChatMessage = {
    role: 'user' | 'model';
    text: string;
};

const AIChatbotModal: React.FC<AIChatbotModalProps> = (props) => {
    const { show, onClose, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;
    const [chat, setChat] = useState<Chat | null>(null);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (show) {
            try {
                // Robust API Key Retrieval
                const apiKey = (typeof process !== 'undefined' ? process.env.API_KEY : undefined) || localStorage.getItem('apiKey_google_ai');
                
                if (apiKey) {
                    const ai = new GoogleGenAI({ apiKey });
                    const chatInstance = ai.chats.create({
                        model: 'gemini-2.5-flash',
                    });
                    setChat(chatInstance);
                    setHistory([{ role: 'model', text: 'Hello! How can I help you today?' }]);
                } else {
                    setHistory([{ role: 'model', text: 'Please set your Google AI API Key in Settings > API Configuration to use the chat.' }]);
                }
            } catch (e) {
                console.error(e);
                setHistory([{ role: 'model', text: 'Error initializing chat. Please check API configuration.' }]);
            }
        } else {
            setChat(null);
            setHistory([]);
            setInput('');
        }
    }, [show]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        if (!chat) {
            alert("Chat not initialized. Please check your API key.");
            return;
        }

        const userMessage: ChatMessage = { role: 'user', text: input };
        setHistory(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await chat.sendMessage({ message: input });
            const modelMessage: ChatMessage = { role: 'model', text: result.text };
            setHistory(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I encountered an error. Please try again or check your API Key.' };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div
                className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl w-full max-w-2xl h-[80vh] border ${borderColor} shadow-2xl flex flex-col`}
                onClick={e => e.stopPropagation()}
            >
                <header className={`flex justify-between items-center p-4 border-b ${borderColor} flex-shrink-0`}>
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <Bot className={currentTheme.text} />
                        AI Chat
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {history.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <AvatarDisplay avatar="🤖" size="w-10 h-10" />}
                            <div className={`max-w-md p-3 rounded-2xl ${msg.role === 'user' ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white` : `${cardBg} border ${borderColor}`}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                             {msg.role === 'user' && <AvatarDisplay avatar="👤" size="w-10 h-10" />}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <AvatarDisplay avatar="🤖" size="w-10 h-10" />
                            <div className={`max-w-md p-3 rounded-2xl ${cardBg} border ${borderColor} flex items-center gap-2`}>
                                <Sparkles size={16} className={`animate-spin ${currentTheme.text}`} />
                                <span className={textSecondary}>Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <footer className={`p-4 border-t ${borderColor} flex-shrink-0`}>
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            className={`flex-1 px-4 py-3 bg-black/5 dark:bg-white/5 rounded-2xl border ${borderColor} ${textColor} placeholder-gray-400 focus:outline-none focus:ring-2 ${currentTheme.ring}`}
                            disabled={isLoading || !chat}
                        />
                        <button type="submit" disabled={isLoading || !input.trim() || !chat} className={`p-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-full font-semibold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50`}>
                            <Send size={20} />
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default AIChatbotModal;

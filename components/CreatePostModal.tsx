

import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Video, Smile, BarChart2, MapPin, Globe, Lock, Users, Wand2, Loader2, Sparkles, Camera, Check as CheckIcon, Sticker, Search, Lightbulb, Calendar } from 'lucide-react';
import { Profile, Theme, MediaItem, Post } from '../types';
import AvatarDisplay from './AvatarDisplay';
import { GoogleGenAI } from "@google/genai";
import { GIPHY_API_KEY } from '../constants';

interface CreatePostModalProps {
    show: boolean;
    onClose: () => void;
    onCreatePost: (content: string, media: MediaItem[], type: 'post' | 'poll', pollOptions?: string[], scheduledTime?: string) => void;
    profile: Profile;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
    quotingPost?: Post | null;
}

const EMOJIS = ['😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '🤪', '😎', '🥳', '🤔', '🤫', '🙄', '😴', '😭', '😤', '😡', '🤯', '😱', '👍', '👎', '👏', '🙏', '💪', '🔥', '✨', '❤️', '💔', '💯', '🚀'];

const CHARACTER_LIMIT = 300;

const CreatePostModal: React.FC<CreatePostModalProps> = (props) => {
    const { show, onClose, onCreatePost, profile, currentTheme, cardBg, textColor, textSecondary, borderColor, quotingPost } = props;
    const [content, setContent] = useState('');
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [showPoll, setShowPoll] = useState(false);
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public');
    const [scheduledTime, setScheduledTime] = useState('');
    const [showScheduler, setShowScheduler] = useState(false);
    
    // UI State
    const [showAiMenu, setShowAiMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);

    // GIF Fetching
    const [gifs, setGifs] = useState<string[]>([]);
    const [gifSearch, setGifSearch] = useState('');
    const [isLoadingGifs, setIsLoadingGifs] = useState(false);

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Dropdown Refs
    const emojiRef = useRef<HTMLDivElement>(null);
    const gifRef = useRef<HTMLDivElement>(null);
    const aiRef = useRef<HTMLDivElement>(null);

    const remainingChars = CHARACTER_LIMIT - content.length;
    const isOverLimit = remainingChars < 0;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showEmojiPicker && emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
            if (showGifPicker && gifRef.current && !gifRef.current.contains(event.target as Node)) {
                setShowGifPicker(false);
            }
            if (showAiMenu && aiRef.current && !aiRef.current.contains(event.target as Node)) {
                setShowAiMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEmojiPicker, showGifPicker, showAiMenu]);

    useEffect(() => {
        if (showGifPicker) {
            const fetchGifs = async () => {
                setIsLoadingGifs(true);
                try {
                    const endpoint = gifSearch ? 'search' : 'trending';
                    const res = await fetch(`https://api.giphy.com/v1/gifs/${endpoint}?api_key=${GIPHY_API_KEY}&limit=20&rating=g&q=${gifSearch}`);
                    const data = await res.json();
                    setGifs(data.data.map((g: any) => g.images.fixed_height_small.url));
                } catch (e) {
                    console.error("Failed to fetch gifs", e);
                } finally {
                    setIsLoadingGifs(false);
                }
            };

            const timeoutId = setTimeout(fetchGifs, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [showGifPicker, gifSearch]);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    if (!show) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const url = event.target?.result as string;
                const type = file.type.startsWith('video') ? 'video' : 'image';
                setMedia([...media, { type, url }]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if ((!content.trim() && media.length === 0 && !showPoll && !quotingPost) || isOverLimit) return;
        
        const type = showPoll ? 'poll' : 'post';
        const validPollOptions = pollOptions.filter(o => o.trim() !== '');
        
        if (type === 'poll' && validPollOptions.length < 2) {
            alert('Please provide at least 2 options for the poll.');
            return;
        }

        onCreatePost(content, media, type, showPoll ? validPollOptions : undefined, scheduledTime || undefined);
        handleClose();
    };

    const handleClose = () => {
        stopCamera();
        setContent('');
        setMedia([]);
        setShowPoll(false);
        setShowEmojiPicker(false);
        setShowGifPicker(false);
        setShowAiMenu(false);
        setShowScheduler(false);
        setScheduledTime('');
        setPollOptions(['', '']);
        onClose();
    }

    const updatePollOption = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const addPollOption = () => {
        if (pollOptions.length < 4) {
            setPollOptions([...pollOptions, '']);
        }
    };

    const handleAddEmoji = (emoji: string) => {
        setContent(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handleAddGif = (url: string) => {
        setMedia([...media, { type: 'image', url }]);
        setShowGifPicker(false);
    };

    // --- Camera Functions ---
    const startCamera = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Camera API not supported in this browser.");
            return;
        }
        try {
            // Check for devices
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const hasVideo = devices.some(d => d.kind === 'videoinput');
                if (!hasVideo) {
                    alert("No camera device found.");
                    return;
                }
            } catch (e) { console.warn("Enumeration failed", e); }

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraOpen(true);
        } catch (err: any) {
            console.error("Camera error", err);
            let msg = "Could not access camera. Please ensure you have granted permissions.";
            if (err.name === 'NotAllowedError') msg = "Permission denied. Please allow camera access.";
            else if (err.name === 'NotFoundError') msg = "No camera device found.";
            else if (err.name === 'NotReadableError') msg = "Camera is currently in use.";
            alert(msg);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const url = canvas.toDataURL('image/png');
                setMedia([...media, { type: 'image', url }]);
                stopCamera();
            }
        }
    };


    // --- AI Integration ---
    const handleAiAction = async (action: 'fix' | 'witty' | 'hashtags' | 'idea') => {
        if (action !== 'idea' && !content.trim()) return;
        
        setIsAiLoading(true);
        setShowAiMenu(false);

        try {
            // Robust API Key Retrieval
            // 1. Try to get from global window object (for AI Studio wrapper)
            // 2. Try process.env
            // 3. Try localStorage
            let apiKey = '';
            
            // Check AI Studio Environment
            if ((window as any).aistudio?.hasSelectedApiKey) {
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    await (window as any).aistudio.openSelectKey();
                }
                // The key is automatically injected into process.env by the wrapper if selected
            }

            apiKey = (typeof process !== 'undefined' ? process.env.API_KEY : undefined) || localStorage.getItem('apiKey_google_ai') || '';
            
            if (!apiKey) {
                alert("API Key missing. Please add your Google AI API Key in Settings > API Configuration.");
                setIsAiLoading(false);
                return;
            }

            const ai = new GoogleGenAI({ apiKey });
            let prompt = "";
            
            if (action === 'fix') {
                prompt = `Fix the grammar and spelling of the following text, keeping the tone natural: "${content}"`;
            } else if (action === 'witty') {
                prompt = `Rewrite the following text to be witty, engaging, and fun for a social media post: "${content}"`;
            } else if (action === 'hashtags') {
                prompt = `Read the following text and append 3-5 relevant, trending hashtags to the end of it. Return the full text with hashtags: "${content}"`;
            } else if (action === 'idea') {
                prompt = `Generate a short, engaging social media post idea for a user who likes ${profile.contentPreferences.favoriteTopics.join(', ') || 'technology and lifestyle'}. Keep it under 200 characters.`;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            if (response.text) {
                setContent(response.text.trim());
            }
        } catch (error) {
            console.error("AI Error:", error);
            alert("Could not connect to AI. Please check your API configuration in Settings.");
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={handleClose}>
            <div 
                className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl w-full max-w-lg border ${borderColor} shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200`}
                onClick={e => e.stopPropagation()}
            >
                <div className={`flex justify-between items-center p-4 border-b ${borderColor}`}>
                    <h2 className="text-xl font-bold">{quotingPost ? 'Quote Post' : 'Create Post'}</h2>
                    <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="p-4 relative">
                    {isCameraOpen ? (
                        <div className="relative w-full bg-black rounded-2xl overflow-hidden aspect-video flex flex-col items-center justify-center">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                            <canvas ref={canvasRef} className="hidden" />
                            
                            <div className="absolute bottom-4 flex items-center gap-6">
                                <button onClick={stopCamera} className="p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all">
                                    <X size={24} />
                                </button>
                                <button onClick={capturePhoto} className="p-1 rounded-full border-4 border-white hover:scale-105 transition-all">
                                    <div className="w-12 h-12 bg-white rounded-full"></div>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-3 mb-4">
                                <AvatarDisplay avatar={profile.avatar} size="w-12 h-12" />
                                <div className="flex-1">
                                    <p className={`font-bold ${textColor}`}>{profile.name}</p>
                                    <button 
                                        onClick={() => setPrivacy(p => p === 'public' ? 'followers' : p === 'followers' ? 'private' : 'public')}
                                        className={`flex items-center gap-1 text-xs ${textSecondary} hover:${textColor} transition-colors`}
                                    >
                                        {privacy === 'public' && <><Globe size={12} /> Public</>}
                                        {privacy === 'followers' && <><Users size={12} /> Followers</>}
                                        {privacy === 'private' && <><Lock size={12} /> Only Me</>}
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="What's on your mind?"
                                    className={`w-full bg-transparent ${textColor} placeholder-gray-500 resize-none focus:outline-none text-lg min-h-[120px] pb-6 pr-2`}
                                />
                                <div className={`absolute bottom-2 right-2 text-xs font-medium pointer-events-none transition-colors ${isOverLimit ? 'text-red-500 font-bold' : textSecondary}`}>
                                    {remainingChars}
                                </div>

                                {isAiLoading && (
                                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center rounded-lg z-10">
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${cardBg} border ${borderColor} shadow-lg`}>
                                            <Loader2 className={`animate-spin ${currentTheme.text}`} size={16} />
                                            <span className="text-sm font-semibold">AI is writing...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {quotingPost && (
                                <div className={`mt-2 mb-4 p-3 rounded-xl border ${borderColor} bg-black/5 dark:bg-white/5`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <AvatarDisplay avatar={quotingPost.avatar} size="w-5 h-5" />
                                        <span className={`font-bold text-xs ${textColor}`}>{quotingPost.user}</span>
                                        <span className={`text-xs ${textSecondary}`}>@{quotingPost.username}</span>
                                    </div>
                                    <p className={`text-sm ${textColor} line-clamp-3`}>{quotingPost.content}</p>
                                </div>
                            )}
                        </>
                    )}

                    {media.length > 0 && !isCameraOpen && (
                        <div className="flex gap-2 overflow-x-auto py-2 mb-2">
                            {media.map((item, idx) => (
                                <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-gray-700 group">
                                    {item.type === 'image' ? (
                                        <img src={item.url} alt="preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <video src={item.url} className="w-full h-full object-cover" />
                                    )}
                                    <button 
                                        onClick={() => setMedia(media.filter((_, i) => i !== idx))}
                                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isCameraOpen && showPoll && (
                        <div className={`mb-4 p-3 rounded-xl border ${borderColor} bg-black/5`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold">Poll Options</span>
                                <button onClick={() => setShowPoll(false)} className="text-red-400 hover:text-red-500"><X size={16}/></button>
                            </div>
                            <div className="space-y-2">
                                {pollOptions.map((option, idx) => (
                                    <input 
                                        key={idx}
                                        type="text"
                                        value={option}
                                        onChange={(e) => updatePollOption(idx, e.target.value)}
                                        placeholder={`Option ${idx + 1}`}
                                        className={`w-full px-3 py-2 bg-transparent border ${borderColor} rounded-lg focus:outline-none focus:ring-1 ${currentTheme.ring}`}
                                    />
                                ))}
                                {pollOptions.length < 4 && (
                                    <button onClick={addPollOption} className={`text-sm ${currentTheme.text} font-semibold hover:underline`}>+ Add Option</button>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {!isCameraOpen && showScheduler && (
                        <div className={`mb-4 p-3 rounded-xl border ${borderColor} bg-black/5`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold">Schedule Post</span>
                                <button onClick={() => { setShowScheduler(false); setScheduledTime(''); }} className="text-red-400 hover:text-red-500"><X size={16}/></button>
                            </div>
                            <input 
                                type="datetime-local"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                className={`w-full px-3 py-2 bg-transparent border ${borderColor} rounded-lg focus:outline-none focus:ring-1 ${currentTheme.ring} ${textColor} [color-scheme:dark]`}
                            />
                        </div>
                    )}

                    {!isCameraOpen && (
                    <div className={`flex items-center justify-between mt-4 pt-4 border-t ${borderColor} relative`}>
                        <div className="flex gap-2 text-gray-400">
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/10 rounded-full transition-colors text-green-400" title="Add Media"><ImageIcon size={20} /></button>
                            <button onClick={startCamera} className="p-2 hover:bg-white/10 rounded-full transition-colors text-blue-400" title="Use Camera"><Camera size={20} /></button>
                            
                            {/* GIF Button */}
                            <div className="relative" ref={gifRef}>
                                <button 
                                    onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); setShowAiMenu(false); }}
                                    className={`p-2 hover:bg-white/10 rounded-full transition-colors ${showGifPicker ? currentTheme.text : 'text-pink-400'}`}
                                    title="Add GIF"
                                >
                                    <Sticker size={20} />
                                </button>
                                {showGifPicker && (
                                    <div className={`absolute bottom-full mb-2 left-0 w-72 bg-white dark:bg-gray-800 border ${borderColor} rounded-xl shadow-xl p-3 z-20 animate-in slide-in-from-bottom-2`}>
                                        <div className="relative mb-2">
                                            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                                            <input 
                                                type="text" 
                                                placeholder="Search GIFs..." 
                                                value={gifSearch}
                                                onChange={(e) => setGifSearch(e.target.value)}
                                                className={`w-full pl-9 pr-3 py-1.5 text-sm bg-black/10 dark:bg-white/10 rounded-lg border ${borderColor} ${textColor} focus:outline-none focus:ring-1 ${currentTheme.ring}`} 
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto">
                                            {isLoadingGifs ? (
                                                <div className="col-span-3 flex justify-center py-4"><Loader2 size={20} className="animate-spin" /></div>
                                            ) : gifs.length > 0 ? (
                                                gifs.map((gif, i) => (
                                                    <button key={i} onClick={() => handleAddGif(gif)} className="hover:opacity-80 transition-opacity rounded-md overflow-hidden aspect-square">
                                                        <img src={gif} alt="gif" className="w-full h-full object-cover" />
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="col-span-3 text-center py-4 text-xs text-gray-500">No GIFs found</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button onClick={() => setShowPoll(!showPoll)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-orange-400" title="Create Poll"><BarChart2 size={20} /></button>
                            
                             {/* Schedule Button */}
                            <button onClick={() => { setShowScheduler(!showScheduler); setShowPoll(false); }} className={`p-2 hover:bg-white/10 rounded-full transition-colors ${showScheduler ? currentTheme.text : 'text-teal-400'}`} title="Schedule Post"><Calendar size={20} /></button>

                            {/* AI Button */}
                            <div className="relative" ref={aiRef}>
                                <button 
                                    onClick={() => { setShowAiMenu(!showAiMenu); setShowEmojiPicker(false); setShowGifPicker(false); }} 
                                    className={`p-2 hover:bg-white/10 rounded-full transition-colors ${showAiMenu ? currentTheme.text : 'text-purple-400'}`}
                                    title="AI Assist"
                                >
                                    <Wand2 size={20} />
                                </button>
                                {showAiMenu && (
                                    <div className={`absolute bottom-full mb-2 left-0 w-48 bg-white dark:bg-gray-800 border ${borderColor} rounded-xl shadow-xl p-1 z-20 flex flex-col animate-in slide-in-from-bottom-2`}>
                                        <button onClick={() => handleAiAction('idea')} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-left text-yellow-500 font-medium">
                                            <Lightbulb size={14} /> Generate Idea
                                        </button>
                                        <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                                        <button 
                                            onClick={() => handleAiAction('fix')} 
                                            disabled={!content.trim()}
                                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-left ${!content.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                                        >
                                            <CheckIcon size={14} /> Fix Grammar
                                        </button>
                                        <button 
                                            onClick={() => handleAiAction('witty')} 
                                            disabled={!content.trim()}
                                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-left ${!content.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                                        >
                                            <Sparkles size={14} /> Make it Witty
                                        </button>
                                        <button 
                                            onClick={() => handleAiAction('hashtags')} 
                                            disabled={!content.trim()}
                                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-left ${!content.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                                        >
                                            <Users size={14} /> Add Hashtags
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Emoji Button */}
                            <div className="relative" ref={emojiRef}>
                                <button 
                                    onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); setShowAiMenu(false); }}
                                    className={`p-2 hover:bg-white/10 rounded-full transition-colors ${showEmojiPicker ? currentTheme.text : 'text-yellow-400'}`}
                                    title="Add Emoji"
                                >
                                    <Smile size={20} />
                                </button>
                                {showEmojiPicker && (
                                    <div className={`absolute bottom-full mb-2 left-0 w-64 bg-white dark:bg-gray-800 border ${borderColor} rounded-xl shadow-xl p-2 z-20 animate-in slide-in-from-bottom-2`}>
                                        <div className="grid grid-cols-6 gap-1">
                                            {EMOJIS.map(emoji => (
                                                <button key={emoji} onClick={() => handleAddEmoji(emoji)} className="p-2 text-xl hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors">
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={handleSubmit}
                            disabled={(!content.trim() && media.length === 0 && !showPoll && !quotingPost) || isOverLimit}
                            className={`px-6 py-2 rounded-full font-bold text-white bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {scheduledTime ? 'Schedule' : 'Post'}
                        </button>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;

import React, { useState, useRef, useEffect } from 'react';
import { Post, Profile, Theme, Comment, UserListItem, CommentAttachment } from '../types';
import { X, Send, Sparkles, Loader2, Image as ImageIcon, Video, FileText, Sticker, Bot, Smile, Paperclip, Search } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';
import CommentComponent from './CommentComponent';
import { GoogleGenAI } from "@google/genai";
import { GIPHY_API_KEY } from '../constants';

interface CommentModalProps {
    post: Post;
    profile: Profile;
    onClose: () => void;
    onAddComment: (postId: number, commentText: string, replyToUsername?: string, attachment?: CommentAttachment) => void;
    onLikeComment: (postId: number, commentId: number) => void;
    onDeleteComment: (postId: number, commentId: number) => void;
    onEditComment: (postId: number, commentId: number, newText: string) => void;
    allUsers: UserListItem[];
    onViewProfile: (username: string) => void;
    // UI Props
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const EMOJIS = ['😀', '😂', '😍', '🔥', '👍', '🙌', '😭', '🤔', '🥳', '👀'];
const MAX_COMMENT_LENGTH = 300;

const CommentModal: React.FC<CommentModalProps> = (props) => {
    const { post, profile, onClose, onAddComment, onLikeComment, onDeleteComment, onEditComment, currentTheme, cardBg, textColor, textSecondary, borderColor, allUsers, onViewProfile } = props;
    const [commentInput, setCommentInput] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [commentMentionQuery, setCommentMentionQuery] = useState<string | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Attachments & Tools State
    const [attachment, setAttachment] = useState<CommentAttachment | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showAiMenu, setShowAiMenu] = useState(false);

    // GIF Fetching
    const [gifs, setGifs] = useState<string[]>([]);
    const [gifSearch, setGifSearch] = useState('');
    const [isLoadingGifs, setIsLoadingGifs] = useState(false);

    // AI State
    const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
    const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (replyingTo) {
            inputRef.current?.focus();
            if(!commentInput.startsWith(`@${replyingTo} `)) {
              setCommentInput(`@${replyingTo} `);
            }
        }
    }, [replyingTo]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentInput.trim() || attachment) {
            let textToSend = commentInput;
            let replyUsername: string | undefined = undefined;
            if (replyingTo && textToSend.startsWith(`@${replyingTo} `)) {
                textToSend = textToSend.substring(`@${replyingTo} `.length);
                replyUsername = `@${replyingTo}`;
            }
            onAddComment(post.id, textToSend, replyUsername, attachment || undefined);
            setCommentInput('');
            setReplyingTo(null);
            setAttachment(null);
            setSuggestedReplies([]); // Clear suggestions on send
        }
    };

    const handleReply = (username: string) => {
        setReplyingTo(username);
    };

    const handleCommentMentionSelect = (username: string) => {
        const input = inputRef.current;
        if (!input) return;

        const cursorPosition = input.selectionStart ?? commentInput.length;
        const text = commentInput;
        const textUpToCursor = text.substring(0, cursorPosition);
        const lastAt = textUpToCursor.lastIndexOf('@');
        
        if (lastAt !== -1) {
            const preMention = text.substring(0, lastAt);
            const postMention = text.substring(cursorPosition);
            
            const newText = `${preMention}${username} ${postMention}`;
            setCommentInput(newText);
            
            setTimeout(() => {
                input.focus();
                const newCursorPosition = (preMention + username).length + 1;
                input.setSelectionRange(newCursorPosition, newCursorPosition);
            }, 0);
        }
        setCommentMentionQuery(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length > MAX_COMMENT_LENGTH) return;

        if (replyingTo && !value.startsWith(`@${replyingTo} `)) {
            setReplyingTo(null);
        }
        setCommentInput(value);

        const cursorPosition = e.target.selectionStart;
        const textUpToCursor = value.substring(0, cursorPosition);
        const mentionMatch = textUpToCursor.match(/@(\w*)$/);

        if (mentionMatch) {
            setCommentMentionQuery(mentionMatch[1]);
        } else {
            setCommentMentionQuery(null);
        }
    };
    
    // --- Media Handlers ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAttachment({ 
                type, 
                url, 
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB',
                mimeType: file.type
            });
        }
        e.target.value = ''; // Reset
    };

    const handleAddGif = (url: string) => {
        setAttachment({ type: 'image', url });
        setShowGifPicker(false);
    };
    
    const handleAiAction = async (action: 'grammar' | 'funny' | 'expand') => {
        setAiLoading(true);
        setShowAiMenu(false);
        try {
             const apiKey = (typeof process !== 'undefined' ? process.env.API_KEY : undefined) || localStorage.getItem('apiKey_google_ai');
             if (!apiKey) { alert("API Key missing"); return; }
             
             const ai = new GoogleGenAI({ apiKey });
             let prompt = "";
             if (action === 'grammar') prompt = `Fix grammar: "${commentInput}"`;
             else if (action === 'funny') prompt = `Make this comment funny: "${commentInput || 'Great post!'}"`;
             else if (action === 'expand') prompt = `Expand on this comment: "${commentInput || 'Nice work'}"`;

             const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
             setCommentInput(result.text.trim().substring(0, MAX_COMMENT_LENGTH));
        } catch (e) {
            console.error(e);
            alert("AI generation failed");
        } finally {
            setAiLoading(false);
        }
    };


    const handleGenerateReplies = async () => {
        setIsGeneratingReplies(true);
        try {
            const apiKey = (typeof process !== 'undefined' ? process.env.API_KEY : undefined) || localStorage.getItem('apiKey_google_ai');
            if (!apiKey) {
                alert("API Key missing.");
                setIsGeneratingReplies(false);
                return;
            }

            const ai = new GoogleGenAI({ apiKey });
            const prompt = `Read this post: "${post.content}". Generate 3 short engaging replies (max 200 chars each). Return JSON array of strings.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });
            
            const replies = JSON.parse(response.text || "[]");
            if (Array.isArray(replies)) {
                setSuggestedReplies(replies);
            }
        } catch (error) {
            console.error("AI Reply Gen Error:", error);
        } finally {
            setIsGeneratingReplies(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16" onClick={onClose}>
            <div 
                className={`flex flex-col ${cardBg} backdrop-blur-xl ${textColor} rounded-3xl p-6 max-w-lg w-full border ${borderColor} shadow-2xl max-h-[80vh]`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold">Comments on {post.user}'s post</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>

                <div className="flex-grow overflow-y-auto -mr-3 pr-3 space-y-4">
                    {post.commentsData && post.commentsData.length > 0 ? (
                        post.commentsData.map(comment => (
                            <CommentComponent 
                                key={comment.id}
                                comment={comment}
                                profile={profile}
                                onLike={() => onLikeComment(post.id, comment.id)}
                                onDelete={() => onDeleteComment(post.id, comment.id)}
                                onEdit={(newText) => onEditComment(post.id, comment.id, newText)}
                                onReply={handleReply}
                                onViewProfile={onViewProfile}
                                textColor={textColor}
                                textSecondary={textSecondary}
                                currentTheme={currentTheme}
                            />
                        ))
                    ) : (
                        <p className={`${textSecondary} text-center py-8`}>No comments yet. Be the first to comment!</p>
                    )}
                </div>
                
                <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-white/10 flex-shrink-0 relative">
                     {/* Suggestions */}
                     {suggestedReplies.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-1 no-scrollbar">
                            {suggestedReplies.map((reply, idx) => (
                                <button 
                                    key={idx} 
                                    type="button" 
                                    onClick={() => { setCommentInput(reply); setSuggestedReplies([]); }}
                                    className={`whitespace-nowrap px-3 py-1.5 text-xs rounded-full border ${borderColor} ${cardBg} hover:bg-white/10 transition-colors flex-shrink-0`}
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Attachment Preview */}
                    {attachment && (
                        <div className="mb-2 p-2 rounded-lg bg-black/10 dark:bg-white/10 border border-gray-600 flex items-center gap-2 relative w-fit">
                            {attachment.type === 'image' && <img src={attachment.url} className="w-16 h-16 object-cover rounded" alt="att" />}
                            {attachment.type === 'video' && <video src={attachment.url} className="w-16 h-16 object-cover rounded" />}
                            {attachment.type === 'file' && <FileText size={32} className={textSecondary} />}
                            <div className="flex flex-col justify-center max-w-[150px]">
                                <span className="text-xs font-medium truncate">{attachment.name || 'Attachment'}</span>
                                <span className="text-xs opacity-50">{attachment.size}</span>
                            </div>
                            <button type="button" onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
                        </div>
                    )}
                    
                    {/* Mentions Dropdown */}
                    {commentMentionQuery !== null && (
                        <div className={`absolute bottom-full mb-2 w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl border ${borderColor} shadow-lg z-50 overflow-hidden`}>
                            <ul className="max-h-48 overflow-y-auto">
                                {allUsers
                                    .filter(user =>
                                        user.username.toLowerCase().includes(`@${commentMentionQuery.toLowerCase()}`) ||
                                        user.name.toLowerCase().includes(commentMentionQuery.toLowerCase())
                                    )
                                    .slice(0, 5)
                                    .map(user => (
                                    <li key={user.id}>
                                        <button onClick={() => handleCommentMentionSelect(user.username)} className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">
                                            <AvatarDisplay avatar={user.avatar} size="w-10 h-10" />
                                            <div>
                                                <p className={textColor}>{user.name}</p>
                                                <p className={`text-sm ${textSecondary}`}>{user.username}</p>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {replyingTo && (
                        <div className="text-sm text-gray-400 mb-2 px-2 flex justify-between items-center">
                            <span>Replying to <span className={currentTheme.text}>@{replyingTo}</span></span>
                            <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-white/10 rounded-full"><X size={14}/></button>
                        </div>
                    )}

                    <div className="flex gap-2 items-end">
                        <AvatarDisplay avatar={profile.avatar} size="w-10 h-10" fontSize="text-xl" className="mb-1"/>
                        <div className="flex-1">
                            <div className={`bg-black/5 dark:bg-white/5 rounded-2xl border ${borderColor} relative`}>
                                <textarea
                                    ref={inputRef}
                                    value={commentInput}
                                    onChange={handleInputChange}
                                    placeholder="Add a comment..."
                                    rows={2}
                                    className={`w-full pl-4 pr-10 py-3 bg-transparent rounded-2xl ${textColor} placeholder-gray-400 focus:outline-none focus:ring-2 ${currentTheme.ring} resize-none scrollbar-hide`}
                                />
                                <div className={`absolute bottom-1 left-4 text-[10px] ${textSecondary}`}>
                                    {commentInput.length}/{MAX_COMMENT_LENGTH}
                                </div>
                                <button 
                                    type="button"
                                    onClick={handleGenerateReplies}
                                    disabled={isGeneratingReplies}
                                    className={`absolute right-2 top-2 p-1.5 rounded-full hover:bg-white/10 transition-colors ${isGeneratingReplies ? 'opacity-50' : 'text-purple-400'}`}
                                    title="AI Suggest Reply"
                                >
                                    {isGeneratingReplies ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                </button>
                            </div>
                            
                            {/* Rich Toolbar */}
                            <div className="flex items-center gap-1 mt-2">
                                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'image')} accept="image/*" />
                                <input type="file" ref={videoInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'video')} accept="video/*" />
                                <input type="file" ref={docInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'file')} />

                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-blue-400 transition-colors" title="Upload Image"><ImageIcon size={18}/></button>
                                <button type="button" onClick={() => videoInputRef.current?.click()} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-purple-400 transition-colors" title="Upload Video"><Video size={18}/></button>
                                <button type="button" onClick={() => docInputRef.current?.click()} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-green-400 transition-colors" title="Upload File"><Paperclip size={18}/></button>
                                
                                <div className="relative">
                                    <button type="button" onClick={() => setShowGifPicker(!showGifPicker)} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-pink-400 transition-colors" title="GIF"><Sticker size={18}/></button>
                                    {showGifPicker && (
                                        <div className={`absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 border ${borderColor} rounded-xl shadow-xl p-3 z-50 animate-in slide-in-from-bottom-2`}>
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

                                <div className="relative">
                                    <button type="button" onClick={() => setShowAiMenu(!showAiMenu)} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-orange-400 transition-colors" title="AI Assistant"><Bot size={18}/></button>
                                    {showAiMenu && (
                                        <div className="absolute bottom-full left-0 mb-2 w-40 bg-white dark:bg-gray-800 py-1 rounded-lg shadow-xl border border-gray-700 z-50 flex flex-col">
                                            {aiLoading ? <div className="p-2 flex items-center gap-2 text-xs"><Loader2 size={12} className="animate-spin"/> Working...</div> : <>
                                                <button onClick={() => handleAiAction('grammar')} className="px-3 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700">Fix Grammar</button>
                                                <button onClick={() => handleAiAction('funny')} className="px-3 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700">Make Funny</button>
                                                <button onClick={() => handleAiAction('expand')} className="px-3 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700">Expand Text</button>
                                            </>}
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-yellow-400 transition-colors" title="Emoji"><Smile size={18}/></button>
                                    {showEmojiPicker && (
                                        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-xl border border-gray-700 z-50 grid grid-cols-5 gap-1">
                                            {EMOJIS.map(e => <button key={e} onClick={() => {setCommentInput(c => c + e); setShowEmojiPicker(false);}} className="text-xl hover:scale-125 transition-transform">{e}</button>)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button type="submit" className={`p-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-full font-semibold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50`} disabled={!commentInput.trim() && !attachment}>
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommentModal;

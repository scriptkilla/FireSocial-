

import React, { useState, useRef, useEffect } from 'react';
import { Post, Profile, Reaction, Theme, Message, UserListItem, CommentAttachment } from '../types';
import { MoreHorizontal, Edit, Trash2, Bookmark, UserMinus, EyeOff, VolumeX, AlertTriangle, Share2, Link as LinkIcon, UserCheck, Heart, MessageSquare, Send, Eye, Lock, Image as ImageIcon, Video, FileText, Sticker, Bot, Smile, X, Paperclip, Loader2, Search, Rocket, Repeat, PenSquare, DollarSign, Pin, Star } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';
import PostMedia from './PostMedia';
import { GoogleGenAI } from "@google/genai";
import { GIPHY_API_KEY } from '../constants';

interface PostComponentProps {
    post: Post;
    profile: Profile;
    currentTheme: Theme;
    // UI props
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
    // Data
    reactions: Reaction[];
    messages: Message[];
    allUsers: UserListItem[];
    // Handlers
    onReaction: (postId: number, reactionType: string) => void;
    onBookmark: (postId: number) => void;
    onDelete: (postId: number) => void;
    onViewPost: (post: Post) => void;
    onViewComments: (post: Post) => void;
    onAddComment: (postId: number, commentText: string, replyToUsername?: string, attachment?: CommentAttachment) => void;
    onHide: (postId: number) => void;
    onMute: (username: string) => void;
    onReport: (postId: number) => void;
    onShare: (post: Post) => void;
    onRepost: (postId: number) => void;
    onQuote: (post: Post) => void;
    onCopyLink: (postId: number) => void;
    onFollowToggle: (userId: number, username: string) => void;
    onBlockToggle: (userId: number, username: string) => void;
    onVotePoll: (postId: number, optionId: number) => void;
    onViewProfile: (username: string) => void;
    onViewHashtag: (tag: string) => void;
    onPurchasePost: (postId: number) => void;
    onBoost?: (postId: number) => void;
    onTip?: (userId: number) => void;
    onPin?: (postId: number) => void;
    onFeature?: (postId: number) => void;
    isFollowing: boolean;
    isBlocked: boolean;
}

const EMOJIS = ['😀', '😂', '😍', '🔥', '👍', '🙌', '😭', '🤔'];
const MAX_COMMENT_LENGTH = 300;

const MenuItem: React.FC<{icon: React.ElementType, label: string, onClick: (e: React.MouseEvent) => void, className?: string}> = ({ icon: Icon, label, onClick, className = '' }) => (
    <button onClick={onClick} className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/10 ${className}`}>
        <Icon size={16} />
        <span>{label}</span>
    </button>
);

const ParsedContent: React.FC<{content: string, textColor: string, currentTheme: Theme, onViewProfile: (username: string) => void, onViewHashtag: (tag: string) => void}> = ({ content, textColor, currentTheme, onViewProfile, onViewHashtag }) => {
    const parts = content.split(/(\s+)/);
    const hashtagRegex = /^#[\w_]+$/;
    const mentionRegex = /^@[\w_]+$/;

    return (
        <p className={`${textColor} mb-4 whitespace-pre-wrap break-words`}>
            {parts.map((part, index) => {
                if (hashtagRegex.test(part)) {
                    return <button key={index} onClick={() => onViewHashtag(part)} className={`font-semibold ${currentTheme.text} ${currentTheme.hoverText}`}>{part}</button>;
                }
                if (mentionRegex.test(part)) {
                    return <button key={index} onClick={() => onViewProfile(part)} className={`font-semibold ${currentTheme.text} ${currentTheme.hoverText}`}>{part}</button>;
                }
                return <span key={index}>{part}</span>;
            })}
        </p>
    );
};


const PostComponent: React.FC<PostComponentProps> = (props) => {
    const { post, profile, currentTheme, cardBg, textColor, textSecondary, borderColor, reactions, messages, onReaction, onBookmark, onDelete, onViewPost, onViewComments, onAddComment, onHide, onMute, onReport, onShare, onRepost, onQuote, onCopyLink, onFollowToggle, onBlockToggle, onVotePoll, onViewProfile, onViewHashtag, isFollowing, isBlocked, allUsers, onPurchasePost, onBoost, onTip, onPin, onFeature } = props;
    const [showPostOptions, setShowPostOptions] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showRepostMenu, setShowRepostMenu] = useState(false);
    const [inlineComment, setInlineComment] = useState('');
    const [inlineCommentMentionQuery, setInlineCommentMentionQuery] = useState<string | null>(null);
    const [activeButton, setActiveButton] = useState<string | null>(null);
    const inlineCommentInputRef = useRef<HTMLTextAreaElement>(null);

    // Comment Attachments & Tools
    const [commentAttachment, setCommentAttachment] = useState<CommentAttachment | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showAiMenu, setShowAiMenu] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);

    // GIF Fetching
    const [gifs, setGifs] = useState<string[]>([]);
    const [gifSearch, setGifSearch] = useState('');
    const [isLoadingGifs, setIsLoadingGifs] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiRef = useRef<HTMLDivElement>(null);
    const gifRef = useRef<HTMLDivElement>(null);
    const aiRef = useRef<HTMLDivElement>(null);

    // Refs for click outside logic
    const optionsRef = useRef<HTMLDivElement>(null);
    const reactionRef = useRef<HTMLDivElement>(null);
    const repostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showPostOptions && optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
                setShowPostOptions(false);
            }
            if (showReactionPicker && reactionRef.current && !reactionRef.current.contains(event.target as Node)) {
                setShowReactionPicker(false);
            }
             if (showEmojiPicker && emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
            if (showGifPicker && gifRef.current && !gifRef.current.contains(event.target as Node)) {
                setShowGifPicker(false);
            }
            if (showAiMenu && aiRef.current && !aiRef.current.contains(event.target as Node)) {
                setShowAiMenu(false);
            }
            if (showRepostMenu && repostRef.current && !repostRef.current.contains(event.target as Node)) {
                setShowRepostMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPostOptions, showReactionPicker, showEmojiPicker, showGifPicker, showAiMenu, showRepostMenu]);

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

    const handleMenuClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
        setShowPostOptions(false);
    };

    const handleButtonClick = (buttonId: string, callback: () => void) => {
        setActiveButton(buttonId);
        setTimeout(() => setActiveButton(null), 150);
        callback();
    };

    const handleAddInlineComment = () => {
        if (inlineComment.trim() || commentAttachment) {
            onAddComment(post.id, inlineComment.trim(), undefined, commentAttachment || undefined);
            setInlineComment('');
            setCommentAttachment(null);
        }
    };
    
    const handleInlineCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        if (text.length > MAX_COMMENT_LENGTH) return;

        setInlineComment(text);

        const cursorPosition = e.target.selectionStart ?? 0;
        const textUpToCursor = text.substring(0, cursorPosition);
        const mentionMatch = textUpToCursor.match(/@(\w*)$/);

        if (mentionMatch) {
            setInlineCommentMentionQuery(mentionMatch[1]);
        } else {
            setInlineCommentMentionQuery(null);
        }
    };

    const handleInlineMentionSelect = (username: string) => {
        const input = inlineCommentInputRef.current;
        if (!input) return;

        const cursorPosition = input.selectionStart ?? inlineComment.length;
        const text = inlineComment;
        const textUpToCursor = text.substring(0, cursorPosition);
        const lastAt = textUpToCursor.lastIndexOf('@');
        
        if (lastAt !== -1) {
            const preMention = text.substring(0, lastAt);
            const postMention = text.substring(cursorPosition);
            
            const newText = `${preMention}${username} ${postMention}`;
            setInlineComment(newText);
            
            setTimeout(() => {
                input.focus();
                const newCursorPosition = (preMention + username).length + 1;
                input.setSelectionRange(newCursorPosition, newCursorPosition);
            }, 0);
        }
        setInlineCommentMentionQuery(null);
    };
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setCommentAttachment({ 
                type, 
                url, 
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB',
                mimeType: file.type
            });
        }
        // Reset file input
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleAddGif = (url: string) => {
        setCommentAttachment({ type: 'image', url });
        setShowGifPicker(false);
    };

    const handleAiGenerate = async (prompt: string) => {
        setIsAiLoading(true);
        setShowAiMenu(false);
        try {
             const apiKey = (typeof process !== 'undefined' ? process.env.API_KEY : undefined) || localStorage.getItem('apiKey_google_ai');
             if (!apiKey) { alert("API Key missing"); return; }
             
             const ai = new GoogleGenAI({ apiKey });
             const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
             setInlineComment(prev => (prev + (prev ? ' ' : '') + result.text).substring(0, MAX_COMMENT_LENGTH));
        } catch (e) {
            console.error(e);
            alert("AI generation failed");
        } finally {
            setIsAiLoading(false);
        }
    };


    const isOwnPost = post.userId === profile.id;
    const hasPurchased = profile.purchasedPostIds?.includes(post.id);
    const isLocked = post.isPaid && !isOwnPost && !hasPurchased;

    return (
        <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg relative overflow-hidden`}>
            {/* Pinned Indicator */}
            {post.isPinned && (
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}`} />
            )}
            {post.isPinned && (
                <div className={`text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-3 pl-1`}>
                    <Pin size={14} fill="currentColor" className="rotate-45" /> 
                    <span>Pinned Post</span>
                </div>
            )}

            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => onViewProfile(post.username)} className="relative hover:scale-105 transition-transform">
                        <AvatarDisplay avatar={post.avatar} size="w-12 h-12" fontSize="text-2xl" />
                        {messages.find(m => m.user === post.user)?.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>}
                    </button>
                    <div>
                        <button onClick={() => onViewProfile(post.username)} className={`font-semibold ${textColor} flex items-center gap-1 hover:underline`}>
                            {post.user}
                            {post.username === profile.username && profile.verified && <span className="text-blue-500 text-lg">✓</span>}
                            {post.isBoosted && <span className="text-xs font-bold px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full ml-2 flex items-center gap-1"><Rocket size={10} /> Boosted</span>}
                            {post.isFeatured && <span className="text-xs font-bold px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full ml-2 flex items-center gap-1"><Star size={10} fill="currentColor"/> Featured</span>}
                        </button>
                        <div className={`text-sm ${textSecondary} flex items-center gap-2`}>
                            <span>{post.time}</span>
                            {post.isSponsored && <><span>•</span><span className="font-semibold">Sponsored</span></>}
                        </div>
                    </div>
                </div>
                <div className="relative" ref={optionsRef}>
                    <button onClick={(e) => { e.stopPropagation(); setShowPostOptions(prev => !prev); }} className={`p-2 ${textSecondary} hover:bg-white/10 rounded-full`}>
                        <MoreHorizontal size={20} />
                    </button>
                    {showPostOptions && (
                        <div className={`absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl border ${borderColor} shadow-xl w-56 z-10 overflow-hidden`}>
                            {isOwnPost ? (
                                <>
                                    <MenuItem icon={Pin} label={post.isPinned ? "Unpin from Profile" : "Pin to Profile"} onClick={(e) => handleMenuClick(e, () => onPin && onPin(post.id))} className="rounded-t-2xl" />
                                    <MenuItem icon={Star} label={post.isFeatured ? "Remove from Featured" : "Add to Featured"} onClick={(e) => handleMenuClick(e, () => onFeature && onFeature(post.id))} />
                                    <MenuItem icon={Edit} label="Edit Post" onClick={(e) => handleMenuClick(e, () => alert('Edit functionality not implemented yet.'))} />
                                    {!post.isBoosted && onBoost && <MenuItem icon={Rocket} label="Boost Post (50 🔥)" onClick={(e) => handleMenuClick(e, () => onBoost(post.id))} className="text-orange-500" />}
                                    <MenuItem icon={Trash2} label="Delete Post" onClick={(e) => handleMenuClick(e, () => onDelete(post.id))} className="text-red-500" />
                                </>
                            ) : (
                                <>
                                    {!isFollowing && <MenuItem icon={UserCheck} label={`Follow ${post.username}`} onClick={(e) => handleMenuClick(e, () => onFollowToggle(post.userId, post.username))} className="rounded-t-2xl" />}
                                    <MenuItem icon={VolumeX} label={`Mute ${post.username}`} onClick={(e) => handleMenuClick(e, () => onMute(post.username))} />
                                    <MenuItem icon={EyeOff} label="Hide post" onClick={(e) => handleMenuClick(e, () => onHide(post.id))} />
                                </>
                            )}
                            <MenuItem icon={Bookmark} label={post.bookmarked ? 'Unsave' : 'Save'} onClick={(e) => handleMenuClick(e, () => onBookmark(post.id))} />
                            <MenuItem icon={Share2} label="Share to..." onClick={(e) => handleMenuClick(e, () => onShare(post))} />
                            <MenuItem icon={LinkIcon} label="Copy link" onClick={(e) => handleMenuClick(e, () => onCopyLink(post.id))} />
                            {!isOwnPost && (
                                <>
                                    <MenuItem icon={UserMinus} label={isBlocked ? 'Unblock' : 'Block'} onClick={(e) => handleMenuClick(e, () => onBlockToggle(post.userId, post.username))} className="text-red-500" />
                                    <MenuItem icon={AlertTriangle} label="Report post" onClick={(e) => handleMenuClick(e, () => onReport(post.id))} className="text-red-500 rounded-b-2xl" />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {isLocked ? (
                <div className={`text-center p-8 rounded-2xl border-2 border-dashed ${borderColor} ${cardBg} backdrop-blur-sm`}>
                    <Lock size={48} className={`mx-auto ${currentTheme.text} mb-4`} />
                    <h3 className={`font-bold text-xl ${textColor}`}>Unlock this exclusive post</h3>
                    <p className={`mt-2 mb-6 ${textSecondary}`}>
                        This content is available for purchase. Unlock it now to view the full post.
                    </p>
                    <button 
                        onClick={() => onPurchasePost(post.id)}
                        className={`w-full py-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg`}
                    >
                        Unlock for ${post.paidInfo?.price}
                    </button>
                </div>
            ) : (
                <>
                    {/* Post Body */}
                    <div onClick={() => onViewPost(post)} className="cursor-pointer">
                        {post.media && post.media.length > 0 && <PostMedia media={post.media} postFormat={post.postFormat} currentTheme={currentTheme} />}
                        <ParsedContent content={post.content} textColor={textColor} currentTheme={currentTheme} onViewHashtag={onViewHashtag} onViewProfile={onViewProfile} />
                        
                        {/* Quoted Post */}
                        {post.quotedPost && (
                            <div className={`mt-3 mb-3 p-3 rounded-xl border ${borderColor} hover:bg-white/5 transition-colors`}>
                                 <div className="flex items-center gap-2 mb-2">
                                     <AvatarDisplay avatar={post.quotedPost.avatar} size="w-6 h-6" />
                                     <span className={`font-bold text-sm ${textColor}`}>{post.quotedPost.user}</span>
                                     <span className={`text-xs ${textSecondary}`}>@{post.quotedPost.username}</span>
                                     <span className={`text-xs ${textSecondary}`}>• {post.quotedPost.time}</span>
                                </div>
                                <p className={`text-sm ${textColor}`}>{post.quotedPost.content}</p>
                                 {post.quotedPost.media && post.quotedPost.media.length > 0 && (
                                    <div className="mt-2 h-48 w-full rounded-lg overflow-hidden bg-black">
                                         {post.quotedPost.media[0].type === 'image' ?
                                            <img src={post.quotedPost.media[0].url} className="w-full h-full object-cover" /> :
                                            <video src={post.quotedPost.media[0].url} className="w-full h-full object-cover" />
                                         }
                                    </div>
                                 )}
                            </div>
                        )}
                    </div>
                    
                    {/* Poll */}
                    {post.type === 'poll' && post.pollOptions && (
                    <div className="mb-4 space-y-2">
                        {post.pollOptions.map(option => {
                        const percentage = (post.totalVotes ?? 0) > 0 ? (option.votes / (post.totalVotes ?? 1) * 100).toFixed(0) : 0;
                        const isSelected = post.userVoted === option.id;
                        return (
                            <button key={option.id} onClick={() => post.userVoted === null && onVotePoll(post.id, option.id)} disabled={post.userVoted !== null} className={`w-full p-3 rounded-2xl border ${borderColor} ${isSelected ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white` : `${cardBg} ${textColor}`} hover:bg-white/10 transition-all relative overflow-hidden text-left`}>
                            <div className={`absolute left-0 top-0 h-full ${isSelected ? 'bg-white/20' : `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} opacity-20`} transition-all`} style={{ width: `${percentage}%` }} />
                            <div className="relative flex justify-between items-center"><span>{option.text}</span>{post.userVoted !== null && <span>{percentage}%</span>}</div>
                            </button>
                        );
                        })}
                        <p className={`text-sm ${textSecondary} text-center`}>{post.totalVotes} votes</p>
                    </div>
                    )}
                    
                    {/* Post Stats */}
                    <div className={`flex items-center gap-2 mb-4 ${textSecondary} text-sm`}><Eye size={16} /><span>{post.views} views</span></div>
                    
                    {/* Post Actions */}
                    <div className="flex items-center justify-between">
                    <div className="flex gap-6">
                        {/* Like Button */}
                        <div className="relative" ref={reactionRef}>
                        <button 
                            onClick={() => handleButtonClick('like', () => setShowReactionPicker(prev => !prev))} 
                            className={`flex items-center gap-2 ${post.userReaction ? reactions.find(r => r.name === post.userReaction)?.color : textSecondary} hover:scale-110 transition-all duration-200 ${activeButton === 'like' ? 'scale-90' : ''}`}
                        >
                            {post.userReaction ? reactions.find(r => r.name === post.userReaction)?.emoji : <Heart size={20} className={activeButton === 'like' ? 'fill-red-500 text-red-500' : ''} />}
                            <span>{post.likes}</span>
                        </button>
                        {showReactionPicker && (
                            <div className={`absolute bottom-full mb-2 bg-white dark:bg-gray-800 rounded-2xl p-2 border ${borderColor} shadow-xl flex gap-2 z-10 animate-in zoom-in duration-200 origin-bottom-left`}>
                            {reactions.map(reaction => (<button key={reaction.name} onClick={() => { onReaction(post.id, reaction.name); setShowReactionPicker(false); }} className="text-2xl hover:scale-125 transition-all hover:animate-bounce">{reaction.emoji}</button>))}
                            </div>
                        )}
                        </div>

                        {/* Repost Button (New) */}
                        <div className="relative" ref={repostRef}>
                            <button 
                                onClick={() => setShowRepostMenu(!showRepostMenu)} 
                                className={`flex items-center gap-2 ${textSecondary} ${currentTheme.hoverText} transition-all duration-200 hover:scale-110 ${activeButton === 'repost' ? 'scale-90 text-green-500' : ''}`}
                            >
                                <Repeat size={20} className={activeButton === 'repost' ? 'text-green-500' : ''} />
                                <span>{post.shares}</span>
                            </button>
                             {showRepostMenu && (
                                <div className={`absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-xl border ${borderColor} shadow-xl py-1 z-10 w-36 overflow-hidden animate-in zoom-in duration-200 origin-bottom-left`}>
                                    <button onClick={() => { onRepost(post.id); setShowRepostMenu(false); }} className={`w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 ${textColor} text-sm transition-colors`}>
                                        <Repeat size={16} /> Repost
                                    </button>
                                    <button onClick={() => { onQuote(post); setShowRepostMenu(false); }} className={`w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/10 ${textColor} text-sm transition-colors`}>
                                        <PenSquare size={16} /> Quote Post
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={() => handleButtonClick('comment', () => onViewComments(post))} 
                            className={`flex items-center gap-2 ${textSecondary} ${currentTheme.hoverText} transition-all duration-200 hover:scale-110 ${activeButton === 'comment' ? 'scale-90 text-blue-500' : ''}`}
                        >
                            <MessageSquare size={20} className={activeButton === 'comment' ? 'fill-current' : ''} />
                            <span>{post.comments}</span>
                        </button>
                        
                        <button 
                            onClick={() => handleButtonClick('share', () => onShare(post))} 
                            className={`flex items-center gap-2 ${textSecondary} ${currentTheme.hoverText} transition-all duration-200 hover:scale-110 ${activeButton === 'share' ? 'scale-90 text-green-500' : ''}`}
                        >
                            <Share2 size={20} className={activeButton === 'share' ? 'fill-current' : ''} />
                        </button>
                    </div>
                    
                    <div className="flex gap-4">
                         {!isOwnPost && onTip && (
                            <button 
                                onClick={() => handleButtonClick('tip', () => onTip(post.userId))} 
                                className={`${textSecondary} hover:text-green-500 hover:scale-110 transition-all duration-200 ${activeButton === 'tip' ? 'scale-90' : ''}`}
                                title="Tip Creator"
                            >
                                <DollarSign size={20} />
                            </button>
                        )}
                        <button 
                            onClick={() => handleButtonClick('bookmark', () => onBookmark(post.id))} 
                            className={`${post.bookmarked ? currentTheme.text : textSecondary} hover:scale-110 transition-all duration-200 ${activeButton === 'bookmark' ? 'scale-90' : ''}`}
                        >
                            <Bookmark size={20} fill={post.bookmarked || activeButton === 'bookmark' ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                    </div>
                    
                    {/* Comment Section */}
                    <div className={`mt-4 pt-4 border-t ${borderColor} space-y-3`}>
                        {post.commentsData && post.commentsData.length > 0 && (
                            <div className="space-y-2">
                                {post.commentsData.slice(0, 2).map(comment => (
                                    <div key={comment.id} className="flex items-start gap-2 text-sm px-2">
                                        <button onClick={() => onViewProfile(comment.username)}>
                                            <AvatarDisplay avatar={comment.avatar} size="w-8 h-8" fontSize="text-base" />
                                        </button>
                                        <div className="flex-1">
                                            <p>
                                                <button onClick={() => onViewProfile(comment.username)} className={`font-semibold ${textColor} mr-2 hover:underline`}>{comment.username}</button>
                                                <span className={textColor}>
                                                    {comment.replyTo && <span className={`font-semibold ${currentTheme.text} mr-1`}>{comment.replyTo}</span>}
                                                    {comment.text}
                                                </span>
                                            </p>
                                            {/* Very brief attachment indicator for comment preview */}
                                            {comment.attachment && <p className="text-xs text-blue-400 italic flex items-center gap-1 mt-0.5">
                                                {comment.attachment.type === 'image' && <ImageIcon size={10}/>}
                                                {comment.attachment.type === 'video' && <Video size={10}/>}
                                                {comment.attachment.type === 'file' && <FileText size={10}/>}
                                                Attached {comment.attachment.type}
                                            </p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {post.comments > 2 && (
                            <button onClick={() => onViewComments(post)} className={`text-sm ${textSecondary} font-semibold px-2 hover:underline`}>
                                View all {post.comments} comments
                            </button>
                        )}

                        <div className="flex items-start gap-2 pt-2">
                            <AvatarDisplay avatar={profile.avatar} size="w-8 h-8" fontSize="text-base" />
                            <form onSubmit={(e) => { e.preventDefault(); handleAddInlineComment(); }} className="flex-1 relative">
                                {commentAttachment && (
                                    <div className="mb-2 p-2 rounded-lg bg-black/10 dark:bg-white/10 border border-gray-600 flex items-center gap-2 relative w-fit">
                                        {commentAttachment.type === 'image' && <img src={commentAttachment.url} className="w-12 h-12 object-cover rounded" alt="att" />}
                                        {commentAttachment.type === 'video' && <video src={commentAttachment.url} className="w-12 h-12 object-cover rounded" />}
                                        {commentAttachment.type === 'file' && <FileText size={24} className={textSecondary} />}
                                        <button onClick={() => setCommentAttachment(null)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={10}/></button>
                                    </div>
                                )}
                                {inlineCommentMentionQuery !== null && (
                                    <div className={`absolute bottom-full mb-2 w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl border ${borderColor} shadow-lg z-50 overflow-hidden`}>
                                        <ul className="max-h-48 overflow-y-auto">
                                        {allUsers
                                                .filter(user =>
                                                    user.username.toLowerCase().includes(`@${inlineCommentMentionQuery.toLowerCase()}`) ||
                                                    user.name.toLowerCase().includes(inlineCommentMentionQuery.toLowerCase())
                                                )
                                                .slice(0, 5)
                                                .map(user => (
                                                <li key={user.id}>
                                                    <button onClick={() => handleInlineMentionSelect(user.username)} className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">
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
                                <div className={`flex items-end bg-black/5 dark:bg-white/5 rounded-2xl border ${borderColor} pr-2 py-2`}>
                                    <div className="flex-1 relative">
                                        <textarea 
                                            ref={inlineCommentInputRef}
                                            placeholder="Add a comment..." 
                                            value={inlineComment}
                                            onChange={handleInlineCommentChange}
                                            rows={1}
                                            className={`w-full px-4 py-1 text-sm bg-transparent rounded-l-2xl ${textColor} placeholder-gray-400 focus:outline-none focus:ring-0 resize-none scrollbar-hide`}
                                        />
                                         <span className="text-[10px] text-gray-500 absolute -bottom-0.5 right-2 pointer-events-none">{inlineComment.length}/{MAX_COMMENT_LENGTH}</span>
                                    </div>

                                    {/* Compact Toolbar */}
                                    <div className="flex items-center gap-1 mb-0.5">
                                         {/* Hidden File Inputs */}
                                         <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileSelect(e, 'image')} accept="image/*" />
                                         <input type="file" className="hidden" id={`video-upload-${post.id}`} onChange={(e) => handleFileSelect(e, 'video')} accept="video/*" />
                                         <input type="file" className="hidden" id={`file-upload-${post.id}`} onChange={(e) => handleFileSelect(e, 'file')} />

                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-blue-400" title="Image"><ImageIcon size={16}/></button>
                                        <label htmlFor={`video-upload-${post.id}`} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-purple-400 cursor-pointer" title="Video"><Video size={16}/></label>
                                        <label htmlFor={`file-upload-${post.id}`} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-green-400 cursor-pointer" title="File"><FileText size={16}/></label>
                                        
                                        <div className="relative" ref={gifRef}>
                                            <button type="button" onClick={() => setShowGifPicker(!showGifPicker)} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-pink-400" title="GIF"><Sticker size={16}/></button>
                                            {showGifPicker && (
                                                <div className={`absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-gray-800 border ${borderColor} rounded-xl shadow-xl p-3 z-50 animate-in slide-in-from-bottom-2`}>
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
                                        
                                        <div className="relative" ref={aiRef}>
                                            <button type="button" onClick={() => setShowAiMenu(!showAiMenu)} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-orange-400" title="AI Assistant"><Bot size={16}/></button>
                                            {showAiMenu && (
                                                <div className="absolute bottom-full right-0 mb-2 w-40 bg-white dark:bg-gray-800 py-1 rounded-lg shadow-xl border border-gray-700 z-50 flex flex-col">
                                                    {isAiLoading ? <div className="p-2 flex items-center gap-2 text-xs"><Loader2 size={12} className="animate-spin"/> Thinking...</div> : <>
                                                    <button onClick={() => handleAiGenerate("Write a positive and engaging comment about this post.")} className="px-3 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700">Positive Reply</button>
                                                    <button onClick={() => handleAiGenerate("Write a witty and funny comment about this post.")} className="px-3 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700">Witty Reply</button>
                                                    <button onClick={() => handleAiGenerate("Check this comment for grammar errors: " + inlineComment)} className="px-3 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700">Fix Grammar</button>
                                                    </>}
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative" ref={emojiRef}>
                                            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-yellow-400" title="Emoji"><Smile size={16}/></button>
                                             {showEmojiPicker && (
                                                <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-xl border border-gray-700 z-50 grid grid-cols-4 gap-1">
                                                    {EMOJIS.map(e => <button key={e} onClick={() => {setInlineComment(c => c + e); setShowEmojiPicker(false);}} className="text-xl hover:scale-125 transition-transform">{e}</button>)}
                                                </div>
                                            )}
                                        </div>

                                        <button type="submit" className={`${textSecondary} hover:${currentTheme.text} p-2 rounded-full disabled:opacity-50`} disabled={!inlineComment.trim() && !commentAttachment}>
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PostComponent;
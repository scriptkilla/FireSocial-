import React, { useState, useEffect, useRef } from 'react';
import { Story, Profile, Poll, PollOption } from '../types';
import { X, MoreHorizontal, Trash2, Download, Share2, PlusCircle, ArrowUp, Send, Eye } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';

interface StoryViewerModalProps {
    stories: Story[];
    startUser: Story;
    profile: Profile;
    onClose: () => void;
    onDeleteStory: (storyId: number, mediaId: number) => void;
}

type FloatingReaction = {
    id: number;
    emoji: string;
    x: number;
    y: number;
};

// --- Sub-components ---

const StoryPoll: React.FC<{ poll: Poll, onVote: (optionId: number) => void }> = ({ poll, onVote }) => {
    return (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center">
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 w-4/5 max-w-sm text-white text-center">
                <h3 className="font-bold text-lg mb-4">{poll.question}</h3>
                <div className="space-y-2">
                    {poll.options.map(option => {
                        const percentage = poll.userVoted != null && (poll.totalVotes ?? 0) > 0 
                            ? (option.votes / (poll.totalVotes ?? 1) * 100).toFixed(0) 
                            : 0;
                        const isSelected = poll.userVoted === option.id;

                        return (
                            <button key={option.id} onClick={() => onVote(option.id)} disabled={poll.userVoted != null} className="w-full p-3 rounded-lg border-2 border-white/50 bg-white/20 hover:bg-white/30 transition-all relative text-left font-semibold">
                                {poll.userVoted != null && (
                                    <div className={`absolute left-0 top-0 h-full bg-white/30 transition-all duration-500 rounded-md ${isSelected ? 'ring-2 ring-white' : ''}`} style={{ width: `${percentage}%` }} />
                                )}
                                <div className="relative flex justify-between items-center">
                                    <span>{option.text}</span>
                                    {poll.userVoted != null && <span>{percentage}%</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const StoryViewerModal: React.FC<StoryViewerModalProps> = ({ stories, startUser, profile, onClose, onDeleteStory }) => {
    const usersWithStories = stories.filter(s => s.media.length > 0);
    const initialIndex = usersWithStories.findIndex(s => s.id === startUser.id);

    const [currentUserIndex, setCurrentUserIndex] = useState(initialIndex !== -1 ? initialIndex : 0);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
    const [votedPolls, setVotedPolls] = useState<Record<number, number>>({});
    
    const touchStartX = useRef(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const currentUserStory = usersWithStories[currentUserIndex];
    const currentMediaItem = currentUserStory?.media[currentMediaIndex];
    const isOwnStory = currentUserStory?.isYours;

    const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setProgress(0);
    };

    const goToNextMedia = () => {
        if (currentMediaIndex < currentUserStory.media.length - 1) {
            setCurrentMediaIndex(prev => prev + 1);
        } else {
            goToNextUser();
        }
    };

    const goToPrevMedia = () => {
        if (currentMediaIndex > 0) {
            setCurrentMediaIndex(prev => prev - 1);
        } else {
            goToPrevUser();
        }
    };
    
    const goToNextUser = () => {
        if (currentUserIndex < usersWithStories.length - 1) {
            setCurrentUserIndex(prev => prev + 1);
            setCurrentMediaIndex(0);
        } else {
            onClose();
        }
    };

    const goToPrevUser = () => {
        if (currentUserIndex > 0) {
            setCurrentUserIndex(prev => prev - 1);
            setCurrentMediaIndex(0);
        }
    };

    useEffect(() => {
        resetTimer();
        if (isPaused) return;

        const duration = currentMediaItem?.duration || 7;
        timerRef.current = setTimeout(goToNextMedia, duration * 1000);
        
        const interval = setInterval(() => {
            setProgress(p => p + (100 / (duration * 10)));
        }, 100);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            clearInterval(interval);
        };
    }, [currentUserIndex, currentMediaIndex, isPaused]);
    
    const togglePause = (shouldPause: boolean) => setIsPaused(shouldPause);

    const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, currentTarget } = e;
        const { left, width } = currentTarget.getBoundingClientRect();
        const tapPosition = (clientX - left) / width;
        if (tapPosition < 0.3) {
            goToPrevMedia();
        } else {
            goToNextMedia();
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => touchStartX.current = e.touches[0].clientX;

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchEndX - touchStartX.current;
        if (Math.abs(deltaX) > 50) { // Swipe threshold
            if (deltaX < 0) goToNextUser();
            else goToPrevUser();
        }
    };
    
    const handleReaction = (emoji: string) => {
        const newReaction: FloatingReaction = {
            id: Date.now(),
            emoji,
            x: Math.random() * 50 + 25,
            y: 0,
        };
        setFloatingReactions(prev => [...prev, newReaction]);
        setTimeout(() => {
            setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
        }, 3000);
    };

    const handlePollVote = (optionId: number) => {
        if(currentMediaItem?.poll) {
            setVotedPolls(prev => ({ ...prev, [currentMediaItem.id]: optionId }));
        }
    };

    if (!currentUserStory || !currentMediaItem) {
        onClose();
        return null;
    }

    const currentPoll = currentMediaItem.poll ? {
        ...currentMediaItem.poll,
        userVoted: votedPolls[currentMediaItem.id] || null
    } : null;

    return (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center font-sans">
            <style>{`
                @keyframes float-up {
                    0% { transform: translateY(0) scale(1); opacity: 1; }
                    100% { transform: translateY(-200px) scale(1.5); opacity: 0; }
                }
                .animate-float-up { animation: float-up 3s ease-out forwards; }
            `}</style>

            {/* Main Story Container */}
            <div 
                className="relative w-full h-full md:max-w-md md:max-h-[90vh] md:aspect-[9/16] bg-gray-800 md:rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                onMouseDown={() => togglePause(true)} 
                onMouseUp={() => togglePause(false)}
                onTouchStart={(e) => { togglePause(true); handleTouchStart(e); }} 
                onTouchEnd={(e) => { togglePause(false); handleTouchEnd(e); }}
            >
                {/* Progress Bars */}
                <div className="absolute top-3 left-3 right-3 h-1 flex gap-1 z-20">
                    {currentUserStory.media.map((_, index) => (
                        <div key={index} className="flex-1 h-full bg-white/30 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-white transition-all duration-100 ease-linear" 
                                style={{ width: index < currentMediaIndex ? '100%' : (index === currentMediaIndex ? `${progress}%` : '0%') }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-6 left-4 right-4 z-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AvatarDisplay avatar={currentUserStory.avatar} size="w-10 h-10" />
                        <div>
                            <p className="font-semibold text-white flex items-center gap-2">
                                {currentUserStory.user}
                                {currentUserStory.isLive && (
                                    <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-md">LIVE</span>
                                )}
                            </p>
                            <p className="text-sm text-white/80">{currentUserStory.timestamp}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isOwnStory && (
                            <div className="relative">
                                <button onClick={(e) => { e.stopPropagation(); setShowOptions(s => !s); }} className="p-2 text-white hover:bg-white/20 rounded-full"><MoreHorizontal size={24} /></button>
                                {showOptions && (
                                    <div className="absolute top-full right-0 mt-2 bg-gray-900/80 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700 w-48">
                                        <button onClick={() => alert('Downloaded!')} className="flex items-center gap-3 px-4 py-2 text-white hover:bg-white/10 w-full text-left"><Download size={16} /> Download</button>
                                        <button onClick={() => navigator.share({ title: 'Check out this story!', url: window.location.href })} className="flex items-center gap-3 px-4 py-2 text-white hover:bg-white/10 w-full text-left"><Share2 size={16} /> Share</button>
                                        <button onClick={() => alert('Added to Highlights!')} className="flex items-center gap-3 px-4 py-2 text-white hover:bg-white/10 w-full text-left"><PlusCircle size={16} /> Add to Highlights</button>
                                        <button onClick={() => onDeleteStory(currentUserStory.id, currentMediaItem.id)} className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-white/10 w-full text-left"><Trash2 size={16} /> Delete</button>
                                    </div>
                                )}
                            </div>
                        )}
                        <button onClick={onClose} className="p-2 text-white hover:bg-white/20 rounded-full"><X size={24} /></button>
                    </div>
                </div>

                {/* Media Content */}
                <div className="absolute inset-0" onClick={handleTap}>
                    {currentMediaItem.type === 'image' && <img src={currentMediaItem.url} alt="Story" className="w-full h-full object-cover" />}
                    {currentMediaItem.type === 'video' && <video src={currentMediaItem.url} autoPlay onEnded={goToNextMedia} className="w-full h-full object-cover" />}
                </div>

                {/* Floating reactions container */}
                <div className="absolute bottom-20 left-0 right-0 h-64 overflow-hidden pointer-events-none z-30">
                    {floatingReactions.map(r => (
                        <div key={r.id} className="absolute bottom-0 animate-float-up text-4xl" style={{ left: `${r.x}%` }}>{r.emoji}</div>
                    ))}
                </div>
                
                {/* Poll */}
                {currentPoll && <StoryPoll poll={currentPoll} onVote={handlePollVote} />}
                
                {/* Footer and Interactions */}
                <div className="absolute inset-x-0 bottom-0 p-4 z-20 flex flex-col items-center">
                    {currentMediaItem.link && (
                        <a href={currentMediaItem.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="mb-4 text-center text-white font-semibold animate-bounce">
                            <ArrowUp size={24} className="mx-auto" />
                            <p>See More</p>
                        </a>
                    )}

                    <div className="w-full flex items-center gap-3">
                        {isOwnStory ? (
                             <div className="flex-1 flex items-center gap-2 bg-black/30 backdrop-blur-sm p-2 rounded-full text-white/80">
                                <Eye size={16} />
                                <span className="text-sm font-semibold">{currentUserStory.views?.toLocaleString() || 0} views</span>
                            </div>
                        ) : (
                             <>
                                <div className="flex-1 relative">
                                    <input type="text" placeholder="Send message" className="w-full bg-black/30 backdrop-blur-sm text-white placeholder-white/70 rounded-full px-4 py-2 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50" />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/20 rounded-full"><Send size={20} /></button>
                                </div>
                                <button onClick={() => handleReaction('❤️')} className="text-3xl hover:scale-125 transition-transform">❤️</button>
                                <button onClick={() => handleReaction('🔥')} className="text-3xl hover:scale-125 transition-transform">🔥</button>
                                <button onClick={() => handleReaction('😂')} className="text-3xl hover:scale-125 transition-transform">😂</button>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StoryViewerModal;

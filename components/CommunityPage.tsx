

import React from 'react';
import { ArrowLeft, Users, Plus, Check } from 'lucide-react';
import { Community, Post, Profile, UserListItem, Theme, Reaction, Message, CommentAttachment } from '../types';
import PostComponent from './PostComponent';
import AvatarDisplay from './AvatarDisplay';

// Props Interface
interface CommunityPageProps {
    community: Community;
    onBack: () => void;
    onJoinToggle: (id: number) => void;
    posts: Post[];
    profile: Profile;
    allUsers: UserListItem[];
    // Post handlers
    onReaction: (postId: number, reactionType: string) => void;
    onBookmark: (postId: number) => void;
    onDeletePost: (postId: number) => void;
    onViewPost: (post: Post) => void;
    onViewComments: (post: Post) => void;
    onAddComment: (postId: number, text: string, replyToUsername?: string, attachment?: CommentAttachment) => void;
    onShare: (post: Post) => void;
    onRepost: (postId: number) => void;
    onQuote: (post: Post) => void;
    onViewProfile: (username: string) => void;
    onViewHashtag: (tag: string) => void;
    // UI
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
    // Data for posts
    reactions: Reaction[];
    messages: Message[];
}

const CommunityPage: React.FC<CommunityPageProps> = (props) => {
    const { community, onBack, onJoinToggle, posts, profile, allUsers, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;
    
    // Filter posts by category for the community feed
    const communityPosts = posts.filter(p => p.category === community.category);

    return (
        <div className="space-y-6">
             {/* Header */}
             <div className={`${cardBg} backdrop-blur-xl rounded-3xl overflow-hidden border ${borderColor}`}>
                <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                    <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                </div>
                <div className="px-6 pb-6 -mt-12 flex flex-col sm:flex-row justify-between items-end gap-4">
                    <div className="flex items-end gap-4">
                        <img src={community.image} alt={community.name} className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-900 object-cover shadow-lg" />
                        <div className="mb-2">
                            <h1 className={`text-2xl font-bold ${textColor}`}>{community.name}</h1>
                            <p className={textSecondary}>{community.members.toLocaleString()} members • {community.category}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onJoinToggle(community.id)}
                        className={`mb-2 px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all ${community.joined ? `${cardBg} border ${borderColor} ${textColor}` : `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white hover:scale-105`}`}
                    >
                        {community.joined ? <><Check size={18} /> Joined</> : <><Plus size={18} /> Join Community</>}
                    </button>
                </div>
             </div>

             {/* Content */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {communityPosts.length > 0 ? (
                        communityPosts.map(post => (
                            <PostComponent 
                                key={post.id} 
                                post={post} 
                                {...props}
                                onDelete={props.onDeletePost}
                                onRepost={props.onRepost}
                                onQuote={props.onQuote}
                                isFollowing={false} // Simplified
                                isBlocked={false}
                                onPurchasePost={() => {}} // Simplified
                                onReport={() => alert("Reported")}
                                onHide={() => {}}
                                onMute={() => {}}
                                onCopyLink={() => {}}
                                onFollowToggle={() => {}}
                                onBlockToggle={() => {}}
                                onVotePoll={() => {}}
                            />
                        ))
                    ) : (
                         <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-8 border ${borderColor} text-center`}>
                            <p className={textSecondary}>No posts in this community yet.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor}`}>
                        <h3 className={`font-bold text-lg mb-4 ${textColor}`}>About</h3>
                        <p className={textSecondary}>Welcome to the {community.name} community! A place for {community.category.toLowerCase()} enthusiasts to share ideas, discuss trends, and connect.</p>
                    </div>
                    
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor}`}>
                        <h3 className={`font-bold text-lg mb-4 ${textColor}`}>Members</h3>
                        <div className="flex -space-x-2 overflow-hidden mb-4">
                             {allUsers.slice(0, 5).map(u => (
                                 <div key={u.id} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden">
                                     <AvatarDisplay avatar={u.avatar} size="w-full h-full" />
                                 </div>
                             ))}
                             {community.members > 5 && (
                                 <div className={`w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold ${textSecondary}`}>
                                     +{(community.members - 5).toLocaleString()}
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default CommunityPage;


import React from 'react';
import { X, Flame } from 'lucide-react';
import { UserListItem, Theme } from '../types';
import AvatarDisplay from './AvatarDisplay';

interface FollowListModalProps {
    listType: 'followers' | 'following';
    onClose: () => void;
    followers: UserListItem[];
    following: UserListItem[];
    onFollowToggle: (userId: number, username: string) => void;
    onFireFollowToggle: (userId: number) => void;
    onViewProfile: (username: string) => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const FollowListModal: React.FC<FollowListModalProps> = ({ listType, onClose, followers, following, onFollowToggle, onFireFollowToggle, onViewProfile, currentTheme, cardBg, textColor, textSecondary, borderColor }) => {
    const list = listType === 'followers' ? followers : following;
    
    const handleViewProfileClick = (username: string) => {
        onClose();
        onViewProfile(username);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16">
            <div className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl p-6 max-w-md w-full border ${borderColor} shadow-2xl max-h-[70vh] flex flex-col`}>
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 className="text-2xl font-bold capitalize">{listType}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>
                <div className="space-y-4 overflow-y-auto pr-2 -mr-2">
                    {list.map(user => {
                        const followedUser = following.find(f => f.id === user.id);
                        const isFollowingThisUser = !!followedUser;
                        const isFireFollowed = followedUser?.isFireFollowed;

                        return (
                            <div key={user.id} className="flex items-center justify-between">
                                <button onClick={() => handleViewProfileClick(user.username)} className="flex items-center gap-3 text-left flex-1 min-w-0">
                                    <AvatarDisplay avatar={user.avatar} size="w-12 h-12" fontSize="text-2xl" />
                                    <div className="truncate">
                                        <p className={`${textColor} font-semibold truncate`}>{user.name}</p>
                                        <p className={`${textSecondary} text-sm truncate`}>{user.username}</p>
                                    </div>
                                </button>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onFollowToggle(user.id, user.username)} className={`px-3 py-2 ${isFollowingThisUser ? `${cardBg} ${textColor}` : `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white`} rounded-2xl text-sm font-semibold hover:scale-105 transition-all min-w-[80px] text-center`}>
                                        {isFollowingThisUser ? 'Following' : 'Follow'}
                                    </button>
                                    {isFollowingThisUser && (
                                         <button 
                                            onClick={() => onFireFollowToggle(user.id)}
                                            className={`p-2 rounded-xl border ${isFireFollowed ? 'bg-orange-500 text-white border-orange-500' : `${borderColor} ${textSecondary}`} hover:scale-105 transition-all`}
                                            title={isFireFollowed ? "FireFollow Active" : "Enable FireFollow"}
                                        >
                                            <Flame size={16} fill={isFireFollowed ? "currentColor" : "none"} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}

export default FollowListModal;
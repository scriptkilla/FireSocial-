import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { FriendSuggestion, Theme, UserListItem } from '../types';
import AvatarDisplay from './AvatarDisplay';

interface SuggestionsModalProps {
    show: boolean;
    onClose: () => void;
    suggestions: FriendSuggestion[];
    following: UserListItem[];
    onFollowToggle: (userId: number, username: string) => void;
    onDismiss: (userId: number) => void;
    onViewProfile: (username: string) => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const SuggestionsModal: React.FC<SuggestionsModalProps> = (props) => {
    const { show, onClose, suggestions, following, onFollowToggle, onDismiss, onViewProfile, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;
    const [searchQuery, setSearchQuery] = useState('');

    if (!show) return null;

    const handleViewProfileClick = (username: string) => {
        onClose();
        onViewProfile(username);
    };

    const filteredSuggestions = suggestions.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16">
            <div className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl p-6 max-w-lg w-full border ${borderColor} shadow-2xl max-h-[80vh] flex flex-col`}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold">Suggestions</h2>
                        <span className={`px-2.5 py-1 text-sm font-bold bg-black/5 dark:bg-white/10 rounded-full border ${borderColor}`}>
                            {filteredSuggestions.length}
                        </span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>
                
                <div className="mb-4 flex-shrink-0 relative">
                    <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                    <input
                        type="text"
                        placeholder="Search suggestions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-black/5 dark:bg-white/5 rounded-2xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`}
                    />
                </div>

                <div className="space-y-3 overflow-y-auto pr-2 -mr-3">
                    {filteredSuggestions.length > 0 ? filteredSuggestions.map(user => {
                        const isFollowingThisUser = following.some(followedUser => followedUser.id === user.id);
                        return (
                            <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10 group">
                                <button onClick={() => handleViewProfileClick(user.username)} className="flex items-center gap-3 text-left flex-1">
                                    <AvatarDisplay avatar={user.avatar} size="w-12 h-12" fontSize="text-2xl" />
                                    <div>
                                        <p className={`${textColor} font-semibold`}>{user.name}</p>
                                        <p className={`${textSecondary} text-sm`}>@{user.username}</p>
                                        <p className={`${textSecondary} text-xs mt-1`}>{user.mutualFriends} mutual friends</p>
                                    </div>
                                </button>
                                <div className="flex items-center gap-2">
                                     <button onClick={() => onFollowToggle(user.id, user.username)} className={`px-4 py-2 ${isFollowingThisUser ? `${cardBg} ${textColor}` : `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white`} rounded-2xl text-sm font-semibold hover:scale-105 transition-all w-28 text-center`}>
                                        {isFollowingThisUser ? 'Following' : 'Follow'}
                                    </button>
                                    <button onClick={() => onDismiss(user.id)} className={`p-2 ${textSecondary} hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}>
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="text-center py-12">
                            <p className={textSecondary}>No suggestions found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SuggestionsModal;
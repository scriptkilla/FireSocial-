
import React, { useState } from 'react';
import { X, Search, Users, Check, Plus } from 'lucide-react';
import { Community, Theme } from '../types';

interface CommunitiesModalProps {
    show: boolean;
    onClose: () => void;
    communities: Community[];
    onJoinToggle: (communityId: number) => void;
    onViewCommunity: (community: Community) => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const CommunitiesModal: React.FC<CommunitiesModalProps> = (props) => {
    const { show, onClose, communities, onJoinToggle, onViewCommunity, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;
    const [searchQuery, setSearchQuery] = useState('');

    if (!show) return null;

    const filteredCommunities = communities.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16" onClick={onClose}>
            <div className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl p-6 max-w-lg w-full border ${borderColor} shadow-2xl max-h-[80vh] flex flex-col`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Users className={currentTheme.text} /> Explore Communities
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>
                
                <div className="mb-4 flex-shrink-0 relative">
                    <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                    <input
                        type="text"
                        placeholder="Find communities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-black/5 dark:bg-white/5 rounded-2xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`}
                    />
                </div>

                <div className="space-y-3 overflow-y-auto pr-2 -mr-3">
                    {filteredCommunities.length > 0 ? filteredCommunities.map(community => (
                        <div 
                            key={community.id} 
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                            onClick={() => onViewCommunity(community)}
                        >
                            <div className="flex items-center gap-4">
                                <img src={community.image} alt={community.name} className="w-12 h-12 rounded-lg object-cover" />
                                <div>
                                    <p className={`font-semibold ${textColor}`}>{community.name}</p>
                                    <p className={`text-xs ${textSecondary}`}>{community.members.toLocaleString()} members • {community.category}</p>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onJoinToggle(community.id); }} 
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${community.joined ? `${cardBg} border ${borderColor} ${textSecondary}` : `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white hover:scale-105`}`}
                            >
                                {community.joined ? <><Check size={14} /> Joined</> : <><Plus size={14} /> Join</>}
                            </button>
                        </div>
                    )) : (
                        <div className="text-center py-12">
                            <p className={textSecondary}>No communities found matching "{searchQuery}".</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CommunitiesModal;

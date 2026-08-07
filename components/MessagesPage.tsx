import React, { useState, useMemo } from 'react';
import { Message, GroupChat, Theme } from '../types';
import { Search, Users, MessageSquare as MessageSquareIcon } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';

interface MessagesPageProps {
    messages: Message[];
    groupChats: GroupChat[];
    onViewMessage: (message: Message) => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const MessagesPage: React.FC<MessagesPageProps> = (props) => {
    const { messages, groupChats, onViewMessage, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;
    const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMessages = useMemo(() => {
        return messages.filter(m =>
            m.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [messages, searchQuery]);

    const filteredGroupChats = useMemo(() => {
        return groupChats.filter(g =>
            g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [groupChats, searchQuery]);
    
    const ConversationRow: React.FC<{ item: Message | GroupChat, type: 'direct' | 'group' }> = ({ item, type }) => {
        const isDirect = type === 'direct';
        const directItem = isDirect ? (item as Message) : null;
        const groupItem = !isDirect ? (item as GroupChat) : null;

        return (
            <button
                onClick={() => isDirect && onViewMessage(directItem!)}
                className={`w-full flex items-center gap-4 p-3 rounded-2xl text-left transition-colors hover:bg-white/5`}
            >
                <div className="relative flex-shrink-0">
                    <AvatarDisplay avatar={item.avatar} size="w-14 h-14" fontSize="text-3xl" />
                    {directItem?.online && <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800`}></div>}
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline">
                        <p className={`font-semibold truncate ${textColor}`}>{isDirect ? directItem!.user : groupItem!.name}</p>
                        <p className={`text-xs flex-shrink-0 ${textSecondary}`}>{item.time}</p>
                    </div>
                    <div className="flex justify-between items-start">
                        <p className={`text-sm truncate ${textSecondary}`}>
                            {directItem?.lastMessageSentByYou && "You: "}
                            {item.lastMessage}
                        </p>
                        {(item.unread) && (
                            <div className={`w-5 h-5 text-xs bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-full flex items-center justify-center font-bold flex-shrink-0`}>
                                {item.unread === true ? '1' : item.unread}
                            </div>
                        )}
                    </div>
                </div>
            </button>
        );
    };

    return (
        <div className="space-y-6">
            <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-3xl font-bold ${textColor}`}>Messages</h2>
                </div>
                <div className="relative">
                    <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} placeholder-gray-400 focus:outline-none focus:ring-2 ${currentTheme.ring}`}
                    />
                </div>
            </div>

            <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}>
                <div className={`flex gap-2 p-1 mb-4 rounded-2xl border ${borderColor} bg-black/5 dark:bg-white/5`}>
                    <button
                        onClick={() => setActiveTab('direct')}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'direct' ? `bg-white dark:bg-gray-700 shadow-md ${textColor}` : `${textSecondary} hover:bg-white/5`}`}
                    >
                        <MessageSquareIcon size={16}/> Direct
                    </button>
                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'groups' ? `bg-white dark:bg-gray-700 shadow-md ${textColor}` : `${textSecondary} hover:bg-white/5`}`}
                    >
                        <Users size={16}/> Groups
                    </button>
                </div>
                
                <div className="space-y-2">
                    {activeTab === 'direct' && (
                        filteredMessages.length > 0 ? (
                            filteredMessages.map(msg => <ConversationRow key={msg.id} item={msg} type="direct" />)
                        ) : (
                            <p className={`${textSecondary} text-center py-8`}>No direct messages found.</p>
                        )
                    )}
                    {activeTab === 'groups' && (
                        filteredGroupChats.length > 0 ? (
                            filteredGroupChats.map(chat => <ConversationRow key={chat.id} item={chat} type="group" />)
                        ) : (
                            <p className={`${textSecondary} text-center py-8`}>No group chats found.</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
import React, { useState, useMemo } from 'react';
import { Notification, Theme } from '../types';
import { X, CheckCheck, Bell, AtSign, Heart, MessageSquare, UserPlus, Flame } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';

interface NotificationsModalProps {
    show: boolean;
    onClose: () => void;
    notifications: Notification[];
    unreadCount: number;
    onMarkAllRead: () => void;
    onMarkOneRead: (id: number) => void;
    onViewNotification: (notification: Notification) => void;
    // UI Props
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
    show,
    onClose,
    notifications,
    unreadCount,
    onMarkAllRead,
    onMarkOneRead,
    onViewNotification,
    currentTheme,
    cardBg,
    textColor,
    textSecondary,
    borderColor
}) => {
    const [activeTab, setActiveTab] = useState<'All' | 'Mentions'>('All');

    const filteredNotifications = useMemo(() => {
        const sorted = [...notifications].sort((a, b) => (b.read === a.read) ? b.id - a.id : a.read ? 1 : -1);
        if (activeTab === 'Mentions') {
            return sorted.filter(n => n.type === 'tag');
        }
        return sorted;
    }, [notifications, activeTab]);

    const groupNotificationsByTime = (notifs: Notification[]) => {
        const groups: { [key: string]: Notification[] } = {
            'New': [],
            'Earlier': []
        };
        notifs.forEach(n => {
            if (!n.read) {
                groups['New'].push(n);
            } else {
                groups['Earlier'].push(n);
            }
        });

        if (groups['New'].length === 0) delete groups['New'];
        if (groups['Earlier'].length === 0) delete groups['Earlier'];

        return groups;
    };
    
    const groupedNotifications = groupNotificationsByTime(filteredNotifications);

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'like': return <Heart className="text-red-500" size={18} />;
            case 'comment': return <MessageSquare className="text-blue-500" size={18} />;
            case 'follow': return <UserPlus className="text-green-500" size={18} />;
            case 'tag': return <AtSign className={`text-purple-500`} size={18} />;
            case 'tip': return <Flame className={`text-orange-500`} size={18} fill="currentColor" />;
            default: return <Bell className={textSecondary} size={18} />;
        }
    };
    
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16" onClick={onClose}>
            <div
                className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl p-6 max-w-lg w-full border ${borderColor} shadow-2xl max-h-[80vh] flex flex-col`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        Notifications
                        {unreadCount > 0 && (
                            <span className={`flex items-center justify-center text-sm font-bold bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-full w-6 h-6`}>
                                {unreadCount}
                            </span>
                        )}
                    </h2>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 &&
                          <button onClick={onMarkAllRead} className={`text-sm font-semibold ${currentTheme.text} hover:opacity-80 flex items-center gap-1.5`}>
                              <CheckCheck size={16} /> Mark all as read
                          </button>
                        }
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                    </div>
                </div>

                {/* Tabs */}
                <div className={`flex gap-2 p-1 mb-4 rounded-2xl border ${borderColor} bg-black/5 dark:bg-white/5`}>
                    <button
                        onClick={() => setActiveTab('All')}
                        className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'All' ? `bg-white dark:bg-gray-700 shadow-md ${textColor}` : `${textSecondary} hover:bg-white/5`}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab('Mentions')}
                        className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'Mentions' ? `bg-white dark:bg-gray-700 shadow-md ${textColor}` : `${textSecondary} hover:bg-white/5`}`}
                    >
                        Mentions
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto -mr-3 pr-3 space-y-2">
                   {Object.keys(groupedNotifications).length > 0 ? (
                       Object.entries(groupedNotifications).map(([groupTitle, notifs]) => (
                           <div key={groupTitle}>
                               <h3 className={`font-semibold text-lg px-2 mb-2 ${textSecondary}`}>{groupTitle}</h3>
                               {notifs.map(notification => (
                                   <div
                                       key={notification.id}
                                       onClick={() => onViewNotification(notification)}
                                       className={`p-3 rounded-2xl flex items-start gap-3 cursor-pointer transition-colors hover:bg-white/5 ${!notification.read ? 'bg-blue-500/10' : ''}`}
                                   >
                                       <div className="relative mt-1">
                                           <AvatarDisplay avatar="👤" size="w-10 h-10" />
                                           <div className={`absolute -bottom-1 -right-1 p-1 bg-white dark:bg-gray-800 rounded-full`}>
                                               {getNotificationIcon(notification.type)}
                                           </div>
                                       </div>
                                       <div className="flex-1">
                                           <p className={`${textColor}`}>
                                               <span className="font-bold">{notification.user}</span> {notification.content}
                                           </p>
                                           <p className={`text-sm mt-1 ${currentTheme.text}`}>{notification.time}</p>
                                       </div>
                                       {!notification.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>}
                                   </div>
                               ))}
                           </div>
                       ))
                   ) : (
                       <div className="text-center py-16">
                           <Bell size={48} className={`mx-auto ${textSecondary}`} />
                           <p className={`mt-4 font-semibold ${textColor}`}>No notifications here</p>
                           <p className={textSecondary}>You're all caught up!</p>
                       </div>
                   )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsModal;
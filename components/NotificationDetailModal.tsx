import React from 'react';
import { Notification, Theme, UserListItem, Post } from '../types';
import { X, Bell, AtSign, Heart, MessageSquare, UserPlus, ArrowRight, Flame } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';

interface NotificationDetailModalProps {
    show: boolean;
    notification: Notification | null;
    onClose: () => void;
    allUsers: UserListItem[];
    posts: Post[];
    onViewPost: (post: Post) => void;
    onViewProfile: (username: string) => void;
    // UI Props
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
    show,
    notification,
    onClose,
    allUsers,
    posts,
    onViewPost,
    onViewProfile,
    currentTheme,
    cardBg,
    textColor,
    textSecondary,
    borderColor
}) => {
    if (!show || !notification) return null;

    const user = allUsers.find(u => u.username === notification.username);
    const avatar = user ? user.avatar : '👤';

    const getNotificationIcon = (type: Notification['type']) => {
        const iconProps = { size: 32, className: 'text-white' };
        switch (type) {
            case 'like': return <div className="p-3 bg-red-500 rounded-full"><Heart {...iconProps} /></div>;
            case 'comment': return <div className="p-3 bg-blue-500 rounded-full"><MessageSquare {...iconProps} /></div>;
            case 'follow': return <div className="p-3 bg-green-500 rounded-full"><UserPlus {...iconProps} /></div>;
            case 'tag': return <div className={`p-3 bg-purple-500 rounded-full`}><AtSign {...iconProps} /></div>;
            case 'tip': return <div className={`p-3 bg-orange-500 rounded-full`}><Flame {...iconProps} fill="currentColor" /></div>;
            default: return <div className={`p-3 bg-gray-500 rounded-full`}><Bell {...iconProps} /></div>;
        }
    };

    const getActionText = (type: Notification['type']) => {
        switch (type) {
            case 'like':
            case 'comment':
            case 'tag':
                return 'View Post';
            case 'follow':
                return 'View Profile';
            case 'tip':
                return 'View Wallet';
            default:
                return null;
        }
    };

    const handleActionClick = () => {
        if (!notification) return;

        if (notification.type === 'follow') {
            onViewProfile(notification.username);
        } else if (notification.type === 'tip') {
             // Navigate to wallet (via profile for now since we don't have direct nav access here)
             onViewProfile(notification.username); // Or current user's profile ideally
             onClose();
        } else if (notification.postId) {
            const postToView = posts.find(p => p.id === notification.postId);
            if (postToView) {
                onViewPost(postToView);
            } else {
                alert("Post not found. It may have been deleted.");
                onClose();
            }
        }
    };

    const actionText = getActionText(notification.type);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl p-6 max-w-md w-full border ${borderColor} shadow-2xl flex flex-col items-center text-center`}
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                
                <div className="mb-4">
                    {getNotificationIcon(notification.type)}
                </div>

                <AvatarDisplay avatar={avatar} size="w-20 h-20" className="mb-4" />
                
                <p className="text-lg mb-4">
                    <span className="font-bold">{notification.user}</span> {notification.content}.
                </p>

                <p className={`text-sm ${textSecondary} mb-6`}>{notification.time}</p>

                {actionText && (
                    <button 
                        onClick={handleActionClick}
                        className={`w-full py-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2`}
                    >
                        {actionText} <ArrowRight size={18}/>
                    </button>
                )}
            </div>
        </div>
    );
};

export default NotificationDetailModal;
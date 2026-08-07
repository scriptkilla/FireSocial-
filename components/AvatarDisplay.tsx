import React from 'react';
import { User } from 'lucide-react';

const AvatarDisplay = ({ avatar, size = 'w-10 h-10', fontSize = 'text-xl', className = '' }: { avatar: string; size?: string; fontSize?: string; className?: string; }) => {
    const isImage = avatar && (avatar.startsWith('data:image') || avatar.startsWith('http'));
    const isEmoji = !isImage && avatar && avatar.length <= 2;

    return (
        <div className={`relative rounded-full flex items-center justify-center overflow-hidden bg-gray-200 dark:bg-gray-700 ${size} ${className}`}>
            {isImage ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : isEmoji ? (
                <span className={fontSize}>{avatar}</span>
            ) : (
                <User className="w-1/2 h-1/2 text-gray-500" />
            )}
        </div>
    );
};

export default AvatarDisplay;
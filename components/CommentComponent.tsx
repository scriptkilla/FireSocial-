
import React, { useState } from 'react';
import { Comment, Theme, Profile } from '../types';
import { Heart, Edit, Trash2, Paperclip } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';

interface CommentComponentProps {
    comment: Comment;
    profile: Profile;
    onLike: () => void;
    onDelete: () => void;
    onEdit: (newText: string) => void;
    onReply: (username: string) => void;
    onViewProfile: (username: string) => void;
    textColor: string;
    textSecondary: string;
    currentTheme: Theme;
}

const CommentComponent: React.FC<CommentComponentProps> = ({ comment, profile, onLike, onDelete, onEdit, onReply, onViewProfile, textColor, textSecondary, currentTheme }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.text);

    const handleSaveEdit = () => {
        if (editText.trim() && editText.trim() !== comment.text) {
            onEdit(editText.trim());
        }
        setIsEditing(false);
    };

    const isOwnComment = comment.userId === profile.id;

    const renderAttachment = () => {
        if (!comment.attachment) return null;
        
        const { type, url, name, size } = comment.attachment;
        
        if (type === 'image') {
            return (
                <div className="mt-2 rounded-lg overflow-hidden border border-gray-700 max-w-xs">
                    <img src={url} alt="Comment attachment" className="w-full h-auto object-cover" />
                </div>
            );
        } else if (type === 'video') {
            return (
                <div className="mt-2 rounded-lg overflow-hidden border border-gray-700 max-w-xs">
                    <video src={url} controls className="w-full h-auto" />
                </div>
            );
        } else if (type === 'file') {
             return (
                <div className="mt-2 p-2 rounded-lg bg-black/10 dark:bg-white/10 border border-gray-700 flex items-center gap-2 max-w-xs">
                    <Paperclip size={16} className={textSecondary} />
                    <div className="flex-1 overflow-hidden">
                        <p className={`text-sm font-medium truncate ${textColor}`}>{name || 'Attached File'}</p>
                        {size && <p className={`text-xs ${textSecondary}`}>{size}</p>}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex items-start gap-3">
            <button onClick={() => onViewProfile(comment.username)} className="hover:scale-105 transition-transform">
                <AvatarDisplay avatar={comment.avatar} size="w-10 h-10" fontSize="text-xl" />
            </button>
            <div className="flex-1 min-w-0">
                <div className="bg-black/5 dark:bg-white/5 p-3 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <button onClick={() => onViewProfile(comment.username)} className={`font-semibold text-sm ${textColor} hover:underline`}>
                            {comment.username}
                        </button>
                        <p className={`text-xs ${textSecondary}`}>
                          {comment.time}
                          {comment.edited && <span className="italic"> (edited)</span>}
                        </p>
                    </div>

                    {isEditing ? (
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className={`w-full mt-2 p-2 text-sm bg-white/10 rounded-lg focus:ring-1 ${currentTheme.ring} focus:outline-none resize-none`}
                            rows={3}
                            autoFocus
                        />
                    ) : (
                        <p className={`text-sm ${textColor} mt-1 whitespace-pre-wrap break-words`}>
                            {comment.replyTo && <span className={`font-semibold ${currentTheme.text} mr-1`}>{comment.replyTo}</span>}
                            {comment.text}
                        </p>
                    )}
                    
                    {!isEditing && renderAttachment()}
                </div>
                <div className="flex items-center gap-4 mt-1 px-2 text-xs font-semibold">
                    {isEditing ? (
                        <>
                           <button onClick={handleSaveEdit} className={`${currentTheme.text} font-bold`}>Save</button>
                           <button onClick={() => setIsEditing(false)} className={`${textSecondary}`}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <button onClick={onLike} className={`flex items-center gap-1 transition-colors ${comment.isLiked ? currentTheme.text : textSecondary} ${currentTheme.hoverText}`}>
                                <Heart size={14} fill={comment.isLiked ? 'currentColor' : 'none'} />
                                {comment.likes > 0 && <span>{comment.likes}</span>}
                            </button>
                            <button onClick={() => onReply(comment.username)} className={`${textSecondary} ${currentTheme.hoverText}`}>
                                Reply
                            </button>
                            {isOwnComment && (
                                <>
                                    <button onClick={() => { setIsEditing(true); setEditText(comment.text); }} className={`${textSecondary} ${currentTheme.hoverText}`}>
                                        Edit
                                    </button>
                                    <button onClick={onDelete} className="text-red-500/80 hover:text-red-500">
                                        Delete
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentComponent;

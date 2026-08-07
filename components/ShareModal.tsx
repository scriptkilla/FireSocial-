
import React, { useState } from 'react';
import { X, Link2, Repeat, Check, Share2 } from 'lucide-react';
import { Post, Theme } from '../types';
import AvatarDisplay from './AvatarDisplay';

interface ShareModalProps {
    show: boolean;
    onClose: () => void;
    post: Post;
    onReshare: () => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

// Custom Icons for Brands not in Lucide (or specific versions)
const XIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const RedditIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>;
const WhatsAppIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>;
const TelegramIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.638z"/></svg>;
const TikTokIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.16c0 2.52-1.12 4.84-2.98 6.38-2.21 1.83-5.17 2.3-7.93 1.29-2.67-.97-4.61-3.53-4.61-6.48 0-3.79 3.08-6.86 6.88-6.86.4 0 .8.04 1.19.11v4.2c-2.25-.49-4.47 1.21-4.47 3.47 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5V7.35c1.47 1.51 3.57 2.4 5.75 2.37V5.68c-2.46.08-4.62-1.67-4.91-4.12-1.1.03-2.2 0-3.3 0z"/></svg>;
const FacebookIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
const LinkedInIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const InstagramIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>;
const EmailIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const SMSIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2h8a5 5 0 0 1 5 5v7a5 5 0 0 1-5 5H6l-4 3V7a5 5 0 0 1 6-5Z"/></svg>;

const ShareModal: React.FC<ShareModalProps> = ({ show, onClose, post, onReshare, currentTheme, cardBg, textColor, textSecondary, borderColor }) => {
    const [copied, setCopied] = useState(false);
    const [reshared, setReshared] = useState(false);

    if (!show) return null;

    const postUrl = `https://firesocial.app/post/${post.id}`;
    const shareText = `Check out this post by ${post.user} on FireSocial!`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReshareClick = () => {
        onReshare();
        setReshared(true);
        setTimeout(() => {
            setReshared(false);
            onClose();
        }, 1500);
    };
    
    const copyLinkOnly = (platform: string) => {
        navigator.clipboard.writeText(postUrl);
        alert(`Link copied for ${platform}!`);
    };

    const shareLinks = [
        { name: 'X', icon: XIcon, url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`, color: 'hover:text-black dark:hover:text-white' },
        { name: 'Facebook', icon: FacebookIcon, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, color: 'hover:text-blue-600' },
        { name: 'LinkedIn', icon: LinkedInIcon, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, color: 'hover:text-blue-700' },
        { name: 'Instagram', icon: InstagramIcon, action: () => copyLinkOnly('Instagram'), color: 'hover:text-pink-600' },
        { name: 'Reddit', icon: RedditIcon, url: `https://www.reddit.com/submit?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(shareText)}`, color: 'hover:text-orange-600' },
        { name: 'WhatsApp', icon: WhatsAppIcon, url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + postUrl)}`, color: 'hover:text-green-500' },
        { name: 'Telegram', icon: TelegramIcon, url: `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`, color: 'hover:text-blue-400' },
        { name: 'TikTok', icon: TikTokIcon, action: () => copyLinkOnly('TikTok'), color: 'hover:text-black dark:hover:text-white' },
        { name: 'Email', icon: EmailIcon, url: `mailto:?subject=${encodeURIComponent("Check out this post")}&body=${encodeURIComponent(shareText + " " + postUrl)}`, color: 'hover:text-red-500' },
        { name: 'SMS', icon: SMSIcon, url: `sms:?body=${encodeURIComponent(shareText + " " + postUrl)}`, color: 'hover:text-green-400' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
             <div 
                className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl w-full max-w-md border ${borderColor} shadow-2xl p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Share2 size={20}/> Share Post</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>

                {/* Post Preview */}
                <div className={`p-4 rounded-2xl bg-black/5 dark:bg-white/5 border ${borderColor} mb-6 flex gap-3`}>
                    <AvatarDisplay avatar={post.avatar} size="w-10 h-10" />
                    <div className="overflow-hidden">
                        <p className="font-semibold text-sm">{post.user}</p>
                        <p className={`text-sm ${textSecondary} truncate`}>{post.content}</p>
                    </div>
                </div>

                {/* Internal Actions */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button 
                        onClick={handleReshareClick}
                        disabled={reshared}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${reshared ? 'bg-green-500 text-white' : `bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border ${borderColor}`}`}
                    >
                        {reshared ? <Check size={18}/> : <Repeat size={18}/>}
                        {reshared ? 'Reshared' : 'Repost'}
                    </button>
                    <button 
                        onClick={handleCopyLink}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${copied ? 'bg-green-500 text-white' : `bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border ${borderColor}`}`}
                    >
                        {copied ? <Check size={18}/> : <Link2 size={18}/>}
                        {copied ? 'Copied' : 'Copy Link'}
                    </button>
                </div>

                {/* External Shares Grid */}
                <div>
                    <p className={`text-sm font-medium ${textSecondary} mb-3`}>Share to</p>
                    <div className="grid grid-cols-5 gap-4">
                        {shareLinks.map((link) => {
                            const content = (
                                <>
                                    <div className={`w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 border ${borderColor} flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-white/10 ${link.color}`}>
                                        <link.icon />
                                    </div>
                                    <span className={`text-[10px] ${textSecondary} mt-1`}>{link.name}</span>
                                </>
                            );

                            if (link.action) {
                                return (
                                    <button 
                                        key={link.name}
                                        onClick={link.action}
                                        className="flex flex-col items-center gap-1 group"
                                    >
                                        {content}
                                    </button>
                                );
                            }

                            return (
                                <a 
                                    key={link.name}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-1 group"
                                >
                                    {content}
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;

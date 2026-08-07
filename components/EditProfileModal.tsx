
import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronUp, ChevronDown, Trash2, Link2, Github, Twitter, Linkedin, Instagram, Facebook, Youtube, Twitch, Globe, Mail } from 'lucide-react';
import { Profile, Link, PrivacySettings, Theme } from '../types';
import AvatarDisplay from './AvatarDisplay';

interface EditProfileModalProps {
    profile: Profile;
    onClose: () => void;
    onSave: (updatedProfile: Profile) => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const PRESET_LINK_ICONS: { id: string, icon: React.ElementType }[] = [
    { id: 'link', icon: Link2 },
    { id: 'website', icon: Globe },
    { id: 'email', icon: Mail },
    { id: 'github', icon: Github },
    { id: 'twitter', icon: Twitter },
    { id: 'linkedin', icon: Linkedin },
    { id: 'instagram', icon: Instagram },
    { id: 'facebook', icon: Facebook },
    { id: 'youtube', icon: Youtube },
    { id: 'twitch', icon: Twitch },
];

const EditProfileModal: React.FC<EditProfileModalProps> = ({ profile, onClose, onSave, currentTheme, cardBg, textColor, textSecondary, borderColor }) => {
    const [editedProfile, setEditedProfile] = useState(profile);
    const [hashtagInput, setHashtagInput] = useState('');
    const [openIconPickerId, setOpenIconPickerId] = useState<number | null>(null);
    
    const avatarFileInputRef = useRef<HTMLInputElement>(null);
    const coverPhotoFileInputRef = useRef<HTMLInputElement>(null);
    const iconPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openIconPickerId !== null && iconPickerRef.current && !iconPickerRef.current.contains(event.target as Node)) {
                setOpenIconPickerId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openIconPickerId]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'avatar' | 'cover') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if(fileType === 'avatar') {
                    setEditedProfile(p => ({ ...p, avatar: result }));
                } else {
                    setEditedProfile(p => ({ ...p, coverPhoto: result }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLinkChange = (index: number, field: 'title' | 'url' | 'icon', value: string) => {
        const newLinks = [...(editedProfile.links || [])];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setEditedProfile({ ...editedProfile, links: newLinks });
        if (field === 'icon') {
            setOpenIconPickerId(null);
        }
    };

    const handleAddLink = () => {
        const newLink = { id: Date.now(), title: '', url: '', icon: 'link' };
        setEditedProfile({ ...editedProfile, links: [...(editedProfile.links || []), newLink] });
    };

    const handleRemoveLink = (id: number) => {
        setEditedProfile({ ...editedProfile, links: (editedProfile.links || []).filter(link => link.id !== id) });
    };

    const handleMoveLink = (index: number, direction: 'up' | 'down') => {
        const links = [...(editedProfile.links || [])];
        if (direction === 'up' && index > 0) {
            [links[index], links[index - 1]] = [links[index - 1], links[index]];
        } else if (direction === 'down' && index < links.length - 1) {
            [links[index], links[index + 1]] = [links[index + 1], links[index]];
        }
        setEditedProfile({ ...editedProfile, links });
    };
    
    const handlePrivacyChange = (setting: keyof PrivacySettings, value: boolean) => {
      setEditedProfile(p => ({
        ...p,
        privacySettings: {
          ...p.privacySettings,
          [setting]: value,
        }
      }));
    };

    const handleAddHashtag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            let tag = hashtagInput.trim().replace(/,/g, '');
            if (tag) {
                if (!tag.startsWith('#')) {
                    tag = '#' + tag;
                }
                const currentTags = editedProfile.featuredHashtags || [];
                if (!currentTags.includes(tag)) {
                    setEditedProfile({ ...editedProfile, featuredHashtags: [...currentTags, tag] });
                }
                setHashtagInput('');
            }
        }
    };

    const handleRemoveHashtag = (tagToRemove: string) => {
        setEditedProfile({ ...editedProfile, featuredHashtags: (editedProfile.featuredHashtags || []).filter(tag => tag !== tagToRemove) });
    };

    const getIconComponent = (iconName?: string) => {
        const preset = PRESET_LINK_ICONS.find(p => p.id === iconName);
        return preset ? preset.icon : Link2;
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16">
            <div className={`overflow-y-auto max-h-[90vh] ${cardBg} backdrop-blur-xl ${textColor} rounded-3xl p-6 max-w-md w-full border ${borderColor} shadow-2xl`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                    <div className="flex flex-col items-center gap-4">
                        <AvatarDisplay avatar={editedProfile.avatar} size="w-24 h-24" fontSize="text-5xl" />
                        <input type="file" ref={avatarFileInputRef} onChange={(e) => handleFileSelect(e, 'avatar')} accept="image/*" className="hidden" />
                        <div className="flex gap-2">
                            <button onClick={() => avatarFileInputRef.current?.click()} className={`px-4 py-2 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} hover:bg-white/10 transition-all text-sm font-semibold`}>Upload Photo</button>
                            <button onClick={() => setEditedProfile(p => ({ ...p, avatar: '' }))} className={`px-4 py-2 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} text-red-500 hover:bg-white/10 transition-all text-sm font-semibold`}>Remove</button>
                        </div>
                    </div>
                    <div>
                        <label className={`block ${textSecondary} mb-2`}>Cover Photo</label>
                         <div className="h-24 rounded-lg relative bg-gray-500 dark:bg-gray-800 overflow-hidden mb-2">
                            {editedProfile.coverPhoto ? (
                                <img src={editedProfile.coverPhoto} alt="Cover Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full" style={{ background: editedProfile.wallpaper }}></div>
                            )}
                        </div>
                        <input type="file" ref={coverPhotoFileInputRef} onChange={(e) => handleFileSelect(e, 'cover')} accept="image/*" className="hidden" />
                         <div className="flex gap-2">
                            <button onClick={() => coverPhotoFileInputRef.current?.click()} className={`px-4 py-2 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} hover:bg-white/10 transition-all text-sm font-semibold`}>Upload Cover</button>
                            <button onClick={() => setEditedProfile(p => ({ ...p, coverPhoto: '' }))} className={`px-4 py-2 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} text-red-500 hover:bg-white/10 transition-all text-sm font-semibold`}>Remove</button>
                        </div>
                    </div>
                    <div><label className={`block ${textSecondary} mb-2`}>Display Name</label><input type="text" value={editedProfile.name} onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})} className={`w-full px-4 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`} /></div>
                    <div><label className={`block ${textSecondary} mb-2`}>Username</label><input type="text" value={editedProfile.username} onChange={(e) => setEditedProfile({...editedProfile, username: e.target.value})} className={`w-full px-4 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`} /></div>
                    <div><label className={`block ${textSecondary} mb-2`}>Email</label><input type="email" value={editedProfile.email} onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})} className={`w-full px-4 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`} /></div>
                    <div><label className={`block ${textSecondary} mb-2`}>Bio</label><textarea value={editedProfile.bio} onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})} className={`w-full px-4 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring} resize-none`} rows={3} /></div>
                    
                    <div>
                        <h3 className={`text-lg font-semibold mb-3 pt-2 border-t ${borderColor}`}>Personal Details</h3>
                        <div><label className={`block ${textSecondary} mb-2`}>Location</label><input type="text" value={editedProfile.location || ''} onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})} className={`w-full px-4 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`} /></div>
                        <div><label className={`block ${textSecondary} mt-3 mb-2`}>Website</label><input type="url" value={editedProfile.website || ''} onChange={(e) => setEditedProfile({...editedProfile, website: e.target.value})} className={`w-full px-4 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`} /></div>
                        <div><label className={`block ${textSecondary} mt-3 mb-2`}>Work / Occupation</label><input type="text" value={editedProfile.work || ''} onChange={(e) => setEditedProfile({...editedProfile, work: e.target.value})} className={`w-full px-4 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`} /></div>
                        <div><label className={`block ${textSecondary} mt-3 mb-2`}>Education</label><input type="text" value={editedProfile.education || ''} onChange={(e) => setEditedProfile({...editedProfile, education: e.target.value})} className={`w-full px-4 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`} /></div>
                    </div>
                    
                    <div>
                      <label className={`block ${textSecondary} mb-2`}>Pronouns</label>
                      <input 
                          type="text" 
                          placeholder="e.g., she/her"
                          value={editedProfile.pronouns || ''} 
                          onChange={(e) => setEditedProfile({...editedProfile, pronouns: e.target.value})} 
                          className={`w-full px-4 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`}
                      />
                      <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer mt-2">
                          <span className={`text-sm ${textSecondary}`}>Show on profile</span>
                          <button 
                              onClick={() => setEditedProfile({...editedProfile, showPronouns: !editedProfile.showPronouns})}
                              className={`w-10 h-5 rounded-full transition-all ${editedProfile.showPronouns ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}` : 'bg-gray-400'}`}
                          >
                              <div className={`w-4 h-4 bg-white rounded-full transition-all ${editedProfile.showPronouns ? 'translate-x-5' : 'translate-x-1'}`} />
                          </button>
                      </label>
                    </div>

                    <div>
                        <h3 className={`text-lg font-semibold mb-3 pt-2 border-t ${borderColor}`}>Advanced Features</h3>
                        <div>
                            <label className={`block ${textSecondary} mb-2`}>Profile Category</label>
                            <select
                                value={editedProfile.category || ''}
                                onChange={(e) => setEditedProfile({...editedProfile, category: e.target.value})}
                                className={`w-full px-4 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring} appearance-none`}
                            >
                                <option value="">None</option>
                                <option value="Personal Blog">Personal Blog</option>
                                <option value="Creator">Creator</option>
                                <option value="Business">Business</option>
                                <option value="Fan Page">Fan Page</option>
                                <option value="Education">Education</option>
                            </select>
                        </div>
                        <div className="mt-4">
                            <label className={`block ${textSecondary} mb-2`}>Featured Hashtags</label>
                            <div className={`flex flex-wrap gap-2 p-2 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} mb-2 min-h-[40px]`}>
                                {(editedProfile.featuredHashtags || []).map(tag => (
                                    <div key={tag} className={`flex items-center gap-1 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white text-sm px-3 py-1 rounded-full`}>
                                        <span>{tag}</span>
                                        <button onClick={() => handleRemoveHashtag(tag)}><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Add tags and press Enter..."
                                value={hashtagInput}
                                onChange={(e) => setHashtagInput(e.target.value)}
                                onKeyDown={handleAddHashtag}
                                className={`w-full px-4 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <h3 className={`text-lg font-semibold mb-3 pt-2 border-t ${borderColor}`}>Account & Privacy</h3>
                        <div className="space-y-1">
                            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                                <div>
                                    <span className={textColor}>Private Account</span>
                                    <p className={`text-xs ${textSecondary}`}>Only approved followers can see your posts.</p>
                                </div>
                                <button onClick={() => handlePrivacyChange('privateAccount', !editedProfile.privacySettings.privateAccount)} className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ${editedProfile.privacySettings.privateAccount ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}` : 'bg-gray-400'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${editedProfile.privacySettings.privateAccount ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </label>
                             <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                                <div>
                                    <span className={textColor}>Suggest Account to Others</span>
                                    <p className={`text-xs ${textSecondary}`}>Based on your contacts and profile info.</p>
                                </div>
                                <button onClick={() => handlePrivacyChange('suggestAccount', !editedProfile.privacySettings.suggestAccount)} className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ${editedProfile.privacySettings.suggestAccount ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}` : 'bg-gray-400'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${editedProfile.privacySettings.suggestAccount ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </label>
                        </div>
                    </div>


                     <div>
                        <label className={`block ${textSecondary} mb-2`}>Links</label>
                        <div className="space-y-3">
                            {(editedProfile.links || []).map((link, index) => {
                                const IconComponent = getIconComponent(link.icon);
                                return (
                                    <div key={link.id} className="flex items-center gap-2">
                                        <div className="flex flex-col justify-center">
                                          <button onClick={() => handleMoveLink(index, 'up')} disabled={index === 0} className="disabled:opacity-20 disabled:cursor-not-allowed"><ChevronUp size={16} /></button>
                                          <button onClick={() => handleMoveLink(index, 'down')} disabled={index === (editedProfile.links || []).length - 1} className="disabled:opacity-20 disabled:cursor-not-allowed"><ChevronDown size={16} /></button>
                                        </div>
                                        
                                        <div className="relative">
                                            <button 
                                                onClick={() => setOpenIconPickerId(openIconPickerId === link.id ? null : link.id)} 
                                                className={`p-2.5 ${cardBg} backdrop-blur-xl rounded-xl border ${borderColor} ${textColor} hover:bg-white/10`}
                                            >
                                                <IconComponent size={20} />
                                            </button>
                                            
                                            {openIconPickerId === link.id && (
                                                <div 
                                                    ref={iconPickerRef}
                                                    className={`absolute top-full left-0 mt-2 w-48 p-2 rounded-xl border ${borderColor} bg-white dark:bg-gray-900 shadow-xl z-50 grid grid-cols-5 gap-1`}
                                                >
                                                    {PRESET_LINK_ICONS.map(preset => {
                                                        const PIcon = preset.icon;
                                                        return (
                                                            <button 
                                                                key={preset.id} 
                                                                onClick={() => handleLinkChange(index, 'icon', preset.id)} 
                                                                className={`p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 ${link.icon === preset.id ? 'bg-black/10 dark:bg-white/10 text-blue-500' : ''}`}
                                                                title={preset.id}
                                                            >
                                                                <PIcon size={18} />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        <input type="text" placeholder="Title" value={link.title} onChange={(e) => handleLinkChange(index, 'title', e.target.value)} className={`w-1/3 px-3 py-2 ${cardBg} backdrop-blur-xl rounded-xl border ${borderColor} ${textColor} focus:outline-none focus:ring-1 ${currentTheme.ring}`} />
                                        <input type="url" placeholder="URL" value={link.url} onChange={(e) => handleLinkChange(index, 'url', e.target.value)} className={`flex-grow px-3 py-2 ${cardBg} backdrop-blur-xl rounded-xl border ${borderColor} ${textColor} focus:outline-none focus:ring-1 ${currentTheme.ring}`} />
                                        <button onClick={() => handleRemoveLink(link.id)} className={`${textSecondary} hover:text-red-500 p-2`}><Trash2 size={18} /></button>
                                    </div>
                                );
                            })}
                            <button onClick={handleAddLink} className={`w-full py-2 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} hover:bg-white/10`}>+ Add Link</button>
                        </div>
                    </div>

                    <button onClick={() => onSave(editedProfile)} className={`w-full py-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg`}>Save Changes</button>
                </div>
            </div>
        </div>
    );
}

export default EditProfileModal;

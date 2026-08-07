








import React, { useState, useEffect } from 'react';
import { Palette, UserMinus, X, ChevronLeft, ChevronRight, Search, User, KeyRound, Bell, Eye, Shield, Lock, Users, MessageSquare, List, Heart, VolumeX, FileText, HelpCircle, AlertTriangle, Info, LogOut, Download, Trash2, Globe, CheckCircle, Circle, PlusCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Profile, ThemeColor, Themes, UserListItem, Theme } from '../types';
import { THEMES as ThemeConstants, API_CONFIG, API_VERSIONS, ApiService } from '../constants';
import AvatarDisplay from './AvatarDisplay';

// --- HELP CENTER DATA ---
const HELP_ARTICLES = [
  // Getting Started
  { id: 'getting-started-1', category: 'Getting Started', question: 'How do I create an account?', answer: 'To create an account, click the "Sign Up" button on the homepage and follow the on-screen instructions. You will need to provide a valid email address and create a password.' },
  { id: 'getting-started-2', category: 'Getting Started', question: 'How do I complete my profile?', answer: 'Navigate to your profile page and click "Edit Profile". You can add a profile picture, cover photo, bio, location, website, and personal links to make your profile stand out.' },

  // Profile
  { id: 'profile-1', category: 'Profile', question: 'How can I customize my profile?', answer: 'You can edit your profile by navigating to your profile page and clicking the "Edit Profile" button. From there, you can change your avatar, cover photo, bio, links, and more.' },
  { id: 'profile-2', category: 'Profile', question: 'How do I add or remove links from my profile?', answer: 'In the "Edit Profile" screen, scroll down to the "Links" section. You can add a new link by clicking "+ Add Link" or remove an existing one by clicking the trash icon next to it.' },

  // Features
  { id: 'features-1', category: 'Features', question: 'How do I create a post?', answer: 'On the main feed, you will find a "What\'s on your mind?" text box. Simply type your content, add any media using the icons, and click the "Post" button.' },
  { id: 'features-2', category: 'Features', question: 'How do polls work?', answer: 'You can create a poll by clicking the bar chart icon in the "Create Post" box. Add a question and at least two options. Your followers can then vote on the options you provide.' },
  { id: 'features-3', category: 'Features', question: 'How do I delete a post?', answer: 'Find the post you want to delete, click the three-dots icon (...) in the top-right corner of the post, and select "Delete Post". Note that this action cannot be undone.' },

  // Privacy & Security
  { id: 'privacy-1', category: 'Privacy & Security', question: 'How do I make my account private?', answer: 'You can make my account private in the Settings menu. Go to Settings > Privacy and Security, and toggle the "Private Account" option on. When your account is private, only followers you approve can see your content.' },
  { id: 'privacy-2', category: 'Privacy & Security', question: 'How do I block someone?', answer: 'To block a user, go to their profile, click the three-dots icon (...), and select "Block User". You can manage your blocked accounts in Settings > Privacy and Security > Blocked Accounts.' },
  { id: 'privacy-3', category: 'Privacy & Security', question: 'What is Two-Factor Authentication (2FA)?', answer: '2FA adds an extra layer of security to your account. When enabled, you\'ll need to enter a special login code in addition to your password. You can enable it in Settings > Account Settings > Two-Factor Authentication.' },

  // Troubleshooting
  { id: 'troubleshooting-1', category: 'Troubleshooting', question: 'What should I do if the app is not loading?', answer: 'First, try refreshing the page. If that doesn\'t work, check your internet connection. Clearing your browser cache and cookies can also resolve many common issues.' },

  // Support
  { id: 'support-1', category: 'Support', question: 'How do I contact support?', answer: 'If you can\'t find an answer in our Help Center, you can report a problem via Settings > Support and About > Report a Problem. Please provide as much detail as possible.' },
];


// --- HELPER & VIEW COMPONENTS ---
// These are now defined at the top-level of the file to follow React best practices
// and to be used by the new View components.

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="px-4 pb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h3>
        <div className="space-y-1">{children}</div>
    </div>
);

const SettingsItem: React.FC<{ icon: React.ElementType; label: string; onClick?: () => void; hasNav?: boolean, value?: string, hoverBg: string, textSecondary: string }> = ({ icon: Icon, label, onClick, hasNav = true, value, hoverBg, textSecondary }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between text-left p-3 rounded-lg ${hoverBg}`}>
        <div className="flex items-center gap-4"><Icon size={20} /><span>{label}</span></div>
        <div className="flex items-center gap-2">{value && <span className={textSecondary}>{value}</span>}{hasNav && <ChevronRight size={20} className={textSecondary} />}</div>
    </button>
);

const SettingsToggleItem: React.FC<{ icon: React.ElementType; label: string; description?: string; isEnabled: boolean; onToggle: () => void; currentTheme: Theme, darkMode: boolean, textSecondary: string, hoverBg: string }> = ({ icon: Icon, label, description, isEnabled, onToggle, currentTheme, darkMode, textSecondary, hoverBg }) => (
    <div className={`w-full flex items-center justify-between p-3 rounded-lg ${hoverBg}`}>
        <div className="flex items-center gap-4">
            <Icon size={20} />
            <div>
                <span>{label}</span>
                {description && <p className={`text-xs ${textSecondary}`}>{description}</p>}
            </div>
        </div>
        <button onClick={onToggle} className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ${isEnabled ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}` : (darkMode ? 'bg-gray-600' : 'bg-gray-300')}`}>
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const FormInput: React.FC<{label: string, type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, currentTheme: Theme, borderColor: string, textColor: string}> = ({ label, type, value, onChange, currentTheme, borderColor, textColor }) => (
    <div>
        <label className="block text-gray-500 dark:text-gray-400 mb-2 text-sm">{label}</label>
        <input type={type} value={value} onChange={onChange} className={`w-full px-4 py-3 bg-black/5 dark:bg-white/5 rounded-xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`} />
    </div>
);


// --- PROPS FOR VIEW COMPONENTS ---
type SettingsView = 'main' | 'account' | 'privacy' | 'notifications' | 'messaging' | 'content' | 'support' | 'appearance' | 'blocked' | 'language' | 'changePassword' | 'twoFactor' | 'mutedAccounts' | 'restrictedAccounts' | 'favoriteTopics' | 'hiddenWords' | 'sensitiveContent' | 'reportProblem' | 'helpCenter' | 'apiConfig';

interface ViewProps {
    profile: Profile;
    setProfile: React.Dispatch<React.SetStateAction<Profile>>;
    onClose: () => void;
    onEditProfile: () => void;
    setThemeColor: (color: ThemeColor) => void;
    onBlockToggle: (userId: number, username: string) => void;
    // Theme
    themeColor: ThemeColor;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    hoverBg: string;
    darkMode: boolean;
    // Fix: Add borderColor to the ViewProps interface to ensure it's available for child components.
    borderColor: string;
    // Data
    allUsers: UserListItem[];
}

// --- VIEW COMPONENTS ---
const MainView: React.FC<{ setView: (view: SettingsView) => void } & Pick<ViewProps, 'hoverBg' | 'textSecondary'>> = ({ setView, hoverBg, textSecondary }) => (
    <div className="space-y-6">
        {/* Fix: Added the required `textSecondary` prop to all `SettingsItem` components. */}
        <SettingsItem icon={User} label="Account Settings" onClick={() => setView('account')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={Shield} label="Privacy and Security" onClick={() => setView('privacy')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={Bell} label="Notifications" onClick={() => setView('notifications')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={MessageSquare} label="Messaging" onClick={() => setView('messaging')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={Palette} label="Appearance" onClick={() => setView('appearance')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={KeyRound} label="API Configuration" onClick={() => setView('apiConfig')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={List} label="Content Preferences" onClick={() => setView('content')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={HelpCircle} label="Support and About" onClick={() => setView('support')} hoverBg={hoverBg} textSecondary={textSecondary} />
    </div>
);

const AccountSettingsView: React.FC<Pick<ViewProps, 'onEditProfile' | 'onClose' | 'profile' | 'hoverBg' | 'textSecondary'> & { setShowDeactivateConfirm: React.Dispatch<React.SetStateAction<boolean>>, setView: (view: SettingsView) => void }> = ({ setView, onEditProfile, onClose, profile, hoverBg, textSecondary, setShowDeactivateConfirm }) => {
    return (
        <SettingsSection title="Account Settings">
            <SettingsItem icon={User} label="Edit Profile" onClick={() => { onEditProfile(); onClose(); }} hoverBg={hoverBg} textSecondary={textSecondary} />
            <SettingsItem icon={Globe} label="Language" onClick={() => setView('language')} value={profile.language === 'en-US' ? 'English' : 'Español'} hoverBg={hoverBg} textSecondary={textSecondary} />
            <SettingsItem icon={KeyRound} label="Change Password" onClick={() => setView('changePassword')} hoverBg={hoverBg} textSecondary={textSecondary} />
            <SettingsItem icon={Lock} label="Two-Factor Authentication" onClick={() => setView('twoFactor')} hoverBg={hoverBg} textSecondary={textSecondary} />
            <SettingsItem icon={Download} label="Download Data" onClick={() => alert('Request received. We will email you a link to download your data when it is ready.')} hoverBg={hoverBg} textSecondary={textSecondary} />
            <SettingsItem icon={LogOut} label="Deactivate Account" onClick={() => setShowDeactivateConfirm(true)} hasNav={false} hoverBg={hoverBg} textSecondary={textSecondary} />
        </SettingsSection>
    );
};

const PrivacySettingsView: React.FC<Pick<ViewProps, 'profile' | 'setProfile' | 'currentTheme' | 'darkMode' | 'textSecondary' | 'hoverBg'> & { setView: (view: SettingsView) => void }> = ({ profile, setProfile, setView, currentTheme, darkMode, textSecondary, hoverBg }) => {
    const handlePrivacyChange = (setting: keyof Profile['privacySettings'], value: boolean) => {
        setProfile(p => ({ ...p, privacySettings: { ...p.privacySettings, [setting]: value } }));
    };
    const toggleProps = { currentTheme, darkMode, textSecondary, hoverBg };
    return (
        <SettingsSection title="Privacy and Security">
            <SettingsToggleItem icon={Lock} label="Private Account" description="Only approved followers can see your posts." isEnabled={profile.privacySettings.privateAccount} onToggle={() => handlePrivacyChange('privateAccount', !profile.privacySettings.privateAccount)} {...toggleProps} />
            <SettingsToggleItem icon={Eye} label="Activity Status" isEnabled={profile.privacySettings.activityStatus} onToggle={() => handlePrivacyChange('activityStatus', !profile.privacySettings.activityStatus)} {...toggleProps} />
            <SettingsItem icon={VolumeX} label="Muted Accounts" onClick={() => setView('mutedAccounts')} hoverBg={hoverBg} textSecondary={textSecondary} />
            <SettingsItem icon={UserMinus} label="Blocked Accounts" onClick={() => setView('blocked')} hoverBg={hoverBg} textSecondary={textSecondary} />
            <SettingsItem icon={Users} label="Restricted Accounts" onClick={() => setView('restrictedAccounts')} hoverBg={hoverBg} textSecondary={textSecondary} />
        </SettingsSection>
    );
};

const BlockedAccountsView: React.FC<Pick<ViewProps, 'profile' | 'allUsers' | 'onBlockToggle' | 'currentTheme' | 'borderColor' | 'textColor' | 'textSecondary' | 'cardBg'>> = ({ profile, allUsers, onBlockToggle, currentTheme, borderColor, textColor, textSecondary, cardBg }) => {
    const list = profile.blockedAccounts;
    const [userSearch, setUserSearch] = useState('');

    const filteredUsers = userSearch ? allUsers.filter(u => 
        u.id !== profile.id &&
        (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.username.toLowerCase().includes(userSearch.toLowerCase()))
    ) : [];

    return (
        <div className="space-y-4">
            <p className={`px-4 text-sm ${textSecondary}`}>Once you block someone, they will no longer be able to find your profile, posts, or story.</p>
            <div className="px-3"><input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search for users to block..." className={`w-full px-4 py-2 bg-black/5 dark:bg-white/5 rounded-xl border ${borderColor} ${textColor} focus:outline-none focus:ring-1 ${currentTheme.ring}`} /></div>
            
            {userSearch ? (
                <SettingsSection title="Search Results">
                    {filteredUsers.length > 0 ? filteredUsers.map(user => {
                        const isBlocked = list.some(u => u.id === user.id);
                        return (<div key={user.id} className="flex items-center justify-between p-2 rounded-lg">
                            <div className="flex items-center gap-3">
                                <AvatarDisplay avatar={user.avatar} size="w-10 h-10" fontSize="text-xl" />
                                <div><p className={textColor}>{user.name}</p><p className={`text-sm ${textSecondary}`}>{user.username}</p></div>
                            </div>
                            <button onClick={() => onBlockToggle(user.id, user.username)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${isBlocked ? `${cardBg} ${textColor}` : `bg-red-500 text-white`}`}>
                                {isBlocked ? `Unblock` : 'Block'}
                            </button>
                        </div>)
                    }) : <p className={`px-4 ${textSecondary}`}>No users found.</p>}
                </SettingsSection>
            ) : (
                <SettingsSection title={`Blocked Accounts (${list.length})`}>
                    {list.length > 0 ? list.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-2 rounded-lg">
                            <div className="flex items-center gap-3">
                                <AvatarDisplay avatar={user.avatar} size="w-10 h-10" fontSize="text-xl" />
                                <div><p className={textColor}>{user.name}</p><p className={`text-sm ${textSecondary}`}>{user.username}</p></div>
                            </div>
                            <button onClick={() => onBlockToggle(user.id, user.username)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${cardBg} ${textColor}`}>
                                Unblock
                            </button>
                        </div>
                    )) : <p className={`px-4 ${textSecondary}`}>You haven't blocked any accounts.</p>}
                </SettingsSection>
            )}
        </div>
    );
};


const AppearanceSettingsView: React.FC<Pick<ViewProps, 'themeColor' | 'setThemeColor'>> = ({ themeColor, setThemeColor }) => (
    <SettingsSection title="Theme">
        <div className="grid grid-cols-4 gap-3 p-3">
            {(Object.keys(ThemeConstants) as ThemeColor[]).map(color => (
                <button key={color} onClick={() => setThemeColor(color)} className={`h-16 rounded-2xl bg-gradient-to-r ${ThemeConstants[color].from} ${ThemeConstants[color].to} ${themeColor === color ? 'ring-4 ring-white/80' : ''} hover:scale-105 transition-all`} />
            ))}
        </div>
    </SettingsSection>
);

const NotificationSettingsView: React.FC<Pick<ViewProps, 'profile' | 'setProfile' | 'currentTheme' | 'darkMode' | 'textSecondary' | 'hoverBg'>> = ({ profile, setProfile, currentTheme, darkMode, textSecondary, hoverBg }) => {
    const handleNotificationChange = (setting: keyof Profile['notificationSettings'], value: boolean) => {
        setProfile(p => ({ ...p, notificationSettings: { ...p.notificationSettings, [setting]: value } }));
    };
    const toggleProps = { currentTheme, darkMode, textSecondary, hoverBg };
    return (
        <SettingsSection title="Notifications">
            <SettingsToggleItem icon={Bell} label="Push Notifications" isEnabled={profile.notificationSettings.push} onToggle={() => handleNotificationChange('push', !profile.notificationSettings.push)} {...toggleProps} />
            <SettingsToggleItem icon={Bell} label="Email Notifications" isEnabled={profile.notificationSettings.email} onToggle={() => handleNotificationChange('email', !profile.notificationSettings.email)} {...toggleProps} />
        </SettingsSection>
    );
};

const MessagingSettingsView: React.FC<Pick<ViewProps, 'profile' | 'setProfile' | 'currentTheme' | 'darkMode' | 'textSecondary' | 'hoverBg' | 'cardBg' | 'borderColor' | 'textColor'>> = ({ profile, setProfile, currentTheme, darkMode, textSecondary, hoverBg, cardBg, borderColor, textColor }) => {
    const handleMessagingChange = (setting: keyof NonNullable<Profile['messagingSettings']>, value: any) => {
        setProfile(p => ({
            ...p,
            messagingSettings: { ...p.messagingSettings, [setting]: value } as any
        }));
    };

    const toggleProps = { currentTheme, darkMode, textSecondary, hoverBg };
    const messagingSettings = profile.messagingSettings || { allowDirectMessages: 'everyone', readReceipts: true };

    return (
        <SettingsSection title="Messaging">
            <div className={`p-3 rounded-lg ${hoverBg}`}>
                 <label className={`block mb-2 text-sm font-medium ${textColor}`}>Allow Message Requests From</label>
                 <select 
                    value={messagingSettings.allowDirectMessages}
                    onChange={(e) => handleMessagingChange('allowDirectMessages', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg bg-white text-gray-900 dark:bg-black dark:text-white border ${borderColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`}
                 >
                     <option value="everyone">Everyone</option>
                     <option value="followers">Followers Only</option>
                 </select>
                 <p className={`text-xs ${textSecondary} mt-1`}>People not in this list must send a request first.</p>
            </div>

            <SettingsToggleItem 
                icon={Eye} 
                label="Read Receipts" 
                description="Let others know when you've seen their messages."
                isEnabled={messagingSettings.readReceipts} 
                onToggle={() => handleMessagingChange('readReceipts', !messagingSettings.readReceipts)} 
                {...toggleProps} 
            />
        </SettingsSection>
    );
};

const ApiConfigView: React.FC<Pick<ViewProps, 'currentTheme' | 'borderColor' | 'textColor' | 'textSecondary'>> = ({ currentTheme, borderColor, textColor, textSecondary }) => {
    const [selectedService, setSelectedService] = useState<ApiService>('Aries AI');
    const [apiKey, setApiKey] = useState('');
    const [apiVersion, setApiVersion] = useState('');
    const [customModelName, setCustomModelName] = useState('');
    const [customBaseUrl, setCustomBaseUrl] = useState('');
    const [connectionStatus, setConnectionStatus] = useState<'untested' | 'testing' | 'valid' | 'invalid'>('untested');
    
    const availableVersions = API_VERSIONS[selectedService] || [];
    const selectedVersionDetails = availableVersions.find(v => v.name === apiVersion);

    useEffect(() => {
        const config = API_CONFIG[selectedService];
        
        if (selectedService !== 'Custom') {
            const versions = API_VERSIONS[selectedService] || [];
            const savedKey = localStorage.getItem(config.storageKey);
            const savedVersion = localStorage.getItem(config.storageKey.replace('apiKey', 'apiVersion'));
            
            setApiKey(savedKey || '');

            const validSavedVersion = versions.find(v => v.name === savedVersion);
            if (validSavedVersion) {
                setApiVersion(savedVersion!);
            } else if (versions.length > 0) {
                const defaultVersion = versions[0].name;
                setApiVersion(defaultVersion);
                localStorage.setItem(config.storageKey.replace('apiKey', 'apiVersion'), defaultVersion);
            } else {
                setApiVersion('');
                localStorage.removeItem(config.storageKey.replace('apiKey', 'apiVersion'));
            }
        } else {
            const savedKey = localStorage.getItem(config.storageKey);
            const savedBaseUrl = localStorage.getItem(config.baseUrlKey!);
            const savedModelName = localStorage.getItem(config.modelNameKey!);
            setApiKey(savedKey || '');
            setCustomBaseUrl(savedBaseUrl || '');
            setCustomModelName(savedModelName || '');
        }

        setConnectionStatus('untested');
    }, [selectedService]);

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newKey = e.target.value;
        setApiKey(newKey);
        localStorage.setItem(API_CONFIG[selectedService].storageKey, newKey);
        setConnectionStatus('untested');
    };

    const handleApiVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newVersion = e.target.value;
        setApiVersion(newVersion);
        localStorage.setItem(API_CONFIG[selectedService].storageKey.replace('apiKey', 'apiVersion'), newVersion);
    };
    
    const handleCustomBaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value;
        setCustomBaseUrl(newUrl);
        localStorage.setItem(API_CONFIG['Custom'].baseUrlKey!, newUrl);
        setConnectionStatus('untested');
    };

    const handleCustomModelNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setCustomModelName(newName);
        localStorage.setItem(API_CONFIG['Custom'].modelNameKey!, newName);
    };

    const handleTestConnection = () => {
        setConnectionStatus('testing');
        setTimeout(() => {
            let isValid = false;
            if (selectedService === 'Custom') {
                try {
                    // Basic validation for URL and key
                    isValid = apiKey.trim().length > 10 && new URL(customBaseUrl.trim()).protocol.startsWith('http');
                } catch (e) {
                    isValid = false;
                }
            } else {
                isValid = apiKey.trim().length > 10;
            }

            if (isValid) {
                setConnectionStatus('valid');
            } else {
                setConnectionStatus('invalid');
            }
        }, 1500);
    };

    const renderConnectionButton = () => {
        switch (connectionStatus) {
            case 'testing':
                return <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-500/20 rounded-lg text-sm font-semibold"><Loader2 size={16} className="animate-spin" /> Testing...</button>;
            case 'valid':
                return <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold"><CheckCircle size={16} /> Connected</div>;
            case 'invalid':
                return <button onClick={handleTestConnection} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold"><WifiOff size={16} /> Invalid Config. Retry?</button>;
            case 'untested':
            default:
                return <button onClick={handleTestConnection} disabled={!apiKey.trim()} className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-sm font-semibold border ${borderColor} hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed`}><Wifi size={16} /> Test Connection</button>;
        }
    };

    return (
        <SettingsSection title="API Configuration">
            <div className="p-3 space-y-4">
                <div>
                    <label className={`block mb-2 text-sm ${textSecondary}`}>AI Service</label>
                    <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value as ApiService)}
                        className={`w-full px-4 py-3 rounded-xl border ${borderColor} focus:outline-none focus:ring-2 ${currentTheme.ring} appearance-none bg-white text-gray-900 dark:bg-black dark:text-white`}
                    >
                        {Object.keys(API_CONFIG).map(service => (
                            <option key={service} value={service}>{service}</option>
                        ))}
                    </select>
                </div>
                {selectedService === 'Custom' ? (
                    <>
                        <div>
                            <label className={`block mb-2 text-sm ${textSecondary}`}>Endpoint Base URL</label>
                            <input
                                type="text"
                                placeholder="https://api.example.com/v1"
                                value={customBaseUrl}
                                onChange={handleCustomBaseUrlChange}
                                className={`w-full px-4 py-3 bg-black/5 dark:bg-white/5 rounded-xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`}
                            />
                        </div>
                        <div>
                            <label className={`block mb-2 text-sm ${textSecondary}`}>Model Name</label>
                            <input
                                type="text"
                                placeholder="e.g., custom-model-v1-beta"
                                value={customModelName}
                                onChange={handleCustomModelNameChange}
                                className={`w-full px-4 py-3 bg-black/5 dark:bg-white/5 rounded-xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`}
                            />
                        </div>
                    </>
                ) : (
                    <div>
                        <label className={`block mb-2 text-sm ${textSecondary}`}>Version</label>
                        <select
                            value={apiVersion}
                            onChange={handleApiVersionChange}
                            className={`w-full px-4 py-3 rounded-xl border ${borderColor} focus:outline-none focus:ring-2 ${currentTheme.ring} appearance-none bg-white text-gray-900 dark:bg-black dark:text-white`}
                            disabled={availableVersions.length === 0}
                        >
                            {availableVersions.map(version => (
                                <option key={version.name} value={version.name}>
                                    {version.name}
                                </option>
                            ))}
                            {availableVersions.length === 0 && <option>No versions available</option>}
                        </select>
                        {selectedVersionDetails && (
                            <p className={`text-xs mt-2 ${textSecondary}`}>
                                {selectedVersionDetails.description}
                            </p>
                        )}
                    </div>
                )}
                
                <div>
                    <label className={`block mb-2 text-sm ${textSecondary}`}>API Key</label>
                    <input
                        type="password"
                        placeholder="Enter your API key"
                        value={apiKey}
                        onChange={handleApiKeyChange}
                        className={`w-full px-4 py-3 bg-black/5 dark:bg-white/5 rounded-xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`}
                    />
                    <a
                        href={selectedService === 'Custom' ? '#' : API_CONFIG[selectedService].url}
                        target={selectedService === 'Custom' ? '_self' : '_blank'}
                        rel="noopener noreferrer"
                        className={`text-xs mt-2 inline-block ${currentTheme.text} ${selectedService === 'Custom' ? 'opacity-50 cursor-not-allowed' : 'hover:underline'}`}
                        onClick={(e) => {
                            if (selectedService === 'Custom') {
                                e.preventDefault();
                            }
                        }}
                    >
                        Get your API key
                    </a>
                </div>

                <div className="pt-2">
                    {renderConnectionButton()}
                </div>
            </div>
        </SettingsSection>
    );
};

const ContentPreferencesView: React.FC<Pick<ViewProps, 'hoverBg' | 'textSecondary'> & { setView: (view: SettingsView) => void }> = ({ setView, hoverBg, textSecondary }) => (
    <SettingsSection title="Content Preferences">
        <SettingsItem icon={Heart} label="Favorite Topics" onClick={() => setView('favoriteTopics')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={VolumeX} label="Hidden Words" onClick={() => setView('hiddenWords')} hoverBg={hoverBg} textSecondary={textSecondary} />
        <SettingsItem icon={AlertTriangle} label="Sensitive Content" onClick={() => setView('sensitiveContent')} hoverBg={hoverBg} textSecondary={textSecondary} />
    </SettingsSection>
);

const SupportAndAboutView: React.FC<Pick<ViewProps, 'hoverBg' | 'textSecondary'> & { setView: (view: SettingsView) => void }> = ({ setView, hoverBg, textSecondary }) => (
    <SettingsSection title="Support and About">
        <SettingsItem icon={HelpCircle} label="Help Center" onClick={() => setView('helpCenter')} hoverBg={hoverBg} textSecondary={textSecondary} />
    </SettingsSection>
);

// --- MAIN SETTINGS MODAL COMPONENT ---
export const SettingsModal: React.FC<ViewProps & { show: boolean }> = (props) => {
    const { show, onClose, cardBg, textColor } = props;
    const [view, setView] = useState<SettingsView>('main');
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

    useEffect(() => {
        if (show) {
            setView('main');
            setShowDeactivateConfirm(false);
        }
    }, [show]);

    if (!show) return null;

    const getTitle = (): string => {
        switch (view) {
            case 'main': return 'Settings';
            case 'account': return 'Account Settings';
            case 'privacy': return 'Privacy and Security';
            case 'notifications': return 'Notifications';
            case 'messaging': return 'Messaging';
            case 'content': return 'Content Preferences';
            case 'support': return 'Support and About';
            case 'appearance': return 'Appearance';
            case 'blocked': return 'Blocked Accounts';
            case 'language': return 'Language';
            case 'changePassword': return 'Change Password';
            case 'twoFactor': return 'Two-Factor Authentication';
            case 'mutedAccounts': return 'Muted Accounts';
            case 'restrictedAccounts': return 'Restricted Accounts';
            case 'favoriteTopics': return 'Favorite Topics';
            case 'hiddenWords': return 'Hidden Words';
            case 'sensitiveContent': return 'Sensitive Content';
            case 'reportProblem': return 'Report a Problem';
            case 'helpCenter': return 'Help Center';
            case 'apiConfig': return 'API Configuration';
            default: return 'Settings';
        }
    };

    const renderContent = () => {
        switch(view) {
            case 'main': return <MainView setView={setView} hoverBg={props.hoverBg} textSecondary={props.textSecondary} />;
            case 'account': return <AccountSettingsView {...props} setView={setView} setShowDeactivateConfirm={setShowDeactivateConfirm} />;
            case 'privacy': return <PrivacySettingsView {...props} setView={setView} />;
            case 'blocked': return <BlockedAccountsView {...props} />;
            case 'appearance': return <AppearanceSettingsView {...props} />;
            case 'notifications': return <NotificationSettingsView {...props} />;
            case 'messaging': return <MessagingSettingsView {...props} />;
            case 'apiConfig': return <ApiConfigView {...props} />;
            case 'content': return <ContentPreferencesView {...props} setView={setView} />;
            case 'support': return <SupportAndAboutView {...props} setView={setView} />;
            default: return <MainView setView={setView} hoverBg={props.hoverBg} textSecondary={props.textSecondary} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16" onClick={onClose}>
            <div className={`overflow-y-auto max-h-[90vh] ${cardBg} backdrop-blur-xl ${textColor} rounded-3xl p-6 max-w-lg w-full border ${props.borderColor} shadow-2xl relative`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        {view !== 'main' && <button onClick={() => setView('main')} className="p-2 hover:bg-white/10 rounded-full"><ChevronLeft size={20} /></button>}
                        <h2 className="text-2xl font-bold">{getTitle()}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>

                {renderContent()}

                {showDeactivateConfirm && (
                    <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center p-4 rounded-3xl">
                        <div className={`${cardBg} p-6 rounded-2xl border ${props.borderColor} max-w-sm w-full text-center`}>
                            <AlertTriangle size={48} className="mx-auto text-red-500" />
                            <h3 className="text-xl font-bold mt-4">Deactivate Account?</h3>
                            <p className={`mt-2 ${props.textSecondary}`}>Your profile will be disabled. You can reactivate it by logging back in. Are you sure?</p>
                            <div className="flex gap-2 mt-6">
                                <button onClick={() => setShowDeactivateConfirm(false)} className={`flex-1 py-2 rounded-lg ${cardBg} border ${props.borderColor} hover:bg-white/10`}>Cancel</button>
                                <button onClick={() => { alert('Account deactivated.'); onClose(); }} className="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold">Deactivate</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
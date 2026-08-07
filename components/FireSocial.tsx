
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Home, Compass, MessageSquare, User, Settings, Sun, Moon, LogOut, BarChart2, Star, Zap, Award, ShoppingBag, Gamepad2, Bot, PlusSquare, Bell, Mail, Plus, TrendingUp, Search, ArrowRight, Loader2, Users, Check, X, GripVertical, Flame, MapPin, CloudSun, CloudRain, Wind, Droplets, Activity, Bitcoin, ArrowUpRight, ArrowDownRight, Trash2, Save, Sliders, Eye, EyeOff as EyeOffIcon, Cloud, CloudLightning, CloudSnow, Umbrella, Wallet, CreditCard } from 'lucide-react';

// Types and Constants
import { Post, Profile, Notification, Message, GroupChat, Story, FriendSuggestion, TrendingHashtag, LiveUser, UserListItem, Comment, ScheduledPost, ThemeColor, ChatMessage, ActiveCall, Product, MediaItem, Community, CommentAttachment, WalletTransaction, Game } from '../types';
import { THEMES, REACTIONS, ALL_ACHIEVEMENTS } from '../constants';

// Data
import { 
    ALL_USERS_DATA,
    INITIAL_POSTS,
    INITIAL_NOTIFICATIONS,
    INITIAL_MESSAGES,
    INITIAL_GROUP_CHATS,
    INITIAL_STORIES,
    INITIAL_FRIEND_SUGGESTIONS,
    INITIAL_TRENDING_HASHTAGS,
    INITIAL_LIVE_USERS,
    INITIAL_FOLLOWING,
    INITIAL_FOLLOWERS,
    INITIAL_CHAT_HISTORY,
    INITIAL_MARKETPLACE_PRODUCTS,
    INITIAL_COMMUNITIES
} from '../data';

// Auth
import { useAuth } from './AuthContext';

// Components
import PostComponent from './PostComponent';
import { SettingsModal } from './SettingsModal';
import EditProfileModal from './EditProfileModal';
import FollowListModal from './FollowListModal';
import ProfilePage from './ProfilePage';
import ExplorePage from './ExplorePage';
import MessagesPage from './MessagesPage';
import CommentModal from './CommentModal';
import MessageModal from './MessageModal';
import CallModal from './CallModal';
import StoryViewerModal from './StoryViewerModal';
import AchievementsPage from './AchievementsPage';
import TrophyPage from './TrophyPage';
import StreakPage from './StreakPage';
import AnalyticsModal from './AnalyticsModal';
import CreateStoryModal from './CreateStoryModal';
import CreatePostModal from './CreatePostModal';
import SuggestionsModal from './SuggestionsModal';
import NotificationsModal from './NotificationsModal';
import NotificationDetailModal from './NotificationDetailModal';
import MarketplacePage from './MarketplacePage';
import MyStorePage from './MyStorePage';
import PublicStorePage from './PublicStorePage';
import ProductDetailModal from './ProductDetailModal';
import AddProductModal from './AddProductModal';
import AICreatorModal from './AICreatorModal';
import GameCreatorModal from './GameCreatorModal';
import GamePlayerModal from './GamePlayerModal';
import AIChatbotModal from './AIChatbotModal';
import AvatarDisplay from './AvatarDisplay';
import CommunitiesModal from './CommunitiesModal';
import CommunityPage from './CommunityPage';
import CartModal from './CartModal';
import ShareModal from './ShareModal';
import TipModal from './TipModal';
import WalletModal from './WalletModal';
import GamesPage from './GamesPage';


type Page = 'home' | 'explore' | 'notifications' | 'messages' | 'profile' | 'marketplace' | 'my-store' | 'public-store' | 'achievements' | 'trophies' | 'streaks' | 'community' | 'games';
type FollowListType = { type: 'followers' | 'following', user: Profile };

// --- Real Data Types ---
interface WeatherData {
    temp: number;
    condition: string;
    windSpeed: number;
    humidity: number;
    code: number; // WMO code
}

interface CryptoData {
    [key: string]: {
        usd: number;
        usd_24h_change: number;
    }
}

// --- Mock Data Generators for Widgets (Fallback) ---
const generateStockData = (symbol: string) => {
    const basePrice = Math.random() * 1000 + 10;
    const changePercent = (Math.random() * 5) - 2.5;
    return {
        sym: symbol.toUpperCase(),
        name: symbol.toUpperCase(), // Simplified name mapping
        price: basePrice.toFixed(2),
        change: (changePercent > 0 ? '+' : '') + changePercent.toFixed(2) + '%',
        up: changePercent > 0
    };
};

export const FireSocial: React.FC = () => {
    // --- AUTH CONTEXT ---
    const { user: authUser, logout } = useAuth();

    // --- STATE MANAGEMENT ---
    // Data states
    // Initialize profile with the authenticated user
    const [profile, setProfile] = useState<Profile>(() => {
        const p = authUser!;
        // Ensure messagingSettings exists even for older data
        if (!p.messagingSettings) {
            p.messagingSettings = { allowDirectMessages: 'everyone', readReceipts: true };
        }
        // Initialize store config if missing
        if (!p.storeConfig) {
            p.storeConfig = { banner: '', themeColor: '#f97316', layout: 'grid', welcomeMessage: 'Welcome to my store!' };
        }
        // Initialize creator games array if missing
        if (p.creatorMonetization && !p.creatorMonetization.games) {
            p.creatorMonetization.games = [];
        }
        return p;
    }); 
    const [allUsers, setAllUsers] = useState<Profile[]>(ALL_USERS_DATA);
    const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
    const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
    const [following, setFollowing] = useState<UserListItem[]>(INITIAL_FOLLOWING);
    const [followers, setFollowers] = useState<UserListItem[]>(INITIAL_FOLLOWERS);
    const [chatHistories, setChatHistories] = useState<Record<number, ChatMessage[]>>(INITIAL_CHAT_HISTORY);
    const [marketplaceProducts, setMarketplaceProducts] = useState<Product[]>(INITIAL_MARKETPLACE_PRODUCTS);
    const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
    const [cart, setCart] = useState<Product[]>([]);

    // UI states
    const [activePage, setActivePage] = useState<Page>('home');
    const [themeColor, setThemeColor] = useState<ThemeColor>('orange');
    const [darkMode, setDarkMode] = useState(true);
    const [profileTab, setProfileTab] = useState('posts');
    const [homeSearchQuery, setHomeSearchQuery] = useState('');
    const [toast, setToast] = useState<{ message: string } | null>(null);
    const [activeFeedTab, setActiveFeedTab] = useState('Discover');
    const [feedTabs, setFeedTabs] = useState(['Discover', 'Following']);
    
    // Pull to Refresh State
    const [pullStartY, setPullStartY] = useState(0);
    const [pullMoveY, setPullMoveY] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const pullThreshold = 100;

    // Modal states
    const [viewingProfileUsername, setViewingProfileUsername] = useState<string | null>(null);
    const [viewingCommunity, setViewingCommunity] = useState<Community | null>(null);
    const [showFollowList, setShowFollowList] = useState<FollowListType | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [viewingPost, setViewingPost] = useState<Post | null>(null);
    const [commentModalPost, setCommentModalPost] = useState<Post | null>(null);
    const [messageUser, setMessageUser] = useState<Message | null>(null);
    const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
    const [viewingStory, setViewingStory] = useState<Story | null>(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showCreateStory, setShowCreateStory] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showAICreator, setShowAICreator] = useState(false);
    const [showGameCreator, setShowGameCreator] = useState(false);
    const [viewingGame, setViewingGame] = useState<Game | null>(null);
    const [showAIChatbot, setShowAIChatbot] = useState(false);
    const [showCommunitiesModal, setShowCommunitiesModal] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const [sharePost, setSharePost] = useState<Post | null>(null);
    const [quotingPost, setQuotingPost] = useState<Post | null>(null);
    const [tipModalRecipient, setTipModalRecipient] = useState<Profile | null>(null);
    const [viewingStoreOwner, setViewingStoreOwner] = useState<Profile | null>(null);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [walletInitialTab, setWalletInitialTab] = useState<'overview' | 'buy_embers' | 'deposit_withdraw' | 'transfer' | 'methods' | 'history'>('overview');

    // Widget Layout State
    const [widgetOrder, setWidgetOrder] = useState<string[]>(['weather', 'stocks', 'crypto', 'trending', 'suggestions', 'communities']);
    const [dragEnabledIndex, setDragEnabledIndex] = useState<number | null>(null);
    const dragItem = useRef<number | null>(null);
    const dragNode = useRef<HTMLDivElement | null>(null);

    // Widget Settings & Data State
    const [widgetSettings, setWidgetSettings] = useState({
        weather: { location: 'San Francisco, CA' },
        stocks: { symbols: ['AAPL', 'TSLA', 'NVDA', 'GOOGL'] },
        crypto: { symbols: ['BTC', 'ETH', 'SOL', 'DOGE'] },
        trending: { count: 3, showCount: true },
        suggestions: { count: 3, showMutuals: true },
        communities: { count: 3, showMembers: true }
    });
    const [editingWidget, setEditingWidget] = useState<string | null>(null);
    const [tempWidgetInput, setTempWidgetInput] = useState('');

    // Real Data State
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);
    const [stockData, setStockData] = useState<Record<string, { price: number, change: number }>>({});


    // --- DERIVED STATE & MEMOS ---
    const currentTheme = useMemo(() => THEMES[themeColor], [themeColor]);
    // Increased opacity for light mode to bg-white/80 for better readability against gradients
    const cardBg = useMemo(() => darkMode ? 'bg-gray-800/50' : 'bg-white/80', [darkMode]);
    const textColor = useMemo(() => darkMode ? 'text-white' : 'text-gray-900', [darkMode]);
    const textSecondary = useMemo(() => darkMode ? 'text-gray-400' : 'text-gray-600', [darkMode]);
    const borderColor = useMemo(() => darkMode ? 'border-white/10' : 'border-black/10', [darkMode]);
    const hoverBg = useMemo(() => darkMode ? 'hover:bg-white/5' : 'hover:bg-black/5', [darkMode]);
    
    const allUserListItems: UserListItem[] = useMemo(() => allUsers.map(u => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, followedByYou: following.some(f => f.id === u.id) })), [allUsers, following]);
    
    const allGames = useMemo(() => allUsers.flatMap(u => u.creatorMonetization?.games || []), [allUsers]);

    const blockedUserIds = useMemo(() => new Set(profile.blockedAccounts.map(u => u.id)), [profile.blockedAccounts]);
    
    const filteredPosts = useMemo(() => {
        return posts.filter(p => {
            // 1. Blocked Check
            if (blockedUserIds.has(p.userId)) return false;

            // 2. Search Query Check
            if (homeSearchQuery) {
                const query = homeSearchQuery.toLowerCase();
                const matchesSearch = (
                    p.content.toLowerCase().includes(query) ||
                    p.user.toLowerCase().includes(query) ||
                    p.username.toLowerCase().includes(query) ||
                    (p.category && p.category.toLowerCase().includes(query))
                );
                if (!matchesSearch) return false;
            }

            // 3. Tab Filter Check
            if (activeFeedTab === 'Discover') return true;
            if (activeFeedTab === 'Following') {
                return following.some(f => f.id === p.userId) || p.userId === profile.id;
            }
            // Custom tabs act as topic filters
            const tabLower = activeFeedTab.toLowerCase();
            return (
                p.content.toLowerCase().includes(tabLower) ||
                (p.category && p.category.toLowerCase() === tabLower)
            );
        });
    }, [posts, blockedUserIds, homeSearchQuery, activeFeedTab, following, profile.id]);

    const viewingProfile = useMemo(() => allUsers.find(u => u.username === viewingProfileUsername) || profile, [viewingProfileUsername, allUsers, profile]);
    const isFireFollowed = useMemo(() => following.some(u => u.id === viewingProfile.id && u.isFireFollowed), [following, viewingProfile]);
    
    const unreadNotificationsCount = notifications.filter(n => !n.read).length;

    // --- EFFECTS ---
    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);
    
    // Sync local profile state if auth user changes
    useEffect(() => {
        if (authUser) setProfile(authUser);
    }, [authUser]);

    // Scroll to top whenever the page changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activePage, viewingProfileUsername, viewingCommunity]);

    // --- WEATHER DATA FETCHING ---
    useEffect(() => {
        const fetchWeather = async () => {
            setWeatherLoading(true);
            try {
                // 1. Geocoding to get Lat/Lon
                const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${widgetSettings.weather.location}&count=1&language=en&format=json`);
                const geoData = await geoRes.json();
                
                if (geoData.results && geoData.results.length > 0) {
                    const { latitude, longitude } = geoData.results[0];
                    
                    // 2. Get Weather
                    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&temperature_unit=fahrenheit`);
                    const weatherJson = await weatherRes.json();
                    
                    if (weatherJson.current) {
                        setWeatherData({
                            temp: weatherJson.current.temperature_2m,
                            condition: getWeatherCondition(weatherJson.current.weather_code),
                            windSpeed: weatherJson.current.wind_speed_10m,
                            humidity: weatherJson.current.relative_humidity_2m,
                            code: weatherJson.current.weather_code
                        });
                    }
                }
            } catch (e) {
                console.error("Weather fetch error", e);
            } finally {
                setWeatherLoading(false);
            }
        };

        fetchWeather();
    }, [widgetSettings.weather.location]);

    const getWeatherCondition = (code: number): string => {
        if (code === 0) return 'Clear';
        if (code <= 3) return 'Partly Cloudy';
        if (code <= 48) return 'Foggy';
        if (code <= 67) return 'Rainy';
        if (code <= 77) return 'Snowy';
        if (code <= 82) return 'Heavy Rain';
        if (code <= 99) return 'Thunderstorm';
        return 'Unknown';
    };
    
    const WeatherIcon = ({ code, size=48, className="" }: {code: number, size?: number, className?: string}) => {
         if (code === 0) return <Sun size={size} className={`text-yellow-300 animate-pulse ${className}`} />;
         if (code <= 3) return <CloudSun size={size} className={`text-gray-300 ${className}`} />;
         if (code <= 48) return <Cloud size={size} className={`text-gray-400 ${className}`} />;
         if (code <= 67) return <CloudRain size={size} className={`text-blue-300 ${className}`} />;
         if (code <= 77) return <CloudSnow size={size} className={`text-white ${className}`} />;
         if (code <= 99) return <CloudLightning size={size} className={`text-purple-400 ${className}`} />;
         return <Sun size={size} className={className} />;
    };

    // --- CRYPTO DATA FETCHING (CoinGecko) ---
    useEffect(() => {
        const fetchCrypto = async () => {
            try {
                // Map symbols to CoinGecko IDs
                const idMap: Record<string, string> = {
                    'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'DOGE': 'dogecoin', 'ADA': 'cardano', 'DOT': 'polkadot'
                };
                
                const ids = widgetSettings.crypto.symbols.map(s => idMap[s]).filter(Boolean).join(',');
                if (!ids) return;

                const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
                const data = await res.json();
                setCryptoData(data);
            } catch (e) {
                console.error("Crypto fetch error", e);
            }
        };
        
        fetchCrypto();
        const interval = setInterval(fetchCrypto, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [widgetSettings.crypto.symbols]);

    // --- STOCK DATA SIMULATION (Real-time Simulation) ---
    useEffect(() => {
        // Initialize mock prices
        const initialData: Record<string, { price: number, change: number }> = {};
        widgetSettings.stocks.symbols.forEach(sym => {
            if (!stockData[sym]) {
                 initialData[sym] = { price: Math.random() * 200 + 50, change: (Math.random() * 4) - 2 };
            }
        });
        if (Object.keys(initialData).length > 0) {
             setStockData(prev => ({ ...prev, ...initialData }));
        }

        const interval = setInterval(() => {
            setStockData(prev => {
                const next = { ...prev };
                widgetSettings.stocks.symbols.forEach(sym => {
                    const current = next[sym] || { price: 100, change: 0 };
                    // Random walk
                    const change = (Math.random() - 0.5) * 0.5; // small fluctuation
                    const newPrice = Math.max(0.01, current.price + change);
                    // Accumulate daily change simulation (simplified)
                    const newDailyChange = current.change + (change / newPrice) * 100;
                    
                    next[sym] = { price: newPrice, change: newDailyChange };
                });
                return next;
            });
        }, 3000); // 3-second ticks

        return () => clearInterval(interval);
    }, [widgetSettings.stocks.symbols]);


    // --- HANDLERS ---
    
    const showToast = (message: string) => {
        setToast({ message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAddTab = () => {
        const newTab = window.prompt("Enter a topic or hashtag for the new tab:");
        if (newTab && !feedTabs.includes(newTab)) {
            setFeedTabs([...feedTabs, newTab]);
            setActiveFeedTab(newTab);
        }
    };

    // Pull to Refresh Handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            setPullStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (pullStartY > 0 && window.scrollY === 0) {
            const touchY = e.touches[0].clientY;
            const diff = touchY - pullStartY;
            if (diff > 0) {
                // Add resistance
                setPullMoveY(Math.min(diff * 0.5, 150)); 
            }
        }
    };

    const handleTouchEnd = async () => {
        if (pullMoveY > 80 && !isRefreshing) {
            setIsRefreshing(true);
            setPullMoveY(80); // Snap to loading position
            await refreshFeed();
        } else {
            setPullMoveY(0);
        }
        setPullStartY(0);
    };

    const refreshFeed = async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Select a random user (not the current profile)
        const availableUsers = allUsers.filter(u => u.id !== profile.id);
        const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
        
        const randomContent = [
             "Just spotted this amazing view! 🌅",
             "Who else is working on something cool this weekend?",
             "AI is changing the game rapidly. Thoughts? 🤖",
             "Coffee time! ☕ What's your go-to order?",
             "Just pushed a new update. Check it out! 🚀",
             "Can't believe how fast this week went by! 😅",
             "Exploring some new tech stacks today. #coding #devlife",
             "The community here is absolutely on fire! 🔥"
        ];
        const randomText = randomContent[Math.floor(Math.random() * randomContent.length)];

        const newPost: Post = {
            id: Date.now(),
            userId: randomUser.id,
            user: randomUser.name,
            username: randomUser.username,
            avatar: randomUser.avatar,
            content: randomText,
            likes: 0,
            comments: 0,
            shares: 0,
            time: 'Just now',
            reactions: {},
            userReaction: null,
            bookmarked: false,
            views: 0,
            category: 'Lifestyle'
        };

        setPosts(prev => [newPost, ...prev]);
        
        setIsRefreshing(false);
        setPullMoveY(0);
    };
    
    // Drag and Drop Handlers for Widgets
    const handleDragStart = (e: React.DragEvent, index: number) => {
        dragItem.current = index;
        dragNode.current = e.currentTarget as HTMLDivElement;
        e.dataTransfer.effectAllowed = 'move';
        // Add opacity to the dragged element
        setTimeout(() => {
            if (dragNode.current) dragNode.current.classList.add('opacity-50');
        }, 0);
    };

    const handleDragEnter = (e: React.DragEvent, index: number) => {
        e.preventDefault(); // Necessary to allow dropping
        if (dragItem.current === null || dragItem.current === index) return;
        
        const newOrder = [...widgetOrder];
        const draggedItemContent = newOrder[dragItem.current];
        
        // Remove from old position
        newOrder.splice(dragItem.current, 1);
        // Insert at new position
        newOrder.splice(index, 0, draggedItemContent);
        
        dragItem.current = index;
        setWidgetOrder(newOrder);
    };
    
    const handleDragEnd = () => {
        dragItem.current = null;
        if (dragNode.current) dragNode.current.classList.remove('opacity-50');
        dragNode.current = null;
        setDragEnabledIndex(null);
    };

    // Widget Settings Handlers
    const updateWidgetSetting = (widget: string, key: string, value: any) => {
         setWidgetSettings(prev => ({
             ...prev,
             [widget]: { ...prev[widget as keyof typeof prev], [key]: value }
         }));
    };

    const handleWidgetSettingSave = (widgetId: string) => {
        if (widgetId === 'weather') {
            setWidgetSettings(prev => ({ ...prev, weather: { location: tempWidgetInput || prev.weather.location } }));
        } else if (widgetId === 'stocks') {
             if (tempWidgetInput && !widgetSettings.stocks.symbols.includes(tempWidgetInput.toUpperCase())) {
                setWidgetSettings(prev => ({ ...prev, stocks: { symbols: [...prev.stocks.symbols, tempWidgetInput.toUpperCase()] } }));
             }
        } else if (widgetId === 'crypto') {
             if (tempWidgetInput && !widgetSettings.crypto.symbols.includes(tempWidgetInput.toUpperCase())) {
                setWidgetSettings(prev => ({ ...prev, crypto: { symbols: [...prev.crypto.symbols, tempWidgetInput.toUpperCase()] } }));
             }
        }
        setTempWidgetInput('');
        if (widgetId === 'weather') setEditingWidget(null); // Close weather immediately on save
    };

    const removeWidgetSymbol = (widgetId: 'stocks' | 'crypto', symbol: string) => {
        setWidgetSettings(prev => ({
            ...prev,
            [widgetId]: { symbols: prev[widgetId].symbols.filter(s => s !== symbol) }
        }));
    };


    const handleCreatePost = (content: string, media: MediaItem[], type: 'post' | 'poll', pollOptions?: string[], scheduledTime?: string) => {
        if (scheduledTime) {
            const newScheduledPost: ScheduledPost = {
                scheduledId: Date.now(),
                scheduledTime: scheduledTime,
                postData: {
                    userId: profile.id,
                    user: profile.name,
                    username: profile.username,
                    avatar: profile.avatar,
                    content: content,
                    media: media.length > 0 ? media : undefined,
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    reactions: {},
                    userReaction: null,
                    bookmarked: false,
                    views: 0,
                    commentsData: [],
                    type: type,
                    pollOptions: pollOptions ? pollOptions.map((opt, i) => ({ id: i, text: opt, votes: 0 })) : undefined,
                    totalVotes: 0,
                    userVoted: null,
                    quotedPost: quotingPost || undefined
                }
            };
            setScheduledPosts(prev => [newScheduledPost, ...prev]);
            // Switch to profile scheduled tab to show the user
            setViewingProfileUsername(profile.username);
            setActivePage('profile');
            setProfileTab('scheduled');
            showToast("Post scheduled!");
        } else {
            const newPost: Post = {
                id: Date.now(),
                userId: profile.id,
                user: profile.name,
                username: profile.username,
                avatar: profile.avatar,
                content: content,
                media: media.length > 0 ? media : undefined,
                likes: 0,
                comments: 0,
                shares: 0,
                time: 'Just now',
                reactions: {},
                userReaction: null,
                bookmarked: false,
                views: 0,
                commentsData: [],
                type: type,
                pollOptions: pollOptions ? pollOptions.map((opt, i) => ({ id: i, text: opt, votes: 0 })) : undefined,
                totalVotes: 0,
                userVoted: null,
                quotedPost: quotingPost || undefined
            };
            setPosts([newPost, ...posts]);
            setProfile(p => ({ ...p, posts: p.posts + 1 }));
            showToast("Post published!");
        }
        setQuotingPost(null);
    };
    
    const handleDeleteScheduledPost = (scheduledId: number) => {
        setScheduledPosts(prev => prev.filter(p => p.scheduledId !== scheduledId));
    };

    const handleReaction = (postId: number, reactionType: string) => {
        setPosts(posts.map(p => {
            if (p.id === postId) {
                const isReacting = p.userReaction === reactionType;
                return {
                    ...p,
                    likes: isReacting ? p.likes - 1 : (p.userReaction ? p.likes : p.likes + 1),
                    userReaction: isReacting ? null : reactionType,
                };
            }
            return p;
        }));
    };

    const handleBookmark = (postId: number) => {
        setPosts(posts.map(p => p.id === postId ? { ...p, bookmarked: !p.bookmarked } : p));
    };

    const handlePinPost = (postId: number) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, isPinned: !p.isPinned } : p));
        showToast(posts.find(p => p.id === postId)?.isPinned ? "Post unpinned" : "Post pinned to profile");
    };

    const handleFeaturePost = (postId: number) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, isFeatured: !p.isFeatured } : p));
        showToast(posts.find(p => p.id === postId)?.isFeatured ? "Removed from featured" : "Added to featured");
    };

    const handleDeletePost = (postId: number) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            setPosts(posts.filter(p => p.id !== postId));
            if (viewingPost?.id === postId) setViewingPost(null);
        }
    };
    
    const handleReshare = () => {
        if (sharePost) {
            setPosts(prev => prev.map(p => p.id === sharePost.id ? { ...p, shares: p.shares + 1 } : p));
            showToast("Shared successfully!");
            // In a real app, we might create a new post that references this one.
        }
    };

    // New handler for instant repost from the dropdown
    const handleInstantRepost = (postId: number) => {
         setPosts(prev => prev.map(p => p.id === postId ? { ...p, shares: p.shares + 1 } : p));
         showToast("Reposted to your feed!");
    };
    
    // New handler for quote post from the dropdown
    const handleQuotePost = (post: Post) => {
        setQuotingPost(post);
        setShowCreatePost(true);
    };

    const handleAddComment = (postId: number, commentText: string, replyToUsername?: string, attachment?: CommentAttachment) => {
        setPosts(posts.map(p => {
            if (p.id === postId) {
                const newComment: Comment = {
                    id: Date.now(),
                    userId: profile.id,
                    username: profile.username,
                    avatar: profile.avatar,
                    text: commentText,
                    time: 'Just now',
                    likes: 0,
                    isLiked: false,
                    replyTo: replyToUsername,
                    attachment: attachment
                };
                return {
                    ...p,
                    comments: p.comments + 1,
                    commentsData: [...(p.commentsData || []), newComment]
                };
            }
            return p;
        }));
    };

    const handleSaveProfile = (updatedProfile: Profile) => {
        setProfile(updatedProfile);
        setAllUsers(allUsers.map(u => u.id === updatedProfile.id ? updatedProfile : u));
        setShowEditProfile(false);
    };

    const handleFollowToggle = (userId: number, username: string) => {
        const isFollowing = following.some(u => u.id === userId);
        if (isFollowing) {
            setFollowing(following.filter(u => u.id !== userId));
        } else {
            const userToFollow = allUsers.find(u => u.id === userId);
            if (userToFollow) {
                setFollowing([...following, { id: userId, name: userToFollow.name, username: userToFollow.username, avatar: userToFollow.avatar, followedByYou: true, isFireFollowed: false }]);
            }
        }
    };

    const handleFireFollowToggle = (userId: number) => {
        setFollowing(prev => prev.map(u => 
            u.id === userId ? { ...u, isFireFollowed: !u.isFireFollowed } : u
        ));
    };
    
    const handleBlockToggle = (userId: number, username: string) => {
        const isBlocked = profile.blockedAccounts.some(u => u.id === userId);
        const userToToggle = allUserListItems.find(u => u.id === userId);
        if(!userToToggle) return;

        let updatedBlocked = [...profile.blockedAccounts];
        if(isBlocked) {
            updatedBlocked = updatedBlocked.filter(u => u.id !== userId);
            alert(`Unblocked ${username}`);
        } else {
            updatedBlocked.push(userToToggle);
             alert(`Blocked ${username}`);
        }
        setProfile(p => ({ ...p, blockedAccounts: updatedBlocked }));
    };

    const handleSendMessage = (userId: number, text: string, type: ChatMessage['type'], options?: Partial<ChatMessage>) => {
        const newMessage: ChatMessage = {
            id: Date.now(),
            sentBy: profile.id,
            text,
            type,
            time: 'Just now',
            status: 'sent',
            ...options
        };
        setChatHistories(prev => ({
            ...prev,
            [userId]: [...(prev[userId] || []), newMessage]
        }));
    };
    
    const handleMessageFromProfile = (user: Profile) => {
        const msgUser: Message = {
            id: Date.now(),
            userId: user.id,
            user: user.name,
            username: user.username,
            avatar: user.avatar,
            lastMessage: '',
            time: 'Now',
            unread: false,
            online: user.online,
            lastMessageType: 'text',
            lastMessageSentByYou: false
        };
        setMessageUser(msgUser);
    };
    
    const handleAddNewProduct = (productData: Omit<Product, 'id' | 'creatorId' | 'creatorUsername' | 'creatorAvatar' | 'sales' | 'rating'>) => {
        const newProduct: Product = {
            ...productData,
            id: `prod_${Date.now()}`,
            creatorId: profile.id,
            creatorUsername: profile.username,
            creatorAvatar: profile.avatar,
            sales: 0,
            rating: 0,
        };
        
        // Add to global marketplace list
        setMarketplaceProducts(prev => [newProduct, ...prev]);

        // Add to creator's personal product list
        if (profile.creatorMonetization) {
            const updatedMonetization = {
                ...profile.creatorMonetization,
                products: [newProduct, ...profile.creatorMonetization.products],
            };
            setProfile(p => ({ ...p, creatorMonetization: updatedMonetization }));
        }

        setShowAddProductModal(false);
    };

    const handleDeleteProduct = (productId: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            setMarketplaceProducts(prev => prev.filter(p => p.id !== productId));
            if(profile.creatorMonetization) {
                 const updatedMonetization = {
                    ...profile.creatorMonetization,
                    products: profile.creatorMonetization.products.filter(p => p.id !== productId),
                };
                setProfile(p => ({ ...p, creatorMonetization: updatedMonetization }));
            }
        }
    }
    
    const handleDeployGame = (gameIdea: string, previewImage: string, code: string) => {
        if (!profile.creatorMonetization) return;
        
        const newGame: Game = {
            id: `game_${Date.now()}`,
            title: gameIdea.substring(0, 30) + (gameIdea.length > 30 ? '...' : ''),
            description: gameIdea,
            previewImage,
            code,
            playCount: 0,
            earnings: 0,
            creatorId: profile.id,
            creatorUsername: profile.username
        };

        const updatedMonetization = {
            ...profile.creatorMonetization,
            games: [newGame, ...(profile.creatorMonetization.games || [])]
        };
        
        setProfile(p => ({ ...p, creatorMonetization: updatedMonetization }));
        setShowGameCreator(false);
        
        // Also update global allUsers if the current user is in it, to reflect changes when viewed by others
        setAllUsers(prevUsers => prevUsers.map(u => u.id === profile.id ? { ...u, creatorMonetization: updatedMonetization } : u));
        
        showToast("Game deployed successfully to your profile!");
        setViewingProfileUsername(profile.username);
        setActivePage('profile');
        setProfileTab('games');
    };
    
    const handlePlayGame = (game: Game) => {
        setViewingGame(game);
        
        // Simulate play count increase and earnings for the creator
        const EARNINGS_PER_PLAY = 5; // 5 embers per play
        
        // Update the game stats locally within the viewing session first
        const updatedGame = { ...game, playCount: game.playCount + 1, earnings: game.earnings + EARNINGS_PER_PLAY };
        setViewingGame(updatedGame); // Update the modal immediately if possible, or rely on it updating on close/re-render
        
        // Update the actual creator's profile (whether it's self or another user)
        setAllUsers(prevUsers => prevUsers.map(user => {
            if (user.id === game.creatorId) {
                const existingGames = user.creatorMonetization?.games || [];
                const updatedGames = existingGames.map(g => g.id === game.id ? { ...g, playCount: g.playCount + 1, earnings: g.earnings + EARNINGS_PER_PLAY } : g);
                
                // Add transaction to wallet
                const newTransaction: WalletTransaction = {
                    id: `tx_game_${Date.now()}`,
                    type: 'game_revenue',
                    amount: EARNINGS_PER_PLAY / 10, // Convert embers to currency value if needed, or keep separate
                    date: new Date().toLocaleDateString(),
                    status: 'completed',
                    description: `Revenue from game: ${game.title}`
                };
                
                const currentWallet = user.creatorMonetization?.wallet;
                const updatedWallet = currentWallet ? {
                    ...currentWallet,
                    transactions: [newTransaction, ...(currentWallet.transactions || [])]
                } : undefined;

                return {
                    ...user,
                    creatorMonetization: {
                        ...user.creatorMonetization!,
                        games: updatedGames,
                        wallet: updatedWallet
                    }
                };
            }
            return user;
        }));

        // If it's the current user, update their profile state too
        if (game.creatorId === profile.id) {
             setProfile(prev => {
                const existingGames = prev.creatorMonetization?.games || [];
                 const updatedGames = existingGames.map(g => g.id === game.id ? { ...g, playCount: g.playCount + 1, earnings: g.earnings + EARNINGS_PER_PLAY } : g);
                 return {
                     ...prev,
                     creatorMonetization: {
                         ...prev.creatorMonetization!,
                         games: updatedGames
                     }
                 };
             });
        }
        
        // Notify creator (mock)
        if (game.creatorId !== profile.id) {
             // This would push a notification in a real backend
             console.log(`Notification: Someone played ${game.title} by ${game.creatorUsername}`);
        }
    };

    const handleAddToCart = (product: Product) => {
        setCart(prev => [...prev, product]);
        showToast("Added to cart!");
    };

    const handleRemoveFromCart = (productId: string) => {
        setCart(prev => {
            const index = prev.findIndex(item => item.id === productId);
            if (index !== -1) {
                const newCart = [...prev];
                newCart.splice(index, 1);
                return newCart;
            }
            return prev;
        });
    };
    
    const handleBoostPost = (postId: number) => {
        const cost = 50;
        if (profile.emberBalance >= cost) {
             setProfile(prev => ({ ...prev, emberBalance: prev.emberBalance - cost }));
             setPosts(posts.map(p => p.id === postId ? { ...p, isBoosted: true } : p));
             showToast(`Post boosted! Deducted ${cost} Embers.`);
        } else {
            alert("Not enough Embers to boost post!");
        }
    };

    const handleTipCreator = (amount: number) => {
        if (profile.emberBalance >= amount) {
            const newBalance = profile.emberBalance - amount;
            
            // Create sender transaction
            const sentTx: WalletTransaction = {
                id: `tx_${Date.now()}_sent`,
                type: 'tip_sent',
                amount: amount,
                date: new Date().toLocaleDateString(),
                status: 'completed',
                description: `Tip sent to ${viewingProfile.name}`
            };
            
            const updatedSenderMonetization = profile.creatorMonetization ? {
                ...profile.creatorMonetization,
                wallet: {
                    ...profile.creatorMonetization.wallet!,
                    transactions: [sentTx, ...(profile.creatorMonetization.wallet?.transactions || [])]
                }
            } : profile.creatorMonetization;

            setProfile(prev => ({ 
                ...prev, 
                emberBalance: newBalance,
                creatorMonetization: updatedSenderMonetization
            }));

            // Update Recipient (in global state)
            setAllUsers(prevUsers => prevUsers.map(u => {
                if (u.id === viewingProfile.id) {
                    const receivedTx: WalletTransaction = {
                        id: `tx_${Date.now()}_recv`,
                        type: 'tip_received',
                        amount: amount / 10, // Convert Ember to USD equivalent for creator earnings
                        date: new Date().toLocaleDateString(),
                        status: 'completed',
                        description: `Tip from ${profile.username}`
                    };
                    return {
                        ...u,
                        creatorMonetization: {
                            ...u.creatorMonetization!,
                            balance: (u.creatorMonetization?.balance || 0) + (amount / 10),
                            wallet: {
                                ...u.creatorMonetization?.wallet!,
                                transactions: [receivedTx, ...(u.creatorMonetization?.wallet?.transactions || [])]
                            }
                        }
                    };
                }
                return u;
            }));
            
            // Add notification for the user if self-tipping (testing) or simulate push
            const newNotification: Notification = {
                id: Date.now(),
                type: 'tip',
                user: profile.name,
                username: profile.username,
                content: `tipped you ${amount} Embers! 🔥`,
                time: 'Just now',
                read: false
            };

            if(viewingProfile.id === profile.id) {
                setNotifications(prev => [newNotification, ...prev]);
            }

             showToast(`Tipped ${amount} Embers!`);
        } else {
            alert("Not enough Embers!");
        }
    };

    const handlePostTip = (authorId: number) => {
        if (authorId === profile.id) {
            showToast("You can't tip yourself!");
            return;
        }
        
        const author = allUsers.find(u => u.id === authorId);
        if (author) {
            setTipModalRecipient(author);
        }
    };

    const handleConfirmTip = (amount: number) => {
        if (!tipModalRecipient) return;

        if (profile.emberBalance >= amount) {
            // Deduct from sender
            const sentTx: WalletTransaction = {
                id: `tx_${Date.now()}_sent`,
                type: 'tip_sent',
                amount: amount,
                date: new Date().toLocaleDateString(),
                status: 'completed',
                description: `Tip sent to ${tipModalRecipient.name}`
            };

            setProfile(prev => {
                const updatedMonetization = prev.creatorMonetization ? {
                    ...prev.creatorMonetization,
                    wallet: {
                        paymentMethods: prev.creatorMonetization.wallet?.paymentMethods || [],
                        transactions: [sentTx, ...(prev.creatorMonetization.wallet?.transactions || [])]
                    }
                } : prev.creatorMonetization;
                
                return { 
                    ...prev, 
                    emberBalance: prev.emberBalance - amount,
                    creatorMonetization: updatedMonetization
                };
            });
            
            // Add to recipient logic (simplified - updates local view of 'allUsers')
             setAllUsers(prevUsers => prevUsers.map(u => {
                if (u.id === tipModalRecipient.id) {
                    const receivedTx: WalletTransaction = {
                        id: `tx_${Date.now()}_recv`,
                        type: 'tip_received',
                        amount: amount / 10, 
                        date: new Date().toLocaleDateString(),
                        status: 'completed',
                        description: `Tip from ${profile.username}`
                    };
                    return {
                        ...u,
                        creatorMonetization: {
                            ...u.creatorMonetization!,
                            balance: (u.creatorMonetization?.balance || 0) + (amount / 10),
                             wallet: {
                                paymentMethods: u.creatorMonetization?.wallet?.paymentMethods || [],
                                transactions: [receivedTx, ...(u.creatorMonetization?.wallet?.transactions || [])]
                            }
                        }
                    };
                }
                return u;
            }));
            
            // Create notification for the sender (receipt)
            const newNotification: Notification = {
                id: Date.now(),
                type: 'tip',
                user: tipModalRecipient.name,
                username: tipModalRecipient.username,
                content: `received a tip of ${amount} Embers from you.`, // Clearer message
                time: 'Just now',
                read: false
            };
            setNotifications(prev => [newNotification, ...prev]);
            
            showToast(`Tipped ${amount} Embers to ${tipModalRecipient.name}! 💸`);
            setTipModalRecipient(null);
        } else {
            alert(`Not enough Embers. Balance: ${profile.emberBalance}`);
        }
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        
        // Calculate total in Ember (Rate: $1 = 10 Embers)
        const totalUSD = cart.reduce((sum, item) => sum + item.price, 0);
        const totalEmbers = totalUSD * 10;

        if (profile.emberBalance >= totalEmbers) {
             setProfile(prev => ({ ...prev, emberBalance: prev.emberBalance - totalEmbers }));
             alert(`Payment successful! Deducted ${totalEmbers.toFixed(0)} Embers.`);
             setCart([]);
             setShowCartModal(false);
        } else {
             alert(`Insufficient Ember balance. You need ${totalEmbers.toFixed(0)} Embers.`);
        }
    };
    
    const toggleJoinCommunity = (communityId: number) => {
        setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, joined: !c.joined } : c));
    };
    
    const handleViewCommunity = (community: Community) => {
        setViewingCommunity(community);
        setActivePage('community');
        setShowCommunitiesModal(false);
        window.scrollTo(0, 0);
    };

    const handleViewProfile = (username: string) => {
        // Close any open modals to ensure we see the profile page
        setCommentModalPost(null);
        setViewingPost(null);
        setViewingNotification(null);
        setViewingProduct(null);
        
        setViewingProfileUsername(username);
        setActivePage('profile');
        setProfileTab('posts');
        window.scrollTo(0, 0);
    };

    const handleHomePageSelect = () => {
        setActivePage('home');
        setViewingProfileUsername(null);
    };
    
    const handleVisitStore = () => {
        setViewingStoreOwner(viewingProfile);
        setActivePage('public-store');
        window.scrollTo(0, 0);
    };
    
    const renderStoriesBar = () => {
        const userStory = INITIAL_STORIES.find(s => s.isYours);
        const otherStories = INITIAL_STORIES.filter(s => !s.isYours);

        return (
            <div className="flex gap-4 overflow-x-auto pb-4 mb-2 no-scrollbar">
                {/* User Story / Create Story */}
                <button 
                    onClick={() => userStory && userStory.media.length > 0 ? setViewingStory(userStory) : setShowCreateStory(true)}
                    className="flex flex-col items-center gap-2 flex-shrink-0"
                >
                    <div className={`relative p-1 rounded-full ${userStory && userStory.media.length > 0 ? `bg-gradient-to-tr ${currentTheme.from} ${currentTheme.to}` : `border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}`}>
                        <div className={`p-0.5 ${cardBg} rounded-full`}>
                             <AvatarDisplay avatar={profile.avatar} size="w-14 h-14" />
                        </div>
                        {(!userStory || userStory.media.length === 0) && (
                            <div className={`absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 border-2 ${darkMode ? 'border-gray-900' : 'border-white'}`}>
                                <Plus size={14} />
                            </div>
                        )}
                    </div>
                    <span className={`text-xs font-medium ${textColor} w-20 truncate text-center`}>Your Story</span>
                </button>

                {/* Other Stories */}
                {otherStories.map(story => (
                    <button 
                        key={story.id}
                        onClick={() => setViewingStory(story)}
                        className="flex flex-col items-center gap-2 flex-shrink-0"
                    >
                         <div className={`p-1 rounded-full ${story.viewed ? 'bg-gray-600' : 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600'}`}>
                            <div className={`p-0.5 ${cardBg} rounded-full`}>
                                 <AvatarDisplay avatar={story.avatar} size="w-14 h-14" />
                            </div>
                        </div>
                        <span className={`text-xs font-medium ${textColor} w-16 truncate text-center`}>{story.user}</span>
                    </button>
                ))}
            </div>
        );
    };
    
    // --- Sidebar Widget Rendering ---
    const renderWidget = (widgetId: string, index: number) => {
        const Grip = (
            <div className="flex items-center gap-1">
                {/* Settings Button */}
                <button
                    onClick={() => { 
                        setEditingWidget(editingWidget === widgetId ? null : widgetId); 
                        setTempWidgetInput(''); 
                    }}
                    className={`p-2 rounded-lg hover:bg-white/10 ${textSecondary} transition-colors`}
                    title="Settings"
                >
                    <Settings size={16} />
                </button>
                {/* Drag Handle */}
                <div 
                    className={`p-2 rounded-lg hover:bg-white/10 cursor-grab active:cursor-grabbing ${textSecondary} transition-colors`}
                    onMouseEnter={() => setDragEnabledIndex(index)}
                    onMouseLeave={() => setDragEnabledIndex(null)}
                    title="Drag to reorder"
                >
                    <GripVertical size={20} />
                </div>
            </div>
        );

        switch(widgetId) {
            case 'weather':
                return (
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} text-white relative overflow-hidden mb-4`}>
                        {/* Background gradient based on time/weather */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-80 dark:opacity-40"></div>
                        <div className="relative z-10">
                            {editingWidget === 'weather' ? (
                                <div className="mb-2">
                                    <h3 className="font-bold text-lg mb-2">Weather Settings</h3>
                                    <input 
                                        type="text" 
                                        placeholder="Enter Location" 
                                        defaultValue={widgetSettings.weather.location}
                                        onChange={(e) => setTempWidgetInput(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 mb-2 focus:outline-none`}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setEditingWidget(null)} className="px-3 py-1 text-sm rounded-lg hover:bg-white/10">Cancel</button>
                                        <button onClick={() => handleWidgetSettingSave('weather')} className="px-3 py-1 text-sm bg-white text-blue-600 rounded-lg font-bold">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg flex items-center gap-2"><MapPin size={16}/> {widgetSettings.weather.location.split(',')[0]}</h3>
                                            <p className="text-xs opacity-80">{widgetSettings.weather.location}</p>
                                        </div>
                                        {Grip}
                                    </div>
                                    {weatherLoading ? (
                                        <div className="flex justify-center items-center h-24"><Loader2 className="animate-spin" size={32}/></div>
                                    ) : weatherData ? (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-4xl font-bold">{weatherData.temp.toFixed(1)}°</span>
                                                    <span className="text-sm font-medium">{weatherData.condition}</span>
                                                </div>
                                                <WeatherIcon code={weatherData.code} />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20">
                                                <div className="text-center">
                                                    <Wind size={16} className="mx-auto mb-1 opacity-80"/>
                                                    <span className="text-xs">{weatherData.windSpeed} km/h</span>
                                                </div>
                                                <div className="text-center">
                                                    <Droplets size={16} className="mx-auto mb-1 opacity-80"/>
                                                    <span className="text-xs">{weatherData.humidity}%</span>
                                                </div>
                                                <div className="text-center">
                                                    <CloudRain size={16} className="mx-auto mb-1 opacity-80"/>
                                                    <span className="text-xs">--</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-sm text-center opacity-80">Data unavailable.</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                );
            case 'stocks':
                return (
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} mb-4`}>
                        {editingWidget === 'stocks' ? (
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold">Stock Settings</h3>
                                    <button onClick={() => setEditingWidget(null)} className="p-1 hover:bg-white/10 rounded-full"><X size={16}/></button>
                                </div>
                                <div className="flex gap-2 mb-3">
                                    <input 
                                        type="text" 
                                        placeholder="Symbol (e.g. GOOG)" 
                                        value={tempWidgetInput} 
                                        onChange={(e) => setTempWidgetInput(e.target.value)}
                                        className={`flex-1 px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border ${borderColor} focus:outline-none text-sm`}
                                        onKeyDown={(e) => e.key === 'Enter' && handleWidgetSettingSave('stocks')}
                                    />
                                    <button onClick={() => handleWidgetSettingSave('stocks')} className={`p-2 rounded-lg bg-green-500 text-white`}><Plus size={16}/></button>
                                </div>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {widgetSettings.stocks.symbols.map(sym => (
                                        <div key={sym} className="flex justify-between items-center p-2 bg-black/5 dark:bg-white/5 rounded-lg text-sm">
                                            <span>{sym}</span>
                                            <button onClick={() => removeWidgetSymbol('stocks', sym)} className="text-red-500 hover:bg-red-500/10 p-1 rounded"><Trash2 size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold flex items-center gap-2"><Activity size={18} /> Market Simulator</h3>
                                    {Grip}
                                </div>
                                <div className="space-y-3">
                                    {widgetSettings.stocks.symbols.map(sym => {
                                        const data = stockData[sym] || { price: 0, change: 0 };
                                        const isUp = data.change >= 0;
                                        return (
                                            <div key={sym} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${isUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} transition-colors duration-300`}>
                                                        {sym}
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-sm ${textColor}`}>{sym}</p>
                                                        <p className={`text-xs ${textSecondary} font-mono`}>{data.price > 0 ? data.price.toFixed(2) : 'Loading...'}</p>
                                                    </div>
                                                </div>
                                                <div className={`text-right ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                                                    <p className="font-bold text-sm">{isUp ? '+' : ''}{data.change.toFixed(2)}%</p>
                                                    <p className="text-xs flex items-center justify-end gap-0.5">
                                                        {isUp ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {widgetSettings.stocks.symbols.length === 0 && <p className={`text-center text-sm ${textSecondary}`}>No stocks added.</p>}
                                </div>
                            </>
                        )}
                    </div>
                );
            case 'crypto':
                return (
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} mb-4`}>
                        {editingWidget === 'crypto' ? (
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold">Crypto Settings</h3>
                                    <button onClick={() => setEditingWidget(null)} className="p-1 hover:bg-white/10 rounded-full"><X size={16}/></button>
                                </div>
                                <div className="flex gap-2 mb-3">
                                    <input 
                                        type="text" 
                                        placeholder="Symbol (e.g. DOGE)" 
                                        value={tempWidgetInput} 
                                        onChange={(e) => setTempWidgetInput(e.target.value)}
                                        className={`flex-1 px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border ${borderColor} focus:outline-none text-sm`}
                                        onKeyDown={(e) => e.key === 'Enter' && handleWidgetSettingSave('crypto')}
                                    />
                                    <button onClick={() => handleWidgetSettingSave('crypto')} className={`p-2 rounded-lg bg-blue-500 text-white`}><Plus size={16}/></button>
                                </div>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {widgetSettings.crypto.symbols.map(sym => (
                                        <div key={sym} className="flex justify-between items-center p-2 bg-black/5 dark:bg-white/5 rounded-lg text-sm">
                                            <span>{sym}</span>
                                            <button onClick={() => removeWidgetSymbol('crypto', sym)} className="text-red-500 hover:bg-red-500/10 p-1 rounded"><Trash2 size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold flex items-center gap-2"><Bitcoin size={18} /> Crypto</h3>
                                    {Grip}
                                </div>
                                <div className="space-y-3">
                                    {widgetSettings.crypto.symbols.map(sym => {
                                        // Map common symbols to IDs for data lookup
                                        const idMap: Record<string, string> = {
                                            'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'DOGE': 'dogecoin', 'ADA': 'cardano', 'DOT': 'polkadot'
                                        };
                                        const coinId = idMap[sym];
                                        const coinData = coinId && cryptoData ? cryptoData[coinId] : null;
                                        const isUp = coinData ? coinData.usd_24h_change >= 0 : true;

                                        return (
                                            <div key={sym} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-gradient-to-br ${['BTC','ETH','SOL'].includes(sym) ? 'from-blue-400 to-purple-500' : 'from-gray-500 to-gray-700'} text-white`}>
                                                        {sym[0]}
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-sm ${textColor}`}>{sym}</p>
                                                        <p className={`text-xs ${textSecondary}`}>{coinData ? `$${coinData.usd.toLocaleString()}` : 'Loading...'}</p>
                                                    </div>
                                                </div>
                                                <div className={`text-right ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                                                     <p className="font-bold text-sm">{coinData ? `${coinData.usd_24h_change.toFixed(2)}%` : '...'}</p>
                                                    <p className="text-xs flex items-center justify-end gap-0.5">
                                                        {isUp ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {widgetSettings.crypto.symbols.length === 0 && <p className={`text-center text-sm ${textSecondary}`}>No crypto added.</p>}
                                </div>
                            </>
                        )}
                    </div>
                );
            case 'trending':
                return (
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} mb-4`}>
                         {editingWidget === 'trending' ? (
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold">Trending Settings</h3>
                                    <button onClick={() => setEditingWidget(null)} className="p-1 hover:bg-white/10 rounded-full"><X size={16}/></button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Items to Show</label>
                                        <input 
                                            type="range" 
                                            min="1" max="10" 
                                            value={widgetSettings.trending.count} 
                                            onChange={(e) => updateWidgetSetting('trending', 'count', parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="text-right text-xs mt-1">{widgetSettings.trending.count}</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Show View Count</span>
                                        <button 
                                            onClick={() => updateWidgetSetting('trending', 'showCount', !widgetSettings.trending.showCount)}
                                            className={`w-10 h-5 rounded-full transition-all ${widgetSettings.trending.showCount ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}` : 'bg-gray-600'}`}
                                        >
                                            <div className={`w-3 h-3 bg-white rounded-full transition-transform m-1 ${widgetSettings.trending.showCount ? 'translate-x-5' : ''}`} />
                                        </button>
                                    </div>
                                    <button onClick={() => setEditingWidget(null)} className={`w-full py-2 rounded-lg bg-white/10 text-sm font-bold`}>Done</button>
                                </div>
                            </div>
                         ) : (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold">Trending Topics</h3>
                                    {Grip}
                                </div>
                                <div className="space-y-4">
                                    {INITIAL_TRENDING_HASHTAGS.slice(0, widgetSettings.trending.count).map(hashtag => (
                                        <button key={hashtag.tag} onClick={() => alert(`Viewing ${hashtag.tag}`)} className="w-full flex items-center justify-between group">
                                            <div className="text-left">
                                                <p className={`font-semibold text-sm ${textColor} group-hover:${currentTheme.text} transition-colors`}>{hashtag.tag}</p>
                                                {widgetSettings.trending.showCount && <p className={`text-xs ${textSecondary}`}>{hashtag.posts.toLocaleString()} posts</p>}
                                            </div>
                                            <div className={`p-2 rounded-full bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white transition-colors`}>
                                                <TrendingUp size={16} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                );
            case 'suggestions':
                return (
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} mb-4`}>
                        {editingWidget === 'suggestions' ? (
                             <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold">Suggestions Settings</h3>
                                    <button onClick={() => setEditingWidget(null)} className="p-1 hover:bg-white/10 rounded-full"><X size={16}/></button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Items to Show</label>
                                        <input 
                                            type="range" 
                                            min="1" max="5" 
                                            value={widgetSettings.suggestions.count} 
                                            onChange={(e) => updateWidgetSetting('suggestions', 'count', parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="text-right text-xs mt-1">{widgetSettings.suggestions.count}</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Show Mutuals</span>
                                        <button 
                                            onClick={() => updateWidgetSetting('suggestions', 'showMutuals', !widgetSettings.suggestions.showMutuals)}
                                            className={`w-10 h-5 rounded-full transition-all ${widgetSettings.suggestions.showMutuals ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}` : 'bg-gray-600'}`}
                                        >
                                            <div className={`w-3 h-3 bg-white rounded-full transition-transform m-1 ${widgetSettings.suggestions.showMutuals ? 'translate-x-5' : ''}`} />
                                        </button>
                                    </div>
                                    <button onClick={() => setEditingWidget(null)} className={`w-full py-2 rounded-lg bg-white/10 text-sm font-bold`}>Done</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                     <h3 className="font-bold">Suggestions</h3>
                                     {Grip}
                                </div>
                                <div className="space-y-3">
                                    {INITIAL_FRIEND_SUGGESTIONS.slice(0, widgetSettings.suggestions.count).map(s => (
                                        <div key={s.id} className="flex items-center justify-between">
                                            <button onClick={() => handleViewProfile(s.username)} className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl">{s.avatar}</div>
                                                <div className="text-left">
                                                    <p className="font-semibold text-sm">{s.name}</p>
                                                    <p className="text-xs text-gray-400">{s.username}</p>
                                                    {widgetSettings.suggestions.showMutuals && <p className="text-[10px] text-gray-500">{s.mutualFriends} mutuals</p>}
                                                </div>
                                            </button>
                                            <button className={`px-4 py-1.5 text-sm font-semibold rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors`}>Follow</button>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setShowSuggestions(true)} className={`mt-4 w-full text-center text-sm font-semibold ${currentTheme.text}`}>View All</button>
                            </>
                        )}
                    </div>
                );
            case 'communities':
                return (
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} mb-4`}>
                        {editingWidget === 'communities' ? (
                             <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold">Community Settings</h3>
                                    <button onClick={() => setEditingWidget(null)} className="p-1 hover:bg-white/10 rounded-full"><X size={16}/></button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Items to Show</label>
                                        <input 
                                            type="range" 
                                            min="1" max="10" 
                                            value={widgetSettings.communities.count} 
                                            onChange={(e) => updateWidgetSetting('communities', 'count', parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="text-right text-xs mt-1">{widgetSettings.communities.count}</div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Show Members</span>
                                        <button 
                                            onClick={() => updateWidgetSetting('communities', 'showMembers', !widgetSettings.communities.showMembers)}
                                            className={`w-10 h-5 rounded-full transition-all ${widgetSettings.communities.showMembers ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}` : 'bg-gray-600'}`}
                                        >
                                            <div className={`w-3 h-3 bg-white rounded-full transition-transform m-1 ${widgetSettings.communities.showMembers ? 'translate-x-5' : ''}`} />
                                        </button>
                                    </div>
                                    <button onClick={() => setEditingWidget(null)} className={`w-full py-2 rounded-lg bg-white/10 text-sm font-bold`}>Done</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                 <div className="flex justify-between items-center mb-4">
                                     <h3 className="font-bold flex items-center gap-2"><Users size={18} /> Communities</h3>
                                     {Grip}
                                </div>
                                <div className="space-y-4">
                                    {communities.slice(0, widgetSettings.communities.count).map(group => (
                                        <div key={group.id} 
                                             onClick={() => handleViewCommunity(group)}
                                             className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img src={group.image} alt={group.name} className="w-10 h-10 rounded-lg object-cover" />
                                                <div>
                                                    <p className={`font-semibold text-sm ${textColor} group-hover:${currentTheme.text} transition-colors`}>{group.name}</p>
                                                    {widgetSettings.communities.showMembers && <p className={`text-xs ${textSecondary}`}>{group.members.toLocaleString()} members</p>}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleJoinCommunity(group.id); }} 
                                                className={`p-2 rounded-full transition-all ${group.joined ? `${cardBg} border ${borderColor} ${textSecondary}` : `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white`}`}
                                            >
                                                {group.joined ? <Check size={14} /> : <Plus size={14} />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setShowCommunitiesModal(true)} className={`mt-4 w-full text-center text-sm font-semibold ${currentTheme.text}`}>Explore More</button>
                            </>
                        )}
                    </div>
                );
            default: return null;
        }
    };

    const renderPage = () => {
        switch (activePage) {
            case 'home':
                return (
                    <div 
                        className="space-y-6 touch-pan-y overscroll-none min-h-[80vh]"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                         {/* Pull to Refresh Indicator */}
                        <div 
                            className={`flex justify-center items-center overflow-hidden transition-[height] duration-200 ease-out ${isRefreshing ? 'h-20' : ''}`}
                            style={{ height: isRefreshing ? undefined : `${Math.max(0, pullMoveY)}px` }}
                        >
                             <div className={`p-3 rounded-full ${cardBg} border ${borderColor} shadow-lg transition-transform duration-200 ${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: !isRefreshing ? `rotate(${pullMoveY * 3}deg)` : undefined }}>
                                <Loader2 className={currentTheme.text} size={24} />
                            </div>
                        </div>

                         {/* Search Bar */}
                        <div className="relative">
                            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`} size={20} />
                            <input 
                                type="text" 
                                placeholder="Search FireSocial..." 
                                value={homeSearchQuery}
                                onChange={(e) => setHomeSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                className={`w-full pl-12 pr-14 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} placeholder-gray-500 focus:outline-none focus:ring-2 ${currentTheme.ring}`}
                            />
                            {homeSearchQuery && (
                                <button 
                                    onClick={() => {
                                        const activeElement = document.activeElement as HTMLElement;
                                        if (activeElement) activeElement.blur();
                                    }}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white shadow-lg hover:scale-105 transition-transform`}
                                >
                                    <ArrowRight size={18} />
                                </button>
                            )}
                        </div>
                        {renderStoriesBar()}
                        
                        {/* Feed Tabs */}
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-2 no-scrollbar">
                            {feedTabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveFeedTab(tab)}
                                    className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                                        activeFeedTab === tab
                                            ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white shadow-md transform scale-105`
                                            : `${cardBg} border ${borderColor} ${textColor} hover:bg-white/10`
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                            <button 
                                onClick={handleAddTab}
                                className={`p-2 rounded-full ${cardBg} border ${borderColor} ${textSecondary} hover:${textColor} hover:bg-white/10 transition-colors flex-shrink-0`}
                                title="Add Custom Feed"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        {filteredPosts.length > 0 ? (
                            filteredPosts.map(post => <PostComponent key={post.id} {...postComponentProps} post={post} />)
                        ) : (
                            <div className={`text-center py-10 ${textSecondary}`}>
                                <p>No posts found for "{activeFeedTab}"</p>
                            </div>
                        )}
                    </div>
                );
            case 'explore':
                return <ExplorePage posts={posts} profile={profile} allUsers={allUserListItems} trendingHashtags={INITIAL_TRENDING_HASHTAGS} following={following} onViewPost={setViewingPost} onViewProfile={handleViewProfile} onViewHashtag={(tag) => alert(`Viewing hashtag: ${tag}`)} textColor={textColor} textSecondary={textSecondary} cardBg={cardBg} borderColor={borderColor} currentTheme={currentTheme} />;
            case 'messages':
                return <MessagesPage messages={INITIAL_MESSAGES} groupChats={INITIAL_GROUP_CHATS} onViewMessage={setMessageUser} currentTheme={currentTheme} cardBg={cardBg} textColor={textColor} textSecondary={textSecondary} borderColor={borderColor} />;
            case 'marketplace':
                return <MarketplacePage 
                    products={marketplaceProducts} 
                    onViewProduct={setViewingProduct} 
                    onViewProfile={handleViewProfile} 
                    onAddToCart={handleAddToCart} 
                    onOpenCart={() => setShowCartModal(true)} 
                    onOpenMyStore={() => setActivePage('my-store')}
                    cartItemCount={cart.length} 
                    textColor={textColor} 
                    textSecondary={textSecondary} 
                    cardBg={cardBg} 
                    borderColor={borderColor} 
                    currentTheme={currentTheme} 
                />;
            case 'my-store':
                return <MyStorePage 
                    profile={profile}
                    userProducts={marketplaceProducts.filter(p => p.creatorId === profile.id)}
                    onBack={() => setActivePage('marketplace')}
                    onAddProduct={() => setShowAddProductModal(true)}
                    onUpdateStoreConfig={(config) => setProfile(prev => ({ ...prev, storeConfig: config }))}
                    onDeleteProduct={handleDeleteProduct}
                    onUpdateProfile={(p) => setProfile(p)}
                    currentTheme={currentTheme}
                    cardBg={cardBg}
                    textColor={textColor}
                    textSecondary={textSecondary}
                    borderColor={borderColor}
                />;
            case 'public-store':
                return viewingStoreOwner ? (
                    <PublicStorePage
                        storeOwner={viewingStoreOwner}
                        products={marketplaceProducts.filter(p => p.creatorId === viewingStoreOwner.id)}
                        onBack={() => {
                            setActivePage('profile');
                            setViewingProfileUsername(viewingStoreOwner.username);
                        }}
                        onViewProduct={setViewingProduct}
                        onAddToCart={handleAddToCart}
                        onOpenCart={() => setShowCartModal(true)}
                        cartItemCount={cart.length}
                        textColor={textColor}
                        textSecondary={textSecondary}
                        cardBg={cardBg}
                        borderColor={borderColor}
                        currentTheme={currentTheme}
                    />
                ) : <div>Store not found</div>;
            case 'profile':
                return <ProfilePage 
                    profileToDisplay={viewingProfile} 
                    isOwnProfile={viewingProfile.id === profile.id} 
                    posts={posts} 
                    scheduledPosts={scheduledPosts} 
                    onDeleteScheduledPost={handleDeleteScheduledPost} 
                    activeTab={profileTab} 
                    onTabChange={setProfileTab} 
                    onEditProfile={() => setShowEditProfile(true)} 
                    onFollow={handleFollowToggle}
                    onFireFollowToggle={handleFireFollowToggle}
                    isFireFollowed={isFireFollowed}
                    onBlockToggle={handleBlockToggle} 
                    isFollowing={following.some(u => u.id === viewingProfile.id)} 
                    isBlocked={blockedUserIds.has(viewingProfile.id)} 
                    onShowFollowers={() => setShowFollowList({type: 'followers', user: viewingProfile})} 
                    onShowFollowing={() => setShowFollowList({type: 'following', user: viewingProfile})} 
                    onViewPost={setViewingPost} 
                    onViewComments={setCommentModalPost} 
                    onViewHashtag={(tag) => alert(`Viewing hashtag: ${tag}`)} 
                    onViewProfile={handleViewProfile} 
                    onViewAchievements={() => setActivePage('achievements')} 
                    onViewTrophies={() => setActivePage('trophies')} 
                    onViewStreaks={() => setActivePage('streaks')} 
                    allAchievements={ALL_ACHIEVEMENTS} 
                    cardBg={cardBg} 
                    textColor={textColor} 
                    textSecondary={textSecondary} 
                    borderColor={borderColor} 
                    currentTheme={currentTheme} 
                    onPurchasePost={(id)=>alert(`Purchasing post ${id}`)} 
                    onShowAddProductModal={() => setShowAddProductModal(true)} 
                    onUpdateProfileMonetization={(updatedMonetization) => setProfile(prev => ({...prev, creatorMonetization: updatedMonetization}))}
                    onTip={handleTipCreator}
                    onMessage={handleMessageFromProfile}
                    onPin={handlePinPost}
                    onFeature={handleFeaturePost}
                    onViewMyStore={() => setActivePage('my-store')}
                    onVisitStore={handleVisitStore}
                    onPlayGame={handlePlayGame}
                    onOpenWallet={(tab) => { setWalletInitialTab(tab || 'overview'); setShowWalletModal(true); }}
                />;
            case 'achievements':
                return <AchievementsPage profile={viewingProfile} allAchievements={ALL_ACHIEVEMENTS} onBack={() => setActivePage('profile')} {...uiProps} />;
            case 'trophies':
                return <TrophyPage profile={viewingProfile} onBack={() => setActivePage('profile')} {...uiProps} />;
            case 'streaks':
                return <StreakPage profile={viewingProfile} onBack={() => setActivePage('profile')} {...uiProps} />;
            case 'community':
                return viewingCommunity ? (
                    <CommunityPage 
                        community={viewingCommunity} 
                        onBack={handleHomePageSelect} 
                        onJoinToggle={toggleJoinCommunity} 
                        posts={posts}
                        profile={profile}
                        allUsers={allUserListItems}
                        onReaction={handleReaction}
                        onBookmark={handleBookmark}
                        onDeletePost={handleDeletePost}
                        onViewPost={setViewingPost}
                        onViewComments={setCommentModalPost}
                        onAddComment={handleAddComment}
                        onShare={(post) => setSharePost(post)}
                        onViewProfile={handleViewProfile}
                        onViewHashtag={(tag) => alert(`Viewing ${tag}`)}
                        onRepost={handleInstantRepost}
                        onQuote={handleQuotePost}
                        reactions={REACTIONS}
                        messages={INITIAL_MESSAGES}
                        {...uiProps}
                    />
                ) : <div>Community not found</div>;
            case 'games':
                return <GamesPage
                    games={allGames}
                    onPlay={handlePlayGame}
                    onCreateGame={() => setShowGameCreator(true)}
                    onViewProfile={handleViewProfile}
                    {...uiProps}
                />;
            default: return <div>Not implemented</div>;
        }
    };
    
    const uiProps = { currentTheme, cardBg, textColor, textSecondary, borderColor, hoverBg };

    const postComponentProps = {
        profile: profile,
        reactions: REACTIONS,
        messages: INITIAL_MESSAGES,
        allUsers: allUserListItems,
        ...uiProps,
        onReaction: handleReaction,
        onBookmark: handleBookmark,
        onDelete: handleDeletePost,
        onViewPost: setViewingPost,
        onViewComments: setCommentModalPost,
        onAddComment: handleAddComment,
        onHide: (id: number) => alert(`Hiding post ${id}`),
        onMute: (username: string) => alert(`Muting ${username}`),
        onReport: (id: number) => alert(`Reporting post ${id}`),
        onShare: (post: Post) => setSharePost(post),
        onRepost: handleInstantRepost,
        onQuote: handleQuotePost,
        onCopyLink: (id: number) => { navigator.clipboard.writeText(`https://firesocial.app/post/${id}`); showToast("Link copied!"); },
        onFollowToggle: handleFollowToggle,
        onBlockToggle: handleBlockToggle,
        onVotePoll: (postId: number, optionId: number) => {
            setPosts(posts.map(p => {
                if (p.id === postId && p.pollOptions) {
                    return { ...p, userVoted: optionId, totalVotes: (p.totalVotes || 0) + 1, pollOptions: p.pollOptions.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o) };
                }
                return p;
            }));
        },
        onViewProfile: handleViewProfile,
        onViewHashtag: (tag: string) => alert(`Viewing ${tag}`),
        onPurchasePost: (id: number) => {
            showToast(`Purchased Post ${id}!`);
            setProfile(p => ({...p, purchasedPostIds: [...(p.purchasedPostIds || []), id]}));
        },
        onBoost: handleBoostPost,
        onTip: handlePostTip,
        onPin: handlePinPost,
        onFeature: handleFeaturePost,
        // These need to be calculated per-post
        isFollowing: false, 
        isBlocked: false,
    };


    const NavItem: React.FC<{ page: Page, label: string, icon: React.ElementType, current: Page, onClick: () => void }> = ({ page, label, icon: Icon, current, onClick }) => (
        <button onClick={onClick} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${current === page ? `text-white bg-white/10` : `text-gray-400 hover:text-white hover:bg-white/5`}`}>
            <Icon size={24} />
            <span className="font-semibold text-lg">{label}</span>
        </button>
    );
    
    const MobileNavItem: React.FC<{ page: Page | string, label: string, icon: React.ElementType, current: Page, onClick: () => void }> = ({ page, label, icon: Icon, current, onClick }) => (
        <button onClick={onClick} className={`relative flex flex-col items-center gap-1 p-2 rounded-lg w-20 flex-shrink-0 transition-colors ${current === page ? currentTheme.text : textSecondary}`}>
            {current === page && <div className={`absolute -top-px left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}`}></div>}
            <Icon size={24} />
            <span className="text-xs font-medium truncate">{label}</span>
        </button>
    );

    return (
        <div className={`min-h-screen bg-gradient-to-br ${currentTheme.light} dark:from-gray-900 dark:to-black font-sans transition-colors`}>
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] pointer-events-none">
                    <div className={`animate-in slide-in-from-top-2 fade-in duration-300 ${cardBg} backdrop-blur-xl border ${borderColor} px-6 py-3 rounded-full shadow-2xl flex items-center gap-3`}>
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-1 rounded-full shadow-sm">
                            <Check size={16} strokeWidth={3} />
                        </div>
                        <span className={`font-bold text-sm ${textColor}`}>{toast.message}</span>
                    </div>
                </div>
            )}

            <div className="container mx-auto grid grid-cols-12 gap-8 items-start p-2 sm:p-4">
                <aside className="col-span-3 sticky top-4 hidden lg:flex flex-col gap-4">
                    <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor}`}>
                        <div className="pl-2 mb-6 flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-gradient-to-br ${currentTheme.from} ${currentTheme.to} shadow-lg relative overflow-hidden`}>
                                 {/* Glass overlay for logo */}
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] rounded-xl"></div>
                                <svg className="relative z-10" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.5-3.3.3.3.5.5.5.8z"></path>
                                </svg>
                            </div>
                            <span className={`text-2xl font-bold ${textColor} tracking-tight`}>FireSocial</span>
                        </div>
                        <nav className="space-y-2">
                            <NavItem page="home" label="Home" icon={Home} current={activePage} onClick={handleHomePageSelect} />
                            <NavItem page="explore" label="Explore" icon={Compass} current={activePage} onClick={() => setActivePage('explore')} />
                            <NavItem page="notifications" label="Notifications" icon={Bell} current={activePage} onClick={() => setShowNotifications(true)} />
                            <NavItem page="messages" label="Messages" icon={Mail} current={activePage} onClick={() => setActivePage('messages')} />
                            <NavItem page="marketplace" label="FireShop" icon={ShoppingBag} current={activePage} onClick={() => setActivePage('marketplace')} />
                            <NavItem page="games" label="Games" icon={Gamepad2} current={activePage} onClick={() => setActivePage('games')} />
                            <NavItem page="wallet" label="My Wallet" icon={Wallet} current={activePage} onClick={() => { setWalletInitialTab('overview'); setShowWalletModal(true); }} />
                            <NavItem page="profile" label="Profile" icon={User} current={activePage} onClick={() => handleViewProfile(profile.username)} />
                        </nav>

                        <div 
                            onClick={() => { setWalletInitialTab('overview'); setShowWalletModal(true); }}
                            className={`mt-4 p-4 rounded-2xl bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group relative overflow-hidden`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">My Wallet</p>
                                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold group-hover:bg-white text-white group-hover:text-orange-600 transition-colors">
                                    Manage
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Flame size={24} fill="currentColor" className="animate-pulse text-amber-300" />
                                <span className="text-2xl font-black">{profile.emberBalance?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs opacity-90 mt-2 pt-2 border-t border-white/20">
                                <span>Cash: ${(profile.creatorMonetization?.balance || 0).toFixed(2)}</span>
                                <span className="font-bold flex items-center gap-1 group-hover:underline">Top Up <ArrowUpRight size={12}/></span>
                            </div>
                        </div>
                    </div>
                     <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} space-y-2`}>
                        <button onClick={() => setShowAICreator(true)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-gray-400 hover:text-white hover:bg-white/5`}>
                           <Bot size={24} /> <span className="font-semibold text-lg">AI Creator</span>
                        </button>
                    </div>
                </aside>
                
                <main className="col-span-12 lg:col-span-6 pb-24 lg:pb-0">
                    {renderPage()}
                </main>
                
                <aside className="col-span-3 sticky top-4 hidden lg:flex flex-col gap-4">
                     <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-4 border ${borderColor} flex justify-between items-center gap-1`}>
                        <button 
                            onClick={() => { setWalletInitialTab('overview'); setShowWalletModal(true); }} 
                            className="px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 text-orange-500 font-bold text-xs flex items-center gap-1.5 border border-orange-500/30 transition-all active:scale-95"
                            title="Open FireWallet"
                        >
                            <Flame size={16} fill="currentColor" className="animate-pulse" />
                            <span>{profile.emberBalance?.toLocaleString() || 0}</span>
                        </button>
                        <button onClick={() => setShowNotifications(true)} className={`p-2.5 rounded-xl hover:bg-white/10 ${textSecondary} relative`}>
                            <Bell size={20} />
                            {unreadNotificationsCount > 0 && <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></div>}
                        </button>
                        <button onClick={() => setShowSettings(true)} className={`p-3 rounded-xl hover:bg-white/10 ${textSecondary}`}><Settings size={20} /></button>
                        <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-xl hover:bg-white/10 ${textSecondary}`}>{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
                        <button onClick={() => setShowAnalytics(true)} className={`p-3 rounded-xl hover:bg-white/10 ${textSecondary}`}><BarChart2 size={20} /></button>
                         <button onClick={() => setShowAIChatbot(true)} className={`p-3 rounded-xl hover:bg-white/10 ${textSecondary}`}><Bot size={20} /></button>
                        <button onClick={logout} className={`p-3 rounded-xl hover:bg-white/10 text-red-500`} title="Log Out"><LogOut size={20} /></button>
                    </div>

                    {/* Reorderable Widgets */}
                    {widgetOrder.map((widgetId, index) => (
                        <div
                            key={widgetId}
                            draggable={dragEnabledIndex === index}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()} // Necessary to allow dropping
                            className={`transition-all duration-200 ${dragItem.current === index ? 'opacity-50' : ''}`}
                        >
                            {renderWidget(widgetId, index)}
                        </div>
                    ))}
                </aside>
            </div>

            {/* Floating Fire Button */}
            <button
                onClick={() => setShowCreatePost(true)}
                className={`fixed bottom-24 right-4 lg:bottom-10 lg:right-10 w-16 h-16 rounded-full shadow-2xl z-50 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white hover:scale-110 transition-transform flex items-center justify-center animate-bounce`}
            >
                <span className="text-3xl">🔥</span>
            </button>
            
            <footer className={`lg:hidden fixed bottom-0 left-0 right-0 ${cardBg} backdrop-blur-xl border-t ${borderColor} shadow-t-lg z-50`}>
                <nav className="flex justify-start items-center p-1 overflow-x-auto no-scrollbar">
                    <MobileNavItem page="home" label="Home" icon={Home} current={activePage} onClick={handleHomePageSelect} />
                    <MobileNavItem page="explore" label="Explore" icon={Compass} current={activePage} onClick={() => setActivePage('explore')} />
                    <MobileNavItem page="notifications" label="Alerts" icon={Bell} current={activePage} onClick={() => setShowNotifications(true)} />
                    <MobileNavItem page="messages" label="DMs" icon={Mail} current={activePage} onClick={() => setActivePage('messages')} />
                    <MobileNavItem page="marketplace" label="FireShop" icon={ShoppingBag} current={activePage} onClick={() => setActivePage('marketplace')} />
                    <MobileNavItem page="wallet" label="Wallet" icon={Wallet} current={activePage} onClick={() => { setWalletInitialTab('overview'); setShowWalletModal(true); }} />
                    <MobileNavItem page="ai-creator" label="AI Create" icon={Bot} current={activePage} onClick={() => setShowAICreator(true)} />
                    <MobileNavItem page="games" label="Games" icon={Gamepad2} current={activePage} onClick={() => setActivePage('games')} />
                    <MobileNavItem page="profile" label="Profile" icon={User} current={activePage} onClick={() => handleViewProfile(profile.username)} />
                </nav>
            </footer>

            {/* Modals */}
            {showSettings && <SettingsModal show={showSettings} onClose={() => setShowSettings(false)} profile={profile} setProfile={setProfile} onEditProfile={() => {setShowSettings(false); setShowEditProfile(true);}} setThemeColor={setThemeColor} allUsers={allUserListItems} onBlockToggle={handleBlockToggle} themeColor={themeColor} darkMode={darkMode} {...uiProps} />}
            {showEditProfile && <EditProfileModal profile={profile} onClose={() => setShowEditProfile(false)} onSave={handleSaveProfile} {...uiProps} />}
            {showFollowList && <FollowListModal listType={showFollowList.type} onClose={() => setShowFollowList(null)} followers={followers} following={following} onFollowToggle={handleFollowToggle} onFireFollowToggle={handleFireFollowToggle} onViewProfile={handleViewProfile} {...uiProps} />}
            
            {/* Viewing Post Modal */}
            {viewingPost && (
                 <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setViewingPost(null)}>
                    <div className="relative w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setViewingPost(null)} 
                            className="absolute -top-12 right-0 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                        >
                            <X size={24} />
                        </button>
                         <PostComponent 
                            {...postComponentProps} 
                            post={viewingPost}
                            isFollowing={following.some(u => u.id === viewingPost.userId)}
                            isBlocked={blockedUserIds.has(viewingPost.userId)}
                        />
                    </div>
                </div>
            )}

            {commentModalPost && <CommentModal post={commentModalPost} profile={profile} onClose={() => setCommentModalPost(null)} onAddComment={handleAddComment} onLikeComment={()=>{}} onDeleteComment={()=>{}} onEditComment={()=>{}} allUsers={allUserListItems} onViewProfile={handleViewProfile} {...uiProps} />}
            {messageUser && <MessageModal isOpen={!!messageUser} onClose={() => setMessageUser(null)} messageUser={messageUser} profile={profile} chatHistory={chatHistories[messageUser.userId] || []} onSendMessage={handleSendMessage} onDeleteMessage={()=>{}} onEditMessage={()=>{}} onReactToMessage={()=>{}} onStartCall={(user, type) => setActiveCall({ user, type })} {...uiProps} />}
            {activeCall && <CallModal call={activeCall} onEndCall={() => setActiveCall(null)} {...uiProps} />}
            {viewingStory && <StoryViewerModal stories={INITIAL_STORIES} startUser={viewingStory} profile={profile} onClose={() => setViewingStory(null)} onDeleteStory={()=>{}} />}
            {showAnalytics && <AnalyticsModal show={showAnalytics} onClose={() => setShowAnalytics(false)} profile={profile} posts={posts} followers={followers} {...uiProps} />}
            {showCreateStory && <CreateStoryModal show={showCreateStory} onClose={() => setShowCreateStory(false)} onCreate={()=>{}} {...uiProps} />}
            {showCreatePost && <CreatePostModal show={showCreatePost} onClose={() => {setShowCreatePost(false); setQuotingPost(null);}} onCreatePost={handleCreatePost} profile={profile} quotingPost={quotingPost} {...uiProps} />}
            {showSuggestions && <SuggestionsModal show={showSuggestions} onClose={() => setShowSuggestions(false)} suggestions={INITIAL_FRIEND_SUGGESTIONS} following={following} onFollowToggle={handleFollowToggle} onDismiss={()=>{}} onViewProfile={handleViewProfile} {...uiProps} />}
            {showNotifications && <NotificationsModal show={showNotifications} onClose={() => setShowNotifications(false)} notifications={notifications} unreadCount={notifications.filter(n=>!n.read).length} onMarkAllRead={()=>{}} onMarkOneRead={()=>{}} onViewNotification={(n) => {setShowNotifications(false); setViewingNotification(n);}} {...uiProps} />}
            {viewingNotification && <NotificationDetailModal show={!!viewingNotification} notification={viewingNotification} onClose={() => setViewingNotification(null)} allUsers={allUserListItems} posts={posts} onViewPost={(p)=>{setViewingNotification(null); setViewingPost(p);}} onViewProfile={(u)=>{setViewingNotification(null); handleViewProfile(u);}} {...uiProps} />}
            {viewingProduct && <ProductDetailModal product={viewingProduct} onClose={() => setViewingProduct(null)} profile={profile} onViewProfile={handleViewProfile} onAddToCart={handleAddToCart} {...uiProps} />}
            {showAddProductModal && <AddProductModal show={showAddProductModal} onClose={() => setShowAddProductModal(false)} onAddProduct={handleAddNewProduct} {...uiProps} />}
            {showAICreator && <AICreatorModal show={showAICreator} onClose={() => setShowAICreator(false)} {...uiProps} />}
            {showGameCreator && <GameCreatorModal show={showGameCreator} onClose={() => setShowGameCreator(false)} onDeployGame={handleDeployGame} {...uiProps} />}
            {viewingGame && <GamePlayerModal game={viewingGame} onClose={() => setViewingGame(null)} {...uiProps} />}
            {showAIChatbot && <AIChatbotModal show={showAIChatbot} onClose={() => setShowAIChatbot(false)} {...uiProps} />}
            {showCommunitiesModal && <CommunitiesModal show={showCommunitiesModal} onClose={() => setShowCommunitiesModal(false)} communities={communities} onJoinToggle={toggleJoinCommunity} onViewCommunity={handleViewCommunity} {...uiProps} />}
            {showCartModal && <CartModal show={showCartModal} onClose={() => setShowCartModal(false)} cartItems={cart} onRemoveItem={handleRemoveFromCart} onCheckout={handleCheckout} {...uiProps} />}
            {sharePost && <ShareModal show={!!sharePost} onClose={() => setSharePost(null)} post={sharePost} onReshare={handleReshare} {...uiProps} />}
            {showWalletModal && <WalletModal show={showWalletModal} onClose={() => setShowWalletModal(false)} profile={profile} setProfile={setProfile} allUsers={allUserListItems} initialTab={walletInitialTab} {...uiProps} />}
            <TipModal show={!!tipModalRecipient} onClose={() => setTipModalRecipient(null)} recipient={tipModalRecipient} onConfirm={handleConfirmTip} balance={profile.emberBalance} {...uiProps} />
        </div>
    );
};
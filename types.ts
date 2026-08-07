


export interface Theme {
  from: string;
  to: string;
  light: string;
  text: string;
  ring: string;
  border: string;
  hoverText: string;
}

export interface Themes {
  [key:string]: Theme;
}

export interface Reaction {
  name: string;
  emoji: string;
  color: string;
}

export interface Achievement {
  id: string;
  icon: string;
  name: string;
  description: string;
}

export interface Link {
  id: number;
  title: string;
  url: string;
  icon?: string;
}

export interface PrivacySettings {
  profilePublic: boolean;
  showOnlineStatus: boolean;
  allowTagging: boolean;
  showActivity: boolean;
  privateAccount: boolean;
  suggestAccount: boolean;
  activityStatus: boolean;
}

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

export type ThemeColor = 'orange' | 'blue' | 'green' | 'pink';

export interface UserListItem {
  id: number;
  name: string;
  username: string;
  avatar: string;
  followedByYou: boolean;
  isFireFollowed?: boolean;
}

export interface CommentAttachment {
  type: 'image' | 'video' | 'file';
  url: string;
  name?: string;
  size?: string;
  mimeType?: string;
}

export interface Comment {
  id: number;
  userId: number;
  username: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  isLiked: boolean;
  replyTo?: string;
  edited?: boolean;
  attachment?: CommentAttachment;
}

export interface Post {
  id: number;
  userId: number;
  user: string;
  username: string;
  avatar: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  time: string;
  reactions: { [key:string]: number };
  userReaction: string | null;
  bookmarked: boolean;
  views: number;
  media?: MediaItem[];
  type?: 'post' | 'poll';
  pollOptions?: { id: number; text: string; votes: number }[];
  totalVotes?: number;
  userVoted?: number | null;
  commentsData?: Comment[];
  isSponsored?: boolean;
  isBoosted?: boolean;
  postFormat?: 'standard' | 'reel';
  category?: string;
  location?: string;
  isPaid?: boolean;
  paidInfo?: {
    price: number;
    currency: string;
    purchasers: number[]; // user IDs
  };
  quotedPost?: Post;
  isPinned?: boolean;
  isFeatured?: boolean;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  benefits: string[];
  color: string;
  subscriberCount: number;
}

export interface PaidPostAnalytics {
  id: number; // Corresponds to Post id
  price: number;
  currency: string;
  purchaseCount: number;
  revenue: number;
}

export interface TipJar {
  enabled: boolean;
  suggestedAmounts: number[];
  customAmount: boolean;
  totalTips: number;
  tipCount: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: 'Physical' | 'Digital' | 'Service' | 'Rental' | 'Experience';
  creatorId: number;
  creatorUsername: string;
  creatorAvatar: string;
  stock: number; // -1 for infinite/digital
  sales: number;
  rating: number; // 0-5
  promotionId?: string;
  isAffiliate?: boolean;
  affiliateCommission?: number; // Percentage
}

export interface Game {
  id: string;
  title: string;
  description: string;
  previewImage: string;
  code: string;
  playCount: number;
  earnings: number; // Total embers earned from plays
  creatorId: number;
  creatorUsername: string;
  category?: string;
}

export interface Tournament {
  id: string;
  title: string;
  game: string;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  timeLeft: string;
  image: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
}

export interface CreatorAnalytics {
  totalEarnings: number;
  monthlyEarnings: number[];
  topEarningPosts: PaidPostAnalytics[];
  subscriberGrowth: number[];
  tipHistory: { date: string; amount: number }[];
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  name: string;
  last4: string;
  expiry?: string; // MM/YY for cards
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'tip_received' | 'tip_sent' | 'earning' | 'game_revenue';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

export interface CreatorMonetization {
  enabled: boolean;
  subscriptionTiers: SubscriptionTier[];
  tipJar: TipJar;
  paidPosts: PaidPostAnalytics[];
  products: Product[];
  games: Game[];
  analytics: CreatorAnalytics;
  payoutMethod: 'stripe' | 'paypal' | 'bank';
  payoutEmail?: string;
  minimumPayout: number;
  nextPayoutDate: string;
  balance: number;
  wallet?: {
    paymentMethods: PaymentMethod[];
    transactions: WalletTransaction[];
  };
}

export interface StoreConfig {
    banner: string;
    themeColor: string;
    layout: 'grid' | 'list';
    welcomeMessage: string;
}

export interface Promotion {
    id: string;
    code: string;
    discountPercent: number;
    expiresAt: string;
    active: boolean;
}

export interface AffiliateStats {
    clicks: number;
    conversions: number;
    earnings: number;
    activeLinks: number;
}

export interface GamingStats {
    level: number;
    xp: number;
    nextLevelXp: number;
    wins: number;
    losses: number;
    gamesPlayed: number;
}

export interface Profile {
  id: number;
  name: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  coverPhoto?: string;
  wallpaper?: string;
  followers: number;
  following: number;
  posts: number;
  badges: string[];
  streak: number;
  online: boolean;
  verified: boolean;
  pronouns?: string;
  showPronouns?: boolean;
  links?: Link[];
  location?: string;
  website?: string;
  work?: string;
  education?: string;
  privacySettings: PrivacySettings;
  notificationSettings: {
    push: boolean;
    email: boolean;
  };
  messagingSettings: {
    allowDirectMessages: 'everyone' | 'followers';
    readReceipts: boolean;
  };
  contentPreferences: {
    favoriteTopics: string[];
    hiddenWords: string[];
    sensitiveContent: 'allow' | 'blur' | 'hide';
  };
  category?: string;
  featuredHashtags?: string[];
  language: string;
  twoFactorEnabled: boolean;
  mutedAccounts: UserListItem[];
  restrictedAccounts: UserListItem[];
  blockedAccounts: UserListItem[];
  unlockedAchievements: string[];
  searchHistory?: string[];
  creatorMonetization?: CreatorMonetization;
  isCreator?: boolean;
  purchasedPostIds?: number[];
  emberBalance: number;
  // Gaming Fields
  sparks: number;
  gamingStats?: GamingStats;
  // New Store Fields
  storeConfig?: StoreConfig;
  promotions?: Promotion[];
  affiliateStats?: AffiliateStats;
}

export interface ScheduledPost {
  scheduledId: number;
  postData: Omit<Post, 'id' | 'time'>;
  scheduledTime: string; // ISO string
}

export interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'tag' | 'schedule' | 'tip' | 'game_play';
  user: string;
  username: string;
  content: string;
  time: string;
  read: boolean;
  postId?: number;
}

export interface Message {
  id: number;
  userId: number;
  user: string;
  username: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  online: boolean;
  lastMessageType: 'text' | 'image' | 'video' | 'call' | 'file' | 'voice';
  lastMessageSentByYou: boolean;
}

export interface GroupChat {
  id: number;
  name: string;
  avatar: string;
  members: number;
  lastMessage: string;
  time: string;
  unread: number;
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: PollOption[];
  totalVotes?: number;
  userVoted?: number | null;
}

export interface StoryItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  duration?: number; // in seconds
  link?: string;
  poll?: Poll;
}


export interface Story {
  id: number;
  user: string;
  username: string;
  avatar: string;
  media: StoryItem[];
  isYours: boolean;
  viewed?: boolean;
  timestamp: string;
  isLive?: boolean;
  views?: number;
}


export interface FriendSuggestion {
  id: number;
  name: string;
  username: string;
  avatar: string;
  mutualFriends: number;
  followed: boolean;
}

export interface TrendingHashtag {
  tag: string;
  posts: number;
}

export interface LiveUser {
  id: number;
  name: string;
  username: string;
  avatar: string;
  viewers: number;
}

export interface CallInfo {
  type: 'video' | 'voice';
  duration?: string;
  status: 'started' | 'ended' | 'missed';
}

export interface ChatMessage {
  id: number;
  text: string;
  sentBy: number; // user ID
  time: string;
  type: 'text' | 'image' | 'video' | 'call' | 'file' | 'voice';
  url?: string;
  callInfo?: CallInfo;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  replyTo?: number; // The ID of the message being replied to
  reactions?: { [emoji: string]: string[] }; // emoji -> user IDs
  isEdited?: boolean;
  // For files
  fileName?: string;
  fileSize?: string;
  // For voice
  waveform?: number[];
  duration?: string;
}

export type ActiveCall = {
    type: 'video' | 'voice';
    user: Message;
}

export interface Community {
  id: number;
  name: string;
  image: string;
  members: number;
  joined: boolean;
  category: string;
}
import React from 'react';
import { X, Users, BarChart3, TrendingUp, Heart, MessageSquare, Share2, Eye } from 'lucide-react';
import { Profile, Post, Theme, UserListItem } from '../types';

interface AnalyticsModalProps {
    show: boolean;
    onClose: () => void;
    profile: Profile;
    posts: Post[];
    followers: UserListItem[];
    // UI Props
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = (props) => {
    const { show, onClose, profile, posts, followers, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;

    if (!show) return null;

    const userPosts = posts.filter(p => p.userId === profile.id);
    const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = userPosts.reduce((sum, post) => sum + post.comments, 0);
    const totalShares = userPosts.reduce((sum, post) => sum + post.shares, 0);
    const totalViews = userPosts.reduce((sum, post) => sum + post.views, 0);
    const totalEngagement = totalLikes + totalComments + totalShares;

    // A simple engagement rate calculation
    const engagementRate = profile.followers > 0 && userPosts.length > 0 ? ((totalEngagement / profile.followers / userPosts.length) * 100).toFixed(2) : '0.00';

    const topPosts = [...userPosts].sort((a, b) => b.likes - a.likes).slice(0, 3);
    
    // Mock data for follower growth chart
    const followerGrowthData = [4, 6, 5, 8, 7, 9, 12];
    const maxGrowth = Math.max(...followerGrowthData, 1); // Avoid division by zero

    const StatCard: React.FC<{ icon: React.ElementType, label: string, value: string | number, change?: string }> = ({ icon: Icon, label, value, change }) => (
        <div className={`${cardBg} backdrop-blur-xl rounded-2xl p-4 border ${borderColor}`}>
            <div className={`flex items-center gap-3 ${textSecondary} mb-2`}>
                <Icon size={16} />
                <span className="text-sm">{label}</span>
            </div>
            <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
                {change && <p className="text-sm font-semibold text-green-500">{change}</p>}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16">
            <div className={`overflow-y-auto max-h-[90vh] ${cardBg} backdrop-blur-xl ${textColor} rounded-3xl p-6 max-w-2xl w-full border ${borderColor} shadow-2xl`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart3 size={24} /> Analytics</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard icon={Users} label="Followers" value={profile.followers.toLocaleString()} change="+21" />
                    <StatCard icon={Eye} label="Profile Views" value="1,284" change="+12%" />
                    <StatCard icon={TrendingUp} label="Engagement Rate" value={`${engagementRate}%`} />
                    <StatCard icon={Heart} label="Total Likes" value={totalLikes.toLocaleString()} />
                </div>

                <div className={`${cardBg} backdrop-blur-xl rounded-2xl p-4 border ${borderColor} mb-6`}>
                    <h3 className="font-semibold mb-3">Follower Growth (Last 7 Days)</h3>
                    <div className="flex items-end justify-between h-32 gap-2">
                        {followerGrowthData.map((value, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center justify-end">
                                <div 
                                    className={`w-full rounded-t-md bg-gradient-to-t ${currentTheme.from} ${currentTheme.to} transition-all duration-500`} 
                                    style={{ height: `${(value / maxGrowth) * 100}%` }}
                                    title={`${value} new followers`}
                                ></div>
                                <span className={`text-xs mt-1 ${textSecondary}`}>Day {index + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold mb-3">Top Posts</h3>
                    <div className="space-y-3">
                        {topPosts.length > 0 ? topPosts.map(post => (
                            <div key={post.id} className={`${cardBg} backdrop-blur-xl rounded-2xl p-3 border ${borderColor} flex items-center gap-3`}>
                                <div className="w-16 h-16 rounded-lg bg-gray-700 overflow-hidden flex-shrink-0">
                                    {post.media && post.media.length > 0 && post.media[0].type === 'image' ? (
                                        <img src={post.media[0].url} alt="post media" className="w-full h-full object-cover" />
                                    ) : (
                                        <p className="text-xs p-1 text-white/50 line-clamp-4">{post.content}</p>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className={`truncate ${textColor} text-sm`}>{post.content || "Media post"}</p>
                                    <div className={`flex items-center gap-4 text-xs mt-2 ${textSecondary}`}>
                                        <span className="flex items-center gap-1"><Heart size={12} /> {post.likes}</span>
                                        <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.comments}</span>
                                        <span className="flex items-center gap-1"><Share2 size={12} /> {post.shares}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className={textSecondary}>You have no posts yet.</p>
                        )}
                    </div>
                </div>

                 <div className="text-center">
                    <button onClick={onClose} className={`px-6 py-2 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-semibold hover:scale-105 transition-all`}>
                        Done
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AnalyticsModal;
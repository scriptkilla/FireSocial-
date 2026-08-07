
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Profile, Post, Theme, Achievement, Comment, ScheduledPost, CreatorMonetization, SubscriptionTier, TipJar, Product, WalletTransaction, PaymentMethod, Game } from '../types';
import { Edit3, Camera, Zap, Award, Link2, MapPin, Briefcase, GraduationCap, Github, Twitter, Linkedin, Globe, Heart, MessageSquare, MoreHorizontal, UserMinus, AlertTriangle, Instagram, Facebook, Film, Trash2, DollarSign, Settings, Star, Users, Bell, Wallet, CreditCard, Building, ArrowUpRight, ArrowDownLeft, Plus, Flame, Calendar, Image as ImageIcon, Video, Grid, List as ListIcon, Clock, ChevronRight, ExternalLink, Lock, BarChart3, Sparkles, ShoppingBag, Layers, Play, Mail, Youtube, Twitch, Store, Gamepad2 } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';

// --- HELPER COMPONENTS ---

const SubscriptionBadge: React.FC<{ tier: SubscriptionTier, onClick?: () => void }> = ({ tier, onClick }) => (
    <button onClick={onClick} className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-white font-semibold cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 ${tier.color}`}>
        <span>⭐</span>
        <span>{tier.name}</span>
        <span>${tier.price}/mo</span>
    </button>
);

const TipJarComponent: React.FC<{ tipJar: TipJar, onTip: (amount: number) => void, currentTheme: Theme, cardBg: string, borderColor: string }> = ({ tipJar, onTip, currentTheme, cardBg, borderColor }) => {
    const [customAmount, setCustomAmount] = useState('');
    const [showCustom, setShowCustom] = useState(false);

    if (!tipJar.enabled) return null;

    return (
        <div className={`relative overflow-hidden ${cardBg} border ${borderColor} rounded-2xl p-6 shadow-lg group`}>
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}`}></div>
            <div className="text-center mb-6 relative z-10">
                <div className="inline-flex p-3 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 mb-3 shadow-inner">
                    <div className="text-3xl">💝</div>
                </div>
                <h3 className="font-bold text-lg dark:text-white text-gray-900">Support the Creator</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Fuel their creativity with Embers</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                {tipJar.suggestedAmounts.map(amount => (
                    <button 
                        key={amount} 
                        onClick={() => onTip(amount)} 
                        className={`py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 border ${borderColor} hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500 group-hover:shadow-md`}
                    >
                        <span className="text-lg">{amount}</span> <Flame size={18} className="text-orange-500" fill="currentColor" />
                    </button>
                ))}
            </div>

            {tipJar.customAmount && (
                showCustom ? (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="relative">
                            <Flame className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" size={18} fill="currentColor"/>
                            <input 
                                type="number" 
                                value={customAmount} 
                                onChange={(e) => setCustomAmount(e.target.value)} 
                                placeholder="Custom amount" 
                                className={`w-full pl-10 pr-4 py-3 ${cardBg} border ${borderColor} rounded-xl focus:outline-none focus:ring-2 ${currentTheme.ring}`} 
                                min="1" 
                                autoFocus
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button onClick={() => { if (customAmount && Number(customAmount) > 0) { onTip(Number(customAmount)); setCustomAmount(''); setShowCustom(false); } }} className={`flex-1 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all`}>
                                Send
                            </button>
                            <button onClick={() => setShowCustom(false)} className={`px-4 py-2 border ${borderColor} rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all`}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setShowCustom(true)} className={`w-full py-3 border-2 border-dashed ${borderColor} text-gray-500 dark:text-gray-400 rounded-xl font-semibold hover:border-orange-500 hover:text-orange-500 transition-all`}>
                        Custom Amount
                    </button>
                )
            )}
        </div>
    );
};


const CreatorMonetizationDashboard: React.FC<{ monetization: CreatorMonetization, onUpdate: (updated: CreatorMonetization) => void, currentTheme: Theme, cardBg: string, borderColor: string, textColor: string, textSecondary: string, onAddNewProductClick: () => void, emberBalance: number, onOpenWallet?: (tab?: any) => void }> = (props) => {
    const { monetization, onUpdate, currentTheme, cardBg, borderColor, textColor, textSecondary, onAddNewProductClick, emberBalance, onOpenWallet } = props;
    const [activeTab, setActiveTab] = useState('overview');
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');

    if (!monetization.enabled) {
        return (
            <div className={`p-12 text-center border-2 border-dashed ${borderColor} rounded-3xl bg-black/5 dark:bg-white/5`}>
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
                    <DollarSign size={40} className="text-white" />
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${textColor}`}>Monetize Your Passion</h3>
                <p className={`${textSecondary} mb-8 max-w-md mx-auto`}>Unlock subscription tiers, tips, paid posts, and sell digital products directly to your audience.</p>
                <button onClick={() => onUpdate({ ...monetization, enabled: true })} className={`bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-transform`}>
                    Activate Creator Studio
                </button>
            </div>
        );
    }

    const StatCard: React.FC<{label: string, value: string | number, icon: React.ReactNode, trend?: string}> = ({label, value, icon, trend}) => (
        <div className={`${cardBg} p-5 rounded-2xl border ${borderColor} relative overflow-hidden group`}>
             <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity scale-150`}>{icon}</div>
             <div className="flex items-center gap-2 mb-2 text-sm font-medium opacity-70">
                {icon} <span>{label}</span>
             </div>
            <div className="text-3xl font-bold">{value}</div>
             {trend && (
                <div className="mt-2 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}`} style={{width: trend}}></div>
                </div>
             )}
        </div>
    );
    
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Dashboard Tabs */}
            <div className="flex gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl overflow-x-auto no-scrollbar">
                {['overview', 'wallet', 'subscriptions', 'products', 'tips'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab ? `bg-white dark:bg-gray-800 shadow-md ${textColor}` : `${textSecondary} hover:bg-white/10`}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Updated to show Withdrawable Balance (Earnings) instead of Spending Balance (Ember) */}
                    <StatCard label="Total Earnings" value={`$${monetization.balance.toFixed(2)}`} icon={<DollarSign size={18} className="text-green-500"/>} trend="75%"/>
                    <StatCard label="Monthly Revenue" value={`$${monetization.analytics.monthlyEarnings.slice(-1)[0] || 0}`} icon={<DollarSign size={18} className="text-green-500"/>} trend="45%"/>
                    <StatCard label="Active Subs" value={monetization.subscriptionTiers.reduce((s, t) => s + t.subscriberCount, 0)} icon={<Users size={18} className="text-blue-500"/>} trend="20%"/>
                    <StatCard label="Tips Received" value={monetization.tipJar.tipCount} icon={<Heart size={18} className="text-red-500"/>} trend="60%"/>
                    
                    <div className={`col-span-1 sm:col-span-2 lg:col-span-4 ${cardBg} p-6 rounded-3xl border ${borderColor} mt-4`}>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BarChart3 size={20}/> Revenue Analytics</h3>
                        <div className="h-40 flex items-end justify-between gap-2 px-2">
                            {[45, 67, 32, 89, 54, 76, 92, 43, 65, 88, 120, 98].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative h-full overflow-hidden">
                                         <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t ${currentTheme.from} ${currentTheme.to} transition-all duration-1000 ease-out group-hover:opacity-80`} style={{height: `${h}%`}}></div>
                                    </div>
                                    <span className="text-xs opacity-50">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'wallet' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        {/* Creator Earnings Card */}
                        <div className={`relative aspect-[1.586/1] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${currentTheme.from} ${currentTheme.to} p-8 text-white flex flex-col justify-between transform hover:scale-[1.02] transition-transform`}>
                            <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <div className="flex justify-between items-start z-10">
                                <DollarSign size={40} fill="currentColor" />
                                <span className="font-mono text-lg opacity-80">EARNINGS WALLET</span>
                            </div>
                            <div className="z-10">
                                <p className="text-sm opacity-80 mb-1">Withdrawable Balance</p>
                                <h2 className="text-5xl font-bold flex items-center gap-3 tracking-tight">
                                    ${monetization.balance.toLocaleString()}
                                </h2>
                            </div>
                            <div className="flex justify-between items-end z-10">
                                 <div>
                                    <p className="text-xs opacity-60 uppercase tracking-wider mb-1">Card Holder</p>
                                    <p className="font-medium text-lg tracking-wide">THOMAS DARROW</p>
                                 </div>
                                 <div className="opacity-80">
                                     <div className="flex gap-1">
                                         <div className="w-8 h-8 rounded-full bg-white/20"></div>
                                         <div className="w-8 h-8 rounded-full bg-white/40 -ml-4"></div>
                                     </div>
                                 </div>
                            </div>
                        </div>

                        {/* Spending Balance (Ember) - Visual separation */}
                        <div className={`flex items-center justify-between p-6 rounded-3xl border ${borderColor} bg-gradient-to-r from-orange-500/10 to-red-500/10`}>
                            <div>
                                <p className={`${textSecondary} text-sm font-medium uppercase tracking-wide`}>Spending Balance</p>
                                <div className="flex items-center gap-2">
                                    <Flame className="text-orange-500" size={24} fill="currentColor" />
                                    <span className={`text-2xl font-bold ${textColor}`}>{emberBalance.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-orange-500 mt-1">Non-withdrawable. Use for tips & boosts.</p>
                            </div>
                            <button onClick={() => onOpenWallet ? onOpenWallet('buy_embers') : setShowDepositModal(true)} className={`px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform`}>
                                Buy Embers
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className={`${cardBg} p-6 rounded-3xl border ${borderColor}`}>
                             <h3 className="font-bold text-lg mb-4">Payout Actions</h3>
                             <div className="grid grid-cols-1 gap-4">
                                <button 
                                    onClick={() => onOpenWallet ? onOpenWallet('deposit_withdraw') : alert(`Withdrawing $${monetization.balance} to your bank account.`)}
                                    disabled={monetization.balance < 50}
                                    className={`p-4 rounded-2xl border ${borderColor} hover:bg-black/5 dark:hover:bg-white/5 flex flex-col items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <div className="p-3 rounded-full bg-green-500/20 text-green-500"><ArrowUpRight size={24}/></div>
                                    <span className="font-semibold">Withdraw Earnings</span>
                                    {monetization.balance < 50 && <span className="text-xs text-red-500">Min. $50 required</span>}
                                </button>
                             </div>
                        </div>
                        
                        <div className={`${cardBg} p-6 rounded-3xl border ${borderColor}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">Recent Activity</h3>
                                <button onClick={() => onOpenWallet && onOpenWallet('history')} className={`text-xs font-bold ${currentTheme.text}`}>VIEW ALL</button>
                            </div>
                            <div className="space-y-4">
                                {monetization.wallet?.transactions.slice(0, 3).map(txn => (
                                    <div key={txn.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${txn.type === 'deposit' || txn.type === 'earning' || txn.type === 'tip_received' || txn.type === 'game_revenue' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                {txn.type === 'deposit' || txn.type === 'earning' || txn.type === 'tip_received' || txn.type === 'game_revenue' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{txn.description}</p>
                                                <p className="text-xs opacity-50">{txn.date}</p>
                                            </div>
                                        </div>
                                        <span className={`font-bold text-sm ${txn.type === 'deposit' || txn.type === 'earning' || txn.type === 'tip_received' || txn.type === 'game_revenue' ? 'text-green-500' : 'text-red-500'}`}>
                                            {txn.type === 'deposit' || txn.type === 'earning' || txn.type === 'tip_received' || txn.type === 'game_revenue' ? '+' : '-'}${txn.amount.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'subscriptions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {monetization.subscriptionTiers.map(tier => (
                        <div key={tier.id} className={`${cardBg} p-6 rounded-3xl border ${borderColor} relative overflow-hidden group hover:border-orange-500/50 transition-colors`}>
                            <div className={`absolute top-0 left-0 w-full h-2 ${tier.color}`}></div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">{tier.name}</h3>
                                    <p className={`${textSecondary} text-sm`}>{tier.subscriberCount} active subscribers</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-bold ${tier.color} bg-opacity-20 text-white`}>
                                    ${tier.price}/mo
                                </div>
                            </div>
                            <ul className="space-y-2 mb-6">
                                {tier.benefits.map((b, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center flex-shrink-0"><Plus size={12} /></div>
                                        {b}
                                    </li>
                                ))}
                            </ul>
                            <button className={`w-full py-3 rounded-xl border ${borderColor} hover:bg-white/10 font-semibold transition-colors`}>Edit Tier</button>
                        </div>
                    ))}
                    <button className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed ${borderColor} hover:bg-white/5 transition-all gap-4 group text-gray-500 hover:text-orange-500 hover:border-orange-500`}>
                         <div className="w-16 h-16 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus size={32} />
                         </div>
                         <span className="font-bold">Create New Tier</span>
                    </button>
                </div>
            )}
            
            {activeTab === 'products' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {monetization.products.map(product => (
                         <div key={product.id} className={`${cardBg} rounded-3xl border ${borderColor} overflow-hidden hover:shadow-xl transition-all group`}>
                            <div className="relative aspect-[4/3]">
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-bold">
                                    {product.category}
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
                                    <span className="font-bold text-orange-500">${product.price}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>{product.sales} sales</span>
                                    <div className="flex items-center gap-1"><Star size={12} fill="currentColor" className="text-yellow-500"/> {product.rating}</div>
                                </div>
                                <button className={`w-full mt-4 py-2 rounded-xl border ${borderColor} hover:bg-white/5 font-medium text-sm`}>Manage Product</button>
                            </div>
                        </div>
                    ))}
                     <button onClick={onAddNewProductClick} className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed ${borderColor} hover:bg-white/5 transition-all gap-4 group text-gray-500 hover:text-orange-500 hover:border-orange-500 min-h-[300px]`}>
                         <div className="w-16 h-16 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus size={32} />
                         </div>
                         <span className="font-bold">Add New Product</span>
                    </button>
                </div>
            )}

            {/* Deposit Modal within Dashboard */}
            {showDepositModal && (
                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
                    <div className={`${cardBg} p-6 rounded-3xl border ${borderColor} w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200`}>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ArrowDownLeft className="text-orange-500"/> Buy Embers</h3>
                        <div className="mb-6">
                            <label className="block text-sm font-medium opacity-70 mb-2">Amount (USD)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold opacity-50">$</span>
                                <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className={`w-full pl-10 pr-4 py-4 text-xl font-bold rounded-2xl border ${borderColor} bg-transparent focus:outline-none focus:ring-2 ${currentTheme.ring}`} placeholder="0.00" />
                            </div>
                            <p className="text-xs mt-2 text-center opacity-60">You will receive {Number(depositAmount) * 10} Embers 🔥</p>
                        </div>
                         <div className="flex gap-3">
                            <button onClick={() => setShowDepositModal(false)} className={`flex-1 py-3 rounded-xl border ${borderColor} hover:bg-white/10 font-bold`}>Cancel</button>
                            <button onClick={() => {onUpdate({...monetization}); setShowDepositModal(false); alert(`Purchased ${Number(depositAmount) * 10} Embers for $${depositAmount}!`)}} className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600">Confirm Purchase</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- POST GRID ITEM ---
const PostGridItem: React.FC<{ post: Post, onViewPost: (p:Post) => void, currentTheme: Theme, textColor: string }> = ({ post, onViewPost, currentTheme, textColor }) => {
    const isMedia = post.media && post.media.length > 0;
    const isVideo = isMedia && post.media![0].type === 'video';
    const isMulti = isMedia && post.media!.length > 1;
    
    return (
        <div 
            onClick={() => onViewPost(post)}
            className={`group relative aspect-square rounded-3xl overflow-hidden cursor-pointer border border-white/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:z-10`}
        >
            {isMedia ? (
                <>
                    {post.media![0].type === 'image' ? (
                        <img src={post.media![0].url} alt="Post" className="w-full h-full object-cover" />
                    ) : (
                        <video src={post.media![0].url} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-3 right-3 flex gap-1">
                        {isVideo && <div className="p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white"><Play size={12} fill="currentColor"/></div>}
                        {isMulti && <div className="p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white"><Layers size={12} /></div>}
                    </div>
                </>
            ) : (
                <div className={`w-full h-full p-6 flex items-center justify-center bg-gradient-to-br ${currentTheme.from} ${currentTheme.to} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                    <p className="text-white font-semibold text-center line-clamp-5 relative z-10 text-sm sm:text-base shadow-sm">
                        "{post.content}"
                    </p>
                </div>
            )}
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3 text-white">
                <div className="flex gap-6 font-bold text-lg">
                    <span className="flex items-center gap-2"><Heart size={20} fill="white" /> {post.likes}</span>
                    <span className="flex items-center gap-2"><MessageSquare size={20} fill="white" /> {post.comments}</span>
                </div>
            </div>
            {post.isPaid && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-yellow-500/90 backdrop-blur-md text-white text-xs font-bold rounded-lg flex items-center gap-1">
                    <Lock size={10} /> VIP
                </div>
            )}
        </div>
    );
};

// --- COMMENT TIMELINE ITEM ---
const CommentTimelineItem: React.FC<{ comment: Comment, post: Post, onViewPost: (p:Post) => void, textColor: string, textSecondary: string, currentTheme: Theme, borderColor: string }> = ({ comment, post, onViewPost, textColor, textSecondary, currentTheme, borderColor }) => (
    <div className="flex gap-4 relative group">
        {/* Timeline Line */}
        <div className="absolute left-[1.25rem] top-10 bottom-0 w-0.5 bg-gradient-to-b from-gray-700 to-transparent group-last:hidden opacity-30"></div>
        
        <div className="flex-shrink-0 z-10">
            <AvatarDisplay avatar={comment.avatar} size="w-10 h-10" className="border-2 border-white dark:border-gray-900 shadow-sm" />
        </div>
        
        <div className="flex-1 pb-6">
            <div className="flex items-baseline justify-between mb-1">
                <p className={`font-bold text-sm ${textColor}`}>{comment.username}</p>
                <span className={`text-xs ${textSecondary}`}>{comment.time}</span>
            </div>
            
            <div className={`p-4 rounded-r-2xl rounded-bl-2xl bg-black/5 dark:bg-white/5 border ${borderColor} hover:border-gray-500 transition-colors`}>
                <p className={`${textColor} mb-3`}>{comment.text}</p>
                
                {/* Context Card */}
                <div 
                    onClick={() => onViewPost(post)}
                    className={`flex items-center gap-3 p-2 rounded-xl bg-black/5 dark:bg-black/20 cursor-pointer hover:bg-black/10 dark:hover:bg-black/40 transition-colors border border-transparent hover:border-gray-600`}
                >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700">
                         {post.media && post.media.length > 0 ? (
                             post.media[0].type === 'image' ? <img src={post.media[0].url} className="w-full h-full object-cover"/> : <video src={post.media[0].url} className="w-full h-full object-cover"/>
                         ) : (
                             <div className={`w-full h-full bg-gradient-to-br ${currentTheme.from} ${currentTheme.to} flex items-center justify-center text-white text-[8px]`}>TXT</div>
                         )}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-xs opacity-70 mb-0.5">Replied to {post.user}</p>
                        <p className={`text-xs font-medium ${textColor} truncate`}>{post.content}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- SCHEDULED POST ITEM ---
const ScheduledPostItem: React.FC<{ scheduledPost: ScheduledPost, onDelete: (id:number)=>void, borderColor: string, textColor: string, textSecondary: string, cardBg: string, currentTheme: Theme }> = ({ scheduledPost, onDelete, borderColor, textColor, textSecondary, cardBg, currentTheme }) => {
    const date = new Date(scheduledPost.scheduledTime);
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const isMedia = scheduledPost.postData.media && scheduledPost.postData.media.length > 0;

    return (
        <div className="flex gap-6 group">
             <div className="flex-shrink-0 flex flex-col items-center">
                 <div className={`w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/10 border ${borderColor} flex flex-col items-center justify-center`}>
                     <span className="text-xs font-bold text-red-500">{month}</span>
                     <span className={`text-xl font-bold ${textColor}`}>{day}</span>
                 </div>
                 <div className="w-0.5 h-full bg-gray-700 my-2 opacity-20 group-last:hidden"></div>
             </div>
             
             <div className={`flex-1 p-4 mb-6 rounded-2xl ${cardBg} border ${borderColor} relative overflow-hidden`}>
                  <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-lg">
                          <Clock size={12} /> Scheduled for {time}
                      </div>
                      <button onClick={() => onDelete(scheduledPost.scheduledId)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"><Trash2 size={16}/></button>
                  </div>
                  
                  <div className="flex gap-4">
                      {isMedia && (
                          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-black">
                              {scheduledPost.postData.media![0].type === 'image' ? 
                                <img src={scheduledPost.postData.media![0].url} className="w-full h-full object-cover"/> : 
                                <video src={scheduledPost.postData.media![0].url} className="w-full h-full object-cover"/>}
                          </div>
                      )}
                      <div>
                          <p className={`${textColor} line-clamp-2 font-medium`}>{scheduledPost.postData.content}</p>
                          <p className={`text-xs ${textSecondary} mt-2`}>{scheduledPost.postData.type === 'poll' ? 'Poll' : 'Post'} • {isMedia ? 'Has Media' : 'Text Only'}</p>
                      </div>
                  </div>
             </div>
        </div>
    );
}


interface ProfilePageProps {
    profileToDisplay: Profile;
    isOwnProfile: boolean;
    posts: Post[];
    scheduledPosts: ScheduledPost[];
    onDeleteScheduledPost: (scheduledId: number) => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onEditProfile: () => void;
    onFollow: (userId: number, username: string) => void;
    onFireFollowToggle: (userId: number) => void;
    isFireFollowed: boolean;
    onBlockToggle: (userId: number, username: string) => void;
    isFollowing: boolean;
    isBlocked: boolean;
    onShowFollowers: () => void;
    onShowFollowing: () => void;
    onViewPost: (post: Post) => void;
    onViewComments: (post: Post) => void;
    onViewHashtag: (tag: string) => void;
    onViewProfile: (username: string) => void;
    onViewAchievements: () => void;
    onViewTrophies: () => void;
    onViewStreaks: () => void;
    onPurchasePost: (postId: number) => void;
    onShowAddProductModal: () => void;
    onUpdateProfileMonetization?: (updatedMonetization: CreatorMonetization) => void;
    onTip: (amount: number) => void;
    onMessage: (user: Profile) => void;
    onPin?: (postId: number) => void;
    onFeature?: (postId: number) => void;
    onViewMyStore: () => void;
    onVisitStore?: () => void;
    onPlayGame?: (game: Game) => void;
    onOpenWallet?: (tab?: any) => void;
    allAchievements: Achievement[];
    // UI Props
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
    currentTheme: Theme;
}

const ProfilePage: React.FC<ProfilePageProps> = (props) => {
    const { profileToDisplay, isOwnProfile, posts, scheduledPosts, onDeleteScheduledPost, activeTab, onTabChange, onEditProfile, onFollow, onFireFollowToggle, isFireFollowed, onBlockToggle, isFollowing, isBlocked, onShowFollowers, onShowFollowing, onViewPost, onViewComments, onViewHashtag, onViewProfile, allAchievements, cardBg, textColor, textSecondary, borderColor, currentTheme, onViewAchievements, onViewTrophies, onViewStreaks, onPurchasePost, onShowAddProductModal, onUpdateProfileMonetization, onTip, onMessage, onPin, onFeature, onViewMyStore, onVisitStore, onPlayGame, onOpenWallet } = props;
    const [showProfileOptions, setShowProfileOptions] = useState(false);
    const optionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showProfileOptions && optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
                setShowProfileOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showProfileOptions]);

    const handleBadgeClick = (badge: string) => {
        switch (badge) {
            case '🏆': onViewTrophies(); break;
            case '⭐': onViewAchievements(); break;
            case '🔥': onViewStreaks(); break;
            default: break;
        }
    };
    
    const getLinkIcon = (iconName?: string) => {
        switch(iconName) {
            case 'github': return Github;
            case 'twitter': return Twitter;
            case 'linkedin': return Linkedin;
            case 'instagram': return Instagram;
            case 'facebook': return Facebook;
            case 'youtube': return Youtube;
            case 'twitch': return Twitch;
            case 'website': return Globe;
            case 'email': return Mail;
            default: return Link2;
        }
    };
    
    const userPosts = posts.filter(p => p.username === profileToDisplay.username);
    const hasFeatured = userPosts.some(p => p.isFeatured);
    const creatorGames = profileToDisplay.creatorMonetization?.games || [];

    const TABS = [
        { id: 'posts', label: 'Posts', icon: Grid },
        { id: 'comments', label: 'Comments', icon: MessageSquare },
        { id: 'media', label: 'Media', icon: ImageIcon },
    ];
    
    if (creatorGames.length > 0) {
        TABS.push({ id: 'games', label: 'Games', icon: Gamepad2 });
    }

    if (isOwnProfile || hasFeatured) {
        // Insert 'Featured' tab at the start or after posts
        TABS.splice(1, 0, { id: 'featured', label: 'Featured', icon: Sparkles });
    }
    
    if (isOwnProfile) {
        TABS.push({ id: 'bookmarks', label: 'Saved', icon: Star }); // Changed Bookmarks to Saved (Star icon is cleaner)
        TABS.push({ id: 'scheduled', label: 'Scheduled', icon: Calendar });
        if(profileToDisplay.isCreator) TABS.push({ id: 'monetization', label: 'Studio', icon: BarChart3 });
    }

    const mediaPosts = userPosts.filter(p => p.media && p.media.length > 0);
    const bookmarkedPosts = posts.filter(p => p.bookmarked);
    const userComments = posts
        .flatMap(post => (post.commentsData || []).map(comment => ({ comment, post })))
        .filter(({ comment }) => comment.username === profileToDisplay.username)
        .sort((a, b) => b.comment.id - a.comment.id);

    // Logic to display posts in the correct order (Pinned first for 'posts' tab)
    const displayPosts = useMemo(() => {
        if (activeTab === 'posts') {
            return [...userPosts].sort((a, b) => {
                if (a.isPinned === b.isPinned) return 0;
                return a.isPinned ? -1 : 1;
            });
        }
        if (activeTab === 'featured') {
            return userPosts.filter(p => p.isFeatured);
        }
        return userPosts;
    }, [userPosts, activeTab]);

    return (
        <div className="space-y-6">
            {/* --- Profile Header Card --- */}
            <div className={`${cardBg} backdrop-blur-xl rounded-3xl overflow-hidden border ${borderColor} shadow-lg`}>
                {/* Cover Photo */}
                <div className="h-56 relative bg-gray-800 group">
                    {profileToDisplay.coverPhoto ? (
                        <img src={profileToDisplay.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full" style={{ background: profileToDisplay.wallpaper }}></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    {isOwnProfile && <button onClick={onEditProfile} className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100"><Camera size={20} /></button>}
                </div>
                
                {/* Profile Info Area */}
                <div className="px-8 pb-8 relative">
                    {/* Avatar & Action Buttons Row */}
                    <div className="flex justify-between items-end -mt-16 mb-4">
                        <div className="relative">
                            <AvatarDisplay avatar={profileToDisplay.avatar} size="w-32 h-32" fontSize="text-7xl" className="bg-white dark:bg-gray-900 p-1.5 rounded-3xl shadow-2xl" />
                            {profileToDisplay.online && <div className="absolute bottom-2 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-900"></div>}
                        </div>
                        
                        <div className="flex items-center gap-3 pb-2">
                            {isOwnProfile ? (
                                <>
                                    <button onClick={onViewMyStore} className={`px-4 py-2.5 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2 hover:scale-105`}>
                                        <Store size={18} /> My Store
                                    </button>
                                    <button onClick={onEditProfile} className={`px-6 py-2.5 bg-white dark:bg-white/10 border ${borderColor} hover:bg-gray-50 dark:hover:bg-white/20 rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2`}>
                                        <Edit3 size={18} /> Edit Profile
                                    </button>
                                </>
                            ) : (
                                <>
                                    {isFollowing ? (
                                        <div className="flex gap-2">
                                            <button onClick={() => onFollow(profileToDisplay.id, profileToDisplay.username)} className={`px-6 py-2.5 rounded-xl font-semibold border ${borderColor} ${cardBg} hover:bg-white/10 transition-all shadow-sm`}>Following</button>
                                            <button onClick={() => onFireFollowToggle(profileToDisplay.id)} className={`p-2.5 rounded-xl border ${isFireFollowed ? 'bg-orange-500 text-white border-orange-500' : `${borderColor} text-gray-400 hover:text-orange-500 hover:border-orange-500`} transition-all shadow-sm`} title="FireFollow">
                                                <Flame size={20} fill={isFireFollowed ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => onFollow(profileToDisplay.id, profileToDisplay.username)} className={`px-8 py-2.5 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all`}>Follow</button>
                                    )}
                                    
                                    {profileToDisplay.isCreator && onVisitStore && (
                                        <button 
                                            onClick={onVisitStore}
                                            className={`px-4 py-2.5 rounded-xl font-semibold border ${borderColor} ${cardBg} hover:bg-white/10 transition-all shadow-sm flex items-center gap-2`}
                                        >
                                            <Store size={18} />
                                            <span className="hidden sm:inline">Visit Shop</span>
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => onMessage(profileToDisplay)} 
                                        className={`px-4 py-2.5 rounded-xl font-semibold border ${borderColor} ${cardBg} hover:bg-white/10 transition-all shadow-sm flex items-center gap-2`}
                                    >
                                        <Mail size={18} />
                                        <span className="hidden sm:inline">Message</span>
                                    </button>

                                    <div className="relative" ref={optionsRef}>
                                        <button onClick={() => setShowProfileOptions(s => !s)} className={`p-2.5 rounded-xl border ${borderColor} ${cardBg} hover:bg-white/10 transition-all`}><MoreHorizontal size={20} /></button>
                                        {showProfileOptions && (
                                            <div className={`absolute right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl border ${borderColor} shadow-xl w-48 z-20 overflow-hidden py-1`}>
                                                <button onClick={() => { onBlockToggle(profileToDisplay.id, profileToDisplay.username); setShowProfileOptions(false); }} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500">
                                                    <UserMinus size={16} /> <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                                                </button>
                                                <button onClick={() => { alert('Reported'); setShowProfileOptions(false); }} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800">
                                                    <AlertTriangle size={16} /> <span>Report</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Name & Bio */}
                    <div className="mb-6">
                        <h1 className={`text-3xl font-bold ${textColor} flex items-center gap-2`}>
                            {profileToDisplay.name}
                            {profileToDisplay.verified && <div className="bg-blue-500 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-[10px]">✓</div>}
                        </h1>
                        <p className={`${textSecondary} font-medium text-lg`}>{profileToDisplay.username}</p>
                        {profileToDisplay.category && <span className={`inline-block px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-xs font-bold mt-2 ${currentTheme.text}`}>{profileToDisplay.category}</span>}
                        
                        <p className={`mt-4 ${textColor} max-w-2xl leading-relaxed whitespace-pre-wrap`}>{profileToDisplay.bio}</p>
                        
                        {/* Links & Location */}
                        <div className={`flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm ${textSecondary}`}>
                            {profileToDisplay.location && <div className="flex items-center gap-1.5"><MapPin size={16} /> {profileToDisplay.location}</div>}
                            {profileToDisplay.website && <a href={profileToDisplay.website} target="_blank" rel="noreferrer" className={`flex items-center gap-1.5 hover:${currentTheme.text} transition-colors`}><Link2 size={16} /> {profileToDisplay.website.replace(/^https?:\/\//, '')}</a>}
                            {profileToDisplay.work && <div className="flex items-center gap-1.5"><Briefcase size={16} /> {profileToDisplay.work}</div>}
                             {profileToDisplay.links && profileToDisplay.links.map(link => {
                                const Icon = getLinkIcon(link.icon);
                                return (
                                    <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className={`flex items-center gap-1.5 hover:${currentTheme.text} transition-colors`}>
                                        <Icon size={16} /> {link.title}
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex gap-8 border-t border-b border-gray-200 dark:border-white/10 py-4 mb-6">
                        <div className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                            <span className={`block font-bold text-xl ${textColor}`}>{profileToDisplay.posts}</span>
                            <span className={`text-sm ${textSecondary}`}>Posts</span>
                        </div>
                        <button onClick={onShowFollowers} className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                            <span className={`block font-bold text-xl ${textColor}`}>{profileToDisplay.followers.toLocaleString()}</span>
                            <span className={`text-sm ${textSecondary}`}>Followers</span>
                        </button>
                        <button onClick={onShowFollowing} className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                            <span className={`block font-bold text-xl ${textColor}`}>{profileToDisplay.following.toLocaleString()}</span>
                            <span className={`text-sm ${textSecondary}`}>Following</span>
                        </button>
                         <div className="text-center cursor-pointer hover:opacity-80 transition-opacity ml-auto" onClick={onViewStreaks}>
                            <span className={`block font-bold text-xl bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent flex items-center gap-1`}>
                                {profileToDisplay.streak} <Zap size={18} className="text-orange-500" fill="currentColor" />
                            </span>
                            <span className={`text-sm ${textSecondary}`}>Day Streak</span>
                        </div>
                    </div>
                    
                    {/* Badges & Tip Jar */}
                    <div className="flex flex-col md:flex-row gap-6">
                         {profileToDisplay.badges.length > 0 && (
                            <div className="flex-1">
                                <h4 className={`text-sm font-bold ${textSecondary} mb-2 uppercase tracking-wider`}>Achievements</h4>
                                <div className="flex gap-2">
                                    {profileToDisplay.badges.map((badge, i) => (
                                        <button key={i} onClick={() => handleBadgeClick(badge)} className={`text-2xl w-12 h-12 flex items-center justify-center ${cardBg} border ${borderColor} rounded-2xl hover:scale-110 transition-transform shadow-sm`}>
                                            {badge}
                                        </button>
                                    ))}
                                </div>
                            </div>
                         )}
                         {!isOwnProfile && profileToDisplay.creatorMonetization?.tipJar?.enabled && (
                             <div className="flex-1">
                                <TipJarComponent tipJar={profileToDisplay.creatorMonetization.tipJar} onTip={onTip} currentTheme={currentTheme} cardBg={cardBg} borderColor={borderColor} />
                             </div>
                         )}
                    </div>
                </div>
            </div>

            {/* --- Sticky Tab Navigation --- */}
            <div className="sticky top-4 z-30 -mx-2 sm:mx-0 mb-6">
                 <div className={`${cardBg} backdrop-blur-xl rounded-[2rem] border ${borderColor} shadow-lg py-2 px-2 sm:px-4`}>
                    <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar px-2 sm:justify-center pb-1 pt-1 snap-x">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`group flex flex-col items-center gap-1 flex-shrink-0 transition-all duration-300 snap-center outline-none`}
                                >
                                    <div className={`
                                        relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500
                                        ${isActive 
                                            ? `text-white shadow-md scale-110` 
                                            : `${textSecondary} bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:scale-105`
                                        }
                                    `}>
                                        {isActive && (
                                            <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${currentTheme.from} ${currentTheme.to} opacity-100`} />
                                        )}
                                        <tab.icon size={16} className="relative z-10" strokeWidth={isActive ? 2.5 : 2} />
                                        
                                    </div>
                                    <span className={`text-[10px] sm:text-xs font-bold tracking-wide transition-all duration-300 ${isActive ? `${textColor} scale-105` : `${textSecondary} group-hover:${textColor}`}`}>
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                 </div>
            </div>

            {/* --- Tab Content Area --- */}
            <div className="min-h-[400px]">
                {(activeTab === 'posts' || activeTab === 'featured') && (
                    displayPosts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {displayPosts.map(post => (
                                <PostGridItem key={post.id} post={post} onViewPost={onViewPost} currentTheme={currentTheme} textColor={textColor} />
                            ))}
                        </div>
                    ) : <EmptyState icon={activeTab === 'featured' ? Sparkles : Grid} text={activeTab === 'featured' ? "No featured posts yet" : "No posts yet"} textSecondary={textSecondary} />
                )}

                {activeTab === 'comments' && (
                    <div className="space-y-6 relative pl-4">
                         {userComments.length > 0 ? (
                            userComments.map(({ comment, post }) => (
                                <CommentTimelineItem key={comment.id} comment={comment} post={post} onViewPost={onViewPost} textColor={textColor} textSecondary={textSecondary} currentTheme={currentTheme} borderColor={borderColor} />
                            ))
                        ) : <EmptyState icon={MessageSquare} text="No comments yet" textSecondary={textSecondary} />}
                    </div>
                )}

                {activeTab === 'media' && (
                     mediaPosts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {mediaPosts.map(post => (
                                <PostGridItem key={post.id} post={post} onViewPost={onViewPost} currentTheme={currentTheme} textColor={textColor} />
                            ))}
                        </div>
                    ) : <EmptyState icon={ImageIcon} text="No media shared yet" textSecondary={textSecondary} />
                )}

                {activeTab === 'games' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {creatorGames.map(game => (
                            <div key={game.id} className={`${cardBg} rounded-2xl border ${borderColor} overflow-hidden group flex flex-col`}>
                                <div className="aspect-video bg-black relative overflow-hidden">
                                    <img src={game.previewImage} alt={game.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            onClick={() => onPlayGame && onPlayGame(game)}
                                            className={`px-6 py-2 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2`}
                                        >
                                            <Play size={16} fill="currentColor" /> Play
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className={`font-bold text-lg ${textColor}`}>{game.title}</h3>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Play size={12} /> {game.playCount.toLocaleString()} Plays</span>
                                        {isOwnProfile && (
                                            <span className="flex items-center gap-1 text-orange-500"><Flame size={12} fill="currentColor" /> {game.earnings.toLocaleString()} Earned</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {creatorGames.length === 0 && <EmptyState icon={Gamepad2} text="No games created yet" textSecondary={textSecondary} />}
                    </div>
                )}

                {activeTab === 'bookmarks' && isOwnProfile && (
                    bookmarkedPosts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {bookmarkedPosts.map(post => (
                                <PostGridItem key={post.id} post={post} onViewPost={onViewPost} currentTheme={currentTheme} textColor={textColor} />
                            ))}
                        </div>
                    ) : <EmptyState icon={Star} text="No saved posts" textSecondary={textSecondary} />
                )}

                {activeTab === 'scheduled' && isOwnProfile && (
                    <div className="space-y-6">
                         {scheduledPosts.length > 0 ? (
                            scheduledPosts.map(sp => (
                                <ScheduledPostItem 
                                    key={sp.scheduledId} 
                                    scheduledPost={sp} 
                                    onDelete={onDeleteScheduledPost} 
                                    borderColor={borderColor}
                                    textColor={textColor}
                                    textSecondary={textSecondary}
                                    cardBg={cardBg}
                                    currentTheme={currentTheme}
                                />
                            ))
                        ) : <EmptyState icon={Calendar} text="No scheduled posts" textSecondary={textSecondary} />}
                    </div>
                )}

                {activeTab === 'monetization' && isOwnProfile && profileToDisplay.creatorMonetization && (
                    <CreatorMonetizationDashboard 
                        monetization={profileToDisplay.creatorMonetization} 
                        onUpdate={onUpdateProfileMonetization || (() => {})} 
                        currentTheme={currentTheme} 
                        cardBg={cardBg} 
                        borderColor={borderColor} 
                        textColor={textColor} 
                        textSecondary={textSecondary} 
                        onAddNewProductClick={onShowAddProductModal}
                        emberBalance={profileToDisplay.emberBalance || 0}
                        onOpenWallet={onOpenWallet}
                    />
                )}
            </div>
        </div>
    );
}

const EmptyState = ({ icon: Icon, text, textSecondary }: { icon: any, text: string, textSecondary: string }) => (
    <div className="flex flex-col items-center justify-center py-16 opacity-60">
        <div className="p-6 rounded-full bg-black/5 dark:bg-white/5 mb-4">
            <Icon size={48} className={textSecondary} />
        </div>
        <p className={`${textSecondary} text-lg font-medium`}>{text}</p>
    </div>
);

export default ProfilePage;


import React, { useState } from 'react';
import { ArrowLeft, Package, Palette, BarChart2, Tag, Share2, Plus, Edit2, Trash2, Eye, DollarSign, UploadCloud, Layout, LayoutGrid, List, Check, Copy, Users, TrendingUp, MousePointer2, ExternalLink, Star, ShoppingBag } from 'lucide-react';
import { Profile, Product, Theme, Promotion } from '../types';
import AvatarDisplay from './AvatarDisplay';

interface MyStorePageProps {
    profile: Profile;
    userProducts: Product[];
    onBack: () => void;
    onAddProduct: () => void;
    onUpdateStoreConfig: (config: any) => void;
    onDeleteProduct: (productId: string) => void;
    onUpdateProfile: (profile: Profile) => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const MyStorePage: React.FC<MyStorePageProps> = (props) => {
    const { profile, userProducts, onBack, onAddProduct, onUpdateStoreConfig, onDeleteProduct, onUpdateProfile, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;
    
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'storefront' | 'promotions' | 'affiliate'>('overview');
    
    // --- Mock Data for Analytics ---
    const analytics = {
        views: 12500,
        sales: 142,
        revenue: 3550,
        conversion: 2.4
    };

    // --- Affiliate State ---
    const affiliateProducts = [
        { id: 'af1', name: 'Pro Editing Pack', commission: 20, earnings: 150, clicks: 450, category: 'Digital' },
        { id: 'af2', name: 'Masterclass: React', commission: 30, earnings: 900, clicks: 1200, category: 'Course' },
    ];

    // --- Promotions State ---
    const [newCode, setNewCode] = useState('');
    const [newDiscount, setNewDiscount] = useState('');
    
    const handleCreatePromotion = () => {
        if (!newCode || !newDiscount) return;
        const newPromo: Promotion = {
            id: Date.now().toString(),
            code: newCode.toUpperCase(),
            discountPercent: Number(newDiscount),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
            active: true
        };
        const updatedPromos = [...(profile.promotions || []), newPromo];
        onUpdateProfile({ ...profile, promotions: updatedPromos });
        setNewCode('');
        setNewDiscount('');
    };

    // --- Share Preview State ---
    const [shareProduct, setShareProduct] = useState<Product | null>(null);

    // COMPACT StatCard
    const StatCard = ({ label, value, icon: Icon, trend, colorClass }: { label: string, value: string, icon: any, trend?: string, colorClass: string }) => (
        <div className={`${cardBg} p-3 rounded-xl border ${borderColor} flex items-center justify-between group hover:bg-white/5 transition-all`}>
            <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5 ${textSecondary}`}>{label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-xl font-bold">{value}</h3>
                    {trend && <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full">{trend}</span>}
                </div>
            </div>
            <div className={`p-2 rounded-lg bg-current bg-opacity-10 ${colorClass}`}>
                <Icon size={18} />
            </div>
        </div>
    );

    const renderOverview = () => (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Revenue" value={`$${analytics.revenue.toLocaleString()}`} icon={DollarSign} trend="+12%" colorClass="text-green-500" />
                <StatCard label="Views" value={analytics.views.toLocaleString()} icon={Eye} trend="+5%" colorClass="text-blue-500" />
                <StatCard label="Sales" value={analytics.sales.toString()} icon={Package} trend="+8%" colorClass="text-purple-500" />
                <StatCard label="Conv." value={`${analytics.conversion}%`} icon={TrendingUp} trend="+1%" colorClass="text-orange-500" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className={`${cardBg} lg:col-span-2 p-4 rounded-2xl border ${borderColor}`}>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-base font-bold">Recent Sales</h3>
                        <button className={`text-xs font-bold ${currentTheme.text}`}>View All</button>
                    </div>
                    <div className="space-y-1">
                        {[1, 2, 3, 4].map((_, i) => (
                            <div key={i} className={`flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors text-sm`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentTheme.from} ${currentTheme.to} flex items-center justify-center text-white text-xs font-bold opacity-80`}>
                                        $
                                    </div>
                                    <div>
                                        <p className="font-semibold">Abstract Gradient Pack</p>
                                        <p className={`text-[10px] ${textSecondary}`}>@alexrivera • 2h ago</p>
                                    </div>
                                </div>
                                <span className="font-bold text-green-500 text-xs">+$49.00</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                 <div className={`${cardBg} p-4 rounded-2xl border ${borderColor} flex flex-col items-center text-center justify-center`}>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-600 flex items-center justify-center text-white mb-3 shadow-lg">
                        <Share2 size={20} />
                    </div>
                    <h3 className="text-sm font-bold mb-1">Boost Traffic</h3>
                    <p className={`text-[10px] ${textSecondary} mb-3`}>Share your store link to increase sales.</p>
                    <button 
                        onClick={() => setActiveTab('affiliate')} 
                        className={`w-full py-2 rounded-lg text-xs font-bold bg-white text-black hover:bg-gray-200 transition-all`}
                    >
                        Promote Now
                    </button>
                </div>
            </div>
        </div>
    );

    const renderProducts = () => (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Inventory</h3>
                <button onClick={onAddProduct} className={`flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-lg text-xs font-bold hover:shadow-md transition-all`}>
                    <Plus size={14} /> Add
                </button>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
                {userProducts.map(product => (
                    <div key={product.id} className={`${cardBg} p-2 rounded-xl border ${borderColor} flex items-center gap-3 group hover:border-gray-500 transition-all`}>
                        <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-black/20" />
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                                <h4 className="font-bold text-sm truncate">{product.name}</h4>
                                <span className={`font-bold text-sm ${currentTheme.text}`}>${product.price}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                <span className="bg-white/10 px-1.5 rounded text-[9px] uppercase">{product.category}</span>
                                <span className="flex items-center gap-0.5"><Star size={10} className="text-yellow-400" fill="currentColor"/> {product.rating}</span>
                                <span>{product.sales} Sales</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => setShareProduct(product)} className={`p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500`} title="Promote"><Share2 size={14} /></button>
                            <button className={`p-1.5 rounded-lg hover:bg-white/10`} title="Edit"><Edit2 size={14} /></button>
                            <button onClick={() => onDeleteProduct(product.id)} className={`p-1.5 rounded-lg hover:bg-red-500/10 text-red-500`} title="Delete"><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
                {userProducts.length === 0 && (
                    <div className={`text-center py-10 rounded-xl border-2 border-dashed ${borderColor} bg-black/5`}>
                        <Package size={32} className={`mx-auto mb-2 ${textSecondary} opacity-50`} />
                        <p className={`text-sm ${textSecondary}`}>No products yet.</p>
                    </div>
                )}
            </div>

            {/* Share Preview Modal */}
            {shareProduct && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setShareProduct(null)}>
                    <div className={`${cardBg} p-4 rounded-2xl border ${borderColor} max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200`} onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-3">
                             <h3 className="text-base font-bold">Promote Product</h3>
                             <button onClick={() => setShareProduct(null)}><ArrowLeft className="rotate-180" size={18} /></button>
                        </div>
                        
                        <div className="bg-black/20 p-3 rounded-xl mb-4 border border-white/5">
                             <div className="flex items-center gap-2 mb-2">
                                 <AvatarDisplay avatar={profile.avatar} size="w-8 h-8" />
                                 <div>
                                     <p className="font-bold text-xs">{profile.name}</p>
                                     <p className="text-[10px] text-gray-400">Just now</p>
                                 </div>
                             </div>
                             <div className="rounded-lg overflow-hidden border border-white/10 bg-black/40 aspect-video relative">
                                 <img src={shareProduct.images[0]} className="w-full h-full object-cover" />
                                 <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                                     <p className="font-bold text-white text-sm">{shareProduct.name}</p>
                                     <p className="text-xs text-gray-200">${shareProduct.price}</p>
                                 </div>
                             </div>
                        </div>
                        
                        <button className={`w-full py-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-xl font-bold text-sm shadow-lg`}>
                             Post to Feed
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    const renderStorefront = () => (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className={`${cardBg} p-4 rounded-2xl border ${borderColor}`}>
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Palette size={16} /> Branding</h3>
                <div className="flex gap-4">
                     <div className={`w-1/3 aspect-[3/1] rounded-xl bg-black/20 relative overflow-hidden group cursor-pointer border border-dashed ${borderColor} flex items-center justify-center`}>
                        {profile.storeConfig?.banner ? (
                            <img src={profile.storeConfig.banner} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center">
                                <UploadCloud size={20} className={textSecondary} />
                                <span className="text-[10px] mt-1 text-gray-500">Banner</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                         <label className={`block text-xs font-bold ${textSecondary} mb-2 uppercase`}>Accent</label>
                        <div className="flex gap-2">
                            {['#f97316', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#ef4444'].map(c => (
                                <button key={c} onClick={() => onUpdateStoreConfig({ ...profile.storeConfig, themeColor: c })} className={`w-6 h-6 rounded-full border ${profile.storeConfig?.themeColor === c ? 'border-white ring-1 ring-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

             <div className={`${cardBg} p-4 rounded-2xl border ${borderColor}`}>
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Layout size={16} /> Layout</h3>
                <div className="flex gap-3">
                    <button onClick={() => onUpdateStoreConfig({ ...profile.storeConfig, layout: 'grid' })} className={`flex-1 p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${profile.storeConfig?.layout === 'grid' ? `bg-white/10 border-white/30` : `border-transparent hover:bg-white/5`}`}>
                        <LayoutGrid size={16} /> Grid
                    </button>
                    <button onClick={() => onUpdateStoreConfig({ ...profile.storeConfig, layout: 'list' })} className={`flex-1 p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${profile.storeConfig?.layout === 'list' ? `bg-white/10 border-white/30` : `border-transparent hover:bg-white/5`}`}>
                        <List size={16} /> List
                    </button>
                </div>
            </div>
        </div>
    );

    const renderPromotions = () => (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Compact Coupon Creation */}
             <div className={`${cardBg} p-4 rounded-2xl border ${borderColor}`}>
                <h3 className="text-sm font-bold mb-3">New Coupon</h3>
                <div className="flex gap-2">
                     <div className="relative flex-1">
                         <input 
                            type="text" 
                            value={newCode} 
                            onChange={e => setNewCode(e.target.value)} 
                            placeholder="CODE" 
                            className={`w-full pl-8 pr-2 py-2 rounded-lg bg-black/20 border ${borderColor} focus:outline-none focus:ring-1 ${currentTheme.ring} uppercase font-mono text-sm font-bold`} 
                        />
                        <Tag size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"/>
                    </div>
                     <div className="relative w-24">
                         <input 
                            type="number" 
                            value={newDiscount} 
                            onChange={e => setNewDiscount(e.target.value)} 
                            placeholder="%" 
                            className={`w-full pl-2 pr-6 py-2 rounded-lg bg-black/20 border ${borderColor} focus:outline-none focus:ring-1 ${currentTheme.ring} font-bold text-sm text-center`} 
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                    </div>
                    <button 
                        onClick={handleCreatePromotion} 
                        disabled={!newCode || !newDiscount}
                        className={`px-4 py-2 rounded-lg font-bold bg-white text-black hover:bg-gray-200 disabled:opacity-50 text-xs transition-all`}
                    >
                        Create
                    </button>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(profile.promotions || []).map(promo => (
                    <div key={promo.id} className="relative flex items-center justify-between p-3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-white/10 overflow-hidden group">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full -ml-1"></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full -mr-1"></div>
                        
                        <div>
                            <span className="font-mono text-lg font-bold tracking-wider text-white">{promo.code}</span>
                            <p className="text-[10px] text-gray-400">Exp: {new Date(promo.expiresAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-black text-green-400">-{promo.discountPercent}%</span>
                            <button className="text-gray-600 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
                {(!profile.promotions || profile.promotions.length === 0) && (
                    <div className="col-span-full text-center py-8 border-2 border-dashed border-white/10 rounded-xl">
                        <p className={`text-xs ${textSecondary}`}>No active coupons.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderAffiliate = () => (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex gap-3">
                 <div className={`${cardBg} flex-1 p-3 rounded-xl border ${borderColor}`}>
                    <div className="flex items-center gap-1 mb-1 text-green-500"><DollarSign size={14}/> <span className="font-bold text-[10px] uppercase">Earnings</span></div>
                    <p className="text-xl font-black">$1,050</p>
                </div>
                 <div className={`${cardBg} flex-1 p-3 rounded-xl border ${borderColor}`}>
                    <div className="flex items-center gap-1 mb-1 text-blue-500"><MousePointer2 size={14}/> <span className="font-bold text-[10px] uppercase">Clicks</span></div>
                    <p className="text-xl font-black">1,650</p>
                </div>
            </div>

            <div className={`${cardBg} rounded-2xl border ${borderColor} overflow-hidden`}>
                <table className="w-full text-left">
                    <thead className="bg-black/20 text-xs text-gray-400 uppercase tracking-wider">
                        <tr>
                            <th className="p-3 font-semibold">Product</th>
                            <th className="p-3 font-semibold text-center">Comm.</th>
                            <th className="p-3 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {affiliateProducts.map(prod => (
                            <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-3">
                                    <p className="font-bold text-xs">{prod.name}</p>
                                    <span className="text-[9px] bg-white/10 px-1 rounded">{prod.category}</span>
                                </td>
                                <td className="p-3 text-center text-green-400 font-bold">{prod.commission}%</td>
                                <td className="p-3 text-right">
                                    <button className={`p-1.5 rounded-lg hover:bg-white/10 inline-flex`} title="Copy Link">
                                        <Copy size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`flex items-center justify-center p-3 rounded-xl transition-all ${activeTab === id ? `bg-gradient-to-br ${currentTheme.from} ${currentTheme.to} text-white shadow-md` : `${textSecondary} hover:bg-white/5`}`}
            title={label}
        >
            <Icon size={20} />
        </button>
    );

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4 font-sans max-w-5xl mx-auto">
            {/* Compact Sidebar */}
            <aside className={`md:w-20 flex md:flex-col gap-2 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} p-2 sticky top-0 z-10 justify-between order-2 md:order-1`}>
                 <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible no-scrollbar w-full">
                    <TabButton id="overview" label="Overview" icon={BarChart2} />
                    <TabButton id="products" label="Products" icon={Package} />
                    <TabButton id="storefront" label="Storefront" icon={Palette} />
                    <TabButton id="promotions" label="Promotions" icon={Tag} />
                    <TabButton id="affiliate" label="Affiliate" icon={Users} />
                 </div>
                 
                 <div className="hidden md:flex flex-col gap-2 mt-auto pt-2 border-t border-white/10">
                     <button onClick={onBack} className="p-3 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Exit"><ArrowLeft size={20} /></button>
                 </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 ${cardBg} backdrop-blur-xl rounded-3xl border ${borderColor} p-5 overflow-y-auto order-1 md:order-2 relative`}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-black capitalize">{activeTab}</h2>
                         <p className={`text-xs ${textSecondary}`}>Manage your store {activeTab}.</p>
                    </div>
                    <div className="flex items-center gap-3">
                         <button className="text-xs font-bold bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-lg transition-colors border border-white/5 flex items-center gap-1">
                            <ExternalLink size={12} /> Live
                         </button>
                         <AvatarDisplay avatar={profile.avatar} size="w-8 h-8" />
                    </div>
                </div>
                
                 {activeTab === 'overview' && renderOverview()}
                 {activeTab === 'products' && renderProducts()}
                 {activeTab === 'storefront' && renderStorefront()}
                 {activeTab === 'promotions' && renderPromotions()}
                 {activeTab === 'affiliate' && renderAffiliate()}

            </main>
        </div>
    );
};

export default MyStorePage;

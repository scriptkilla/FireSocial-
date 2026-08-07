
import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, Star, Search, Store } from 'lucide-react';
import { Profile, Product, Theme } from '../types';
import AvatarDisplay from './AvatarDisplay';

interface PublicStorePageProps {
    storeOwner: Profile;
    products: Product[];
    onBack: () => void;
    onViewProduct: (product: Product) => void;
    onAddToCart: (product: Product) => void;
    onOpenCart: () => void;
    cartItemCount: number;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const PublicStorePage: React.FC<PublicStorePageProps> = (props) => {
    const { storeOwner, products, onBack, onViewProduct, onAddToCart, onOpenCart, cartItemCount, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;
    const [searchQuery, setSearchQuery] = useState('');

    // Default config if missing
    const storeConfig = storeOwner.storeConfig || {
        banner: '',
        themeColor: '#f97316', // Orange default
        layout: 'grid',
        welcomeMessage: `Welcome to ${storeOwner.name}'s Store!`
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 min-h-[80vh]">
            {/* Header Section */}
            <div className={`relative rounded-3xl overflow-hidden border ${borderColor} shadow-2xl`}>
                {/* Banner */}
                <div className="h-48 md:h-64 bg-gray-800 relative">
                    {storeConfig.banner ? (
                        <img src={storeConfig.banner} alt="Store Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center`}>
                            <Store size={64} className="text-white/10" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    {/* Navigation Buttons */}
                    <div className="absolute top-4 left-4">
                        <button onClick={onBack} className="p-2 bg-black/30 backdrop-blur-md text-white rounded-full hover:bg-black/50 transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                    </div>
                    <div className="absolute top-4 right-4">
                        <button onClick={onOpenCart} className="relative p-3 bg-black/30 backdrop-blur-md text-white rounded-full hover:bg-black/50 transition-colors">
                            <ShoppingBag size={20} />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center border-2 border-white dark:border-gray-900">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Store Owner Info */}
                <div className={`${cardBg} backdrop-blur-xl p-6 md:p-8 relative`}>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 -mt-16 relative z-10">
                        <div className="relative">
                            <AvatarDisplay avatar={storeOwner.avatar} size="w-24 h-24 md:w-32 md:h-32" fontSize="text-5xl" className="border-4 border-white dark:border-gray-900 shadow-xl" />
                            <div className="absolute bottom-1 right-1 bg-white dark:bg-gray-900 rounded-full p-1.5 border border-gray-200 dark:border-gray-700">
                                <Store size={16} style={{ color: storeConfig.themeColor }} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h1 className={`text-3xl font-bold ${textColor}`}>{storeOwner.name}'s Store</h1>
                            <p className={`${textSecondary} text-lg mt-1`}>{storeConfig.welcomeMessage}</p>
                        </div>
                        
                        {/* Search */}
                        <div className="w-full md:w-auto relative mt-4 md:mt-0">
                            <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full md:w-64 pl-10 pr-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border ${borderColor} ${textColor} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                                style={{ '--tw-ring-color': storeConfig.themeColor } as React.CSSProperties}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <div 
                            key={product.id} 
                            className={`group ${cardBg} backdrop-blur-sm rounded-2xl border ${borderColor} overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                        >
                            <div className="relative aspect-square cursor-pointer" onClick={() => onViewProduct(product)}>
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold">
                                    {product.category}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className={`font-bold text-lg mb-1 truncate ${textColor}`}>{product.name}</h3>
                                <div className="flex items-center gap-1 text-sm text-yellow-500 mb-3">
                                    <Star size={14} fill="currentColor" />
                                    <span className={`font-medium ${textSecondary}`}>{product.rating} ({product.sales})</span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-2xl font-bold" style={{ color: storeConfig.themeColor }}>${product.price}</span>
                                    <button 
                                        onClick={() => onAddToCart(product)}
                                        className="px-4 py-2 rounded-xl font-semibold text-white text-sm shadow-md hover:opacity-90 transition-opacity flex items-center gap-2"
                                        style={{ backgroundColor: storeConfig.themeColor }}
                                    >
                                        <ShoppingBag size={16} /> Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={`col-span-full py-20 text-center ${textSecondary}`}>
                        <Store size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-semibold">No products found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicStorePage;

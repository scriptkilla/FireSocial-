






import React, { useState, useMemo } from 'react';
import { Product, Theme } from '../types';
import { Search, ShoppingBag, Plus, Store } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';

interface MarketplacePageProps {
    products: Product[];
    onViewProduct: (product: Product) => void;
    onViewProfile: (username: string) => void;
    onAddToCart: (product: Product) => void;
    onOpenCart: () => void;
    onOpenMyStore: () => void;
    cartItemCount: number;
    textColor: string;
    textSecondary: string;
    cardBg: string;
    borderColor: string;
    currentTheme: Theme;
}

const CATEGORIES: (Product['category'] | 'All')[] = ['All', 'Physical', 'Digital', 'Service', 'Rental', 'Experience'];
const SORT_OPTIONS = ['Newest', 'Popular', 'Price: High to Low', 'Price: Low to High'];

const MarketplacePage: React.FC<MarketplacePageProps> = (props) => {
    const { products, onViewProduct, onViewProfile, onAddToCart, onOpenCart, onOpenMyStore, cartItemCount, textColor, textSecondary, cardBg, borderColor, currentTheme } = props;
    
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState<(Product['category'] | 'All')>('All');
    const [sortBy, setSortBy] = useState('Newest');

    const filteredAndSortedProducts = useMemo(() => {
        let items = [...products];

        // Filter by category
        if (category !== 'All') {
            items = items.filter(p => p.category === category);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            items = items.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.description.toLowerCase().includes(lowerQuery) ||
                p.creatorUsername.toLowerCase().includes(lowerQuery)
            );
        }

        // Sort
        switch (sortBy) {
            case 'Popular':
                items.sort((a, b) => b.sales - a.sales);
                break;
            case 'Price: High to Low':
                items.sort((a, b) => b.price - a.price);
                break;
            case 'Price: Low to High':
                items.sort((a, b) => a.price - b.price);
                break;
            case 'Newest':
            default:
                // This is a simple sort, a real app would use timestamps
                items.reverse();
                break;
        }

        return items;
    }, [products, searchQuery, category, sortBy]);

    return (
        <div className="space-y-6">
            <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-3xl font-bold ${textColor}`}>FireShop</h2>
                    <div className="flex gap-3">
                        <button 
                            onClick={onOpenMyStore}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${borderColor} ${textSecondary} hover:${textColor} hover:bg-white/5 transition-all font-semibold`}
                        >
                            <Store size={20} />
                            <span className="hidden sm:inline">My Store</span>
                        </button>
                        <button 
                            onClick={onOpenCart}
                            className={`relative p-3 rounded-xl bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white shadow-lg hover:scale-105 transition-transform`}
                        >
                            <ShoppingBag size={20} />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center border-2 border-white dark:border-gray-900">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                        <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`w-full pl-12 pr-4 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} ${textColor} placeholder-gray-400 focus:outline-none focus:ring-2 ${currentTheme.ring}`} />
                    </div>
                    <div className="flex gap-4">
                        <select value={category} onChange={e => setCategory(e.target.value as any)} className={`px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring} appearance-none`}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                         <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={`px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring} appearance-none`}>
                            {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredAndSortedProducts.map(product => (
                    <div key={product.id} className={`group ${cardBg} backdrop-blur-xl rounded-3xl border ${borderColor} shadow-lg overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-2`}>
                        <div className="relative aspect-square cursor-pointer" onClick={() => onViewProduct(product)}>
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                                    className="p-2 bg-white/90 backdrop-blur-sm text-black rounded-full shadow-lg hover:scale-110 transition-transform"
                                    title="Add to Cart"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">View Details</span>
                            </div>
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                            <h3 className={`font-bold ${textColor} flex-grow`}>{product.name}</h3>
                            <div className="flex justify-between items-center mt-2">
                                <span className={`text-xl font-bold bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent`}>${product.price}</span>
                                <button onClick={() => onViewProfile(product.creatorUsername)} className="flex items-center gap-2 group/avatar">
                                    <AvatarDisplay avatar={product.creatorAvatar} size="w-8 h-8" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             {filteredAndSortedProducts.length === 0 && (
                <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-12 border ${borderColor} shadow-lg text-center`}>
                    <p className={`${textColor} font-semibold text-lg`}>No products found</p>
                    <p className={textSecondary}>Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
};

export default MarketplacePage;
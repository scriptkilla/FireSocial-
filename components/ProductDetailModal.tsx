
import React, { useState } from 'react';
import { Product, Theme, Profile } from '../types';
import { X, ChevronLeft, ChevronRight, Star, ShoppingCart } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';

interface ProductDetailModalProps {
    product: Product;
    onClose: () => void;
    profile: Profile;
    onViewProfile: (username: string) => void;
    onAddToCart: (product: Product) => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = (props) => {
    const { product, onClose, profile, onViewProfile, onAddToCart, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleViewProfileClick = () => {
        onClose();
        onViewProfile(product.creatorUsername);
    };

    const nextImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex(i => (i + 1) % product.images.length);
    }
    const prevImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex(i => (i - 1 + product.images.length) % product.images.length);
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className={`flex flex-col md:flex-row ${cardBg} backdrop-blur-xl ${textColor} rounded-3xl max-w-4xl w-full border ${borderColor} shadow-2xl max-h-[90vh] overflow-hidden`}
                onClick={e => e.stopPropagation()}
            >
                <div className="w-full md:w-1/2 relative bg-black/10">
                    <img src={product.images[currentImageIndex]} alt={product.name} className="w-full h-full object-contain" />
                    {product.images.length > 1 && (
                        <>
                            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 text-white rounded-full hover:bg-black/50"><ChevronLeft /></button>
                            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 text-white rounded-full hover:bg-black/50"><ChevronRight /></button>
                        </>
                    )}
                     <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/30 text-white rounded-full hover:bg-black/50 md:hidden"><X /></button>
                </div>
                <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-3xl font-bold">{product.name}</h2>
                         <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full hidden md:block"><X /></button>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`flex items-center gap-1 ${textSecondary}`}>
                            <Star size={16} className="text-yellow-400" fill="currentColor" /> 
                            <span className={`font-bold ${textColor}`}>{product.rating.toFixed(1)}</span>
                            <span>({product.sales} sales)</span>
                        </div>
                        <span className={`px-3 py-1 text-sm ${cardBg} border ${borderColor} rounded-full`}>{product.category}</span>
                    </div>

                    <p className={`flex-grow ${textSecondary} mb-6`}>{product.description}</p>
                    
                     <div className={`p-4 rounded-2xl border ${borderColor} bg-black/5 dark:bg-white/10 mb-6`}>
                        <p className={`text-sm ${textSecondary} mb-2`}>Sold by</p>
                        <button onClick={handleViewProfileClick} className="flex items-center gap-3 w-full text-left hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg">
                            <AvatarDisplay avatar={product.creatorAvatar} size="w-12 h-12" />
                            <div>
                                <p className={`font-semibold ${textColor}`}>{product.creatorUsername}</p>
                                <p className={`text-sm ${textSecondary}`}>{product.category} Creator</p>
                            </div>
                        </button>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                         <span className={`text-4xl font-bold bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent`}>
                            ${product.price}
                        </span>
                        <button 
                            onClick={() => onAddToCart(product)}
                            className={`px-6 py-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-semibold hover:scale-105 transition-all flex items-center gap-2`}
                        >
                            <ShoppingCart size={20} /> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;

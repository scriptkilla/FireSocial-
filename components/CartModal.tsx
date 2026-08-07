
import React from 'react';
import { X, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { Product, Theme } from '../types';

interface CartModalProps {
    show: boolean;
    onClose: () => void;
    cartItems: Product[];
    onRemoveItem: (productId: string) => void;
    onCheckout: () => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const CartModal: React.FC<CartModalProps> = (props) => {
    const { show, onClose, cartItems, onRemoveItem, onCheckout, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;

    if (!show) return null;

    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl w-full max-w-lg border ${borderColor} shadow-2xl flex flex-col max-h-[80vh]`}
                onClick={e => e.stopPropagation()}
            >
                <div className={`flex justify-between items-center p-6 border-b ${borderColor}`}>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <ShoppingBag className={currentTheme.text} /> Your Cart
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center">
                            <div className={`p-6 rounded-full bg-black/5 dark:bg-white/5 mb-4`}>
                                <ShoppingBag size={48} className={textSecondary} />
                            </div>
                            <p className="text-lg font-semibold">Your cart is empty</p>
                            <p className={`${textSecondary} mt-2`}>Looks like you haven't added anything yet.</p>
                        </div>
                    ) : (
                        cartItems.map((item, index) => (
                            <div key={`${item.id}-${index}`} className={`flex gap-4 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border ${borderColor}`}>
                                <img src={item.images[0]} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                                <div className="flex-1 flex flex-col justify-center">
                                    <h3 className="font-bold line-clamp-1">{item.name}</h3>
                                    <p className={`text-sm ${textSecondary}`}>{item.category}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className={`font-bold ${currentTheme.text}`}>${item.price}</span>
                                        <button 
                                            onClick={() => onRemoveItem(item.id)}
                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                            title="Remove"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className={`p-6 border-t ${borderColor} bg-black/5 dark:bg-white/5`}>
                        <div className="flex justify-between items-center mb-6">
                            <span className={`${textSecondary} text-lg`}>Total</span>
                            <span className="text-3xl font-bold">${total.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={onCheckout}
                            className={`w-full py-4 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg flex items-center justify-center gap-2`}
                        >
                            <CreditCard size={20} /> Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartModal;


import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, DollarSign } from 'lucide-react';
import { Theme, Product } from '../types';

interface AddProductModalProps {
    show: boolean;
    onClose: () => void;
    onAddProduct: (productData: Omit<Product, 'id' | 'creatorId' | 'creatorUsername' | 'creatorAvatar' | 'sales' | 'rating'>) => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ show, onClose, onAddProduct, currentTheme, cardBg, textColor, textSecondary, borderColor }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState<Product['category']>('Digital');
    const [stock, setStock] = useState('-1');
    const [image, setImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Digital and Services are typically infinite stock/availability in this simplified model
    const isInfiniteStock = category === 'Digital' || category === 'Service';

    useEffect(() => {
        if (isInfiniteStock) {
            setStock('-1');
        } else if (stock === '-1') {
            setStock('1');
        }
    }, [category, isInfiniteStock, stock]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = () => {
        if (!name || !price || !image) {
            alert('Please fill out all required fields and upload an image.');
            return;
        }

        onAddProduct({
            name,
            description,
            price: parseFloat(price),
            currency: 'USD',
            images: [image],
            category,
            stock: parseInt(stock, 10),
        });
        
        // Reset form
        setName('');
        setDescription('');
        setPrice('');
        setCategory('Digital');
        setStock('-1');
        setImage(null);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16" onClick={onClose}>
            <div
                className={`overflow-y-auto max-h-[90vh] ${cardBg} backdrop-blur-xl ${textColor} rounded-3xl p-6 max-w-lg w-full border ${borderColor} shadow-2xl`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Add New Product</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Product Image</label>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className={`w-full aspect-video border-2 border-dashed ${borderColor} rounded-xl flex items-center justify-center ${textSecondary} hover:bg-white/5`}>
                            {image ? (
                                <img src={image} alt="Product preview" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <div className="text-center">
                                    <UploadCloud size={32} className="mx-auto" />
                                    <p className="mt-2 text-sm">Click to upload</p>
                                </div>
                            )}
                        </button>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Product Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className={`w-full px-4 py-3 bg-black/5 dark:bg-white/5 rounded-xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`} />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={`w-full px-4 py-3 bg-black/5 dark:bg-white/5 rounded-xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring} resize-none`} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Price</label>
                            <div className="relative">
                                <DollarSign size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className={`w-full pl-8 pr-4 py-3 bg-black/5 dark:bg-white/5 rounded-xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring}`} />
                            </div>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Category</label>
                             <select value={category} onChange={e => setCategory(e.target.value as Product['category'])} className={`w-full px-4 py-3 bg-transparent bg-black/5 dark:bg-white/5 rounded-xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring} appearance-none`}>
                                <option value="Physical">Physical Product</option>
                                <option value="Digital">Digital Download</option>
                                <option value="Service">Service</option>
                                <option value="Rental">Rental</option>
                                <option value="Experience">Experience</option>
                            </select>
                        </div>
                    </div>

                     <div>
                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Stock</label>
                        <input type="number" value={stock} onChange={e => setStock(e.target.value)} disabled={isInfiniteStock} className={`w-full px-4 py-3 bg-black/5 dark:bg-white/5 rounded-xl border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring} disabled:opacity-50 disabled:cursor-not-allowed`} />
                        {isInfiniteStock && <p className={`text-xs ${textSecondary} mt-1`}>Digital products and services have infinite stock.</p>}
                    </div>

                    <div className="flex gap-2 pt-4">
                         <button onClick={onClose} className={`flex-1 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} hover:bg-white/10 font-semibold`}>
                            Cancel
                        </button>
                        <button onClick={handleSubmit} className={`flex-1 py-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-semibold hover:scale-105 transition-all`}>
                            Add Product
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AddProductModal;
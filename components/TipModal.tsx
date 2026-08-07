
import React, { useState } from 'react';
import { X, Flame } from 'lucide-react';
import { Profile, Theme } from '../types';
import AvatarDisplay from './AvatarDisplay';

interface TipModalProps {
    show: boolean;
    onClose: () => void;
    recipient: Profile | null;
    onConfirm: (amount: number) => void;
    balance: number;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const TipModal: React.FC<TipModalProps> = ({ show, onClose, recipient, onConfirm, balance, currentTheme, cardBg, textColor, textSecondary, borderColor }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [customAmount, setCustomAmount] = useState('');
    
    if (!show || !recipient) return null;

    const PRESETS = [10, 50, 100, 500];

    const handleSend = () => {
        const val = Number(amount || customAmount);
        if (val > 0 && val <= balance) {
            onConfirm(val);
            setAmount('');
            setCustomAmount('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4" onClick={onClose}>
             <div className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl p-6 max-w-sm w-full border ${borderColor} shadow-2xl`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">Send Tip <Flame className="text-orange-500" fill="currentColor" size={20}/></h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>
                
                <div className="flex flex-col items-center mb-6">
                    <AvatarDisplay avatar={recipient.avatar} size="w-20 h-20" className="mb-3 shadow-lg" />
                    <p className={`${textSecondary} text-sm`}>Tipping</p>
                    <p className="text-xl font-bold">{recipient.name}</p>
                    <p className={`${textSecondary} text-sm`}>{recipient.username}</p>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                    {PRESETS.map(val => (
                        <button 
                            key={val}
                            onClick={() => { setAmount(val); setCustomAmount(''); }}
                            className={`py-2 rounded-xl border ${amount === val ? `bg-orange-500 text-white border-orange-500` : `${borderColor} hover:border-orange-500 hover:text-orange-500`} font-bold transition-all`}
                        >
                            {val}
                        </button>
                    ))}
                </div>

                <div className="relative mb-6">
                    <input 
                        type="number" 
                        placeholder="Custom amount" 
                        value={customAmount}
                        onChange={(e) => { setCustomAmount(e.target.value); setAmount(''); }}
                        className={`w-full px-4 py-3 bg-black/5 dark:bg-white/5 border ${borderColor} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-center ${textColor}`}
                    />
                </div>
                
                <div className="flex justify-between items-center mb-4 text-sm">
                    <span className={textSecondary}>Your Balance</span>
                    <span className="font-bold flex items-center gap-1">{balance} <Flame size={14} className="text-orange-500" fill="currentColor"/></span>
                </div>

                <button 
                    onClick={handleSend}
                    disabled={!((amount || customAmount) && Number(amount || customAmount) <= balance)}
                    className={`w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Send {Number(amount || customAmount) > 0 ? `${Number(amount || customAmount)} Embers` : 'Tip'}
                </button>
             </div>
        </div>
    );
};

export default TipModal;

import React, { useState, useMemo } from 'react';
import { Profile, Theme, WalletTransaction, PaymentMethod, UserListItem } from '../types';
import { 
  Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, Flame, DollarSign, Plus, Check, X, Search, 
  Filter, Clock, Send, Building, ChevronRight, ShieldCheck, Sparkles, Download, 
  Trash2, Lock, CheckCircle2, TrendingUp, RefreshCw, AlertCircle, ShoppingBag, Eye, User, Sparkle
} from 'lucide-react';

interface WalletModalProps {
  show: boolean;
  onClose: () => void;
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  allUsers?: UserListItem[];
  currentTheme: Theme;
  cardBg: string;
  borderColor: string;
  textColor: string;
  textSecondary: string;
  darkMode: boolean;
  initialTab?: 'overview' | 'buy_embers' | 'deposit_withdraw' | 'transfer' | 'methods' | 'history';
}

const EMBER_PACKAGES = [
  { id: 'ember_100', embers: 100, price: 0.99, bonus: 0, tag: '' },
  { id: 'ember_550', embers: 550, price: 4.99, bonus: 10, tag: 'Popular', popular: true },
  { id: 'ember_1200', embers: 1200, price: 9.99, bonus: 20, tag: 'Best Value', bestValue: true },
  { id: 'ember_3200', embers: 3200, price: 24.99, bonus: 30, tag: '+30% Bonus' },
  { id: 'ember_7000', embers: 7000, price: 49.99, bonus: 40, tag: 'Whale Pack 👑' },
];

export const WalletModal: React.FC<WalletModalProps> = ({
  show,
  onClose,
  profile,
  setProfile,
  allUsers = [],
  currentTheme,
  cardBg,
  borderColor,
  textColor,
  textSecondary,
  darkMode,
  initialTab = 'overview'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'buy_embers' | 'deposit_withdraw' | 'transfer' | 'methods' | 'history'>(initialTab);
  
  // Local Form States
  const [selectedEmberPkg, setSelectedEmberPkg] = useState<string>('ember_1200');
  const [customEmberAmount, setCustomEmberAmount] = useState<string>('');
  
  // Deposit & Withdraw State
  const [dwMode, setDwMode] = useState<'deposit' | 'withdraw'>('withdraw');
  const [dwAmount, setDwAmount] = useState<string>('50');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('pm_1');
  const [payoutDestination, setPayoutDestination] = useState<'bank' | 'stripe' | 'paypal'>('bank');

  // Transfer State
  const [transferType, setTransferType] = useState<'ember' | 'cash'>('ember');
  const [transferRecipient, setTransferRecipient] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('100');
  const [transferNote, setTransferNote] = useState<string>('');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  // Add Card State
  const [showAddCardModal, setShowAddCardModal] = useState<boolean>(false);
  const [cardType, setCardType] = useState<'card' | 'bank'>('card');
  const [newCardName, setNewCardName] = useState<string>('');
  const [newCardNumber, setNewCardNumber] = useState<string>('');
  const [newCardExpiry, setNewCardExpiry] = useState<string>('');
  const [newCardCvc, setNewCardCvc] = useState<string>('');

  // History & Filters
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'embers' | 'cash' | 'deposits' | 'withdrawals' | 'tips' | 'earnings'>('all');
  const [selectedTxnDetails, setSelectedTxnDetails] = useState<WalletTransaction | null>(null);

  // Feedback Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!show) return null;

  const wallet = profile.creatorMonetization?.wallet || {
    paymentMethods: [
      { id: 'pm_1', type: 'card', name: 'Visa ending in 4242', last4: '4242', expiry: '12/28' },
      { id: 'pm_2', type: 'bank', name: 'Chase Checking', last4: '9876' }
    ],
    transactions: [
      { id: 'txn_101', type: 'earning', amount: 45.00, date: 'Today, 10:30 AM', status: 'completed', description: 'FireShop Digital Product Sale' },
      { id: 'txn_102', type: 'tip_received', amount: 25.00, date: 'Yesterday', status: 'completed', description: 'Ember Tip from @alexrivera' },
      { id: 'txn_103', type: 'deposit', amount: 100.00, date: 'Jul 28, 2026', status: 'completed', description: 'Ember Package Top Up' },
      { id: 'txn_104', type: 'withdrawal', amount: 50.00, date: 'Jul 20, 2026', status: 'completed', description: 'Payout to Bank (*9876)' }
    ]
  };

  const cashBalance = profile.creatorMonetization?.balance ?? 342.75;
  const emberBalance = profile.emberBalance ?? 1000;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper to add transaction and update state
  const logTransactionAndSave = (
    type: WalletTransaction['type'],
    amount: number,
    description: string,
    balanceChange: { emberDelta?: number; cashDelta?: number },
    status: 'completed' | 'pending' | 'failed' = 'completed'
  ) => {
    const newTxn: WalletTransaction = {
      id: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      amount,
      date: 'Just now',
      status,
      description
    };

    setProfile(prev => {
      const currentWallet = prev.creatorMonetization?.wallet || wallet;
      const updatedMonetization = {
        ...(prev.creatorMonetization || {
          enabled: true,
          subscriptionTiers: [],
          tipJar: { enabled: true, suggestedAmounts: [5, 10, 25], customAmount: true, totalTips: 0, tipCount: 0 },
          paidPosts: [],
          products: [],
          games: [],
          analytics: { totalEarnings: 0, monthlyEarnings: [], topEarningPosts: [], subscriberGrowth: [], tipHistory: [] },
          payoutMethod: 'bank' as const,
          minimumPayout: 50,
          nextPayoutDate: 'Next Monday',
          balance: 0
        }),
        balance: Math.max(0, (prev.creatorMonetization?.balance || 0) + (balanceChange.cashDelta || 0)),
        wallet: {
          paymentMethods: currentWallet.paymentMethods || [],
          transactions: [newTxn, ...(currentWallet.transactions || [])]
        }
      };

      return {
        ...prev,
        emberBalance: Math.max(0, (prev.emberBalance || 0) + (balanceChange.emberDelta || 0)),
        creatorMonetization: updatedMonetization
      };
    });
  };

  // Action Handlers
  const handleBuyEmbers = () => {
    let embersToAdd = 0;
    let cost = 0;

    if (customEmberAmount && Number(customEmberAmount) > 0) {
      embersToAdd = Number(customEmberAmount);
      cost = Number((embersToAdd / 100).toFixed(2));
    } else {
      const pkg = EMBER_PACKAGES.find(p => p.id === selectedEmberPkg);
      if (pkg) {
        embersToAdd = pkg.embers;
        cost = pkg.price;
      }
    }

    if (embersToAdd <= 0) {
      alert('Please select or enter a valid Ember amount.');
      return;
    }

    logTransactionAndSave(
      'deposit',
      cost,
      `Purchased ${embersToAdd.toLocaleString()} Embers via Card`,
      { emberDelta: embersToAdd }
    );

    showToast(`🎉 Successfully added ${embersToAdd.toLocaleString()} Embers to your wallet!`);
    setActiveTab('overview');
  };

  const handleDepositCash = () => {
    const amt = Number(dwAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }

    logTransactionAndSave(
      'deposit',
      amt,
      `Deposit USD Cash via Saved Payment Method`,
      { cashDelta: amt }
    );

    showToast(`💵 Successfully deposited $${amt.toFixed(2)} to your USD Cash balance!`);
    setActiveTab('overview');
  };

  const handleWithdrawCash = () => {
    const amt = Number(dwAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid withdrawal amount.');
      return;
    }

    if (cashBalance < amt) {
      alert(`Insufficient funds. Your current withdrawable balance is $${cashBalance.toFixed(2)}.`);
      return;
    }

    if (amt < 10) {
      alert('Minimum withdrawal amount is $10.00.');
      return;
    }

    logTransactionAndSave(
      'withdrawal',
      amt,
      `Withdrawal to ${payoutDestination.toUpperCase()} Account`,
      { cashDelta: -amt },
      'completed'
    );

    showToast(`✅ Withdrawal of $${amt.toFixed(2)} requested! Funds will arrive shortly.`);
    setActiveTab('overview');
  };

  const handleTransfer = () => {
    if (!transferRecipient.trim()) {
      alert('Please select or enter a recipient username.');
      return;
    }

    const amt = Number(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid transfer amount.');
      return;
    }

    const recipientName = transferRecipient.startsWith('@') ? transferRecipient : `@${transferRecipient}`;

    if (transferType === 'ember') {
      if (emberBalance < amt) {
        alert(`Insufficient Ember balance. You have ${emberBalance.toLocaleString()} Embers.`);
        return;
      }

      logTransactionAndSave(
        'tip_sent',
        amt,
        `Transferred ${amt.toLocaleString()} Embers to ${recipientName} ${transferNote ? `("${transferNote}")` : ''}`,
        { emberDelta: -amt }
      );

      showToast(`🔥 Sent ${amt.toLocaleString()} Embers to ${recipientName}!`);
    } else {
      if (cashBalance < amt) {
        alert(`Insufficient Cash balance. You have $${cashBalance.toFixed(2)}.`);
        return;
      }

      logTransactionAndSave(
        'tip_sent',
        amt,
        `Transferred $${amt.toFixed(2)} Cash to ${recipientName} ${transferNote ? `("${transferNote}")` : ''}`,
        { cashDelta: -amt }
      );

      showToast(`💵 Sent $${amt.toFixed(2)} USD to ${recipientName}!`);
    }

    setTransferRecipient('');
    setTransferNote('');
    setActiveTab('overview');
  };

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName.trim() || !newCardNumber.trim()) {
      alert('Please fill out card details.');
      return;
    }

    const last4 = newCardNumber.slice(-4) || '9999';
    const newPm: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type: cardType,
      name: cardType === 'card' ? `${newCardNumber.startsWith('4') ? 'Visa' : 'Mastercard'} ending in ${last4}` : `${newCardName} Bank`,
      last4: last4,
      expiry: newCardExpiry || '12/29'
    };

    setProfile(prev => {
      const currentWallet = prev.creatorMonetization?.wallet || wallet;
      return {
        ...prev,
        creatorMonetization: {
          ...(prev.creatorMonetization || {
            enabled: true,
            subscriptionTiers: [],
            tipJar: { enabled: true, suggestedAmounts: [5, 10, 25], customAmount: true, totalTips: 0, tipCount: 0 },
            paidPosts: [],
            products: [],
            games: [],
            analytics: { totalEarnings: 0, monthlyEarnings: [], topEarningPosts: [], subscriberGrowth: [], tipHistory: [] },
            payoutMethod: 'bank' as const,
            minimumPayout: 50,
            nextPayoutDate: 'Next Monday',
            balance: cashBalance
          }),
          wallet: {
            ...currentWallet,
            paymentMethods: [...(currentWallet.paymentMethods || []), newPm]
          }
        }
      };
    });

    setShowAddCardModal(false);
    setNewCardName('');
    setNewCardNumber('');
    setNewCardExpiry('');
    setNewCardCvc('');
    showToast(`💳 Payment method ${newPm.name} added successfully!`);
  };

  const handleDeletePaymentMethod = (id: string) => {
    setProfile(prev => {
      const currentWallet = prev.creatorMonetization?.wallet || wallet;
      return {
        ...prev,
        creatorMonetization: {
          ...(prev.creatorMonetization || {
            enabled: true,
            subscriptionTiers: [],
            tipJar: { enabled: true, suggestedAmounts: [5, 10, 25], customAmount: true, totalTips: 0, tipCount: 0 },
            paidPosts: [],
            products: [],
            games: [],
            analytics: { totalEarnings: 0, monthlyEarnings: [], topEarningPosts: [], subscriberGrowth: [], tipHistory: [] },
            payoutMethod: 'bank' as const,
            minimumPayout: 50,
            nextPayoutDate: 'Next Monday',
            balance: cashBalance
          }),
          wallet: {
            ...currentWallet,
            paymentMethods: (currentWallet.paymentMethods || []).filter(p => p.id !== id)
          }
        }
      };
    });
    showToast('Payment method removed.');
  };

  // Filter Transactions
  const filteredTransactions = useMemo(() => {
    return wallet.transactions.filter(txn => {
      const matchesSearch = txn.description.toLowerCase().includes(historySearch.toLowerCase()) ||
                            txn.type.toLowerCase().includes(historySearch.toLowerCase());
      
      if (!matchesSearch) return false;

      if (historyFilter === 'all') return true;
      if (historyFilter === 'embers') return txn.description.toLowerCase().includes('ember');
      if (historyFilter === 'cash') return !txn.description.toLowerCase().includes('ember');
      if (historyFilter === 'deposits') return txn.type === 'deposit';
      if (historyFilter === 'withdrawals') return txn.type === 'withdrawal';
      if (historyFilter === 'tips') return txn.type === 'tip_received' || txn.type === 'tip_sent';
      if (historyFilter === 'earnings') return txn.type === 'earning' || txn.type === 'game_revenue';
      
      return true;
    });
  }, [wallet.transactions, historySearch, historyFilter]);

  const filteredUserList = useMemo(() => {
    if (!userSearchQuery.trim()) return allUsers.slice(0, 5);
    return allUsers.filter(u => 
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase())
    ).slice(0, 5);
  }, [allUsers, userSearchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[60] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold text-sm border border-orange-500/30 animate-bounce">
          <Sparkles className="text-orange-500" size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className={`relative w-full max-w-4xl ${cardBg} rounded-3xl border ${borderColor} shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${currentTheme.from} ${currentTheme.to} text-white shadow-lg shadow-orange-500/20`}>
              <Wallet size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-2xl font-bold ${textColor} tracking-tight`}>FireWallet</h2>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-green-500/20 text-green-500 rounded-full flex items-center gap-1">
                  <ShieldCheck size={12} /> Active & Secured
                </span>
              </div>
              <p className={`text-xs ${textSecondary}`}>Manage Embers, USD Earnings, Transfers & Payment Methods</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 ${textSecondary} transition-colors`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 overflow-x-auto no-scrollbar bg-black/5 dark:bg-white/5 py-2">
          {[
            { id: 'overview', label: 'Overview', icon: Wallet },
            { id: 'buy_embers', label: 'Buy Embers 🔥', icon: Flame, badge: `${emberBalance.toLocaleString()}` },
            { id: 'deposit_withdraw', label: 'Deposit & Cash Out', icon: DollarSign },
            { id: 'transfer', label: 'Send & Transfer', icon: Send },
            { id: 'methods', label: 'Cards & Banks', icon: CreditCard },
            { id: 'history', label: 'Transactions', icon: Clock, badge: `${wallet.transactions.length}` },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${
                  isActive
                    ? `bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white shadow-md scale-[1.02]`
                    : `${textSecondary} hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-white`
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-orange-500/20 text-orange-500'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Dual Balance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Embers Balance Card */}
                <div className={`relative p-6 rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 text-white shadow-xl overflow-hidden flex flex-col justify-between`}>
                  <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                  <div className="flex justify-between items-start z-10 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                        <Flame size={20} fill="currentColor" className="animate-pulse" />
                      </div>
                      <span className="font-bold text-xs uppercase tracking-wider text-orange-100">Fire Embers Balance</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full font-bold">SPENDING CURRENCY</span>
                  </div>

                  <div className="z-10 my-2">
                    <h3 className="text-4xl font-extrabold flex items-center gap-2 tracking-tight">
                      {emberBalance.toLocaleString()} <span className="text-xl font-medium opacity-80">Embers</span>
                    </h3>
                    <p className="text-xs text-orange-100/80 mt-1">
                      Estimated Value: ${(emberBalance / 100).toFixed(2)} USD • Use for tips, games & boosts
                    </p>
                  </div>

                  <div className="flex items-center gap-3 z-10 pt-4 border-t border-white/20 mt-4">
                    <button
                      onClick={() => setActiveTab('buy_embers')}
                      className="flex-1 py-2.5 px-4 bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Top Up Embers
                    </button>
                    <button
                      onClick={() => { setTransferType('ember'); setActiveTab('transfer'); }}
                      className="py-2.5 px-4 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-colors flex items-center justify-center gap-2"
                    >
                      <Send size={16} /> Transfer
                    </button>
                  </div>
                </div>

                {/* USD Cash Balance Card */}
                <div className={`relative p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-xl overflow-hidden flex flex-col justify-between`}>
                  <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                  <div className="flex justify-between items-start z-10 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                        <DollarSign size={20} fill="currentColor" />
                      </div>
                      <span className="font-bold text-xs uppercase tracking-wider text-emerald-100">Creator Cash Balance</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full font-bold">WITHDRAWABLE USD</span>
                  </div>

                  <div className="z-10 my-2">
                    <h3 className="text-4xl font-extrabold tracking-tight">
                      ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <p className="text-xs text-emerald-100/80 mt-1">
                      Ready for cash out or transfer • Min. payout $10.00
                    </p>
                  </div>

                  <div className="flex items-center gap-3 z-10 pt-4 border-t border-white/20 mt-4">
                    <button
                      onClick={() => { setDwMode('withdraw'); setActiveTab('deposit_withdraw'); }}
                      className="flex-1 py-2.5 px-4 bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <ArrowUpRight size={16} /> Cash Out
                    </button>
                    <button
                      onClick={() => { setDwMode('deposit'); setActiveTab('deposit_withdraw'); }}
                      className="py-2.5 px-4 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowDownLeft size={16} /> Deposit
                    </button>
                  </div>
                </div>

              </div>

              {/* Quick Financial Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Tips Earned', value: '$185.00', icon: Flame, color: 'text-orange-500' },
                  { label: 'Product Sales', value: '$240.50', icon: ShoppingBag, color: 'text-blue-500' },
                  { label: 'Pending Payouts', value: '$0.00', icon: Clock, color: 'text-yellow-500' },
                  { label: 'Saved Cards', value: `${wallet.paymentMethods.length} Linked`, icon: CreditCard, color: 'text-green-500' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className={`p-4 rounded-2xl border ${borderColor} bg-black/5 dark:bg-white/5 flex items-center gap-3`}>
                      <div className={`p-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 ${stat.color}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className={`text-[10px] font-semibold uppercase ${textSecondary}`}>{stat.label}</p>
                        <p className={`text-base font-bold ${textColor}`}>{stat.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Transactions */}
              <div className={`p-6 rounded-3xl border ${borderColor} bg-black/5 dark:bg-white/5 space-y-4`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-lg ${textColor} flex items-center gap-2`}>
                    <Clock size={18} className="text-orange-500" /> Recent Transactions
                  </h3>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`text-xs font-bold ${currentTheme.text} hover:underline flex items-center gap-1`}
                  >
                    View All ({wallet.transactions.length}) <ChevronRight size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  {wallet.transactions.slice(0, 4).map(txn => {
                    const isIncome = ['deposit', 'earning', 'tip_received', 'game_revenue'].includes(txn.type);
                    return (
                      <div
                        key={txn.id}
                        onClick={() => setSelectedTxnDetails(txn)}
                        className={`p-3.5 rounded-2xl border ${borderColor} bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors cursor-pointer flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${isIncome ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${textColor}`}>{txn.description}</p>
                            <p className={`text-xs ${textSecondary}`}>{txn.date} • <span className="capitalize">{txn.type.replace('_', ' ')}</span></p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`font-extrabold text-sm ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                            {isIncome ? '+' : '-'}{txn.amount.toString().includes('.') ? `$${txn.amount.toFixed(2)}` : `${txn.amount} Embers`}
                          </p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 capitalize">
                            {txn.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BUY EMBERS */}
          {activeTab === 'buy_embers' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center max-w-lg mx-auto space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-orange-500/20 text-orange-500 mb-1">
                  <Flame size={32} fill="currentColor" className="animate-bounce" />
                </div>
                <h3 className={`text-2xl font-bold ${textColor}`}>Top Up Fire Embers</h3>
                <p className={`text-xs ${textSecondary}`}>
                  Embers allow you to send tips to creators, buy premium posts, unlock store items, and play games!
                </p>
              </div>

              {/* Ember Packages Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {EMBER_PACKAGES.map(pkg => {
                  const isSelected = selectedEmberPkg === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => { setSelectedEmberPkg(pkg.id); setCustomEmberAmount(''); }}
                      className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? `border-orange-500 bg-orange-500/10 shadow-lg scale-[1.02]`
                          : `${borderColor} hover:border-orange-500/50 hover:bg-black/5 dark:hover:bg-white/5`
                      }`}
                    >
                      {pkg.tag && (
                        <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md">
                          {pkg.tag}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Flame size={24} className="text-orange-500" fill="currentColor" />
                          <span className={`text-2xl font-extrabold ${textColor}`}>{pkg.embers.toLocaleString()}</span>
                        </div>
                        <p className={`text-xs ${textSecondary}`}>Embers Package</p>
                        {pkg.bonus > 0 && (
                          <span className="text-[10px] font-bold text-green-500 mt-1 block">
                            Includes +{pkg.bonus}% Bonus Embers
                          </span>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <span className={`text-lg font-bold ${textColor}`}>${pkg.price.toFixed(2)}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-orange-500 bg-orange-500 text-white' : borderColor}`}>
                          {isSelected && <Check size={12} />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Custom Amount Box */}
                <div className={`p-5 rounded-2xl border ${borderColor} flex flex-col justify-between bg-black/5 dark:bg-white/5`}>
                  <div>
                    <h4 className={`font-bold text-sm ${textColor} mb-1`}>Custom Amount</h4>
                    <p className={`text-xs ${textSecondary} mb-3`}>$1 USD = 100 Embers</p>
                    <input
                      type="number"
                      placeholder="e.g. 2500"
                      value={customEmberAmount}
                      onChange={(e) => {
                        setCustomEmberAmount(e.target.value);
                        setSelectedEmberPkg('');
                      }}
                      className={`w-full px-3 py-2 rounded-xl border ${borderColor} bg-white dark:bg-gray-900 ${textColor} font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500`}
                    />
                  </div>
                  {customEmberAmount && Number(customEmberAmount) > 0 && (
                    <p className="text-xs font-bold text-orange-500 mt-3">
                      Total: ${(Number(customEmberAmount) / 100).toFixed(2)} USD
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className={`p-5 rounded-2xl border ${borderColor} bg-black/5 dark:bg-white/5 space-y-3`}>
                <label className={`text-xs font-bold uppercase ${textSecondary}`}>Select Payment Method</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className={`flex-1 px-4 py-3 rounded-xl border ${borderColor} bg-white dark:bg-gray-900 ${textColor} font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  >
                    {wallet.paymentMethods.map(pm => (
                      <option key={pm.id} value={pm.id}>
                        {pm.name} ({pm.last4})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowAddCardModal(true)}
                    className={`px-4 py-3 rounded-xl border ${borderColor} hover:bg-gray-200 dark:hover:bg-gray-800 ${textColor} font-bold text-xs flex items-center gap-2`}
                  >
                    <Plus size={16} /> Add Card
                  </button>
                </div>
              </div>

              {/* Submit Purchase Button */}
              <button
                onClick={handleBuyEmbers}
                className={`w-full py-4 rounded-2xl bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white font-extrabold text-base shadow-xl shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2`}
              >
                <Sparkles size={20} /> Confirm & Complete Ember Purchase
              </button>
            </div>
          )}

          {/* TAB 3: DEPOSIT & WITHDRAW */}
          {activeTab === 'deposit_withdraw' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Toggle Sub-tab */}
              <div className="flex justify-center">
                <div className="p-1 rounded-2xl bg-gray-200 dark:bg-gray-800 flex gap-1">
                  <button
                    onClick={() => setDwMode('withdraw')}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${dwMode === 'withdraw' ? 'bg-emerald-600 text-white shadow-md' : `${textSecondary}`}`}
                  >
                    <ArrowUpRight size={16} className="inline mr-1" /> Withdraw USD Cash
                  </button>
                  <button
                    onClick={() => setDwMode('deposit')}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${dwMode === 'deposit' ? 'bg-blue-600 text-white shadow-md' : `${textSecondary}`}`}
                  >
                    <ArrowDownLeft size={16} className="inline mr-1" /> Deposit USD Cash
                  </button>
                </div>
              </div>

              {dwMode === 'withdraw' ? (
                <div className="max-w-xl mx-auto space-y-5">
                  <div className={`p-6 rounded-3xl border ${borderColor} bg-emerald-500/10 text-center space-y-2`}>
                    <p className={`text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400`}>Withdrawable Balance</p>
                    <h3 className={`text-4xl font-extrabold ${textColor}`}>
                      ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-xs font-bold ${textColor}`}>Withdrawal Amount ($ USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                      <input
                        type="number"
                        value={dwAmount}
                        onChange={(e) => setDwAmount(e.target.value)}
                        className={`w-full pl-8 pr-4 py-3 rounded-xl border ${borderColor} bg-white dark:bg-gray-900 ${textColor} font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                        placeholder="50.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-xs font-bold ${textColor}`}>Payout Destination</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'bank', name: 'Direct Bank', desc: '1-2 Days • Free', icon: Building },
                        { id: 'stripe', name: 'Stripe Instant', desc: 'Instant • 1.5%', icon: CreditCard },
                        { id: 'paypal', name: 'PayPal', desc: 'Same day', icon: DollarSign },
                      ].map(dest => {
                        const Icon = dest.icon;
                        const isSel = payoutDestination === dest.id;
                        return (
                          <div
                            key={dest.id}
                            onClick={() => setPayoutDestination(dest.id as any)}
                            className={`p-4 rounded-2xl border text-center cursor-pointer transition-all ${
                              isSel ? 'border-emerald-500 bg-emerald-500/10 shadow-md' : `${borderColor} hover:bg-black/5 dark:hover:bg-white/5`
                            }`}
                          >
                            <Icon size={20} className={`mx-auto mb-1 ${isSel ? 'text-emerald-500' : textSecondary}`} />
                            <p className={`font-bold text-xs ${textColor}`}>{dest.name}</p>
                            <p className={`text-[10px] ${textSecondary}`}>{dest.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={handleWithdrawCash}
                    className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base shadow-xl shadow-emerald-500/30 transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <ArrowUpRight size={20} /> Confirm Withdrawal
                  </button>
                </div>
              ) : (
                <div className="max-w-xl mx-auto space-y-5">
                  <div className="space-y-2">
                    <label className={`text-xs font-bold ${textColor}`}>Deposit Amount ($ USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                      <input
                        type="number"
                        value={dwAmount}
                        onChange={(e) => setDwAmount(e.target.value)}
                        className={`w-full pl-8 pr-4 py-3 rounded-xl border ${borderColor} bg-white dark:bg-gray-900 ${textColor} font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="100.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-xs font-bold ${textColor}`}>Payment Source</label>
                    <select
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${borderColor} bg-white dark:bg-gray-900 ${textColor} font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {wallet.paymentMethods.map(pm => (
                        <option key={pm.id} value={pm.id}>
                          {pm.name} ({pm.last4})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleDepositCash}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-base shadow-xl shadow-blue-500/30 transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <ArrowDownLeft size={20} /> Confirm Cash Deposit
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SEND & TRANSFER */}
          {activeTab === 'transfer' && (
            <div className="max-w-xl mx-auto space-y-5 animate-fadeIn">
              <div className="text-center space-y-1">
                <h3 className={`text-xl font-bold ${textColor}`}>Send & Transfer Funds</h3>
                <p className={`text-xs ${textSecondary}`}>Directly send Embers or USD Cash to any user on FireSocial.</p>
              </div>

              {/* Asset Type Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTransferType('ember')}
                  className={`p-4 rounded-2xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                    transferType === 'ember'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500 shadow-md'
                      : `${borderColor} ${textSecondary} hover:bg-black/5 dark:hover:bg-white/5`
                  }`}
                >
                  <Flame size={20} fill="currentColor" /> Send Embers 🔥
                </button>
                <button
                  onClick={() => setTransferType('cash')}
                  className={`p-4 rounded-2xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                    transferType === 'cash'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-md'
                      : `${borderColor} ${textSecondary} hover:bg-black/5 dark:hover:bg-white/5`
                  }`}
                >
                  <DollarSign size={20} /> Send USD Cash 💵
                </button>
              </div>

              {/* Recipient Selection */}
              <div className="space-y-2">
                <label className={`text-xs font-bold ${textColor}`}>Recipient Username</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={transferRecipient}
                    onChange={(e) => {
                      setTransferRecipient(e.target.value);
                      setUserSearchQuery(e.target.value);
                    }}
                    placeholder="e.g. @alexrivera or name"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${borderColor} bg-white dark:bg-gray-900 ${textColor} font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  />
                </div>

                {/* Suggestions List */}
                {filteredUserList.length > 0 && (
                  <div className={`p-2 rounded-2xl border ${borderColor} bg-white dark:bg-gray-900 space-y-1 shadow-lg`}>
                    <p className={`text-[10px] font-bold uppercase px-3 py-1 ${textSecondary}`}>Suggested Users</p>
                    {filteredUserList.map(u => (
                      <div
                        key={u.id}
                        onClick={() => setTransferRecipient(u.username)}
                        className={`p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-3 transition-colors`}
                      >
                        <span className="text-xl">{u.avatar}</span>
                        <div>
                          <p className={`font-bold text-xs ${textColor}`}>{u.name}</p>
                          <p className={`text-[10px] ${textSecondary}`}>{u.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className={`text-xs font-bold ${textColor}`}>Transfer Amount</label>
                  <span className={`text-xs font-bold ${textSecondary}`}>
                    Available: {transferType === 'ember' ? `${emberBalance.toLocaleString()} Embers` : `$${cashBalance.toFixed(2)}`}
                  </span>
                </div>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${borderColor} bg-white dark:bg-gray-900 ${textColor} font-bold text-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="100"
                />
              </div>

              {/* Optional Memo */}
              <div className="space-y-2">
                <label className={`text-xs font-bold ${textColor}`}>Note / Message (Optional)</label>
                <input
                  type="text"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="e.g. Thanks for your great work!"
                  className={`w-full px-4 py-3 rounded-xl border ${borderColor} bg-white dark:bg-gray-900 ${textColor} text-sm focus:outline-none focus:ring-2 focus:ring-orange-500`}
                />
              </div>

              <button
                onClick={handleTransfer}
                className={`w-full py-4 rounded-2xl bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white font-extrabold text-base shadow-xl shadow-orange-500/30 transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2`}
              >
                <Send size={18} /> Confirm & Send Transfer
              </button>
            </div>
          )}

          {/* TAB 5: PAYMENT METHODS */}
          {activeTab === 'methods' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-bold ${textColor}`}>Saved Payment Methods</h3>
                  <p className={`text-xs ${textSecondary}`}>Manage credit cards and linked bank accounts.</p>
                </div>
                <button
                  onClick={() => setShowAddCardModal(true)}
                  className={`px-4 py-2.5 rounded-xl bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white font-bold text-xs flex items-center gap-2 shadow-md hover:scale-105 transition-transform`}
                >
                  <Plus size={16} /> Add Payment Method
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wallet.paymentMethods.map(pm => (
                  <div
                    key={pm.id}
                    className={`p-5 rounded-2xl border ${borderColor} bg-black/5 dark:bg-white/5 flex items-center justify-between group hover:border-orange-500/40 transition-all`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gray-200 dark:bg-gray-800 text-orange-500">
                        {pm.type === 'card' ? <CreditCard size={22} /> : <Building size={22} />}
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${textColor}`}>{pm.name}</p>
                        <p className={`text-xs ${textSecondary}`}>
                          {pm.type === 'card' ? `Expires ${pm.expiry || '12/28'}` : 'Verified Bank Account'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePaymentMethod(pm.id)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 opacity-60 group-hover:opacity-100 transition-opacity"
                      title="Remove Payment Method"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Payment Method Modal/Form Overlay */}
              {showAddCardModal && (
                <div className={`p-6 rounded-3xl border ${borderColor} bg-white dark:bg-gray-900 space-y-4 shadow-2xl`}>
                  <div className="flex items-center justify-between">
                    <h4 className={`font-bold text-base ${textColor}`}>Add New Payment Method</h4>
                    <button onClick={() => setShowAddCardModal(false)} className={`${textSecondary} hover:text-white`}>
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCardType('card')}
                        className={`flex-1 py-2 rounded-xl font-bold text-xs border ${cardType === 'card' ? 'border-orange-500 bg-orange-500/10 text-orange-500' : borderColor}`}
                      >
                        Credit / Debit Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardType('bank')}
                        className={`flex-1 py-2 rounded-xl font-bold text-xs border ${cardType === 'bank' ? 'border-orange-500 bg-orange-500/10 text-orange-500' : borderColor}`}
                      >
                        Bank Account
                      </button>
                    </div>

                    <div>
                      <label className={`text-xs font-bold ${textColor}`}>Name on Card / Account</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={newCardName}
                        onChange={(e) => setNewCardName(e.target.value)}
                        className={`w-full mt-1 px-4 py-2.5 rounded-xl border ${borderColor} bg-gray-50 dark:bg-gray-800 ${textColor} text-sm focus:outline-none`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs font-bold ${textColor}`}>{cardType === 'card' ? 'Card Number' : 'Account Number'}</label>
                      <input
                        type="text"
                        required
                        placeholder={cardType === 'card' ? '4111 2222 3333 4444' : '123456789'}
                        value={newCardNumber}
                        onChange={(e) => setNewCardNumber(e.target.value)}
                        className={`w-full mt-1 px-4 py-2.5 rounded-xl border ${borderColor} bg-gray-50 dark:bg-gray-800 ${textColor} text-sm focus:outline-none`}
                      />
                    </div>

                    {cardType === 'card' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`text-xs font-bold ${textColor}`}>Expiry (MM/YY)</label>
                          <input
                            type="text"
                            placeholder="12/28"
                            value={newCardExpiry}
                            onChange={(e) => setNewCardExpiry(e.target.value)}
                            className={`w-full mt-1 px-4 py-2.5 rounded-xl border ${borderColor} bg-gray-50 dark:bg-gray-800 ${textColor} text-sm focus:outline-none`}
                          />
                        </div>
                        <div>
                          <label className={`text-xs font-bold ${textColor}`}>CVC</label>
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="123"
                            value={newCardCvc}
                            onChange={(e) => setNewCardCvc(e.target.value)}
                            className={`w-full mt-1 px-4 py-2.5 rounded-xl border ${borderColor} bg-gray-50 dark:bg-gray-800 ${textColor} text-sm focus:outline-none`}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddCardModal(false)}
                        className={`px-4 py-2 rounded-xl border ${borderColor} ${textSecondary} font-bold text-xs`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`px-6 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md`}
                      >
                        Save Payment Method
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: TRANSACTION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Search & Filter bar */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <div className="relative w-full sm:w-72">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${borderColor} bg-white dark:bg-gray-900 ${textColor} text-xs focus:outline-none`}
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar py-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'embers', label: 'Embers' },
                    { id: 'cash', label: 'Cash USD' },
                    { id: 'deposits', label: 'Deposits' },
                    { id: 'withdrawals', label: 'Withdrawals' },
                    { id: 'tips', label: 'Tips' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setHistoryFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                        historyFilter === f.id
                          ? 'bg-orange-500 text-white'
                          : `bg-gray-200 dark:bg-gray-800 ${textSecondary} hover:text-white`
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction List */}
              <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <Clock size={36} className="mx-auto text-gray-400 opacity-50" />
                    <p className={`font-bold text-base ${textColor}`}>No transactions found</p>
                    <p className={`text-xs ${textSecondary}`}>Try adjusting your search terms or filter parameters.</p>
                  </div>
                ) : (
                  filteredTransactions.map(txn => {
                    const isIncome = ['deposit', 'earning', 'tip_received', 'game_revenue'].includes(txn.type);
                    return (
                      <div
                        key={txn.id}
                        onClick={() => setSelectedTxnDetails(txn)}
                        className={`p-4 rounded-2xl border ${borderColor} bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${isIncome ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {isIncome ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${textColor}`}>{txn.description}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-xs ${textSecondary}`}>{txn.date}</span>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-500">
                                {txn.type.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`font-extrabold text-base ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                            {isIncome ? '+' : '-'}{txn.amount.toString().includes('.') ? `$${txn.amount.toFixed(2)}` : `${txn.amount} Embers`}
                          </p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">
                            {txn.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-green-500" />
            <span>256-Bit Encrypted Financial Ledger</span>
          </div>
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl font-bold bg-gray-200 dark:bg-gray-800 ${textColor} hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors`}
          >
            Close Wallet
          </button>
        </div>
      </div>

      {/* Transaction Details Sub-Modal */}
      {selectedTxnDetails && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md ${cardBg} p-6 rounded-3xl border ${borderColor} space-y-5 shadow-2xl relative`}>
            <button
              onClick={() => setSelectedTxnDetails(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-2 pt-2">
              <div className="inline-flex p-3 rounded-full bg-green-500/20 text-green-500">
                <CheckCircle2 size={32} />
              </div>
              <h4 className={`text-xl font-bold ${textColor}`}>Transaction Receipt</h4>
              <p className={`text-xs ${textSecondary}`}>Reference ID: {selectedTxnDetails.id}</p>
            </div>

            <div className={`p-4 rounded-2xl border ${borderColor} bg-black/5 dark:bg-white/5 space-y-3 text-xs`}>
              <div className="flex justify-between">
                <span className={textSecondary}>Description</span>
                <span className={`font-bold ${textColor}`}>{selectedTxnDetails.description}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>Type</span>
                <span className={`font-bold capitalize ${textColor}`}>{selectedTxnDetails.type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>Date</span>
                <span className={`font-bold ${textColor}`}>{selectedTxnDetails.date}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondary}>Status</span>
                <span className="font-bold text-green-500 uppercase">{selectedTxnDetails.status}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between text-sm font-extrabold">
                <span className={textColor}>Total Amount</span>
                <span className="text-orange-500">
                  {selectedTxnDetails.amount.toString().includes('.') ? `$${selectedTxnDetails.amount.toFixed(2)}` : `${selectedTxnDetails.amount} Embers`}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  showToast('Downloaded PDF Receipt');
                  setSelectedTxnDetails(null);
                }}
                className={`flex-1 py-2.5 rounded-xl border ${borderColor} hover:bg-gray-800 ${textColor} font-bold text-xs flex items-center justify-center gap-2`}
              >
                <Download size={14} /> Download Receipt
              </button>
              <button
                onClick={() => setSelectedTxnDetails(null)}
                className={`flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletModal;


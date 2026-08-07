import React from 'react';
import { Profile, Theme } from '../types';
import { ChevronLeft, Zap } from 'lucide-react';

interface StreakPageProps {
    profile: Profile;
    onBack: () => void;
    // UI props
    textColor: string;
    textSecondary: string;
    cardBg: string;
    borderColor: string;
    currentTheme: Theme;
}

const StreakPage: React.FC<StreakPageProps> = ({ profile, onBack, textColor, textSecondary, cardBg, borderColor, currentTheme }) => {

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <button onClick={onBack} className={`p-2 ${cardBg} backdrop-blur-xl rounded-full border ${borderColor} ${textColor} hover:scale-105 transition-all`}>
                    <ChevronLeft size={24} />
                </button>
                <h2 className={`text-3xl font-bold ${textColor}`}>Your Streak</h2>
            </div>
            
            <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-8 border ${borderColor} shadow-lg text-center flex flex-col items-center`}>
                <p className={`${textSecondary} text-lg mb-4`}>Current Streak</p>
                <div className={`text-8xl font-bold bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent flex items-center gap-2`}>
                    {profile.streak} <Zap size={60} />
                </div>
                 <p className={`${textColor} font-semibold text-2xl mt-2`}>Days!</p>
                 <p className={`mt-6 max-w-md ${textSecondary}`}>
                    You're on a roll! Keep posting every day to extend your streak and unlock new rewards. Don't let the flame go out!
                 </p>
            </div>

            <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}>
                <h3 className={`font-bold text-xl ${textColor} mb-4`}>Streak History (Coming Soon)</h3>
                <p className={`${textSecondary}`}>Check back later to see a calendar view of your posting history and your all-time best streak.</p>
            </div>
        </div>
    );
};

export default StreakPage;
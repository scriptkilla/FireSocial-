import React from 'react';
import { Profile, Achievement, Theme } from '../types';
import { ChevronLeft } from 'lucide-react';

interface AchievementsPageProps {
    profile: Profile;
    allAchievements: Achievement[];
    onBack: () => void;
    // UI props
    textColor: string;
    textSecondary: string;
    cardBg: string;
    borderColor: string;
    currentTheme: Theme;
}

const AchievementsPage: React.FC<AchievementsPageProps> = ({ profile, allAchievements, onBack, textColor, textSecondary, cardBg, borderColor, currentTheme }) => {
    const unlockedCount = profile.unlockedAchievements.length;
    const totalCount = allAchievements.length;
    const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <button onClick={onBack} className={`p-2 ${cardBg} backdrop-blur-xl rounded-full border ${borderColor} ${textColor} hover:scale-105 transition-all`}>
                    <ChevronLeft size={24} />
                </button>
                <h2 className={`text-3xl font-bold ${textColor}`}>Your Achievements</h2>
            </div>
            
            <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}>
                <div className="flex justify-between items-center mb-2">
                    <p className={`${textColor} font-semibold`}>Progress</p>
                    <p className={`${textColor} font-bold`}>{unlockedCount} / {totalCount}</p>
                </div>
                <div className={`w-full h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden`}>
                    <div className={`h-full bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allAchievements.map(achievement => {
                    const isUnlocked = profile.unlockedAchievements.includes(achievement.id);
                    return (
                        <div key={achievement.id} className={`${cardBg} backdrop-blur-xl rounded-2xl p-4 border ${borderColor} flex items-center gap-4 transition-all ${!isUnlocked ? 'opacity-50' : ''}`}>
                            <div className={`text-4xl p-4 rounded-2xl`}>
                                {isUnlocked ? achievement.icon : '🔒'}
                            </div>
                            <div>
                                <h3 className={`font-bold ${textColor}`}>{achievement.name}</h3>
                                <p className={`text-sm ${textSecondary}`}>{achievement.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AchievementsPage;
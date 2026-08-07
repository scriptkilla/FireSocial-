import React from 'react';
import { Profile, Theme } from '../types';
import { ChevronLeft } from 'lucide-react';

interface TrophyPageProps {
    profile: Profile;
    onBack: () => void;
    // UI props
    textColor: string;
    textSecondary: string;
    cardBg: string;
    borderColor: string;
    currentTheme: Theme;
}

const TrophyPage: React.FC<TrophyPageProps> = ({ profile, onBack, textColor, textSecondary, cardBg, borderColor, currentTheme }) => {

    const trophies = [
        { icon: '🥇', name: 'Top Creator', description: 'Ranked #1 in weekly posts' },
        { icon: '🏅', name: 'Community Leader', description: 'Most engaging user this month' },
        { icon: '🎖️', name: 'Early Adopter', description: 'Joined FireSocial in the first week' },
        { icon: '🏆', name: 'Annual Champion', description: 'Top contributor of the year', locked: true },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <button onClick={onBack} className={`p-2 ${cardBg} backdrop-blur-xl rounded-full border ${borderColor} ${textColor} hover:scale-105 transition-all`}>
                    <ChevronLeft size={24} />
                </button>
                <h2 className={`text-3xl font-bold ${textColor}`}>Trophies</h2>
            </div>
            
            <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-6 border ${borderColor} shadow-lg`}>
               <p className={`${textSecondary}`}>Special awards for outstanding achievements on FireSocial.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trophies.map(trophy => {
                    return (
                        <div key={trophy.name} className={`${cardBg} backdrop-blur-xl rounded-2xl p-4 border ${borderColor} flex items-center gap-4 transition-all ${trophy.locked ? 'opacity-50' : ''}`}>
                            <div className={`text-4xl p-4 rounded-2xl`}>
                                {trophy.locked ? '🔒' : trophy.icon}
                            </div>
                            <div>
                                <h3 className={`font-bold ${textColor}`}>{trophy.name}</h3>
                                <p className={`text-sm ${textSecondary}`}>{trophy.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TrophyPage;
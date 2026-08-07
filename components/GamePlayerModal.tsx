
import React from 'react';
import { X, Flame, User } from 'lucide-react';
import { Game, Theme } from '../types';
import AvatarDisplay from './AvatarDisplay';

interface GamePlayerModalProps {
    game: Game;
    onClose: () => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const GamePlayerModal: React.FC<GamePlayerModalProps> = (props) => {
    const { game, onClose, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <div className={`w-full max-w-5xl h-[90vh] ${cardBg} backdrop-blur-xl border ${borderColor} rounded-3xl shadow-2xl flex flex-col overflow-hidden`}>
                {/* Header */}
                <div className={`flex justify-between items-center p-4 border-b ${borderColor} bg-black/20`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${currentTheme.from} ${currentTheme.to} text-white`}>
                            <span className="text-lg font-bold">JS</span>
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold ${textColor}`}>{game.title}</h2>
                            <div className="flex items-center gap-2">
                                <p className={`text-xs ${textSecondary}`}>by {game.creatorUsername}</p>
                                <span className="text-xs text-orange-500 font-semibold flex items-center gap-1">
                                    <Flame size={10} fill="currentColor" /> Earns Embers
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} className={textColor} /></button>
                </div>

                {/* Game Container */}
                <div className="flex-1 bg-black relative overflow-hidden">
                    <iframe 
                        srcDoc={game.code}
                        className="w-full h-full border-0"
                        title={game.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        sandbox="allow-scripts allow-same-origin allow-popups"
                    />
                </div>
                
                {/* Footer */}
                <div className={`p-4 border-t ${borderColor} bg-black/20 flex justify-between items-center text-sm`}>
                     <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2">
                             <User size={16} className={textSecondary} />
                             <span className={textColor}>{game.playCount.toLocaleString()} Plays</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <Flame size={16} className="text-orange-500" fill="currentColor" />
                             <span className={textColor}>{game.earnings.toLocaleString()} Embers Earned for Creator</span>
                         </div>
                     </div>
                     <p className={`text-xs ${textSecondary} italic`}>Playing this game supports {game.creatorUsername}!</p>
                </div>
            </div>
        </div>
    );
};

export default GamePlayerModal;

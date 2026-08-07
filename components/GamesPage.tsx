
import React, { useState, useEffect, useRef } from 'react';
import { Game, Theme } from '../types';
import { Gamepad2, Play, Trophy, Flame, User, Clock, Copy, X, Check, Palette, Users, Rocket, Grid, BarChart2, RefreshCw, Send, MessageSquare, Zap, ArrowRight, ChevronLeft, MonitorPlay, Star, Timer } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';
import { INITIAL_TOURNAMENTS, INITIAL_CHALLENGES, ALL_USERS_DATA } from '../data';

interface GamesPageProps {
    games: Game[];
    onPlay: (game: Game) => void;
    onCreateGame: () => void;
    onViewProfile: (username: string) => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

// --- MINI-GAMES DATA ---
const MINI_GAMES = [
  { id: 'trivia-battle', name: 'Trivia Battle', description: 'Test your knowledge against the clock', players: '1 Player', duration: '2 min', icon: '🧠', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'word-race', name: 'Word Race', description: 'Type fast to survive the falling words', players: '1 Player', duration: '1 min', icon: '🚀', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'quick-draw', name: 'Quick Draw', description: 'Draw the word so bots can guess it', players: '1 Player', duration: '3 min', icon: '🎨', color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { id: 'emoji-match', name: 'Emoji Match', description: 'Find the matching pairs (Coming Soon)', players: '1 Player', duration: '2-5 min', icon: '🎮', color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
];

// --- TRIVIA GAME ENGINE ---
const TRIVIA_QUESTIONS = [
    { q: "What is the capital of France?", a: ["London", "Berlin", "Paris", "Madrid"], correct: "Paris" },
    { q: "Which planet is known as the Red Planet?", a: ["Venus", "Mars", "Jupiter", "Saturn"], correct: "Mars" },
    { q: "Who wrote 'Romeo and Juliet'?", a: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correct: "William Shakespeare" },
    { q: "What is the largest mammal in the world?", a: ["Elephant", "Blue Whale", "Giraffe", "Great White Shark"], correct: "Blue Whale" },
    { q: "In which year did the Titanic sink?", a: ["1905", "1912", "1920", "1918"], correct: "1912" },
    { q: "What is the chemical symbol for Gold?", a: ["Au", "Ag", "Fe", "Pb"], correct: "Au" },
    { q: "How many continents are there?", a: ["5", "6", "7", "8"], correct: "7" },
    { q: "Which is the fastest land animal?", a: ["Lion", "Cheetah", "Horse", "Leopard"], correct: "Cheetah" }
];

const TriviaGame: React.FC<{ onClose: () => void, theme: Theme, cardBg: string, borderColor: string, textColor: string }> = ({ onClose, theme, cardBg, borderColor, textColor }) => {
    const [gameState, setGameState] = useState<'playing' | 'result'>('playing');
    const [score, setScore] = useState(0);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [streak, setStreak] = useState(0);
    const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);

    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0 && !selectedAnswer) {
            const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && gameState === 'playing' && !selectedAnswer) {
            handleAnswer(''); // Time out counts as wrong
        }
    }, [timeLeft, gameState, selectedAnswer]);

    const handleAnswer = (ans: string) => {
        setSelectedAnswer(ans);
        const isCorrect = ans === TRIVIA_QUESTIONS[currentQIndex].correct;
        setAnswerStatus(isCorrect ? 'correct' : 'incorrect');
        
        if (isCorrect) {
            const points = 100 + (streak * 20) + (timeLeft * 5);
            setScore(s => s + points);
            setStreak(s => s + 1);
        } else {
            setStreak(0);
        }

        setTimeout(() => {
            if (currentQIndex < TRIVIA_QUESTIONS.length - 1) {
                setCurrentQIndex(prev => prev + 1);
                setTimeLeft(15);
                setSelectedAnswer(null);
                setAnswerStatus(null);
            } else {
                setGameState('result');
            }
        }, 1500);
    };

    if (gameState === 'result') {
        return (
            <div className={`flex flex-col items-center justify-center h-full text-center p-8 ${cardBg} rounded-2xl border ${borderColor} animate-in zoom-in duration-300`}>
                <Trophy size={80} className="text-yellow-500 mb-6 animate-bounce" />
                <h2 className={`text-4xl font-black mb-2 ${textColor}`}>Game Over!</h2>
                <div className="mb-8">
                    <p className="text-lg text-gray-500">Final Score</p>
                    <p className={`text-6xl font-black bg-gradient-to-r ${theme.from} ${theme.to} bg-clip-text text-transparent`}>{score}</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => { setGameState('playing'); setScore(0); setCurrentQIndex(0); setTimeLeft(15); setStreak(0); setSelectedAnswer(null); setAnswerStatus(null); }} className={`px-6 py-3 rounded-xl border ${borderColor} font-bold hover:bg-white/5 transition-colors ${textColor}`}>
                        Play Again
                    </button>
                    <button onClick={onClose} className={`px-8 py-3 bg-gradient-to-r ${theme.from} ${theme.to} text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg`}>
                        Exit
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = TRIVIA_QUESTIONS[currentQIndex];

    return (
        <div className={`h-full flex flex-col ${cardBg} rounded-2xl border ${borderColor} relative overflow-hidden`}>
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><ChevronLeft className={textColor}/></button>
                    <div>
                        <h3 className={`font-bold text-lg ${textColor}`}>Trivia Battle</h3>
                        <p className="text-xs text-gray-400">Question {currentQIndex + 1} of {TRIVIA_QUESTIONS.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                     {streak > 1 && (
                        <div className="flex items-center gap-1 text-orange-500 font-bold animate-pulse">
                            <Flame size={18} fill="currentColor" /> {streak}x Streak
                        </div>
                    )}
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Score</p>
                        <p className="font-mono font-bold text-xl text-white">{score}</p>
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 p-8 flex flex-col justify-center max-w-3xl mx-auto w-full">
                {/* Timer Bar */}
                <div className="w-full bg-gray-700/30 h-3 rounded-full mb-8 overflow-hidden relative">
                    <div 
                        className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 5 ? 'bg-red-500' : `bg-gradient-to-r ${theme.from} ${theme.to}`}`} 
                        style={{ width: `${(timeLeft / 15) * 100}%` }}
                    />
                </div>

                <h3 className={`text-2xl md:text-3xl font-bold text-center mb-12 ${textColor} leading-tight`}>{currentQ.q}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQ.a.map((ans) => {
                        let btnClass = `p-6 rounded-2xl text-lg font-semibold transition-all border-2 transform `;
                        
                        if (selectedAnswer) {
                            if (ans === currentQ.correct) btnClass += `bg-green-500/20 border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] scale-[1.02]`;
                            else if (ans === selectedAnswer) btnClass += `bg-red-500/20 border-red-500 text-red-500`;
                            else btnClass += `border-transparent bg-black/20 opacity-50`;
                        } else {
                            btnClass += `border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] ${textColor} shadow-sm`;
                        }

                        return (
                            <button
                                key={ans}
                                onClick={() => !selectedAnswer && handleAnswer(ans)}
                                disabled={selectedAnswer !== null}
                                className={btnClass}
                            >
                                {ans}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// --- DRAWING GAME ENGINE ---
const DRAWING_WORDS = ['Cat', 'House', 'Tree', 'Car', 'Pizza', 'Sun', 'Flower', 'Computer', 'Rocket', 'Robot'];
const PALETTE = ['#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#71717a'];

const DrawingGame: React.FC<{ onClose: () => void, theme: Theme, cardBg: string, borderColor: string, textColor: string }> = ({ onClose, theme, cardBg, borderColor, textColor }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(5);
    const [guesses, setGuesses] = useState<{user: string, text: string, correct: boolean}[]>([]);
    const [word] = useState(() => DRAWING_WORDS[Math.floor(Math.random() * DRAWING_WORDS.length)]);
    const [timeLeft, setTimeLeft] = useState(60);
    const [hasWon, setHasWon] = useState(false);
    const [hasDrawingStarted, setHasDrawingStarted] = useState(false);
    const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
    
    // Bot logic
    useEffect(() => {
        if (!hasDrawingStarted || hasWon) return;

        // Random bot guesses
        const guessInterval = setInterval(() => {
            if (Math.random() > 0.6) {
                const randomUser = ALL_USERS_DATA[Math.floor(Math.random() * ALL_USERS_DATA.length)];
                const randomWord = DRAWING_WORDS[Math.floor(Math.random() * DRAWING_WORDS.length)];
                if (randomWord !== word) {
                    setGuesses(prev => [...prev.slice(-6), { user: randomUser.name, text: randomWord, correct: false }]);
                }
            }
        }, 2000);
        
        // Bot eventually guesses right
        const winTimer = setTimeout(() => {
             const randomUser = ALL_USERS_DATA[Math.floor(Math.random() * ALL_USERS_DATA.length)];
             setGuesses(prev => [...prev, { user: randomUser.name, text: word, correct: true }]);
             setHasWon(true);
        }, Math.random() * 15000 + 15000); // 15-30 seconds in

        return () => {
            clearInterval(guessInterval);
            clearTimeout(winTimer);
        };
    }, [hasDrawingStarted, hasWon, word]);

    // Timer
    useEffect(() => {
        if (timeLeft > 0 && !hasWon) {
            const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [timeLeft, hasWon]);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (hasWon) return;
        setHasDrawingStarted(true);
        setIsDrawing(true);
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx || !canvasRef.current) return;

        const { offsetX, offsetY } = getCoordinates(e, canvasRef.current);
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || hasWon) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx || !canvasRef.current) return;

        const { offsetX, offsetY } = getCoordinates(e, canvasRef.current);
        ctx.lineTo(offsetX, offsetY);
        ctx.strokeStyle = tool === 'eraser' ? '#1a1a1a' : color; // Eraser matches bg
        ctx.lineWidth = brushSize;
        ctx.stroke();
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }
        const rect = canvas.getBoundingClientRect();
        return {
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top
        };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    return (
        <div className={`h-full flex flex-col gap-4 ${cardBg} p-4 rounded-2xl border ${borderColor}`}>
            {/* Game Area */}
            <div className="flex-1 flex flex-col gap-2 relative min-h-[50vh]">
                <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4">
                         <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full"><ChevronLeft size={20} className={textColor}/></button>
                         <div className={`text-xl md:text-2xl font-black ${textColor}`}>DRAW: <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.from} ${theme.to} uppercase tracking-wider`}>{word}</span></div>
                    </div>
                    <div className={`font-mono font-bold text-xl ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>{timeLeft}s</div>
                </div>
                
                {/* Toolbar */}
                <div className="flex items-center gap-2 p-2 bg-black/20 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
                    {PALETTE.map(c => (
                        <button 
                            key={c} 
                            onClick={() => { setColor(c); setTool('brush'); }} 
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c && tool === 'brush' ? 'border-white scale-110' : 'border-transparent'}`} 
                            style={{ backgroundColor: c }} 
                        />
                    ))}
                    <div className="w-px h-6 bg-white/10 mx-2"></div>
                    <button onClick={() => setTool('eraser')} className={`p-2 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`} title="Eraser"><Palette size={18} /></button>
                    <div className="w-px h-6 bg-white/10 mx-2"></div>
                    <input type="range" min="2" max="20" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-24 accent-white" title="Size" />
                    <button onClick={clearCanvas} className="ml-auto p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30" title="Clear All"><RefreshCw size={18}/></button>
                </div>

                <div className="flex-1 relative bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden cursor-crosshair shadow-inner">
                    <canvas 
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={() => setIsDrawing(false)}
                        onMouseLeave={() => setIsDrawing(false)}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={() => setIsDrawing(false)}
                        className="w-full h-full touch-none"
                    />
                    {!hasDrawingStarted && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <p className="text-white/20 text-2xl font-bold flex items-center gap-2"><Palette/> Start Drawing Here</p>
                        </div>
                    )}
                    {hasWon && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center animate-in zoom-in">
                            <Check size={64} className="text-green-500 mb-4" />
                            <h2 className="text-3xl font-bold text-white">Round Over!</h2>
                            <p className="text-lg text-gray-300 mb-6">The word was guessed correctly!</p>
                            <button onClick={onClose} className={`px-6 py-2 bg-gradient-to-r ${theme.from} ${theme.to} text-white rounded-lg font-bold shadow-lg hover:scale-105 transition-transform`}>Back to Arcade</button>
                        </div>
                    )}
                     {timeLeft === 0 && !hasWon && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center animate-in zoom-in">
                            <X size={64} className="text-red-500 mb-4" />
                            <h2 className="text-3xl font-bold text-white">Time's Up!</h2>
                            <p className="text-gray-400 mb-6">The word was: <span className="text-white font-bold">{word}</span></p>
                            <button onClick={onClose} className={`px-6 py-2 bg-white/10 text-white rounded-lg font-bold hover:bg-white/20 border border-white/20`}>Exit</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Sidebar - Moved to Bottom for vertical layout */}
            <div className={`w-full h-48 flex flex-col bg-black/20 rounded-xl overflow-hidden border ${borderColor}`}>
                <div className="p-3 font-bold border-b border-white/10 bg-black/20 flex items-center gap-2 text-white"><MessageSquare size={16}/> Game Chat</div>
                <div className="flex-1 p-3 overflow-y-auto space-y-2 flex flex-col-reverse custom-scrollbar">
                    {guesses.map((g, i) => (
                        <div key={i} className={`text-sm p-2 rounded-lg animate-in slide-in-from-left-2 ${g.correct ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5'}`}>
                            <span className={`font-bold ${g.correct ? 'text-green-400' : 'text-white'}`}>{g.user}: </span> 
                            <span className={g.correct ? 'text-green-400 font-bold' : 'text-gray-300'}>{g.text}</span>
                        </div>
                    ))}
                </div>
                <div className="p-3 border-t border-white/10 bg-black/20">
                     <div className="flex gap-2">
                        <input type="text" disabled placeholder="You are drawing..." className="flex-1 bg-transparent border-none text-sm focus:ring-0 text-gray-500 cursor-not-allowed" />
                     </div>
                </div>
            </div>
        </div>
    );
};


// --- WORD RACE GAME ENGINE ---
const WORDS_TO_TYPE = ["react", "typescript", "component", "interface", "function", "variable", "constant", "hook", "state", "effect", "context", "provider", "reducer", "callback", "memo", "ref", "router", "props", "element", "node", "render", "mount", "update", "unmount", "class", "style", "index", "value", "input", "form", "event", "handler", "click", "submit", "change", "focus", "blur", "key", "mouse", "touch"];

const WordRaceGame: React.FC<{ onClose: () => void, theme: Theme, cardBg: string, borderColor: string, textColor: string }> = ({ onClose, theme, cardBg, borderColor, textColor }) => {
    const [currentWord, setCurrentWord] = useState('');
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
    const [streak, setStreak] = useState(0);

    // Initialize
    useEffect(() => {
        nextWord();
    }, []);

    // Timer
    useEffect(() => {
        if (timeLeft > 0 && gameState === 'playing') {
            const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearTimeout(t);
        } else if (timeLeft === 0) {
            setGameState('finished');
        }
    }, [timeLeft, gameState]);

    const nextWord = () => {
        const random = WORDS_TO_TYPE[Math.floor(Math.random() * WORDS_TO_TYPE.length)];
        setCurrentWord(random);
        setInput('');
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInput(val);
        if (val.toLowerCase() === currentWord) {
            setScore(s => s + 10 + streak);
            setStreak(s => s + 1);
            nextWord();
        } else if (!currentWord.startsWith(val.toLowerCase())) {
             setStreak(0); // Break streak on typo
        }
    };

    if (gameState === 'finished') {
        return (
             <div className={`flex flex-col items-center justify-center h-full text-center p-8 ${cardBg} rounded-2xl border ${borderColor} animate-in zoom-in`}>
                <Rocket size={80} className="text-purple-500 mb-6 animate-pulse" />
                <h2 className={`text-4xl font-black mb-2 ${textColor}`}>Time's Up!</h2>
                <div className="mb-8">
                    <p className="text-lg text-gray-500">Final Score</p>
                    <p className={`text-6xl font-black bg-gradient-to-r ${theme.from} ${theme.to} bg-clip-text text-transparent`}>{score}</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => { setGameState('playing'); setScore(0); setTimeLeft(60); nextWord(); setStreak(0); }} className={`px-6 py-3 rounded-xl border ${borderColor} font-bold hover:bg-white/5 ${textColor}`}>Retry</button>
                    <button onClick={onClose} className={`px-8 py-3 bg-gradient-to-r ${theme.from} ${theme.to} text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform`}>Exit</button>
                </div>
            </div>
        );
    }

    return (
        <div className={`h-full flex flex-col items-center justify-center ${cardBg} rounded-2xl border ${borderColor} relative overflow-hidden`}>
             <div className="absolute top-6 left-6 flex items-center gap-3">
                 <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><ChevronLeft className={textColor}/></button>
                 <div>
                     <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Score</p>
                     <p className={`text-2xl font-black ${textColor}`}>{score}</p>
                 </div>
             </div>
             <div className="absolute top-6 right-6 text-right">
                 <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Time</p>
                 <p className={`text-2xl font-mono font-bold ${timeLeft < 10 ? 'text-red-500' : textColor}`}>{timeLeft}</p>
             </div>
             
             <div className="mb-12 text-center">
                 {streak > 2 && <div className="mb-4 text-orange-500 font-bold animate-bounce">{streak}x Streak!</div>}
                 <p className="text-sm text-gray-400 mb-2 uppercase tracking-widest">Type this word:</p>
                 <h1 className={`text-6xl font-black tracking-tight select-none transition-all transform ${input === currentWord ? 'scale-110 text-green-500' : textColor}`}>
                     {currentWord.split('').map((char, i) => (
                         <span key={i} className={i < input.length ? (input[i] === char ? 'text-green-500' : 'text-red-500') : 'opacity-50'}>{char}</span>
                     ))}
                 </h1>
             </div>

             <input 
                autoFocus
                type="text" 
                value={input} 
                onChange={handleInput} 
                className={`w-full max-w-md bg-black/10 border-b-4 ${borderColor} text-center text-4xl py-4 focus:outline-none focus:border-purple-500 transition-colors ${textColor} font-mono`}
                placeholder="Type here..."
             />
        </div>
    );
};


// --- GAME LOBBY ---
const GameLobby: React.FC<{ game: any, onStart: () => void, onCancel: () => void, theme: Theme, cardBg: string, borderColor: string, textColor: string }> = ({ game, onStart, onCancel, theme, cardBg, borderColor, textColor }) => {
    const [players, setPlayers] = useState([ALL_USERS_DATA[0]]);
    
    useEffect(() => {
        const interval = setInterval(() => {
            if (players.length < 4) { 
                const randomFriend = ALL_USERS_DATA.filter(u => !players.find(p => p.id === u.id))[0];
                if(randomFriend) setPlayers(prev => [...prev, randomFriend]);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [players]);

    return (
        <div className={`flex flex-col items-center justify-center h-full p-8 ${cardBg} rounded-2xl border ${borderColor} relative`}>
            <button onClick={onCancel} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"><X size={24} className={textColor}/></button>
            
            <div className="text-6xl mb-6 bg-gradient-to-br from-gray-800 to-black p-6 rounded-3xl shadow-2xl border border-white/10">{game.icon}</div>
            <h2 className={`text-3xl font-bold mb-2 ${textColor}`}>{game.name}</h2>
            <p className="text-gray-500 mb-8">{game.description}</p>
            
            <div className="flex items-center gap-3 mb-12 px-6 py-3 bg-black/30 rounded-xl border border-white/10">
                <span className="text-gray-400 uppercase text-xs font-bold tracking-widest">CODE:</span>
                <span className={`font-mono font-bold text-2xl tracking-widest ${textColor}`}>PLAY24</span>
                <button className="ml-2 p-2 hover:bg-white/10 rounded-lg transition-colors"><Copy size={16} className="text-gray-400"/></button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 w-full max-w-3xl">
                {players.map(p => (
                    <div key={p.id} className="flex flex-col items-center animate-in zoom-in duration-300">
                        <div className="relative">
                            <AvatarDisplay avatar={p.avatar} size="w-20 h-20" fontSize="text-4xl" />
                            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-4 border-[#121212]"><Check size={14}/></div>
                        </div>
                        <span className={`mt-3 font-semibold text-sm ${textColor}`}>{p.name}</span>
                    </div>
                ))}
                 {players.length < 4 && (
                    <div className="flex flex-col items-center opacity-40 animate-pulse">
                        <div className="w-20 h-20 rounded-full bg-black/20 border-2 border-dashed border-white/30 flex items-center justify-center">
                            <User size={32}/>
                        </div>
                        <span className="mt-3 font-medium text-sm text-gray-400">Waiting...</span>
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                 <button onClick={onCancel} className={`px-8 py-4 rounded-2xl font-bold border ${borderColor} hover:bg-white/5 transition-colors ${textColor}`}>Cancel</button>
                 <button 
                    onClick={onStart}
                    className={`px-12 py-4 bg-gradient-to-r ${theme.from} ${theme.to} text-white rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl flex items-center gap-2`}
                 >
                    <Play fill="currentColor" /> Start Game
                 </button>
            </div>
        </div>
    );
};

// --- MAIN GAMES PAGE COMPONENT ---

const GamesPage: React.FC<GamesPageProps> = (props) => {
    const { games, onPlay, onCreateGame, onViewProfile, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;
    
    const [activeTab, setActiveTab] = useState<'dashboard' | 'arcade' | 'tournaments' | 'leaderboards'>('dashboard');
    const [activeMiniGame, setActiveMiniGame] = useState<string | null>(null);
    const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

    // Reset game state when switching tabs
    useEffect(() => {
        setActiveMiniGame(null);
        setSelectedGameId(null);
    }, [activeTab]);

    const handleMiniGameClick = (gameId: string) => {
        if (gameId === 'emoji-match') {
            alert("Coming soon!");
            return;
        }
        setSelectedGameId(gameId);
        setActiveMiniGame('lobby');
    };

    const handleStartGame = () => {
        if (selectedGameId === 'trivia-battle') setActiveMiniGame('trivia');
        else if (selectedGameId === 'quick-draw') setActiveMiniGame('drawing');
        else if (selectedGameId === 'word-race') setActiveMiniGame('wordrace');
    };

    // --- RENDERERS ---

    const renderDashboard = () => (
        <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className={`${cardBg} p-6 rounded-3xl border ${borderColor} relative overflow-hidden group hover:border-white/20 transition-colors`}>
                     <div className={`absolute top-0 right-0 p-6 opacity-10 transform scale-150 group-hover:scale-175 transition-transform duration-500`}><Gamepad2 size={64}/></div>
                     <p className={`${textSecondary} font-bold uppercase text-xs tracking-wider mb-1`}>Games Played</p>
                     <p className={`text-4xl font-black ${textColor}`}>24</p>
                 </div>
                 <div className={`${cardBg} p-6 rounded-3xl border ${borderColor} relative overflow-hidden group hover:border-white/20 transition-colors`}>
                     <div className={`absolute top-0 right-0 p-6 opacity-10 transform scale-150 group-hover:scale-175 transition-transform duration-500 text-orange-500`}><Flame size={64}/></div>
                     <p className={`${textSecondary} font-bold uppercase text-xs tracking-wider mb-1`}>Sparks Earned</p>
                     <p className={`text-4xl font-black ${textColor}`}>1,250</p>
                 </div>
                 <div className={`${cardBg} p-6 rounded-3xl border ${borderColor} relative overflow-hidden group hover:border-white/20 transition-colors`}>
                     <div className={`absolute top-0 right-0 p-6 opacity-10 transform scale-150 group-hover:scale-175 transition-transform duration-500 text-yellow-500`}><Trophy size={64}/></div>
                     <p className={`${textSecondary} font-bold uppercase text-xs tracking-wider mb-1`}>Rank</p>
                     <p className={`text-4xl font-black ${textColor}`}>#42</p>
                 </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-xl font-bold flex items-center gap-2 ${textColor}`}><Users className="text-blue-500" /> Friends Playing</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                     {[1002, 1003, 1004].map(id => {
                         const user = ALL_USERS_DATA.find(u => u.id === id);
                         if(!user) return null;
                         return (
                             <button onClick={() => onViewProfile(user.username)} key={user.id} className={`${cardBg} p-4 rounded-2xl border ${borderColor} flex items-center gap-4 min-w-[200px] hover:bg-white/5 transition-colors cursor-pointer text-left`}>
                                 <div className="relative">
                                     <AvatarDisplay avatar={user.avatar} size="w-12 h-12" />
                                     <div className="absolute -bottom-1 -right-1 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-[#121212]"></div>
                                 </div>
                                 <div>
                                     <p className={`font-bold ${textColor}`}>{user.name}</p>
                                     <p className="text-xs text-green-400 font-medium">Playing Word Race</p>
                                 </div>
                             </button>
                         );
                     })}
                </div>
            </div>

            <div>
                <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${textColor}`}><Zap className="text-yellow-500" /> Daily Challenges</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {INITIAL_CHALLENGES.map(challenge => (
                        <div key={challenge.id} className={`${cardBg} p-5 rounded-2xl border ${borderColor} relative overflow-hidden`}>
                            <div className="flex justify-between items-start mb-3">
                                <h4 className={`font-bold ${textColor}`}>{challenge.title}</h4>
                                <span className="text-xs font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded-lg flex items-center gap-1">
                                    +{challenge.reward} <Flame size={10} fill="currentColor" />
                                </span>
                            </div>
                            <p className={`text-sm ${textSecondary} mb-4 line-clamp-2`}>{challenge.description}</p>
                            <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full bg-gradient-to-r ${currentTheme.from} ${currentTheme.to}`} 
                                    style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-2 text-xs font-medium">
                                <span className={textSecondary}>{Math.round((challenge.progress / challenge.target) * 100)}% Complete</span>
                                <span className={textColor}>{challenge.progress}/{challenge.target}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderArcade = () => (
        <div className="space-y-8 animate-in fade-in">
             <div className={`relative rounded-3xl overflow-hidden border ${borderColor} shadow-2xl group`}>
                 <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-purple-900 opacity-90"></div>
                 <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80" className="w-full h-72 object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" />
                 <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12">
                     <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white w-fit mb-4 backdrop-blur-md">ARCADE ZONE</span>
                     <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">Play, Compete,<br/>Win Sparks.</h2>
                     <div className="flex gap-4">
                        <button onClick={() => handleMiniGameClick('word-race')} className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                            <Play size={18} fill="currentColor" /> Quick Play
                        </button>
                     </div>
                 </div>
             </div>

            <div>
                <h3 className={`text-xl font-bold mb-4 ${textColor}`}>Mini-Games</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MINI_GAMES.map(game => (
                        <button 
                            key={game.id} 
                            onClick={() => handleMiniGameClick(game.id)}
                            className={`${cardBg} p-5 rounded-2xl border ${borderColor} hover:border-gray-500 transition-all text-left group flex items-center gap-5 hover:bg-white/5`}
                        >
                            <div className={`w-16 h-16 rounded-2xl ${game.bg} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                                {game.icon}
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-bold text-lg ${textColor}`}>{game.name}</h4>
                                <p className={`text-sm ${textSecondary} mb-2`}>{game.description}</p>
                                <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                                    <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded"><Users size={12}/> {game.players}</span>
                                    <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded"><Clock size={12}/> {game.duration}</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-full bg-white/5 text-gray-400 group-hover:bg-white group-hover:text-black transition-colors">
                                <Play size={20} fill="currentColor" className="ml-0.5"/>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-xl font-bold ${textColor}`}>Community Games</h3>
                    <button onClick={onCreateGame} className={`text-sm font-bold ${currentTheme.text} hover:underline flex items-center gap-1`}>Create New <ArrowRight size={14}/></button>
                </div>
                {games.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {games.map(game => (
                            <div key={game.id} className={`${cardBg} rounded-2xl border ${borderColor} overflow-hidden group cursor-pointer hover:-translate-y-2 transition-transform shadow-lg`} onClick={() => onPlay(game)}>
                                <div className="aspect-video bg-gray-900 relative overflow-hidden">
                                    <img src={game.previewImage} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <span className="bg-white text-black font-bold px-6 py-3 rounded-full flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform"><Play size={16} fill="currentColor"/> Play Now</span>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">JS</div>
                                </div>
                                <div className="p-4">
                                    <h4 className={`font-bold text-lg truncate ${textColor}`}>{game.title}</h4>
                                    <div className="flex justify-between items-center mt-2">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <User size={12} /> <span>{game.creatorUsername}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-bold text-orange-500">
                                            <Flame size={10} fill="currentColor" /> {game.playCount}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`p-12 text-center rounded-3xl border-2 border-dashed ${borderColor} bg-black/5`}>
                        <Rocket size={48} className={`mx-auto mb-4 ${textSecondary} opacity-50`} />
                        <p className={`font-bold ${textColor}`}>No community games yet.</p>
                        <p className={`text-sm ${textSecondary} mt-1 mb-6`}>Be the first to create a game using our AI engine.</p>
                        <button onClick={onCreateGame} className={`px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-colors`}>Launch Game Studio</button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderTournaments = () => (
        <div className="space-y-8 animate-in fade-in">
            {INITIAL_TOURNAMENTS.length > 0 && (
                 <div className="relative rounded-3xl overflow-hidden border-4 border-yellow-500/30 shadow-2xl shadow-yellow-900/20 group">
                     <div className="absolute inset-0 bg-black/60 z-10 group-hover:bg-black/50 transition-colors"></div>
                     <img src={INITIAL_TOURNAMENTS[0].image} className="w-full h-64 md:h-80 object-cover transform group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6">
                         <div className="flex items-center gap-2 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-black mb-4 animate-pulse">
                             <Trophy size={14} fill="currentColor" /> FEATURED TOURNAMENT
                         </div>
                         <h2 className="text-4xl md:text-6xl font-black text-white mb-2">{INITIAL_TOURNAMENTS[0].title}</h2>
                         <p className="text-xl text-gray-200 mb-8 max-w-xl">{INITIAL_TOURNAMENTS[0].game} Championship • {INITIAL_TOURNAMENTS[0].prizePool.toLocaleString()} Sparks Prize Pool</p>
                         <button className="px-10 py-4 bg-yellow-500 text-black rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-xl shadow-yellow-500/20">
                             Enter Now
                         </button>
                     </div>
                 </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {INITIAL_TOURNAMENTS.slice(1).map(t => (
                    <div key={t.id} className={`${cardBg} rounded-2xl border ${borderColor} overflow-hidden group flex hover:border-white/20 transition-all`}>
                        <div className="w-1/3 relative">
                            <img src={t.image} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40"></div>
                        </div>
                        <div className="w-2/3 p-5 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`font-bold text-lg leading-tight ${textColor}`}>{t.title}</h4>
                            </div>
                            <p className={`text-sm ${textSecondary} mb-4`}>{t.game}</p>
                            <div className="flex items-center gap-4 text-xs font-bold mb-4">
                                <span className="text-yellow-500 flex items-center gap-1"><Trophy size={12}/> {t.prizePool.toLocaleString()}</span>
                                <span className="text-gray-500 flex items-center gap-1"><Clock size={12}/> {t.timeLeft} left</span>
                            </div>
                            <button className={`w-full py-2 rounded-lg border ${borderColor} text-sm font-bold hover:bg-white/5 transition-colors`}>View Details</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // --- MAIN RETURN ---
    if (activeMiniGame) {
        // In-Game Views
        if (activeMiniGame === 'lobby' && selectedGameId) {
            const game = MINI_GAMES.find(g => g.id === selectedGameId);
            return <GameLobby game={game} onStart={handleStartGame} onCancel={() => setActiveMiniGame(null)} theme={currentTheme} cardBg={cardBg} borderColor={borderColor} textColor={textColor} />;
        }
        if (activeMiniGame === 'trivia') {
            return <TriviaGame onClose={() => setActiveMiniGame(null)} theme={currentTheme} cardBg={cardBg} borderColor={borderColor} textColor={textColor} />;
        }
        if (activeMiniGame === 'drawing') {
            return <DrawingGame onClose={() => setActiveMiniGame(null)} theme={currentTheme} cardBg={cardBg} borderColor={borderColor} textColor={textColor} />;
        }
        if (activeMiniGame === 'wordrace') {
            return <WordRaceGame onClose={() => setActiveMiniGame(null)} theme={currentTheme} cardBg={cardBg} borderColor={borderColor} textColor={textColor} />;
        }
    }

    return (
        <div className="flex flex-col gap-6 min-h-[80vh]">
            {/* Top Navigation Bar (Previously Sidebar) */}
            <div className={`w-full flex-shrink-0 flex flex-row gap-2 overflow-x-auto no-scrollbar ${cardBg} p-3 rounded-3xl border ${borderColor} sticky top-4 z-10`}>
                <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold whitespace-nowrap transition-colors ${activeTab === 'dashboard' ? `bg-white/10 ${textColor} shadow-sm` : `${textSecondary} hover:bg-white/5`}`}>
                    <Grid size={20} /> Dashboard
                </button>
                <button onClick={() => setActiveTab('arcade')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold whitespace-nowrap transition-colors ${activeTab === 'arcade' ? `bg-white/10 ${textColor} shadow-sm` : `${textSecondary} hover:bg-white/5`}`}>
                    <Gamepad2 size={20} /> Arcade
                </button>
                <button onClick={() => setActiveTab('tournaments')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold whitespace-nowrap transition-colors ${activeTab === 'tournaments' ? `bg-white/10 ${textColor} shadow-sm` : `${textSecondary} hover:bg-white/5`}`}>
                    <Trophy size={20} /> Tournaments
                </button>
                <div className="border-l border-white/5 mx-2"></div>
                <button onClick={onCreateGame} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold whitespace-nowrap text-purple-400 hover:bg-purple-500/10 transition-colors`}>
                    <Rocket size={20} /> Create Game
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'arcade' && renderArcade()}
                {activeTab === 'tournaments' && renderTournaments()}
                {activeTab === 'leaderboards' && (
                     <div className={`${cardBg} rounded-3xl border ${borderColor} p-8 text-center`}>
                         <BarChart2 size={48} className={`mx-auto mb-4 ${textSecondary}`} />
                         <h3 className={`text-xl font-bold ${textColor}`}>Leaderboards</h3>
                         <p className={textSecondary}>Global rankings coming soon.</p>
                     </div>
                )}
            </div>
        </div>
    );
};

export default GamesPage;

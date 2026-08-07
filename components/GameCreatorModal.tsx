
import React, { useState, useEffect, useRef } from 'react';
import { X, Gamepad2, Sparkles, AlertTriangle, KeyRound, Bot, Wand2, Users, FileText, Palette, Cpu, Music, ShieldCheck, Play, UploadCloud, Code, Copy, Check } from 'lucide-react';
import { Theme } from '../types';
import { GoogleGenAI, Modality } from '@google/genai';
import { API_CONFIG } from '../constants';


// Props definition
interface GameCreatorModalProps {
    show: boolean;
    onClose: () => void;
    onDeployGame: (gameIdea: string, previewImage: string, code: string) => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

// --- Data Structures ---
const QUICK_IDEAS = ['Space exploration RPG', 'Cozy farming simulator', 'Cyberpunk detective mystery'];

const AGENT_ICONS: { [key: string]: React.ElementType } = {
    'Creative Director': Users,
    'Game Designer': FileText,
    'Art Director': Palette,
    'Technical Director': Cpu,
    'Narrative Agent': FileText,
    'Sound Designer': Music,
    'QA Agent': ShieldCheck,
    'System': Bot,
};

type Activity = {
    agent: string;
    action: string;
    details?: string;
    type: 'analysis' | 'design' | 'creation' | 'writing' | 'technical' | 'testing' | 'system';
    timestamp: string;
};

type AgentMessage = {
    id: number;
    agent: string;
    content: string;
    type: 'proposal' | 'suggestion' | 'feedback' | 'decision' | 'update';
};

type Conversation = {
    id: number;
    topic: string;
    participants: string[];
    messages: AgentMessage[];
    decision?: string;
};

// --- Sub-Components ---
interface GameIdeaInputProps {
    gameIdea: string;
    setGameIdea: (value: string) => void;
    startDevelopment: () => void;
    isGenerating: boolean;
    textSecondary: string;
    cardBg: string;
    borderColor: string;
    currentTheme: Theme;
}
const GameIdeaInput: React.FC<GameIdeaInputProps> = ({ gameIdea, setGameIdea, startDevelopment, isGenerating, textSecondary, cardBg, borderColor, currentTheme }) => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-3xl font-bold mb-2">Describe Your Game Idea</h3>
        <p className={`${textSecondary} mb-6 max-w-lg`}>Just give us the basic concept. Our AI team will handle the rest, from design to development.</p>
        <textarea
            value={gameIdea}
            onChange={(e) => setGameIdea(e.target.value)}
            placeholder="Example: 'A puzzle game where you manipulate time to solve environmental challenges in a mysterious ancient temple'"
            className={`w-full max-w-2xl p-4 ${cardBg} rounded-2xl border ${borderColor} resize-none focus:outline-none focus:ring-2 ${currentTheme.ring}`}
            rows={4}
        />
        <div className="flex gap-2 mt-4">
            {QUICK_IDEAS.map(idea => (
                <button key={idea} onClick={() => setGameIdea(idea)} className={`px-3 py-1 text-sm ${cardBg} border ${borderColor} rounded-full hover:bg-white/10`}>
                    {idea}
                </button>
            ))}
        </div>
        <button
            onClick={startDevelopment}
            disabled={!gameIdea.trim() || isGenerating}
            className={`mt-8 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3`}
        >
            {isGenerating ? <><Wand2 className="animate-spin" /> Generating...</> : <><Sparkles /> Create My Game</>}
        </button>
    </div>
);

const ActivityItem: React.FC<{ activity: Activity, textColor: string, textSecondary: string, isActive: boolean }> = ({ activity, textColor, textSecondary, isActive }) => {
    const Icon = AGENT_ICONS[activity.agent] || Bot;
    return (
        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10">
            <div className={`p-2 rounded-lg bg-black/20 ${textSecondary}`}><Icon size={20} /></div>
            <div className="flex-1">
                <p className={`font-semibold ${textColor} flex items-center gap-2`}>
                    {activity.agent}
                    {isActive && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>}
                </p>
                <p className={`text-sm ${textSecondary}`}>{activity.action}</p>
            </div>
            <p className={`text-xs ${textSecondary} flex-shrink-0`}>{activity.timestamp}</p>
        </div>
    );
};

const ConversationThread: React.FC<{ conversation: Conversation, borderColor: string, textColor: string, textSecondary: string, currentTheme: Theme }> = ({ conversation, borderColor, textColor, textSecondary, currentTheme }) => (
    <div className={`p-2 rounded-lg border ${borderColor} bg-black/5 dark:bg-white/5 mb-3`}>
        <h4 className="font-bold text-sm px-2 mb-2">{conversation.topic}</h4>
        <div className="space-y-2">
            {conversation.messages.map(msg => (
                <div key={msg.id} className="flex items-start gap-2 text-xs">
                    <div className="font-semibold w-28 truncate text-right">{msg.agent}:</div>
                    <div className={`flex-1 ${textSecondary} whitespace-pre-wrap`}>{msg.content}</div>
                </div>
            ))}
        </div>
        {conversation.decision && (
            <div className={`mt-2 p-2 border-t ${borderColor} text-xs`}>
                <span className={`font-bold ${currentTheme.text}`}>Outcome: </span>
                <span className={textSecondary}>{conversation.decision}</span>
            </div>
        )}
    </div>
);

interface AutonomousDevelopmentViewProps {
    cardBg: string;
    borderColor: string;
    currentTheme: Theme;
    textColor: string;
    textSecondary: string;
    currentStageName: string;
    gameProgress: number;
    agentActivities: Activity[];
    liveConversations: Conversation[];
    generatedPreview: string | null;
    playableGameUrl: string | null;
    generatedCode: string | null;
    developmentStage: string;
    copied: boolean;
    handleDeploy: () => void;
    handleCopyCode: () => void;
    isGenerating: boolean;
}

const AutonomousDevelopmentView: React.FC<AutonomousDevelopmentViewProps> = (props) => {
    const { cardBg, borderColor, currentTheme, textColor, textSecondary, currentStageName, gameProgress, agentActivities, liveConversations, generatedPreview, playableGameUrl, generatedCode, developmentStage, copied, handleDeploy, handleCopyCode, isGenerating } = props;
    return (
        <div className="flex-1 flex flex-col p-4 overflow-hidden gap-4">
            <div className={`${cardBg} rounded-2xl border ${borderColor} p-4 flex flex-col justify-center flex-shrink-0`}>
                 <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold">{currentStageName}</p>
                    <p className={`font-bold text-lg ${currentTheme.text}`}>{gameProgress}%</p>
                </div>
                <div className={`w-full h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden`}>
                    <div className={`h-full bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} rounded-full transition-all duration-500`} style={{ width: `${gameProgress}%` }}></div>
                </div>
            </div>

            {/* Main Content Area - Stacked Vertically */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                
                {/* 1. Agent Activity */}
                <div className={`${cardBg} rounded-2xl border ${borderColor} p-4 flex flex-col h-64`}>
                     <h3 className="font-semibold mb-2 flex-shrink-0">AI Team Activity</h3>
                     <div className="flex-1 overflow-y-auto pr-1 -mr-2 space-y-1">
                        {agentActivities.map((act, i) => <ActivityItem key={i} activity={act} textColor={textColor} textSecondary={textSecondary} isActive={i === 0 && isGenerating} />)}
                    </div>
                </div>
                
                {/* 2. Discussions */}
                <div className={`${cardBg} rounded-2xl border ${borderColor} p-4 flex flex-col h-64`}>
                     <h3 className="font-semibold mb-2 flex-shrink-0">Team Discussions</h3>
                     <div className="flex-1 overflow-y-auto pr-1 -mr-2">
                        {liveConversations.map(convo => <ConversationThread key={convo.id} conversation={convo} borderColor={borderColor} textColor={textColor} textSecondary={textSecondary} currentTheme={currentTheme} />)}
                     </div>
                </div>

                {/* 3. Game Preview & Code */}
                <div className={`${cardBg} rounded-2xl border ${borderColor} p-4 flex flex-col gap-4`}>
                    <div>
                        <h3 className="font-semibold mb-2 flex-shrink-0">Game Preview</h3>
                        <div className="flex-1 flex flex-col items-center justify-center bg-black/20 rounded-lg aspect-video">
                            {playableGameUrl ? (
                                <iframe src={playableGameUrl} className="w-full h-full border-0 rounded-lg" title="Playable Game Preview" />
                            ) : generatedPreview ? (
                                <img src={generatedPreview} alt="Game Concept Art" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <div className="text-center p-4">
                                    <Palette size={48} className={textSecondary} />
                                    <p className={`mt-2 text-sm ${textSecondary}`}>Concept art will appear here...</p>
                                </div>
                            )}
                        </div>
                    </div>
                     <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-2 flex-shrink-0">
                            <h3 className="font-semibold">Generated Code</h3>
                            <button onClick={handleCopyCode} className={`p-2 rounded-lg hover:bg-white/10 ${textSecondary}`} title="Copy Code">
                                {copied ? <Check size={16} className={currentTheme.text} /> : <Copy size={16} />}
                            </button>
                        </div>
                        <div className="flex-1 bg-black/20 rounded-lg overflow-hidden h-48">
                            <pre className="w-full h-full overflow-auto text-xs p-2 text-gray-300">
                                {generatedCode ? <code>{generatedCode}</code> : <span className="flex items-center justify-center h-full text-gray-400">Code will appear here...</span>}
                            </pre>
                        </div>
                    </div>
                    <div className="flex-shrink-0 space-y-2">
                         {developmentStage === 'completed' && (
                            <button
                                onClick={handleDeploy}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} hover:scale-105 transition-transform`}
                            >
                                <UploadCloud /> Deploy to Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
const GameCreatorModal: React.FC<GameCreatorModalProps> = (props) => {
    const { show, onClose, onDeployGame, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;

    // Core State
    const [apiKeyOk, setApiKeyOk] = useState(false);
    const [gameIdea, setGameIdea] = useState('');
    const [developmentStage, setDevelopmentStage] = useState('waiting'); // 'waiting', 'in_progress', 'completed'
    const [gameProgress, setGameProgress] = useState(0);
    const [currentStageName, setCurrentStageName] = useState('');
    const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [playableGameUrl, setPlayableGameUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);


    // Simulation State
    const [agentActivities, setAgentActivities] = useState<Activity[]>([]);
    const [liveConversations, setLiveConversations] = useState<Conversation[]>([]);
    
    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        if (show) {
            setError(null);
            const checkKey = async () => {
                let hasKey = false;
                try {
                     if ((window as any).aistudio?.hasSelectedApiKey) {
                         hasKey = await (window as any).aistudio.hasSelectedApiKey();
                     }
                } catch (e) { /* ignore */ }
                
                if (!hasKey) {
                    const envKey = (typeof process.env !== 'undefined' ? process.env.API_KEY : undefined);
                    const storageKey = localStorage.getItem('apiKey_google_ai');
                    if (envKey || storageKey) hasKey = true;
                }

                if (isMounted.current) {
                    setApiKeyOk(hasKey);
                     if (!hasKey) {
                        const otherApiKeysConfigured = Object.entries(API_CONFIG)
                            .filter(([service]) => service !== 'Google AI')
                            .some(([, config]) => !!localStorage.getItem(config.storageKey));
                        
                        if (otherApiKeysConfigured && !localStorage.getItem(API_CONFIG['Google AI'].storageKey)) {
                             setError("The Game Creator Studio is powered by Google Gemini and requires a Google AI API key. Please add one in Settings to continue.");
                        }
                    }
                }
            };
            checkKey();
        }
    }, [show]);

    const resetState = () => {
        setGameIdea('');
        setDevelopmentStage('waiting');
        setGameProgress(0);
        setCurrentStageName('');
        setGeneratedPreview(null);
        setGeneratedCode(null);
        setPlayableGameUrl(null);
        setAgentActivities([]);
        setLiveConversations([]);
        setError(null);
        setIsGenerating(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };
    
    const handleDeploy = () => {
        if (gameIdea && generatedPreview && generatedCode) {
            onDeployGame(gameIdea, generatedPreview, generatedCode);
        }
    };
    
    const handleCopyCode = () => {
        if (generatedCode) {
            navigator.clipboard.writeText(generatedCode).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    const startDevelopment = async () => {
        if (!gameIdea.trim() || isGenerating) return;

        const apiKey = (typeof process !== 'undefined' ? process.env.API_KEY : undefined) || localStorage.getItem('apiKey_google_ai');
        if (!apiKey) {
            setError("API Key missing. Please configure in Settings.");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setDevelopmentStage('in_progress');
        setGeneratedPreview(null);
        setGeneratedCode(null);
        setPlayableGameUrl(null);
        setAgentActivities([]);
        setLiveConversations([]);
        
        const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const ai = new GoogleGenAI({ apiKey });

        const addActivity = (activity: Omit<Activity, 'timestamp'>) => {
            if(isMounted.current) setAgentActivities(prev => [{ ...activity, timestamp: getTime() }, ...prev]);
        };
        
        const setDecision = (convoId: number, decision: string) => {
             if(isMounted.current) setLiveConversations(prev => prev.map(c => c.id === convoId ? { ...c, decision } : c));
        };

        try {
            // --- PHASE 1: GAME DESIGN ---
            if(!isMounted.current) return;
            setCurrentStageName('Phase 1: Designing Game');
            setGameProgress(10);
            addActivity({ agent: 'Game Designer', action: 'Drafting Game Design Document (GDD)', type: 'design' });

            const designPrompt = `Create a simple but complete Game Design Document (GDD) for a browser-based game from this idea: "${gameIdea}".
            The game must be simple enough to be coded in a single HTML file with Phaser.js, using only primitive shapes (rectangles, circles) or emojis as graphics.
            
            Output the GDD in a structured format with these exact headings:
            **Title:** A creative game title.
            **Genre:** A simple genre (e.g., Arcade, Puzzle).
            **Objective:** A one-sentence goal for the player.
            **Controls:** Simple keyboard or mouse controls.
            **Gameplay:** A clear description of the rules, how to score, and win/lose conditions.
            **Visuals:** Describe the player, enemies/obstacles, and background using simple geometric shapes (e.g., "Player is a green square", "Projectiles are small white circles") or emojis.`;
            
            const designResponse = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: designPrompt });
            const gdd = designResponse.text;
            addActivity({ agent: 'Game Designer', action: 'Finalized core mechanics and visual style.', type: 'design' });
            
            // --- PHASE 2: ART GENERATION ---
            if(!isMounted.current) return;
            setCurrentStageName('Phase 2: Generating Concept Art');
            setGameProgress(30);
            addActivity({ agent: 'Art Director', action: 'Creating promotional concept art', type: 'creation' });
            
            const artTitleMatch = gdd.match(/\*\*Title:\*\* (.*)/);
            const artVisualsMatch = gdd.match(/\*\*Visuals:\*\* (.*)/);
            const artPrompt = `High-quality, vibrant, cinematic concept art for a video game titled "${artTitleMatch ? artTitleMatch[1] : gameIdea}". The style is based on this description: ${artVisualsMatch ? artVisualsMatch[1] : 'minimalist arcade game'}.`;

            const imageResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: artPrompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });
            
            const imagePart = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (imagePart?.inlineData) {
                 if(isMounted.current) setGeneratedPreview(`data:image/png;base64,${imagePart.inlineData.data}`);
            } else {
                 console.warn("Could not generate concept art, but continuing with code generation.");
            }
            addActivity({ agent: 'Art Director', action: 'Delivered final concept art.', type: 'creation' });
            
            // --- PHASE 3: CODE GENERATION ---
            if(!isMounted.current) return;
            setCurrentStageName('Phase 3: Writing Game Code');
            setGameProgress(60);
            addActivity({ agent: 'Technical Director', action: 'Writing complete game code with Phaser.js', type: 'technical' });

            const codePrompt = `You are an expert Phaser.js developer. Based on the following Game Design Document, write a complete, single, runnable HTML file for the game.
            **Important Rules:**
            1. The entire game (HTML, CSS, JavaScript) MUST be in one single \`.html\` file.
            2. You MUST use the Phaser.js library. Include it from the official CDN: \`<script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>\`.
            3. The game canvas should be 800x600 pixels and centered on the page with a black background.
            4. Implement all the rules described in the **Gameplay**, **Controls**, and **Objective** sections.
            5. Use ONLY primitive geometric shapes or emojis for all visual elements, as described in the **Visuals** section. Do not try to load external image or sound assets.
            6. The code must be clean, well-commented, and fully functional.
            7. Start the code directly with \`<!DOCTYPE html>\`. Do not wrap it in markdown fences.

            --- GAME DESIGN DOCUMENT ---
            ${gdd}
            --- END GDD ---`;
            
            const codeResponse = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: codePrompt });
            const gameCode = codeResponse.text.replace(/^```(html|javascript)?\s*/, '').replace(/```$/, '');
            
            if(!isMounted.current) return;
            setGeneratedCode(gameCode);
            addActivity({ agent: 'Technical Director', action: 'Completed initial playable prototype.', type: 'technical' });

            const blob = new Blob([gameCode], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            setPlayableGameUrl(url);

            // --- PHASE 4: COMPLETION ---
            if(!isMounted.current) return;
            setCurrentStageName('Phase 4: Finalizing Build');
            setGameProgress(100);
            addActivity({ agent: 'System', action: 'Build successful. Game is ready to play.', type: 'system' });
            setCurrentStageName('Completed');
            setDevelopmentStage('completed');

        } catch (e: any) {
            console.error("Game generation failed:", e);
            
            let detailedErrorMessage = "An unknown error occurred during generation.";
            let errorJsonString: string | null = null;

            if (e instanceof Error && e.message) {
                errorJsonString = e.message;
            } else if (typeof e === 'string') {
                errorJsonString = e;
            }

            if (errorJsonString) {
                try {
                    // Error might be a JSON string from the API
                    const errorObject = JSON.parse(errorJsonString);
                    if (errorObject && errorObject.error && errorObject.error.message) {
                        detailedErrorMessage = errorObject.error.message;
                    } else {
                        detailedErrorMessage = errorJsonString;
                    }
                } catch (jsonError) {
                    detailedErrorMessage = errorJsonString; // It wasn't JSON, use as is
                }
            } else if (e.message) {
                detailedErrorMessage = e.message;
            }
            
            if (isMounted.current) {
                const lowerCaseError = detailedErrorMessage.toLowerCase();
                 if (lowerCaseError.includes("quota") || lowerCaseError.includes("billing")) {
                    setError("You've exceeded your API quota for this model. Please check your billing details or select a different API key in the settings.");
                    setApiKeyOk(false);
                } else if (lowerCaseError.includes("requested entity was not found") || lowerCaseError.includes("api key not valid")) {
                    setError("Your API key appears to be invalid. Please select a valid key to continue.");
                    setApiKeyOk(false);
                } else if (lowerCaseError.includes("model is overloaded")) {
                    setError("The AI model is currently experiencing high traffic. Please wait a moment and try your request again.");
                } else {
                    setError(`Generation failed: ${detailedErrorMessage}`);
                }
            }
        } finally {
            if(isMounted.current) setIsGenerating(false);
        }
    };
    
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div
                className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl w-full max-w-7xl h-[90vh] border ${borderColor} shadow-2xl flex flex-col`}
                onClick={e => e.stopPropagation()}
            >
                <header className={`flex justify-between items-center p-3 border-b ${borderColor} flex-shrink-0`}>
                    <div className="flex items-center gap-3">
                        <Gamepad2 className={currentTheme.text} size={28} />
                        <h2 className="text-xl font-bold">Autonomous Game Studio</h2>
                    </div>
                    {developmentStage !== 'waiting' &&
                        <button onClick={resetState} disabled={isGenerating} className={`px-4 py-2 text-sm font-semibold rounded-lg ${cardBg} border ${borderColor} hover:bg-white/10 disabled:opacity-50`}>
                            Create New Game
                        </button>
                    }
                    <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </header>
                
                {error && (
                     <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-red-400">
                        <AlertTriangle size={48} className="mx-auto" />
                        <h3 className="text-xl font-bold mt-4">{error.includes("quota") ? "API Quota Exceeded" : "Development Halted"}</h3>
                        <p className="mt-2 max-w-md">{error}</p>
                        <button onClick={resetState} className={`mt-6 px-6 py-2 rounded-lg font-semibold ${cardBg} border ${borderColor} text-white`}>
                            Try Again
                        </button>
                    </div>
                )}

                {!error && !apiKeyOk && (
                     <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <KeyRound size={48} className={`mx-auto ${currentTheme.text} mb-4`} />
                        <h3 className="text-2xl font-bold mb-2">API Key Required</h3>
                        <p className={`${textSecondary} mb-6 max-w-md`}>
                            The Game Creator Studio uses advanced AI models. Please configure your Google AI API key in Settings.
                        </p>
                        <button
                            onClick={async () => {
                                if((window as any).aistudio?.openSelectKey) {
                                     await (window as any).aistudio.openSelectKey();
                                     setApiKeyOk(true);
                                } else {
                                    alert("Please go to Settings -> API Configuration to set your key.");
                                    onClose();
                                }
                            }}
                            className={`px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} hover:scale-105 transition-transform`}
                        >
                            Configure API Key
                        </button>
                    </div>
                )}
                
                {!error && apiKeyOk && (
                    developmentStage === 'waiting' ? 
                    <GameIdeaInput 
                        gameIdea={gameIdea}
                        setGameIdea={setGameIdea}
                        startDevelopment={startDevelopment}
                        isGenerating={isGenerating}
                        textSecondary={textSecondary}
                        cardBg={cardBg}
                        borderColor={borderColor}
                        currentTheme={currentTheme}
                    /> : 
                    <AutonomousDevelopmentView
                        cardBg={cardBg}
                        borderColor={borderColor}
                        currentTheme={currentTheme}
                        textColor={textColor}
                        textSecondary={textSecondary}
                        currentStageName={currentStageName}
                        gameProgress={gameProgress}
                        agentActivities={agentActivities}
                        liveConversations={liveConversations}
                        generatedPreview={generatedPreview}
                        playableGameUrl={playableGameUrl}
                        generatedCode={generatedCode}
                        developmentStage={developmentStage}
                        copied={copied}
                        handleDeploy={handleDeploy}
                        handleCopyCode={handleCopyCode}
                        isGenerating={isGenerating}
                    />
                )}
            </div>
        </div>
    );
};

export default GameCreatorModal;

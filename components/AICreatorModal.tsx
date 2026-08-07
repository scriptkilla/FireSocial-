
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Image as ImageIcon, FileText, Loader2, RefreshCw, Download, Copy, Video, Music } from 'lucide-react';
import { Theme } from '../types';
import { GoogleGenAI, Modality } from "@google/genai";
import { API_CONFIG, API_VERSIONS } from '../constants';

interface AICreatorModalProps {
    show: boolean;
    onClose: () => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

type GenerationResult = {
    type: 'text' | 'image' | 'video' | 'audio';
    content: string; // URL or text content
};

// Helper to convert raw PCM base64 to a WAV blob URL for playback
const base64PCMtoWAV = (base64: string, sampleRate = 24000, numChannels = 1) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + len, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, len, true);

    const blob = new Blob([view, bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
};

const AICreatorModal: React.FC<AICreatorModalProps> = (props) => {
    const { show, onClose, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;
    const [prompt, setPrompt] = useState('');
    const [mode, setMode] = useState<'text' | 'image' | 'video' | 'audio'>('text');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);

    // AI Configuration State
    const [selectedService, setSelectedService] = useState<string>('Aries AI');
    const [selectedModel, setSelectedModel] = useState<string>('Ember 1.0');

    useEffect(() => {
        const versions = API_VERSIONS[selectedService] || [];
        if (versions.length > 0) {
            setSelectedModel(versions[0].name);
        }
    }, [selectedService]);

    if (!show) return null;

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setStatusMessage('Initializing AI...');
        setGenerationResult(null);

        try {
             // Determine API Key based on selected service
             const config = API_CONFIG[selectedService];
             const apiKey = (typeof process !== 'undefined' ? process.env.API_KEY : undefined) || localStorage.getItem(config.storageKey);

             if (!apiKey) {
                 alert(`API Key missing for ${selectedService}. Please configure in Settings.`);
                 setIsLoading(false);
                 return;
             }

             // Check provider support
             if (selectedService !== 'Google AI') {
                 // Simulate generation for other providers
                 await new Promise(resolve => setTimeout(resolve, 2000));
                 setGenerationResult({ 
                     type: 'text', 
                     content: `[Mock Response from ${selectedService} - ${selectedModel}]\n\nThis feature is currently only fully implemented for Google AI. \n\nPrompt received: "${prompt}"` 
                 });
                 setIsLoading(false);
                 return;
             }

             const ai = new GoogleGenAI({ apiKey });

             if (mode === 'text') {
                 setStatusMessage('Writing...');
                 
                 // Map selected model name to actual model string
                 let modelString = 'gemini-2.5-flash'; // Default
                 if (selectedModel.includes('Pro')) {
                     modelString = 'gemini-3-pro-preview';
                 } else if (selectedModel.includes('Flash-Lite')) {
                     modelString = 'gemini-flash-lite-latest';
                 } else if (selectedModel.includes('Flash')) {
                     modelString = 'gemini-2.5-flash';
                 }

                 const response = await ai.models.generateContent({
                     model: modelString,
                     contents: prompt
                 });
                 setGenerationResult({ type: 'text', content: response.text || '' });
             
             } else if (mode === 'image') {
                 setStatusMessage('Generating image...');
                 const response = await ai.models.generateContent({
                     model: 'gemini-2.5-flash-image',
                     contents: prompt,
                 });
                 
                 let imageUrl = '';
                 if (response.candidates?.[0]?.content?.parts) {
                     for (const part of response.candidates[0].content.parts) {
                         if (part.inlineData) {
                             const base64EncodeString = part.inlineData.data;
                             imageUrl = `data:image/png;base64,${base64EncodeString}`;
                             break;
                         }
                     }
                 }
                 
                 if (imageUrl) {
                     setGenerationResult({ type: 'image', content: imageUrl });
                 } else {
                     setGenerationResult({ type: 'text', content: response.text || 'Failed to generate image.' });
                 }

             } else if (mode === 'video') {
                 setStatusMessage('Starting video generation...');
                 let operation = await ai.models.generateVideos({
                     model: 'veo-3.1-fast-generate-preview',
                     prompt: prompt,
                     config: {
                         numberOfVideos: 1,
                         resolution: '720p',
                         aspectRatio: '16:9'
                     }
                 });

                 setStatusMessage('Rendering video (this may take a moment)...');
                 
                 // Poll for completion
                 while (!operation.done) {
                     await new Promise(resolve => setTimeout(resolve, 5000));
                     operation = await ai.operations.getVideosOperation({ operation: operation });
                 }

                 const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                 if (downloadLink) {
                     setStatusMessage('Downloading video...');
                     // Fetch the video content with API key
                     const videoRes = await fetch(`${downloadLink}&key=${apiKey}`);
                     const blob = await videoRes.blob();
                     const videoUrl = URL.createObjectURL(blob);
                     setGenerationResult({ type: 'video', content: videoUrl });
                 } else {
                     throw new Error("Video generation failed or no URI returned.");
                 }

             } else if (mode === 'audio') {
                 setStatusMessage('Synthesizing audio...');
                 const response = await ai.models.generateContent({
                     model: "gemini-2.5-flash-preview-tts",
                     contents: [{ parts: [{ text: prompt }] }],
                     config: {
                         responseModalities: [Modality.AUDIO],
                         speechConfig: {
                             voiceConfig: {
                                 prebuiltVoiceConfig: { voiceName: 'Kore' },
                             },
                         },
                     },
                 });

                 const audioPart = response.candidates?.[0]?.content?.parts?.[0];
                 if (audioPart?.inlineData?.data) {
                     const wavUrl = base64PCMtoWAV(audioPart.inlineData.data);
                     setGenerationResult({ type: 'audio', content: wavUrl });
                 } else {
                     throw new Error("Audio generation failed. No audio data returned.");
                 }
             }

        } catch (error: any) {
            console.error(error);
            setGenerationResult({ type: 'text', content: `Error: ${error.message || "Generation failed"}` });
        } finally {
            setIsLoading(false);
            setStatusMessage('');
        }
    };

    const renderResult = () => {
        if (!generationResult) return null;
        const { type, content } = generationResult;

        return (
            <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden p-4">
                {type === 'image' && (
                    <img src={content} alt="Generated" className="max-w-full max-h-full object-contain mx-auto rounded-lg shadow-lg" />
                )}
                {type === 'video' && (
                    <video src={content} controls autoPlay loop className="max-w-full max-h-full object-contain mx-auto rounded-lg shadow-lg" />
                )}
                {type === 'audio' && (
                    <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10">
                         <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center mb-6 animate-pulse">
                             <Music size={32} className="text-white" />
                         </div>
                         <audio src={content} controls className="w-full max-w-md" />
                    </div>
                )}
                {type === 'text' && (
                    <div className="w-full h-full rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                             <p className={`whitespace-pre-wrap text-sm leading-relaxed ${textColor}`}>{content}</p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className={`${cardBg} backdrop-blur-xl ${textColor} rounded-3xl w-full max-w-4xl h-[85vh] border ${borderColor} shadow-2xl flex flex-col overflow-hidden`} onClick={e => e.stopPropagation()}>
                <div className={`flex justify-between items-center p-4 border-b ${borderColor}`}>
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Sparkles className={currentTheme.text} /> AI Creator Studio
                        </h2>
                        
                        {/* AI Selection Dropdowns */}
                        <div className="hidden md:flex gap-2">
                            <select 
                                value={selectedService}
                                onChange={(e) => setSelectedService(e.target.value)}
                                className={`text-xs font-semibold py-1.5 px-2 rounded-lg border ${borderColor} outline-none cursor-pointer bg-white text-gray-900 dark:bg-black dark:text-white`}
                            >
                                {Object.keys(API_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            
                            <select 
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className={`text-xs font-semibold py-1.5 px-2 rounded-lg border ${borderColor} outline-none cursor-pointer max-w-[150px] truncate bg-white text-gray-900 dark:bg-black dark:text-white`}
                            >
                                {API_VERSIONS[selectedService]?.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>

                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                    <div className={`w-full lg:w-1/3 p-4 border-b lg:border-b-0 lg:border-r ${borderColor} flex flex-col gap-4 overflow-y-auto`}>
                        <div>
                            <label className={`block text-sm font-bold ${textSecondary} mb-2`}>Mode</label>
                            <div className={`grid grid-cols-2 gap-2 p-1`}>
                                <button 
                                    onClick={() => setMode('text')} 
                                    className={`py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${mode === 'text' ? `bg-white dark:bg-gray-700 shadow-md` : `${textSecondary} hover:bg-white/5 border border-transparent hover:border-white/10`}`}
                                >
                                    <FileText size={16} /> Text
                                </button>
                                <button 
                                    onClick={() => setMode('image')} 
                                    className={`py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${mode === 'image' ? `bg-white dark:bg-gray-700 shadow-md` : `${textSecondary} hover:bg-white/5 border border-transparent hover:border-white/10`}`}
                                >
                                    <ImageIcon size={16} /> Image
                                </button>
                                <button 
                                    onClick={() => setMode('video')} 
                                    className={`py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${mode === 'video' ? `bg-white dark:bg-gray-700 shadow-md` : `${textSecondary} hover:bg-white/5 border border-transparent hover:border-white/10`}`}
                                >
                                    <Video size={16} /> Video
                                </button>
                                <button 
                                    onClick={() => setMode('audio')} 
                                    className={`py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${mode === 'audio' ? `bg-white dark:bg-gray-700 shadow-md` : `${textSecondary} hover:bg-white/5 border border-transparent hover:border-white/10`}`}
                                >
                                    <Music size={16} /> Audio
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <label className={`block text-sm font-bold ${textSecondary} mb-2`}>Prompt</label>
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={
                                    mode === 'text' ? "Write a blog post about..." : 
                                    mode === 'image' ? "A futuristic city with neon lights..." :
                                    mode === 'video' ? "A cat driving a car in a cyberpunk city..." :
                                    "Welcome to the future of AI..."
                                }
                                className={`w-full flex-1 p-3 rounded-xl bg-black/5 dark:bg-white/5 border ${borderColor} ${textColor} focus:outline-none focus:ring-2 ${currentTheme.ring} resize-none min-h-[120px]`}
                            />
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt.trim()}
                            className={`w-full py-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                            {isLoading ? 'Generating...' : 'Generate'}
                        </button>
                    </div>

                    <div className={`flex-1 bg-black/20 relative flex items-center justify-center overflow-hidden`}>
                        {generationResult ? (
                            renderResult()
                        ) : (
                            <div className={`text-center ${textSecondary} p-8`}>
                                {isLoading ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 size={48} className={`animate-spin ${currentTheme.text}`} />
                                        <p className="text-lg font-medium animate-pulse">{statusMessage}</p>
                                    </div>
                                ) : (
                                    <>
                                        <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium">Ready to Create</p>
                                        <p className="text-sm opacity-70">Enter a prompt and let AI do the magic.</p>
                                    </>
                                )}
                            </div>
                        )}
                        
                        {generationResult && !isLoading && (
                            <div className="absolute top-4 right-4 flex gap-2 z-10">
                                <button 
                                    onClick={() => {
                                        if (generationResult.type === 'text') {
                                            navigator.clipboard.writeText(generationResult.content);
                                            alert('Copied to clipboard!');
                                        } else {
                                            const a = document.createElement('a');
                                            a.href = generationResult.content;
                                            a.download = `generated-${mode}-${Date.now()}`;
                                            a.click();
                                        }
                                    }}
                                    className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors"
                                    title="Copy/Download"
                                >
                                    {generationResult.type === 'text' ? <Copy size={18} /> : <Download size={18} />}
                                </button>
                                <button onClick={() => setGenerationResult(null)} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors">
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AICreatorModal;

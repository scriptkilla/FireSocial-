

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User, PhoneCall, AlertTriangle } from 'lucide-react';
import { ActiveCall, Theme } from '../types';
import AvatarDisplay from './AvatarDisplay';

interface CallModalProps {
    call: ActiveCall;
    onEndCall: (duration: string) => void;
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const CallModal: React.FC<CallModalProps> = ({ call, onEndCall, currentTheme, cardBg, textColor, textSecondary, borderColor }) => {
    const [phase, setPhase] = useState<'connecting' | 'active' | 'ended'>('connecting');
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(call.type === 'voice');
    const [callDuration, setCallDuration] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Effect to manage media stream with robust error handling
    useEffect(() => {
        const startStream = async () => {
            setErrorMessage(null); // Clear previous errors

            try {
                // Check for devices first for more specific error messages
                const devices = await navigator.mediaDevices.enumerateDevices();
                const hasMicrophone = devices.some(device => device.kind === 'audioinput');
                const hasCamera = devices.some(device => device.kind === 'videoinput');

                if (!hasMicrophone) {
                    setErrorMessage("No microphone found. A microphone is required to make a call.");
                    return;
                }

                let streamIsAudioOnly = call.type === 'voice';
                if (call.type === 'video' && !hasCamera) {
                    console.warn("No camera found. Falling back to audio-only call.");
                    streamIsAudioOnly = true;
                }

                const constraints: MediaStreamConstraints = {
                    audio: true,
                    video: !streamIsAudioOnly,
                };

                const stream = await navigator.mediaDevices.getUserMedia(constraints);

                streamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream; // Simulating remote stream

                setIsCameraOff(streamIsAudioOnly);

            } catch (err) {
                console.error("Error accessing media devices.", err);
                const error = err as DOMException;
                let userMessage = "Could not start the call. Please check your devices and permissions.";

                if (error.name === 'NotAllowedError') {
                    userMessage = "Access to your camera and/or microphone was denied. Please check your browser permissions to enable them for this site.";
                } else if (error.name === 'NotFoundError') {
                    userMessage = "Could not find a required camera or microphone. Please ensure they are connected and enabled.";
                } else if (error.name === 'NotReadableError') {
                    userMessage = "Your camera or microphone could not be accessed. It might be in use by another application or there could be a hardware issue.";
                }
                
                setErrorMessage(userMessage);
            }
        };

        startStream();

        // Cleanup function to stop all tracks when the component unmounts
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [call.type]);

    // Effect to transition from connecting to active
    useEffect(() => {
        if (phase === 'connecting' && !errorMessage) {
            const timer = setTimeout(() => {
                setPhase('active');
            }, 3000); // Simulate 3 seconds of ringing
            return () => clearTimeout(timer);
        }
    }, [phase, errorMessage]);

    // Effect to run the call timer
    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | undefined;
        if (phase === 'active') {
            timer = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [phase]);
    
    // Effect to handle mute toggling
    useEffect(() => {
        if(streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => track.enabled = !isMuted);
        }
    }, [isMuted]);

    // Effect to handle camera toggling
    useEffect(() => {
        if(streamRef.current && call.type === 'video') {
            streamRef.current.getVideoTracks().forEach(track => track.enabled = !isCameraOff);
        }
    }, [isCameraOff]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleEndCall = () => {
        setPhase('ended');
        setTimeout(() => {
            onEndCall(formatDuration(callDuration));
        }, 2000); // Show ended screen for 2 seconds
    };

    const remoteUser = call.user;
    const shouldShowAvatar = call.type === 'voice' || phase === 'connecting' || isCameraOff;

    if (errorMessage) {
        return (
            <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-[150] flex flex-col items-center justify-center text-gray-900 dark:text-white p-4">
                <div className={`${cardBg} backdrop-blur-xl rounded-3xl p-8 border ${borderColor} text-center max-w-lg`}>
                    <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Call Error</h2>
                    <p className={textSecondary}>{errorMessage}</p>
                    <button 
                        onClick={() => onEndCall('00:00')} 
                        className={`mt-6 px-6 py-2 rounded-lg font-semibold bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white`}
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const renderControls = () => (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20">
            {phase === 'active' && (
                <div className={`px-4 py-2 rounded-full text-lg ${cardBg} backdrop-blur-xl border ${borderColor} ${textColor}`}>
                    {formatDuration(callDuration)}
                </div>
            )}
            <div className="flex items-center gap-4">
                {phase === 'active' && (
                    <>
                        <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-white text-black' : `${cardBg} backdrop-blur-xl ${textColor}`}`}>
                            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>
                        {call.type === 'video' && (
                            <button onClick={() => setIsCameraOff(!isCameraOff)} className={`p-4 rounded-full transition-colors ${isCameraOff ? 'bg-white text-black' : `${cardBg} backdrop-blur-xl ${textColor}`}`}>
                                {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
                            </button>
                        )}
                    </>
                )}
                <button onClick={handleEndCall} className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors text-white">
                    <PhoneOff size={24} />
                </button>
            </div>
        </div>
    );
    
    if (phase === 'ended') {
        return (
            <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-[150] flex flex-col items-center justify-center text-gray-900 dark:text-white p-4">
                <div className="text-center">
                    <AvatarDisplay avatar={remoteUser.avatar} size="w-32 h-32" fontSize="text-7xl" className="mb-4" />
                    <h2 className="text-3xl font-bold">Call Ended</h2>
                    <p className={`text-lg mt-2 ${textSecondary}`}>Duration: {formatDuration(callDuration)}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-[150] flex flex-col items-center justify-center text-gray-900 dark:text-white p-4">
            <div className="w-full h-full rounded-2xl relative flex items-center justify-center">
                {/* Remote User Display */}
                <div className="absolute inset-0 flex items-center justify-center bg-black rounded-2xl overflow-hidden">
                    {call.type === 'video' && (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className={`w-full h-full object-cover transition-opacity duration-300 ${shouldShowAvatar ? 'opacity-0' : 'opacity-100'}`}
                        />
                    )}
                    
                    {shouldShowAvatar && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-gray-100 dark:bg-gray-900">
                            <AvatarDisplay avatar={remoteUser.avatar} size="w-48 h-48" fontSize="text-8xl" />
                            <h2 className={`text-4xl font-bold mt-6 ${textColor}`}>{remoteUser.user}</h2>
                            {phase === 'connecting' ? (
                                <p className={`text-lg mt-2 ${textSecondary} flex items-center justify-center gap-2 animate-pulse`}>
                                    <PhoneCall size={20} />
                                    Ringing...
                                </p>
                            ) : call.type === 'voice' ? (
                                <p className={`text-lg ${textSecondary} mt-2`}>Voice Call</p>
                            ) : (
                                <p className={`text-lg ${textSecondary} mt-2`}>Camera is off</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Local Video Preview for Video Calls */}
                {call.type === 'video' && (
                    <div className={`absolute bottom-28 right-6 w-48 h-64 rounded-xl border-2 ${borderColor} shadow-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden z-10`}>
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover transition-opacity duration-300 ${isCameraOff ? 'opacity-0' : 'opacity-100'}`}
                        />
                        {isCameraOff && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <User size={48} className={textSecondary} />
                                <p className={`text-sm mt-2 ${textSecondary}`}>Camera is off</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {renderControls()}
        </div>
    );
};

export default CallModal;
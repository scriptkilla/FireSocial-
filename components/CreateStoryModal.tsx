
import React, { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, Camera, Video, Circle, StopCircle, RefreshCw, Mic } from 'lucide-react';
import { Theme, StoryItem } from '../types';

interface CreateStoryModalProps {
    show: boolean;
    onClose: () => void;
    onCreate: (media: StoryItem) => void;
    // UI props
    currentTheme: Theme;
    cardBg: string;
    textColor: string;
    textSecondary: string;
    borderColor: string;
}

const CreateStoryModal: React.FC<CreateStoryModalProps> = (props) => {
    const { show, onClose, onCreate, currentTheme, cardBg, textColor, textSecondary, borderColor } = props;
    const [media, setMedia] = useState<Omit<StoryItem, 'id'> | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraMode, setCameraMode] = useState<'image' | 'video'>('image');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => stopCamera();
    }, []);

    if (!show) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onload = (event) => {
                const url = event.target?.result as string;
                const type = file.type.startsWith('image') ? 'image' : 'video';
                setMedia({ type, url });
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePostStory = () => {
        if (media) {
            onCreate({ ...media, id: Date.now() });
            handleClose();
        }
    };
    
    const handleClose = () => {
        stopCamera();
        setMedia(null);
        onClose();
    };

    // --- Camera Logic ---
    const startCamera = async (mode: 'image' | 'video') => {
        stopCamera(); // Ensure previous stream is closed
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Camera API is not supported in this browser.");
            return;
        }

        try {
            // Check for devices first to provide better error messages
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const hasVideoInput = devices.some(device => device.kind === 'videoinput');
                if (!hasVideoInput) {
                    alert("No camera device found on your system.");
                    return;
                }
            } catch (e) {
                console.warn("Device enumeration failed, attempting getUserMedia anyway.", e);
            }

            setCameraMode(mode);
            setIsCameraOpen(true);
            
            let stream: MediaStream;
            
            try {
                // Try preferred constraints first (front camera)
                const constraints = {
                    video: { facingMode: 'user' },
                    audio: mode === 'video'
                };
                stream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (err) {
                console.warn("Preferred camera constraints failed, trying fallback...", err);
                // Fallback: try without specific constraints (any camera)
                const fallbackConstraints = {
                    video: true,
                    audio: mode === 'video'
                };
                stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
            }
            
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err: any) {
            console.error("Camera error:", err);
            setIsCameraOpen(false);
            
            let errorMessage = "Could not access camera/microphone.";
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                errorMessage = "Camera access denied. Please allow permissions in your browser settings.";
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                errorMessage = "No camera device found. Please check your device connection.";
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                errorMessage = "Camera is currently in use by another application.";
            } else if (err.name === 'OverconstrainedError') {
                errorMessage = "No camera found matching the requirements.";
            }
            
            alert(errorMessage);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsRecording(false);
        setRecordingTime(0);
        // Only set isCameraOpen false if we are explicitly closing, handled by callers usually
    };
    
    const closeCameraView = () => {
        stopCamera();
        setIsCameraOpen(false);
    };

    const handleCapture = () => {
        if (cameraMode === 'image') {
            if (videoRef.current && canvasRef.current) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0);
                    const url = canvas.toDataURL('image/png');
                    setMedia({ type: 'image', url });
                    closeCameraView();
                }
            }
        } else {
            if (isRecording) {
                stopRecording();
            } else {
                startRecording();
            }
        }
    };

    const startRecording = () => {
        if (!streamRef.current) return;
        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];
        
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setMedia({ type: 'video', url, duration: recordingTime });
            closeCameraView();
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center p-4 pt-16">
            <div className={`overflow-hidden max-h-[90vh] ${cardBg} backdrop-blur-xl ${textColor} rounded-3xl p-6 max-w-lg w-full border ${borderColor} shadow-2xl flex flex-col`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Create Story</h2>
                    <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>
                
                <div className="flex-grow flex items-center justify-center relative bg-black rounded-2xl overflow-hidden aspect-[9/16] max-h-[60vh]">
                    {!media && !isCameraOpen && (
                        <div className="flex flex-col gap-4 w-full p-8">
                             <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" className="hidden" />
                             <button onClick={() => fileInputRef.current?.click()} className={`w-full py-8 border-2 border-dashed ${borderColor} rounded-2xl flex flex-col items-center justify-center text-center ${textSecondary} hover:bg-white/5 transition-colors`}>
                                <UploadCloud size={48} className="mb-4" />
                                <p className="font-semibold">Upload Media</p>
                                <p className="text-sm">Image or Video</p>
                            </button>
                            
                            <div className="flex items-center gap-3 my-2">
                                <div className="h-px bg-gray-700 flex-1"></div>
                                <span className="text-gray-500 text-sm">OR CAPTURE</span>
                                <div className="h-px bg-gray-700 flex-1"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => startCamera('image')} className={`py-6 rounded-2xl bg-gray-800 hover:bg-gray-700 flex flex-col items-center gap-2 transition-colors`}>
                                    <Camera size={32} className="text-blue-400" />
                                    <span className="text-white font-medium">Photo</span>
                                </button>
                                <button onClick={() => startCamera('video')} className={`py-6 rounded-2xl bg-gray-800 hover:bg-gray-700 flex flex-col items-center gap-2 transition-colors`}>
                                    <Video size={32} className="text-red-400" />
                                    <span className="text-white font-medium">Video</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {isCameraOpen && (
                        <div className="relative w-full h-full bg-black flex flex-col">
                            <video ref={videoRef} autoPlay playsInline muted={cameraMode === 'image' || isRecording} className="w-full h-full object-cover flex-1" />
                            <canvas ref={canvasRef} className="hidden" />
                            
                            <button onClick={closeCameraView} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 z-10">
                                <X size={24} />
                            </button>
                            
                            {isRecording && (
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-500/80 rounded-full text-white font-mono text-sm animate-pulse flex items-center gap-2">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                    {formatTime(recordingTime)}
                                </div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex items-center gap-8">
                                     {!isRecording && (
                                        <button 
                                            onClick={() => startCamera(cameraMode === 'image' ? 'video' : 'image')} 
                                            className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                                            title={`Switch to ${cameraMode === 'image' ? 'Video' : 'Photo'}`}
                                        >
                                            <RefreshCw size={24} />
                                        </button>
                                     )}

                                    <button 
                                        onClick={handleCapture}
                                        className={`p-1 rounded-full border-4 ${isRecording ? 'border-red-500' : 'border-white'} transition-all transform hover:scale-105`}
                                    >
                                        <div className={`w-16 h-16 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white'}`}></div>
                                    </button>
                                    
                                    {!isRecording && <div className="w-12"></div> /* Spacer to center shutter button */}
                                </div>
                                <p className="text-white/70 text-sm mt-4 font-medium">
                                    {cameraMode === 'image' ? 'Photo Mode' : isRecording ? 'Recording...' : 'Video Mode'}
                                </p>
                            </div>
                        </div>
                    )}

                    {media && (
                        <div className="w-full h-full relative bg-black flex items-center justify-center">
                             {media.type === 'image' ? (
                                <img src={media.url} alt="Story preview" className="w-full h-full object-contain" />
                             ) : (
                                <video src={media.url} controls className="w-full h-full object-contain" />
                             )}
                             <button onClick={() => setMedia(null)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/80">
                                 <X size={20} />
                             </button>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex gap-2">
                    <button onClick={handleClose} className={`flex-1 py-3 ${cardBg} backdrop-blur-xl rounded-2xl border ${borderColor} hover:bg-white/10`}>
                        Cancel
                    </button>
                    <button 
                        onClick={handlePostStory} 
                        disabled={!media || isUploading} 
                        className={`flex-1 py-3 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} text-white rounded-2xl font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isUploading ? 'Uploading...' : 'Post to Story'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateStoryModal;

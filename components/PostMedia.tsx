import React, { useState } from 'react';
import { MediaItem, Theme } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PostMediaProps {
    media: MediaItem[];
    postFormat?: 'standard' | 'reel';
    currentTheme: Theme;
}

const PostMedia: React.FC<PostMediaProps> = ({ media, postFormat }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!media || media.length === 0) {
        return null;
    }

    const goToPrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? media.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isLastSlide = currentIndex === media.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };
    
    const currentItem = media[currentIndex];
    const isReel = postFormat === 'reel' && currentItem.type === 'video';

    return (
        <div className={`relative mb-4 w-full ${isReel ? 'aspect-[9/16] max-h-[70vh]' : 'aspect-video'} rounded-2xl overflow-hidden bg-black`}>
            {media.length > 1 && (
                <>
                    <button onClick={goToPrevious} className="absolute top-1/2 left-2 -translate-y-1/2 z-10 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={goToNext} className="absolute top-1/2 right-2 -translate-y-1/2 z-10 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors">
                        <ChevronRight size={24} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                        {media.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}

            <div className="w-full h-full flex items-center justify-center">
                {currentItem.type === 'image' ? (
                    <img src={currentItem.url} alt={`Post media ${currentIndex + 1}`} className="w-full h-full object-contain" />
                ) : (
                    <video src={currentItem.url} controls className="w-full h-full object-contain" onClick={e => e.stopPropagation()} />
                )}
            </div>
        </div>
    );
};

export default PostMedia;
import React, { useState, useEffect } from 'react';
import { Play, Pause, Heart, MessageCircle, Share, Eye, X } from 'lucide-react';

interface Story {
  id: string;
  type: 'photo' | 'video';
  url: string;
  comment: string;
  publishDate: string;
  publishTime: string;
  duration: number;
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
  isActive: boolean;
  timeRemaining: string;
}

interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showStats, setShowStats] = useState(false);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (!currentStory || currentStory.type !== 'photo') return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          onNext();
          return 0;
        }
        return prev + 100 / 50; // 5 seconds for photos
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentIndex, currentStory, onNext]);

  const handleVideoProgress = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const progress = (video.currentTime / video.duration) * 100;
    setProgress(progress);
  };

  const handleVideoEnd = () => {
    onNext();
    setProgress(0);
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width:
                  index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10 mt-6">
        <div className="flex items-center space-x-3">
          <img
            src="/icons/default-avatar.svg"
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <div>
            <h3 className="text-white font-semibold">Zafira</h3>
            <p className="text-white/70 text-sm">{currentStory.timeRemaining}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="text-white/70 hover:text-white p-2"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="text-white/70 hover:text-white p-2">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Story Content */}
      <div className="relative w-full h-full max-w-md mx-auto">
        {currentStory.type === 'photo' ? (
          <img src={currentStory.url} alt="Story" className="w-full h-full object-cover" />
        ) : (
          <video
            src={currentStory.url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            onTimeUpdate={handleVideoProgress}
            onEnded={handleVideoEnd}
            onClick={() => setIsPlaying(!isPlaying)}
          />
        )}

        {/* Navigation areas */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 cursor-pointer" onClick={onPrevious} />
          <div className="flex-1 cursor-pointer" onClick={onNext} />
        </div>

        {/* Story text */}
        {currentStory.comment && (
          <div className="absolute bottom-20 left-4 right-4">
            <p className="text-white text-lg font-medium leading-relaxed">{currentStory.comment}</p>
          </div>
        )}

        {/* Stats overlay */}
        {showStats && (
          <div className="absolute bottom-32 left-4 right-4 bg-black/50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-white text-xl font-bold">{currentStory.views}</div>
                <div className="text-white/70 text-sm">Vistas</div>
              </div>
              <div>
                <div className="text-white text-xl font-bold">{currentStory.likes}</div>
                <div className="text-white/70 text-sm">Me gusta</div>
              </div>
              <div>
                <div className="text-white text-xl font-bold">{currentStory.comments}</div>
                <div className="text-white/70 text-sm">Comentarios</div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="text-white hover:text-pink-400 transition-colors">
              <Heart className="w-6 h-6" />
            </button>
            <button className="text-white hover:text-blue-400 transition-colors">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="text-white hover:text-green-400 transition-colors">
              <Share className="w-6 h-6" />
            </button>
          </div>

          {currentStory.type === 'video' && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;

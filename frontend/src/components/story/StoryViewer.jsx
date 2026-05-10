import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';

export default function StoryViewer({ stories, startIndex = 0, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const DURATION = 5000;

  const story = stories[current];

  useEffect(() => {
    if (!story) return;
    api.post(`/stories/${story._id}/view`).catch(() => {});
    setProgress(0);
    clearInterval(intervalRef.current);
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        if (current < stories.length - 1) setCurrent(c => c + 1);
        else onClose();
      }
    }, 50);
    return () => clearInterval(intervalRef.current);
  }, [current, story?._id]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <button onClick={onClose} className="absolute top-4 right-4 text-white z-10 p-2">
        <X size={24} />
      </button>

      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-16 flex gap-1 z-10">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-none"
              style={{ width: i < current ? '100%' : i === current ? `${progress}%` : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Author */}
      <div className="absolute top-8 left-4 flex items-center gap-2 z-10 mt-2">
        <img src={story.author?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${story.author?.username}`}
          className="w-8 h-8 rounded-full border border-white/50" />
        <span className="text-white text-sm font-semibold">{story.author?.username}</span>
      </div>

      {/* Content */}
      <div className="w-full max-w-sm h-full max-h-[85vh] relative flex items-center justify-center"
        style={{ background: story.bgColor || '#000' }}>
        {story.media?.url && (
          story.media.type === 'video'
            ? <video src={story.media.url} className="w-full h-full object-cover" autoPlay muted loop />
            : <img src={story.media.url} className="w-full h-full object-cover" alt="" />
        )}
        {story.text && (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <p className="text-2xl font-bold text-center leading-snug"
              style={{ color: story.textColor || '#fff' }}>{story.text}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      {current > 0 && (
        <button onClick={() => setCurrent(c => c - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white p-2">
          <ChevronLeft size={28} />
        </button>
      )}
      {current < stories.length - 1 && (
        <button onClick={() => setCurrent(c => c + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white p-2">
          <ChevronRight size={28} />
        </button>
      )}
    </div>
  );
}

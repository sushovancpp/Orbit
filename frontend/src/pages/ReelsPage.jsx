import { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, BadgeCheck } from 'lucide-react';
import api from '../services/api';

export default function ReelsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reels'],
    queryFn: () => api.get('/explore/reels'),
  });

  const reels = data?.reels || [];

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading reels…</div>;
  if (reels.length === 0) return (
    <div className="text-center py-12 text-gray-400">
      <p className="text-4xl mb-3">🎬</p>
      <p>No reels yet. Be the first to post one!</p>
    </div>
  );

  return (
    <div className="space-y-2 -mx-4">
      {reels.map(reel => <ReelCard key={reel._id} reel={reel} />)}
    </div>
  );
}

function ReelCard({ reel }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { videoRef.current?.play(); setPlaying(true); }
        else { videoRef.current?.pause(); setPlaying(false); }
      },
      { threshold: 0.7 }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const media = reel.media?.find(m => m.type === 'video') || reel.media?.[0];

  return (
    <div className="relative bg-black" style={{ height: 'calc(100vw * 16/9)', maxHeight: '80vh' }}>
      {media?.url ? (
        <video
          ref={videoRef}
          src={media.url}
          className="w-full h-full object-cover"
          loop
          muted={muted}
          playsInline
          onClick={() => { if (playing) videoRef.current?.pause(); else videoRef.current?.play(); setPlaying(p => !p); }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/40">No video</div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Author info */}
      <div className="absolute bottom-16 left-4 right-16 text-white">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={reel.author?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${reel.author?.username}`}
            className="w-8 h-8 rounded-full border border-white/50"
          />
          <span className="font-semibold text-sm flex items-center gap-1">
            @{reel.author?.username}
            {reel.author?.isVerified && <BadgeCheck size={13} />}
          </span>
        </div>
        {reel.content && <p className="text-sm text-white/90 line-clamp-2">{reel.content}</p>}
      </div>

      {/* Action buttons */}
      <div className="absolute right-3 bottom-16 flex flex-col items-center gap-5">
        <button onClick={() => setLiked(p => !p)} className="flex flex-col items-center gap-1 text-white">
          <Heart size={26} fill={liked ? 'red' : 'none'} className={liked ? 'text-red-500' : ''} />
          <span className="text-xs">{(reel.likes?.length || 0) + (liked ? 1 : 0)}</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white">
          <MessageCircle size={26} />
          <span className="text-xs">{reel.comments?.length || 0}</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-white">
          <Share2 size={26} />
          <span className="text-xs">Share</span>
        </button>
        <button onClick={() => setMuted(p => !p)} className="text-white">
          {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
        </button>
      </div>
    </div>
  );
}

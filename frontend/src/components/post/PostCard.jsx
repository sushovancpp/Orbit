import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, BadgeCheck } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import PollDisplay from './PollDisplay';

export default function PostCard({ post }) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');

  const likeMutation = useMutation({
    mutationFn: () => api.post(`/posts/${post._id}/like`),
    onMutate: () => {
      setLiked(p => !p);
      setLikeCount(p => liked ? p - 1 : p + 1);
    },
  });

  const commentMutation = useMutation({
    mutationFn: (text) => api.post(`/posts/${post._id}/comment`, { text }),
    onSuccess: () => { setComment(''); qc.invalidateQueries(['feed']); },
    onError: () => toast.error('Failed to comment'),
  });

  return (
    <article className="card overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link to={`/${post.author?.username}`} className="flex items-center gap-3">
          <img src={post.author?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${post.author?.username}`}
            alt="" className="w-10 h-10 avatar" />
          <div>
            <p className="font-semibold text-sm flex items-center gap-1">
              {post.author?.name}
              {post.author?.isVerified && <BadgeCheck size={14} className="text-orbit-500" />}
            </p>
            <p className="text-xs text-gray-400">@{post.author?.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
          </div>
        </Link>
        <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><MoreHorizontal size={18} /></button>
      </div>

      {/* Content */}
      {post.content && <p className="px-4 pb-3 text-sm whitespace-pre-wrap">{post.content}</p>}

      {/* Media */}
      {post.media?.length > 0 && (
        <div className={`grid gap-0.5 ${post.media.length > 1 ? 'grid-cols-2' : ''}`}>
          {post.media.slice(0, 4).map((m, i) => (
            m.type === 'video'
              ? <video key={i} src={m.url} className="w-full aspect-square object-cover" controls muted />
              : <img key={i} src={m.url} alt="" className="w-full aspect-square object-cover" loading="lazy" />
          ))}
        </div>
      )}

      {post.poll?.options?.length > 0 && <PollDisplay poll={post.poll} postId={post._id} />}

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 py-3">
        <button onClick={() => likeMutation.mutate()}
          className={`flex items-center gap-1.5 text-sm px-2 py-1 rounded-full transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`}>
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          <span>{likeCount}</span>
        </button>
        <button onClick={() => setShowComments(p => !p)}
          className="flex items-center gap-1.5 text-sm px-2 py-1 rounded-full text-gray-500 hover:text-orbit-500 transition-colors">
          <MessageCircle size={18} />
          <span>{post.comments?.length || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm px-2 py-1 rounded-full text-gray-500 hover:text-orbit-500 transition-colors">
          <Share2 size={18} />
        </button>
        <button className="ml-auto flex items-center gap-1.5 text-sm px-2 py-1 rounded-full text-gray-500 hover:text-orbit-500 transition-colors">
          <Bookmark size={18} />
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 space-y-3">
          {post.comments?.slice(-3).map(c => (
            <div key={c._id} className="flex gap-2 text-sm">
              <img src={c.user?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${c.user?.username}`} alt="" className="w-7 h-7 avatar flex-shrink-0" />
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-3 py-1.5">
                <span className="font-semibold text-xs">{c.user?.username} </span>
                <span className="text-gray-700 dark:text-gray-300">{c.text}</span>
              </div>
            </div>
          ))}
          <form onSubmit={e => { e.preventDefault(); if (comment.trim()) commentMutation.mutate(comment); }}
            className="flex gap-2">
            <input value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Add a comment…" className="input text-sm py-1.5" />
            <button type="submit" className="btn-primary py-1.5 text-sm" disabled={!comment.trim()}>Post</button>
          </form>
        </div>
      )}
    </article>
  );
}

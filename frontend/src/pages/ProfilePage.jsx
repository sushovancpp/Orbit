import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, UserCheck, UserPlus } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: me } = useAuthStore();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => api.get(`/users/${username}`),
  });

  const followMutation = useMutation({
    mutationFn: (id) => api.post(`/users/${id}/follow`),
    onSuccess: () => qc.invalidateQueries(['profile', username]),
  });

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading…</div>;

  const { user, posts } = data;
  const isMe = me?._id === user._id;
  const isFollowing = user.followers?.includes(me?._id);

  return (
    <div className="space-y-6">
      {/* Cover */}
      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-orbit-400 to-purple-500">
          {user.coverImage && <img src={user.coverImage} className="w-full h-full object-cover" />}
        </div>
        <div className="px-4 pb-4">
          <div className="flex items-end justify-between -mt-8 mb-3">
            <img src={user.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`}
              className="w-20 h-20 avatar border-4 border-white dark:border-gray-900" />
            {isMe
              ? <button className="btn-outline text-sm">Edit profile</button>
              : <button onClick={() => followMutation.mutate(user._id)}
                  className={isFollowing ? 'btn-outline text-sm flex items-center gap-1' : 'btn-primary text-sm flex items-center gap-1'}>
                  {isFollowing ? <><UserCheck size={15} />Following</> : <><UserPlus size={15} />Follow</>}
                </button>}
          </div>
          <h2 className="font-bold text-lg flex items-center gap-1">
            {user.name}{user.isVerified && <BadgeCheck size={16} className="text-orbit-500" />}
          </h2>
          <p className="text-gray-500 text-sm">@{user.username}</p>
          {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
          <div className="flex gap-4 mt-3 text-sm">
            <span><strong>{posts?.length || 0}</strong> <span className="text-gray-400">posts</span></span>
            <span><strong>{user.followers?.length || 0}</strong> <span className="text-gray-400">followers</span></span>
            <span><strong>{user.following?.length || 0}</strong> <span className="text-gray-400">following</span></span>
          </div>
        </div>
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-3 gap-0.5">
        {posts?.map(p => (
          <div key={p._id} className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer">
            {p.media?.[0]?.url
              ? <img src={p.media[0].url} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
              : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 p-2 text-center">text</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

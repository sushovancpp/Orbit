import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserCheck } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function FollowButton({ userId, followers = [], size = 'sm' }) {
  const { user: me } = useAuthStore();
  const qc = useQueryClient();
  const isFollowing = followers.includes(me?._id);

  const mutation = useMutation({
    mutationFn: () => api.post(`/users/${userId}/follow`),
    onSuccess: () => qc.invalidateQueries(),
  });

  if (userId === me?._id) return null;

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className={`flex items-center gap-1.5 ${size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} rounded-full font-medium transition-colors ${
        isFollowing
          ? 'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
          : 'bg-orbit-600 hover:bg-orbit-700 text-white'
      }`}
    >
      {isFollowing ? <><UserCheck size={14} />Following</> : <><UserPlus size={14} />Follow</>}
    </button>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import api from '../../services/api';
import FollowButton from '../ui/FollowButton';

export default function SuggestedUsers() {
  const { data } = useQuery({
    queryKey: ['suggested'],
    queryFn: () => api.get('/users/suggested'),
  });

  const users = data?.users || [];
  if (!users.length) return null;

  return (
    <div className="card p-4 space-y-3">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Suggested for you</h3>
      {users.map(u => (
        <div key={u._id} className="flex items-center gap-3">
          <Link to={`/${u.username}`}>
            <img src={u.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${u.username}`}
              className="w-9 h-9 rounded-full object-cover" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/${u.username}`} className="text-sm font-medium flex items-center gap-1 hover:underline truncate">
              {u.name}
              {u.isVerified && <BadgeCheck size={12} className="text-orbit-500 flex-shrink-0" />}
            </Link>
            <p className="text-xs text-gray-400">@{u.username}</p>
          </div>
          <FollowButton userId={u._id} followers={u.followers} size="sm" />
        </div>
      ))}
    </div>
  );
}

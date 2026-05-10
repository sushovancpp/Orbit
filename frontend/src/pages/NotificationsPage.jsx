import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MessageCircle, UserPlus, AtSign, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';

const ICONS = {
  like: { icon: Heart, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
  comment: { icon: MessageCircle, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  follow: { icon: UserPlus, color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
  mention: { icon: AtSign, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  reply: { icon: MessageCircle, color: 'text-orbit-500 bg-orbit-50 dark:bg-orbit-900/20' },
};

const TEXT = {
  like: 'liked your post',
  comment: 'commented on your post',
  follow: 'started following you',
  mention: 'mentioned you in a post',
  reply: 'replied to your comment',
  repost: 'reposted your post',
  poll_vote: 'voted on your poll',
};

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications'),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries(['notifications']),
  });

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bell size={20} /> Notifications
          {unreadCount > 0 && (
            <span className="bg-orbit-600 text-white text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button onClick={() => markAllRead.mutate()}
            className="text-sm text-orbit-600 hover:underline">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Bell size={32} className="mx-auto mb-3 opacity-30" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100 dark:divide-gray-800">
          {notifications.map(n => {
            const cfg = ICONS[n.type] || { icon: Bell, color: 'text-gray-500 bg-gray-100' };
            const Icon = cfg.icon;
            return (
              <div key={n._id} className={`flex items-start gap-3 p-4 transition-colors ${!n.isRead ? 'bg-orbit-50/50 dark:bg-orbit-900/10' : ''}`}>
                <div className={`p-2 rounded-full flex-shrink-0 ${cfg.color}`}>
                  <Icon size={14} />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img
                    src={n.sender?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${n.sender?.username}`}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">@{n.sender?.username}</span>{' '}
                      <span className="text-gray-600 dark:text-gray-400">{TEXT[n.type] || n.type}</span>
                    </p>
                    {n.text && <p className="text-xs text-gray-400 truncate mt-0.5">"{n.text}"</p>}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {n.post?.media?.[0] && (
                    <img src={n.post.media[0].url} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

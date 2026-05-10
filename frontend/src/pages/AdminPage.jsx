import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, FileText, TrendingUp, Trash2, Ban } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const qc = useQueryClient();

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats'),
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users'),
  });

  const banUser = useMutation({
    mutationFn: (id) => api.patch(`/admin/users/${id}/ban`),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('User banned'); },
  });

  const stats = statsData?.stats || {};
  const users = usersData?.users || [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        🛡 Admin Panel
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-500' },
          { label: 'Total Posts', value: stats.posts, icon: FileText, color: 'text-green-500' },
          { label: 'Today Signups', value: stats.todaySignups, icon: TrendingUp, color: 'text-orbit-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 text-center">
            <Icon size={20} className={`${color} mx-auto mb-2`} />
            <p className="text-2xl font-bold">{value ?? '—'}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-semibold">
          User Management
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left p-3 font-medium text-gray-500">User</th>
                <th className="text-left p-3 font-medium text-gray-500">Email</th>
                <th className="text-left p-3 font-medium text-gray-500">Role</th>
                <th className="text-left p-3 font-medium text-gray-500">Joined</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img src={u.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${u.username}`}
                        className="w-7 h-7 rounded-full" />
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-gray-400">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-gray-500">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-orbit-100 text-orbit-700 dark:bg-orbit-900/30 dark:text-orbit-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button onClick={() => banUser.mutate(u._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                      title="Ban user">
                      <Ban size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center text-gray-400 py-8">No users found</p>}
        </div>
      </div>
    </div>
  );
}

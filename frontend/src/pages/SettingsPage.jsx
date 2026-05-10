import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    website: user?.website || '',
    location: user?.location || '',
    isPrivate: user?.isPrivate || false,
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const mutation = useMutation({
    mutationFn: (data) => api.put('/users/me', data),
    onSuccess: ({ user }) => { updateUser(user); toast.success('Profile updated!'); },
    onError: () => toast.error('Update failed'),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-700 dark:text-gray-300">Profile</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Display name</label>
          <input className="input" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea className="input resize-none" rows={3} value={form.bio} onChange={set('bio')} maxLength={200} />
          <p className="text-xs text-gray-400 mt-1">{form.bio.length}/200</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Website</label>
          <input className="input" type="url" value={form.website} onChange={set('website')} placeholder="https://…" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input className="input" value={form.location} onChange={set('location')} placeholder="City, Country" />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.isPrivate} onChange={set('isPrivate')}
            className="w-4 h-4 accent-orbit-600" />
          <div>
            <p className="text-sm font-medium">Private account</p>
            <p className="text-xs text-gray-400">Only approved followers can see your posts</p>
          </div>
        </label>
        <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}
          className="btn-primary">
          {mutation.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="card p-6 space-y-3">
        <h2 className="font-semibold text-gray-700 dark:text-gray-300">Account</h2>
        <p className="text-sm text-gray-500">Username: <span className="font-mono font-semibold">@{user?.username}</span></p>
        <p className="text-sm text-gray-500">Email: <span className="font-semibold">{user?.email}</span></p>
        <p className="text-sm text-gray-500">Member since: <span className="font-semibold">{new Date(user?.createdAt).toLocaleDateString()}</span></p>
      </div>
    </div>
  );
}

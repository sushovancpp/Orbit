// ExplorePage.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import api from '../services/api';
import PostCard from '../components/post/PostCard';

export default function ExplorePage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('posts');

  const { data, isLoading } = useQuery({
    queryKey: ['explore', q, type],
    queryFn: () => q ? api.get(`/explore/search?q=${q}&type=${type}`) : api.get('/explore/trending'),
    enabled: true,
  });

  const results = data?.posts || data?.results || [];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input pl-9" placeholder="Search posts, people, hashtags…"
          value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {q && (
        <div className="flex gap-2">
          {['posts', 'users', 'hashtags'].map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-1 rounded-full text-sm capitalize ${type === t ? 'bg-orbit-600 text-white' : 'btn-outline'}`}>
              {t}
            </button>
          ))}
        </div>
      )}
      {isLoading ? <p className="text-center text-gray-400 py-8">Loading…</p> :
        results.map(p => p.content !== undefined ? <PostCard key={p._id} post={p} /> :
          <div key={p._id} className="card p-4 flex items-center gap-3">
            <img src={p.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${p.username}`} className="w-10 h-10 avatar" />
            <div><p className="font-semibold">{p.name}</p><p className="text-sm text-gray-400">@{p.username}</p></div>
          </div>)}
    </div>
  );
}

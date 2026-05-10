import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import StoryViewer from './StoryViewer';

export default function StoriesBar() {
  const { user } = useAuthStore();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStories, setViewerStories] = useState([]);

  const { data } = useQuery({ queryKey: ['stories'], queryFn: () => api.get('/stories') });
  const stories = data?.stories || [];

  const grouped = Object.values(
    stories.reduce((acc, s) => {
      const id = s.author._id;
      if (!acc[id]) acc[id] = { author: s.author, stories: [] };
      acc[id].stories.push(s);
      return acc;
    }, {})
  );

  const openViewer = (authorStories) => {
    setViewerStories(authorStories);
    setViewerOpen(true);
  };

  return (
    <>
      <div className="card p-3">
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-orbit-50 dark:bg-orbit-900/30 border-2 border-dashed border-orbit-400 flex items-center justify-center text-orbit-600 hover:bg-orbit-100 transition-colors">
              <Plus size={20} />
            </div>
            <span className="text-xs text-gray-500 w-14 text-center truncate">Add story</span>
          </button>
          {grouped.map(({ author, stories: authorStories }) => {
            const hasUnseen = authorStories.some(s => !s.viewers?.some(v => v.user === user?._id));
            return (
              <button key={author._id} onClick={() => openViewer(authorStories)}
                className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={`w-14 h-14 rounded-full p-0.5 ${hasUnseen ? 'bg-gradient-to-tr from-orbit-500 to-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <img src={author.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${author.username}`}
                    className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-900" />
                </div>
                <span className="text-xs text-gray-500 w-14 text-center truncate">{author.username}</span>
              </button>
            );
          })}
        </div>
      </div>
      {viewerOpen && <StoryViewer stories={viewerStories} onClose={() => setViewerOpen(false)} />}
    </>
  );
}

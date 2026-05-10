// CreatePostBox.jsx
import { useState } from 'react';
import { Image, Video, BarChart2, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

export default function CreatePostBox() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const mutation = useMutation({
    mutationFn: (fd) => api.post('/posts', fd),
    onSuccess: () => { setContent(''); setFiles([]); setPreviews([]); qc.invalidateQueries(['feed']); toast.success('Posted!'); },
    onError: (e) => toast.error(e.message || 'Failed to post'),
  });

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).slice(0, 4);
    setFiles(selected);
    setPreviews(selected.map(f => ({ url: URL.createObjectURL(f), type: f.type.startsWith('video') ? 'video' : 'image' })));
  };

  const submit = () => {
    if (!content.trim() && files.length === 0) return;
    const fd = new FormData();
    fd.append('content', content);
    files.forEach(f => fd.append('media', f));
    mutation.mutate(fd);
  };

  return (
    <div className="card p-4 space-y-3">
      <div className="flex gap-3">
        <img src={user?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${user?.username}`}
          alt="" className="w-10 h-10 avatar" />
        <textarea
          value={content} onChange={e => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="flex-1 resize-none bg-transparent text-sm focus:outline-none py-2 min-h-[60px]"
          rows={3}
        />
      </div>
      {previews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {previews.map((p, i) => (
            <div key={i} className="relative w-20 h-20">
              {p.type === 'video'
                ? <video src={p.url} className="w-full h-full object-cover rounded-lg" />
                : <img src={p.url} className="w-full h-full object-cover rounded-lg" />}
              <button onClick={() => { setFiles(f => f.filter((_, j) => j !== i)); setPreviews(v => v.filter((_, j) => j !== i)); }}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
        <div className="flex gap-1">
          <label className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <Image size={18} /><input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          </label>
          <label className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <Video size={18} /><input type="file" accept="video/*" className="hidden" onChange={handleFiles} />
          </label>
        </div>
        <button onClick={submit} disabled={mutation.isPending || (!content.trim() && files.length === 0)}
          className="btn-primary text-sm py-1.5">
          {mutation.isPending ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  );
}

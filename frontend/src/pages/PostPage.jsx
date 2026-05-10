import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import PostCard from '../components/post/PostCard';

export default function PostPage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api.get(`/posts/${id}`),
    enabled: id !== 'new',
  });

  if (id === 'new') return <CreatePostPage />;

  return (
    <div className="space-y-4">
      <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft size={16} /> Back
      </Link>
      {isLoading ? (
        <div className="card p-8 text-center text-gray-400">Loading…</div>
      ) : data?.post ? (
        <PostCard post={data.post} />
      ) : (
        <div className="card p-8 text-center text-gray-400">Post not found</div>
      )}
    </div>
  );
}

function CreatePostPage() {
  return (
    <div className="space-y-4">
      <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Back
      </Link>
      <div className="card p-6">
        <h2 className="font-bold text-lg mb-4">Create Post</h2>
        <p className="text-gray-400 text-sm">Full post creation form coming in Phase 2.</p>
      </div>
    </div>
  );
}

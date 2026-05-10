import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import api from '../services/api';
import PostCard from '../components/post/PostCard';
import StoriesBar from '../components/story/StoriesBar';
import CreatePostBox from '../components/post/CreatePostBox';

export default function FeedPage() {
  const loaderRef = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 1 }) => api.get(`/posts/feed?page=${pageParam}`),
    getNextPageParam: (last, pages) => last.posts.length === 15 ? pages.length + 1 : undefined,
  });

  // Infinite scroll observer
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap(p => p.posts) ?? [];

  return (
    <div className="space-y-4">
      <StoriesBar />
      <CreatePostBox />
      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}</div>
      ) : (
        posts.map(post => <PostCard key={post._id} post={post} />)
      )}
      <div ref={loaderRef} className="h-4" />
      {isFetchingNextPage && <p className="text-center text-sm text-gray-400 py-4">Loading more…</p>}
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="card p-4 animate-pulse space-y-3">
      <div className="flex gap-3"><div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" /><div className="flex-1 space-y-2"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" /><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" /></div></div>
      <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
  );
}

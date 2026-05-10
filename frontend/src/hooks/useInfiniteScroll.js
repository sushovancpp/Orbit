import { useEffect, useRef } from 'react';

export default function useInfiniteScroll(callback, { enabled = true } = {}) {
  const loaderRef = useRef(null);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el || !enabled) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) callback(); },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [callback, enabled]);

  return loaderRef;
}

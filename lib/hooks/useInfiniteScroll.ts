import { useEffect, useRef, useCallback } from "react";

function useInfiniteScroll(
  fetchMore: () => Promise<void>,
  options?: IntersectionObserverInit,
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const stableFetch = useCallback(fetchMore, [fetchMore]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) stableFetch();
      },
      { threshold: 0.1, ...options },
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [stableFetch]);

  return sentinelRef;
}

export default useInfiniteScroll;

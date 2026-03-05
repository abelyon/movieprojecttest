import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSortModal } from '../contexts/SortModalContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchTrending, fetchSaved, searchTmdb } from '../lib/api';
import { MediaCard } from '../components/MediaCard';
import { SortFilterModal, type SortOption, type TimeWindow } from '../components/SortFilterModal';
import type { TmdbMediaItem } from '../types';
import type { SavedMediaItem } from '../types';

function sortResults(
  results: (TmdbMediaItem & { certification_hu?: string | null })[],
  sortBy: SortOption
): (TmdbMediaItem & { certification_hu?: string | null })[] {
  const arr = [...results];
  switch (sortBy) {
    case 'popularity':
      return arr.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    case 'rating':
      return arr.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
    case 'date':
      return arr.sort((a, b) => {
        const da = a.release_date || a.first_air_date || '';
        const db = b.release_date || b.first_air_date || '';
        return db.localeCompare(da);
      });
    default:
      return arr;
  }
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

export function Discovery() {
  const { user } = useAuth();
  const { isOpen: sortModalOpen, closeSortModal } = useSortModal();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('day');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data: savedList } = useQuery({
    queryKey: ['saved'],
    queryFn: fetchSaved,
    enabled: !!user,
  });
  const savedLikedMap = useMemo(() => {
    const list = (savedList ?? []) as SavedMediaItem[];
    const map = new Map<string, boolean | null>();
    for (const s of list) map.set(`${s.media_type}-${s.tmdb_id}`, s.liked);
    return map;
  }, [savedList]);

  const debouncedQuery = useDebounce(searchQuery, 300);
  const isSearch = debouncedQuery.length >= 2;

  const trendingInfinite = useInfiniteQuery({
    queryKey: ['trending', timeWindow],
    queryFn: ({ pageParam }) => fetchTrending(timeWindow, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const page = lastPage?.page ?? 1;
      const total = lastPage?.total_pages ?? 0;
      return page < total ? page + 1 : undefined;
    },
    enabled: !isSearch,
  });

  const searchInfinite = useInfiniteQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: ({ pageParam }) => searchTmdb(debouncedQuery, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const page = lastPage?.page ?? 1;
      const total = lastPage?.total_pages ?? 0;
      return page < total ? page + 1 : undefined;
    },
    enabled: isSearch,
  });

  const infinite = isSearch ? searchInfinite : trendingInfinite;
  const rawResults = useMemo(() => {
    const list = (infinite.data?.pages ?? []).flatMap((p) => p?.results ?? []) as (TmdbMediaItem & { certification_hu?: string | null })[];
    const seen = new Set<string>();
    return list.filter((item) => {
      const type = item?.media_type ?? '';
      const id = item?.id ?? '';
      if (type !== 'movie' && type !== 'tv') return false;
      const key = `${type}-${String(id)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [infinite.data?.pages]);
  const results = useMemo(
    () => sortResults(rawResults, sortBy),
    [rawResults, sortBy]
  );

  const hasNextPage = infinite.hasNextPage;
  const isFetchingNextPage = infinite.isFetchingNextPage;
  const fetchNextPageRef = useRef(infinite.fetchNextPage);
  fetchNextPageRef.current = infinite.fetchNextPage;

  useEffect(() => {
    const el = loadMoreRef.current;
    const root = scrollRef.current;
    if (!el || !root || !hasNextPage || isFetchingNextPage) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPageRef.current?.();
      },
      { root, rootMargin: '0px 0px 200% 0px', threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, results.length]);

  const isInitialLoading = infinite.isLoading;

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden">
      <div className="shrink-0 px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search movies & TV (min 2 chars)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 py-3 pl-10 pr-4 text-white"
          />
        </div>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain snap-y snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-24"
      >
        {isInitialLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <section
                key={i}
                className="flex min-h-[calc(100dvh-10rem)] shrink-0 snap-start snap-always items-center justify-center"
              >
                <div className="aspect-2/3 w-full max-w-[min(320px,85vw)] animate-pulse rounded-4xl" />
              </section>
            ))}
          </>
        ) : results.length === 0 ? (
          <div className="flex min-h-[calc(100dvh-10rem)] items-center justify-center px-4">
            <p className="text-center">No results.</p>
          </div>
        ) : (
          <>
            {results.map((item) => (
              <section
                key={`${item.media_type}-${item.id}`}
                className="flex min-h-[calc(100dvh-10rem)] shrink-0 snap-start snap-always items-center justify-center py-4"
              >
                <MediaCard item={item} variant="short" liked={savedLikedMap.get(`${item.media_type}-${item.id}`)} />
              </section>
            ))}
            {hasNextPage && (
              <>
                <div ref={loadMoreRef} className="h-px shrink-0" aria-hidden="true" />
                {isFetchingNextPage && (
                  <div className="flex min-h-[calc(100dvh-10rem)] shrink-0 snap-start items-center justify-center py-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent" />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <SortFilterModal
        open={sortModalOpen}
        onClose={closeSortModal}
        timeWindow={timeWindow}
        onTimeWindowChange={setTimeWindow}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />
    </div>
  );
}

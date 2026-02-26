import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchTrending, searchTmdb } from '../lib/api';
import { MediaCard } from '../components/MediaCard';
import { SortFilterModal, type SortOption, type TimeWindow } from '../components/SortFilterModal';
import type { TmdbMediaItem } from '../types';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('day');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [sortModalOpen, setSortModalOpen] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 300);

  const isSearch = debouncedQuery.length >= 2;

  const trendingQuery = useQuery({
    queryKey: ['trending', timeWindow],
    queryFn: () => fetchTrending(timeWindow),
    enabled: !isSearch,
  });

  const searchQueryResult = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchTmdb(debouncedQuery, 1),
    enabled: isSearch,
  });

  const rawResults = isSearch
    ? (searchQueryResult.data?.results ?? [])
    : (trendingQuery.data?.results ?? []);

  const results = useMemo(
    () => sortResults(rawResults as (TmdbMediaItem & { certification_hu?: string | null })[], sortBy),
    [rawResults, sortBy]
  );

  const isLoading = isSearch ? searchQueryResult.isLoading : trendingQuery.isLoading;

  return (
    <div className="min-h-screen pb-20 pt-4">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-4 text-2xl font-bold text-white">Discovery</h1>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            placeholder="Search movies & TV (min 2 chars)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[var(--card)] py-3 pl-10 pr-4 text-white placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setSortModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-[var(--card)] px-4 py-2 text-sm font-medium text-white transition hover:border-[var(--accent)] hover:bg-white/5"
          >
            <SlidersHorizontal size={18} />
            Sort
          </button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-[var(--card)]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {results.map((item) => (
              <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
            ))}
          </div>
        )}
        {!isLoading && results.length === 0 && (
          <p className="py-12 text-center text-[var(--muted)]">No results.</p>
        )}
      </div>
      <SortFilterModal
        open={sortModalOpen}
        onClose={() => setSortModalOpen(false)}
        timeWindow={timeWindow}
        onTimeWindowChange={setTimeWindow}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />
    </div>
  );
}

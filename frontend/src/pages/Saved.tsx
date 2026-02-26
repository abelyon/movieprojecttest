import { useQuery } from '@tanstack/react-query';
import { fetchSaved, fetchMovie, fetchTv } from '../lib/api';
import { MediaCard } from '../components/MediaCard';
import { useAuth } from '../contexts/AuthContext';
import type { SavedMediaItem } from '../types';
import type { TmdbMediaItem } from '../types';

export function Saved() {
  const { user } = useAuth();
  const { data: savedList, isLoading } = useQuery({
    queryKey: ['saved'],
    queryFn: fetchSaved,
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pb-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  const list = (savedList ?? []) as SavedMediaItem[];

  return (
    <div className="min-h-screen pb-24 pt-4">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="mb-6 text-2xl font-bold text-white">Saved</h1>
        {list.length === 0 ? (
          <p className="text-[var(--muted)]">No saved items. Save from Discovery or media detail.</p>
        ) : (
          <SavedGrid items={list} />
        )}
      </div>
    </div>
  );
}

function SavedGrid({ items }: { items: SavedMediaItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((saved) => (
        <SavedCard key={saved.id} saved={saved} />
      ))}
    </div>
  );
}

function SavedCard({ saved }: { saved: SavedMediaItem }) {
  const { data, isLoading } = useQuery({
    queryKey: [saved.media_type, saved.tmdb_id],
    queryFn: () =>
      saved.media_type === 'movie' ? fetchMovie(saved.tmdb_id) : fetchTv(saved.tmdb_id),
  });

  if (isLoading || !data) {
    return (
      <div className="aspect-[2/3] animate-pulse rounded-xl bg-[var(--card)]" />
    );
  }

  const res = data as { detail: Record<string, unknown>; certification: string | null };
  const detail = res.detail;
  const item: TmdbMediaItem & { certification_hu?: string | null } = {
    id: saved.tmdb_id,
    media_type: saved.media_type,
    title: detail.title as string,
    name: detail.name as string,
    poster_path: detail.poster_path as string | null,
    backdrop_path: detail.backdrop_path as string | null,
    overview: detail.overview as string | null,
    release_date: detail.release_date as string,
    first_air_date: detail.first_air_date as string,
    vote_average: (detail.vote_average as number) ?? 0,
    vote_count: (detail.vote_count as number) ?? 0,
    certification_hu: res.certification ?? null,
  };

  return (
    <div className="relative">
      <MediaCard item={item} />
      <div className="mt-1 flex gap-1 text-xs text-[var(--muted)]">
        {saved.liked === null && <span>—</span>}
        {saved.liked === true && <span className="text-green-500">Liked</span>}
        {saved.liked === false && <span className="text-red-500">Disliked</span>}
      </div>
    </div>
  );
}

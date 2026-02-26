import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMovie, fetchTv, addSaved, updateSaved, removeSaved, fetchSaved } from '../lib/api';
import type { TmdbDetailResponse } from '../types';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function MediaDetail() {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const queryClient = useQueryClient();
  const numericId = id ? parseInt(id, 10) : 0;

  const { data, isLoading, error } = useQuery({
    queryKey: [type, numericId],
    queryFn: () => (type === 'movie' ? fetchMovie(numericId) : fetchTv(numericId)),
    enabled: !!type && !!numericId,
  });

  const { data: savedList } = useQuery({
    queryKey: ['saved'],
    queryFn: fetchSaved,
  });

  const savedItem = savedList?.find(
    (s: { tmdb_id: number; media_type: string }) => s.tmdb_id === numericId && s.media_type === type
  );

  const mutateSave = useMutation({
    mutationFn: (liked?: boolean | null) =>
      savedItem ? updateSaved(savedItem.id, liked ?? savedItem.liked) : addSaved(numericId, type!, liked),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved'] }),
  });

  const mutateRemove = useMutation({
    mutationFn: () => (savedItem ? removeSaved(savedItem.id) : Promise.resolve()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved'] }),
  });

  if (error || !type || !id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--muted)]">Not found.</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  const res = data as TmdbDetailResponse;
  const detail = res.detail as Record<string, unknown>;
  const title = (detail.title as string) || (detail.name as string) || 'Untitled';
  const releaseDate =
    (detail.release_date as string) || (detail.first_air_date as string) || '';
  const overview = (detail.overview as string) || '';
  const voteAverage = (detail.vote_average as number) ?? 0;
  const genres = ((detail.genres as { id: number; name: string }[]) || []).map((g) => g.name);
  const certification = res.certification ?? null;
  const cast = (res.credits?.cast ?? []).slice(0, 15);
  const providers = res.watch_providers as Record<string, unknown> | undefined;
  const flatrate = (providers?.flatrate as { logo_path: string; provider_name: string }[]) ?? [];
  const buy = (providers?.buy as { logo_path: string; provider_name: string }[]) ?? [];
  const rent = (providers?.rent as { logo_path: string; provider_name: string }[]) ?? [];
  const posterPath = detail.poster_path as string | null;
  const backdropPath = detail.backdrop_path as string | null;
  const imageBase = (res.image_base as string) || IMAGE_BASE;

  const isSaved = !!savedItem;
  const liked = savedItem?.liked ?? null;

  return (
    <div className="min-h-screen pb-24">
      <div className="relative h-56 w-full overflow-hidden bg-[var(--card)] sm:h-72">
        {backdropPath && (
          <img
            src={`${imageBase}/w780${backdropPath}`}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />
        <Link
          to="/discovery"
          className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-black/50 px-3 py-2 text-sm text-white hover:bg-black/70"
        >
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>
      <div className="mx-auto max-w-4xl px-4 -mt-24 relative z-10">
        <div className="flex flex-col gap-6 sm:flex-row">
          {posterPath && (
            <img
              src={`${imageBase}/w500${posterPath}`}
              alt={title}
              className="h-64 w-44 shrink-0 rounded-xl border-2 border-[var(--card)] shadow-xl sm:h-80 sm:w-52"
            />
          )}
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded bg-[var(--accent)]/20 px-2 py-0.5 text-xs font-medium uppercase text-[var(--accent)]">
                {type}
              </span>
              {certification && (
                <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-white">
                  {certification}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
            {releaseDate && (
              <p className="mt-1 text-sm text-[var(--muted)]">
                {new Date(releaseDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
            {voteAverage > 0 && (
              <p className="mt-2 text-lg font-medium text-white">
                ★ {voteAverage.toFixed(1)}
              </p>
            )}
            {genres.length > 0 && (
              <p className="mt-2 text-sm text-[var(--muted)]">
                {genres.join(', ')}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  isSaved ? mutateRemove.mutate() : mutateSave.mutate(undefined)
                }
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isSaved
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Bookmark size={18} />
                {isSaved ? 'Unsave' : 'Save'}
              </button>
              {isSaved && (
                <>
                  <button
                    type="button"
                    onClick={() => mutateSave.mutate(true)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                      liked === true ? 'bg-green-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <ThumbsUp size={18} />
                    Like
                  </button>
                  <button
                    type="button"
                    onClick={() => mutateSave.mutate(false)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                      liked === false ? 'bg-red-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <ThumbsDown size={18} />
                    Dislike
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        {overview && (
          <section className="mt-8">
            <h2 className="mb-2 text-lg font-semibold text-white">Overview</h2>
            <p className="text-[var(--muted)] leading-relaxed">{overview}</p>
          </section>
        )}
        {cast.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-white">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {cast.map((person: { id: number; name: string; character?: string; profile_path: string | null }) => (
                <div
                  key={person.id}
                  className="flex w-24 shrink-0 flex-col items-center text-center"
                >
                  {person.profile_path ? (
                    <img
                      src={`${imageBase}/w185${person.profile_path}`}
                      alt={person.name}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--card)] text-[var(--muted)]">
                      {person.name.charAt(0)}
                    </div>
                  )}
                  <p className="mt-1 truncate text-xs font-medium text-white">{person.name}</p>
                  {person.character && (
                    <p className="truncate text-xs text-[var(--muted)]">{person.character}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        {(flatrate.length > 0 || buy.length > 0 || rent.length > 0) && (
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-white">Where to watch</h2>
            <div className="flex flex-wrap gap-4">
              {flatrate.map((p: { logo_path: string; provider_name: string }) => (
                <div
                  key={p.provider_name}
                  className="flex items-center gap-2 rounded-lg bg-[var(--card)] px-3 py-2"
                >
                  {p.logo_path && (
                    <img
                      src={`${imageBase}/w92${p.logo_path}`}
                      alt=""
                      className="h-8 w-8 rounded object-contain"
                    />
                  )}
                  <span className="text-sm text-white">{p.provider_name}</span>
                  <span className="text-xs text-[var(--muted)]">Stream</span>
                </div>
              ))}
              {rent.map((p: { logo_path: string; provider_name: string }) => (
                <div
                  key={`rent-${p.provider_name}`}
                  className="flex items-center gap-2 rounded-lg bg-[var(--card)] px-3 py-2"
                >
                  {p.logo_path && (
                    <img
                      src={`${imageBase}/w92${p.logo_path}`}
                      alt=""
                      className="h-8 w-8 rounded object-contain"
                    />
                  )}
                  <span className="text-sm text-white">{p.provider_name}</span>
                  <span className="text-xs text-[var(--muted)]">Rent</span>
                </div>
              ))}
              {buy.map((p: { logo_path: string; provider_name: string }) => (
                <div
                  key={`buy-${p.provider_name}`}
                  className="flex items-center gap-2 rounded-lg bg-[var(--card)] px-3 py-2"
                >
                  {p.logo_path && (
                    <img
                      src={`${imageBase}/w92${p.logo_path}`}
                      alt=""
                      className="h-8 w-8 rounded object-contain"
                    />
                  )}
                  <span className="text-sm text-white">{p.provider_name}</span>
                  <span className="text-xs text-[var(--muted)]">Buy</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

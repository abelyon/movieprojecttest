import { Link, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Bookmark, Clapperboard, ThumbsDown, ThumbsUp, Tv } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMovie, fetchTv, addSaved, updateSaved, removeSaved, fetchSaved } from '../lib/api';
import { certificationDisplay } from '../lib/certification';
import type { TmdbDetailResponse } from '../types';
import type { SavedMediaItem } from '../types';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function MediaDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const type = location.pathname.startsWith('/movie') ? 'movie' : 'tv';
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
    onMutate: async (liked?: boolean | null) => {
      await queryClient.cancelQueries({ queryKey: ['saved'] });
      const prev = queryClient.getQueryData<SavedMediaItem[]>(['saved']) ?? [];
      if (savedItem) {
        queryClient.setQueryData<SavedMediaItem[]>(['saved'], prev.map((it) =>
          it.id === savedItem.id ? { ...it, liked: liked ?? it.liked } : it
        ));
      } else {
        queryClient.setQueryData<SavedMediaItem[]>(['saved'], [
          ...prev,
          { id: -1, tmdb_id: numericId, media_type: type as 'movie' | 'tv', liked: liked ?? null, updated_at: '' },
        ]);
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev != null) queryClient.setQueryData(['saved'], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['saved'] }),
  });

  const mutateRemove = useMutation({
    mutationFn: () => (savedItem ? removeSaved(savedItem.id) : Promise.resolve()),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['saved'] });
      const prev = queryClient.getQueryData<SavedMediaItem[]>(['saved']) ?? [];
      queryClient.setQueryData<SavedMediaItem[]>(
        ['saved'],
        prev.filter((it) => !(it.tmdb_id === numericId && it.media_type === type))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev != null) queryClient.setQueryData(['saved'], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['saved'] }),
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
      <div className="min-h-screen pb-24">
        <div className="relative h-56 w-full overflow-hidden bg-[var(--card)] sm:h-72">
          <motion.div
            className="absolute inset-0 bg-[var(--card)]"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <div className="mx-auto max-w-4xl px-4 -mt-24 relative z-10">
          <div className="flex flex-col gap-6 sm:flex-row">
            <motion.div
              className="h-64 w-44 shrink-0 rounded-xl bg-[var(--card)] sm:h-80 sm:w-52"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded bg-[var(--card)] animate-pulse" />
                <div className="h-6 w-12 rounded bg-[var(--card)] animate-pulse" />
              </div>
              <div className="h-8 w-64 max-w-sm rounded bg-[var(--card)] animate-pulse" />
              <div className="h-4 w-32 rounded bg-[var(--card)] animate-pulse" />
              <div className="h-5 w-12 rounded bg-[var(--card)] animate-pulse" />
              <div className="flex gap-2 pt-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 w-16 rounded-full bg-[var(--card)] animate-pulse" />
                ))}
              </div>
            </div>
          </div>
          <section className="mt-8 space-y-2">
            <div className="h-5 w-24 rounded bg-[var(--card)] animate-pulse" />
            <div className="h-4 w-full rounded bg-[var(--card)] animate-pulse" />
            <div className="h-4 w-full max-w-2xl rounded bg-[var(--card)] animate-pulse" />
            <div className="h-4 w-48 max-w-xl rounded bg-[var(--card)] animate-pulse" />
          </section>
          <section className="mt-8">
            <div className="h-5 w-20 rounded bg-[var(--card)] animate-pulse mb-4" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 w-24 shrink-0 rounded-full bg-[var(--card)] animate-pulse" />
              ))}
            </div>
          </section>
        </div>
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
  const certificationRaw = (res.certification && String(res.certification).trim()) || null;
  const certification = certificationDisplay(certificationRaw);
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
    <div className="min-h-screen pb-24 relative">
      <div className="relative h-56 w-full overflow-hidden bg-[var(--card)] sm:h-72">
        {backdropPath && (
          <img
            src={`${imageBase}/w780${backdropPath}`}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />
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
              <span className="flex items-center justify-center rounded-full border-t border-neutral-600 bg-neutral-800/80 px-3 py-2 backdrop-blur-xs text-white">
                {type === 'movie' ? <Clapperboard size={16} /> : <Tv size={16} />}
              </span>
              {certification && (
                <span className="flex items-center justify-center rounded-full border-t border-neutral-600 bg-neutral-800/80 px-3 py-2 text-xs font-mono font-medium text-white backdrop-blur-xs">
                  {certification}
                </span>
              )}
              {voteAverage > 0 && (
                <span className="flex items-center justify-center rounded-full border-t border-neutral-600 bg-neutral-800/80 px-3 py-2 text-xs font-mono font-medium text-white backdrop-blur-xs">
                  {voteAverage.toFixed(1)}
                </span>
              )}
            </div>
            <h1 className="font-mono text-2xl font-bold text-white sm:text-3xl">{title}</h1>
            {releaseDate && (
              <p className="mt-1 text-sm text-[var(--muted)]">
                {new Date(releaseDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
            {genres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {genres.map((name) => (
                  <span
                    key={name}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {(flatrate.length > 0 || buy.length > 0 || rent.length > 0) && (
          <section className="mt-8">
            <h2 className="font-mono mb-4 text-lg font-semibold text-white">Where to watch</h2>
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
        {overview && (
          <section className="mt-8">
            <h2 className="font-mono mb-2 text-lg font-semibold text-white">Overview</h2>
            <p className="text-[var(--muted)] leading-relaxed">{overview}</p>
          </section>
        )}
        {cast.length > 0 && (
          <section className="mt-8">
            <h2 className="font-mono mb-4 text-lg font-semibold text-white">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
      </div>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-center gap-2">
        <motion.div whileTap={{ scale: 0.92 }} transition={{ duration: 0.15 }}>
          <Link
            to="/discovery"
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--card)]/95 text-white shadow-lg backdrop-blur transition hover:bg-white/10"
            aria-label="Back to discovery"
          >
            <ArrowLeft size={22} />
          </Link>
        </motion.div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.15 }}
          onClick={() =>
            isSaved ? mutateRemove.mutate() : mutateSave.mutate(undefined)
          }
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--card)]/95 text-white shadow-lg backdrop-blur transition hover:bg-white/10"
          aria-label={isSaved ? 'Unsave' : 'Save'}
        >
          <Bookmark size={22} fill={isSaved ? 'currentColor' : undefined} />
        </motion.button>
        <AnimatePresence>
          {isSaved && (
            <>
              <motion.button
                key="like"
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => mutateSave.mutate(true)}
                className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--card)]/95 text-white shadow-lg backdrop-blur transition hover:bg-white/10"
                aria-label="Like"
              >
                <ThumbsUp size={22} fill={liked === true ? 'currentColor' : undefined} />
              </motion.button>
              <motion.button
                key="dislike"
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => mutateSave.mutate(false)}
                className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--card)]/95 text-white shadow-lg backdrop-blur transition hover:bg-white/10"
                aria-label="Dislike"
              >
                <ThumbsDown size={22} fill={liked === false ? 'currentColor' : undefined} />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

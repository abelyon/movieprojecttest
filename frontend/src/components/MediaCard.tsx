import { Link } from 'react-router-dom';
import type { TmdbMediaItem } from '../types';
import { certificationDisplay } from '../lib/certification';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

interface MediaCardProps {
  item: TmdbMediaItem & { certification_hu?: string | null };
}

export function MediaCard({ item }: MediaCardProps) {
  const type = item.media_type;
  const id = item.id;
  const title = type === 'movie' ? item.title : item.name;
  const poster = item.poster_path ? `${IMAGE_BASE}/w500${item.poster_path}` : null;
  const certRaw = item.certification_hu?.trim();
  const hasCert = certRaw != null && certRaw !== '';
  const cert = hasCert ? certificationDisplay(certRaw) : null;

  return (
    <Link
      to={`/${type}/${id}`}
      className="group block overflow-hidden rounded-xl bg-[var(--card)] shadow-lg transition hover:ring-2 hover:ring-[var(--accent)]"
    >
      <div className="relative aspect-[2/3] bg-[var(--bg)]">
        {poster ? (
          <img
            src={poster}
            alt={title ?? ''}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">No image</div>
        )}
        <div className="absolute left-0 right-0 top-0 flex justify-between p-2">
          <span className="rounded bg-black/70 px-2 py-0.5 text-xs font-medium uppercase text-white">
            {type}
          </span>
          {hasCert && cert && (
            <span className="rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
              {cert}
            </span>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <p className="truncate text-sm font-medium text-white">{title ?? 'Untitled'}</p>
          {item.vote_average > 0 && (
            <p className="text-xs text-white/80">★ {item.vote_average.toFixed(1)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

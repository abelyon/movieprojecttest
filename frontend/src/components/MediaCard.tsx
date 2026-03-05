import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Clapperboard, ThumbsDown, ThumbsUp, Tv } from 'lucide-react';
import type { TmdbMediaItem } from '../types';
import { certificationDisplay } from '../lib/certification';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';
const POSTER_SIZE = 'w300';
const POSTER_SIZE_SHORT = 'w500';

interface MediaCardProps {
  item: TmdbMediaItem & { certification_hu?: string | null };
  variant?: 'default' | 'short';
  liked?: boolean | null;
}

export function MediaCard({ item, variant = 'default', liked }: MediaCardProps) {
  const type = item.media_type;
  const id = item.id;
  const title = type === 'movie' ? item.title : item.name;
  const posterSize = variant === 'short' ? POSTER_SIZE_SHORT : POSTER_SIZE;
  const poster = item.poster_path ? `${IMAGE_BASE}/${posterSize}${item.poster_path}` : null;
  const certRaw = item.certification_hu?.trim();
  const hasCert = certRaw != null && certRaw !== '';
  const cert = hasCert ? certificationDisplay(certRaw) : null;
  const showLikedBadge = liked === true || liked === false;

  const isShort = variant === 'short';

  return (
    <motion.div
      className={`relative aspect-2/3 overflow-hidden rounded-4xl shadow-lg ${isShort ? 'w-full max-w-[min(320px,85vw)]' : ''}`}
      style={{ transformOrigin: 'center center' }}
      initial={{ scale: 0.8 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -20% 0px', amount: 0.2 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
    >
      <Link
        to={`/${type}/${id}`}
        className="group block h-full w-full"
      >
        {poster ? (
          <img
            src={poster}
            alt={title ?? ''}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">No image</div>
        )}
        <div className="absolute left-0 right-0 top-0 flex justify-between p-4">
          <span className="flex items-center justify-center rounded-full bg-neutral-800/80 border-t border-neutral-600 backdrop-blur-xs px-3 py-2 text-white">
            {type === 'movie' ? <Clapperboard size={16} /> : <Tv size={16} />}
          </span>
          {hasCert && cert && (
            <span className="flex items-center justify-center rounded-full bg-neutral-800/80 border-t border-neutral-600 backdrop-blur-xs px-3 py-2 text-xs font-mono font-medium text-white">
              {cert}
            </span>
          )}
        </div>
        {showLikedBadge && (
          <div className="absolute bottom-4 right-4">
            <span className="flex items-center justify-center rounded-full border-t border-neutral-600 bg-neutral-800/80 px-3 py-2 text-white backdrop-blur-xs">
              {liked === true ? <ThumbsUp size={16} fill="currentColor" /> : <ThumbsDown size={16} fill="currentColor" />}
            </span>
          </div>
        )}
      </Link>
    </motion.div>
  );
}

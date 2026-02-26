export type MediaType = 'movie' | 'tv';

export interface TmdbMediaItem {
  id: number;
  media_type: MediaType;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  popularity?: number;
  original_language?: string;
  original_title?: string;
  original_name?: string;
  adult?: boolean;
  video?: boolean;
}

export interface SavedMediaItem {
  id: number;
  tmdb_id: number;
  media_type: MediaType;
  liked: boolean | null;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TmdbTrendingResponse {
  page: number;
  results: TmdbMediaItem[];
  total_pages: number;
  total_results: number;
  image_base?: string;
}

export interface TmdbDetailResponse {
  detail: Record<string, unknown>;
  certification: string | null;
  credits?: {
    cast: Array<{ id: number; name: string; character?: string; profile_path: string | null }>;
    crew: unknown[];
  };
  watch_providers?: Record<string, unknown>;
  image_base: string;
}

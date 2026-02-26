# Movie Discovery SPA

Laravel 12 API (Sanctum + Fortify) + Vite React TypeScript frontend using TMDB API.

## Stack

- **Backend:** Laravel 12, Sanctum (SPA auth), Fortify (login/register/profile), MySQL
- **Frontend:** Vite, React 19, TypeScript, React Router, TanStack Query, Tailwind CSS 4, Lucide Icons
- **Data:** TMDB API (trending, search, movie/TV details, cast, watch providers, HU certifications)

## Setup

### Backend

Create a MySQL database (e.g. `movieproject`) and set `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` in `.env`.

```bash
cd backend
cp .env.example .env
# Edit .env: DB_* for MySQL, and TMDB_API_KEY (get from https://www.themoviedb.org/settings/api)
php artisan key:generate
php artisan migrate
php artisan serve
```

Backend runs at `http://localhost:8000`. Ensure `SANCTUM_STATEFUL_DOMAINS` and `CORS_ALLOWED_ORIGINS` include your frontend origin (e.g. `localhost:5173`).

### Frontend

```bash
cd frontend
cp .env.example .env
# .env: VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Main pages

- **Discovery** (`/discovery`) – Trending movies/TV, search (min 2 chars, 300ms debounce), sort/filter modal. Cards show media type and age certification (HU). Click card → detail.
- **Media detail** (`/movie/:id`, `/tv/:id`) – Title, release date, rating, overview, genres, cast, where to watch. Save / Like / Dislike (saved items appear on Saved).
- **Saved** (`/saved`) – User’s saved items, ordered by: no like/dislike first, then with like/dislike.
- **Profile** (`/profile`) – Login/register when guest; when logged in: user data and profile update (Fortify).

Navbar is fixed at the bottom on all pages.

## TMDB API key

Create an API key at [TMDB Settings](https://www.themoviedb.org/settings/api) and set `TMDB_API_KEY` in `backend/.env`.

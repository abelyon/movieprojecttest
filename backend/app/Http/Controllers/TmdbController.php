<?php

namespace App\Http\Controllers;

use App\Services\TmdbService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TmdbController extends Controller
{
    public function __construct(
        private TmdbService $tmdb
    ) {}

    public function trending(Request $request): JsonResponse
    {
        $timeWindow = $request->get('time_window', 'day');
        $language = $request->get('language', 'en-US');
        $page = (int) $request->get('page', 1);
        $data = $this->tmdb->trending($timeWindow, $language, $page);
        $data['image_base'] = 'https://image.tmdb.org/t/p';
        $results = $data['results'] ?? [];
        $certs = $this->tmdb->getCertificationsForItems($results);
        foreach ($results as $i => $item) {
            $results[$i]['certification_hu'] = $certs[$i] ?? null;
        }
        $data['results'] = $results;
        return response()->json($data);
    }

    public function search(Request $request): JsonResponse
    {
        $query = (string) $request->get('query', '');
        $page = (int) $request->get('page', 1);
        $language = $request->get('language', 'en-US');
        $data = $this->tmdb->search($query, $page, $language);
        $results = $data['results'] ?? [];
        $certs = $this->tmdb->getCertificationsForItems($results);
        foreach ($results as $i => $item) {
            $results[$i]['certification_hu'] = $certs[$i] ?? null;
        }
        $data['results'] = $results;
        return response()->json($data);
    }

    public function movie(int $id, Request $request): JsonResponse
    {
        $language = $request->get('language', 'en-US');
        $movie = $this->tmdb->movie($id, $language);
        if (! $movie) {
            return response()->json(['message' => 'Not found'], 404);
        }
        $releaseDates = $this->tmdb->movieReleaseDates($id);
        $credits = $this->tmdb->movieCredits($id);
        $providers = $this->tmdb->movieWatchProviders($id);
        return response()->json([
            'detail' => $movie,
            'certification' => $releaseDates['certification'] ?? null,
            'credits' => $credits,
            'watch_providers' => $providers,
            'image_base' => 'https://image.tmdb.org/t/p',
        ]);
    }

    public function tv(int $id, Request $request): JsonResponse
    {
        $language = $request->get('language', 'en-US');
        $tv = $this->tmdb->tv($id, $language);
        if (! $tv) {
            return response()->json(['message' => 'Not found'], 404);
        }
        $contentRatings = $this->tmdb->tvContentRatings($id);
        $credits = $this->tmdb->tvCredits($id);
        $providers = $this->tmdb->tvWatchProviders($id);
        return response()->json([
            'detail' => $tv,
            'certification' => $contentRatings['rating'] ?? null,
            'credits' => $credits,
            'watch_providers' => $providers,
            'image_base' => 'https://image.tmdb.org/t/p',
        ]);
    }
}

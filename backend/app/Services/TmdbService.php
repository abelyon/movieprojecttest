<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class TmdbService
{
    private string $baseUrl = 'https://api.themoviedb.org/3';

    private string $imageBase = 'https://image.tmdb.org/t/p';

    public function __construct()
    {
        //
    }

    private function getKey(): string
    {
        return config('services.tmdb.key', '');
    }

    public function getImageUrl(string $path, string $size = 'w500'): string
    {
        if (empty($path)) {
            return '';
        }
        return "{$this->imageBase}/{$size}{$path}";
    }

    public function trending(string $timeWindow = 'day', string $language = 'en-US'): array
    {
        $response = Http::get("{$this->baseUrl}/trending/all/{$timeWindow}", [
            'api_key' => $this->getKey(),
            'language' => $language,
        ]);
        if (! $response->successful()) {
            return ['page' => 1, 'results' => [], 'total_pages' => 0, 'total_results' => 0];
        }
        $data = $response->json();
        $results = array_filter($data['results'] ?? [], fn ($item) => in_array($item['media_type'] ?? '', ['movie', 'tv']));
        return array_merge($data, ['results' => array_values($results)]);
    }

    public function search(string $query, int $page = 1, string $language = 'en-US'): array
    {
        if (strlen($query) < 2) {
            return ['page' => 1, 'results' => [], 'total_pages' => 0, 'total_results' => 0];
        }
        $response = Http::get("{$this->baseUrl}/search/multi", [
            'api_key' => $this->getKey(),
            'query' => $query,
            'page' => $page,
            'language' => $language,
            'include_adult' => false,
        ]);
        if (! $response->successful()) {
            return ['page' => 1, 'results' => [], 'total_pages' => 0, 'total_results' => 0];
        }
        $data = $response->json();
        $results = array_filter($data['results'] ?? [], fn ($item) => in_array($item['media_type'] ?? '', ['movie', 'tv']));
        return array_merge($data, ['results' => array_values($results)]);
    }

    public function movie(int $id, string $language = 'en-US'): ?array
    {
        $response = Http::get("{$this->baseUrl}/movie/{$id}", [
            'api_key' => $this->getKey(),
            'language' => $language,
        ]);
        if (! $response->successful()) {
            return null;
        }
        return $response->json();
    }

    public function tv(int $id, string $language = 'en-US'): ?array
    {
        $response = Http::get("{$this->baseUrl}/tv/{$id}", [
            'api_key' => $this->getKey(),
            'language' => $language,
        ]);
        if (! $response->successful()) {
            return null;
        }
        return $response->json();
    }

    public function movieReleaseDates(int $id): array
    {
        $response = Http::get("{$this->baseUrl}/movie/{$id}/release_dates", [
            'api_key' => $this->getKey(),
        ]);
        if (! $response->successful()) {
            return [];
        }
        $data = $response->json();
        $results = $data['results'] ?? [];
        foreach ($results as $country) {
            if (($country['iso_3166_1'] ?? '') === 'HU') {
                $dates = $country['release_dates'] ?? [];
                foreach ($dates as $rd) {
                    if (! empty($rd['certification'])) {
                        return ['certification' => $rd['certification'], 'release_date' => $rd['release_date'] ?? null];
                    }
                }
                if (! empty($dates[0])) {
                    return ['certification' => $dates[0]['certification'] ?? '', 'release_date' => $dates[0]['release_date'] ?? null];
                }
            }
        }
        return [];
    }

    public function tvContentRatings(int $id): array
    {
        $response = Http::get("{$this->baseUrl}/tv/{$id}/content_ratings", [
            'api_key' => $this->getKey(),
        ]);
        if (! $response->successful()) {
            return [];
        }
        $data = $response->json();
        $results = $data['results'] ?? [];
        foreach ($results as $country) {
            if (($country['iso_3166_1'] ?? '') === 'HU') {
                return ['rating' => $country['rating'] ?? ''];
            }
        }
        return [];
    }

    public function movieCredits(int $id): array
    {
        $response = Http::get("{$this->baseUrl}/movie/{$id}/credits", [
            'api_key' => $this->getKey(),
        ]);
        if (! $response->successful()) {
            return ['cast' => [], 'crew' => []];
        }
        return $response->json();
    }

    public function tvCredits(int $id): array
    {
        $response = Http::get("{$this->baseUrl}/tv/{$id}/credits", [
            'api_key' => $this->getKey(),
        ]);
        if (! $response->successful()) {
            return ['cast' => [], 'crew' => []];
        }
        return $response->json();
    }

    public function movieWatchProviders(int $id, string $region = 'HU'): array
    {
        $response = Http::get("{$this->baseUrl}/movie/{$id}/watch/providers", [
            'api_key' => $this->getKey(),
        ]);
        if (! $response->successful()) {
            return [];
        }
        $data = $response->json();
        $country = $data['results'][$region] ?? null;
        return $country ?? [];
    }

    public function tvWatchProviders(int $id, string $region = 'HU'): array
    {
        $response = Http::get("{$this->baseUrl}/tv/{$id}/watch/providers", [
            'api_key' => $this->getKey(),
        ]);
        if (! $response->successful()) {
            return [];
        }
        $data = $response->json();
        $country = $data['results'][$region] ?? null;
        return $country ?? [];
    }

}

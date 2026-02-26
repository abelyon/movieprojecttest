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

    public function trending(string $timeWindow = 'day', string $language = 'en-US', int $page = 1): array
    {
        $response = Http::get("{$this->baseUrl}/trending/all/{$timeWindow}", [
            'api_key' => $this->getKey(),
            'language' => $language,
            'page' => $page,
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
        $preferred = ['HU', 'US', 'DE', 'GB'];
        foreach ($preferred as $countryCode) {
            foreach ($results as $country) {
                if (($country['iso_3166_1'] ?? '') !== $countryCode) {
                    continue;
                }
                $dates = $country['release_dates'] ?? [];
                foreach ($dates as $rd) {
                    $cert = $rd['certification'] ?? null;
                    if ($cert !== null && $cert !== '') {
                        return ['certification' => (string) $cert, 'release_date' => $rd['release_date'] ?? null];
                    }
                }
            }
        }
        foreach ($results as $country) {
            $dates = $country['release_dates'] ?? [];
            foreach ($dates as $rd) {
                $cert = $rd['certification'] ?? null;
                if ($cert !== null && $cert !== '') {
                    return ['certification' => (string) $cert, 'release_date' => $rd['release_date'] ?? null];
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
        $preferred = ['HU', 'US', 'DE', 'GB'];
        foreach ($preferred as $countryCode) {
            foreach ($results as $country) {
                if (($country['iso_3166_1'] ?? '') !== $countryCode) {
                    continue;
                }
                $rating = $country['rating'] ?? null;
                if ($rating !== null && $rating !== '') {
                    return ['rating' => (string) $rating];
                }
            }
        }
        foreach ($results as $country) {
            $rating = $country['rating'] ?? null;
            if ($rating !== null && $rating !== '') {
                return ['rating' => (string) $rating];
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

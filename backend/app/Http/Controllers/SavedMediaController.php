<?php

namespace App\Http\Controllers;

use App\Models\SavedMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedMediaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = $request->user()
            ->savedMedia()
            ->orderByRaw('CASE WHEN liked IS NULL THEN 0 ELSE 1 END')
            ->orderBy('updated_at', 'desc')
            ->get(['id', 'tmdb_id', 'media_type', 'liked', 'updated_at']);
        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tmdb_id' => 'required|integer|min:1',
            'media_type' => 'required|in:movie,tv',
            'liked' => 'nullable|boolean',
        ]);
        $saved = $request->user()->savedMedia()->updateOrCreate(
            [
                'tmdb_id' => $validated['tmdb_id'],
                'media_type' => $validated['media_type'],
            ],
            ['liked' => $validated['liked'] ?? null]
        );
        return response()->json($saved, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $saved = $request->user()->savedMedia()->findOrFail($id);
        $validated = $request->validate([
            'liked' => 'nullable|boolean',
        ]);
        $saved->update(['liked' => $validated['liked'] ?? $saved->liked]);
        return response()->json($saved);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $saved = $request->user()->savedMedia()->findOrFail($id);
        $saved->delete();
        return response()->json(null, 204);
    }
}

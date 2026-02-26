<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json($request->user()->only(['id', 'name', 'email', 'email_verified_at', 'created_at', 'updated_at']));
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email',
        ]);
        $request->user()->update($validated);
        return response()->json($request->user()->only(['id', 'name', 'email', 'email_verified_at', 'created_at', 'updated_at']));
    }
}

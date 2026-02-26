<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedMedia extends Model
{
    protected $table = 'saved_media';

    protected $fillable = [
        'user_id',
        'tmdb_id',
        'media_type',
        'liked',
    ];

    protected function casts(): array
    {
        return [
            'liked' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

<?php

namespace App\Repositories;

use App\Models\Note;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;

class NoteRepository
{
    protected $model;
    protected $cachePrefix = 'notes_user_';
    protected $cacheTtl = 3600; // 1 hour

    public function __construct(Note $note)
    {
        $this->model = $note;
    }

    public function getAllForUser(): Collection
    {
        $userId = Auth::id();
        return $this->model->where('user_id', $userId)->latest()->get();
    }

    public function findById(int $id): ?Note
    {
        $userId = Auth::id();

        // Query directly with security check
        return $this->model->where('id', $id)
                          ->where('user_id', $userId)
                          ->first();
    }

    public function create(array $data): Note
    {
        $data['user_id'] = Auth::id();
        $note = $this->model->create($data);

        // Clear cache for this user
        $this->clearUserCache();

        return $note;
    }

    public function update(int $id, array $data): ?Note
    {
        $userId = Auth::id();
        $note = $this->model->where('id', $id)
                           ->where('user_id', $userId)
                           ->first();

        if (!$note) {
            return null;
        }

        $note->update($data);

        // Clear cache for this user
        $this->clearUserCache();

        return $note;
    }

    public function delete(int $id): bool
    {
        $userId = Auth::id();
        $note = $this->model->where('id', $id)
                           ->where('user_id', $userId)
                           ->first();

        if (!$note) {
            return false;
        }

        $note->delete();

        // Clear cache for this user
        $this->clearUserCache();

        return true;
    }

    protected function clearUserCache(): void
    {
        // Cache temporarily disabled
    }
}

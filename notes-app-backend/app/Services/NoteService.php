<?php

namespace App\Services;

use App\Models\Note;
use App\Repositories\NoteRepository;
use Illuminate\Database\Eloquent\Collection;

class NoteService
{
    protected $noteRepository;

    public function __construct(NoteRepository $noteRepository)
    {
        $this->noteRepository = $noteRepository;
    }

    public function getAllUserNotes(): Collection
    {
        return $this->noteRepository->getAllForUser();
    }

    public function getNoteById(int $id): ?Note
    {
        return $this->noteRepository->findById($id);
    }

    public function createNote(array $data): Note
    {
        return $this->noteRepository->create($data);
    }

    public function updateNote(int $id, array $data): ?Note
    {
        return $this->noteRepository->update($id, $data);
    }

    public function deleteNote(int $id): bool
    {
        return $this->noteRepository->delete($id);
    }
}

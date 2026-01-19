<?php

namespace App\Http\Controllers\Api;

use App\Domain\Announcement\Actions\CreateAnnouncementAction;
use App\Domain\Announcement\Actions\DeleteAnnouncementAction;
use App\Domain\Announcement\Actions\GetAllAnnouncementsAction;
use App\Domain\Announcement\Actions\UpdateAnnouncementAction;
use App\Domain\Announcement\DTOs\CreateAnnouncementDTO;
use App\Domain\Announcement\DTOs\UpdateAnnouncementDTO;
use App\Domain\Announcement\Enums\AnnouncementStatus;
use App\Domain\Announcement\Services\AnnouncementService;
use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AnnouncementController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private GetAllAnnouncementsAction $getAllAnnouncementsAction,
        private CreateAnnouncementAction $createAnnouncementAction,
        private UpdateAnnouncementAction $updateAnnouncementAction,
        private DeleteAnnouncementAction $deleteAnnouncementAction,
        private AnnouncementService $announcementService,
    ) {}

    // get all announcements
    public function index(Request $request): JsonResponse
    {
        $query = Announcement::with('user')->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $announcements = $query->paginate(10);

        return response()->json([
            'data' => $announcements->items(),
            'meta' => [
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'per_page' => $announcements->perPage(),
                'total' => $announcements->total(),
            ],
        ]);
    }

    // get current user announcements
    public function myAnnouncements(Request $request): JsonResponse
    {
        $user = $request->user();

        $announcements = Announcement::with('user')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'data' => $announcements->items(),
            'meta' => [
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'per_page' => $announcements->perPage(),
                'total' => $announcements->total(),
            ],
        ]);
    }

    // get other users announcements (admin)
    public function userAnnouncements(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check if user is admin
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $announcements = Announcement::with('user')
            ->where('user_id', '!=', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'data' => $announcements->items(),
            'meta' => [
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'per_page' => $announcements->perPage(),
                'total' => $announcements->total(),
            ],
        ]);
    }

    // create announcement
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => ['sometimes', Rule::in(AnnouncementStatus::values())],
        ]);

        $dto = CreateAnnouncementDTO::fromRequest($validated, $request->user()->id);
        $announcement = $this->createAnnouncementAction->execute($dto);

        return response()->json([
            'message' => 'Announcement created successfully',
            'announcement' => $announcement->toArray(),
        ], 201);
    }

    // get single announcement
    public function show(string $tenant_id, string $id): JsonResponse
    {
        $announcementDTO = $this->announcementService->getAnnouncementById((int) $id);

        return response()->json([
            'announcement' => $announcementDTO->toArray(),
        ]);
    }

    // update announcement
    public function update(Request $request, string $tenant_id, string $id): JsonResponse
    {
        $announcement = Announcement::findOrFail((int) $id);
        $this->authorize('update', $announcement);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'status' => ['sometimes', Rule::in(AnnouncementStatus::values())],
        ]);

        $isPublishing = isset($validated['status'])
            && $validated['status'] === 'published'
            && $announcement->status !== 'published';

        $dto = UpdateAnnouncementDTO::fromRequest($validated);
        $updatedAnnouncement = $this->updateAnnouncementAction->execute((int) $id, $dto);

        if ($isPublishing) {
            $announcement->update(['created_at' => now()]);
            $updatedAnnouncement = $this->announcementService->getAnnouncementById((int) $id);
        }

        return response()->json([
            'message' => 'Announcement updated successfully',
            'announcement' => $updatedAnnouncement->toArray(),
        ]);
    }

    // delete announcement
    public function destroy(string $tenant_id, string $id): JsonResponse
    {
        $announcement = Announcement::findOrFail((int) $id);
        $this->authorize('delete', $announcement);

        $this->deleteAnnouncementAction->execute((int) $id);

        return response()->json([
            'message' => 'Announcement deleted successfully',
        ]);
    }
}

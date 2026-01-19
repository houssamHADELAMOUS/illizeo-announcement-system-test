<?php

namespace App\Domain\User\Services;

use App\Domain\User\DTOs\CreateUserDTO;
use App\Domain\User\DTOs\UserDTO;
use App\Domain\User\Repositories\UserRepository;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    /**
     * Get all users
     */
    public function getAllUsers(): array
    {
        return $this->userRepository->all()
            ->map(fn(User $user) => UserDTO::fromModel($user)->toArray())
            ->toArray();
    }

    /**
     * Get user by ID
     */
    public function getUserById(int $id): UserDTO
    {
        $user = $this->userRepository->findOrFail($id);
        return UserDTO::fromModel($user);
    }

    /**
     * Create new user
     */
    public function createUser(CreateUserDTO $dto): UserDTO
    {
        $user = $this->userRepository->create([
            'name' => $dto->name,
            'email' => $dto->email,
            'password' => Hash::make($dto->password),
            'role' => $dto->role, // Assign role directly
        ]);

        return UserDTO::fromModel($user);
    }

    /**
     * Delete user
     */
    public function deleteUser(int $id): bool
    {
        return $this->userRepository->delete($id);
    }

    /**
     * Check if user can be deleted (prevent self-deletion)
     */
    public function canDelete(User $currentUser, int $targetUserId): bool
    {
        return $currentUser->id !== $targetUserId;
    }
}

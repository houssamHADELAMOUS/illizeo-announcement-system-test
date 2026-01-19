<?php

namespace App\Domain\Auth\DTOs;

use App\Models\User;

class AuthResponseDTO
{
    public function __construct(
        public readonly int $id,
        public readonly string $name,
        public readonly string $email,
        public readonly array $roles,
        public readonly array $permissions,
        public readonly ?string $token = null,
    ) {}

    public static function fromUser(User $user, ?string $token = null): self
    {
        return new self(
            id: $user->id,
            name: $user->name,
            email: $user->email,
            roles: [$user->role], // Simple role field
            permissions: [], // No permissions for now
            token: $token,
        );
    }

    public function toArray(): array
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'roles' => $this->roles,
            'permissions' => $this->permissions,
        ];

        if ($this->token) {
            $data['token'] = $this->token;
        }

        return $data;
    }
}

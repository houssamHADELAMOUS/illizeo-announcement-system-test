<?php

namespace App\Services;

use App\Models\Company;
use App\Models\User;
use App\Repositories\NoteRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Stancl\Tenancy\Database\Models\Domain;
use Stancl\Tenancy\Database\Models\Tenant;
use Stancl\Tenancy\UUIDGenerator;

class AuthService
{
    protected $userRepository;
    protected $noteRepository;

    public function __construct(UserRepository $userRepository, NoteRepository $noteRepository)
    {
        $this->userRepository = $userRepository;
        $this->noteRepository = $noteRepository;
    }

    public function register(array $data): array
    {
         $tenant = new Tenant();

    // Generate UUID using the tenant model
    $uuidGenerator = new UUIDGenerator();
    $uuid = $uuidGenerator->generate($tenant);

    // Now create the tenant with the generated UUID
    $tenant = Tenant::create([
        'id' => $uuid,
    ]);
        // Create a new tenant with UUID
      

        // Create a domain for the tenant
        $fullDomain = $data['company_subdomain'] . '.localhost';
        Domain::create([
            'domain' => $fullDomain,
            'tenant_id' => $tenant->id,
        ]);

        // Create company record
        Company::create([
            'name' => $data['company_name'],
            'subdomain' => $data['company_subdomain'],
            'tenant_id' => $tenant->id,
        ]);

        // Initialize tenancy for user creation
        tenancy()->initialize($tenant);

        // Create user with tenant_id
        $userData = [
            'tenant_id' => $tenant->id,
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ];
        $user = $this->userRepository->create($userData);

        // End tenancy
        tenancy()->end();

        $token = $user->createToken('API Token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
            'tenant_id' => $tenant->id,
            'subdomain' => $data['company_subdomain'],
        ];
    }

    public function login(array $data): ?array
    {
        $user = $this->userRepository->findByEmail($data['email']);

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return null;
        }

        $token = $user->createToken('API Token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function logout(): void
    {
        $user = Auth::user();
        if ($user) {
            // Clear user's cache on logout
            $this->noteRepository->clearUserCacheById($user->id, $user->tenant_id);
        }
        Auth::user()->currentAccessToken()->delete();
    }
}

# Illizeo - Multi-Tenant Announcement System

A SaaS-style announcement management system where each company (tenant) has isolated data. Built with Laravel and React, following clean architecture principles.

## What This Project Does

- Companies can register and get their own isolated workspace
- Each tenant has separate users and announcements
- Admins manage users within their tenant
- Users can create, publish, and manage announcements
- Drag-and-drop interface for changing announcement status

## Tech Stack

**Backend:** Laravel 11, PHP 8.2, MySQL  
**Frontend:** React 18, TypeScript, Vite  
**UI:** Tailwind CSS, shadcn/ui  
**State:** TanStack Query (React Query)  
**Auth:** Laravel Sanctum (token-based)  
**Multi-tenancy:** stancl/tenancy

---

## Project Structure

I organized both backend and frontend by domain/feature rather than by file type. This makes it easier to find related code and scale the project.

### Backend

```
backend/
├── app/
│   ├── Domain/                     # business logic lives here
│   │   ├── Announcement/
│   │   │   ├── Actions/            # one class = one action
│   │   │   ├── DTOs/               # data transfer objects
│   │   │   ├── Services/           # domain services
│   │   │   └── Repositories/       # data access
│   │   ├── Auth/
│   │   ├── User/
│   │   └── Tenant/
│   ├── Http/
│   │   ├── Controllers/Api/        # thin controllers
│   │   └── Middleware/             # tenant initialization
│   ├── Models/                     # eloquent models
│   └── Policies/                   # authorization
├── routes/
│   ├── api.php                     # central api routes
│   ├── api/                        # route files by domain
│   │   ├── auth.php
│   │   ├── user.php
│   │   └── announcement.php
│   └── tenant-path.php             # path-based tenant routes
└── config/
    └── tenancy.php
```

### Frontend

```
frontend/src/
├── domain/                         # feature modules
│   ├── announcements/
│   │   ├── components/
│   │   ├── hooks/                  # react query hooks
│   │   ├── services/               # api calls
│   │   └── types/
│   ├── auth/
│   └── users/
├── components/ui/                  # shadcn components
├── shared/
│   ├── api/                        # axios client, endpoints
│   ├── components/                 # protected routes
│   ├── constants/                  # route paths
│   ├── validations/                # yup schemas
│   └── utils/                      # error handlers
├── layouts/                        # dashboard layout
├── pages/                          # page components
├── context/                        # auth context, theme
└── router/                         # react router config
```

---

## How Multi-Tenancy Works

Each tenant gets their own database. The tenant is identified by the URL path:

```
http://localhost:8000/api/{tenant-id}/auth/login
http://localhost:8000/api/{tenant-id}/announcements
```

When a request comes in, the middleware extracts the tenant ID, finds the tenant, and switches to their database. All subsequent queries run against that tenant's data.

---

## Key Patterns I Used

### Actions Pattern (Backend)

Instead of putting logic in controllers, each action is its own class:

```php
class CreateAnnouncementAction
{
    public function execute(CreateAnnouncementDTO $dto): AnnouncementDTO
    {
        return $this->announcementService->createAnnouncement($dto);
    }
}
```

Controllers just validate input and call the action:

```php
public function store(Request $request): JsonResponse
{
    $validated = $request->validate([...]);
    $dto = CreateAnnouncementDTO::fromRequest($validated, $request->user()->id);
    $announcement = $this->createAnnouncementAction->execute($dto);
    return response()->json($announcement);
}
```

### DTOs (Data Transfer Objects)

I use DTOs to pass data between layers. This gives type safety and makes the API contract clear:

```php
class CreateAnnouncementDTO
{
    public function __construct(
        public readonly string $title,
        public readonly string $content,
        public readonly int $userId,
        public readonly AnnouncementStatus $status,
    ) {}
}
```

### React Query Hooks (Frontend)

Each domain has its own hooks that wrap React Query:

```typescript
export const useMyAnnouncements = (page: number = 1) => {
  return useQuery({
    queryKey: ['announcements', 'my', page],
    queryFn: () => announcementsService.getMyAnnouncements(page),
  })
}
```

Mutations handle cache invalidation automatically:

```typescript
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: announcementsService.createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
  })
}
```

### Service Layer (Frontend)

API calls are centralized in service files:

```typescript
export const announcementsService = {
  async getMyAnnouncements(page: number = 1) {
    const response = await apiClient.get('/api/announcements/my', { params: { page } })
    return response.data
  },
  async createAnnouncement(data: CreateAnnouncementData) {
    const response = await apiClient.post('/api/announcements', data)
    return response.data.announcement
  },
}
```

---

## Setup Guide

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/houssamHADELAMOUS/illizeo-announcement-system-test.git
cd illizeo-announcement-system-test

# backend
cd backend
composer install

# frontend
cd ../frontend
npm install
```

### 2. Configure Backend

```bash
cd backend

# copy env file
cp .env.example .env

# generate app key
php artisan key:generate
```

Edit `.env` with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=illizeo_maindb
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Create Databases

Create the central database:

```sql
CREATE DATABASE illizeo_maindb;
```

Run migrations:

```bash
php artisan migrate
```

### 4. Configure Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

### 5. Start Development Servers

Terminal 1 (Backend):
```bash
cd backend
php artisan serve
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Creating a Tenant

Use tinker to create a tenant:

```bash
php artisan tinker
```

```php
$tenant = App\Models\Tenant::create([
    'id' => 'acme',
    'name' => 'Acme Corp',
]);

$tenant->domains()->create(['domain' => 'acme']);

// create admin user for tenant
$tenant->run(function () {
    App\Models\User::create([
        'name' => 'Admin',
        'email' => 'admin@acme.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);
});
```

Now you can login at:
```
POST http://localhost:8000/api/acme/auth/login
{
    "email": "admin@acme.com",
    "password": "password"
}
```

---

## API Endpoints

All tenant endpoints are prefixed with `/api/{tenant-id}/`

### Auth
- `POST /auth/login` - login
- `POST /auth/logout` - logout (requires token)
- `GET /auth/me` - get current user (requires token)

### Announcements
- `GET /announcements` - list published announcements
- `GET /announcements/my` - list my announcements
- `GET /announcements/users` - list other users' announcements (admin)
- `POST /announcements` - create announcement
- `PUT /announcements/{id}` - update announcement
- `DELETE /announcements/{id}` - delete announcement

### Users (Admin only for create/delete)
- `GET /users` - list users
- `POST /users` - create user
- `DELETE /users/{id}` - delete user

---

## License

MIT
│   │   ├── services/
│   │   └── types/
│   └── users/
├── components/ui/                 # shadcn/ui components
├── shared/
│   ├── api/                       # Axios client configuration
│   └── components/                # Shared components (ProtectedRoute)
├── layouts/                       # Layout components (Sidebar)
├── pages/                         # Page components
├── hooks/                         # Global hooks
├── context/                       # React Context (Auth)
└── router/                        # React Router configuration
```

---

## ✨ Best Practices

### Backend
| Practice | Description |
|----------|-------------|
| **Actions Pattern** | Single-responsibility classes for business operations |
| **DTOs** | Type-safe data transfer between layers |
| **Repository Pattern** | Abstracted data access for testability |
| **Multi-Tenancy** | Path-based tenant isolation using `stancl/tenancy` |
| **Separated Routes** | Modular route files per domain |
| **Policies** | Authorization logic separated from controllers |

### Frontend
| Practice | Description |
|----------|-------------|
| **React Query** | Server state management with caching & background updates |
| **Domain Structure** | Organized by feature/domain, not file type |
| **TypeScript** | Full type safety across the application |
| **shadcn/ui** | Accessible, customizable UI components |
| **Protected Routes** | Route guards with authentication context |
| **Service Layer** | Centralized API calls per domain |

---

## 🚀 Quick Setup

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL/PostgreSQL

### Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Setup database
php artisan migrate
php artisan db:seed

# Start server
php artisan serve
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

---

## 🔐 Multi-Tenancy

Tenants are identified via **URL path**: `/api/{tenant}/...`

```php
// Middleware initializes tenant context
Route::prefix('{tenant}')->middleware('tenant.path')->group(function () {
    // Tenant-scoped routes
});
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 11, PHP 8.2, stancl/tenancy |
| Frontend | React 18, TypeScript, Vite |
| UI | shadcn/ui, Tailwind CSS |
| State | React Query (TanStack Query) |
| Auth | Laravel Sanctum |

---

## 📄 License

MIT License

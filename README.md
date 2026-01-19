# Illizeo App - Multi-Tenant Announcement System

A full-stack multi-tenant application built with **Laravel** (DDD Architecture) and **React** (Domain-Driven Structure).

---

## 🏗️ Architecture Overview

### Backend - Laravel with DDD & Multi-Tenancy

```
backend/
├── app/
│   ├── Domain/                    # Domain Layer (Business Logic)
│   │   ├── Announcement/
│   │   │   ├── Actions/           # Single-purpose action classes
│   │   │   ├── DTOs/              # Data Transfer Objects
│   │   │   └── Repositories/      # Data access abstraction
│   │   ├── Auth/
│   │   │   ├── Actions/
│   │   │   └── DTOs/
│   │   ├── Tenant/
│   │   └── User/
│   ├── Http/
│   │   ├── Controllers/Api/       # Thin controllers (delegate to Actions)
│   │   └── Middleware/            # Tenant path initialization
│   ├── Models/                    # Eloquent models
│   └── Policies/                  # Authorization policies
├── routes/
│   ├── api.php                    # Main API routes
│   ├── api/                       # Separated route files by domain
│   │   └── announcement.php
│   ├── tenant.php                 # Tenant-specific routes
│   └── tenant-path.php            # Path-based tenancy routes
└── config/
    └── tenancy.php                # Multi-tenancy configuration
```

### Frontend - React with Domain Structure

```
frontend/src/
├── domain/                        # Domain-driven modules
│   ├── announcements/
│   │   ├── components/            # Domain-specific components
│   │   ├── hooks/                 # React Query hooks
│   │   ├── services/              # API service layer
│   │   └── types/                 # TypeScript interfaces
│   ├── auth/
│   │   ├── hooks/
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

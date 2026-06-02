# Core Module Specification

## Overview

The **Core** module provides the foundational infrastructure for all other modules: base Blade layouts, shared partials, helper functions, base classes, and shared contracts (interfaces, DTOs, enums).

**Dependencies**: None (foundation)
**Depended on by**: All other modules

---

## 1. Models & Entities

The Core module does not own domain models; it defines **shared base classes and contracts**.

### Base Classes

```php
// app/Models/BaseModel.php (or Modules/Core/Models/BaseModel.php)
abstract class BaseModel extends Model
{
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Useful methods:
    // - Automatic UUID generation if needed
    // - Soft delete helpers
    // - Common scopes (active, recent, etc.)
}
```

### Shared Enums

```php
// Modules/Core/Enums/AccountType.php
enum AccountType: string
{
    case GUEST = 'guest';      // Not logged in
    case FREE = 'free';        // Logged in, sees ads
    case PREMIUM = 'premium';  // Paid, ad-free
}

// Modules/Core/Enums/SongStatus.php
enum SongStatus: string
{
    case DRAFT = 'draft';
    case PUBLISHED = 'published';
    case ARCHIVED = 'archived';
}

// Modules/Core/Enums/AdminRole.php
enum AdminRole: string
{
    case SUPER_ADMIN = 'super-admin';
    case CONTENT_MANAGER = 'content-manager';
    case MODERATOR = 'moderator';
    case FINANCE = 'finance';
    case ANALYST = 'analyst';
    case SUPPORT = 'support';
}
```

### Shared DTOs (Data Transfer Objects)

```php
// Modules/Core/DTOs/GeoLocationDTO.php
class GeoLocationDTO
{
    public function __construct(
        public int $zone_id,
        public int $state_id,
        public int $lga_id,
    ) {}
}

// Modules/Core/DTOs/StreamDTO.php
class StreamDTO
{
    public function __construct(
        public string $url,           // Signed, temporary URL
        public int $duration,         // Seconds
        public ?int $played_at = null,
    ) {}
}
```

---

## 2. Services

Core provides **utility and helper services**.

### Helper Functions

```php
// Modules/Core/Helpers/NumberHelper.php
function abbreviateNumber(int $number): string
{
    // "9200" => "9.2K", "1500000" => "1.5M"
    if ($number >= 1000000) {
        return round($number / 1000000, 1) . 'M';
    }
    if ($number >= 1000) {
        return round($number / 1000, 1) . 'K';
    }
    return (string) $number;
}

function formatDuration(int $seconds): string
{
    // 295 => "4:55"
    $minutes = intdiv($seconds, 60);
    $secs = $seconds % 60;
    return sprintf('%d:%02d', $minutes, $secs);
}

function phoneToInternational(string $phone): string
{
    // "08012345678" => "+2348012345678"
    return '+234' . substr($phone, 1);
}
```

### Core Services

```php
// Modules/Core/Services/StorageService.php
class StorageService
{
    /**
     * Generate a signed, temporary URL for audio/image download.
     * @param string $path - S3 key
     * @param int $expirationMinutes - Default: 1440 (24 hours)
     */
    public function signedUrl(string $path, int $expirationMinutes = 1440): string
    {
        return Storage::disk('s3')
            ->temporaryUrl($path, now()->addMinutes($expirationMinutes));
    }

    /**
     * Upload a file to S3 with randomized name.
     */
    public function uploadFile(
        UploadedFile $file,
        string $directory,
        ?string $filename = null
    ): string {
        $name = $filename ?? Str::uuid() . '.' . $file->extension();
        return $file->storeAs($directory, $name, 's3');
    }

    /**
     * Delete a file from S3.
     */
    public function deleteFile(string $path): bool
    {
        return Storage::disk('s3')->delete($path);
    }
}

// Modules/Core/Services/GeoService.php
class GeoService
{
    /**
     * Get zones (6 NG geopolitical zones).
     */
    public function zones(): Collection
    {
        return Zone::all();
    }

    /**
     * Get states for a zone.
     */
    public function statesByZone(int $zoneId): Collection
    {
        return State::where('zone_id', $zoneId)->get();
    }

    /**
     * Get LGAs for a state.
     */
    public function lgasByState(int $stateId): Collection
    {
        return Lga::where('state_id', $stateId)->get();
    }
}
```

---

## 3. Routes

Core does not define user-facing routes. It provides **API routes for shared data**.

### API Routes

```php
// Modules/Core/Routes/api.php
Route::prefix('api/v1')->group(function () {
    Route::prefix('geography')->group(function () {
        Route::get('zones', [Api\GeographyController::class, 'zones']);
        Route::get('states', [Api\GeographyController::class, 'states']);
        Route::get('lgas', [Api\GeographyController::class, 'lgas']);
    });

    Route::get('app/config', [Api\ConfigController::class, 'index']);
    // Returns: min_version, feature_flags, ads_config, maintenance_mode
});
```

---

## 4. Views & Partials

### Blade Layouts

```blade
{{-- resources/views/layouts/front.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
    @include('partials.front.head')
</head>
<body>
    <div class="app-shell">
        @yield('content')
        @include('partials.front.mini-player')
        @include('partials.front.bottom-nav')
    </div>
    @vite(['resources/js/ads.js', 'resources/js/player.js'])
</body>
</html>

{{-- resources/views/layouts/admin.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
    @include('partials.admin.head')
</head>
<body>
    <div class="admin-shell">
        @include('partials.admin.sidebar')
        <div class="admin-main">
            @include('partials.admin.topbar')
            <main class="admin-content">
                @yield('content')
            </main>
        </div>
    </div>
    @vite(['resources/js/admin/theme-manager.js'])
</body>
</html>
```

### Shared Partials

```blade
{{-- resources/views/partials/front/head.blade.php --}}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Shurafah - Islamic Audio Platform">
<title>@yield('title', 'Shurafah')</title>

{{-- Google Fonts (preserved from static) --}}
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">

{{-- Inline styles from static HTML --}}
<style>
    :root {
        --bg: #ffffff;
        --surface: #f5f5f5;
        --text: #1a1a1a;
        --accent: #ff6b6b;
        --accent-rgb: 255, 107, 107;
    }
    body.light {
        --bg: #f0f0f0;
        --surface: #e0e0e0;
        --text: #333;
    }
    /* ... rest of inline CSS from frontviews ... */
</style>

@stack('head')

{{-- resources/views/partials/front/bottom-nav.blade.php --}}
<nav class="bottom-nav">
    <a href="{{ route('home') }}" class="nav-item">
        <span class="icon">🏠</span> Home
    </a>
    <a href="{{ route('waazi.index') }}" class="nav-item">
        <span class="icon">📖</span> Wa'azi
    </a>
    <a href="{{ route('search.explore') }}" class="nav-item">
        <span class="icon">🔍</span> Explore
    </a>
    <a href="{{ route('favourites.index') }}" class="nav-item">
        <span class="icon">❤️</span> Favourites
    </a>
    <a href="{{ route('profile.show') }}" class="nav-item">
        <span class="icon">👤</span> Profile
    </a>
</nav>

{{-- resources/views/partials/front/mini-player.blade.php --}}
<div class="mp" id="mini-player">
    <div class="mp-now-playing">
        <img src="" id="mp-cover" class="mp-cover" />
        <div class="mp-info">
            <div class="mp-title" id="mp-title">Not playing</div>
            <div class="mp-artist" id="mp-artist"></div>
        </div>
    </div>
    <div class="mp-controls">
        <button id="mp-play-pause" class="mp-btn">▶️</button>
        <input type="range" id="mp-seek" class="mp-seek" />
    </div>
</div>

{{-- resources/views/partials/front/search-bar.blade.php --}}
<form action="{{ route('search.global') }}" method="get" class="search-bar">
    <input type="text" name="q" placeholder="Search songs, artists, lectures..." />
    <button type="submit">🔍</button>
</form>

{{-- resources/views/partials/front/ad-slot.blade.php --}}
{{-- Delegates to ads.js; backend only sets window.SHURAFAH_ADS from config --}}
<div id="ad-{{ $placement }}" class="ad-slot"></div>

{{-- resources/views/partials/admin/sidebar.blade.php --}}
<aside class="admin-sidebar">
    <div class="sidebar-header">
        <h2>Shurafah Admin</h2>
    </div>
    <nav class="sidebar-nav">
        <a href="{{ route('admin.dashboard') }}" class="nav-item">
            Dashboard
        </a>
        <div class="nav-section">
            <h3>Content</h3>
            <a href="{{ route('admin.songs.index') }}">Songs</a>
            <a href="{{ route('admin.artists.index') }}">Artists</a>
            <a href="{{ route('admin.categories.index') }}">Categories</a>
            <a href="{{ route('admin.playlists.index') }}">Playlists</a>
        </div>
        <div class="nav-section">
            <h3>Wa'azi</h3>
            <a href="{{ route('admin.waazi.index') }}">Lectures</a>
            <a href="{{ route('admin.preachers.index') }}">Preachers</a>
            <a href="{{ route('admin.waazi-categories.index') }}">Categories</a>
        </div>
        <div class="nav-section">
            <h3>System</h3>
            <a href="{{ route('admin.roles.index') }}">Roles</a>
            <a href="{{ route('admin.activity-logs.index') }}">Activity Logs</a>
            <a href="{{ route('admin.settings.index') }}">Settings</a>
        </div>
    </nav>
</aside>
```

---

## 5. Policies & Authorization

Core defines **base policies and permission mappings**.

```php
// Modules/Core/Policies/BasePolicy.php
abstract class BasePolicy
{
    /**
     * Deny by default; require explicit allow.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }
        return null; // Fall through to specific method
    }
}

// Modules/Core/Contracts/HasPermissions.php
interface HasPermissions
{
    /**
     * Check if user has a permission.
     */
    public function hasPermission(string $permission): bool;

    /**
     * Check if user has any of the given permissions.
     */
    public function hasAnyPermission(array $permissions): bool;
}
```

---

## 6. Events & Listeners

Core defines **domain events** that other modules fire.

```php
// Modules/Core/Events/UserRegistered.php
class UserRegistered
{
    public function __construct(
        public User $user,
        public string $phone,
    ) {}
}

// Modules/Core/Events/AdminActionPerformed.php
class AdminActionPerformed
{
    public function __construct(
        public AdminUser $admin,
        public string $action, // 'created_song', 'updated_artist', etc.
        public ?Model $subject = null,
    ) {}
}

// Modules/Core/Events/ContentPublished.php
class ContentPublished
{
    public function __construct(
        public Model $content, // Song, Waazi, etc.
    ) {}
}
```

---

## 7. Jobs (Queued Work)

Core does not define jobs; it provides **base job classes**.

```php
// Modules/Core/Jobs/BaseJob.php
abstract class BaseJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $connection = 'redis';
    public $timeout = 3600;
    public $tries = 3;
    public $maxExceptions = 1;
    public $backoff = [10, 30, 60]; // Exponential backoff
}
```

---

## 8. Migrations

Core creates **tables for reference/geography data**.

Refer to: `architecture/04-database-schema.md` → sections on **Zones**, **States**, **LGAs**.

```php
// Modules/Core/Database/Migrations/2026_01_01_000000_create_zones_table.php
Schema::create('zones', function (Blueprint $table) {
    $table->id();
    $table->string('name');      // e.g. "North West"
    $table->string('code')->unique();  // slug
    $table->timestamps();
});

// Similar for states, lgas
```

---

## 9. Tests

### Unit Tests

```php
// Modules/Core/Tests/Unit/Helpers/NumberHelperTest.php
test('abbreviateNumber formats large numbers', function () {
    expect(abbreviateNumber(9200))->toBe('9.2K');
    expect(abbreviateNumber(1500000))->toBe('1.5M');
    expect(abbreviateNumber(42))->toBe('42');
});

test('formatDuration converts seconds', function () {
    expect(formatDuration(295))->toBe('4:55');
    expect(formatDuration(3661))->toBe('61:01');
});
```

### Feature Tests

```php
// Modules/Core/Tests/Feature/GeographyApiTest.php
test('GET /api/v1/geography/zones returns all zones', function () {
    Zone::factory(6)->create();

    $response = $this->getJson('/api/v1/geography/zones');

    $response->assertOk()
        ->assertJsonCount(6, 'data')
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'code']
            ]
        ]);
});

test('GET /api/v1/geography/states?zone_id filters correctly', function () {
    $zone = Zone::factory()->create();
    State::factory(10)->create(['zone_id' => $zone->id]);
    State::factory(5)->create();

    $response = $this->getJson("/api/v1/geography/states?zone_id={$zone->id}");

    $response->assertOk()
        ->assertJsonCount(10, 'data');
});
```

---

## 10. Security Checklist

- [ ] No secrets hardcoded in code; all config via `.env`
- [ ] Blade views use `{{ }}` (auto-escape) for all user content
- [ ] Storage signed URLs have expiration (default: 24 hours)
- [ ] No sensitive data logged (passwords, tokens, PII)
- [ ] CORS configured correctly (known origins only)
- [ ] Rate limiting applied to public API endpoints
- [ ] Admin-only routes require authentication + RBAC

---

## Integration Checklist (Phase 0)

- [ ] Create `Modules/Core` directory structure
- [ ] Define shared enums (AccountType, SongStatus, etc.)
- [ ] Define shared DTOs (GeoLocationDTO, StreamDTO, etc.)
- [ ] Create base classes (BaseModel, BasePolicy, BaseJob)
- [ ] Implement helper functions (abbreviateNumber, formatDuration, etc.)
- [ ] Create Blade layouts and partials (front, admin)
- [ ] Seed geography data (zones, states, lgas)
- [ ] Write and pass all unit + feature tests
- [ ] Security checklist passed

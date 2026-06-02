# Auth Module Specification

## Overview

The **Auth** module handles authentication for **end users** (phone + password, OTP) and **admin users** (email + password, 2FA). It provides registration, login, password reset, and token management via Laravel Sanctum.

**Dependencies**: Core, Geography (for registration)
**Depended on by**: Users, all feature modules

---

## 1. Models & Entities

### User Model

```php
// Modules/Auth/Models/User.php
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'full_name',
        'phone',
        'email',
        'password',
        'zone_id',
        'state_id',
        'lga_id',
        'avatar_path',
        'account_type',
        'premium_expires_at',
        'status',
        'phone_verified_at',
        'last_login_at',
    ];

    protected $casts = [
        'account_type' => AccountType::class,
        'status' => UserStatus::class,
        'phone_verified_at' => 'datetime',
        'premium_expires_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relationships
    public function zone() { return $this->belongsTo(Zone::class); }
    public function state() { return $this->belongsTo(State::class); }
    public function lga() { return $this->belongsTo(Lga::class); }

    // Accessors
    public function isPremium(): bool
    {
        return $this->account_type === AccountType::PREMIUM &&
               $this->premium_expires_at?->isFuture();
    }

    public function isPhoneVerified(): bool
    {
        return $this->phone_verified_at !== null;
    }
}

// Modules/Core/Enums/UserStatus.php
enum UserStatus: string
{
    case ACTIVE = 'active';
    case SUSPENDED = 'suspended';
    case BANNED = 'banned';
}
```

### AdminUser Model

```php
// Modules/Auth/Models/AdminUser.php
class AdminUser extends Authenticatable
{
    protected $fillable = [
        'full_name',
        'email',
        'password',
        'avatar_path',
        'status',
        'last_login_at',
        'two_factor_secret',
    ];

    protected $casts = [
        'status' => UserStatus::class,
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    use HasRoles, HasPermissions; // spatie/laravel-permission

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super-admin');
    }

    public function can2FA(): bool
    {
        return $this->two_factor_secret !== null;
    }
}
```

### OTP Model

```php
// Modules/Auth/Models/OtpCode.php
class OtpCode extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'phone',
        'code_hash',
        'purpose', // 'register', 'verify_phone', 'reset_password'
        'expires_at',
        'consumed_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'consumed_at' => 'datetime',
    ];

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isConsumed(): bool
    {
        return $this->consumed_at !== null;
    }

    public function consume(): void
    {
        $this->update(['consumed_at' => now()]);
    }
}
```

---

## 2. Services

### AuthService

```php
// Modules/Auth/Services/AuthService.php
class AuthService
{
    public function __construct(
        private OtpService $otp,
        private PasswordService $password,
    ) {}

    /**
     * Register a new user with phone.
     * @throws AuthenticationException if phone already registered
     */
    public function registerUser(
        string $fullName,
        string $phone,
        string $password,
        GeoLocationDTO $location
    ): User {
        // Validate phone not registered
        if (User::where('phone', $phone)->exists()) {
            throw new AuthenticationException('Phone already registered.');
        }

        // Create user (status: active, account_type: free, not verified yet)
        $user = User::create([
            'full_name' => $fullName,
            'phone' => $phone,
            'password' => $password, // Auto-hashed by cast
            'zone_id' => $location->zone_id,
            'state_id' => $location->state_id,
            'lga_id' => $location->lga_id,
            'account_type' => AccountType::FREE,
            'status' => UserStatus::ACTIVE,
        ]);

        // Send OTP
        $this->otp->sendPhoneOtp($user, 'verify_phone');

        event(new UserRegistered($user, $phone));

        return $user;
    }

    /**
     * Verify user's phone with OTP.
     * @throws AuthenticationException if OTP invalid/expired
     */
    public function verifyPhoneOtp(User $user, string $code): void
    {
        if (!$this->otp->verifyOtp($user->phone, $code, 'verify_phone')) {
            throw new AuthenticationException('Invalid or expired OTP.');
        }

        $user->update(['phone_verified_at' => now()]);
    }

    /**
     * Authenticate user and create API token.
     * @throws AuthenticationException if invalid credentials
     */
    public function loginUser(
        string $phone,
        string $password,
        string $deviceName
    ): array {
        $user = User::where('phone', $phone)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw new AuthenticationException('Invalid credentials.');
        }

        if ($user->status !== UserStatus::ACTIVE) {
            throw new AuthenticationException('Account is suspended or banned.');
        }

        // Create token
        $token = $user->createToken($deviceName)->plainTextToken;

        // Update last login
        $user->update(['last_login_at' => now()]);

        return [
            'token' => $token,
            'user' => $user,
        ];
    }

    /**
     * Revoke all tokens for a user (logout).
     */
    public function logoutUser(User $user): void
    {
        $user->tokens()->delete();
    }

    /**
     * Revoke a specific token.
     */
    public function logoutDevice(User $user, string $tokenId): void
    {
        $user->tokens()->where('id', $tokenId)->delete();
    }

    /**
     * Initiate password reset (sends OTP).
     */
    public function initiatePasswordReset(string $phone): void
    {
        $user = User::where('phone', $phone)->first();
        if (!$user) {
            // Don't reveal if phone exists; silent success
            return;
        }

        $this->otp->sendPhoneOtp($user, 'reset_password');
    }

    /**
     * Reset password with OTP.
     * @throws AuthenticationException if OTP invalid
     */
    public function resetPasswordWithOtp(
        string $phone,
        string $code,
        string $newPassword
    ): void {
        if (!$this->otp->verifyOtp($phone, $code, 'reset_password')) {
            throw new AuthenticationException('Invalid or expired OTP.');
        }

        $user = User::where('phone', $phone)->firstOrFail();
        $user->update(['password' => $newPassword]); // Auto-hashed
        $user->tokens()->delete(); // Revoke all sessions
    }
}
```

### OtpService

```php
// Modules/Auth/Services/OtpService.php
class OtpService
{
    /**
     * Generate and send OTP via SMS.
     */
    public function sendPhoneOtp(
        User $user,
        string $purpose = 'verify_phone'
    ): void {
        // Clean up old expired codes
        OtpCode::where('phone', $user->phone)
            ->where('purpose', $purpose)
            ->where('expires_at', '<', now())
            ->delete();

        // Generate 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $codeHash = Hash::make($code);

        // Store hashed code
        OtpCode::create([
            'user_id' => $user->id,
            'phone' => $user->phone,
            'code_hash' => $codeHash,
            'purpose' => $purpose,
            'expires_at' => now()->addMinutes(10),
        ]);

        // Send via SMS (Termii, Twilio, etc.)
        SendOtpSms::dispatch($user->phone, $code);
    }

    /**
     * Verify OTP code.
     */
    public function verifyOtp(
        string $phone,
        string $code,
        string $purpose
    ): bool {
        $otpRecord = OtpCode::where('phone', $phone)
            ->where('purpose', $purpose)
            ->latest('created_at')
            ->first();

        if (!$otpRecord) {
            return false;
        }

        if ($otpRecord->isExpired() || $otpRecord->isConsumed()) {
            return false;
        }

        if (!Hash::check($code, $otpRecord->code_hash)) {
            return false;
        }

        $otpRecord->consume();
        return true;
    }
}
```

### AdminAuthService

```php
// Modules/Auth/Services/AdminAuthService.php
class AdminAuthService
{
    /**
     * Authenticate admin with email + password + 2FA.
     */
    public function loginAdmin(
        string $email,
        string $password,
        ?string $twoFactorCode = null
    ): array {
        $admin = AdminUser::where('email', $email)->first();

        if (!$admin || !Hash::check($password, $admin->password)) {
            throw new AuthenticationException('Invalid email or password.');
        }

        if ($admin->status !== UserStatus::ACTIVE) {
            throw new AuthenticationException('Account is suspended.');
        }

        // If 2FA enabled, require code
        if ($admin->two_factor_secret) {
            if (!$twoFactorCode) {
                throw new AuthenticationException('2FA code required.');
            }

            $google2fa = new Google2FA();
            if (!$google2fa->verifyKey($admin->two_factor_secret, $twoFactorCode)) {
                throw new AuthenticationException('Invalid 2FA code.');
            }
        }

        $admin->update(['last_login_at' => now()]);

        return ['admin' => $admin];
    }

    /**
     * Generate 2FA secret for admin.
     */
    public function generateTwoFactorSecret(AdminUser $admin): array
    {
        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();
        $qrCode = $google2fa->getQRCodeUrl(
            'Shurafah Admin',
            $admin->email,
            $secret
        );

        return ['secret' => $secret, 'qr_code' => $qrCode];
    }

    /**
     * Confirm 2FA setup.
     */
    public function confirmTwoFactorSetup(
        AdminUser $admin,
        string $secret,
        string $code
    ): void {
        $google2fa = new Google2FA();
        if (!$google2fa->verifyKey($secret, $code)) {
            throw new AuthenticationException('Invalid verification code.');
        }

        $admin->update(['two_factor_secret' => $secret]);
    }
}
```

---

## 3. Routes

### Web Routes

```php
// Modules/Auth/Routes/web.php
Route::middleware('guest')->group(function () {
    Route::get('register', [Web\RegisterController::class, 'show'])->name('register');
    Route::post('register', [Web\RegisterController::class, 'store']);

    Route::get('login', [Web\LoginController::class, 'show'])->name('login');
    Route::post('login', [Web\LoginController::class, 'store']);

    Route::get('forgot-password', [Web\ForgotPasswordController::class, 'show'])->name('forgot-password');
    Route::post('forgot-password', [Web\ForgotPasswordController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [Web\LoginController::class, 'logout'])->name('logout');
    Route::get('verify-otp', [Web\OtpController::class, 'show'])->name('verify-otp');
    Route::post('verify-otp', [Web\OtpController::class, 'verify']);
});

Route::prefix('admin')->middleware('guest')->group(function () {
    Route::get('login', [Admin\LoginController::class, 'show'])->name('admin.login');
    Route::post('login', [Admin\LoginController::class, 'store']);
});

Route::prefix('admin')->middleware('auth:admin')->group(function () {
    Route::post('logout', [Admin\LoginController::class, 'logout'])->name('admin.logout');
    Route::get('2fa/setup', [Admin\TwoFactorController::class, 'setup'])->name('admin.2fa.setup');
    Route::post('2fa/confirm', [Admin\TwoFactorController::class, 'confirm'])->name('admin.2fa.confirm');
});
```

### API Routes

```php
// Modules/Auth/Routes/api.php
Route::prefix('api/v1/auth')->group(function () {
    Route::post('register', [Api\AuthController::class, 'register']);
    Route::post('verify-otp', [Api\AuthController::class, 'verifyOtp']);
    Route::post('login', [Api\AuthController::class, 'login']);
    Route::post('forgot-password', [Api\AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [Api\AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [Api\AuthController::class, 'me']);
        Route::post('logout', [Api\AuthController::class, 'logout']);
        Route::post('logout-device/{token_id}', [Api\AuthController::class, 'logoutDevice']);
    });
});
```

---

## 4. Controllers

### Web Register Controller

```php
// Modules/Auth/Http/Controllers/Web/RegisterController.php
class RegisterController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function show()
    {
        $zones = Zone::all();
        return view('auth.register', ['zones' => $zones]);
    }

    public function store(RegisterRequest $request)
    {
        $user = $this->authService->registerUser(
            $request->full_name,
            $request->phone,
            $request->password,
            new GeoLocationDTO(
                zone_id: $request->zone_id,
                state_id: $request->state_id,
                lga_id: $request->lga_id,
            )
        );

        return redirect()->route('verify-otp')
            ->with('message', 'OTP sent to your phone');
    }
}
```

### API Auth Controller

```php
// Modules/Auth/Http/Controllers/Api/AuthController.php
class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function register(RegisterRequest $request)
    {
        $user = $this->authService->registerUser(
            $request->full_name,
            $request->phone,
            $request->password,
            new GeoLocationDTO(...$request->location)
        );

        return response()->json([
            'message' => 'Registration successful. Verify your phone with OTP.',
            'data' => ['user_id' => $user->id, 'phone' => $user->phone]
        ], 201);
    }

    public function verifyOtp(VerifyOtpRequest $request)
    {
        $user = User::where('phone', $request->phone)->firstOrFail();
        $this->authService->verifyPhoneOtp($user, $request->code);

        return response()->json([
            'message' => 'Phone verified successfully.',
            'data' => new UserResource($user)
        ]);
    }

    public function login(LoginRequest $request)
    {
        $result = $this->authService->loginUser(
            $request->phone,
            $request->password,
            $request->device_name
        );

        return response()->json([
            'message' => 'Login successful.',
            'data' => [
                'token' => $result['token'],
                'user' => new UserResource($result['user'])
            ]
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'data' => new UserResource($request->user())
        ]);
    }

    public function logout(Request $request)
    {
        $this->authService->logoutUser($request->user());
        return response()->json(['message' => 'Logged out successfully.']);
    }
}
```

---

## 5. Policies

Auth does not define policies (auth is about identity, not authorization). Policies live in individual modules (e.g., SongPolicy, PlaylistPolicy).

---

## 6. Events & Listeners

```php
// Modules/Auth/Events/UserLoggedIn.php
class UserLoggedIn
{
    public function __construct(public User $user) {}
}

// Modules/Auth/Listeners/RecordLoginActivity.php
class RecordLoginActivity
{
    public function handle(UserLoggedIn $event)
    {
        activity()
            ->causedBy($event->user)
            ->log('User logged in');
    }
}
```

---

## 7. Jobs (Queued Work)

```php
// Modules/Auth/Jobs/SendOtpSms.php
class SendOtpSms extends BaseJob
{
    public function __construct(
        public string $phone,
        public string $code,
    ) {}

    public function handle()
    {
        // Send via Termii, Twilio, etc.
        
        try {
            Termii::send($this->phone, "Your Shurafah OTP: {$this->code}");
        } catch (Exception $e) {
            // Log and retry
            report($e);
            $this->fail($e);
        }
    }
}
```

---

## 8. Migrations

Refer to: `architecture/04-database-schema.md` → sections on **users**, **admin_users**, **personal_access_tokens**, **otp_codes**.

---

## 9. Tests

### Registration Tests

```php
// Modules/Auth/Tests/Feature/RegisterTest.php
test('user can register with phone', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'full_name' => 'John Doe',
        'phone' => '08012345678',
        'password' => 'SecurePass123!',
        'zone_id' => 1,
        'state_id' => 1,
        'lga_id' => 1,
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['data' => ['user_id', 'phone']]);

    expect(User::where('phone', '08012345678')->exists())->toBeTrue();
});

test('registration fails if phone already exists', function () {
    User::factory()->create(['phone' => '08012345678']);

    $response = $this->postJson('/api/v1/auth/register', [
        'full_name' => 'Jane Doe',
        'phone' => '08012345678',
        'password' => 'SecurePass123!',
        'zone_id' => 1,
        'state_id' => 1,
        'lga_id' => 1,
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('phone');
});
```

### Login Tests

```php
// Modules/Auth/Tests/Feature/LoginTest.php
test('user can login with valid credentials', function () {
    $user = User::factory()->create([
        'phone' => '08012345678',
        'password' => 'SecurePass123!',
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'phone' => '08012345678',
        'password' => 'SecurePass123!',
        'device_name' => 'Mobile App',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['data' => ['token', 'user']]);

    expect($user->tokens)->not->toBeEmpty();
});

test('login fails with invalid password', function () {
    User::factory()->create(['phone' => '08012345678', 'password' => 'WrongPass!']);

    $response = $this->postJson('/api/v1/auth/login', [
        'phone' => '08012345678',
        'password' => 'WrongPassword!',
        'device_name' => 'Mobile App',
    ]);

    $response->assertStatus(401);
});
```

### OTP Tests

```php
// Modules/Auth/Tests/Feature/OtpTest.php
test('OTP verification works', function () {
    $user = User::factory()->create();
    $service = app(OtpService::class);
    $service->sendPhoneOtp($user, 'verify_phone');

    $otpRecord = OtpCode::where('phone', $user->phone)->latest()->first();
    $code = '123456'; // Mock code (would be from SMS in real scenario)

    // For testing, we need to temporarily allow code verification
    // In real scenario, code is hashed
    expect($service->verifyOtp($user->phone, $code, 'verify_phone'))->toBeBool();
});
```

---

## 10. Security Checklist

- [ ] Passwords hashed with bcrypt/argon2id (Laravel default)
- [ ] OTP codes hashed before storage
- [ ] OTP single-use and time-limited (10 minutes)
- [ ] Phone login rate-limited (5 attempts per 15 minutes per phone + IP)
- [ ] Registration validates phone format (Nigerian format)
- [ ] Password reset OTP validates user ownership
- [ ] 2FA mandatory for super-admin and finance roles
- [ ] Sanctum tokens have device names for multi-device tracking
- [ ] Logout revokes all tokens (or specific device token)
- [ ] No passwords logged or exposed in errors
- [ ] SMS gateway credentials in `.env`, never in code

---

## Integration Checklist (Phase 3)

- [ ] User table migrations created
- [ ] AdminUser table migrations created
- [ ] OtpCode table migrations created
- [ ] Sanctum configured (personal_access_tokens table)
- [ ] Auth guards defined (`web`, `admin`, `api`)
- [ ] AuthService, OtpService, AdminAuthService implemented
- [ ] All controllers (Web + API) implemented
- [ ] FormRequests validated (phone format, password strength, etc.)
- [ ] All feature + unit tests passing
- [ ] Security checklist passed
- [ ] SMS provider configured (test keys in staging, live in prod)

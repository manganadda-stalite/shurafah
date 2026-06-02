# Error Handling & Monitoring Strategy

## Overview

This document defines how Shurafah handles errors, logs exceptions, monitors application health, and responds to incidents.

---

## 1. Error Handling Architecture

### Exception Hierarchy

Define custom exceptions for different scenarios:

```php
// Modules/Core/Exceptions/ShurafahException.php
abstract class ShurafahException extends Exception
{
    /**
     * HTTP status code for this exception
     */
    protected int $statusCode = 500;

    /**
     * User-friendly message (never internals)
     */
    protected string $userMessage;

    /**
     * Whether to log this exception
     */
    protected bool $shouldReport = true;

    public function statusCode(): int
    {
        return $this->statusCode;
    }

    public function userMessage(): string
    {
        return $this->userMessage ?? 'An error occurred. Please try again.';
    }

    public function shouldReport(): bool
    {
        return $this->shouldReport;
    }
}

// Modules/Core/Exceptions/AuthenticationException.php
class AuthenticationException extends ShurafahException
{
    protected int $statusCode = 401;
    protected string $userMessage = 'Authentication failed. Please check your credentials.';
}

// Modules/Core/Exceptions/AuthorizationException.php
class AuthorizationException extends ShurafahException
{
    protected int $statusCode = 403;
    protected string $userMessage = 'You do not have permission to perform this action.';
}

// Modules/Core/Exceptions/ValidationException.php
class ValidationException extends ShurafahException
{
    protected int $statusCode = 422;
    protected string $userMessage = 'Validation failed. Please check your input.';
    public array $errors = [];

    public function __construct(array $errors = [])
    {
        $this->errors = $errors;
        parent::__construct('Validation failed.');
    }
}

// Modules/Core/Exceptions/ResourceNotFoundException.php
class ResourceNotFoundException extends ShurafahException
{
    protected int $statusCode = 404;
    protected string $userMessage = 'The requested resource was not found.';
}

// Modules/Core/Exceptions/RateLimitExceededException.php
class RateLimitExceededException extends ShurafahException
{
    protected int $statusCode = 429;
    protected string $userMessage = 'Too many requests. Please try again later.';
    protected bool $shouldReport = false; // Don't spam logs
}

// Modules/Core/Exceptions/PaymentException.php
class PaymentException extends ShurafahException
{
    protected int $statusCode = 402; // Payment Required
    protected string $userMessage = 'Payment processing failed. Please try again.';
}

// Modules/Core/Exceptions/ExternalServiceException.php
class ExternalServiceException extends ShurafahException
{
    protected int $statusCode = 502; // Bad Gateway
    protected string $userMessage = 'External service unavailable. Please try again later.';
}
```

### Exception Handler

```php
// app/Exceptions/Handler.php
class Handler extends ExceptionHandler
{
    protected $dontReport = [
        AuthenticationException::class,
        AuthorizationException::class,
        ValidationException::class,
        ResourceNotFoundException::class,
        RateLimitExceededException::class,
    ];

    /**
     * Register exception handlers
     */
    public function register(): void
    {
        $this->renderable(function (ShurafahException $e, $request) {
            return $this->handleShurafahException($e, $request);
        });

        $this->renderable(function (ValidationException $e, $request) {
            return $this->handleValidationException($e, $request);
        });

        $this->renderable(function (Throwable $e, $request) {
            return $this->handleGenericException($e, $request);
        });
    }

    /**
     * Handle Shurafah-specific exceptions
     */
    private function handleShurafahException(ShurafahException $e, $request)
    {
        // Log if shouldReport is true
        if ($e->shouldReport()) {
            Log::error($e->getMessage(), [
                'exception' => class_basename($e),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
        }

        // API response
        if ($request->expectsJson()) {
            return response()->json([
                'message' => $e->userMessage(),
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], $e->statusCode());
        }

        // Web response
        return redirect()->back()
            ->withErrors(['error' => $e->userMessage()])
            ->withInput();
    }

    /**
     * Handle validation exceptions
     */
    private function handleValidationException(ValidationException $e, $request)
    {
        // API response
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors,
            ], 422);
        }

        // Web response
        return redirect()->back()
            ->withErrors($e->errors)
            ->withInput();
    }

    /**
     * Handle generic exceptions (framework/third-party)
     */
    private function handleGenericException(Throwable $e, $request)
    {
        // Always log unexpected exceptions
        Log::critical($e->getMessage(), [
            'exception' => class_basename($e),
            'trace' => $e->getTraceAsString(),
        ]);

        // Send to Sentry
        if (app()->bound('sentry')) {
            app('sentry')->captureException($e);
        }

        // API response
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'An error occurred. Our team has been notified.',
                'error_id' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }

        // Web response
        return response()->view('errors.500', [], 500);
    }
}
```

---

## 2. Logging Strategy

### Log Channels Configuration

```php
// config/logging.php
return [
    'default' => env('LOG_CHANNEL', 'stack'),

    'channels' => [
        'stack' => [
            'driver' => 'stack',
            'channels' => ['daily', 'sentry'],
            'ignore_exceptions' => false,
        ],

        'daily' => [
            'driver' => 'daily',
            'path' => storage_path('logs/laravel.log'),
            'level' => env('LOG_LEVEL', 'debug'),
            'days' => 14,
        ],

        'sentry' => [
            'driver' => 'sentry',
            'level' => 'error',
        ],
    ],
];
```

### Log Levels

| Level | Usage |
|-------|-------|
| **DEBUG** | Detailed development info (query logs, timings) |
| **INFO** | Significant events (user login, payment, batch job) |
| **NOTICE** | Noteworthy but expected (rate limit exceeded) |
| **WARNING** | Potentially problematic (slow query, high memory) |
| **ERROR** | Error conditions (payment failed, SMS failed) |
| **CRITICAL** | Very serious (database down, out of disk) |
| **ALERT** | Must take action immediately (security breach) |
| **EMERGENCY** | System is unusable |

### Structured Logging

Always log with context:

```php
// Good: Structured context
Log::info('User registered', [
    'user_id' => $user->id,
    'phone' => $user->phone,
    'zone_id' => $user->zone_id,
    'duration_ms' => $timer->elapsed(),
]);

// Bad: Unstructured
Log::info("User {$user->phone} registered");

// Good: Error with context
Log::error('Payment gateway failed', [
    'gateway' => 'paystack',
    'reference' => $reference,
    'error_code' => $response['error_code'],
    'http_status' => $response['status'],
    'retry_attempt' => $retryCount,
]);

// Good: Performance warning
Log::warning('Slow query detected', [
    'query' => 'SELECT ... FROM songs ...',
    'duration_ms' => 5000,
    'threshold_ms' => 1000,
    'user_id' => auth()->id(),
]);
```

### Sensitive Data Masking

```php
// config/logging.php
'daily' => [
    'driver' => 'daily',
    'path' => storage_path('logs/laravel.log'),
    'level' => env('LOG_LEVEL', 'debug'),
    'days' => 14,
    'tap' => [\Modules\Core\Logging\MaskSensitiveData::class],
],

// Modules/Core/Logging/MaskSensitiveData.php
class MaskSensitiveData
{
    public function __invoke($logger)
    {
        foreach ($logger->getHandlers() as $handler) {
            $handler->pushProcessor(function ($record) {
                $record['extra'] = $this->maskSensitive($record['extra'] ?? []);
                $record['context'] = $this->maskSensitive($record['context'] ?? []);
                return $record;
            });
        }
    }

    private function maskSensitive(array $data): array
    {
        $sensitiveKeys = ['password', 'token', 'secret', 'card', 'ssn', 'email'];

        foreach ($sensitiveKeys as $key) {
            if (isset($data[$key])) {
                $data[$key] = '***MASKED***';
            }
        }

        return $data;
    }
}
```

---

## 3. Monitoring & Observability

### Sentry Integration

```php
// config/sentry.php (after composer require sentry/sentry-laravel)
return [
    'dsn' => env('SENTRY_LARAVEL_DSN'),
    'environment' => env('SENTRY_ENVIRONMENT', env('APP_ENV')),
    'release' => env('APP_VERSION'),
    'traces_sample_rate' => env('SENTRY_TRACE_SAMPLE_RATE', 0.1),
    'profiles_sample_rate' => env('SENTRY_PROFILE_SAMPLE_RATE', 0.1),

    'breadcrumbs' => [
        'logs' => true,
        'sql_queries' => true,
        'cache' => true,
    ],

    'integrations' => [
        \Sentry\Laravel\Integration\RequestIntegration::class,
        \Sentry\Laravel\Integration\QueueIntegration::class,
    ],
];

// Usage in code
use Sentry\Laravel\Facade as Sentry;

// Capture exception
try {
    // risky code
} catch (Exception $e) {
    Sentry::captureException($e);
}

// Add breadcrumb
Sentry::addBreadcrumb(
    message: 'Payment initiated',
    level: 'info',
    category: 'payment',
    data: ['reference' => $reference, 'amount' => $amount]
);

// Set context
Sentry::setContext('payment', [
    'gateway' => 'paystack',
    'reference' => $reference,
]);

// Set user
Sentry::setUser([
    'id' => $user->id,
    'email' => $user->email,
    'phone' => substr($user->phone, -4),  // Masked
]);
```

### Health Checks

```php
// routes/api.php
Route::get('/up', function () {
    return response()->json([
        'status' => 'ok',
        'database' => DB::connection()->getPDO() ? 'ok' : 'failed',
        'redis' => Redis::ping() === true ? 'ok' : 'failed',
        'storage' => Storage::disk('s3')->exists('.health') ? 'ok' : 'failed',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Middleware to check health before accepting requests
// app/Http/Middleware/HealthCheck.php
class HealthCheck
{
    public function handle(Request $request, Closure $next)
    {
        // Quick health check on every request (optional)
        if (!DB::connection()->getDatabaseName()) {
            return response()->json(['error' => 'Database unavailable'], 503);
        }

        return $next($request);
    }
}
```

### Custom Metrics & Events

```php
// Modules/Core/Events/MetricsEvent.php
abstract class MetricsEvent
{
    abstract public function name(): string;
    abstract public function data(): array;
    abstract public function tags(): array;
}

// Modules/Premium/Events/SubscriptionCreated.php
class SubscriptionCreated extends MetricsEvent
{
    public function __construct(
        public Subscription $subscription,
        public User $user,
    ) {}

    public function name(): string { return 'subscription.created'; }

    public function data(): array
    {
        return [
            'subscription_id' => $this->subscription->id,
            'user_id' => $this->user->id,
            'plan_id' => $this->subscription->plan_id,
            'amount' => $this->subscription->amount,
            'gateway' => $this->subscription->gateway,
        ];
    }

    public function tags(): array
    {
        return [
            'module' => 'premium',
            'event_type' => 'subscription',
        ];
    }
}

// Send to monitoring service
Listener::class (implements ShouldQueue):
public function handle(MetricsEvent $event)
{
    // Send to DataDog, New Relic, etc.
    Http::post('https://api.datadoghq.com/api/v1/events', [
        'title' => $event->name(),
        'text' => json_encode($event->data()),
        'tags' => $event->tags(),
        'alert_type' => 'info',
        'priority' => 'normal',
    ]);
}
```

---

## 4. Request/Response Logging Middleware

```php
// Modules/Core/Http/Middleware/LogRequests.php
class LogRequests
{
    public function handle(Request $request, Closure $next)
    {
        $start = microtime(true);

        $response = $next($request);

        $duration = (microtime(true) - $start) * 1000;

        // Log all API requests
        if ($request->is('api/*')) {
            $this->logApiRequest($request, $response, $duration);
        }

        return $response;
    }

    private function logApiRequest(Request $request, Response $response, float $duration)
    {
        $level = $response->getStatusCode() >= 400 ? 'warning' : 'info';

        Log::log($level, "API {$request->getMethod()} {$request->path()}", [
            'status' => $response->getStatusCode(),
            'duration_ms' => round($duration, 2),
            'user_id' => auth()->id(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'query_string' => $request->getQueryString(),
            'response_size_bytes' => strlen($response->getContent()),
        ]);
    }
}
```

---

## 5. Database Query Logging

```php
// Modules/Core/Providers/DebugServiceProvider.php
class DebugServiceProvider extends ServiceProvider
{
    public function boot()
    {
        if (config('app.debug')) {
            DB::listen(function ($query) {
                // Log slow queries
                if ($query->time > 1000) {  // > 1 second
                    Log::warning('Slow database query', [
                        'query' => $query->sql,
                        'bindings' => $query->bindings,
                        'duration_ms' => $query->time,
                    ]);
                }
            });
        }
    }
}
```

---

## 6. Queue Job Error Handling

```php
// Modules/Core/Jobs/BaseJob.php
abstract class BaseJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $connection = 'redis';
    public $timeout = 3600;
    public $tries = 3;
    public $maxExceptions = 1;
    public $backoff = [10, 30, 60];  // Exponential backoff (seconds)

    public function failed(Throwable $exception): void
    {
        Log::error("Job failed: " . class_basename($this), [
            'job_id' => $this->job->getJobId(),
            'attempts' => $this->attempts(),
            'exception' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);

        // Send alert to Slack
        Notification::route('slack', config('services.slack.alerts_webhook'))
            ->notify(new JobFailedNotification($this, $exception));
    }

    public function retrying(Throwable $exception): void
    {
        Log::notice("Job retrying: " . class_basename($this), [
            'attempt' => $this->attempts(),
            'reason' => $exception->getMessage(),
        ]);
    }
}
```

---

## 7. Alert Thresholds & Escalation

### Key Metrics to Monitor

```
Metric                  | Baseline | Warning | Critical | Action
------------------------|----------|---------|----------|--------
HTTP 5xx error rate     | < 0.1%   | > 0.5%  | > 2%     | Page on-call
API response time p95   | < 500ms  | > 1s    | > 2s     | Investigate
Database slow queries   | < 10     | > 50    | > 100    | Optimize
Queue job failure rate  | < 1%     | > 3%    | > 5%     | Investigate
Payment success rate    | > 98%    | < 95%   | < 90%    | Critical
SMS delivery success    | > 95%    | < 90%   | < 80%    | Switch provider
Cache hit rate          | > 80%    | < 60%   | < 40%    | Scale up
Disk usage              | < 50%    | > 80%   | > 90%    | Expand disk
Memory usage            | < 60%    | > 80%   | > 95%    | Scale up
```

### Escalation Flow

```
Metric Threshold Exceeded
         ↓
   Send Alert (Email/Slack)
         ↓
   Wait 5 minutes (auto-recovery)
         ↓
   Still exceeding?
    ↙       ↘
  NO        YES
  ↓         ↓
Close    Send SMS to on-call
         ↓
    Wait 5 minutes
         ↓
   Still critical?
    ↙       ↘
  NO        YES
  ↓         ↓
Close    Phone call to on-call lead
```

---

## 8. Error Response Format

### API Error Responses

**4xx Client Errors (User's fault):**

```json
{
  "message": "Validation failed.",
  "errors": {
    "phone": ["The phone field is required."]
  }
}
```

**401 Unauthorized:**

```json
{
  "message": "Unauthenticated."
}
```

**403 Forbidden:**

```json
{
  "message": "You do not have permission to perform this action."
}
```

**404 Not Found:**

```json
{
  "message": "Resource not found."
}
```

**429 Too Many Requests:**

```json
{
  "message": "Too many requests. Please try again after 60 seconds.",
  "retry_after": 60
}
```

**5xx Server Errors (Our fault):**

```json
{
  "message": "An error occurred. Our team has been notified.",
  "error_id": "sentry-id-12345"  // For user to report
}
```

### Web Error Responses

```php
// resources/views/errors/4xx.blade.php
@extends('layouts.error')

@section('code', $exception->getStatusCode())
@section('message', $exception->getMessage())
@section('description')
    The page you're looking for doesn't exist.
@endsection

// resources/views/errors/500.blade.php
@extends('layouts.error')

@section('code', '500')
@section('message', 'Server Error')
@section('description')
    An error occurred on our end. Our team has been notified.
@endsection
```

---

## 9. Security Checklist

- [ ] No stack traces exposed to users in production
- [ ] Sensitive data (passwords, tokens) never logged
- [ ] Error messages don't leak internals
- [ ] Rate limiting errors don't log user data
- [ ] Payment errors don't expose gateway responses
- [ ] API errors use generic messages for security
- [ ] All exceptions inherit from ShurafahException
- [ ] Database errors caught and logged
- [ ] External service errors handled gracefully
- [ ] Sentry properly configured for all environments

---

## 10. Troubleshooting Common Issues

### Blank Error Pages (Production)

**Problem:** Users see blank pages instead of error messages.

**Solution:**
```php
// .env
APP_DEBUG=false  // But ensure Sentry is configured
LOG_CHANNEL=stack
```

### Logs Growing Too Large

**Problem:** Storage/logs directory consuming too much disk.

**Solution:**
```php
// config/logging.php
'daily' => [
    'days' => 7,  // Reduce from default 14
],

// Or rotate daily
php artisan logs:prune --days=5
```

### Too Many False Alarms (Sentry)

**Problem:** Non-critical errors filling up Sentry.

**Solution:**
```php
// Add ignore_exceptions to Sentry config
'ignore_exceptions' => [
    RateLimitExceededException::class,
    TokenMismatchException::class,
],
```

---

## Integration Checklist (Phase 0)

- [ ] Exception hierarchy created (ShurafahException, subclasses)
- [ ] Exception Handler configured
- [ ] Logging channels configured (daily, sentry)
- [ ] Sensitive data masking implemented
- [ ] Sentry integrated and tested
- [ ] Health check endpoint created
- [ ] Request/response logging middleware added
- [ ] Database query logging for slow queries
- [ ] Error response formats documented
- [ ] Alert thresholds documented
- [ ] Security checklist passed

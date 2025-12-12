<?php

namespace App\Support;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class FrontendUrlResolver
{
    private const CACHE_PREFIX = 'frontend-url:';

    /**
     * Remember the frontend URL for a specific user context.
     */
    public static function rememberForUser(Request $request, Authenticatable $user): void
    {
        if (! $user->getAuthIdentifier()) {
            return;
        }

        if ($url = static::determineFromRequest($request)) {
            static::store(static::key('user', (string) $user->getAuthIdentifier()), $url);
        }
    }

    /**
     * Remember the frontend URL for a password reset email address.
     */
    public static function rememberForEmail(Request $request, string $email): void
    {
        if ($email === '') {
            return;
        }

        if ($url = static::determineFromRequest($request)) {
            static::store(static::key('email', static::emailKey($email)), $url);
        }
    }

    public static function resolveForUser(?Authenticatable $user): string
    {
        if (! $user || ! $user->getAuthIdentifier()) {
            return static::defaultUrl();
        }

        return static::resolveKey(static::key('user', (string) $user->getAuthIdentifier()));
    }

    public static function resolveForEmail(?string $email): string
    {
        if (! $email) {
            return static::defaultUrl();
        }

        return static::resolveKey(static::key('email', static::emailKey($email)));
    }

    protected static function resolveKey(string $key): string
    {
        $cached = Cache::get($key);

        if (is_string($cached) && static::isAllowed($cached)) {
            return rtrim($cached, '/');
        }

        if ($cached) {
            Cache::forget($key);
        }

        return static::defaultUrl();
    }

    protected static function determineFromRequest(Request $request): ?string
    {
        $candidates = array_filter([
            static::normalize($request->headers->get('Origin')),
            static::normalize($request->headers->get('Referer')),
        ]);

        foreach ($candidates as $candidate) {
            if (static::isAllowed($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    protected static function store(string $key, string $url): void
    {
        if (! static::isAllowed($url)) {
            return;
        }

        Cache::put($key, rtrim($url, '/'), now()->addSeconds(static::ttl()));
    }

    protected static function key(string $type, string $identifier): string
    {
        return self::CACHE_PREFIX.$type.':'.$identifier;
    }

    protected static function emailKey(string $email): string
    {
        return sha1(Str::lower($email));
    }

    protected static function ttl(): int
    {
        return (int) config('app.frontend_url_ttl', 3600);
    }

    protected static function defaultUrl(): string
    {
        return rtrim((string) config('app.frontend_url', config('app.url')), '/');
    }

    protected static function allowedUrls(): array
    {
        $urls = config('app.frontend_urls', []);
        $urls[] = config('app.frontend_url');

        $unique = [];

        foreach ($urls as $url) {
            $trimmed = rtrim((string) $url, '/');
            if ($trimmed === '') {
                continue;
            }

            $normalized = static::normalize($trimmed);
            if ($normalized === null) {
                continue;
            }

            $unique[$normalized] = true;
        }

        return $unique;
    }

    protected static function isAllowed(string $url): bool
    {
        return isset(static::allowedUrls()[static::normalize($url) ?? '']);
    }

    protected static function normalize(?string $value): ?string
    {
        if (! is_string($value) || $value === '') {
            return null;
        }

        $parts = parse_url($value);

        if ($parts === false || empty($parts['scheme']) || empty($parts['host'])) {
            return null;
        }

        $scheme = strtolower($parts['scheme']);
        $host = strtolower($parts['host']);
        $port = isset($parts['port']) ? ':'.$parts['port'] : '';

        return "{$scheme}://{$host}{$port}";
    }
}

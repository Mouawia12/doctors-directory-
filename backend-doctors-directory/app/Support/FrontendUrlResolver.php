<?php

namespace App\Support;

use Illuminate\Http\Request;

class FrontendUrlResolver
{
    /**
     * Resolve the frontend base URL for the current HTTP context.
     */
    public static function resolve(?Request $request = null): string
    {
        $default = static::defaultUrl();

        $allowed = static::allowedUrls($default);
        if (empty($allowed)) {
            return $default;
        }

        $request ??= static::currentRequest();

        if ($request) {
            $candidates = array_filter([
                static::normalize($request->query('frontend_url')),
                static::normalize($request->input('frontend_url')),
                static::normalize($request->headers->get('Origin')),
                static::normalize($request->headers->get('Referer')),
            ]);

            foreach ($candidates as $candidate) {
                foreach ($allowed as $url => $host) {
                    if ($candidate === $host) {
                        return $url;
                    }
                }
            }
        }

        return $default;
    }

    /**
     * Append the resolved frontend URL as a query parameter.
     */
    public static function appendFrontendQuery(string $url, ?string $frontendUrl = null): string
    {
        $frontendUrl ??= static::resolve();

        if ($frontendUrl === '') {
            return $url;
        }

        $separator = str_contains($url, '?') ? '&' : '?';

        return "{$url}{$separator}frontend_url=".urlencode($frontendUrl);
    }

    protected static function defaultUrl(): string
    {
        return rtrim((string) config('app.frontend_url', config('app.url')), '/');
    }

    /**
     * @return array<string, string> Map of allowed URLs keyed by full base value.
     */
    protected static function allowedUrls(?string $default = null): array
    {
        $urls = config('app.frontend_urls', []);

        if ($default !== null && $default !== '') {
            $urls[] = $default;
        }

        $unique = [];

        foreach ($urls as $url) {
            $trimmed = rtrim((string) $url, '/');
            if ($trimmed === '') {
                continue;
            }

            $host = static::normalize($trimmed);

            if ($host === null) {
                continue;
            }

            $unique[$trimmed] = $host;
        }

        return $unique;
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

    protected static function currentRequest(): ?Request
    {
        return app()->bound('request') ? app('request') : null;
    }
}

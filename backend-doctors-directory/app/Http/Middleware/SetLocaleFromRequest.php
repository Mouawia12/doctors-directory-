<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SetLocaleFromRequest
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $supported = ['ar', 'en'];
        $locale = $request->query('lang')
            ?? $request->header('X-Locale')
            ?? $request->header('Accept-Language')
            ?? config('app.locale');

        $locale = strtolower(substr((string) $locale, 0, 2));

        if (! in_array($locale, $supported, true)) {
            $locale = config('app.locale');
        }

        app()->setLocale($locale);

        return $next($request);
    }
}

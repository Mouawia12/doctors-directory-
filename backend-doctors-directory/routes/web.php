<?php

use App\Models\Doctor;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

Route::get('/sitemap.xml', function () {
    $staticPages = [
        ['loc' => url('/'), 'priority' => '1.0'],
        ['loc' => url('/search'), 'priority' => '0.8'],
    ];

    $doctorUrls = Doctor::approved()
        ->select('id', 'updated_at')
        ->latest('updated_at')
        ->limit(100)
        ->get()
        ->map(fn (Doctor $doctor) => [
            'loc' => url("/doctors/{$doctor->id}"),
            'lastmod' => optional($doctor->updated_at)->toAtomString(),
            'priority' => '0.7',
        ])
        ->all();

    return response()
        ->view('sitemap', ['urls' => array_merge($staticPages, $doctorUrls)])
        ->header('Content-Type', 'application/xml');
});

require __DIR__.'/auth.php';

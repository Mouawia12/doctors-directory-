<?php

namespace App\Http\Controllers;

use App\Services\SiteSettingsService;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        return $this->respond(SiteSettingsService::all());
    }
}

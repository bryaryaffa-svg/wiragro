<?php

namespace App\Http\Controllers\Api\PublicApi;

use App\Http\Controllers\Api\ApiController;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;

class PublicBannerController extends ApiController
{
    public function index(): JsonResponse
    {
        $banners = Banner::query()
            ->where('is_active', true)
            ->where(function ($query): void {
                $query->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', now());
            })
            ->where(function ($query): void {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', now());
            })
            ->orderBy('sort_order')
            ->get();

        return $this->success('Daftar banner publik.', $banners);
    }
}

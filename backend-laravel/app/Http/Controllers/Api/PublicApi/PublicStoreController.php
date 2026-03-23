<?php

namespace App\Http\Controllers\Api\PublicApi;

use App\Http\Controllers\Api\ApiController;
use App\Models\StoreSetting;
use Illuminate\Http\JsonResponse;

class PublicStoreController extends ApiController
{
    public function show(): JsonResponse
    {
        $setting = StoreSetting::query()
            ->where('is_active', true)
            ->first();

        return $this->success('Profil toko publik.', $setting);
    }
}

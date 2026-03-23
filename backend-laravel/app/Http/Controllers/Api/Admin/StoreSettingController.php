<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Store\UpdateStoreSettingRequest;
use App\Models\StoreSetting;
use Illuminate\Http\JsonResponse;

class StoreSettingController extends ApiController
{
    public function show(): JsonResponse
    {
        $setting = StoreSetting::query()->first();

        return $this->success('Pengaturan toko.', $setting);
    }

    public function update(UpdateStoreSettingRequest $request): JsonResponse
    {
        $setting = StoreSetting::query()->first() ?? new StoreSetting(['id' => 1]);
        $setting->fill($request->validated());
        $setting->save();

        return $this->success('Pengaturan toko berhasil diperbarui.', $setting->fresh());
    }
}

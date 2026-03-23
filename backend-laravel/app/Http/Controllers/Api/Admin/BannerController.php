<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Banner\StoreBannerRequest;
use App\Http\Requests\Banner\UpdateBannerRequest;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class BannerController extends ApiController
{
    public function index(): JsonResponse
    {
        return $this->success(
            'Daftar banner admin.',
            Banner::query()->latest()->paginate(20)
        );
    }

    public function store(StoreBannerRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['image_path'] = $request->file('image')->store('banners', 'public');

        $banner = Banner::create($data);

        return $this->success('Banner berhasil dibuat.', $banner, 201);
    }

    public function show(Banner $banner): JsonResponse
    {
        return $this->success('Detail banner.', $banner);
    }

    public function update(UpdateBannerRequest $request, Banner $banner): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($banner->image_path) {
                Storage::disk('public')->delete($banner->image_path);
            }

            $data['image_path'] = $request->file('image')->store('banners', 'public');
        }

        $banner->update($data);

        return $this->success('Banner berhasil diperbarui.', $banner->fresh());
    }

    public function destroy(Banner $banner): JsonResponse
    {
        if ($banner->image_path) {
            Storage::disk('public')->delete($banner->image_path);
        }

        $banner->delete();

        return $this->success('Banner berhasil dihapus.');
    }
}

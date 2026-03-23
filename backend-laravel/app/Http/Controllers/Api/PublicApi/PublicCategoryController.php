<?php

namespace App\Http\Controllers\Api\PublicApi;

use App\Http\Controllers\Api\ApiController;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class PublicCategoryController extends ApiController
{
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return $this->success('Daftar kategori publik.', $categories);
    }
}

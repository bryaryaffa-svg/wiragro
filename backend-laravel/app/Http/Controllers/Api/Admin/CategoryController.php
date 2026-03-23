<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class CategoryController extends ApiController
{
    public function index(): JsonResponse
    {
        $categories = Category::query()->latest()->paginate(20);

        return $this->success('Daftar kategori admin.', $categories);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->generateUniqueSlug($data['name']);

        $category = Category::create($data);

        return $this->success('Kategori berhasil dibuat.', $category, 201);
    }

    public function show(Category $category): JsonResponse
    {
        return $this->success('Detail kategori.', $category);
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->generateUniqueSlug($data['name'], $category->id);

        $category->update($data);

        return $this->success('Kategori berhasil diperbarui.', $category->fresh());
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return $this->success('Kategori berhasil dihapus.');
    }

    private function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $counter = 2;

        while (
            Category::query()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}

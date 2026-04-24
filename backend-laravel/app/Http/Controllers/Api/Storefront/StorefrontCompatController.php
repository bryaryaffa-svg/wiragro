<?php

namespace App\Http\Controllers\Api\Storefront;

use App\Http\Controllers\Controller;
use App\Support\AndroidCompatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StorefrontCompatController extends Controller
{
    public function stores(AndroidCompatService $compat): JsonResponse
    {
        return response()->json($compat->storefrontStores());
    }

    public function home(Request $request, AndroidCompatService $compat): JsonResponse
    {
        $data = $request->validate([
            'store_code' => ['nullable', 'string', 'max:50'],
        ]);

        return response()->json($compat->storefrontHome($data['store_code'] ?? null));
    }

    public function categories(Request $request, AndroidCompatService $compat): JsonResponse
    {
        $data = $request->validate([
            'store_code' => ['nullable', 'string', 'max:50'],
        ]);

        return response()->json($compat->storefrontCategories($data['store_code'] ?? null));
    }

    public function products(Request $request, AndroidCompatService $compat): JsonResponse
    {
        $data = $request->validate([
            'store_code' => ['nullable', 'string', 'max:50'],
            'q' => ['nullable', 'string', 'max:100'],
            'category_slug' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'string', 'max:30'],
            'page' => ['nullable', 'integer', 'min:1'],
            'page_size' => ['nullable', 'integer', 'min:1', 'max:50'],
            'member_level' => ['nullable', 'string', 'max:50'],
        ]);

        return response()->json(
            $compat->storefrontProducts(
                storeCode: $data['store_code'] ?? null,
                query: $data['q'] ?? null,
                categorySlug: $data['category_slug'] ?? null,
                sort: (string) ($data['sort'] ?? 'latest'),
                page: (int) ($data['page'] ?? 1),
                pageSize: (int) ($data['page_size'] ?? 12),
                memberLevel: $data['member_level'] ?? null,
            )
        );
    }

    public function productDetail(string $slug, Request $request, AndroidCompatService $compat): JsonResponse
    {
        $data = $request->validate([
            'store_code' => ['nullable', 'string', 'max:50'],
            'member_level' => ['nullable', 'string', 'max:50'],
        ]);

        return response()->json(
            $compat->storefrontProductDetail(
                slug: $slug,
                storeCode: $data['store_code'] ?? null,
                memberLevel: $data['member_level'] ?? null,
            )
        );
    }

    public function articles(Request $request, AndroidCompatService $compat): JsonResponse
    {
        $data = $request->validate([
            'store_code' => ['nullable', 'string', 'max:50'],
            'page' => ['nullable', 'integer', 'min:1'],
            'page_size' => ['nullable', 'integer', 'min:1', 'max:30'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        return response()->json(
            $compat->storefrontArticles(
                storeCode: $data['store_code'] ?? null,
                page: (int) ($data['page'] ?? 1),
                pageSize: (int) ($data['page_size'] ?? 10),
                query: $data['q'] ?? null,
            )
        );
    }

    public function articleDetail(string $slug, Request $request, AndroidCompatService $compat): JsonResponse
    {
        $data = $request->validate([
            'store_code' => ['nullable', 'string', 'max:50'],
        ]);

        return response()->json($compat->storefrontArticleDetail($slug, $data['store_code'] ?? null));
    }

    public function pages(Request $request, AndroidCompatService $compat): JsonResponse
    {
        $data = $request->validate([
            'store_code' => ['nullable', 'string', 'max:50'],
        ]);

        return response()->json($compat->storefrontPages($data['store_code'] ?? null));
    }

    public function pageDetail(string $slug, Request $request, AndroidCompatService $compat): JsonResponse
    {
        $data = $request->validate([
            'store_code' => ['nullable', 'string', 'max:50'],
        ]);

        return response()->json($compat->storefrontPageDetail($slug, $data['store_code'] ?? null));
    }
}

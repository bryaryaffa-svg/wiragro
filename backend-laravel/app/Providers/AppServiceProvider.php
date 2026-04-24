<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Product;
use App\Observers\CatalogMirrorObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

    public function boot(): void
    {
        Category::observe(CatalogMirrorObserver::class);
        Product::observe(CatalogMirrorObserver::class);
    }
}

<?php

namespace App\Providers;

use App\Contracts\GoogleIdTokenVerifier;
use App\Support\GoogleApiClientIdTokenVerifier;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(GoogleIdTokenVerifier::class, GoogleApiClientIdTokenVerifier::class);
    }

    public function boot(): void
    {
    }
}

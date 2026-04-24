<?php

namespace App\Observers;

use App\Support\SiGetanCatalogSyncService;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class CatalogMirrorObserver implements ShouldHandleEventsAfterCommit
{
    public function saved(object $model): void
    {
        app(SiGetanCatalogSyncService::class)->syncCurrentCatalogSnapshot();
    }

    public function deleted(object $model): void
    {
        app(SiGetanCatalogSyncService::class)->syncCurrentCatalogSnapshot();
    }
}

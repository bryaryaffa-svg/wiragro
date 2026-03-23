<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('app:health-check', function (): void {
    $this->info('SiGe Manager API ready.');
})->purpose('Check basic application health.');

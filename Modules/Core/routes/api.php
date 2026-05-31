<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Core Module — API Routes (prefix: /api/v1)
|--------------------------------------------------------------------------
|
| The Core module is the shared foundation and registers no feature
| endpoints. Feature phases add their own /api/v1 routes within their
| own modules. See docs/api/endpoints.md for the full catalogue.
|
*/

Route::prefix('v1')->name('v1.')->group(function (): void {
    //
});

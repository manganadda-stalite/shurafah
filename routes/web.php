<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — Phase 1 (design-faithful static pages)
|--------------------------------------------------------------------------
|
| The existing static HTML pages are served verbatim through Blade. Pages are
| also routed at their original ".html" filenames because the in-page bottom-nav
| guard (validateNavigation/SAFE_PAGES in the static JS) only navigates to those
| filenames — keeping the URLs identical preserves navigation with zero markup
| changes. No DB/auth yet (Phase 2+). See docs/phases/phase-01-layout-blade.md.
|
*/

Route::view('/', 'front.home')->name('home');

// Front pages (served at their original static filenames for nav fidelity).
Route::view('/song_portal_web.html', 'front.home')->name('home.legacy');
Route::view('/shurafah_explore.html', 'front.explore')->name('explore');
Route::view('/shurafah_waazi.html', 'front.waazi')->name('waazi.index');
Route::view('/favourites_page.html', 'front.favourites')->name('favourites.index');
Route::view('/user_profile_page.html', 'front.profile')->name('profile.show');
Route::view('/login_page.html', 'front.login')->name('login.show');
Route::view('/register_page.html', 'front.register')->name('register.show');

// Admin.
Route::view('/shurafah_admin_dashboard.html', 'admin.dashboard')->name('admin.dashboard');

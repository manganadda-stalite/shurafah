<?php

/*
 * Phase 1 — each routed static page renders through Blade with HTTP 200 and
 * still contains a known design marker from the original static HTML, proving
 * the markup is served verbatim (no redesign, no framework, no Tailwind).
 */

dataset('front pages', [
    'home (root)' => ['/', '<div class="bnav">'],
    'home (legacy filename)' => ['/song_portal_web.html', '<div class="bnav">'],
    'explore' => ['/shurafah_explore.html', '<title>Shurafah — Explore</title>'],
    'waazi' => ['/shurafah_waazi.html', "Wa'azi"],
    'favourites' => ['/favourites_page.html', '<title>Shurafah — My Favourites</title>'],
    'profile' => ['/user_profile_page.html', '<title>Shurafah — My Profile</title>'],
    'login' => ['/login_page.html', '<title>Shurafah — Login</title>'],
    'register' => ['/register_page.html', '<title>Shurafah — Register</title>'],
]);

it('serves front page with 200 and design marker', function (string $uri, string $marker) {
    $this->get($uri)
        ->assertOk()
        ->assertSee($marker, false);
})->with('front pages');

it('serves the admin dashboard with 200 and design marker', function () {
    $this->get('/shurafah_admin_dashboard.html')
        ->assertOk()
        ->assertSee('shurafah-scope-banner', false)
        ->assertSee('/js/admin-sidebar.js', false);
});

it('loads shared scripts from /js via root-relative tags', function () {
    $this->get('/')->assertSee('src="/js/ads.js"', false);
});

it('does not introduce Tailwind into the rendered pages', function () {
    $body = $this->get('/')->getContent();
    expect($body)->not->toContain('cdn.tailwindcss.com');
});

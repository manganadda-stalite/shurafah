# Static Views Inventory (every file analysed)

Every file in `frontviews/` and `adminviews/` was reviewed and mapped to its **module**,
**route**, **controller**, **Blade view**, and the **phase** that wires it up. This is the
authoritative checklist for "the design is fully ported."

Conventions: web routes shown; each content page also gets the matching `/api/v1` endpoint(s)
described in [`api/`](api/). Views are relative to each module's `Resources/views` (front views
under `layouts.front`, admin under `layouts.admin`).

## Front views — `frontviews/`

| # | File | Module | Web route | Controller@method | Blade view | Phase |
|---|------|--------|-----------|-------------------|-----------|------:|
| 1 | `song_portal_web.html` | Songs | `GET /` (`home`) | `Web\HomeController@index` | `home.index` | 1→5 |
| 2 | `song_detail_page.html` | Songs | `GET /songs/{song:slug}` | `Web\SongController@show` | `songs.show` | 5 |
| 3 | `category_songs.html` | Categories | `GET /categories/{category:slug}/songs` | `Web\CategoryController@songs` | `categories.songs` | 7 |
| 4 | `subcategory_songs.html` | Categories | `GET /categories/{category}/{sub}/songs` | `Web\CategoryController@subSongs` | `categories.sub-songs` | 7 |
| 5 | `all_categories.html` | Categories | `GET /categories` | `Web\CategoryController@index` | `categories.index` | 7 |
| 6 | `all_subcategories.html` | Categories | `GET /categories/{category}` | `Web\CategoryController@show` | `categories.show` | 7 |
| 7 | `all_top_songs.html` | Songs | `GET /songs/top` | `Web\SongController@top` | `songs.list` | 5 |
| 8 | `all_trending_songs.html` | Songs/Featured | `GET /songs/trending` | `Web\SongController@trending` | `songs.list` | 5/16 |
| 9 | `all_featured_songs.html` | Songs/Featured | `GET /songs/featured` | `Web\SongController@featured` | `songs.list` | 5/16 |
| 10 | `all_recently_added.html` | Songs | `GET /songs/recent` | `Web\SongController@recent` | `songs.list` | 5 |
| 11 | `all_related_songs.html` | Songs | `GET /songs/{song}/related` | `Web\SongController@related` | `songs.list` | 5 |
| 12 | `all_songs_by_artist.html` | Artists | `GET /artists/{artist:slug}/songs` | `Web\ArtistController@songs` | `artists.songs` | 6 |
| 13 | `artist_profile_page.html` | Artists | `GET /artists/{artist:slug}` | `Web\ArtistController@show` | `artists.show` | 6 |
| 14 | `all_top_artists.html` | Artists | `GET /artists/top` | `Web\ArtistController@top` | `artists.list` | 6 |
| 15 | `all_playlists.html` | Playlists | `GET /playlists` | `Web\PlaylistController@index` | `playlists.index` | 8 |
| 16 | `playlist_songs.html` | Playlists | `GET /playlists/{playlist:slug}` | `Web\PlaylistController@show` | `playlists.show` | 8 |
| 17 | `favourites_page.html` | Favourites | `GET /favourites` | `Web\FavouriteController@index` | `favourites.index` | 8 |
| 18 | `user_profile_page.html` | Users | `GET /profile` | `Web\ProfileController@show` | `profile.show` | 4 |
| 19 | `login_page.html` | Auth | `GET /login` | `Web\Auth\LoginController@show` | `auth.login` | 3 |
| 20 | `register_page.html` | Auth + Geography | `GET /register` | `Web\Auth\RegisterController@show` | `auth.register` | 3 |
| 21 | `shurafah_explore.html` | Search | `GET /explore` | `Web\ExploreController@index` | `search.explore` | 11 |
| 22 | `all_comments.html` | Comments | `GET /{type}/{id}/comments` | `Web\CommentController@index` | `comments.index` | 10 |
| 23 | `shurafah_waazi.html` | Waazi | `GET /waazi` (`waazi.index`) | `Web\WaaziController@index` | `waazi.index` | 12 |
| 24 | `shurafah_waazi_detail.html` | Waazi | `GET /waazi/{waazi:slug}` | `Web\WaaziController@show` | `waazi.show` | 12 |
| 25 | `all_waazi_lectures.html` | Waazi | `GET /waazi/all` | `Web\WaaziController@all` | `waazi.list` | 12 |
| 26 | `all_top_lectures.html` | Waazi | `GET /waazi/top` | `Web\WaaziController@top` | `waazi.list` | 12 |
| 27 | `all_trending_lectures.html` | Waazi/Featured | `GET /waazi/trending` | `Web\WaaziController@trending` | `waazi.list` | 12/16 |
| 28 | `all_featured_lectures.html` | Waazi/Featured | `GET /waazi/featured` | `Web\WaaziController@featured` | `waazi.list` | 12/16 |
| 29 | `all_recent_lectures.html` | Waazi | `GET /waazi/recent` | `Web\WaaziController@recent` | `waazi.list` | 12 |
| 30 | `shurafah_preacher_profile.html` | Preachers | `GET /preachers/{preacher:slug}` | `Web\PreacherController@show` | `preachers.show` | 12 |
| 31 | `all_top_preachers.html` | Preachers | `GET /preachers/top` | `Web\PreacherController@top` | `preachers.list` | 12 |
| 32 | `all_waazi_categories.html` | WaaziCategories | `GET /waazi-categories` | `Web\WaaziCategoryController@index` | `waazi-categories.index` | 12 |
| 33 | `all_waazi_subcategories.html` | WaaziCategories | `GET /waazi-categories/{c}` | `Web\WaaziCategoryController@show` | `waazi-categories.show` | 12 |
| 34 | `all_waazi_series.html` | WaaziSeries | `GET /series` | `Web\SeriesController@index` | `series.index` | 12 |
| 35 | `shurafah_song_management.html` (front copy) | Songs (admin) | — | *duplicate of admin song mgmt; see note* | — | 14 |
| 36 | `ads.js` | Ads/Core | asset | served via Vite; config from `GET /api/v1/ads/config` | — | 1/18 |

## Admin views — `adminviews/`

| # | File | Module | Web route | Controller@method | Blade view | Phase |
|---|------|--------|-----------|-------------------|-----------|------:|
| 1 | `shurafah_admin_auth.html` | Auth (admin) | `GET /admin/login` | `Admin\Auth\LoginController@show` | `admin.auth.login` | 13 |
| 2 | `shurafah_admin_dashboard.html` | AdminDashboard | `GET /admin` | `Admin\DashboardController@index` | `admin.dashboard` | 13 |
| 3 | `shurafah_song_management.html` | Songs (admin) | `GET /admin/songs` | `Admin\SongController@index` | `admin.songs.index` | 14 |
| 4 | `shurafah_admin_artist_management.html` | Artists (admin) | `GET /admin/artists` | `Admin\ArtistController@index` | `admin.artists.index` | 14 |
| 5 | `shurafah_admin_artist_management - Copy.html` | — | — | **Ignore — duplicate/backup of #4. Delete during Phase 14.** | — | — |
| 6 | `shurafah_dashboard_artists.html` | Artists (admin) | `GET /admin/artists/dashboard` | `Admin\ArtistController@dashboard` | `admin.artists.dashboard` | 14 |
| 7 | `shurafah_admin_categories.html` | Categories (admin) | `GET /admin/categories` | `Admin\CategoryController@index` | `admin.categories.index` | 14 |
| 8 | `shurafah_admin_featured_trending.html` | Featured | `GET /admin/featured` | `Admin\FeaturedController@index` | `admin.featured.index` | 16 |
| 9 | `shurafah_admin_playlist_management.html` | Playlists (admin) | `GET /admin/playlists` | `Admin\PlaylistController@index` | `admin.playlists.index` | 14 |
| 10 | `shurafah_admin_waazi_management.html` | Waazi (admin) | `GET /admin/waazi` | `Admin\WaaziController@index` | `admin.waazi.index` | 15 |
| 11 | `shurafah_admin_preacher_management.html` | Preachers (admin) | `GET /admin/preachers` | `Admin\PreacherController@index` | `admin.preachers.index` | 15 |
| 12 | `shurafah_admin_waazi_categories.html` | WaaziCategories (admin) | `GET /admin/waazi-categories` | `Admin\WaaziCategoryController@index` | `admin.waazi-categories.index` | 15 |
| 13 | `shurafah_admin_waazi_series.html` | WaaziSeries (admin) | `GET /admin/series` | `Admin\SeriesController@index` | `admin.series.index` | 15 |
| 14 | `shurafah_admin_user_management.html` | Users (admin) | `GET /admin/users` | `Admin\UserController@index` | `admin.users.index` | 14 |
| 15 | `shurafah_admin_comments_reports.html` | Comments (admin) | `GET /admin/comments` | `Admin\CommentController@index` | `admin.comments.index` | 14 |
| 16 | `shurafah_ads_management.html` | Ads (admin) | `GET /admin/ads` | `Admin\AdsController@index` | `admin.ads.index` | 18 |
| 17 | `shurafah_admin_premium_subscriptions.html` | Subscriptions (admin) | `GET /admin/subscriptions` | `Admin\SubscriptionController@index` | `admin.subscriptions.index` | 17 |
| 18 | `shurafah_download_analytics.html` | Downloads (admin) | `GET /admin/analytics/downloads` | `Admin\AnalyticsController@downloads` | `admin.analytics.downloads` | 19 |
| 19 | `shurafah_admin_notifications.html` | Notifications (admin) | `GET /admin/notifications` | `Admin\NotificationController@index` | `admin.notifications.index` | 20 |
| 20 | `shurafah_admin_activity_logs.html` | ActivityLogs (admin) | `GET /admin/activity-logs` | `Admin\ActivityLogController@index` | `admin.activity-logs.index` | 21 |
| 21 | `shurafah_admin_roles.html` | AdminRoles | `GET /admin/roles` | `Admin\RoleController@index` | `admin.roles.index` | 13 |
| 22 | `shurafah_admin_settings.html` | Settings (admin) | `GET /admin/settings` | `Admin\SettingController@index` | `admin.settings.index` | 22 |
| 23 | `admin-sidebar.js` | Core/admin | asset | shared admin chrome (keep JS or port to Blade) | `partials.admin.sidebar` | 1/13 |
| 24 | `admin-topbar.js` | Core/admin | asset | shared admin chrome (theme toggle, search, bell, user menu) | `partials.admin.topbar` | 1/13 |
| 25 | `theme-manager.js` | Core/admin | asset | accent‑color manager (CSS vars) | — | 1 |

## Notes & cleanups discovered during analysis

- **Duplicate file:** `adminviews/shurafah_admin_artist_management - Copy.html` is a backup copy
  of the artist management page. Exclude it from porting; remove during Phase 14.
- **Two “song_management” files:** one in `frontviews/` and one in `adminviews/`. The admin one
  is canonical; the front copy appears to be a stray duplicate — confirm with the owner and keep
  a single source in the Songs admin views.
- **JS‑built admin chrome:** sidebar/topbar are generated by JS. Keep as‑is initially (identical
  look, least churn); optionally port to Blade partials in Phase 13.
- **Design tokens:** front uses `:root` CSS vars (`--bg/--surface/--accent…`) with a `body.light`
  theme; admin uses the same tokens plus `html.light-mode`. Accent color persists in
  `localStorage.accentColor`; admin theme in `localStorage.adminTheme`. All preserved unchanged.
- **Currency:** subscription mock‑ups price in **Naira (₦)** → Paystack/Flutterwave.
- **Auth identifier:** login/register use **phone** (Nigerian format) + password (not email).
- **Geography:** registration cascades **Zone → State → LGA**.
- **Ads:** `ads.js` integrates **Google AdSense** with guest/free/premium targeting and frequency
  caps; premium users see no ads.

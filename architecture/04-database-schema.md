# 04 — Database Schema

Conventions: `snake_case` tables (plural), `id` BIGINT unsigned PK, `created_at/updated_at`
timestamps, `deleted_at` soft‑deletes where useful, FKs named `<singular>_id`, monetary
amounts stored as **integer minor units** (kobo) to avoid float errors, all timestamps UTC.

> Build these incrementally — see the roadmap. Each migration belongs to its module's
> `Database/Migrations` folder.

## ER overview

```
zones ─< states ─< lgas
                     │
users >──────────────┘ (zone_id, state_id, lga_id)
users ─< playlists ─< playlist_song >─ songs
users ─< subscriptions >─ subscription_plans
users ─< payments
users ─< favourites (polymorphic: song | waazi)
users ─< comments  (polymorphic) ─< reports
users ─< follows   (polymorphic: artist | preacher)
users ─< downloads (polymorphic) / plays (polymorphic)

artists ─< songs >─ categories (parent_id self-join for sub-categories)
preachers ─< waazi >─ waazi_categories (parent_id self-join)
series ─< series_waazi >─ waazi

admin_users >─ roles >─ permissions (spatie)
ad_units ─< ad_placements ;  ad_events
settings ; activity_log ; notifications
```

---

## Reference / geography

### `zones`
| col | type | notes |
|-----|------|-------|
| id | BIGINT PK | |
| name | string | e.g. "North West" (6 NG geopolitical zones) |
| code | string, unique | slug |

### `states`
| id | BIGINT PK |
| zone_id | FK → zones |
| name | string | 36 states + FCT |
| code | string, unique |

### `lgas`
| id | BIGINT PK |
| state_id | FK → states |
| name | string | 774 LGAs |
| code | string |

---

## Identity & access

### `users` (end users — phone auth)
| col | type | notes |
|-----|------|-------|
| id | BIGINT PK | |
| full_name | string | |
| phone | string, **unique** | primary login identifier (NG format) |
| phone_verified_at | timestamp null | OTP verification |
| email | string, unique, null | optional |
| password | string | hashed (bcrypt/argon2id) |
| zone_id / state_id / lga_id | FK null | geography |
| avatar_path | string null | |
| account_type | enum(`free`,`premium`) | `guest` is "no row"; default `free` |
| premium_expires_at | timestamp null | denormalised for quick gating |
| status | enum(`active`,`suspended`,`banned`) | |
| last_login_at | timestamp null | |
| remember_token, timestamps, deleted_at | | |

### `admin_users` (staff — email auth, separate guard)
| id | full_name | email (unique) | password | avatar_path | status | last_login_at | two_factor_secret null | timestamps |

> RBAC via **spatie/laravel-permission**: `roles`, `permissions`, `model_has_roles`,
> `model_has_permissions`, `role_has_permissions` (guard = `admin`). Default roles:
> `super-admin`, `content-manager`, `moderator`, `finance`, `analyst`, `support`.

### Auth support tables
- `personal_access_tokens` (Sanctum, mobile).
- `password_reset_tokens`, `sessions`, `otp_codes`(id,user_id,phone,code_hash,purpose,expires_at,consumed_at).
- `failed_login_attempts` *(optional, or rely on RateLimiter)*.

---

## Music domain

### `artists`
| id | name | slug (unique) | bio text null | avatar_path null | cover_path null | is_verified bool | followers_count int | songs_count int | status enum(active,hidden) | created_by FK admin_users | timestamps | deleted_at |

### `categories` (songs)
| id | name | slug | parent_id FK→categories null (sub‑category) | icon null | color null | sort_order int | is_active bool | timestamps |

### `songs`
| col | type | notes |
|-----|------|-------|
| id | BIGINT PK | |
| title | string | |
| slug | string, unique | |
| artist_id | FK → artists | |
| category_id | FK → categories null | |
| subcategory_id | FK → categories null | |
| audio_path | string | object storage key (or via medialibrary) |
| audio_duration | unsigned int | seconds |
| cover_path | string null | |
| lyrics | text null | |
| plays_count | unsigned bigint default 0 | |
| downloads_count | unsigned bigint default 0 | |
| likes_count | unsigned bigint default 0 | |
| comments_count | unsigned int default 0 | |
| is_featured | bool default 0 | |
| is_trending | bool default 0 | (also computed; flag = manual override) |
| is_premium_only | bool default 0 | |
| status | enum(`draft`,`published`,`archived`) | |
| published_at | timestamp null | |
| uploaded_by | FK admin_users null | |
| timestamps, deleted_at | | |

Indexes: `(status, published_at)`, `(artist_id)`, `(category_id)`, `is_featured`, `is_trending`, FULLTEXT(`title`).

---

## Wa'azi domain (parallels Music)

### `preachers`
Same shape as `artists` (name, slug, bio, avatar, cover, is_verified, followers_count, waazi_count, status).

### `waazi_categories`
Same shape as `categories` (self‑join `parent_id` for sub‑categories).

### `waazi` (lectures)
Same shape as `songs` but: `preacher_id` (FK→preachers), `waazi_category_id`,
`waazi_subcategory_id`, `series_id` (FK→series null), `audio_path`, optional `video_path` (future),
`audio_duration`, counts, flags, status, published_at.

### `series` (Wa'azi series)
| id | title | slug | preacher_id FK null | cover_path null | description text null | items_count int | is_active bool | timestamps |

### `series_waazi` (ordered pivot)
| id | series_id FK | waazi_id FK | position int | unique(series_id, waazi_id) |

---

## Collections & engagement

### `playlists`
| id | user_id FK (null if curated) | title | slug | cover_path null | is_public bool | is_curated bool | created_by_admin FK null | songs_count int | timestamps |

### `playlist_song` (ordered pivot)
| id | playlist_id FK | song_id FK | position int | added_at | unique(playlist_id, song_id) |

### `favourites` (polymorphic)
| id | user_id FK | favouritable_type | favouritable_id | created_at | unique(user_id, favouritable_type, favouritable_id) |

### `follows` (polymorphic: artist | preacher)
| id | user_id FK | followable_type | followable_id | created_at | unique(...) |

### `comments` (polymorphic: song | waazi)
| id | user_id FK | commentable_type | commentable_id | parent_id FK→comments null | body text | status enum(`visible`,`hidden`,`pending`) | likes_count int | timestamps | deleted_at |

### `reports`
| id | reporter_id FK→users | reportable_type | reportable_id | reason enum/string | details text null | status enum(`open`,`resolved`,`dismissed`) | handled_by FK admin_users null | handled_at null | timestamps |

---

## Analytics

### `downloads` (polymorphic: song | waazi)
| id | user_id FK null | downloadable_type | downloadable_id | ip_hash | country | device | source enum(web,api) | created_at |

### `plays` (polymorphic) — optional but recommended
| id | user_id FK null | playable_type | playable_id | seconds_played int null | ip_hash | created_at |

Aggregations roll up daily into `download_daily_stats` / `play_daily_stats`
(`date, type, item_id, count`) via a scheduled job, so analytics screens are fast.

---

## Monetisation

### `subscription_plans`
| id | name | slug | price_minor int (kobo) | currency char(3) default 'NGN' | interval enum(`monthly`,`yearly`) | interval_count int default 1 | features json | is_active bool | sort_order | timestamps |

### `subscriptions`
| id | user_id FK | subscription_plan_id FK | status enum(`active`,`pending`,`cancelled`,`expired`) | starts_at | ends_at | auto_renew bool | gateway enum(`paystack`,`flutterwave`) | gateway_subscription_ref null | timestamps |

### `payments`
| id | user_id FK | subscription_id FK null | gateway | reference unique | amount_minor int | currency | status enum(`initiated`,`success`,`failed`,`refunded`) | paid_at null | raw_payload json | timestamps |

### `ad_units`
| id | key (unique) | name | type enum(`banner`,`native`,`interstitial`) | size | adsense_slot | code text | is_active bool | timestamps |

### `ad_placements`
| id | key (unique) e.g. `headerBanner` | ad_unit_id FK | enabled bool | target json (guest/free/premium) | frequency json | timestamps |

### `ad_events` (optional, or use AdSense reporting)
| id | placement_key | type enum(`impression`,`click`) | user_id null | created_at |

---

## System

### `notifications` (Laravel default) + `admin_broadcasts`
- `notifications` (uuid id, type, notifiable, data json, read_at).
- `admin_broadcasts` (id, title, body, audience enum(all,free,premium), channels json, scheduled_at, sent_at, created_by).

### `activity_log` (spatie)
`log_name, description, subject_type/id, causer_type/id, properties json, created_at`.

### `settings` (spatie/laravel-settings)
Stored as grouped typed settings (e.g. group `general`, `ads`, `payments`, `security`).
Fallback table: `settings(group, name, payload json, locked bool)`.

---

## Seeders (Phase 2/3)

- Geography: full Zones/States/LGAs of Nigeria.
- RBAC: default roles + permissions; one `super-admin`.
- Subscription plans: Free + Premium (Monthly/Yearly) with Naira prices from the mock‑up.
- Ad units/placements: mirror `frontviews/ads.js` config.
- Demo content (local only): a few artists, songs, preachers, lectures using the names already
  in the static HTML (e.g. "Open Heaven — Nathaniel Bassey") so screens look identical.

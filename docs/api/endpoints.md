# API Endpoints (`/api/v1`)

All paths are prefixed with `/api/v1`. `🔒` = requires auth token. `★` = admin/permissioned.
List endpoints are paginated (`page`, `per_page`) and support `filter[...]`, `sort`, `include`
where noted (allow‑listed via `spatie/laravel-query-builder`).

## Auth (Phase 3)
| Method | Path | Notes |
|--------|------|-------|
| POST | `/auth/register` | `{ full_name, phone, password, zone_id, state_id, lga_id }` → sends OTP |
| POST | `/auth/verify-otp` | `{ phone, code }` |
| POST | `/auth/resend-otp` | rate‑limited |
| POST | `/auth/login` | `{ phone, password, device_name }` → `{ token, user }` |
| POST | `/auth/logout` 🔒 | revoke current token |
| POST | `/auth/forgot-password` | start reset (OTP) |
| POST | `/auth/reset-password` | `{ phone, code, password }` |
| GET | `/auth/me` 🔒 | current user |

## Profile & Geography (Phase 4 / 2)
| GET | `/profile` 🔒 · PUT `/profile` 🔒 · POST `/profile/avatar` 🔒 |
| GET | `/zones` · `/states?zone_id=` · `/lgas?state_id=` |

## Songs (Phase 5) / Playback & Downloads (Phase 9)
| GET | `/songs` | `filter[category,artist,trending,featured]`, `sort=-plays_count`, `include=artist` |
| GET | `/songs/{id}` | full detail |
| GET | `/songs/{id}/related` |
| GET | `/songs/{id}/lyrics` |
| POST | `/songs/{id}/play` 🔒? | record play (guest allowed, throttled) |
| POST | `/songs/{id}/download` 🔒 | returns signed URL (gated: premium/free cap) |

## Artists (Phase 6)
| GET `/artists` · GET `/artists/{id}` · GET `/artists/{id}/songs` · POST `/artists/{id}/follow` 🔒 · DELETE `/artists/{id}/follow` 🔒 |

## Categories (Phase 7)
| GET `/categories` · GET `/categories/{id}` · GET `/categories/{id}/songs` |

## Playlists (Phase 8)
| GET `/playlists` 🔒 · GET `/playlists/{id}` · POST `/playlists` 🔒 · PUT `/playlists/{id}` 🔒 · DELETE `/playlists/{id}` 🔒 · POST `/playlists/{id}/songs` 🔒 · DELETE `/playlists/{id}/songs/{songId}` 🔒 · PUT `/playlists/{id}/reorder` 🔒 |

## Favourites (Phase 8)
| GET `/favourites?type=song|waazi` 🔒 · POST `/favourites/toggle` 🔒 `{ type, id }` |

## Comments & Reports (Phase 10)
| GET `/{type}/{id}/comments` · POST `/{type}/{id}/comments` 🔒 · DELETE `/comments/{id}` 🔒 (own) · POST `/comments/{id}/report` 🔒 |

## Search & Explore (Phase 11)
| GET `/search?q=&type=` · GET `/explore` (trending/featured/top/recent feed) |

## Wa'azi domain (Phase 12)
| GET `/waazi` · GET `/waazi/{id}` · GET `/waazi/{id}/related` · POST `/waazi/{id}/play` · POST `/waazi/{id}/download` 🔒 |
| GET `/preachers` · GET `/preachers/{id}` · GET `/preachers/{id}/waazi` · POST `/preachers/{id}/follow` 🔒 |
| GET `/waazi-categories` · GET `/waazi-categories/{id}` · GET `/waazi-categories/{id}/waazi` |
| GET `/series` · GET `/series/{id}` |

## Subscriptions & Payments (Phase 17)
| GET `/plans` · POST `/subscriptions` 🔒 (init payment) · POST `/subscriptions/verify` 🔒 `{ reference }` · GET `/subscriptions/me` 🔒 · POST `/subscriptions/cancel` 🔒 |
| POST `/webhooks/paystack` · POST `/webhooks/flutterwave` (signature‑auth, no token) |

## Ads (Phase 18)
| GET `/ads/config` | shape consumed by `ads.js`; `userType` from auth context |

## Notifications (Phase 20)
| GET `/notifications` 🔒 · POST `/notifications/{id}/read` 🔒 · POST `/notifications/read-all` 🔒 · POST `/devices` 🔒 (FCM token) |

## App config (Phase 22/23)
| GET `/app/config` | min app version, ads toggle, maintenance flag, feature flags |

## Admin API (optional, mirrors web admin; all ★)
Admin operations are primarily served by the Blade admin panel, but a parallel `/api/v1/admin/*`
surface (same services, `admin` guard + permissions) can be exposed for a future admin mobile
app. Defer unless needed.

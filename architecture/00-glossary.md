# 00 — Glossary

Shared vocabulary used across all architecture and roadmap documents.

| Term | Meaning |
|------|---------|
| **Shurafah** | The product: an Islamic audio platform for **songs/nasheed** and **Wa'azi (preaching)**. |
| **Front views** | The end‑user facing pages in `frontviews/` (mobile‑first web app shell). |
| **Admin views** | The staff/back‑office pages in `adminviews/`. |
| **Song** | An audio track with an **Artist**, category, duration, plays, downloads, lyrics. |
| **Wa'azi** | Islamic preaching/lecture audio. The Wa'azi equivalent of a "song" is a **Lecture**. |
| **Preacher** | The Wa'azi equivalent of an **Artist** (the author of a lecture). |
| **Series** | A curated, ordered collection of Wa'azi lectures (the Wa'azi equivalent of a playlist). |
| **Category / Sub‑category** | Two‑level taxonomy; applies separately to Songs and to Wa'azi. |
| **Playlist** | A user‑created (or admin‑curated) ordered collection of songs. |
| **Favourite** | A user's saved song/lecture (the heart icon). |
| **Account type** | `guest` (not logged in), `free` (logged in, sees ads), `premium` (paid, ad‑free). |
| **Zone / State / LGA** | Nigerian geography hierarchy used at registration: 6 geopolitical **Zones** → 36 **States** + FCT → 774 **Local Government Areas (LGA)**. |
| **Naira (₦)** | Currency used by the platform (subscription pricing). |
| **Ad unit / placement** | A configured Google AdSense block and the location it renders (header banner, in‑feed, download interstitial, etc.). See `frontviews/ads.js`. |
| **Accent color** | User‑selectable brand color persisted in `localStorage` and applied via CSS variables (`--accent`). See `adminviews/theme-manager.js`. |
| **Module** | A self‑contained business capability with its own folder, routes, controllers, models, migrations, services and tests. |
| **Guard** | A Laravel authentication context. We use a `web`/`api` guard for end users and a separate `admin` guard for staff. |
| **RBAC** | Role‑Based Access Control for admin staff (roles → permissions). |

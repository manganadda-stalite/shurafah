# Module: Favourites

**Purpose:** The heart/like feature — saving songs and lectures. Polymorphic so one
implementation serves both domains.

## Static views owned
- `frontviews/favourites_page.html` (My Favourites).
- (heart buttons embedded across song/waazi rows, cards, detail, mini‑player).

## Data / tables
- `favourites` (user_id, favouritable_type, favouritable_id, unique).

## Web routes / API
- `GET /favourites` (web), `GET /api/v1/favourites?type=song|waazi`,
  `POST /api/v1/favourites/toggle` `{ type, id }`.

## Services
- `FavouriteService` (toggle, list, isFavourited, counter cache on song/waazi `likes_count`).

## Security
- Auth required; user manages only own favourites. Guests prompted to log in (existing UI).

## Phase
- **Phase 8** (with Playlists).

## Future enhancements
- Favourite artists/preachers (already via Follows), favourite collections, sync across devices.

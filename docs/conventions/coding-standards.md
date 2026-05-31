# Coding Standards

## PHP / Laravel
- **PSR‑12** enforced by **Laravel Pint** (`vendor/bin/pint`). CI fails on style violations.
- **Static analysis**: Larastan/PHPStan at a sane level (start level 5, raise over time). No new
  errors merged.
- **Strict typing**: `declare(strict_types=1);` in new PHP files; type‑hint params & returns.
- **Naming**: Models singular (`Song`), tables plural (`songs`), controllers `SongController`,
  form requests `StoreSongRequest`/`UpdateSongRequest`, resources `SongResource`,
  services `SongService`, policies `SongPolicy`.
- **Thin controllers**: validate (FormRequest) → call service → return view/resource. No business
  logic or queries in controllers.
- **No magic**: avoid `$guarded = []`; declare `$fillable`. Avoid dynamic `getattr`‑style access.
- **Enums**: use PHP backed enums for statuses/types (`SongStatus`, `AccountType`).
- **Money**: integer minor units (kobo); never floats.
- **Time**: store UTC; format at the edge.

## Modules
- Each module is self‑contained (see `architecture/03-modular-structure.md`). Cross‑module access
  goes through the other module's **Service**, never its raw models.
- Shared contracts/DTOs live in **Core**.

## Blade / front‑end
- **Never** add Tailwind or any CSS/JS framework. Preserve existing markup/classes/styles.
- Escape output with `{{ }}`; `{!! !!}` is forbidden for user‑supplied content.
- Reuse partials/components instead of copy‑pasting markup.

## Git hygiene
- Small, focused PRs (one phase). Conventional‑commit style messages
  (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- No secrets in code; `.env.example` documents every key.

## Definition of Done (every PR)
- [ ] Pint clean, PHPStan clean.
- [ ] Tests added/updated and green.
- [ ] Security checklist (architecture/07) satisfied.
- [ ] Docs/inventory updated if a page was wired.
- [ ] No design regressions (screenshot check for UI phases).

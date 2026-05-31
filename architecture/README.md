# Shurafah — Architecture Documentation

This folder contains the **technical architecture** for turning the existing static HTML
mock‑up (`frontviews/` + `adminviews/`) into a production‑grade **Laravel 13** application
with a **Flutter‑ready REST API**, built in **small, safe, incremental phases**.

> **Golden rule:** the existing HTML designs in `frontviews/` and `adminviews/` are the
> source of truth for the UI. We do **not** redesign, do **not** introduce Tailwind, and do
> **not** migrate to another front‑end framework. Laravel serves the *exact same markup*
> through Blade templates and partials. See [`05-blade-integration.md`](05-blade-integration.md).

## How to read these docs

| # | Document | Purpose |
|---|----------|---------|
| 00 | [`00-glossary.md`](00-glossary.md) | Shared vocabulary (Wa'azi, Zone/State/LGA, account types…) |
| 01 | [`01-system-overview.md`](01-system-overview.md) | High‑level architecture, context & component diagrams |
| 02 | [`02-tech-stack.md`](02-tech-stack.md) | Laravel version, PHP, DB, every package/library with reason |
| 03 | [`03-modular-structure.md`](03-modular-structure.md) | Module folder layout (one folder per module) |
| 04 | [`04-database-schema.md`](04-database-schema.md) | All tables, columns, relationships & ERD |
| 05 | [`05-blade-integration.md`](05-blade-integration.md) | How static HTML becomes Blade **without redesign** |
| 06 | [`06-frontend-asset-strategy.md`](06-frontend-asset-strategy.md) | CSS/JS, theme manager, ads.js handling |
| 07 | [`07-security-architecture.md`](07-security-architecture.md) | Industry‑standard security controls |
| 08 | [`08-api-architecture.md`](08-api-architecture.md) | Flutter REST API: auth, versioning, conventions |
| 09 | [`09-environments-and-deployment.md`](09-environments-and-deployment.md) | Local/staging/prod, CI/CD, storage, queues |
| — | [`modules/`](modules/) | One detailed spec per functional module |

## Companion folders

- [`../docs/`](../docs/) — the **delivery plan**: phased roadmap, per‑phase task lists,
  static‑views inventory, API endpoint catalogue, and engineering conventions.

## Design principles

1. **Phased & small** — ship the smallest useful slice first; never a big‑bang rewrite.
2. **Modular** — each business capability lives in its own module folder with its own
   routes, controllers, models, migrations, services, and tests.
3. **Secure by default** — every phase has explicit security acceptance criteria.
4. **API‑first where it matters** — the same domain services power both the web app and the
   Flutter mobile API, so the mobile app needs no new business logic.
5. **Design‑faithful** — pixel‑identical to the static HTML; styling stays in the existing
   `<style>`/CSS and JS files.
6. **Future‑proof** — clear extension points for new content types, payment gateways,
   languages (i18n), and platforms.

# AGENTS.md — KrishiShetra Collaboration Guide

> Guidelines for AI agents and developers working on this codebase.
> Read this file before making any changes.

---

## Project Overview

**KrishiShetra** is a full-stack AgriTech platform for Indian farmers, FPOs, buyers, and transporters.

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML + CSS + JavaScript (no framework) |
| Backend | Node.js / Express (`server/server.js`) |
| Database | MongoDB (Mongoose models in `server/models/`) |
| Auth | Custom JWT-based (`js/auth.js`, `server/middleware/`) |
| i18n | Custom system — `js/translations.js` + `js/i18n.js` |
| Icons | Lucide (CDN) |
| Fonts | Google Fonts — Inter + Playfair Display |

### Key directories

```
/                         → Farmer & shared HTML pages
/css/                     → Per-page and shared CSS (style.css, dashboard.css, …)
/js/                      → Frontend JS modules
/server/                  → Express backend (routes, controllers, models, middleware)
/admin/                   → Admin panel pages
/transporter/             → Transporter-role pages
```

---

## Core Rules

### Scope & safety
- **Understand the existing project first.** Read relevant files before editing.
- **Never remove existing features** or rewrite working code without an explicit request.
- **Work only on files directly related to the requested task.** Do not touch unrelated files.
- **Do not scan the entire repository** for small or targeted tasks.
- **Before editing, identify and list the exact files** that will be modified and why.
- **Keep changes minimal and focused.** One concern at a time.

### Preservation
- Preserve the existing frontend, backend, APIs, authentication (JWT + `js/auth.js`), MongoDB schema, and data flow.
- For **UI-only tasks**, never modify backend/API logic (`server/`, `js/api.js`).
- For **backend-only tasks**, never modify frontend HTML/CSS/JS unless directly required.
- Do not add unnecessary dependencies (`package.json` / CDN scripts).
- Keep animations lightweight — no heavy JS animation libraries or layout-thrashing transitions.

### Documentation
- Do not modify `walkthrough.md`, `README.md`, `CHANGELOG.md`, or `PROJECT_MAP.md` unless **explicitly requested**.
- After completing changes, provide a **concise summary** of modified files and what changed.

---

## Design & UI Rules

KrishiShetra has a premium, agricultural, farmer-friendly aesthetic. Protect it.

- **Color palette:** Deep evergreen (`#12372A`), sage green, warm parchment whites, terracotta accents. Defined as CSS custom properties in `css/style.css`.
- **Do not introduce:** neon colors, generic admin-dashboard grays, heavy glassmorphism, excessive gradients, or dark-mode-only palettes.
- **Typography:** Inter (body/UI) + Playfair Display (hero/display). Do not add new font families.
- **Icons:** Lucide only. Do not add Font Awesome, Heroicons, or other icon sets.
- Keep the UI feeling **premium, clean, calm, and professional** — not flashy or over-animated.

---

## Multilingual / i18n Rules

The platform supports **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.

- Always use the **existing i18n system**: `js/translations.js` (all string keys) + `js/i18n.js` (DOM updater + language switcher).
- Use `data-i18n="key.path"` attributes on HTML elements for translatable text.
- **Never hardcode** user-visible strings in English only.
- Do not create a parallel or replacement translation system.
- All **UI typography and layout must adapt naturally** to Hindi and Marathi:
  - Never use `overflow: hidden` on text containers that hold translated content.
  - Never use fixed heights for text elements.
  - Never use hardcoded `<br>` for line breaks that only work in English.
  - Use `min-height`, `clamp()`, `flex-wrap`, and natural wrapping instead.
  - Allow headlines to reflow across 2–4 lines depending on language and viewport.

---

## Area-Specific Guidance

### 1. Farmer pages

The primary farmer-facing pages are:

| File | Purpose |
|---|---|
| `dashboard.html` + `js/dashboard.js` | Farmer dashboard |
| `lots.html` + `js/farmer.js` | My Lots (crop lot management) |
| `buyers.html` + `js/buyer-inquiries.js` | Buyer Inquiries |
| `storage.html` + `js/storage.js` | Storage Options |
| `market.html` | Market Prices |
| `ai-forecast.html` | AI Price Forecast |
| `orders.html` + `js/orders.js` | Orders |
| `disputes.html` + `js/disputes.js` | Dispute Redressal |
| `mandi-compare.html` + `js/mandi-compare.js` | Mandi Price Comparison |

- All farmer pages use `data-require-role="farmer"` on `<body>` and are guarded by `js/page-guard.js`.
- Farmer pages load `js/auth.js`, `js/api.js`, `js/navbar.js`, and `js/i18n.js`.
- All styling inherits from `css/dashboard.css` (shared) + any page-specific CSS.

### 2. Shared header / navigation

- The farmer header (`<header class="dash-header">`) is **standardized across all farmer pages**.
- It uses a strict **5-zone layout** inside `.dash-header__inner`:
  1. `.dash-header__logo` — Brand logo + role badge
  2. `.dash-search` — Global search (`id="dash-search"`)
  3. `.dash-header__nav` (`id="dash-nav"`) — Nav links, **populated by `js/navbar.js`**
  4. `.dash-header__actions` — Notifications + profile dropdown
  5. Language switcher — **injected by `js/i18n.js`** into `.dash-header__actions`
- **Do not hardcode nav links** in farmer-page HTML. Use the empty `<nav id="dash-nav"></nav>` pattern; `navbar.js` renders them based on user role.
- **Do not add** back the "Kissan Toll Center / Kisan Helpline" button — it has been intentionally removed from the header. It is hidden globally via `#btn-help { display: none !important }` in `css/dashboard.css`.
- The header height is fixed at `70px` via `--nav-height` in `css/dashboard.css`. Do not change this without updating all farmer pages.
- The mobile toggle (`id="dash-nav-toggle"`) and `.dash-mobile-nav` (`id="dash-mobile-nav"`) must remain present on every farmer page.

### 3. My Lots (`lots.html` / `js/farmer.js`)

- Lot data is managed in `js/farmer.js` using the KrishiShetra API (`js/api.js`) with demo fallback via `js/demo-data.js`.
- Use the existing i18n translation keys for all lot labels and status strings. Do not invent new translation mechanisms.
- The grading engine lives in `js/grading-engine.js` — do not refactor it without explicit instruction.
- GPS/location features are documented in `GPS_FEATURE.md`.

### 4. Landing page (`index.html`)

- The landing page uses `css/style.css` (shared) — no `dashboard.css`.
- The navbar (`<nav class="navbar">`) is at `position: fixed; top: 0` — the old utility topbar (Kisan Helpline bar) has been removed.
- The language switcher is mounted by `js/i18n.js` into `#krishi-lang-switcher-landing`, which lives inside `.navbar__actions` — **after** the Login button.
- The navbar order is: `logo → nav links → Login → Language Switcher`.
- Do not re-add the `<aside class="landing-topbar">` — it was intentionally removed.
- The landing page hero uses fluid/responsive typography (`clamp()`, natural wrapping). Do not revert to fixed-height or fixed-width text containers.
- Sections: `#hero`, `#solution`, `#scroll-transition`, `#intelligence`, `#ai`, `#buyers`, `#transaction`, `#fpo`.

### 5. Multilingual / i18n (deeper reference)

- **`js/translations.js`** — Single source of truth for all language strings. Keys are namespaced (e.g. `navigation.dashboard`, `farmer.myLots`, `landing.navProduct`).
- **`js/i18n.js`** — Reads `localStorage` for `krishiLang` preference, applies `data-i18n` attributes, and mounts the language switcher via `mountSelector()`.
- The language switcher is injected into:
  - Farmer pages → `.dash-header__actions` container
  - Landing page → `#krishi-lang-switcher-landing` (inside `.navbar__actions`)
  - Auth pages → `.auth-card-box`
- To add a new translatable string: add the key to all three language objects in `translations.js`, then use `data-i18n="your.key"` in HTML.
- Never mount a second or alternative switcher. Check `!document.getElementById('krishi-lang-switcher')` before inserting.

### 6. UI/UX and typography

- Use CSS custom properties defined in `css/style.css` (`:root { --ks-evergreen, --ks-sage, … }`). Do not hardcode color hex values in new rules.
- Prefer `clamp()` for responsive font sizes and spacing.
- Avoid `position: absolute` for important text content.
- Do not use `overflow: hidden` on containers that may hold Hindi or Marathi text.
- All interactive states (hover, focus, active) must be smooth — use `transition: all 0.2s ease` or the existing `--duration-fast` variable.
- Page content offset: farmer pages use `padding-top` equal to the header height (`70px` + any page-specific buffer) set on `.dash-main`.

### 7. Collaboration & Git safety

- **Protect the work of other collaborators.** Before pushing, review what changed with `git diff` or `git status`.
- **Forbidden commands** — never run without explicit owner approval:
  - `git reset --hard`
  - `git clean -fd`
  - `git restore .`
  - `git checkout -- .`
  - Any force-push (`git push --force` / `-f`)
- Make **targeted, atomic commits** — one logical change per commit with a clear message.
- Do not commit `.env`, secrets, or generated files (`node_modules/`, `*.log`).
- Do not run automated tests, build scripts, or browser self-testing unless **explicitly requested**. The project owner uses manual testing.

---

## Before You Start — Quick Checklist

1. [ ] Read the task carefully. Identify the exact scope.
2. [ ] List the files you will modify (and why) before touching anything.
3. [ ] Read the current state of those files.
4. [ ] Make the minimum change required.
5. [ ] Verify that shared components (header, i18n, auth) are unaffected if not part of the task.
6. [ ] Summarize modified files and what changed in your response.

---

*Last updated: September 2026 — reflects post-header-standardization project state.*

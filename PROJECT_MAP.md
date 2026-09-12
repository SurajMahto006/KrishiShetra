# KrishiShetra — Project Map

This document maps the KrishiShetra codebase to enable fast, targeted navigation without full-repository scans.

---

## 1. Frontend Architecture

Static HTML/CSS/Vanilla JS architecture with role-based portals, modular CSS, shared runtime utilities, and multilingual support (`en`, `hi`, `mr`).

### Core & Authentication Pages (Root)
- `index.html` — Public landing page (features, live market preview, statistics, language selector).
- `login.html` — Authentication entry point (Login, Register tabs, role switching; uses `krishi_lang` automatically).
- `register.html` — User onboarding and registration flow.

### Farmer Experience Pages (Root)
- `dashboard.html` — Main Farmer Dashboard (welcome hero, action cards, active lots, live market prices, buyer inquiries, alerts).
- `lots.html` — Produce lot management (create, view, edit, pause, delete lots, review buyer offers).
- `market.html` — Mandi market price explorer, historical price trends, price alert setup, and detailed commodity popups.
- `mandi-compare.html` — Enterprise mandi comparison matrix, freight vs. net realization calculator, distance vs. profit analysis.
- `buyers.html` — Verified corporate & institutional buyers directory, procurement requirements, offer negotiation.
- `orders.html` — Farmer sales orders, escrow/payment status tracking, digital receipts, dispatch tracking.
- `storage.html` — WDRA/MSWC accredited warehouse discovery, Sell Now vs. Store & Hold AI calculator, e-NWR pledge financing.
- `ai-forecast.html` — 7/14/30-day AI commodity price forecast engine with confidence bands.
- `disputes.html` — Escrow protection dispute resolution center, evidence submission, mediation timeline.

### Specialized Role Portals
- **Buyer Portal**:
  - `buyer.html` — Buyer dashboard and produce discovery catalog.
  - `buyer-inquiries.html` — Inquiries and buyer negotiation workspace.
- **FPO Portal**:
  - `fpo-dashboard.html` — Farmer Producer Organization aggregation dashboard, bulk lots, member management.
- **Admin Portal** (`admin/`):
  - `admin/index.html`, `admin/dashboard.html` — Admin operations and system health.
  - `admin/farmers.html`, `admin/users.html` — User and role governance.
  - `admin/storage.html`, `admin/reports.html`, `admin/settings.html` — Platform auditing and configuration.
- **Transporter Portal** (`transporter/`):
  - `transporter/dashboard.html`, `transporter/available-loads.html` — Logistics load board and bidding.
  - `transporter/active-trips.html`, `transporter/fleet.html`, `transporter/drivers.html`, `transporter/earnings.html` — Fleet operations.

---

## 2. Frontend JavaScript Modules (`js/`)

### Core Runtime & State
- `js/api.js` — Central HTTP client with dynamic base URL resolution, JWT injection, and endpoint methods.
- `js/auth.js` — Client-side authentication state, session storage, and role checking.
- `js/page-guard.js` — Route protection and authentication redirect guards for private pages.
- `js/i18n.js` — Multilingual translation runtime (DOM attribute translation, dropdown mapping, profile selector mounting, single-key persistence).
- `js/translations.js` — Multilingual dictionaries for `en`, `hi`, `mr` (crops, navigation, farmer, market, storage, disputes, auth).
- `js/demo-data.js` — Baseline mock datasets used as offline fallbacks.

### Feature Controllers
- `js/dashboard.js` — Farmer dashboard controller (market grid, farmer listings, lot wizard, quick glance comparison).
- `js/mandi-compare.js` — Mandi price comparison engine (45+ mandis dataset, net realization logic, chart rendering).
- `js/farmer.js` — Produce lot creation wizard, grading simulation, farm profile settings.
- `js/storage.js` — Warehouse locator, Sell vs. Store decision engine, booking and pledge financing modals.
- `js/orders.js` — Sales orders controller and digital invoice generation.
- `js/disputes.js` — Order dispute workflow, escrow freeze, and mediation log.
- `js/buyer-app.js` — Buyer catalog, filter bar, bulk order placement, and direct inquiry management.
- `js/fpo-dashboard.js` — FPO aggregation, collective bargaining, and member lot pooling.
- `js/krishi-sahayak.js` — AI conversational assistant (voice STT/TTS, multilingual intent parsing, live market advisory).
- `js/mandi-map.js` — Leaflet-based interactive map of Indian APMC mandis.
- `js/grading-engine.js` — Computer-vision / algorithmic produce grading rules.
- `js/navbar.js` / `js/app-shell.js` — Shared responsive navigation, mobile drawer, and notification dropdown.

---

## 3. Stylesheets (`css/`)

- `css/style.css` — Global base styles, CSS reset, typography, landing page styling.
- `css/dashboard.css` — Farmer dashboard, action cards, crop cards, modals, and panel layouts.
- `css/mandi-compare.css` — Mandi comparison matrix, interactive sliders, KPI cards, and chart styles.
- `css/storage.css` — Warehouse cards, map containers, and Sell vs. Store comparison cards.
- `css/krishi-sahayak.css` — Floating AI assistant widget, voice waveforms, and chat bubble styles.
- `css/buyer.css` — Buyer marketplace, inquiry drawer, and procurement catalog styling.
- `css/fpo-dashboard.css` — FPO portal tables, aggregation charts, and bulk order cards.
- `css/app-shell.css` — Shared header, sidebar, profile dropdown, and notification badge styles.
- `css/mandi-map.css` — Leaflet map markers, APMC cluster popups, and route overlays.

---

## 4. Assets (`assets/`)

- `assets/images/` — Real crop imagery (`crop-rice.jpg`, `crop-wheat.jpg`, `crop-tomato.jpg`, etc.), farmer backgrounds, badges, and platform logos.

---

## 5. Backend Architecture (`server/`)

Node.js and Express REST API with MongoDB/Mongoose.

### Entry & Core
- `server/server.js` — Express application entry point, middleware registration, MongoDB connection, route mounting.
- `server/seed.js` — Database seeding script for development and demo environments.
- `server/config/` — Environment and database configurations (`db.js`, `env.js`).

### API Routes (`server/routes/`)
- `auth.routes.js` — `/api/auth` (Register, Login, Send OTP, Verify OTP, Me, Reset Password).
- `market.routes.js` — `/api/market` (Commodity prices, Agmarknet live feeds, historical prices).
- `lot.routes.js` — `/api/lots` (CRUD for farmer produce lots, grade assessment).
- `order.routes.js` — `/api/orders` (Order placement, escrow payment confirmation, order lifecycle).
- `buyer.routes.js` / `buyer.market.routes.js` — `/api/buyer` (Buyer profiles, purchase orders, catalog).
- `farmer.routes.js` — `/api/farmer` (Farm profile, bank/UPI details, crop history).
- `storage.routes.js` — `/api/storage` (Warehouse facilities, storage requests, e-NWR pledge financing).
- `dispute.routes.js` — `/api/disputes` (Order dispute filing, evidence attachment, resolution).
- `transport.routes.js` — `/api/transport` (Transit requests, logistics tracking, fleet matching).
- `inquiry.routes.js` — `/api/inquiries` (Direct farmer-buyer procurement negotiations).
- `offer.routes.js` — `/api/offers` (Buyer bids on listed farmer produce lots).
- `decision.routes.js` — `/api/decision` (Sell Now vs. Store & Hold recommendation endpoints).
- `notification.routes.js` — `/api/notifications` (Real-time price alerts, order status notifications).
- `activity.routes.js` — `/api/activity` (Audit logs and event tracking).
- `health.routes.js` — `/api/health` (Service health check).

### Controllers (`server/controllers/`)
Contains business logic for each route namespace (`auth.controller.js`, `lot.controller.js`, `order.controller.js`, `market.controller.js`, `storage.controller.js`, etc.).

### Data Models (`server/models/`)
- `User.js` — Base user credentials, role (`farmer`, `buyer`, `fpo`, `transporter`, `admin`), phone, verified flags.
- `FarmerProfile.js` — Landholding size, village/district/state, cultivated crops, irrigation type.
- `BuyerProfile.js` — Company name, GSTIN, procurement preferences, delivery locations.
- `TransportProfile.js` — Fleet specifications, truck types, operational routes.
- `ProduceLot.js` — Farmer produce listing (crop, quantity, grade, moisture, harvest date, location, expected price).
- `Order.js` — Completed and active sales orders, agreed rates, delivery terms, escrow milestones.
- `Payment.js` — Escrow payment tracking, payout releases, refunds.
- `StorageFacility.js` — Warehouse location, WDRA/MSWC accreditation, capacity, monthly tariff rates.
- `StorageRequest.js` — Warehouse space bookings by farmers/FPOs.
- `PledgeFinancingRequest.js` — e-NWR collateralized loan requests against stored produce.
- `Dispute.js` — Order dispute cases, escrow hold status, evidence URLs, mediation logs.
- `Inquiry.js` / `Offer.js` — Procurement quotes and farmer counter-offers.
- `TransportRequest.js` — Logistics bookings for crop transit.
- `Notification.js` — In-app alerts for prices, bids, and order updates.
- `ActivityLog.js` — System audit logs.
- `KYC.js` — Identity and land record verification documents.

### Middleware (`server/middleware/`)
- `auth.middleware.js` — JWT verification, role-based authorization guards (`protect`, `authorize`).

### Services (`server/services/`)
- `mandi.service.js` — Official Government of India `data.gov.in` Agmarknet API integration, commodity normalizer, and caching.
- `decision.service.js` — Algorithmic Sell Now vs. Store & Hold profit realization evaluator.
- `notification.service.js` — Alert generation and dispatching.
- `email.service.js` — Transporter/order email notifications.
- `activity.service.js` — Background activity logging.

---

## 6. Key Data Flow Relationships

1. **Authentication Flow**:
   `login.html` / `register.html` $\rightarrow$ `js/auth.js` $\rightarrow$ `server/routes/auth.routes.js` $\rightarrow$ `localStorage.setItem('krishi_token')`.
2. **Language Flow**:
   `krishi_lang` (`en`\|`hi`\|`mr`) $\rightarrow$ `js/i18n.js` $\rightarrow$ `js/translations.js` $\rightarrow$ DOM `[data-i18n]` + `KrishiI18n.getCropName()` + Krishi Sahayak sync.
3. **Mandi Data Flow**:
   `server/services/mandi.service.js` (queries `data.gov.in`) $\rightarrow$ `/api/market/mandi-prices` $\rightarrow$ `js/dashboard.js` & `js/mandi-compare.js`.
4. **Lot & Selling Flow**:
   `lots.html` / `dashboard.html` $\rightarrow$ `js/farmer.js` $\rightarrow$ `/api/lots` $\rightarrow$ `ProduceLot.js` $\rightarrow$ visible to Buyers on `buyer.html`.
5. **Storage Decision Flow**:
   `storage.html` $\rightarrow$ `js/storage.js` $\rightarrow$ `/api/decision` $\rightarrow$ `decision.service.js` (calculates freight, rent, and moisture loss against projected mandi trend).

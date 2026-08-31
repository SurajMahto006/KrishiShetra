# KrishiShetra — Unified Frontend Architecture & User Flows (Step 13)

This document provides the complete, authoritative specification for the KrishiShetra web application frontend architecture, role-based navigation, state handling, and end-to-end user journeys.

---

## 1. High-Level Architecture

```text
+-----------------------------------------------------------------------+
|                              USER BROWSER                             |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                        PAGE GUARD & ROUTE CHECK                       |
|                          (js/page-guard.js)                           |
|       - Verifies token presence (krishi_token)                        |
|       - Validates role permissions (data-require-role)               |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                    ROLE-AWARE NAVIGATION & SHELL                      |
|                           (js/navbar.js)                              |
|       - Dynamically generates links for Farmer, Buyer, Transporter, FPO|
|       - Injects active link highlights & breadcrumb context          |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                       PAGE CONTROLLER MODULE                          |
|         (farmer.js / buyer-app.js / buyer-inquiries.js / orders.js)   |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                       CENTRALIZED API CLIENT                          |
|                            (js/api.js)                                |
|       - Attaches Authorization: Bearer <JWT>                          |
|       - Global 401 Interceptor (auto-redirect to login.html)          |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                         BACKEND REST API                              |
|                     (http://localhost:5000/api)                       |
|           /auth  /farmer  /lots  /market  /inquiries  /orders         |
+-----------------------------------------------------------------------+
```

---

## 2. Universal Mental Model

```text
AUTHENTICATION ──► ROLE DASHBOARD ──► DISCOVER / MANAGE ──► INQUIRY & NEGOTIATION ──► ORDER & FULFILLMENT
```

---

## 3. Role-Based User Journeys

### A. Farmer Journey
```text
login.html (Farmer Credentials)
  │
  ▼
dashboard.html (Farmer Dashboard)
  │
  ├──► Check Profile (GET /api/farmer/profile) ──► Onboarding Modal if missing
  │
  ├──► Create Produce Lot (POST /api/lots) ──► Generated Lot ID (KS-YYYY-XXXXXX)
  │
  ├──► My Lots (lots.html) (GET /api/lots/my) ──► Filter: All / Active / Draft / Sold / Cancelled
  │
  ├──► Marketplace (market.html) (GET /api/market/lots) ──► View active listings
  │
  ├──► Received Buyer Inquiries (GET /api/inquiries/farmer)
  │      ├── Accept Deal (PUT /api/inquiries/:id -> "accepted")
  │      ├── Counter Offer (PUT /api/inquiries/:id/offer)
  │      └── Reject (PUT /api/inquiries/:id -> "rejected")
  │
  └──► Confirmed Orders (orders.html) (GET /api/orders/farmer)
         └── Advance Status: Pending ➔ Confirmed ➔ Processing ➔ Ready for Pickup ➔ Delivered
```

### B. Buyer Journey
```text
login.html (Buyer Credentials)
  │
  ▼
buyer.html (Buyer Dashboard & Command Center)
  │
  ├──► Browse Marketplace (buyer.html#/buyer/marketplace or market.html)
  │      └── Search, Filter by Crop, Grade, Price, Location (GET /api/market/lots)
  │
  ├──► View Lot Specifications (GET /api/market/lots/:lotId)
  │      └── [Send Purchase Inquiry] CTA
  │
  ├──► Submit Inquiry (POST /api/inquiries)
  │      └── Input Offered Price, Quantity Required, Message
  │
  ├──► My Inquiries (buyer-inquiries.html or buyer.html#/buyer/offers) (GET /api/inquiries/my)
  │      └── Negotiation Timeline (GET /api/inquiries/:id)
  │            └── Send Counter Offer (PUT /api/inquiries/:id/offer)
  │
  ├──► Deal Accepted (status === "accepted")
  │      └── [Confirm Deal & Create Order] CTA
  │
  ├──► Create Order (POST /api/orders)
  │      └── Fill Delivery Address & Select Payment Method
  │      └── Order Created: KS-ORD-YYYY-XXXXXX
  │
  └──► My Orders (orders.html or buyer.html#/buyer/orders) (GET /api/orders/my)
         └── Visual Progress Stepper & Cancellation (PUT /api/orders/:id/cancel)
```

### C. Transporter Journey
```text
login.html (Transporter Credentials)
  │
  ▼
transporter/dashboard.html (Transporter Dashboard)
  │
  ├──► Available Freight Loads (transporter/available-loads.html)
  │      └── Inspect Route, Tonnage & Payout
  │
  └──► Active Trips & Freight Jobs (transporter/active-trips.html)
         └── Delivery Status Updates (Pickup ➔ In Transit ➔ Delivered)
```

### D. FPO Journey
```text
login.html (FPO Credentials)
  │
  ▼
fpo-dashboard.html (FPO Collective Command Center)
  │
  └── Aggregate Farmer Member Produce & Multi-Farmer Lots
```

---

## 4. Role Navigation Matrix

| Role | Accessible Pages | Header Navigation Links |
| :--- | :--- | :--- |
| **Farmer** | `dashboard.html`, `lots.html`, `market.html`, `orders.html`, `ai-forecast.html` | Dashboard, My Lots, Marketplace, AI Forecast, Orders |
| **Buyer** | `buyer.html`, `buyer-inquiries.html`, `market.html`, `orders.html` | Dashboard, Marketplace, My Inquiries, Orders |
| **Transporter** | `transporter/dashboard.html`, `transporter/available-loads.html`, `transporter/active-trips.html` | Dashboard, Available Deliveries, Active Trips |
| **FPO** | `fpo-dashboard.html` | Dashboard |

---

## 5. Standardized UI Conventions & UX Guidelines

### A. Breadcrumbs
Every main feature page includes lightweight context navigation:
* `lots.html`: `Dashboard / My Lots`
* `market.html`: `Dashboard / Marketplace`
* `buyer-inquiries.html`: `Dashboard / My Inquiries & Negotiations`
* `orders.html`: `Dashboard / Orders & Fulfillment`
* `ai-forecast.html`: `Dashboard / AI Price Forecast`

### B. Standardized Action Terminology (CTAs)
* **Produce Listing**: `+ Create Produce Lot`, `Edit Lot`, `Cancel Listing`, `View Details`
* **Marketplace**: `View Details`, `Send Purchase Inquiry →`
* **Inquiries**: `Timeline & Offers`, `Submit Counter Offer`, `Accept Deal`, `Reject`
* **Orders**: `Confirm Deal & Create Order →`, `Cancel Order`, `Advance Fulfillment Status →`

### C. Visual Order Progress Stepper
Orders are presented with a 6-stage lifecycle stepper:
`Pending ──► Confirmed ──► Processing ──► Ready for Pickup ──► In Transit ──► Delivered`

---

## 6. API Client Mapping & Backend Source of Truth

All frontend communication strictly routes through `window.api` (`js/api.js`):

| Domain | Method | Backend Route | Purpose |
| :--- | :--- | :--- | :--- |
| **Auth** | `api.auth.getMe()` | `GET /api/auth/me` | Fetch verified user session |
| **Farmer** | `api.farmer.getProfile()` | `GET /api/farmer/profile` | Check farm onboarding status |
| **Farmer** | `api.farmer.createProfile(data)` | `POST /api/farmer/profile` | Initial onboarding |
| **Farmer** | `api.farmer.updateProfile(data)` | `PUT /api/farmer/profile` | Update farm details |
| **Lots** | `api.lots.create(data)` | `POST /api/lots` | Create produce listing |
| **Lots** | `api.lots.getMine(status)` | `GET /api/lots/my` | Farmer's listed lots |
| **Lots** | `api.lots.getById(id)` | `GET /api/lots/:lotId` | Detailed lot specs |
| **Lots** | `api.lots.update(id, data)` | `PUT /api/lots/:lotId` | Edit active lot |
| **Lots** | `api.lots.cancel(id)` | `PUT /api/lots/:lotId/cancel` | Cancel lot listing |
| **Market** | `api.market.getLots(params)` | `GET /api/market/lots` | Public produce discovery |
| **Market** | `api.market.getLot(id)` | `GET /api/market/lots/:lotId` | Single lot discovery |
| **Inquiries** | `api.inquiries.create(data)` | `POST /api/inquiries` | Buyer sends inquiry |
| **Inquiries** | `api.inquiries.getMine(params)` | `GET /api/inquiries/my` | Buyer's inquiries |
| **Inquiries** | `api.inquiries.getFarmer()` | `GET /api/inquiries/farmer` | Farmer's incoming inquiries |
| **Inquiries** | `api.inquiries.getById(id)` | `GET /api/inquiries/:id` | Full negotiation timeline |
| **Inquiries** | `api.inquiries.sendOffer(id, data)` | `PUT /api/inquiries/:id/offer` | Counter-offer submission |
| **Inquiries** | `api.inquiries.updateStatus(id, status)` | `PUT /api/inquiries/:id` | Farmer accepts/rejects |
| **Orders** | `api.orders.create(data)` | `POST /api/orders` | Create confirmed order |
| **Orders** | `api.orders.getMine(params)` | `GET /api/orders/my` | Buyer's orders |
| **Orders** | `api.orders.getFarmer(params)` | `GET /api/orders/farmer` | Farmer's orders |
| **Orders** | `api.orders.updateStatus(id, status)` | `PUT /api/orders/:id/status` | Update fulfillment state |
| **Orders** | `api.orders.cancel(id)` | `PUT /api/orders/:id/cancel` | Release stock & cancel order |

---

## 7. Step 14 — QA & Production Readiness

### A. QA Findings & Bug Fixes
* **Eliminated Mock Data**: `BUYER_DATA` and `BUYER_MARKET_LOTS` references were removed from all active buyer pathways. `buyer-data.js` script tag removed from `buyer.html`.
* **API Contract Alignment**: All REST calls verified against `server/server.js` route registrations and controller method signatures.
* **Role Guard Enforcement**: Tested role protection across `farmer`, `buyer`, `transporter`, and `fpo` pages. Cross-role URL navigation is intercepted by `js/page-guard.js` and redirected to the appropriate dashboard.
* **Fulfillment Pipeline**: Added standard 6-stage lifecycle stepper on `orders.html` for both farmer and buyer views.
* **Breadcrumb Navigation**: Integrated standardized context breadcrumbs on all secondary pages (`lots.html`, `market.html`, `buyer-inquiries.html`, `orders.html`, `ai-forecast.html`).
* **Duplicate Submission Prevention**: Mutation action buttons (Create Lot, Send Inquiry, Counter Offer, Confirm Order, Cancel) automatically disable and display loading state during in-flight network requests.
* **Public Marketplace**: Ensured guest users can search and inspect live farm produce without authentication, while guiding them to login when initiating protected transactions.

### B. Features Intentionally Marked "Coming Soon"
* **Transporter Telematics & Live GPS Tracking**: Marked as "Coming Soon" to avoid fabricated coordinates.
* **FPO Collective Escrow Ledger**: Non-backend capabilities marked as "Coming Soon".

---

## 8. Step 15 — Real Browser UX Audit & Journey Simplification

### A. Journey Simplification Roadmap
* **Farmer 6-Stage Roadmap Banner**: Displayed prominently on `dashboard.html` (`Farm Profile ➔ List Produce ➔ Receive Offers ➔ Negotiate ➔ Confirm Deal ➔ Fulfill Order`).
* **Buyer Command Priorities**: Dashboard highlights real attention metrics (`Active Negotiations`, `Accepted Deals`, `Fulfillment Orders`) over generic analytics.
* **Next-Action UX Standard**: Every major workflow provides immediate, explicit feedback and direct navigation links:
  - *Lot Created* ➔ `[View Lot]`, `[View My Lots]`, `[Go to Marketplace]`
  - *Inquiry Submitted* ➔ `[View My Inquiries]`, `[Continue Browsing]`
  - *Offer Countered* ➔ `[View Negotiation Timeline]`
  - *Deal Accepted* ➔ `[Confirm Deal & Create Order]`
  - *Order Placed* ➔ `[View Order Pipeline]`, `[Back to Dashboard]`

---

## 9. Step 16 — Final Integration Hardening & UX Consistency

### A. Canonical Navigation Matrix

| Role | Initial Landing | Feature Pages | Allowed API Calls |
| :--- | :--- | :--- | :--- |
| **Farmer** | `dashboard.html` | `lots.html`, `market.html`, `orders.html`, `ai-forecast.html` | `/api/farmer/profile`, `/api/lots`, `/api/market/lots`, `/api/inquiries/farmer`, `/api/orders/farmer` |
| **Buyer** | `buyer.html` | `buyer-inquiries.html`, `market.html`, `orders.html` | `/api/market/lots`, `/api/inquiries`, `/api/orders` |
| **Transporter** | `transporter/dashboard.html` | `transporter/available-loads.html`, `transporter/active-trips.html` | `/api/transport/*` |
| **FPO** | `fpo-dashboard.html` | Roadmap views | `/api/auth/me` |
| **Guest** | `index.html` / `market.html` | `market.html` (Read-only discovery) | `GET /api/market/lots`, `GET /api/market/lots/:id` |

### B. Core Invariants
1. **Single Source of Truth**: All state is retrieved directly from REST endpoints on `http://localhost:5000/api`. Zero mock business arrays exist in the active runtime.
2. **Deterministic Role Isolation**: Route guards prevent privilege escalation or unintended role leakage across distinct portals.
3. **Graceful Error Recovery**: All API rejections are translated into friendly toast notifications and alert boxes.




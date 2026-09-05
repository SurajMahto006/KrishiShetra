# KrishiShetra — Changelog

All notable changes to this project are documented in this file.

---

## [Unreleased] — feature/notifications-kyc-dispute-management

### Added
- `server/models/KYC.js` — Farmer KYC model (Aadhaar, PAN, Bank Account, Land Records)
- `server/models/Dispute.js` — Grievance/Dispute management model with timeline and ticket ID
- `server/models/Payment.js` — Full payment lifecycle model with Razorpay gateway support, farmer payout tracking, and receipt generation
- `CHANGELOG.md` — Project changelog documentation

---

## [v1.7.0] — 2026-09-05 — Payment Tracking & Agmark Grading

### Added
- **Agmark Quality Grading Engine** — Full grading system for produce lots with visual grade badges (A/B/C)
- **Orders & Payment Tracking** — Full payment status flow: 🟠 Pending → 🔵 Processing → 🟢 Received
- **Transaction Details View** — Order ID, buyer info, amount, delivery status, payment status
- **Payment Receipt Download** — Farmers can download PDF receipts
- **Report Payment Problem** — Dispute filing directly from orders page
- **Dashboard Payment Summary** — Payment count badges on Farmer Dashboard

### Modified
- `css/dashboard.css` — New payment status badge styles, transaction card layout
- `dashboard.html` — Payment summary cards section
- `js/dashboard.js` — Payment data loading and badge count
- `js/orders.js` — Full payment tracking tab logic
- `orders.html` — Payment tabs (Pending / Processing / Received) + Transaction Detail modal
- `lots.html` — Agmark grading UI integration
- `server/controllers/lot.controller.js` — Grading engine backend integration
- `server/utils/gradingEngine.js` — Backend Agmark grading calculation

---

## [v1.6.0] — 2026-09-04 — Distress Selling & Storage Linkages (PR #12)

### Added
- **Distress Selling Module** — Farmers can flag produce for urgent sale
- **Storage Facility Linkage** — Connect with nearby cold storage facilities
- **AI Sell-vs-Store Advisor** — AI-powered recommendation engine
- `storage.html` — Full storage management page
- `js/storage.js` — Storage booking and management logic
- `server/controllers/storage.controller.js` — Storage API controller
- `server/models/StorageFacility.js` — Storage facility data model
- `server/models/StorageRequest.js` — Storage booking request model
- `server/models/PledgeFinancingRequest.js` — Pledge financing data model
- `server/routes/storage.routes.js` — Storage API routes
- `server/services/decision.service.js` — AI decision service
- `admin/storage.html` — Admin storage management panel
- `css/storage.css` — Storage module styles

### Modified
- `fpo-dashboard.html` — Storage linkage integration
- `js/fpo-dashboard.js` — FPO storage features
- `js/navbar.js` — Storage nav link

---

## [v1.5.0] — 2026-09-02 — Transporter Portal (PR #11)

### Added
- **Full Transporter Portal** with 6 pages
- `transporter/dashboard.html` — Transporter command center
- `transporter/available-loads.html` — Live freight loads board
- `transporter/active-trips.html` — Active trip management
- `transporter/fleet.html` — Fleet vehicle management
- `transporter/drivers.html` — Driver management
- `transporter/earnings.html` — Earnings & payouts dashboard
- `transporter/onboarding.html` — KYC onboarding for transporters
- Live GPS map with Leaflet.js
- `server/controllers/transport.controller.js` — Full transport API
- `server/models/TransportProfile.js` — Transporter profile model
- `server/models/TransportRequest.js` — Freight request model

---

## [v1.4.0] — 2026-09-01 — GPS Maps Integration (PR #10)

### Added
- **Live Leaflet.js Map** on Farmer Dashboard with 45+ Indian APMC Mandis
- `js/mandi-map.js` — Mandi map with markers, popups, routing
- `GPS_FEATURE.md` — GPS integration documentation

---

## [v1.3.0] — 2026-09-01 — Mandi Price Comparison

### Added
- `mandi-compare.html` — Enterprise B2B price comparison dashboard
- `js/mandi-compare.js` — Multi-mandi price chart and analytics
- Real-time mandi price fetching and visualization

---

## [v1.2.0] — 2026-08-31 — Orders & Fulfillment (PR #9)

### Added
- `orders.html` — Full order management with 6-stage lifecycle stepper
- `js/orders.js` — Order tracking, status updates, cancellation
- `server/controllers/order.controller.js` — Full order lifecycle API
- `server/models/Order.js` — Order data model
- Visual progress stepper: `Pending → Confirmed → Processing → Ready → In Transit → Delivered`

---

## [v1.1.0] — 2026-08-31 — Buyer Inquiries & Negotiation (PR #8)

### Added
- `buyer-inquiries.html` — Buyer inquiry and negotiation dashboard
- `js/buyer-inquiries.js` — Inquiry timeline, counter-offers
- `server/controllers/inquiry.controller.js` — Full inquiry lifecycle API
- `server/models/Inquiry.js` — Inquiry and negotiation model
- `server/routes/inquiry.routes.js` — Inquiry API routes

---

## [v1.0.0] — 2026-08-30 — Foundation

### Added
- Authentication (Login / Register / JWT / Role Guard)
- Farmer Dashboard (`dashboard.html`)
- Farmer Profile Onboarding
- Produce Lots management (`lots.html`)
- Marketplace (`market.html`)
- AI Price Forecast (`ai-forecast.html`)
- Buyer Dashboard (`buyer.html`)
- FPO Dashboard (`fpo-dashboard.html`)
- Admin Panel (`admin/`)
- Role-based navigation (`js/navbar.js`, `js/page-guard.js`)
- Centralized API client (`js/api.js`)
- Notification system

---

## Project Structure

```
KrishiShetra/
├── index.html                  # Landing page
├── login.html                  # Auth
├── register.html               # Registration
├── dashboard.html              # Farmer Dashboard
├── lots.html                   # Produce Lots
├── market.html                 # Marketplace
├── orders.html                 # Orders & Payments
├── buyer.html                  # Buyer Dashboard
├── buyer-inquiries.html        # Buyer Negotiations
├── buyers.html                 # Farmer view of buyers
├── mandi-compare.html          # Mandi Price Comparison
├── ai-forecast.html            # AI Price Forecast
├── storage.html                # Storage Linkages
├── fpo-dashboard.html          # FPO Dashboard
├── transporter/                # Transporter Portal (6 pages)
├── admin/                      # Admin Panel
├── css/                        # Stylesheets
├── js/                         # Frontend JavaScript
└── server/                     # Node.js + Express Backend
    ├── models/                 # Mongoose Models (15 models)
    ├── controllers/            # API Controllers (13 controllers)
    ├── routes/                 # API Routes
    └── server.js               # Entry point
```

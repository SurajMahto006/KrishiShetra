# 🌾 KrishiShetra (कृषि क्षेत्र)

<div align="center">

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19+-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209.9-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Maps%20APMC-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

**"Know the Price. Choose the Market. Sell Better."**

*A modern, full-stack AgriTech digital ecosystem empowering Indian farmers, verified institutional buyers, Farmer Producer Organizations (FPOs), and agricultural transporters through transparent market intelligence, real-time APMC mandi price arbitrage, AI forecasting, and end-to-end direct trade negotiation.*

[Features](#-key-features) • [Architecture](#-system-architecture) • [Directory Structure](#-project-structure) • [API Reference](#-api-endpoints) • [Getting Started](#-getting-started) • [Environment Config](#-environment-variables)

</div>

---

## 📖 Overview

Indian agriculture has long suffered from asymmetric price information, opaque middlemen commissions, fragmented supply chains, and lack of direct market access for smallholder farmers.

**KrishiShetra** bridges this divide by providing an integrated, role-based platform that:
1. **Democratizes Market Intelligence**: Delivers live market prices across 45+ APMC mandis with automated freight-adjusted arbitrage calculations.
2. **Eliminates Exploitative Middlemen**: Enables farmers and FPOs to list produce lots directly to verified institutional buyers, food processors, and wholesalers.
3. **Facilitates Multi-Turn Counter Negotiation**: Provides a transparent deal-making room where prices and quantities are negotiated, counter-offered, and agreed upon with complete audit trails.
4. **Streamlines Logistics & Fulfillment**: Connects transporters to available freight loads and provides a 6-stage real-time order progression pipeline.

---

## ✨ Key Features

### 👨‍🌾 1. Farmer Portal (`dashboard.html`, `lots.html`)
- **Produce Lot Management**: Create, publish, edit, or cancel standardized produce lots (`KS-YYYY-XXXXXX`) with grade specifications, expected price, harvest date, and batch imagery.
- **Interactive 45+ APMC Mandi Map**: Leaflet.js-powered visual geospatial map pinpointing mandis across Indian agricultural belts with live modal rates.
- **Real-Time Inquiry Inbox**: Instant notifications when institutional buyers submit bids, with instant **Accept**, **Counter-Offer**, or **Reject** actions.
- **Farm Profile Onboarding**: Intuitive multi-step onboarding capturing farm geolocation, acreage, primary crops, and bank details.

### 🛒 2. Buyer Command Center (`buyer.html`, `buyer-inquiries.html`)
- **Produce Marketplace**: Real-time filtering by crop type, quality grade (A/B/C), organic certification, distance, and price range.
- **Purchase Inquiries & Counter-Offers**: Submit formal purchase inquiries with required quantity and proposed target price.
- **Multi-Turn Negotiation Timeline**: Live conversational offer history detailing timestamped counters, notes, and terms until consensus is reached.
- **Instant Deal Conversion**: One-click order creation upon deal acceptance with integrated delivery address and payment terms.

### ⚖️ 3. APMC Mandi Price Comparison & Arbitrage Engine (`mandi-compare.html`)
- **Cross-Mandi Price Analysis**: Compare modal prices for Wheat, Paddy, Mustard, Onion, Potato, Cotton, Soybean, and more across regional mandis.
- **Net Margin & Freight Calculator**: Calculates estimated transportation cost per quintal based on distance to determine the true net profit margin at different destination markets.
- **Best Selling Opportunity**: Automatically highlights the highest net realization mandi for any selected crop.

### 🤖 4. AI Price Forecasting (`ai-forecast.html`)
- **Predictive Price Trends**: Forecasts 15-day and 30-day crop price directions using seasonal patterns and arrival volume indicators.
- **Harvest & Sell Timing Signals**: Provides farmers with data-driven advice on whether to sell immediately or hold produce in storage.

### 🚚 5. Transporter Logistics Hub (`transporter/`)
- **Available Freight Loads**: Real-time feed of confirmed agricultural shipments requiring freight dispatch.
- **Route & Tonnage Optimization**: Inspect cargo weight, pickup farm coordinates, delivery warehouse, and trip payout.
- **Fleet & Driver Management**: Organize vehicle fleets, driver assignments, and trip milestones (Pickup ➔ In Transit ➔ Delivered).
- **Earnings Analytics**: Track completed deliveries, pending freight settlements, and historical revenue.

### 👥 6. FPO Collective Hub (`fpo-dashboard.html`)
- **Produce Aggregation**: Pool smallholder harvests into commercial-grade bulk lots to negotiate volume premiums.
- **Member Farmer Directory**: Manage member farmers, acreage, and expected seasonal yields.

### 🛡️ 7. Admin Governance & Operations (`admin/`)
- **System Overview**: Platform-wide metrics on active lots, gross merchandise value (GMV), active shipments, and user growth.
- **User Verification**: KYC validation and verification badges for buyers and transport providers.
- **Audit Reports & System Health**: Real-time server diagnostics, database connection status, and error logs.

---

## 🔄 Fulfillment & Negotiation Lifecycle

### Multi-Turn Negotiation Flow
```text
Buyer Discovers Lot ──► Submits Purchase Inquiry ──► Farmer Reviews Offer
                                                            │
    ┌───────────────────────────◄───────────────────────────┴───────────────────────────┐
    │                                                                                   │
[Accepts Deal]                                                                 [Counter-Offers]
    │                                                                                   │
    ▼                                                                                   ▼
Deal Status: "Accepted"                                                    Buyer Receives Counter
    │                                                                                   │
    ├──► [Confirm Deal & Create Order]                                    Accept / Counter Again / Reject
    ▼
Order Generated: KS-ORD-YYYY-XXXXXX
```

### 6-Stage Order Lifecycle Stepper
```text
[ Pending ] ──► [ Confirmed ] ──► [ Processing ] ──► [ Ready for Pickup ] ──► [ In Transit ] ──► [ Delivered ]
```

---

## 🏗️ System Architecture

```text
+-----------------------------------------------------------------------+
|                              USER BROWSER                             |
|          (Farmer, Institutional Buyer, Transporter, FPO, Admin)       |
+-----------------------------------------------------------------------+
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                        PAGE GUARD & ROUTE CHECK                       |
|                          (js/page-guard.js)                           |
|       - Validates authentication token (krishi_token)                 |
|       - Enforces role-based permissions (data-require-role)           |
+-----------------------------------------------------------------------+
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                    ROLE-AWARE NAVIGATION & SHELL                      |
|                           (js/navbar.js)                              |
|       - Injects dynamic navigation links based on user session role   |
|       - Manages responsive mobile menus and notifications             |
+-----------------------------------------------------------------------+
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                       PAGE CONTROLLER MODULES                         |
|   (dashboard.js, farmer.js, buyer-app.js, mandi-compare.js, etc.)     |
+-----------------------------------------------------------------------+
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                       CENTRALIZED API CLIENT                          |
|                            (js/api.js)                                |
|       - Injects Authorization: Bearer <JWT> header                    |
|       - Global 401 Interceptor with auto-redirect to login            |
|       - Structured error handling & uniform toast feedback            |
+-----------------------------------------------------------------------+
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                         EXPRESS REST API                              |
|                     (http://localhost:5000/api)                       |
|       - JWT Authentication & Role-Based Middleware                    |
|       - Controller layer with input validation                        |
+-----------------------------------------------------------------------+
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                       MONGODB DATABASE LAYER                          |
|           (Users, FarmerProfiles, Lots, Inquiries, Orders, Trips)     |
+-----------------------------------------------------------------------+
```

---

## 📁 Project Structure

```bash
KrishiShetra/
├── admin/                         # Admin Management Suite
│   ├── dashboard.html             # Platform governance dashboard
│   ├── farmers.html               # Farmer directory and status
│   ├── reports.html               # Platform analytical reports
│   ├── settings.html              # System parameters & configurations
│   ├── styles.css                 # Admin-specific stylesheets
│   └── users.html                 # User account management
├── assets/                        # Static media assets & imagery
│   └── images/                    # Hero banners, icons, badges
├── css/                           # Frontend Design System & Modular Styles
│   ├── mandi-compare.css          # Mandi price comparison styling
│   ├── style.css                  # Main landing page styles
│   └── ...                        # Component styles
├── js/                            # Client-Side Application Logic
│   ├── api.js                     # Unified REST API client (window.api)
│   ├── app-shell.js               # Common application shell utilities
│   ├── auth.js                    # Client authentication state manager
│   ├── buyer-app.js               # Buyer portal controller
│   ├── buyer-inquiries.js         # Inquiry & negotiation manager
│   ├── dashboard.js               # Farmer dashboard controller
│   ├── farmer.js                  # Farmer lot management
│   ├── fpo-dashboard.js           # FPO operations controller
│   ├── main.js                    # Landing page interactive logic
│   ├── mandi-compare.js           # Arbitrage & comparison logic
│   ├── mandi-map.js               # Leaflet APMC mandi geospatial engine
│   ├── navbar.js                  # Dynamic role navigation injector
│   ├── orders.js                  # 6-stage order tracking controller
│   └── page-guard.js              # Client-side route authentication guard
├── server/                        # Backend REST API Server
│   ├── config/
│   │   └── db.js                  # MongoDB Mongoose connection
│   ├── controllers/               # Business logic controllers
│   │   ├── auth.controller.js
│   │   ├── buyer.controller.js
│   │   ├── farmer.controller.js
│   │   ├── inquiry.controller.js
│   │   ├── lot.controller.js
│   │   ├── market.controller.js
│   │   ├── order.controller.js
│   │   └── transport.controller.js
│   ├── middleware/                # Auth verification & role guards
│   ├── models/                    # Mongoose database schemas
│   │   ├── Activity.js
│   │   ├── FarmerProfile.js
│   │   ├── Inquiry.js
│   │   ├── Lot.js
│   │   ├── Notification.js
│   │   ├── Order.js
│   │   ├── TransportTrip.js
│   │   └── User.js
│   ├── routes/                    # Express route registrations
│   │   ├── auth.routes.js
│   │   ├── buyer.routes.js
│   │   ├── farmer.routes.js
│   │   ├── inquiry.routes.js
│   │   ├── lot.routes.js
│   │   ├── market.routes.js
│   │   ├── order.routes.js
│   │   └── transport.routes.js
│   ├── services/                  # External integrations (Brevo Email, etc.)
│   └── server.js                  # Server entry point, CORS & middleware
├── transporter/                   # Transporter Logistics Portal
│   ├── active-trips.html          # In-transit delivery management
│   ├── available-loads.html       # Freight job discovery
│   ├── dashboard.html             # Transporter command center
│   ├── drivers.html               # Driver directory
│   ├── earnings.html              # Payout and revenue tracking
│   ├── fleet.html                 # Vehicle fleet registry
│   └── onboarding.html            # Transporter verification setup
├── .env.example                   # Template for environment variables
├── ai-forecast.html               # AI Crop Price Forecasting interface
├── buyer-inquiries.html           # Buyer negotiation room
├── buyer.html                     # Buyer marketplace & orders hub
├── dashboard.html                 # Farmer main operational dashboard
├── fpo-dashboard.html             # Farmer Producer Organization portal
├── FRONTEND_FLOW.md               # Frontend user flows & design spec
├── index.html                     # KrishiShetra public landing page
├── login.html                     # Unified multi-role login portal
├── lots.html                      # Farmer produce inventory management
├── mandi-compare.html             # APMC mandi price comparison & arbitrage
├── market.html                    # Public / authenticated produce marketplace
├── orders.html                    # Orders & fulfillment tracking stepper
├── package.json                   # Project dependencies and npm scripts
└── register.html                  # Multi-role registration portal
```

---

## 🔌 API Endpoints

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <JWT_TOKEN>`.

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user (`farmer`, `buyer`, `transporter`, `fpo`) | Public |
| `POST` | `/api/auth/login` | Authenticate user and obtain JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & role | Authenticated |

### Farmer Profile & Produce Lots (`/api/farmer`, `/api/lots`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/farmer/profile` | Get logged-in farmer's profile | Farmer |
| `POST` | `/api/farmer/profile` | Create/complete initial farmer profile | Farmer |
| `PUT` | `/api/farmer/profile` | Update farm details and geolocation | Farmer |
| `POST` | `/api/lots` | Create and publish a new produce lot | Farmer |
| `GET` | `/api/lots/my` | Retrieve all lots created by the farmer | Farmer |
| `GET` | `/api/lots/:id` | View full details of a specific lot | Authenticated |
| `PUT` | `/api/lots/:id` | Update lot price, quantity, or details | Farmer |
| `PUT` | `/api/lots/:id/cancel` | Cancel an active produce listing | Farmer |

### Produce Marketplace (`/api/market`, `/api/buyer/market`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/market/lots` | Browse active produce lots with filters | Public / Buyer |
| `GET` | `/api/market/lots/:id` | Inspect specific produce lot specifications | Public / Buyer |
| `GET` | `/api/buyer/saved-lots` | Retrieve buyer's bookmarked produce lots | Buyer |

### Inquiries & Deal Negotiation (`/api/inquiries`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inquiries` | Submit initial purchase offer on a lot | Buyer |
| `GET` | `/api/inquiries/my` | List inquiries submitted by the buyer | Buyer |
| `GET` | `/api/inquiries/farmer` | List incoming inquiries received by the farmer | Farmer |
| `GET` | `/api/inquiries/:id` | Get full multi-turn negotiation timeline | Involved Parties |
| `PUT` | `/api/inquiries/:id/offer`| Submit counter-offer (price/qty/note) | Involved Parties |
| `PUT` | `/api/inquiries/:id` | Accept or reject an inquiry/offer | Farmer / Buyer |

### Orders & Fulfillment (`/api/orders`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Create confirmed order from an accepted inquiry | Buyer |
| `GET` | `/api/orders/my` | View buyer's order history and progress | Buyer |
| `GET` | `/api/orders/farmer` | View incoming orders for the farmer | Farmer |
| `PUT` | `/api/orders/:id/status`| Progress order status through the 6 stages | Involved Parties |
| `PUT` | `/api/orders/:id/cancel`| Cancel order and release reserved stock | Involved Parties |

### Logistics & Freight (`/api/transport`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/transport/loads` | Discover available loads for dispatch | Transporter |
| `POST` | `/api/transport/trips` | Accept freight load and generate trip | Transporter |
| `PUT` | `/api/transport/trips/:id`| Update delivery milestone status | Transporter |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas URI)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/SurajMahto006/KrishiShetra.git
cd KrishiShetra
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the `.env.example` file to create your `.env`:
```bash
cp .env.example .env
```
Edit `.env` and fill in your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/krishishetra
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Transactional Email (Optional for local testing, powered by Brevo)
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=notifications@krishishetra.com
EMAIL_FROM_NAME=KrishiShetra

# Allowed Frontend Origins (Comma-separated)
FRONTEND_URL=http://localhost:5000,http://127.0.0.1:5500
```

### 4. Run the Application

#### Development Mode (with hot-reload via nodemon):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

### 5. Access the Platform
Once running, open your browser and navigate to:
- **Landing Page**: [http://localhost:5000](http://localhost:5000)
- **Farmer Dashboard**: [http://localhost:5000/dashboard.html](http://localhost:5000/dashboard.html)
- **Mandi Price Comparison**: [http://localhost:5000/mandi-compare.html](http://localhost:5000/mandi-compare.html)
- **Buyer Command Center**: [http://localhost:5000/buyer.html](http://localhost:5000/buyer.html)
- **Marketplace**: [http://localhost:5000/market.html](http://localhost:5000/market.html)
- **Transporter Portal**: [http://localhost:5000/transporter/dashboard.html](http://localhost:5000/transporter/dashboard.html)
- **FPO Collective**: [http://localhost:5000/fpo-dashboard.html](http://localhost:5000/fpo-dashboard.html)
- **Admin Suite**: [http://localhost:5000/admin/index.html](http://localhost:5000/admin/index.html)

---

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | No | `5000` | Port on which the Express server listens |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string (Local or Atlas URI) |
| `JWT_SECRET` | **Yes** | — | Secret key used for signing JSON Web Tokens |
| `JWT_EXPIRES_IN` | No | `1d` | Token expiry duration (e.g., `1d`, `7d`) |
| `BREVO_API_KEY` | No | — | Brevo API key for transactional email delivery |
| `EMAIL_FROM` | No | — | Verified sender email address for outgoing emails |
| `EMAIL_FROM_NAME`| No | `KrishiShetra` | Sender display name |
| `FRONTEND_URL` | No | — | Comma-separated CORS allowed origin URLs |

---

## 🗺️ Roadmap

- [x] Multi-Role User Authentication with JWT & Role Guards
- [x] Farmer Produce Lot creation and listing management
- [x] Interactive Leaflet Map for 45+ APMC Indian Mandis
- [x] Enterprise Mandi Price Arbitrage & Net Margin Calculator
- [x] Multi-Turn Inquiry & Negotiation Protocol
- [x] 6-Stage Order Lifecycle Stepper & Tracking
- [x] Transporter Logistics Portal & Trip Dispatch
- [x] FPO Collective produce aggregation interface
- [ ] **Live Telematics & GPS Tracking**: Real-time geolocation tracking for active transport trucks
- [ ] **Vernacular Voice Assistant**: Voice-activated crop listing and mandi queries in Hindi, Punjabi, Marathi, etc.
- [ ] **Automated Escrow Payments**: Integration with UPI / payment gateways for milestone-based escrow release

---

## 🤝 Contributing

Contributions make the open-source community an inspiring place to learn, inspire, and create. Any contributions you make to KrishiShetra are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more details.

---

<div align="center">
  <sub>Built with ❤️ for Indian Agriculture and the Farming Community.</sub>
</div>

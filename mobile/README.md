# KrishiShetra Mobile App

> **"Apni Fasal, Apna Bazaar, Apna Behtar Daam."**

A production-quality Flutter mobile application for KrishiShetra — the farmer-first agricultural marketplace intelligence platform.

---

## What This App Does

KrishiShetra helps farmers:

- Discover live crop prices across nearby markets
- Compare markets based on price, distance, and demand
- Get AI-guided recommendations on where and when to sell
- Find and compare verified buyer offers
- Create crop lots and manage their sale journey
- Track orders, logistics, and payments
- Review transaction history

### The Core Farmer Journey

```
Know your price → Compare markets → AI recommendation
→ Create lot → Receive offers → Compare offers → Accept → Sale complete
```

---

## Technology Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Flutter 3.35+ / Dart 3.9+           |
| State mgmt  | Riverpod 2.x (flutter_riverpod)     |
| Navigation  | go_router 14.x                      |
| Charts      | fl_chart                            |
| Typography  | Google Fonts (Inter) + PlayfairDisplay (local) |
| Animations  | Flutter AnimationController + Lottie|
| Storage     | shared_preferences (login state)    |
| UI          | Material 3 + Custom KrishiShetra design system |

---

## Requirements

- Flutter **3.35.0** or later
- Dart **3.9.0** or later
- Android SDK (for Android builds)
- Xcode (for iOS builds — macOS only)

Check your version:
```bash
flutter --version
```

---

## Getting Started

### 1. Install dependencies

```bash
cd mobile
flutter pub get
```

### 2. Run on Android

```bash
flutter run
```

Or target a specific device:
```bash
flutter devices
flutter run -d <device-id>
```

### 3. Run on iOS (macOS only)

```bash
flutter run -d ios
```

### 4. Analyze code

```bash
flutter analyze
```

### 5. Run tests

```bash
flutter test
```

### 6. Build release APK

```bash
flutter build apk --release
```

---

## Project Structure

```
mobile/
├── lib/
│   ├── main.dart                    ← Entry point
│   ├── app/
│   │   ├── app.dart                 ← MaterialApp.router
│   │   ├── router.dart              ← GoRouter navigation
│   │   ├── providers.dart           ← Riverpod providers
│   │   └── theme/
│   │       ├── app_colors.dart      ← Color tokens
│   │       ├── app_text_styles.dart ← Typography
│   │       └── app_theme.dart       ← ThemeData + tokens
│   │
│   ├── core/
│   │   ├── constants/app_constants.dart
│   │   └── utils/formatters.dart
│   │
│   ├── data/
│   │   ├── models/                  ← Dart data models
│   │   │   ├── user_model.dart
│   │   │   ├── crop_model.dart
│   │   │   ├── market_model.dart
│   │   │   ├── lot_model.dart
│   │   │   ├── buyer_model.dart
│   │   │   ├── offer_model.dart
│   │   │   ├── order_model.dart
│   │   │   ├── notification_model.dart
│   │   │   └── transaction_model.dart
│   │   │
│   │   ├── mock/                    ← Centralized mock data
│   │   │   ├── mock_users.dart
│   │   │   ├── mock_crops.dart
│   │   │   ├── mock_markets.dart
│   │   │   ├── mock_lots.dart
│   │   │   ├── mock_buyers.dart
│   │   │   ├── mock_offers.dart
│   │   │   ├── mock_orders.dart
│   │   │   ├── mock_notifications.dart
│   │   │   └── mock_transactions.dart
│   │   │
│   │   └── repositories/            ← Repository layer
│   │       ├── market_repository.dart
│   │       ├── lot_repository.dart
│   │       ├── buyer_repository.dart
│   │       ├── offer_repository.dart
│   │       ├── order_repository.dart
│   │       ├── notification_repository.dart
│   │       └── transaction_repository.dart
│   │
│   ├── features/                    ← Screen modules
│   │   ├── auth/         (Splash, Onboarding, Login)
│   │   ├── dashboard/    (Farmer Dashboard)
│   │   ├── market/       (Market, Comparison, AI Recommendation)
│   │   ├── lots/         (Create Lot, My Lots, Lot Detail)
│   │   ├── buyers/       (Find Buyers)
│   │   ├── offers/       (My Offers, Offer Comparison)
│   │   ├── orders/       (Order Details)
│   │   ├── logistics/    (Logistics Screen)
│   │   ├── payments/     (Payment Details)
│   │   ├── transactions/ (Transaction History)
│   │   ├── notifications/(Notifications)
│   │   └── profile/      (Profile)
│   │
│   └── shared/
│       ├── widgets/
│       │   ├── main_shell.dart               ← Bottom nav shell
│       │   └── agricultural_background.dart  ← Reusable bg widget
│       └── components/
│           ├── ks_button.dart
│           ├── status_badge.dart
│           ├── lot_card.dart
│           ├── market_card.dart
│           ├── buyer_card.dart
│           ├── offer_card.dart
│           ├── price_trend_chart.dart
│           ├── progress_timeline.dart
│           ├── loading_skeleton.dart
│           └── empty_state.dart
│
├── assets/
│   ├── fonts/           ← PlayfairDisplay font files (add manually)
│   ├── images/          ← Crop + UI images
│   └── illustrations/   ← SVG illustrations
│
├── test/
│   └── widget_test.dart
│
├── analysis_options.yaml
├── pubspec.yaml
└── README.md
```

---

## Mock Data

All mock data lives in `lib/data/mock/`. The app works entirely offline using this data.

**Demo farmer:** Rajesh Patil, Nashik, Maharashtra  
**Demo OTP:** Any 6-digit number (login accepts any input)  
**Quick login:** Use the "Demo Login" button on the login screen

---

## Connecting to Real APIs

The architecture uses a repository pattern. To connect real APIs:

1. Open any repository in `lib/data/repositories/`
2. Replace the mock data calls with HTTP API calls
3. The UI and Riverpod providers do not need to change

Example swap:
```dart
// Before (mock)
List<MarketModel> getMarkets() => MockMarkets.all;

// After (real API)
Future<List<MarketModel>> getMarkets() async {
  final response = await http.get(Uri.parse('$baseUrl/api/markets'));
  return (json.decode(response.body) as List)
      .map((m) => MarketModel.fromJson(m))
      .toList();
}
```

---

## Theme System

The design system mirrors the KrishiShetra web application.

| Token         | Value          | Usage                     |
|---------------|----------------|---------------------------|
| `evergreen`   | `#12372A`      | Primary brand, AppBar     |
| `sage`        | `#5B9A72`      | Secondary, active states  |
| `mint`        | `#8FCB9B`      | Highlights, icons         |
| `ivoryBg`     | `#F5F4ED`      | Screen backgrounds        |
| `amber`       | `#D6A84F`      | Warnings, offers          |
| `greenAccent` | `#4A9D6E`      | Dark theme accent         |
| `gold`        | `#D4A843`      | Splash, premium elements  |

All colours defined in `lib/app/theme/app_colors.dart`.  
Full ThemeData in `lib/app/theme/app_theme.dart`.

---

## Screens Implemented

| # | Screen              | Route                    |
|---|---------------------|--------------------------|
| 1 | Splash              | `/splash`                |
| 2 | Onboarding (3)      | `/onboarding`            |
| 3 | Login + OTP         | `/login`                 |
| 4 | Farmer Dashboard    | `/home`                  |
| 5 | Today's Market      | `/market`                |
| 6 | Market Comparison   | `/market-comparison`     |
| 7 | AI Recommendation   | `/ai-recommendation`     |
| 8 | Create Lot (7 step) | `/create-lot`            |
| 9 | My Lots             | `/sell`                  |
|10 | Lot Details         | `/lot/:id`               |
|11 | Find Buyers         | `/buyers`                |
|12 | My Offers           | `/offers`                |
|13 | Offer Comparison    | `/offer-comparison/:id`  |
|14 | Order Details       | `/order/:id`             |
|15 | Logistics           | `/logistics/:id`         |
|16 | Payments            | `/payments/:id`          |
|17 | Transaction History | `/transactions`          |
|18 | Notifications       | `/notifications`         |
|19 | Profile             | `/profile`               |

---

## Notes

- This is a **frontend-only** application. No backend, no real authentication, no real AI.
- All data is mock/demonstration data.
- The app is designed for Android (primary) with iOS compatibility.
- Language switching UI is present; full i18n can be wired up via the `intl` package already included.

---

*KrishiShetra — Apni Fasal, Apna Bazaar, Apna Behtar Daam.*

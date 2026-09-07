import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../features/auth/screens/splash_screen.dart';
import '../features/auth/screens/onboarding_screen.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/dashboard/screens/dashboard_screen.dart';
import '../features/market/screens/market_screen.dart';
import '../features/market/screens/market_comparison_screen.dart';
import '../features/market/screens/ai_recommendation_screen.dart';
import '../features/lots/screens/create_lot_screen.dart';
import '../features/lots/screens/my_lots_screen.dart';
import '../features/lots/screens/lot_detail_screen.dart';
import '../features/buyers/screens/buyers_screen.dart';
import '../features/offers/screens/offers_screen.dart';
import '../features/offers/screens/offer_comparison_screen.dart';
import '../features/orders/screens/order_detail_screen.dart';
import '../features/logistics/screens/logistics_screen.dart';
import '../features/payments/screens/payments_screen.dart';
import '../features/transactions/screens/transactions_screen.dart';
import '../features/notifications/screens/notifications_screen.dart';
import '../features/profile/screens/profile_screen.dart';
import '../shared/widgets/main_shell.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    debugLogDiagnostics: false,
    routes: [
      // Auth flow
      GoRoute(path: '/splash',      builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/onboarding',  builder: (_, __) => const OnboardingScreen()),
      GoRoute(path: '/login',       builder: (_, __) => const LoginScreen()),

      // Main shell with bottom nav
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(path: '/home',    builder: (_, __) => const DashboardScreen()),
          GoRoute(path: '/market',  builder: (_, __) => const MarketScreen()),
          GoRoute(path: '/sell',    builder: (_, __) => const MyLotsScreen()),
          GoRoute(path: '/offers',  builder: (_, __) => const OffersScreen()),
          GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
        ],
      ),

      // Detail screens (outside shell — no bottom nav)
      GoRoute(path: '/market-comparison',  builder: (_, __) => const MarketComparisonScreen()),
      GoRoute(path: '/ai-recommendation',  builder: (_, __) => const AiRecommendationScreen()),
      GoRoute(path: '/create-lot',         builder: (_, __) => const CreateLotScreen()),
      GoRoute(
        path: '/lot/:id',
        builder: (_, state) => LotDetailScreen(lotId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/buyers',             builder: (_, __) => const BuyersScreen()),
      GoRoute(
        path: '/offer-comparison/:lotId',
        builder: (_, state) => OfferComparisonScreen(lotId: state.pathParameters['lotId']!),
      ),
      GoRoute(
        path: '/order/:id',
        builder: (_, state) => OrderDetailScreen(orderId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/logistics/:orderId',
        builder: (_, state) => LogisticsScreen(orderId: state.pathParameters['orderId']!),
      ),
      GoRoute(
        path: '/payments/:orderId',
        builder: (_, state) => PaymentsScreen(orderId: state.pathParameters['orderId']!),
      ),
      GoRoute(path: '/transactions',  builder: (_, __) => const TransactionsScreen()),
      GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
    ],
  );
});

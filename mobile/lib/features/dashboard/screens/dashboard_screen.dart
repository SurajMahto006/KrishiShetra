import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import '../../../app/providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/mock/mock_users.dart';
import '../../../shared/widgets/agricultural_background.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final marketRepo = ref.read(marketRepositoryProvider);
    final wheatPrices = marketRepo.getPricesForCrop('wheat');
    final nashikPrice = wheatPrices['nashik'];
    final unread = ref.watch(notifUnreadProvider);
    final user = MockUsers.currentFarmer;

    return Scaffold(
      backgroundColor: AppColors.ivoryBg,
      body: AgriculturalBackground(
        child: SafeArea(
          child: CustomScrollView(
            slivers: [
              // ── App Bar ──────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                  child: Row(
                    children: [
                      // KrishiShetra logo
                      SvgPicture.asset(
                        'assets/icons/krishishetra_logo.svg',
                        width: 42,
                        height: 42,
                        fit: BoxFit.contain,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Namaste, ${user.name.split(' ').first} 👋',
                              style: const TextStyle(
                                fontFamily: 'PlayfairDisplay',
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                                color: AppColors.evergreen,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Row(
                              children: [
                                const Icon(Icons.location_on_outlined, size: 13, color: AppColors.textMutedDash),
                                const SizedBox(width: 3),
                                Text(user.location,
                                    style: const TextStyle(fontSize: 12, color: AppColors.textMutedDash)),
                              ],
                            ),
                          ],
                        ),
                      ),
                      // Notification bell
                      GestureDetector(
                        onTap: () => context.push('/notifications'),
                        child: Stack(
                          clipBehavior: Clip.none,
                          children: [
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: AppColors.cardWhite,
                                shape: BoxShape.circle,
                                border: Border.all(color: AppColors.borderDash),
                                boxShadow: [AppTheme.shadowSm],
                              ),
                              child: const Icon(Icons.notifications_outlined, size: 22, color: AppColors.evergreen),
                            ),
                            if (unread > 0)
                              Positioned(
                                right: 0,
                                top: 0,
                                child: Container(
                                  width: 16,
                                  height: 16,
                                  decoration: const BoxDecoration(color: AppColors.error, shape: BoxShape.circle),
                                  child: Center(
                                    child: Text('$unread',
                                        style: const TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.w700)),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 20)),

              // ── Today's Market Card ─────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: _TodayMarketCard(
                    price: nashikPrice?.price ?? 2490,
                    change: nashikPrice?.changePercent ?? 4.2,
                    onTap: () => context.push('/market'),
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 20)),

              // ── Quick Actions ────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Quick Actions',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          _QuickAction(emoji: '📦', label: 'Create Lot', onTap: () => context.push('/create-lot')),
                          const SizedBox(width: 10),
                          _QuickAction(emoji: '📊', label: 'Market Prices', onTap: () => context.go('/market')),
                          const SizedBox(width: 10),
                          _QuickAction(emoji: '🌾', label: 'My Lots', onTap: () => context.go('/sell')),
                          const SizedBox(width: 10),
                          _QuickAction(emoji: '🤝', label: 'Offers', onTap: () => context.go('/offers')),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 20)),

              // ── AI Recommendation Card ──────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: _AiRecommendationCard(onTap: () => context.push('/ai-recommendation')),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 20)),

              // ── Buyer Offers ─────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Expanded(
                            child: Text('Buyer Offers',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                          ),
                          GestureDetector(
                            onTap: () => context.go('/offers'),
                            child: const Text('See all →',
                                style: TextStyle(fontSize: 13, color: AppColors.sage, fontWeight: FontWeight.w600)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      _BuyerOfferCard(onTap: () => context.push('/offer-comparison/lot_001')),
                    ],
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 20)),

              // ── Market Snapshot ──────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Expanded(
                            child: Text('Market Snapshot',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                          ),
                          GestureDetector(
                            onTap: () => context.go('/market'),
                            child: const Text('View all →',
                                style: TextStyle(fontSize: 13, color: AppColors.sage, fontWeight: FontWeight.w600)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 110,
                        child: ListView(
                          scrollDirection: Axis.horizontal,
                          children: [
                            _MiniMarketCard(name: 'Nashik', price: 2490, change: 4.2, demand: 'HIGH'),
                            _MiniMarketCard(name: 'Lasalgaon', price: 2475, change: 3.1, demand: 'HIGH'),
                            _MiniMarketCard(name: 'Pune', price: 2460, change: 2.8, demand: 'MED'),
                            _MiniMarketCard(name: 'Vashi', price: 2430, change: 1.5, demand: 'HIGH'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          ),
        ),
      ),
    );
  }
}

class _TodayMarketCard extends StatelessWidget {
  final double price;
  final double change;
  final VoidCallback onTap;
  const _TodayMarketCard({required this.price, required this.change, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: AppColors.evergreenGradient,
          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          boxShadow: [AppTheme.shadowGreen],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.circle, size: 6, color: AppColors.greenGlow),
                      SizedBox(width: 5),
                      Text('Live', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                const Spacer(),
                const Text('Today\'s Market', style: TextStyle(color: Colors.white60, fontSize: 12)),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                const Text('🌾', style: TextStyle(fontSize: 28)),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Wheat', style: TextStyle(color: Colors.white60, fontSize: 12)),
                    Text(
                      Formatters.price(price),
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.greenGlow.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: AppColors.greenGlow.withOpacity(0.3)),
                  ),
                  child: Text(
                    Formatters.trend(change),
                    style: const TextStyle(color: AppColors.greenGlow, fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 13, color: Colors.white54),
                const SizedBox(width: 4),
                const Text('Nashik APMC', style: TextStyle(color: Colors.white60, fontSize: 12)),
                const Spacer(),
                const Text('Tap for all markets →',
                    style: TextStyle(color: Colors.white60, fontSize: 11, fontWeight: FontWeight.w500)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final String emoji;
  final String label;
  final VoidCallback onTap;
  const _QuickAction({required this.emoji, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.cardWhite,
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
            border: Border.all(color: AppColors.borderDash),
            boxShadow: [AppTheme.shadowSm],
          ),
          child: Column(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 22)),
              const SizedBox(height: 5),
              Text(label,
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.charcoal),
                  textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}

class _AiRecommendationCard extends StatelessWidget {
  final VoidCallback onTap;
  const _AiRecommendationCard({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: AppColors.cardWhite,
          borderRadius: BorderRadius.circular(AppTheme.radiusLg),
          border: Border.all(color: AppColors.borderSage),
          boxShadow: [AppTheme.shadowMd],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1A3A2A), Color(0xFF2D5A3D)],
                    ),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Center(child: Text('🤖', style: TextStyle(fontSize: 18))),
                ),
                const SizedBox(width: 10),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('KrishiShetra Recommendation',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                      Text('Updated today', style: TextStyle(fontSize: 11, color: AppColors.textMutedDash)),
                    ],
                  ),
                ),
                const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMutedDash),
              ],
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.paleSage,
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Sell Wheat in Nashik Market',
                      style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      _statItem('Current', '₹2,490/Qtl'),
                      const SizedBox(width: 16),
                      _statItem('Estimated', '₹2,540/Qtl', highlight: true),
                      const SizedBox(width: 16),
                      _statItem('Demand', 'HIGH', demandColor: AppColors.demandHigh),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.amberLight,
                borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                border: Border.all(color: AppColors.amber.withOpacity(0.3)),
              ),
              child: const Row(
                children: [
                  Text('💡', style: TextStyle(fontSize: 14)),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '"Good opportunity to sell within 2–3 days."',
                      style: TextStyle(fontSize: 13, color: AppColors.charcoal, fontStyle: FontStyle.italic),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(
                gradient: AppColors.evergreenGradient,
                borderRadius: BorderRadius.circular(AppTheme.radiusFull),
              ),
              child: const Center(
                child: Text('View Recommendation →',
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statItem(String label, String value, {bool highlight = false, Color? demandColor}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textMutedDash, fontWeight: FontWeight.w600)),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: demandColor ?? (highlight ? AppColors.sage : AppColors.charcoal),
          ),
        ),
      ],
    );
  }
}

class _BuyerOfferCard extends StatelessWidget {
  final VoidCallback onTap;
  const _BuyerOfferCard({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.cardWhite,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          border: Border.all(color: AppColors.amber.withOpacity(0.4)),
          boxShadow: [AppTheme.shadowSm],
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                gradient: AppColors.evergreenGradient,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Center(
                child: Text('A', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text('ABC Foods', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                      const SizedBox(width: 6),
                      const Icon(Icons.verified, size: 14, color: AppColors.sage),
                    ],
                  ),
                  const Text('New offer for your Wheat lot',
                      style: TextStyle(fontSize: 12, color: AppColors.textMutedDash)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                const Text('₹2,550/Qtl',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                Container(
                  margin: const EdgeInsets.only(top: 4),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.amberLight,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Text('View Offer', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.amber)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _MiniMarketCard extends StatelessWidget {
  final String name;
  final double price;
  final double change;
  final String demand;
  const _MiniMarketCard({required this.name, required this.price, required this.change, required this.demand});

  @override
  Widget build(BuildContext context) {
    final isUp = change >= 0;
    return Container(
      width: 130,
      margin: const EdgeInsets.only(right: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.cardWhite,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(color: AppColors.borderDash),
        boxShadow: [AppTheme.shadowSm],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(name, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
          Text(
            '₹${price.toStringAsFixed(0)}',
            style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.evergreen),
          ),
          Row(
            children: [
              Text(
                '${isUp ? '↑' : '↓'} ${change.abs().toStringAsFixed(1)}%',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600,
                    color: isUp ? AppColors.demandHigh : AppColors.demandLow),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                decoration: BoxDecoration(
                  color: demand == 'HIGH' ? AppColors.demandHigh.withOpacity(0.1) : AppColors.demandMedium.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(demand,
                    style: TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.w700,
                      color: demand == 'HIGH' ? AppColors.demandHigh : AppColors.demandMedium,
                    )),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

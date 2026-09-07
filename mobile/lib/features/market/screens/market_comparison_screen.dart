import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../app/providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/market_model.dart';
import '../../../shared/components/status_badge.dart';

class MarketComparisonScreen extends ConsumerWidget {
  const MarketComparisonScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedCrop = ref.watch(selectedCropProvider);
    final marketRepo   = ref.read(marketRepositoryProvider);
    final prices = marketRepo.getPricesForCrop(selectedCrop.id);
    final markets = marketRepo.getMarkets().where((m) => prices[m.id] != null).toList()
      ..sort((a, b) => (prices[b.id]!.netRealization).compareTo(prices[a.id]!.netRealization));
    final bestMarketId = markets.isNotEmpty ? markets.first.id : null;

    return Scaffold(
      backgroundColor: AppColors.ivoryBg,
      appBar: AppBar(
        title: Text('Compare Markets — ${selectedCrop.emoji} ${selectedCrop.name}'),
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Explanation banner
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.amberLight,
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              border: Border.all(color: AppColors.amber.withOpacity(0.3)),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('💡', style: TextStyle(fontSize: 16)),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Net Realization = Price − Transport Cost. The best market may not have the highest price — distance matters.',
                    style: TextStyle(fontSize: 12, color: AppColors.charcoal, height: 1.5),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Comparison table header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.evergreen,
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
            ),
            child: const Row(
              children: [
                Expanded(flex: 3, child: Text('Market', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white60))),
                Expanded(flex: 2, child: Text('Price', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white60), textAlign: TextAlign.center)),
                Expanded(flex: 2, child: Text('Net Real.', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white60), textAlign: TextAlign.center)),
                Expanded(flex: 2, child: Text('Demand', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white60), textAlign: TextAlign.center)),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Rows
          ...markets.asMap().entries.map((entry) {
            final market = entry.value;
            final price  = prices[market.id]!;
            final isBest = market.id == bestMarketId;
            return _ComparisonRow(market: market, price: price, isBest: isBest, rank: entry.key + 1);
          }),

          const SizedBox(height: 24),

          // Factor explanation
          const Text('What We Consider',
              style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
          const SizedBox(height: 12),
          ...[
            ('Price', 'Current market rate per quintal'),
            ('Distance', 'Transport cost reduces your net realization'),
            ('Demand', 'High demand = better price stability'),
            ('Market Trend', 'Rising prices indicate a good time to sell'),
          ].map((item) => _FactorRow(icon: '✓', title: item.$1, desc: item.$2)),

          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => context.push('/ai-recommendation'),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 52),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusFull)),
            ),
            child: const Text('Get AI Recommendation →'),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

class _ComparisonRow extends StatelessWidget {
  final MarketModel market;
  final MarketPriceModel price;
  final bool isBest;
  final int rank;

  const _ComparisonRow({required this.market, required this.price, required this.isBest, required this.rank});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: isBest ? AppColors.paleSage : AppColors.cardWhite,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(color: isBest ? AppColors.sage : AppColors.borderDash, width: isBest ? 1.5 : 1),
      ),
      child: Row(
        children: [
          // Market name + best badge
          Expanded(
            flex: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: isBest ? AppColors.sage : AppColors.textMutedDash,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text('$rank',
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white)),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(market.name,
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600,
                              color: isBest ? AppColors.evergreen : AppColors.charcoal),
                          overflow: TextOverflow.ellipsis),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 26, top: 2),
                  child: Text(Formatters.distance(market.distanceKm),
                      style: const TextStyle(fontSize: 10, color: AppColors.textMutedDash)),
                ),
              ],
            ),
          ),
          // Price
          Expanded(
            flex: 2,
            child: Text(
              '₹${price.price.toStringAsFixed(0)}',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.charcoal),
              textAlign: TextAlign.center,
            ),
          ),
          // Net realization
          Expanded(
            flex: 2,
            child: Text(
              '₹${price.netRealization.toStringAsFixed(0)}',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700,
                  color: isBest ? AppColors.sage : AppColors.charcoal),
              textAlign: TextAlign.center,
            ),
          ),
          // Demand
          Expanded(
            flex: 2,
            child: Center(child: StatusBadge.demand(price.demand)),
          ),
        ],
      ),
    );
  }
}

class _FactorRow extends StatelessWidget {
  final String icon;
  final String title;
  final String desc;
  const _FactorRow({required this.icon, required this.title, required this.desc});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: const BoxDecoration(color: AppColors.paleSage, shape: BoxShape.circle),
            child: Center(
              child: Text(icon, style: const TextStyle(fontSize: 12, color: AppColors.sage)),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                Text(desc, style: const TextStyle(fontSize: 12, color: AppColors.textMutedDash)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../app/providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../data/mock/mock_crops.dart';
import '../../../shared/components/market_card.dart';
import '../../../shared/components/price_trend_chart.dart';
import '../../../shared/widgets/agricultural_background.dart';

class MarketScreen extends ConsumerWidget {
  const MarketScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedCrop = ref.watch(selectedCropProvider);
    final marketRepo   = ref.read(marketRepositoryProvider);
    final prices = marketRepo.getPricesForCrop(selectedCrop.id);
    final markets = marketRepo.getMarkets();
    final best = marketRepo.getBestMarket(selectedCrop.id);

    // sort by net realization descending
    final sorted = markets.where((m) => prices[m.id] != null).toList()
      ..sort((a, b) => (prices[b.id]!.netRealization).compareTo(prices[a.id]!.netRealization));

    return Scaffold(
      backgroundColor: AppColors.ivoryBg,
      body: AgriculturalBackground(
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Row(
                  children: [
                    const Expanded(
                      child: Text("Today's Market",
                          style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                    ),
                    GestureDetector(
                      onTap: () => context.push('/market-comparison'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.paleSage,
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(color: AppColors.borderSage),
                        ),
                        child: const Text('Compare', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.evergreen)),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Crop selector
              SizedBox(
                height: 40,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: MockCrops.all.length,
                  itemBuilder: (_, i) {
                    final crop = MockCrops.all[i];
                    final isSelected = crop.id == selectedCrop.id;
                    return GestureDetector(
                      onTap: () => ref.read(selectedCropProvider.notifier).state = crop,
                      child: AnimatedContainer(
                        duration: AppTheme.durationFast,
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.evergreen : AppColors.cardWhite,
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(
                            color: isSelected ? AppColors.evergreen : AppColors.borderDash,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(crop.emoji, style: const TextStyle(fontSize: 14)),
                            const SizedBox(width: 5),
                            Text(crop.name,
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: isSelected ? Colors.white : AppColors.charcoal,
                                )),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),

              // Scrollable content
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: [
                    // Price chart (top market)
                    if (best != null) ...[
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.cardWhite,
                          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                          border: Border.all(color: AppColors.borderDash),
                          boxShadow: [AppTheme.shadowSm],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  'Price Trend — ${selectedCrop.emoji} ${selectedCrop.name}',
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.charcoal),
                                ),
                                const Spacer(),
                                Text(best.key.name,
                                    style: const TextStyle(fontSize: 11, color: AppColors.textMutedDash)),
                              ],
                            ),
                            const SizedBox(height: 12),
                            PriceTrendChart(data: best.value.trendData),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Market cards
                    const Text('Markets Near You',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                    const SizedBox(height: 10),
                    ...sorted.map((market) {
                      final price = prices[market.id]!;
                      return MarketCard(
                        market: market,
                        price: price,
                        isBest: best != null && market.id == best.key.id,
                        onTap: () => context.push('/ai-recommendation'),
                      );
                    }),
                    const SizedBox(height: 80),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

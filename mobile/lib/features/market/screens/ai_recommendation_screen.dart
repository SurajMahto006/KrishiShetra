import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../app/providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/market_model.dart';
import '../../../shared/components/status_badge.dart';
import '../../../shared/components/price_trend_chart.dart';

class AiRecommendationScreen extends ConsumerStatefulWidget {
  const AiRecommendationScreen({super.key});

  @override
  ConsumerState<AiRecommendationScreen> createState() => _AiRecommendationScreenState();
}

class _AiRecommendationScreenState extends ConsumerState<AiRecommendationScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _revealOpacity;
  late Animation<Offset> _revealSlide;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _revealOpacity = Tween(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeIn));
    _revealSlide = Tween(begin: const Offset(0, 0.2), end: Offset.zero)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
    Future.delayed(const Duration(milliseconds: 300), () => _ctrl.forward());
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final selectedCrop = ref.watch(selectedCropProvider);
    final marketRepo   = ref.read(marketRepositoryProvider);
    final prices = marketRepo.getPricesForCrop(selectedCrop.id);
    final nashikPrice = prices['nashik'];

    return Scaffold(
      backgroundColor: AppColors.ivoryBg,
      appBar: AppBar(
        title: const Text('Where & When to Sell?'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => context.pop(),
        ),
      ),
      body: FadeTransition(
        opacity: _revealOpacity,
        child: SlideTransition(
          position: _revealSlide,
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              // AI header card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [AppColors.evergreen, AppColors.evergreenLight],
                  ),
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                  boxShadow: [AppTheme.shadowGreen],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Center(child: Text('🤖', style: TextStyle(fontSize: 22))),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('KrishiShetra Recommendation',
                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white)),
                              Text('Based on market data & trends',
                                  style: TextStyle(fontSize: 11, color: Colors.white60)),
                            ],
                          ),
                        ),
                        // Confidence badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.greenGlow.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(999),
                            border: Border.all(color: AppColors.greenGlow.withOpacity(0.4)),
                          ),
                          child: const Column(
                            children: [
                              Text('86%', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.greenGlow)),
                              Text('Score', style: TextStyle(fontSize: 9, color: Colors.white60)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Sell Wheat in Nashik Market',
                      style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white),
                    ),
                    const SizedBox(height: 16),
                    // Stats grid
                    Row(
                      children: [
                        _statBox('Crop', '🌾 Wheat'),
                        const SizedBox(width: 8),
                        _statBox('Quantity', '500 KG'),
                        const SizedBox(width: 8),
                        _statBox('Market', 'Nashik'),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _statBox('Current', Formatters.price(nashikPrice?.price ?? 2490)),
                        const SizedBox(width: 8),
                        _statBox('Estimated', Formatters.price(2540), highlight: true),
                        const SizedBox(width: 8),
                        _statBox('Distance', '42 KM'),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Recommendation advice
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.amberLight,
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  border: Border.all(color: AppColors.amber.withOpacity(0.4)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: AppColors.amber.withOpacity(0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Center(child: Text('📅', style: TextStyle(fontSize: 20))),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Sell within 2–3 days',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                          SizedBox(height: 3),
                          Text('Price trend is rising. Demand is high. Good opportunity to act now.',
                              style: TextStyle(fontSize: 12, color: AppColors.textMutedDash, height: 1.4)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Demand badge
              Row(
                children: [
                  const Text('Buyer Demand: ',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.charcoal)),
                  StatusBadge.demand(DemandLevel.high),
                  const SizedBox(width: 8),
                  const Text('48 active buyers',
                      style: TextStyle(fontSize: 12, color: AppColors.textMutedDash)),
                ],
              ),

              const SizedBox(height: 20),

              // Price trend chart
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.cardWhite,
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  border: Border.all(color: AppColors.borderDash),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Price Trend — Wheat, Nashik',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                    const SizedBox(height: 12),
                    PriceTrendChart(data: nashikPrice?.trendData ?? [2400, 2420, 2440, 2460, 2480, 2490]),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Why this market
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.cardWhite,
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  border: Border.all(color: AppColors.borderSage),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Why Nashik Market?',
                        style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                    const SizedBox(height: 14),
                    ...const [
                      ('Better current price vs nearby markets', true),
                      ('Strong buyer demand (48 active buyers)', true),
                      ('Positive price trend (+4.2% this week)', true),
                      ('Reasonable distance (42 KM)', true),
                      ('High market arrival volume', true),
                    ].map((item) => _WhyItem(text: item.$1, positive: item.$2)),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Disclaimer
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                ),
                child: const Text(
                  '⚠️  This recommendation is based on market data and should be used as one factor in your decision. Prices may vary.',
                  style: TextStyle(fontSize: 11, color: AppColors.textMutedDash, height: 1.4),
                ),
              ),

              const SizedBox(height: 24),

              ElevatedButton(
                onPressed: () => context.push('/create-lot'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 52),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusFull)),
                ),
                child: const Text('Create Lot to Start Selling →'),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statBox(String label, String value, {bool highlight = false}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: highlight ? AppColors.greenGlow.withOpacity(0.15) : Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(AppTheme.radiusSm),
          border: Border.all(
            color: highlight ? AppColors.greenGlow.withOpacity(0.4) : Colors.white.withOpacity(0.12),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.6), fontWeight: FontWeight.w500)),
            const SizedBox(height: 3),
            Text(value,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: highlight ? AppColors.greenGlow : Colors.white,
                ),
                overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }
}

class _WhyItem extends StatelessWidget {
  final String text;
  final bool positive;
  const _WhyItem({required this.text, required this.positive});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              color: positive ? AppColors.paleSage : AppColors.terracottaLight,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                positive ? '✓' : '✗',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: positive ? AppColors.sage : AppColors.terracotta,
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(text, style: const TextStyle(fontSize: 13, color: AppColors.charcoal, height: 1.4)),
          ),
        ],
      ),
    );
  }
}

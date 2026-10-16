import 'package:flutter/material.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../data/models/market_model.dart';
import 'status_badge.dart';

class MarketCard extends StatelessWidget {
  final MarketModel market;
  final MarketPriceModel price;
  final bool isBest;
  final VoidCallback? onTap;

  const MarketCard({
    super.key,
    required this.market,
    required this.price,
    this.isBest = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: AppTheme.durationFast,
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: AppColors.cardWhite,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          border: Border.all(
            color: isBest ? AppColors.sage : AppColors.borderDash,
            width: isBest ? 1.5 : 1,
          ),
          boxShadow: [AppTheme.shadowSm],
        ),
        child: Column(
          children: [
            if (isBest)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: const BoxDecoration(
                  color: AppColors.paleSage,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(AppTheme.radiusMd),
                    topRight: Radius.circular(AppTheme.radiusMd),
                  ),
                ),
                child: const Text(
                  '⭐ Best Net Realization',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.evergreen,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  // Market icon
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.mintLight,
                      borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                    ),
                    child: const Icon(Icons.storefront_outlined, color: AppColors.sage, size: 22),
                  ),
                  const SizedBox(width: 12),
                  // Name + location
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(market.name,
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined, size: 12, color: AppColors.textMutedDash),
                            const SizedBox(width: 2),
                            Text(
                              Formatters.distance(market.distanceKm),
                              style: const TextStyle(fontSize: 12, color: AppColors.textMutedDash),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  // Price + trend
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        Formatters.price(price.price),
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.evergreen),
                      ),
                      const SizedBox(height: 4),
                      StatusBadge.trend(price.changePercent),
                    ],
                  ),
                ],
              ),
            ),
            // Demand + net realization row
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: const BoxDecoration(
                color: AppColors.ivoryBg,
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(AppTheme.radiusMd),
                  bottomRight: Radius.circular(AppTheme.radiusMd),
                ),
              ),
              child: Row(
                children: [
                  StatusBadge.demand(price.demand),
                  const Spacer(),
                  const Text('Net: ', style: TextStyle(fontSize: 12, color: AppColors.textMutedDash)),
                  Text(
                    Formatters.price(price.netRealization),
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.sage),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

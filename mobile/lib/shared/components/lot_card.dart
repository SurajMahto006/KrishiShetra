import 'package:flutter/material.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../data/models/lot_model.dart';

class LotCard extends StatelessWidget {
  final LotModel lot;
  final VoidCallback? onTap;

  const LotCard({super.key, required this.lot, this.onTap});

  Color get _statusColor {
    switch (lot.status) {
      case LotStatus.active:          return AppColors.sage;
      case LotStatus.offersReceived:  return AppColors.amber;
      case LotStatus.sold:            return AppColors.textMutedDash;
      case LotStatus.expired:         return AppColors.error;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: AppColors.cardWhite,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          border: Border.all(color: AppColors.borderDash),
          boxShadow: [AppTheme.shadowSm],
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  // Crop icon
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.mintLight,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Center(
                      child: Text(lot.cropEmoji, style: const TextStyle(fontSize: 22)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(lot.cropName,
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                        Text(
                          '${Formatters.weight(lot.quantityKg)} · ${lot.quality.label} · ${lot.location}',
                          style: const TextStyle(fontSize: 12, color: AppColors.textMutedDash),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  // Status chip
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: _statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      lot.status.label,
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: _statusColor),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Divider(height: 1, color: AppColors.borderDash),
              const SizedBox(height: 10),
              Row(
                children: [
                  _infoItem('Expected', Formatters.price(lot.expectedPricePerQtl)),
                  const SizedBox(width: 20),
                  if (lot.bestOfferPrice != null)
                    _infoItem('Best Offer', Formatters.price(lot.bestOfferPrice!), highlight: true),
                  const Spacer(),
                  if (lot.offersCount > 0)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.amberLight,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        '${lot.offersCount} Offers',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.amber),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _infoItem(String label, String value, {bool highlight = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textMutedDash, fontWeight: FontWeight.w500)),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: highlight ? AppColors.sage : AppColors.charcoal,
          ),
        ),
      ],
    );
  }
}

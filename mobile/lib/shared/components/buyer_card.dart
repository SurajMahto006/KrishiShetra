import 'package:flutter/material.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_theme.dart';
import '../../data/models/buyer_model.dart';
import 'status_badge.dart';
import 'ks_button.dart';

class BuyerCard extends StatelessWidget {
  final BuyerModel buyer;
  final String? offerPrice;
  final VoidCallback? onTap;

  const BuyerCard({super.key, required this.buyer, this.offerPrice, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
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
            // Header
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    gradient: AppColors.evergreenGradient,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Center(
                    child: Text(
                      buyer.name[0],
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(buyer.name,
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          const Icon(Icons.location_on_outlined, size: 12, color: AppColors.textMutedDash),
                          const SizedBox(width: 2),
                          Text(buyer.location,
                              style: const TextStyle(fontSize: 12, color: AppColors.textMutedDash)),
                        ],
                      ),
                    ],
                  ),
                ),
                if (buyer.verified) StatusBadge.verified(),
              ],
            ),
            const SizedBox(height: 12),
            // Details row
            Row(
              children: [
                _chip('Qty', buyer.quantityRange),
                const SizedBox(width: 8),
                _chip('Payment', buyer.paymentTerms),
                const SizedBox(width: 8),
                _chip('Reliability', '${buyer.reliabilityPercent.toInt()}%'),
              ],
            ),
            if (offerPrice != null) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.paleSage,
                  borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                ),
                child: Row(
                  children: [
                    const Text('Offer Price: ', style: TextStyle(fontSize: 13, color: AppColors.textMutedDash)),
                    Text(offerPrice!,
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 12),
            KsButton(
              label: 'View Buyer',
              onTap: onTap,
              variant: KsButtonVariant.outlined,
              height: 40,
            ),
          ],
        ),
      ),
    );
  }

  Widget _chip(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.ivoryBg,
          borderRadius: BorderRadius.circular(AppTheme.radiusSm),
          border: Border.all(color: AppColors.borderDash),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 9, color: AppColors.textMutedDash, fontWeight: FontWeight.w600)),
            const SizedBox(height: 2),
            Text(value, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.charcoal),
                overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }
}

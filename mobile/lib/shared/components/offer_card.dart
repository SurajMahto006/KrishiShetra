import 'package:flutter/material.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../data/models/offer_model.dart';
import 'status_badge.dart';

class OfferCard extends StatelessWidget {
  final OfferModel offer;
  final bool isHighlighted;
  final VoidCallback? onTap;

  const OfferCard({super.key, required this.offer, this.isHighlighted = false, this.onTap});

  @override
  Widget build(BuildContext context) {
    final daysLeft = offer.expiresAt.difference(DateTime.now()).inDays;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: AppColors.cardWhite,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          border: Border.all(
            color: isHighlighted ? AppColors.sage : AppColors.borderDash,
            width: isHighlighted ? 1.5 : 1,
          ),
          boxShadow: [AppTheme.shadowSm],
        ),
        child: Column(
          children: [
            if (isHighlighted)
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
                child: const Row(
                  children: [
                    Text('⭐ ', style: TextStyle(fontSize: 12)),
                    Text('Best Overall Value', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                  ],
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Buyer name + verified
                  Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          gradient: AppColors.evergreenGradient,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Center(
                          child: Text(
                            offer.buyerName[0],
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(offer.buyerName,
                                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                                if (offer.buyerVerified) ...[
                                  const SizedBox(width: 6),
                                  const Icon(Icons.verified, size: 14, color: AppColors.sage),
                                ],
                              ],
                            ),
                            Text(
                              '${offer.cropEmoji} ${offer.cropName} · ${Formatters.weight(offer.quantityKg)}',
                              style: const TextStyle(fontSize: 12, color: AppColors.textMutedDash),
                            ),
                          ],
                        ),
                      ),
                      // Price
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            Formatters.price(offer.pricePerQtl),
                            style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.evergreen),
                          ),
                          const Text('per quintal', style: TextStyle(fontSize: 10, color: AppColors.textMutedDash)),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  // Meta row
                  Row(
                    children: [
                      _meta(Icons.location_on_outlined, Formatters.distance(offer.distanceKm)),
                      const SizedBox(width: 12),
                      _meta(Icons.schedule_outlined, offer.paymentTerms),
                      const SizedBox(width: 12),
                      _meta(
                        offer.logisticsIncluded ? Icons.local_shipping : Icons.local_shipping_outlined,
                        offer.logisticsIncluded ? 'Logistics incl.' : 'Own logistics',
                        color: offer.logisticsIncluded ? AppColors.sage : AppColors.textMutedDash,
                      ),
                      const Spacer(),
                      if (daysLeft <= 1)
                        const StatusBadge(label: 'Expiring', color: AppColors.error, bgColor: AppColors.terracottaLight),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _meta(IconData icon, String text, {Color color = AppColors.textMutedDash}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 12, color: color),
        const SizedBox(width: 3),
        Text(text, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w500)),
      ],
    );
  }
}

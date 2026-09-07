import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../app/providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/lot_model.dart';
import '../../../shared/components/progress_timeline.dart';
import '../../../shared/components/ks_button.dart';

class LotDetailScreen extends ConsumerWidget {
  final String lotId;
  const LotDetailScreen({super.key, required this.lotId});

  List<TimelineStep> _buildTimeline(LotStatus status) {
    return [
      TimelineStep(label: 'Lot Created',       status: TimelineStepStatus.completed),
      TimelineStep(label: 'Listed on Platform', status: TimelineStepStatus.completed),
      TimelineStep(
        label: 'Offers Received',
        status: status == LotStatus.offersReceived || status == LotStatus.sold
            ? TimelineStepStatus.completed
            : TimelineStepStatus.active,
      ),
      TimelineStep(
        label: 'Offer Accepted',
        status: status == LotStatus.sold ? TimelineStepStatus.completed : TimelineStepStatus.pending,
      ),
      TimelineStep(
        label: 'Sale Completed',
        status: status == LotStatus.sold ? TimelineStepStatus.completed : TimelineStepStatus.pending,
      ),
    ];
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lots = ref.watch(lotsProvider);
    final lot  = lots.firstWhere((l) => l.id == lotId, orElse: () => lots.first);

    return Scaffold(
      backgroundColor: AppColors.ivoryBg,
      appBar: AppBar(
        title: Text('${lot.cropEmoji} ${lot.cropName} Lot'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Summary card
          Container(
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
                    Text(lot.cropEmoji, style: const TextStyle(fontSize: 36)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(lot.cropName,
                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white,
                                  fontFamily: 'PlayfairDisplay')),
                          Text(lot.quality.label,
                              style: const TextStyle(fontSize: 13, color: Colors.white70)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        lot.status.label,
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _stat('Quantity', Formatters.weight(lot.quantityKg)),
                    const SizedBox(width: 16),
                    _stat('Expected', Formatters.price(lot.expectedPricePerQtl)),
                    const SizedBox(width: 16),
                    _stat('Location', lot.location.split(',').first),
                  ],
                ),
                if (lot.bestOfferPrice != null) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.greenGlow.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                      border: Border.all(color: AppColors.greenGlow.withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        const Text('🏷️ Best Offer: ',
                            style: TextStyle(fontSize: 13, color: Colors.white70)),
                        Text(
                          Formatters.price(lot.bestOfferPrice!),
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${lot.offersCount} offer${lot.offersCount != 1 ? 's' : ''}',
                          style: const TextStyle(fontSize: 12, color: Colors.white70),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Timeline
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
                const Text('Lot Status',
                    style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                const SizedBox(height: 16),
                ProgressTimeline(steps: _buildTimeline(lot.status)),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Details
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
                const Text('Lot Details',
                    style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                const SizedBox(height: 12),
                _detailRow('Harvest Date', Formatters.date(lot.harvestDate)),
                _detailRow('Created On', Formatters.date(lot.createdAt)),
                _detailRow('Location', lot.location),
                _detailRow('Lot ID', lot.id),
              ],
            ),
          ),

          const SizedBox(height: 24),

          if (lot.offersCount > 0)
            KsButton(
              label: 'View & Compare Offers (${lot.offersCount})',
              onTap: () => context.push('/offer-comparison/${lot.id}'),
            )
          else
            KsButton(
              label: 'Browse Buyers',
              variant: KsButtonVariant.outlined,
              onTap: () => context.push('/buyers'),
            ),

          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _stat(String label, String value) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, color: Colors.white60, fontWeight: FontWeight.w500)),
          const SizedBox(height: 2),
          Text(value,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white),
              overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textMutedDash)),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.charcoal)),
        ],
      ),
    );
  }
}

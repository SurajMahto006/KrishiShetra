import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../app/providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../data/mock/mock_crops.dart';
import '../../../shared/components/buyer_card.dart';
import '../../../shared/widgets/agricultural_background.dart';

class BuyersScreen extends ConsumerWidget {
  const BuyersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final buyerRepo = ref.read(buyerRepositoryProvider);
    final buyers    = buyerRepo.getBuyers();

    return Scaffold(
      backgroundColor: AppColors.ivoryBg,
      body: AgriculturalBackground(
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Find Buyers',
                        style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                    const SizedBox(height: 4),
                    const Text('Verified buyers looking for your crops',
                        style: TextStyle(fontSize: 13, color: AppColors.textMutedDash)),
                    const SizedBox(height: 14),
                    SizedBox(
                      height: 36,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          _FilterChip(label: 'All', selected: true, onTap: () {}),
                          ...MockCrops.all.map((c) => _FilterChip(
                              label: '${c.emoji} ${c.name}', selected: false, onTap: () {})),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: buyers.length,
                  itemBuilder: (_, i) => BuyerCard(
                    buyer: buyers[i],
                    onTap: () => _showBuyerDetail(context, ref, buyers[i].id),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showBuyerDetail(BuildContext context, WidgetRef ref, String buyerId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _BuyerDetailSheet(buyerId: buyerId),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _FilterChip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? AppColors.evergreen : AppColors.cardWhite,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: selected ? AppColors.evergreen : AppColors.borderDash),
        ),
        child: Text(label,
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600,
                color: selected ? Colors.white : AppColors.charcoal)),
      ),
    );
  }
}

class _BuyerDetailSheet extends ConsumerWidget {
  final String buyerId;
  const _BuyerDetailSheet({required this.buyerId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final buyer = ref.read(buyerRepositoryProvider).findById(buyerId);
    if (buyer == null) return const SizedBox();

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.ivoryBg,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppTheme.radiusLg)),
      ),
      padding: EdgeInsets.fromLTRB(24, 16, 24, MediaQuery.of(context).padding.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(color: AppColors.borderDash, borderRadius: BorderRadius.circular(999)),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  gradient: AppColors.evergreenGradient,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Center(
                  child: Text(buyer.name[0],
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: Colors.white)),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(buyer.name,
                        style: const TextStyle(
                            fontFamily: 'PlayfairDisplay', fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                    Text(buyer.location, style: const TextStyle(fontSize: 13, color: AppColors.textMutedDash)),
                  ],
                ),
              ),
              if (buyer.verified)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: AppColors.paleSage, borderRadius: BorderRadius.circular(999)),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.verified, size: 12, color: AppColors.sage),
                      SizedBox(width: 4),
                      Text('Verified', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.sage)),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Text(buyer.description,
              style: const TextStyle(fontSize: 13, color: AppColors.textMutedDash, height: 1.5)),
          const SizedBox(height: 16),
          Row(
            children: [
              _buyerStat('Reliability', '${buyer.reliabilityPercent.toInt()}%'),
              const SizedBox(width: 12),
              _buyerStat('Deals', '${buyer.completedTransactions}'),
              const SizedBox(width: 12),
              _buyerStat('Payment', buyer.paymentTerms),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusFull)),
              ),
              child: const Text('Close'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buyerStat(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.cardWhite,
          borderRadius: BorderRadius.circular(AppTheme.radiusSm),
          border: Border.all(color: AppColors.borderDash),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textMutedDash, fontWeight: FontWeight.w600)),
            const SizedBox(height: 2),
            Text(value,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.charcoal),
                overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }
}

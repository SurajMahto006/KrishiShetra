import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../app/providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../shared/components/offer_card.dart';
import '../../../shared/components/empty_state.dart';
import '../../../shared/widgets/agricultural_background.dart';

class OffersScreen extends ConsumerWidget {
  const OffersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final offerRepo = ref.read(offerRepositoryProvider);
    final offers    = offerRepo.getAllOffers();

    return Scaffold(
      backgroundColor: AppColors.ivoryBg,
      body: AgriculturalBackground(
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('My Offers',
                        style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                    Text('${offers.length} offer${offers.length != 1 ? 's' : ''} received',
                        style: const TextStyle(fontSize: 13, color: AppColors.textMutedDash)),
                  ],
                ),
              ),
              if (offers.isEmpty)
                Expanded(
                  child: EmptyState(
                    emoji: '🤝',
                    title: 'No offers yet',
                    message: 'Your crop lots are visible to verified buyers. New offers will appear here.',
                    ctaLabel: 'View My Lots',
                    onCta: () => context.go('/sell'),
                  ),
                )
              else
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    children: [
                      // Compare banner
                      if (offers.length >= 2) ...[
                        Container(
                          padding: const EdgeInsets.all(14),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: AppColors.paleSage,
                            borderRadius: const BorderRadius.all(Radius.circular(12)),
                            border: Border.all(color: AppColors.borderSage),
                          ),
                          child: Row(
                            children: [
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('You have multiple offers!',
                                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                                    Text('Compare them to find the best deal.',
                                        style: TextStyle(fontSize: 12, color: AppColors.textMutedDash)),
                                  ],
                                ),
                              ),
                              GestureDetector(
                                onTap: () => context.push('/offer-comparison/lot_001'),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    gradient: AppColors.evergreenGradient,
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                  child: const Text('Compare', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                      // Offer cards
                      ...offers.asMap().entries.map((entry) => OfferCard(
                        offer: entry.value,
                        isHighlighted: entry.key == 0,
                        onTap: () => context.push('/offer-comparison/${entry.value.lotId}'),
                      )),
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

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../app/providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/offer_model.dart';
import '../../../shared/components/ks_button.dart';

class OfferComparisonScreen extends ConsumerStatefulWidget {
  final String lotId;
  const OfferComparisonScreen({super.key, required this.lotId});

  @override
  ConsumerState<OfferComparisonScreen> createState() => _OfferComparisonScreenState();
}

class _OfferComparisonScreenState extends ConsumerState<OfferComparisonScreen> {
  String? _acceptedOfferId;
  bool _accepting = false;

  // Best offer = highest net value
  OfferModel? _findBest(List<OfferModel> offers) {
    if (offers.isEmpty) return null;
    return offers.reduce((a, b) => a.netValue > b.netValue ? a : b);
  }

  Future<void> _acceptOffer(OfferModel offer) async {
    setState(() { _accepting = true; });
    await Future.delayed(const Duration(milliseconds: 1200));
    ref.read(offerRepositoryProvider).acceptOffer(offer.id);
    ref.read(acceptedOfferIdProvider.notifier).state = offer.id;
    setState(() { _accepting = false; _acceptedOfferId = offer.id; });
  }

  @override
  Widget build(BuildContext context) {
    final offerRepo = ref.read(offerRepositoryProvider);
    final offers    = offerRepo.getOffersForLot(widget.lotId);
    final best      = _findBest(offers);

    if (_acceptedOfferId != null) return _buildSuccess(context);

    return Scaffold(
      backgroundColor: AppColors.ivoryBg,
      appBar: AppBar(
        title: const Text('Compare Offers'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Banner
          Container(
            padding: const EdgeInsets.all(14),
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: AppColors.amberLight,
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              border: Border.all(color: AppColors.amber.withOpacity(0.3)),
            ),
            child: const Row(
              children: [
                Text('💡 ', style: TextStyle(fontSize: 16)),
                Expanded(
                  child: Text(
                    'Net Value = Price × Quantity − Logistics cost. The highest price is not always the best deal.',
                    style: TextStyle(fontSize: 12, color: AppColors.charcoal, height: 1.4),
                  ),
                ),
              ],
            ),
          ),

          // Offer cards
          ...offers.map((offer) {
            final isBest = best?.id == offer.id;
            return _OfferCompareCard(
              offer: offer,
              isBest: isBest,
              onAccept: () => _acceptOffer(offer),
              accepting: _accepting,
            );
          }),

          const SizedBox(height: 24),

          // Comparison table
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
                const Text('Side-by-Side Comparison',
                    style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                const SizedBox(height: 12),
                _compRow('Buyer', offers.map((o) => o.buyerName.split(' ').first).toList()),
                _compRow('Price/Qtl', offers.map((o) => Formatters.price(o.pricePerQtl)).toList(), highlight: true),
                _compRow('Net Value', offers.map((o) => Formatters.priceRaw(o.netValue)).toList(), highlight: true),
                _compRow('Distance', offers.map((o) => Formatters.distance(o.distanceKm)).toList()),
                _compRow('Logistics', offers.map((o) => o.logisticsIncluded ? 'Included' : '₹${o.logisticsCost?.toStringAsFixed(0)}').toList()),
                _compRow('Payment', offers.map((o) => o.paymentTerms).toList()),
              ],
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _compRow(String label, List<String> values, {bool highlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          SizedBox(
            width: 80,
            child: Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textMutedDash, fontWeight: FontWeight.w500)),
          ),
          ...values.map((v) => Expanded(
            child: Text(v,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: highlight ? FontWeight.w700 : FontWeight.w500,
                  color: highlight ? AppColors.evergreen : AppColors.charcoal,
                )),
          )),
        ],
      ),
    );
  }

  Widget _buildSuccess(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 100,
                  height: 100,
                  decoration: const BoxDecoration(color: AppColors.paleSage, shape: BoxShape.circle),
                  child: const Icon(Icons.check_circle, size: 52, color: AppColors.sage),
                ),
                const SizedBox(height: 24),
                const Text('Offer Accepted!',
                    style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 26, fontWeight: FontWeight.w700, color: AppColors.evergreen),
                    textAlign: TextAlign.center),
                const SizedBox(height: 12),
                const Text(
                  'The buyer will be notified. Your order is being confirmed.',
                  style: TextStyle(fontSize: 14, color: AppColors.textMutedDash, height: 1.5),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 40),
                KsButton(
                  label: 'View Order Details',
                  onTap: () => context.pushReplacement('/order/order_001'),
                ),
                const SizedBox(height: 12),
                KsButton(
                  label: 'Go to Dashboard',
                  variant: KsButtonVariant.outlined,
                  onTap: () => context.go('/home'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _OfferCompareCard extends StatelessWidget {
  final OfferModel offer;
  final bool isBest;
  final VoidCallback onAccept;
  final bool accepting;

  const _OfferCompareCard({required this.offer, required this.isBest, required this.onAccept, required this.accepting});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: AppColors.cardWhite,
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        border: Border.all(color: isBest ? AppColors.sage : AppColors.borderDash, width: isBest ? 2 : 1),
        boxShadow: [isBest ? AppTheme.shadowGreen : AppTheme.shadowSm],
      ),
      child: Column(
        children: [
          if (isBest)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
              decoration: const BoxDecoration(
                color: AppColors.paleSage,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(AppTheme.radiusLg),
                  topRight: Radius.circular(AppTheme.radiusLg),
                ),
              ),
              child: const Row(
                children: [
                  Text('⭐ ', style: TextStyle(fontSize: 13)),
                  Text('Best Overall Deal', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                  Spacer(),
                  Text('Recommended', style: TextStyle(fontSize: 11, color: AppColors.sage, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Buyer header
                Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(gradient: AppColors.evergreenGradient, borderRadius: BorderRadius.circular(10)),
                      child: Center(child: Text(offer.buyerName[0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 18))),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(offer.buyerName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                              if (offer.buyerVerified) ...[
                                const SizedBox(width: 5),
                                const Icon(Icons.verified, size: 14, color: AppColors.sage),
                              ],
                            ],
                          ),
                          Text(offer.paymentTerms, style: const TextStyle(fontSize: 12, color: AppColors.textMutedDash)),
                        ],
                      ),
                    ),
                    Text(
                      Formatters.price(offer.pricePerQtl),
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.evergreen),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Stats
                Row(
                  children: [
                    _stat('Distance', Formatters.distance(offer.distanceKm)),
                    const SizedBox(width: 8),
                    _stat('Logistics', offer.logisticsIncluded ? 'Included' : '₹${offer.logisticsCost?.toStringAsFixed(0)}'),
                    const SizedBox(width: 8),
                    _stat('Net Value', Formatters.priceRaw(offer.netValue), highlight: true),
                  ],
                ),
                const SizedBox(height: 14),
                KsButton(
                  label: 'Accept This Offer',
                  onTap: accepting ? null : onAccept,
                  loading: accepting,
                  height: 44,
                  variant: isBest ? KsButtonVariant.primary : KsButtonVariant.outlined,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _stat(String label, String value, {bool highlight = false}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: highlight ? AppColors.paleSage : AppColors.ivoryBg,
          borderRadius: BorderRadius.circular(AppTheme.radiusSm),
          border: Border.all(color: highlight ? AppColors.borderSage : AppColors.borderDash),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 9, color: AppColors.textMutedDash, fontWeight: FontWeight.w600)),
            const SizedBox(height: 2),
            Text(value,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: highlight ? AppColors.evergreen : AppColors.charcoal,
                ),
                overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }
}

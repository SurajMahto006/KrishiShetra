import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../app/providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/order_model.dart';
import '../../../shared/components/progress_timeline.dart';
import '../../../shared/components/ks_button.dart';

class OrderDetailScreen extends ConsumerWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  List<TimelineStep> _buildTimeline(OrderStatus status) {
    final steps = [
      OrderStatus.offerAccepted,
      OrderStatus.confirmed,
      OrderStatus.logistics,
      OrderStatus.paymentPending,
      OrderStatus.completed,
    ];
    final currentIdx = steps.indexOf(status);
    return steps.asMap().entries.map((e) {
      TimelineStepStatus ts;
      if (e.key < currentIdx) ts = TimelineStepStatus.completed;
      else if (e.key == currentIdx) ts = TimelineStepStatus.active;
      else ts = TimelineStepStatus.pending;
      return TimelineStep(label: steps[e.key].label, status: ts);
    }).toList();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderRepo = ref.read(orderRepositoryProvider);
    final order = orderRepo.findById(orderId) ?? orderRepo.getOrders().first;

    return Scaffold(
      backgroundColor: AppColors.ivoryBg,
      appBar: AppBar(
        title: Text('Order #${order.orderNumber}'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => context.pop(),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.paleSage,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(order.status.label,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Hero card
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
                    Text(order.cropEmoji, style: const TextStyle(fontSize: 32)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(order.cropName,
                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white,
                                  fontFamily: 'PlayfairDisplay')),
                          Text(Formatters.weight(order.quantityKg),
                              style: const TextStyle(fontSize: 13, color: Colors.white70)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(Formatters.price(order.pricePerQtl),
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
                        const Text('per quintal', style: TextStyle(fontSize: 10, color: Colors.white60)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    const Text('Buyer: ', style: TextStyle(color: Colors.white60, fontSize: 13)),
                    Text(order.buyerName, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                    if (order.buyerVerified) ...[
                      const SizedBox(width: 4),
                      const Icon(Icons.verified, size: 14, color: AppColors.greenGlow),
                    ],
                  ],
                ),
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
                const Text('Order Progress',
                    style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                const SizedBox(height: 16),
                ProgressTimeline(steps: _buildTimeline(order.status)),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Logistics quick view
          GestureDetector(
            onTap: () => context.push('/logistics/${order.id}'),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.cardWhite,
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                border: Border.all(color: AppColors.borderDash),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(color: AppColors.mintLight, borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.local_shipping_outlined, color: AppColors.sage, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Logistics', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                        Text('Driver: ${order.logistics.driverName} · ${order.logistics.status}',
                            style: const TextStyle(fontSize: 12, color: AppColors.textMutedDash)),
                      ],
                    ),
                  ),
                  const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMutedDash),
                ],
              ),
            ),
          ),

          const SizedBox(height: 10),

          // Payment quick view
          GestureDetector(
            onTap: () => context.push('/payments/${order.id}'),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.cardWhite,
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                border: Border.all(color: order.payment.isPaid ? AppColors.borderSage : AppColors.amber.withOpacity(0.4)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: order.payment.isPaid ? AppColors.paleSage : AppColors.amberLight,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      order.payment.isPaid ? Icons.check_circle_outline : Icons.schedule_outlined,
                      color: order.payment.isPaid ? AppColors.sage : AppColors.amber,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Payment', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                        Text(
                          'Net: ${Formatters.priceRaw(order.payment.netAmount)} · ${order.payment.isPaid ? "Received ✓" : "Pending"}',
                          style: TextStyle(fontSize: 12, color: order.payment.isPaid ? AppColors.sage : AppColors.amber),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMutedDash),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),
          KsButton(
            label: 'View Logistics Details',
            variant: KsButtonVariant.outlined,
            icon: Icons.local_shipping_outlined,
            onTap: () => context.push('/logistics/${order.id}'),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

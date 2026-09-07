import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../app/providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';

class PaymentsScreen extends ConsumerWidget {
  final String orderId;
  const PaymentsScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderRepo = ref.read(orderRepositoryProvider);
    final order     = orderRepo.findById(orderId) ?? orderRepo.getOrders().first;
    final payment   = order.payment;

    return Scaffold(
      backgroundColor: AppColors.ivoryBg,
      appBar: AppBar(
        title: const Text('Payment Details'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Status hero
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: payment.isPaid
                  ? const LinearGradient(colors: [AppColors.evergreen, AppColors.evergreenLight], begin: Alignment.topLeft, end: Alignment.bottomRight)
                  : const LinearGradient(colors: [Color(0xFFB45309), Color(0xFFD97706)], begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: BorderRadius.circular(AppTheme.radiusLg),
            ),
            child: Column(
              children: [
                Icon(
                  payment.isPaid ? Icons.check_circle : Icons.schedule,
                  color: Colors.white,
                  size: 52,
                ),
                const SizedBox(height: 12),
                Text(
                  payment.isPaid ? 'Payment Received' : 'Payment Pending',
                  style: const TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white),
                ),
                const SizedBox(height: 4),
                Text(
                  payment.isPaid
                      ? 'Received on ${payment.paidAt != null ? Formatters.date(payment.paidAt!) : "—"}'
                      : 'Expected within ${order.payment.method == "UPI" ? "24 hours" : "7 days"}',
                  style: const TextStyle(fontSize: 13, color: Colors.white70),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Breakdown
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
                const Text('Payment Breakdown', style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                const SizedBox(height: 16),
                _breakdownRow('Crop', '${order.cropEmoji} ${order.cropName}'),
                _breakdownRow('Quantity', Formatters.weight(order.quantityKg)),
                _breakdownRow('Price', Formatters.price(order.pricePerQtl)),
                _breakdownRow('Sale Value', Formatters.priceRaw(payment.saleValue), bold: true),
                const SizedBox(height: 8),
                const Divider(color: AppColors.borderDash, height: 1),
                const SizedBox(height: 8),
                _breakdownRow('(−) Transport', '− ₹${payment.logisticsCost.toStringAsFixed(0)}',
                    color: AppColors.terracotta),
                const SizedBox(height: 8),
                const Divider(color: AppColors.borderDash, height: 1),
                const SizedBox(height: 8),
                _breakdownRow('Net Amount', Formatters.priceRaw(payment.netAmount),
                    bold: true, color: AppColors.evergreen, large: true),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Payment method
          Container(
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
                  child: const Icon(Icons.account_balance_outlined, color: AppColors.sage, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Payment Method', style: TextStyle(fontSize: 12, color: AppColors.textMutedDash)),
                      Text(payment.method, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: payment.isPaid ? AppColors.paleSage : AppColors.amberLight,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    payment.isPaid ? '✓ Received' : '● Pending',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: payment.isPaid ? AppColors.sage : AppColors.amber,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _breakdownRow(String label, String value, {bool bold = false, Color? color, bool large = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textMutedDash)),
          const Spacer(),
          Text(
            value,
            style: TextStyle(
              fontSize: large ? 18 : 14,
              fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
              color: color ?? AppColors.charcoal,
            ),
          ),
        ],
      ),
    );
  }
}

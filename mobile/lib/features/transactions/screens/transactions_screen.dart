import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../app/providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/transaction_model.dart';
import '../../../shared/widgets/agricultural_background.dart';

class TransactionsScreen extends ConsumerWidget {
  const TransactionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final txns = ref.read(txnRepositoryProvider).getAll();
    final totalEarned = txns
        .where((t) => t.status == TransactionStatus.completed)
        .fold(0.0, (sum, t) => sum + t.totalAmount);

    return Scaffold(
      backgroundColor: AppColors.ivoryBg,
      appBar: AppBar(title: const Text('My Sales')),
      body: AgriculturalBackground(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // Summary banner
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: AppColors.evergreenGradient,
                borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                boxShadow: [AppTheme.shadowGreen],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Total Earnings', style: TextStyle(color: Colors.white60, fontSize: 12)),
                        Text(
                          Formatters.priceRaw(totalEarned),
                          style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -0.5),
                        ),
                        Text('${txns.length} completed sales',
                            style: const TextStyle(color: Colors.white60, fontSize: 12)),
                      ],
                    ),
                  ),
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.trending_up, color: Colors.white, size: 28),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Text('Transaction History',
                style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
            const SizedBox(height: 12),

            ...txns.map((txn) => _TxnCard(txn: txn)),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

class _TxnCard extends StatelessWidget {
  final TransactionModel txn;
  const _TxnCard({required this.txn});

  @override
  Widget build(BuildContext context) {
    final isCompleted = txn.status == TransactionStatus.completed;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cardWhite,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(color: AppColors.borderDash),
        boxShadow: [AppTheme.shadowSm],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(color: AppColors.mintLight, borderRadius: BorderRadius.circular(10)),
            child: Center(child: Text(txn.cropEmoji, style: const TextStyle(fontSize: 22))),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(txn.cropName,
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: isCompleted ? AppColors.paleSage : AppColors.amberLight,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        isCompleted ? '✓ Completed' : 'Pending',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                          color: isCompleted ? AppColors.sage : AppColors.amber,
                        ),
                      ),
                    ),
                  ],
                ),
                Text(
                  '${txn.buyerName} · ${Formatters.weight(txn.quantityKg)} · ${Formatters.shortDate(txn.date)}',
                  style: const TextStyle(fontSize: 11, color: AppColors.textMutedDash),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                Formatters.priceRaw(txn.totalAmount),
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.evergreen),
              ),
              Text(
                '₹${txn.pricePerQtl.toStringAsFixed(0)}/Qtl',
                style: const TextStyle(fontSize: 11, color: AppColors.textMutedDash),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

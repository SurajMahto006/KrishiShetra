import 'package:flutter/material.dart';
import '../../app/theme/app_colors.dart';
import '../../data/models/market_model.dart';

class StatusBadge extends StatelessWidget {
  final String label;
  final Color color;
  final Color bgColor;
  final bool showDot;

  const StatusBadge({
    super.key,
    required this.label,
    required this.color,
    required this.bgColor,
    this.showDot = false,
  });

  factory StatusBadge.demand(DemandLevel level) {
    switch (level) {
      case DemandLevel.high:
        return StatusBadge(label: 'HIGH', color: AppColors.demandHigh, bgColor: AppColors.demandHigh.withOpacity(0.12), showDot: true);
      case DemandLevel.medium:
        return StatusBadge(label: 'MEDIUM', color: AppColors.demandMedium, bgColor: AppColors.demandMedium.withOpacity(0.12), showDot: true);
      case DemandLevel.low:
        return StatusBadge(label: 'LOW', color: AppColors.demandLow, bgColor: AppColors.demandLow.withOpacity(0.12), showDot: true);
    }
  }

  factory StatusBadge.verified() => const StatusBadge(
    label: '✓ Verified',
    color: AppColors.sage,
    bgColor: AppColors.paleSage,
  );

  factory StatusBadge.trend(double changePercent) {
    final isUp = changePercent >= 0;
    final label = '${isUp ? '↑' : '↓'} ${changePercent.abs().toStringAsFixed(1)}%';
    return StatusBadge(
      label: label,
      color: isUp ? AppColors.demandHigh : AppColors.demandLow,
      bgColor: (isUp ? AppColors.demandHigh : AppColors.demandLow).withOpacity(0.1),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showDot) ...[
            Container(
              width: 5,
              height: 5,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            ),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: color,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}

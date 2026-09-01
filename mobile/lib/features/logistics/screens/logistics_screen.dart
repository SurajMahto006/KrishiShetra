import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../app/providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';

class LogisticsScreen extends ConsumerWidget {
  final String orderId;
  const LogisticsScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderRepo = ref.read(orderRepositoryProvider);
    final order     = orderRepo.findById(orderId) ?? orderRepo.getOrders().first;
    final logistics = order.logistics;

    return Scaffold(
      backgroundColor: AppColors.ivoryBg,
      appBar: AppBar(
        title: const Text('Logistics'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Status banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: AppColors.evergreenGradient,
              borderRadius: BorderRadius.circular(AppTheme.radiusLg),
              boxShadow: [AppTheme.shadowGreen],
            ),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.local_shipping, color: Colors.white, size: 26),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(logistics.status,
                          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: Colors.white,
                              fontFamily: 'PlayfairDisplay')),
                      Text('Vehicle: ${logistics.vehicleNumber}',
                          style: const TextStyle(fontSize: 12, color: Colors.white70)),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Route visual
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
                const Text('Route', style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                const SizedBox(height: 16),
                // Pickup
                _routeNode(
                  icon: Icons.circle,
                  color: AppColors.sage,
                  label: 'Pickup',
                  value: logistics.pickupAddress,
                ),
                // Route line
                Padding(
                  padding: const EdgeInsets.only(left: 11),
                  child: Column(
                    children: List.generate(3, (_) => Container(
                      width: 2,
                      height: 8,
                      margin: const EdgeInsets.symmetric(vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.borderSage,
                        borderRadius: BorderRadius.circular(1),
                      ),
                    )),
                  ),
                ),
                // Truck icon
                Padding(
                  padding: const EdgeInsets.only(left: 4),
                  child: Row(
                    children: [
                      Container(
                        width: 18,
                        height: 18,
                        decoration: const BoxDecoration(color: AppColors.amber, shape: BoxShape.circle),
                        child: const Icon(Icons.local_shipping, size: 10, color: Colors.white),
                      ),
                      const SizedBox(width: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.amberLight,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          '${Formatters.distance(logistics.distanceKm)} · In Transit',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.amber),
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 11),
                  child: Column(
                    children: List.generate(3, (_) => Container(
                      width: 2,
                      height: 8,
                      margin: const EdgeInsets.symmetric(vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.borderSage,
                        borderRadius: BorderRadius.circular(1),
                      ),
                    )),
                  ),
                ),
                // Delivery
                _routeNode(
                  icon: Icons.location_on,
                  color: AppColors.terracotta,
                  label: 'Delivery',
                  value: logistics.deliveryAddress,
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Driver info
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
                const Text('Driver Details', style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: AppColors.evergreenGradient,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(logistics.driverName[0],
                            style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(logistics.driverName,
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                          Text(logistics.vehicleNumber,
                              style: const TextStyle(fontSize: 12, color: AppColors.textMutedDash)),
                        ],
                      ),
                    ),
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: AppColors.paleSage,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.borderSage),
                      ),
                      child: const Icon(Icons.phone_outlined, color: AppColors.sage, size: 20),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _detailRow('Phone', logistics.driverPhone),
                _detailRow('Distance', Formatters.distance(logistics.distanceKm)),
                _detailRow('Transport Cost', '₹${logistics.cost.toStringAsFixed(0)}'),
              ],
            ),
          ),

          // Map placeholder
          const SizedBox(height: 16),
          Container(
            height: 160,
            decoration: BoxDecoration(
              color: AppColors.mintLight,
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              border: Border.all(color: AppColors.borderSage),
            ),
            child: Stack(
              children: [
                CustomPaint(
                  painter: _MockMapPainter(),
                  size: Size.infinite,
                ),
                const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.map_outlined, size: 36, color: AppColors.sage),
                      SizedBox(height: 8),
                      Text('Live tracking available in full app',
                          style: TextStyle(fontSize: 12, color: AppColors.textMutedDash, fontWeight: FontWeight.w500)),
                    ],
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

  Widget _routeNode({required IconData icon, required Color color, required String label, required String value}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: color, size: 22),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textMutedDash, fontWeight: FontWeight.w600)),
              Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.charcoal)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
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

class _MockMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final gridPaint = Paint()
      ..color = AppColors.sage.withOpacity(0.08)
      ..strokeWidth = 1;
    for (double x = 0; x < size.width; x += 20) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y < size.height; y += 20) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }
    // Route line
    final routePaint = Paint()
      ..color = AppColors.sage.withOpacity(0.4)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    final path = Path()
      ..moveTo(size.width * 0.1, size.height * 0.7)
      ..cubicTo(size.width * 0.3, size.height * 0.3, size.width * 0.6, size.height * 0.6, size.width * 0.9, size.height * 0.3);
    canvas.drawPath(path, routePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

import 'package:flutter/material.dart';
import '../../app/theme/app_colors.dart';

/// Reusable agricultural background widget.
/// Provides subtle field contours, leaf shapes, and gradients.
/// Never interferes with readability.
///
/// Usage:
///   AgriculturalBackground(isDark: true, child: ScreenContent())
class AgriculturalBackground extends StatelessWidget {
  final Widget child;
  final bool isDark;
  final double opacity;

  const AgriculturalBackground({
    super.key,
    required this.child,
    this.isDark = false,
    this.opacity = 1.0,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Base gradient
        Positioned.fill(
          child: Container(
            decoration: BoxDecoration(
              gradient: isDark
                  ? const LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [AppColors.darkBg, AppColors.greenDeep],
                    )
                  : const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [AppColors.ivoryBg, Color(0xFFF0EFE8)],
                    ),
            ),
          ),
        ),
        // Field contours (custom painter)
        Positioned.fill(
          child: CustomPaint(
            painter: _FieldContourPainter(isDark: isDark),
          ),
        ),
        // Content
        child,
      ],
    );
  }
}

class _FieldContourPainter extends CustomPainter {
  final bool isDark;
  const _FieldContourPainter({required this.isDark});

  @override
  void paint(Canvas canvas, Size size) {
    final color = isDark
        ? AppColors.greenAccent.withOpacity(0.04)
        : AppColors.sage.withOpacity(0.06);

    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    // Draw flowing field contour curves
    for (int i = 0; i < 5; i++) {
      final path = Path();
      final yOffset = size.height * (0.15 + i * 0.18);
      path.moveTo(0, yOffset);
      path.cubicTo(
        size.width * 0.25,
        yOffset - size.height * 0.06,
        size.width * 0.65,
        yOffset + size.height * 0.05,
        size.width,
        yOffset - size.height * 0.03,
      );
      canvas.drawPath(path, paint);
    }

    // Subtle leaf shapes in corners
    final leafColor = isDark
        ? AppColors.greenAccent.withOpacity(0.05)
        : AppColors.mint.withOpacity(0.08);
    final leafPaint = Paint()
      ..color = leafColor
      ..style = PaintingStyle.fill;

    _drawLeaf(canvas, leafPaint, Offset(size.width * 0.85, size.height * 0.1), 40, -0.3);
    _drawLeaf(canvas, leafPaint, Offset(size.width * 0.1, size.height * 0.88), 30, 0.5);
    _drawLeaf(canvas, leafPaint, Offset(size.width * 0.92, size.height * 0.75), 25, -1.2);
  }

  void _drawLeaf(Canvas canvas, Paint paint, Offset center, double size, double angle) {
    canvas.save();
    canvas.translate(center.dx, center.dy);
    canvas.rotate(angle);
    final path = Path()
      ..moveTo(0, -size)
      ..cubicTo(size * 0.6, -size * 0.5, size * 0.6, size * 0.5, 0, size)
      ..cubicTo(-size * 0.6, size * 0.5, -size * 0.6, -size * 0.5, 0, -size);
    canvas.drawPath(path, paint);
    canvas.restore();
  }

  @override
  bool shouldRepaint(_FieldContourPainter oldDelegate) =>
      oldDelegate.isDark != isDark;
}

/// Dark version specifically for splash/onboarding/login
class DarkAgriculturalBackground extends StatefulWidget {
  final Widget child;
  const DarkAgriculturalBackground({super.key, required this.child});

  @override
  State<DarkAgriculturalBackground> createState() => _DarkAgriculturalBackgroundState();
}

class _DarkAgriculturalBackgroundState extends State<DarkAgriculturalBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [AppColors.darkBg, AppColors.greenDeep],
              ),
            ),
          ),
        ),
        // Animated glow orbs
        AnimatedBuilder(
          animation: _controller,
          builder: (_, __) {
            final t = _controller.value;
            return Stack(
              children: [
                Positioned(
                  top: -100 + t * 30,
                  right: -80 + t * 20,
                  child: Container(
                    width: 300,
                    height: 300,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(colors: [
                        AppColors.greenAccent.withOpacity(0.12),
                        Colors.transparent,
                      ]),
                    ),
                  ),
                ),
                Positioned(
                  bottom: -60 + t * 20,
                  left: -100 + t * 15,
                  child: Container(
                    width: 250,
                    height: 250,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(colors: [
                        AppColors.gold.withOpacity(0.08),
                        Colors.transparent,
                      ]),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
        Positioned.fill(
          child: CustomPaint(painter: _FieldContourPainter(isDark: true)),
        ),
        widget.child,
      ],
    );
  }
}

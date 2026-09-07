import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/components/ks_button.dart';

class _OnboardPage {
  final String emoji;
  final String title;
  final String description;
  final List<Color> gradient;

  const _OnboardPage({
    required this.emoji,
    required this.title,
    required this.description,
    required this.gradient,
  });
}

const _pages = [
  _OnboardPage(
    emoji: '📊',
    title: 'Know Your Market',
    description: 'Compare crop prices across markets and understand where better opportunities exist.',
    gradient: [AppColors.darkBg, AppColors.greenDeep],
  ),
  _OnboardPage(
    emoji: '🤖',
    title: 'Sell Smarter',
    description: 'Get simple AI-based suggestions on where and when to sell your crops for the best price.',
    gradient: [AppColors.greenDeep, AppColors.greenRich],
  ),
  _OnboardPage(
    emoji: '🤝',
    title: 'Find Better Buyers',
    description: 'Connect with verified buyers and compare offers before you decide to sell.',
    gradient: [AppColors.greenRich, AppColors.darkBg],
  ),
];

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> with TickerProviderStateMixin {
  final _pageCtrl = PageController();
  int _currentPage = 0;
  late AnimationController _entryCtrl;

  @override
  void initState() {
    super.initState();
    _entryCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 500));
    _entryCtrl.forward();
  }

  @override
  void dispose() {
    _pageCtrl.dispose();
    _entryCtrl.dispose();
    super.dispose();
  }

  Future<void> _finish() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(AppConstants.keyOnboardingSeen, true);
    if (mounted) context.go('/login');
  }

  void _next() {
    if (_currentPage < _pages.length - 1) {
      _pageCtrl.nextPage(
        duration: AppTheme.durationMedium,
        curve: Curves.easeInOut,
      );
    } else {
      _finish();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Animated page background
          AnimatedContainer(
            duration: AppTheme.durationMedium,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: _pages[_currentPage].gradient,
              ),
            ),
          ),
          // Background pattern
          const Positioned.fill(
            child: _FieldPattern(),
          ),
          SafeArea(
            child: Column(
              children: [
                // Skip button
                Align(
                  alignment: Alignment.topRight,
                  child: TextButton(
                    onPressed: _finish,
                    child: const Text(
                      'Skip',
                      style: TextStyle(color: Colors.white60, fontSize: 14, fontWeight: FontWeight.w500),
                    ),
                  ),
                ),
                // Pages
                Expanded(
                  child: PageView.builder(
                    controller: _pageCtrl,
                    onPageChanged: (i) => setState(() => _currentPage = i),
                    itemCount: _pages.length,
                    itemBuilder: (_, i) => _OnboardPageView(page: _pages[i]),
                  ),
                ),
                // Indicators + button
                Padding(
                  padding: const EdgeInsets.fromLTRB(32, 0, 32, 40),
                  child: Column(
                    children: [
                      // Dots
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(_pages.length, (i) {
                          return AnimatedContainer(
                            duration: AppTheme.durationFast,
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            width: _currentPage == i ? 24 : 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: _currentPage == i
                                  ? AppColors.greenAccent
                                  : Colors.white.withOpacity(0.3),
                              borderRadius: BorderRadius.circular(999),
                            ),
                          );
                        }),
                      ),
                      const SizedBox(height: 32),
                      // Button
                      KsButton(
                        label: _currentPage == _pages.length - 1 ? 'Get Started' : 'Next',
                        onTap: _next,
                        variant: KsButtonVariant.primary,
                        icon: _currentPage == _pages.length - 1 ? Icons.arrow_forward : null,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _OnboardPageView extends StatefulWidget {
  final _OnboardPage page;
  const _OnboardPageView({required this.page});

  @override
  State<_OnboardPageView> createState() => _OnboardPageViewState();
}

class _OnboardPageViewState extends State<_OnboardPageView> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _opacity;
  late Animation<Offset> _slide;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 500));
    _opacity = Tween(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeIn));
    _slide = Tween(begin: const Offset(0, 0.15), end: Offset.zero).animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _opacity,
      child: SlideTransition(
        position: _slide,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Emoji illustration
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: AppColors.greenAccent.withOpacity(0.15),
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.greenAccent.withOpacity(0.3), width: 2),
                ),
                child: Center(
                  child: Text(widget.page.emoji, style: const TextStyle(fontSize: 56)),
                ),
              ),
              const SizedBox(height: 40),
              Text(
                widget.page.title,
                style: const TextStyle(
                  fontFamily: 'PlayfairDisplay',
                  fontSize: 30,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                  height: 1.2,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text(
                widget.page.description,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white.withOpacity(0.75),
                  height: 1.6,
                  fontWeight: FontWeight.w300,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FieldPattern extends StatelessWidget {
  const _FieldPattern();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(painter: _FieldContourPainterDark());
  }
}

class _FieldContourPainterDark extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.greenAccent.withOpacity(0.04)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    for (int i = 0; i < 6; i++) {
      final path = Path();
      final y = size.height * (0.1 + i * 0.17);
      path.moveTo(0, y);
      path.cubicTo(size.width * 0.3, y - size.height * 0.06,
          size.width * 0.7, y + size.height * 0.06, size.width, y - 0.02);
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

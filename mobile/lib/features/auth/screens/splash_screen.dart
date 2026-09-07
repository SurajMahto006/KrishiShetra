import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../app/theme/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/agricultural_background.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _logoCtrl;
  late AnimationController _textCtrl;
  late AnimationController _taglineCtrl;

  late Animation<double> _logoScale;
  late Animation<double> _logoOpacity;
  late Animation<double> _textOpacity;
  late Animation<Offset> _textSlide;
  late Animation<double> _taglineOpacity;

  @override
  void initState() {
    super.initState();

    _logoCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 900));
    _textCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 700));
    _taglineCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));

    _logoScale   = CurvedAnimation(parent: _logoCtrl, curve: Curves.easeOutBack).drive(Tween(begin: 0.3, end: 1.0));
    _logoOpacity = CurvedAnimation(parent: _logoCtrl, curve: Curves.easeIn).drive(Tween(begin: 0.0, end: 1.0));

    _textOpacity = CurvedAnimation(parent: _textCtrl, curve: Curves.easeIn).drive(Tween(begin: 0.0, end: 1.0));
    _textSlide   = CurvedAnimation(parent: _textCtrl, curve: Curves.easeOut)
        .drive(Tween(begin: const Offset(0, 0.4), end: Offset.zero));

    _taglineOpacity = CurvedAnimation(parent: _taglineCtrl, curve: Curves.easeIn)
        .drive(Tween(begin: 0.0, end: 1.0));

    _startAnimations();
  }

  Future<void> _startAnimations() async {
    await Future.delayed(const Duration(milliseconds: 200));
    _logoCtrl.forward();
    await Future.delayed(const Duration(milliseconds: 500));
    _textCtrl.forward();
    await Future.delayed(const Duration(milliseconds: 400));
    _taglineCtrl.forward();
    await Future.delayed(const Duration(milliseconds: 1800));
    _navigate();
  }

  Future<void> _navigate() async {
    if (!mounted) return;
    final prefs = await SharedPreferences.getInstance();
    final seen  = prefs.getBool(AppConstants.keyOnboardingSeen) ?? false;
    final loggedIn = prefs.getBool(AppConstants.keyLoggedIn) ?? false;

    if (!mounted) return;
    if (loggedIn) {
      context.go('/home');
    } else if (seen) {
      context.go('/login');
    } else {
      context.go('/onboarding');
    }
  }

  @override
  void dispose() {
    _logoCtrl.dispose();
    _textCtrl.dispose();
    _taglineCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: DarkAgriculturalBackground(
        child: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(flex: 2),
                // Logo icon
                ScaleTransition(
                  scale: _logoScale,
                  child: FadeTransition(
                    opacity: _logoOpacity,
                    child: Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        gradient: AppColors.evergreenGradient,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.greenAccent.withOpacity(0.4),
                            blurRadius: 32,
                            spreadRadius: 4,
                          ),
                        ],
                      ),
                      child: const Icon(Icons.eco_outlined, size: 48, color: Colors.white),
                    ),
                  ),
                ),
                const SizedBox(height: 28),
                // App name
                SlideTransition(
                  position: _textSlide,
                  child: FadeTransition(
                    opacity: _textOpacity,
                    child: const Text(
                      AppConstants.appName,
                      style: TextStyle(
                        fontFamily: 'PlayfairDisplay',
                        fontSize: 38,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                // Tagline
                FadeTransition(
                  opacity: _taglineOpacity,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
                    decoration: BoxDecoration(
                      color: AppColors.greenAccent.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: AppColors.greenAccent.withOpacity(0.3)),
                    ),
                    child: const Text(
                      AppConstants.tagline,
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.greenLight,
                        fontWeight: FontWeight.w500,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ),
                ),
                const Spacer(flex: 2),
                // Bottom loading dots
                FadeTransition(
                  opacity: _taglineOpacity,
                  child: const _PulsingDots(),
                ),
                const SizedBox(height: 48),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _PulsingDots extends StatefulWidget {
  const _PulsingDots();

  @override
  State<_PulsingDots> createState() => _PulsingDotsState();
}

class _PulsingDotsState extends State<_PulsingDots> with TickerProviderStateMixin {
  late List<AnimationController> _controllers;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(3, (i) => AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    ));
    for (int i = 0; i < 3; i++) {
      Future.delayed(Duration(milliseconds: i * 180), () {
        if (mounted) _controllers[i].repeat(reverse: true);
      });
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(3, (i) {
        return AnimatedBuilder(
          animation: _controllers[i],
          builder: (_, __) => Container(
            margin: const EdgeInsets.symmetric(horizontal: 3),
            width: 6,
            height: 6 + _controllers[i].value * 4,
            decoration: BoxDecoration(
              color: AppColors.greenAccent.withOpacity(0.5 + _controllers[i].value * 0.5),
              borderRadius: BorderRadius.circular(999),
            ),
          ),
        );
      }),
    );
  }
}

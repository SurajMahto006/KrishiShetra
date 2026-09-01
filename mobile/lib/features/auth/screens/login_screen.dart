import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';
import '../../../shared/widgets/agricultural_background.dart';
import '../../../shared/components/ks_button.dart';

enum _LoginStep { phone, otp }

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with TickerProviderStateMixin {
  _LoginStep _step = _LoginStep.phone;
  final _phoneCtrl = TextEditingController();
  final List<TextEditingController> _otpCtrls = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _otpFocus = List.generate(6, (_) => FocusNode());

  bool _loading = false;
  String? _error;
  String _language = 'EN';

  late AnimationController _cardCtrl;
  late Animation<double> _cardOpacity;
  late Animation<Offset> _cardSlide;

  @override
  void initState() {
    super.initState();
    _cardCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _cardOpacity = Tween(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _cardCtrl, curve: Curves.easeIn));
    _cardSlide = Tween(begin: const Offset(0, 0.3), end: Offset.zero)
        .animate(CurvedAnimation(parent: _cardCtrl, curve: Curves.easeOut));
    _cardCtrl.forward();
  }

  @override
  void dispose() {
    _cardCtrl.dispose();
    _phoneCtrl.dispose();
    for (final c in _otpCtrls) c.dispose();
    for (final f in _otpFocus) f.dispose();
    super.dispose();
  }

  Future<void> _sendOtp() async {
    if (_phoneCtrl.text.length < 10) {
      setState(() => _error = 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setState(() { _loading = true; _error = null; });
    await Future.delayed(const Duration(milliseconds: 1200));
    if (!mounted) return;
    setState(() { _loading = false; _step = _LoginStep.otp; });
    Future.delayed(const Duration(milliseconds: 100), () => _otpFocus[0].requestFocus());
  }

  Future<void> _verifyOtp() async {
    final otp = _otpCtrls.map((c) => c.text).join();
    if (otp.length < 6) {
      setState(() => _error = 'Please enter the 6-digit OTP.');
      return;
    }
    setState(() { _loading = true; _error = null; });
    await Future.delayed(const Duration(milliseconds: 1200));
    if (!mounted) return;
    // Demo: any OTP works
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(AppConstants.keyLoggedIn, true);
    if (mounted) context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: DarkAgriculturalBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: FadeTransition(
              opacity: _cardOpacity,
              child: SlideTransition(
                position: _cardSlide,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 24),
                    // Language selector
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        _LangChip(label: 'EN',  selected: _language == 'EN',  onTap: () => setState(() => _language = 'EN')),
                        const SizedBox(width: 8),
                        _LangChip(label: 'हि',  selected: _language == 'HI',  onTap: () => setState(() => _language = 'HI')),
                        const SizedBox(width: 8),
                        _LangChip(label: 'मर', selected: _language == 'MR', onTap: () => setState(() => _language = 'MR')),
                      ],
                    ),
                    const SizedBox(height: 40),
                    // Logo + headline
                    Row(
                      children: [
                        Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            gradient: AppColors.evergreenGradient,
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(color: AppColors.greenAccent.withOpacity(0.35), blurRadius: 20),
                            ],
                          ),
                          child: const Icon(Icons.eco_outlined, color: Colors.white, size: 26),
                        ),
                        const SizedBox(width: 14),
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(AppConstants.appName,
                                style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 26, fontWeight: FontWeight.w700, color: Colors.white)),
                            Text('Your market intelligence platform',
                                style: TextStyle(fontSize: 12, color: Colors.white60)),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 48),
                    // Card
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: AppColors.darkCard.withOpacity(0.85),
                        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                        border: Border.all(color: Colors.white.withOpacity(0.08)),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.25), blurRadius: 40, offset: const Offset(0, 16)),
                        ],
                      ),
                      child: AnimatedSwitcher(
                        duration: AppTheme.durationMedium,
                        child: _step == _LoginStep.phone ? _buildPhoneStep() : _buildOtpStep(),
                      ),
                    ),
                    const SizedBox(height: 32),
                    // Trust line
                    Center(
                      child: Text(
                        '🔒  Secure login · No account creation needed',
                        style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.45)),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPhoneStep() {
    return Column(
      key: const ValueKey('phone'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Enter Mobile Number',
            style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
        const SizedBox(height: 6),
        Text("We'll send you a verification code.",
            style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.6))),
        const SizedBox(height: 24),
        // Phone field
        Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.06),
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
            border: Border.all(color: Colors.white.withOpacity(0.12)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                child: Text('+91', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 16, fontWeight: FontWeight.w600)),
              ),
              Container(width: 1, height: 24, color: Colors.white.withOpacity(0.12)),
              Expanded(
                child: TextField(
                  controller: _phoneCtrl,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(10)],
                  style: const TextStyle(color: Colors.white, fontSize: 16, letterSpacing: 1),
                  decoration: const InputDecoration(
                    hintText: '98765 43210',
                    hintStyle: TextStyle(color: Colors.white30, fontSize: 15),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                    fillColor: Colors.transparent,
                    filled: true,
                  ),
                  onSubmitted: (_) => _sendOtp(),
                ),
              ),
            ],
          ),
        ),
        if (_error != null) ...[
          const SizedBox(height: 8),
          Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 12)),
        ],
        const SizedBox(height: 24),
        KsButton(label: 'Send OTP', onTap: _sendOtp, loading: _loading),
        const SizedBox(height: 16),
        Center(
          child: TextButton(
            onPressed: () async {
              // Demo quick login
              final prefs = await SharedPreferences.getInstance();
              await prefs.setBool(AppConstants.keyLoggedIn, true);
              if (mounted) context.go('/home');
            },
            child: Text('Demo Login (skip OTP)', style: TextStyle(color: AppColors.goldLight.withOpacity(0.8), fontSize: 13)),
          ),
        ),
      ],
    );
  }

  Widget _buildOtpStep() {
    return Column(
      key: const ValueKey('otp'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            GestureDetector(
              onTap: () => setState(() => _step = _LoginStep.phone),
              child: const Icon(Icons.arrow_back, color: Colors.white60, size: 20),
            ),
            const SizedBox(width: 10),
            const Text('Verify OTP',
                style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 22, fontWeight: FontWeight.w700, color: Colors.white)),
          ],
        ),
        const SizedBox(height: 6),
        Text(
          'Enter the 6-digit code sent to +91 ${_phoneCtrl.text}',
          style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.6)),
        ),
        const SizedBox(height: 28),
        // OTP boxes
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(6, (i) {
            return SizedBox(
              width: 44,
              height: 52,
              child: TextField(
                controller: _otpCtrls[i],
                focusNode: _otpFocus[i],
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                maxLength: 1,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700),
                decoration: InputDecoration(
                  counterText: '',
                  filled: true,
                  fillColor: Colors.white.withOpacity(0.07),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                    borderSide: BorderSide(color: Colors.white.withOpacity(0.15)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                    borderSide: BorderSide(color: Colors.white.withOpacity(0.15)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                    borderSide: const BorderSide(color: AppColors.greenAccent, width: 1.5),
                  ),
                ),
                onChanged: (v) {
                  if (v.isNotEmpty && i < 5) {
                    _otpFocus[i + 1].requestFocus();
                  } else if (v.isEmpty && i > 0) {
                    _otpFocus[i - 1].requestFocus();
                  }
                  if (i == 5 && v.isNotEmpty) _verifyOtp();
                },
              ),
            );
          }),
        ),
        if (_error != null) ...[
          const SizedBox(height: 8),
          Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 12)),
        ],
        const SizedBox(height: 28),
        KsButton(label: 'Verify & Login', onTap: _verifyOtp, loading: _loading),
        const SizedBox(height: 12),
        Center(
          child: TextButton(
            onPressed: () {
              for (final c in _otpCtrls) c.clear();
              _otpFocus[0].requestFocus();
            },
            child: Text('Resend OTP', style: TextStyle(color: AppColors.greenLight.withOpacity(0.8), fontSize: 13)),
          ),
        ),
      ],
    );
  }
}

class _LangChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _LangChip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: AppTheme.durationFast,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? AppColors.greenAccent.withOpacity(0.2) : Colors.transparent,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: selected ? AppColors.greenAccent : Colors.white24,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: selected ? AppColors.greenLight : Colors.white60,
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';

/// KrishiShetra Design System — Color Tokens
/// Derived from the existing web application's CSS custom properties.
abstract class AppColors {
  // ── Dark Palette (Splash / Onboarding / Login / Dark surfaces) ──
  static const Color darkBg        = Color(0xFF0D1A14);
  static const Color darkCard      = Color(0xFF142720);
  static const Color darkSurface   = Color(0xFF1A332A);
  static const Color greenDeep     = Color(0xFF1A3A2A);
  static const Color greenRich     = Color(0xFF2D5A3D);
  static const Color greenAccent   = Color(0xFF4A9D6E);
  static const Color greenLight    = Color(0xFF6BC48F);
  static const Color greenGlow     = Color(0xFF3DDC84);

  // ── Gold Palette ──
  static const Color gold          = Color(0xFFD4A843);
  static const Color goldLight     = Color(0xFFF0D78C);
  static const Color goldWarm      = Color(0xFFE8B94A);

  // ── Cream / Light ──
  static const Color cream         = Color(0xFFFAF5EB);
  static const Color creamDark     = Color(0xFFF2EAD8);

  // ── Dashboard / Light Theme Palette ──
  static const Color ivoryBg       = Color(0xFFF5F4ED);
  static const Color cardWhite     = Color(0xFFFFFFFF);
  static const Color evergreen     = Color(0xFF12372A);
  static const Color evergreenLight = Color(0xFF1A4D3B);
  static const Color sage          = Color(0xFF5B9A72);
  static const Color sageHover     = Color(0xFF4C8561);
  static const Color mint          = Color(0xFF8FCB9B);
  static const Color mintLight     = Color(0xFFEAF6ED);
  static const Color paleSage      = Color(0xFFE5F0E7);
  static const Color charcoal      = Color(0xFF17221D);
  static const Color amber         = Color(0xFFD6A84F);
  static const Color amberLight    = Color(0xFFFDF7EA);
  static const Color terracotta    = Color(0xFFC96D5B);
  static const Color terracottaLight = Color(0xFFFBEFEF);

  // ── Semantic ──
  static const Color error         = Color(0xFFE74C3C);
  static const Color warning       = Color(0xFFF39C12);
  static const Color success       = Color(0xFF27AE60);
  static const Color info          = Color(0xFF2980B9);

  // ── Text ──
  static const Color textDark      = Color(0xFF2A2A2A);
  static const Color textLight     = Color(0xFFF0ECE4);
  static const Color textMuted     = Color(0xFF8A9B93);
  static const Color textMutedLight = Color(0xFFB0BFB7);
  static const Color textOnDark    = Color(0xFFFFFFFF);
  static const Color textMutedDash = Color(0xFF6F7F75);

  // ── Borders ──
  static const Color borderDark    = Color(0x14FFFFFF); // rgba(255,255,255,0.08)
  static const Color borderLight   = Color(0x0F000000); // rgba(0,0,0,0.06)
  static const Color borderDash    = Color(0xFFE2E0D5);
  static const Color borderSage    = Color(0xFFD2E4D6);

  // ── Demand status colours ──
  static const Color demandHigh    = Color(0xFF27AE60);
  static const Color demandMedium  = Color(0xFFE8B94A);
  static const Color demandLow     = Color(0xFFE74C3C);

  // ── Gradients ──
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [greenAccent, greenRich],
  );

  static const LinearGradient goldGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [gold, goldWarm],
  );

  static const LinearGradient darkGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [darkBg, greenDeep],
  );

  static const LinearGradient cardGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [darkCard, darkSurface],
  );

  static const LinearGradient evergreenGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [evergreen, evergreenLight],
  );
}

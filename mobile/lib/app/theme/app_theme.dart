import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// KrishiShetra centralized ThemeData.
/// The app uses a light theme for the main authenticated screens
/// and dark overlays for splash/onboarding/login.
class AppTheme {
  static const double radiusSm  = 8.0;
  static const double radiusMd  = 14.0;
  static const double radiusLg  = 20.0;
  static const double radiusXl  = 28.0;
  static const double radiusFull = 999.0;

  static const Duration durationFast   = Duration(milliseconds: 200);
  static const Duration durationMedium = Duration(milliseconds: 350);
  static const Duration durationSlow   = Duration(milliseconds: 600);

  static BoxShadow get shadowSm => const BoxShadow(
    color: Color(0x0A12372A),
    blurRadius: 6,
    offset: Offset(0, 2),
  );
  static BoxShadow get shadowMd => const BoxShadow(
    color: Color(0x0F12372A),
    blurRadius: 20,
    offset: Offset(0, 8),
  );
  static BoxShadow get shadowLg => const BoxShadow(
    color: Color(0x1A12372A),
    blurRadius: 36,
    offset: Offset(0, 16),
  );
  static BoxShadow get shadowGreen => const BoxShadow(
    color: Color(0x264A9D6E),
    blurRadius: 24,
    offset: Offset(0, 8),
  );
  static BoxShadow get shadowGold => const BoxShadow(
    color: Color(0x33D4A843),
    blurRadius: 24,
    offset: Offset(0, 8),
  );

  static ThemeData get lightTheme {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.ivoryBg,
    );

    return base.copyWith(
      colorScheme: const ColorScheme.light(
        primary: AppColors.evergreen,
        onPrimary: Colors.white,
        primaryContainer: AppColors.mintLight,
        onPrimaryContainer: AppColors.evergreen,
        secondary: AppColors.sage,
        onSecondary: Colors.white,
        secondaryContainer: AppColors.paleSage,
        onSecondaryContainer: AppColors.evergreen,
        tertiary: AppColors.amber,
        onTertiary: Colors.white,
        error: AppColors.error,
        onError: Colors.white,
        surface: AppColors.cardWhite,
        onSurface: AppColors.charcoal,
        surfaceContainerHighest: AppColors.ivoryBg,
        outline: AppColors.borderDash,
        outlineVariant: AppColors.borderSage,
      ),
      textTheme: GoogleFonts.interTextTheme(base.textTheme).copyWith(
        displayLarge: const TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 36, fontWeight: FontWeight.w700, color: AppColors.evergreen, letterSpacing: -0.5, height: 1.1),
        displayMedium: const TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.evergreen, letterSpacing: -0.3, height: 1.15),
        displaySmall: const TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 24, fontWeight: FontWeight.w600, color: AppColors.evergreen, height: 1.2),
        headlineLarge: const TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 22, fontWeight: FontWeight.w600, color: AppColors.evergreen, height: 1.25),
        headlineMedium: const TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 20, fontWeight: FontWeight.w600, color: AppColors.evergreen, height: 1.3),
        headlineSmall: const TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.evergreen, height: 1.3),
        titleLarge: TextStyle(fontFamily: GoogleFonts.inter().fontFamily, fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.charcoal),
        titleMedium: TextStyle(fontFamily: GoogleFonts.inter().fontFamily, fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.charcoal),
        titleSmall: TextStyle(fontFamily: GoogleFonts.inter().fontFamily, fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.charcoal),
        bodyLarge: TextStyle(fontFamily: GoogleFonts.inter().fontFamily, fontSize: 16, fontWeight: FontWeight.w400, color: AppColors.charcoal, height: 1.6),
        bodyMedium: TextStyle(fontFamily: GoogleFonts.inter().fontFamily, fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textMutedDash, height: 1.5),
        bodySmall: TextStyle(fontFamily: GoogleFonts.inter().fontFamily, fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textMutedDash, height: 1.4),
        labelLarge: TextStyle(fontFamily: GoogleFonts.inter().fontFamily, fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.evergreen),
        labelMedium: TextStyle(fontFamily: GoogleFonts.inter().fontFamily, fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textMutedDash, letterSpacing: 0.5),
        labelSmall: TextStyle(fontFamily: GoogleFonts.inter().fontFamily, fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.textMutedDash, letterSpacing: 0.8),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.ivoryBg,
        foregroundColor: AppColors.evergreen,
        elevation: 0,
        scrolledUnderElevation: 1,
        shadowColor: Color(0x1A12372A),
        surfaceTintColor: Colors.transparent,
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
          statusBarBrightness: Brightness.light,
        ),
        titleTextStyle: TextStyle(
          fontFamily: 'PlayfairDisplay',
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: AppColors.evergreen,
        ),
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: AppColors.cardWhite,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusMd),
          side: const BorderSide(color: AppColors.borderDash, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.evergreen,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radiusFull)),
          textStyle: TextStyle(
            fontFamily: GoogleFonts.inter().fontFamily,
            fontSize: 15,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.2,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.evergreen,
          side: const BorderSide(color: AppColors.evergreen, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radiusFull)),
          textStyle: TextStyle(
            fontFamily: GoogleFonts.inter().fontFamily,
            fontSize: 15,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.2,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.sage,
          textStyle: TextStyle(
            fontFamily: GoogleFonts.inter().fontFamily,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.cardWhite,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMd),
          borderSide: const BorderSide(color: AppColors.borderDash),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMd),
          borderSide: const BorderSide(color: AppColors.borderDash),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMd),
          borderSide: const BorderSide(color: AppColors.sage, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMd),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        hintStyle: TextStyle(
          fontFamily: GoogleFonts.inter().fontFamily,
          fontSize: 15,
          color: AppColors.textMutedDash,
        ),
        labelStyle: TextStyle(
          fontFamily: GoogleFonts.inter().fontFamily,
          fontSize: 14,
          color: AppColors.textMutedDash,
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.paleSage,
        selectedColor: AppColors.evergreen,
        labelStyle: TextStyle(
          fontFamily: GoogleFonts.inter().fontFamily,
          fontSize: 13,
          fontWeight: FontWeight.w500,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusFull),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.cardWhite,
        selectedItemColor: AppColors.evergreen,
        unselectedItemColor: AppColors.textMutedDash,
        elevation: 0,
        type: BottomNavigationBarType.fixed,
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.borderDash,
        thickness: 1,
        space: 0,
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.greenAccent,
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.evergreen,
        contentTextStyle: TextStyle(
          fontFamily: GoogleFonts.inter().fontFamily,
          color: Colors.white,
          fontSize: 14,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radiusMd)),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// KrishiShetra Typography System
/// Playfair Display for headings, Inter for body text.
abstract class AppTextStyles {
  // ── Display / Headings (Playfair Display) ──
  static TextStyle display({Color color = AppColors.textLight, double? fontSize}) =>
      TextStyle(
        fontFamily: 'PlayfairDisplay',
        fontSize: fontSize ?? 36,
        fontWeight: FontWeight.w700,
        color: color,
        height: 1.1,
        letterSpacing: -0.5,
      );

  static TextStyle h1({Color color = AppColors.textLight, double? fontSize}) =>
      TextStyle(
        fontFamily: 'PlayfairDisplay',
        fontSize: fontSize ?? 28,
        fontWeight: FontWeight.w700,
        color: color,
        height: 1.15,
        letterSpacing: -0.3,
      );

  static TextStyle h2({Color color = AppColors.textLight, double? fontSize}) =>
      TextStyle(
        fontFamily: 'PlayfairDisplay',
        fontSize: fontSize ?? 24,
        fontWeight: FontWeight.w600,
        color: color,
        height: 1.2,
      );

  static TextStyle h3({Color color = AppColors.textLight, double? fontSize}) =>
      TextStyle(
        fontFamily: 'PlayfairDisplay',
        fontSize: fontSize ?? 20,
        fontWeight: FontWeight.w600,
        color: color,
        height: 1.3,
      );

  // ── Body (Inter via google_fonts) ──
  static TextStyle bodyLarge({Color color = AppColors.textLight}) =>
      GoogleFonts.inter(
        fontSize: 17,
        fontWeight: FontWeight.w400,
        color: color,
        height: 1.6,
      );

  static TextStyle body({Color color = AppColors.textLight}) =>
      GoogleFonts.inter(
        fontSize: 15,
        fontWeight: FontWeight.w400,
        color: color,
        height: 1.5,
      );

  static TextStyle bodySmall({Color color = AppColors.textMuted}) =>
      GoogleFonts.inter(
        fontSize: 13,
        fontWeight: FontWeight.w400,
        color: color,
        height: 1.4,
      );

  static TextStyle label({Color color = AppColors.textMuted}) =>
      GoogleFonts.inter(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        color: color,
        letterSpacing: 0.6,
        height: 1.4,
      );

  static TextStyle labelMedium({Color color = AppColors.textMuted}) =>
      GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: color,
        letterSpacing: 0.4,
        height: 1.4,
      );

  // ── Emphasis ──
  static TextStyle priceLarge({Color color = AppColors.textLight}) =>
      GoogleFonts.inter(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        color: color,
        height: 1.1,
        letterSpacing: -0.5,
      );

  static TextStyle priceMedium({Color color = AppColors.textLight}) =>
      GoogleFonts.inter(
        fontSize: 20,
        fontWeight: FontWeight.w700,
        color: color,
        height: 1.15,
      );

  static TextStyle priceSmall({Color color = AppColors.greenAccent}) =>
      GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: color,
        height: 1.2,
      );

  static TextStyle badge({Color color = AppColors.textOnDark}) =>
      GoogleFonts.inter(
        fontSize: 10,
        fontWeight: FontWeight.w700,
        color: color,
        letterSpacing: 0.8,
      );

  static TextStyle buttonText({Color color = AppColors.textOnDark}) =>
      GoogleFonts.inter(
        fontSize: 15,
        fontWeight: FontWeight.w600,
        color: color,
        letterSpacing: 0.2,
      );

  static TextStyle caption({Color color = AppColors.textMuted}) =>
      GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: color,
        letterSpacing: 0.3,
      );

  // ── Navigation label ──
  static TextStyle navLabel({Color color = AppColors.textMuted}) =>
      GoogleFonts.inter(
        fontSize: 10,
        fontWeight: FontWeight.w600,
        color: color,
        letterSpacing: 0.2,
      );
}

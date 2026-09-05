import 'package:flutter/material.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_theme.dart';

enum KsButtonVariant { primary, secondary, outlined, gold, danger }

class KsButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final KsButtonVariant variant;
  final IconData? icon;
  final bool loading;
  final bool expanded;
  final double? height;

  const KsButton({
    super.key,
    required this.label,
    this.onTap,
    this.variant = KsButtonVariant.primary,
    this.icon,
    this.loading = false,
    this.expanded = true,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    Widget content = loading
        ? const SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 18, color: _fgColor),
                const SizedBox(width: 8),
              ],
              Text(
                label,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: _fgColor,
                  letterSpacing: 0.2,
                ),
              ),
            ],
          );

    Widget button = GestureDetector(
      onTap: loading ? null : onTap,
      child: AnimatedContainer(
        duration: AppTheme.durationFast,
        height: height ?? 52,
        padding: const EdgeInsets.symmetric(horizontal: 24),
        decoration: BoxDecoration(
          gradient: _gradient,
          color: _gradient == null ? _bgColor : null,
          borderRadius: BorderRadius.circular(AppTheme.radiusFull),
          border: _border,
          boxShadow: onTap != null && !loading ? [_shadow] : [],
        ),
        child: Center(child: content),
      ),
    );

    return expanded ? SizedBox(width: double.infinity, child: button) : button;
  }

  LinearGradient? get _gradient {
    switch (variant) {
      case KsButtonVariant.primary:
        return AppColors.evergreenGradient;
      case KsButtonVariant.gold:
        return AppColors.goldGradient;
      default:
        return null;
    }
  }

  Color get _bgColor {
    switch (variant) {
      case KsButtonVariant.secondary:
        return AppColors.mintLight;
      case KsButtonVariant.outlined:
        return Colors.transparent;
      case KsButtonVariant.danger:
        return AppColors.error;
      default:
        return AppColors.evergreen;
    }
  }

  Color get _fgColor {
    switch (variant) {
      case KsButtonVariant.outlined:
        return AppColors.evergreen;
      case KsButtonVariant.secondary:
        return AppColors.evergreen;
      case KsButtonVariant.gold:
        return AppColors.darkBg;
      default:
        return Colors.white;
    }
  }

  Border? get _border {
    if (variant == KsButtonVariant.outlined) {
      return Border.all(color: AppColors.evergreen, width: 1.5);
    }
    return null;
  }

  BoxShadow get _shadow {
    switch (variant) {
      case KsButtonVariant.gold:
        return AppTheme.shadowGold;
      default:
        return AppTheme.shadowGreen;
    }
  }
}

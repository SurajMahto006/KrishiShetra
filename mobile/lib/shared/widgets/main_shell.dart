import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/providers.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_theme.dart';

class MainShell extends ConsumerWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  static const _tabs = [
    _TabItem(label: 'Home',   icon: Icons.home_outlined,     activeIcon: Icons.home,          route: '/home'),
    _TabItem(label: 'Market', icon: Icons.bar_chart_outlined, activeIcon: Icons.bar_chart,     route: '/market'),
    _TabItem(label: 'Sell',   icon: Icons.add_circle_outline, activeIcon: Icons.add_circle,    route: '/sell', isFab: true),
    _TabItem(label: 'Offers', icon: Icons.handshake_outlined, activeIcon: Icons.handshake,     route: '/offers'),
    _TabItem(label: 'Profile',icon: Icons.person_outline,    activeIcon: Icons.person,         route: '/profile'),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = ref.watch(navIndexProvider);

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.cardWhite,
          border: const Border(top: BorderSide(color: AppColors.borderDash, width: 1)),
          boxShadow: [
            BoxShadow(
              color: AppColors.evergreen.withOpacity(0.06),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: Row(
              children: List.generate(_tabs.length, (i) {
                final tab = _tabs[i];
                final isActive = currentIndex == i;

                if (tab.isFab) {
                  return Expanded(
                    child: GestureDetector(
                      onTap: () {
                        ref.read(navIndexProvider.notifier).state = i;
                        context.go(tab.route);
                      },
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 52,
                            height: 52,
                            decoration: BoxDecoration(
                              gradient: AppColors.evergreenGradient,
                              shape: BoxShape.circle,
                              boxShadow: [AppTheme.shadowGreen],
                            ),
                            child: const Icon(Icons.add, color: Colors.white, size: 26),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            tab.label,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: isActive ? AppColors.evergreen : AppColors.textMutedDash,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }

                return Expanded(
                  child: GestureDetector(
                    onTap: () {
                      ref.read(navIndexProvider.notifier).state = i;
                      context.go(tab.route);
                    },
                    behavior: HitTestBehavior.opaque,
                    child: AnimatedContainer(
                      duration: AppTheme.durationFast,
                      padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
                      decoration: BoxDecoration(
                        color: isActive ? AppColors.mintLight : Colors.transparent,
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            isActive ? tab.activeIcon : tab.icon,
                            size: 22,
                            color: isActive ? AppColors.evergreen : AppColors.textMutedDash,
                          ),
                          const SizedBox(height: 3),
                          Text(
                            tab.label,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                              color: isActive ? AppColors.evergreen : AppColors.textMutedDash,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}

class _TabItem {
  final String label;
  final IconData icon;
  final IconData activeIcon;
  final String route;
  final bool isFab;
  const _TabItem({
    required this.label,
    required this.icon,
    required this.activeIcon,
    required this.route,
    this.isFab = false,
  });
}

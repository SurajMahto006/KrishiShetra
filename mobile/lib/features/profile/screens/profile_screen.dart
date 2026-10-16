import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';
import '../../../data/mock/mock_users.dart';
import '../../../shared/widgets/agricultural_background.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Future<void> _logout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Log Out', style: TextStyle(fontFamily: 'PlayfairDisplay', fontWeight: FontWeight.w700)),
        content: const Text('Are you sure you want to log out?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error, foregroundColor: Colors.white),
            child: const Text('Log Out'),
          ),
        ],
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
      ),
    );
    if (confirmed == true) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(AppConstants.keyLoggedIn, false);
      if (context.mounted) context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = MockUsers.currentFarmer;

    return Scaffold(
      backgroundColor: AppColors.ivoryBg,
      body: AgriculturalBackground(
        child: SafeArea(
          child: ListView(
            children: [
              // Profile header
              Container(
                margin: const EdgeInsets.all(20),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: AppColors.evergreenGradient,
                  borderRadius: BorderRadius.circular(AppTheme.radiusLg),
                  boxShadow: [AppTheme.shadowGreen],
                ),
                child: Column(
                  children: [
                    // Avatar
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white.withOpacity(0.4), width: 2),
                      ),
                      child: Center(
                        child: Text(
                          user.avatarInitials,
                          style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w700, color: Colors.white),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(user.name,
                        style: const TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white)),
                    Text(user.phone,
                        style: const TextStyle(fontSize: 13, color: Colors.white70)),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.location_on_outlined, size: 13, color: Colors.white60),
                        const SizedBox(width: 3),
                        Text(user.location, style: const TextStyle(fontSize: 12, color: Colors.white70)),
                        const SizedBox(width: 12),
                        if (user.kycVerified) ...[
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.greenGlow.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(999),
                              border: Border.all(color: AppColors.greenGlow.withOpacity(0.4)),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.verified, size: 12, color: AppColors.greenGlow),
                                SizedBox(width: 4),
                                Text('KYC Verified', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.greenGlow)),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),

              // My Account section
              _sectionHeader('My Account'),
              _menuItem(context, icon: Icons.person_outline,    label: 'Edit Profile',       onTap: () {}),
              _menuItem(context, icon: Icons.bar_chart_outlined, label: 'My Sales',           onTap: () => context.push('/transactions')),
              _menuItem(context, icon: Icons.receipt_long_outlined, label: 'Order History',  onTap: () => context.push('/order/order_001')),
              _menuItem(context, icon: Icons.notifications_outlined, label: 'Notifications', onTap: () => context.push('/notifications')),

              const SizedBox(height: 8),

              _sectionHeader('Preferences'),
              _menuItem(context, icon: Icons.language_outlined,  label: 'Language',        onTap: () => _showLanguagePicker(context), trailing: 'English'),
              _menuItem(context, icon: Icons.dark_mode_outlined,  label: 'Appearance',     onTap: () {}),

              const SizedBox(height: 8),

              _sectionHeader('Support'),
              _menuItem(context, icon: Icons.help_outline,   label: 'Help & Support',   onTap: () {}),
              _menuItem(context, icon: Icons.description_outlined, label: 'Terms of Use', onTap: () {}),
              _menuItem(context, icon: Icons.privacy_tip_outlined, label: 'Privacy Policy', onTap: () {}),

              const SizedBox(height: 8),

              // Logout
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: GestureDetector(
                  onTap: () => _logout(context),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.terracottaLight,
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      border: Border.all(color: AppColors.terracotta.withOpacity(0.3)),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.logout, color: AppColors.terracotta, size: 20),
                        SizedBox(width: 12),
                        Text('Log Out', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.terracotta)),
                      ],
                    ),
                  ),
                ),
              ),

              // Version
              Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  child: Text('KrishiShetra v1.0.0',
                      style: TextStyle(fontSize: 12, color: AppColors.textMutedDash.withOpacity(0.5))),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 4),
      child: Text(title.toUpperCase(),
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMutedDash, letterSpacing: 0.8)),
    );
  }

  Widget _menuItem(BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    String? trailing,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 2),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        decoration: BoxDecoration(
          color: AppColors.cardWhite,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          border: Border.all(color: AppColors.borderDash),
        ),
        child: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(color: AppColors.mintLight, borderRadius: BorderRadius.circular(8)),
              child: Icon(icon, size: 18, color: AppColors.sage),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.charcoal)),
            ),
            if (trailing != null)
              Text(trailing, style: const TextStyle(fontSize: 13, color: AppColors.textMutedDash)),
            const SizedBox(width: 4),
            const Icon(Icons.arrow_forward_ios, size: 13, color: AppColors.textMutedDash),
          ],
        ),
      ),
    );
  }

  void _showLanguagePicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.ivoryBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppTheme.radiusLg)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Select Language', style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
            const SizedBox(height: 16),
            ...[('English', 'EN'), ('हिन्दी', 'HI'), ('मराठी', 'MR')].map((lang) =>
              ListTile(
                title: Text(lang.$1, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
                trailing: lang.$2 == 'EN' ? const Icon(Icons.check, color: AppColors.sage) : null,
                onTap: () => Navigator.pop(context),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusSm)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

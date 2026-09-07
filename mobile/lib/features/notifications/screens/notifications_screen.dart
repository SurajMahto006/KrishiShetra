import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../app/providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../data/models/notification_model.dart';
import '../../../shared/widgets/agricultural_background.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  late List<NotificationModel> _notifs;

  @override
  void initState() {
    super.initState();
    _notifs = List.from(ref.read(notifRepositoryProvider).getAll());
  }

  void _markRead(String id) {
    setState(() {
      final idx = _notifs.indexWhere((n) => n.id == id);
      if (idx != -1) _notifs[idx] = _notifs[idx].copyWith(isRead: true);
    });
    ref.read(notifRepositoryProvider).markRead(id);
  }

  void _markAllRead() {
    setState(() {
      _notifs = _notifs.map((n) => n.copyWith(isRead: true)).toList();
    });
    ref.read(notifRepositoryProvider).markAllRead();
    ref.read(notifUnreadProvider.notifier).state = 0;
  }

  @override
  Widget build(BuildContext context) {
    final unread = _notifs.where((n) => !n.isRead).length;

    return Scaffold(
      backgroundColor: AppColors.ivoryBg,
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          if (unread > 0)
            TextButton(
              onPressed: _markAllRead,
              child: const Text('Mark all read', style: TextStyle(fontSize: 12, color: AppColors.sage)),
            ),
        ],
      ),
      body: AgriculturalBackground(
        child: ListView.builder(
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 20),
          itemCount: _notifs.length,
          itemBuilder: (_, i) => _NotifCard(
            notif: _notifs[i],
            onTap: () {
              _markRead(_notifs[i].id);
              if (_notifs[i].actionRoute != null) {
                context.push(_notifs[i].actionRoute!);
              }
            },
          ),
        ),
      ),
    );
  }
}

class _NotifCard extends StatelessWidget {
  final NotificationModel notif;
  final VoidCallback onTap;
  const _NotifCard({required this.notif, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: AppTheme.durationFast,
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: notif.isRead ? AppColors.cardWhite : AppColors.paleSage,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          border: Border.all(
            color: notif.isRead ? AppColors.borderDash : AppColors.borderSage,
            width: notif.isRead ? 1 : 1.5,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Emoji icon
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: notif.isRead ? AppColors.ivoryBg : AppColors.mintLight,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: Text(notif.type.emoji, style: const TextStyle(fontSize: 18)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(notif.title,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: notif.isRead ? FontWeight.w600 : FontWeight.w700,
                              color: notif.isRead ? AppColors.charcoal : AppColors.evergreen,
                            )),
                      ),
                      if (!notif.isRead)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.greenAccent,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(notif.body,
                      style: const TextStyle(fontSize: 12, color: AppColors.textMutedDash, height: 1.4)),
                  const SizedBox(height: 4),
                  Text(
                    _timeAgo(notif.createdAt),
                    style: const TextStyle(fontSize: 10, color: AppColors.textMutedDash),
                  ),
                ],
              ),
            ),
            if (notif.actionRoute != null)
              const Padding(
                padding: EdgeInsets.only(top: 2),
                child: Icon(Icons.arrow_forward_ios, size: 12, color: AppColors.textMutedDash),
              ),
          ],
        ),
      ),
    );
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}

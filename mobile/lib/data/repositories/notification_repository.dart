import '../mock/mock_notifications.dart';
import '../models/notification_model.dart';

class NotificationRepository {
  final List<NotificationModel> _notifs = List.from(MockNotifications.all);

  List<NotificationModel> getAll() => List.unmodifiable(_notifs);

  int get unreadCount => _notifs.where((n) => !n.isRead).length;

  void markRead(String id) {
    final idx = _notifs.indexWhere((n) => n.id == id);
    if (idx != -1) _notifs[idx] = _notifs[idx].copyWith(isRead: true);
  }

  void markAllRead() {
    for (int i = 0; i < _notifs.length; i++) {
      _notifs[i] = _notifs[i].copyWith(isRead: true);
    }
  }
}

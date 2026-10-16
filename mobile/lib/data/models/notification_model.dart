enum NotificationType {
  priceAlert,
  newOffer,
  offerExpiring,
  orderUpdate,
  logisticsUpdate,
  paymentReceived,
  aiRecommendation,
}

extension NotificationTypeIcon on NotificationType {
  String get emoji {
    switch (this) {
      case NotificationType.priceAlert:       return '📈';
      case NotificationType.newOffer:         return '🤝';
      case NotificationType.offerExpiring:    return '⏰';
      case NotificationType.orderUpdate:      return '📦';
      case NotificationType.logisticsUpdate:  return '🚛';
      case NotificationType.paymentReceived:  return '💰';
      case NotificationType.aiRecommendation: return '🤖';
    }
  }
}

class NotificationModel {
  final String id;
  final NotificationType type;
  final String title;
  final String body;
  final bool isRead;
  final DateTime createdAt;
  final String? actionRoute;

  const NotificationModel({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    this.isRead = false,
    required this.createdAt,
    this.actionRoute,
  });

  NotificationModel copyWith({bool? isRead}) => NotificationModel(
    id: id,
    type: type,
    title: title,
    body: body,
    isRead: isRead ?? this.isRead,
    createdAt: createdAt,
    actionRoute: actionRoute,
  );
}

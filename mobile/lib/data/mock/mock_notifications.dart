import '../models/notification_model.dart';

abstract class MockNotifications {
  static final List<NotificationModel> all = [
    NotificationModel(
      id: 'notif_001',
      type: NotificationType.priceAlert,
      title: '🌾 Wheat Price Alert',
      body: 'Nashik market price increased by 4.2%. Current: ₹2,490/Qtl.',
      isRead: false,
      createdAt: DateTime.now().subtract(const Duration(minutes: 15)),
      actionRoute: '/market',
    ),
    NotificationModel(
      id: 'notif_002',
      type: NotificationType.newOffer,
      title: '🤝 New Buyer Offer',
      body: 'ABC Foods Pvt Ltd made an offer of ₹2,550/Qtl for your Wheat lot.',
      isRead: false,
      createdAt: DateTime.now().subtract(const Duration(hours: 4)),
      actionRoute: '/offers',
    ),
    NotificationModel(
      id: 'notif_003',
      type: NotificationType.aiRecommendation,
      title: '🤖 AI Recommendation Ready',
      body: 'Best market to sell your Wheat: Nashik APMC. Expected ₹2,540/Qtl.',
      isRead: false,
      createdAt: DateTime.now().subtract(const Duration(hours: 6)),
      actionRoute: '/ai-recommendation',
    ),
    NotificationModel(
      id: 'notif_004',
      type: NotificationType.offerExpiring,
      title: '⏰ Offer Expiring Soon',
      body: 'AgroFresh India offer expires in 24 hours. Review and respond.',
      isRead: true,
      createdAt: DateTime.now().subtract(const Duration(hours: 12)),
      actionRoute: '/offers',
    ),
    NotificationModel(
      id: 'notif_005',
      type: NotificationType.logisticsUpdate,
      title: '🚛 Logistics Update',
      body: 'Order #KS1024: Driver Suresh Kumar has been assigned. Vehicle: MH 15 AB 1234.',
      isRead: true,
      createdAt: DateTime.now().subtract(const Duration(hours: 20)),
      actionRoute: '/order/order_001',
    ),
    NotificationModel(
      id: 'notif_006',
      type: NotificationType.priceAlert,
      title: '🧅 Onion Price Surge',
      body: 'Lasalgaon market: Onion up 9.1% to ₹2,820/Qtl. High demand.',
      isRead: true,
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      actionRoute: '/market',
    ),
    NotificationModel(
      id: 'notif_007',
      type: NotificationType.paymentReceived,
      title: '💰 Payment Received',
      body: 'Payment of ₹17,500 received for Tomato sale (Order #KS1018).',
      isRead: true,
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      actionRoute: '/payments',
    ),
  ];
}

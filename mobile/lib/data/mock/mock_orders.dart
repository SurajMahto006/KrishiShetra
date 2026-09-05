import '../models/order_model.dart';

abstract class MockOrders {
  static final OrderModel activeOrder = OrderModel(
    id: 'order_001',
    orderNumber: 'KS1024',
    lotId: 'lot_001',
    offerId: 'offer_001',
    cropName: 'Wheat',
    cropEmoji: '🌾',
    quantityKg: 500,
    pricePerQtl: 2550,
    buyerName: 'ABC Foods Pvt Ltd',
    buyerVerified: true,
    status: OrderStatus.logistics,
    logistics: const LogisticsInfo(
      pickupAddress: 'Sinnar, Nashik, Maharashtra',
      deliveryAddress: 'ABC Foods Warehouse, Bhiwandi, Mumbai',
      distanceKm: 42,
      cost: 1200,
      driverName: 'Suresh Kumar',
      driverPhone: '+91 97654 32109',
      vehicleNumber: 'MH 15 AB 1234',
      status: 'In Transit',
    ),
    payment: const PaymentInfo(
      saleValue: 12750,
      logisticsCost: 1200,
      netAmount: 11550,
      isPaid: false,
      method: 'UPI',
    ),
    createdAt: DateTime(2026, 8, 28),
  );

  static final List<OrderModel> all = [activeOrder];
}

enum OrderStatus { offerAccepted, confirmed, logistics, delivered, paymentPending, completed }

extension OrderStatusLabel on OrderStatus {
  String get label {
    switch (this) {
      case OrderStatus.offerAccepted:   return 'Offer Accepted';
      case OrderStatus.confirmed:        return 'Order Confirmed';
      case OrderStatus.logistics:        return 'In Transit';
      case OrderStatus.delivered:        return 'Delivered';
      case OrderStatus.paymentPending:   return 'Payment Pending';
      case OrderStatus.completed:        return 'Completed';
    }
  }
}

class LogisticsInfo {
  final String pickupAddress;
  final String deliveryAddress;
  final double distanceKm;
  final double cost;
  final String driverName;
  final String driverPhone;
  final String vehicleNumber;
  final String status; // 'Assigned' | 'Picked Up' | 'In Transit' | 'Delivered'

  const LogisticsInfo({
    required this.pickupAddress,
    required this.deliveryAddress,
    required this.distanceKm,
    required this.cost,
    required this.driverName,
    required this.driverPhone,
    required this.vehicleNumber,
    required this.status,
  });
}

class PaymentInfo {
  final double saleValue;
  final double logisticsCost;
  final double netAmount;
  final bool isPaid;
  final DateTime? paidAt;
  final String method; // 'UPI' | 'NEFT' | 'Cash'

  const PaymentInfo({
    required this.saleValue,
    required this.logisticsCost,
    required this.netAmount,
    this.isPaid = false,
    this.paidAt,
    required this.method,
  });
}

class OrderModel {
  final String id;
  final String orderNumber;
  final String lotId;
  final String offerId;
  final String cropName;
  final String cropEmoji;
  final double quantityKg;
  final double pricePerQtl;
  final String buyerName;
  final bool buyerVerified;
  final OrderStatus status;
  final LogisticsInfo logistics;
  final PaymentInfo payment;
  final DateTime createdAt;

  const OrderModel({
    required this.id,
    required this.orderNumber,
    required this.lotId,
    required this.offerId,
    required this.cropName,
    required this.cropEmoji,
    required this.quantityKg,
    required this.pricePerQtl,
    required this.buyerName,
    this.buyerVerified = true,
    required this.status,
    required this.logistics,
    required this.payment,
    required this.createdAt,
  });
}

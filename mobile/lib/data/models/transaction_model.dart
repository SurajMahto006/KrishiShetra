enum TransactionStatus { completed, pending, failed }

class TransactionModel {
  final String id;
  final String cropName;
  final String cropEmoji;
  final String buyerName;
  final double quantityKg;
  final double pricePerQtl;
  final double totalAmount;
  final TransactionStatus status;
  final DateTime date;
  final String marketName;

  const TransactionModel({
    required this.id,
    required this.cropName,
    required this.cropEmoji,
    required this.buyerName,
    required this.quantityKg,
    required this.pricePerQtl,
    required this.totalAmount,
    required this.status,
    required this.date,
    required this.marketName,
  });
}

enum OfferStatus { pending, accepted, rejected, expired }

extension OfferStatusLabel on OfferStatus {
  String get label {
    switch (this) {
      case OfferStatus.pending:  return 'Pending';
      case OfferStatus.accepted: return 'Accepted';
      case OfferStatus.rejected: return 'Rejected';
      case OfferStatus.expired:  return 'Expired';
    }
  }
}

class OfferModel {
  final String id;
  final String lotId;
  final String buyerId;
  final String buyerName;
  final bool buyerVerified;
  final String cropName;
  final String cropEmoji;
  final double pricePerQtl;
  final double quantityKg;
  final double distanceKm;
  final String paymentTerms;     // e.g. "Immediate" / "7 Days"
  final bool logisticsIncluded;
  final double? logisticsCost;
  final OfferStatus status;
  final DateTime expiresAt;
  final DateTime createdAt;

  const OfferModel({
    required this.id,
    required this.lotId,
    required this.buyerId,
    required this.buyerName,
    this.buyerVerified = true,
    required this.cropName,
    required this.cropEmoji,
    required this.pricePerQtl,
    required this.quantityKg,
    required this.distanceKm,
    required this.paymentTerms,
    this.logisticsIncluded = false,
    this.logisticsCost,
    this.status = OfferStatus.pending,
    required this.expiresAt,
    required this.createdAt,
  });

  double get totalValue => (pricePerQtl * quantityKg) / 100;
  double get netValue   => totalValue - (logisticsCost ?? 0);
}

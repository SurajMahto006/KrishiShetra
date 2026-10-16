class BuyerModel {
  final String id;
  final String name;
  final String location;
  final bool verified;
  final double reliabilityPercent;
  final List<String> interestedCropIds;
  final String description;
  final int completedTransactions;
  final double minQtyKg;
  final double maxQtyKg;
  final String paymentTerms;

  const BuyerModel({
    required this.id,
    required this.name,
    required this.location,
    this.verified = true,
    required this.reliabilityPercent,
    required this.interestedCropIds,
    required this.description,
    required this.completedTransactions,
    required this.minQtyKg,
    required this.maxQtyKg,
    required this.paymentTerms,
  });

  String get quantityRange {
    final min = (minQtyKg / 100).toStringAsFixed(0);
    final max = (maxQtyKg / 100).toStringAsFixed(0);
    return '$min–$max Qtl';
  }
}

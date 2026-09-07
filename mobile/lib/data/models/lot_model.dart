enum LotStatus { active, offersReceived, sold, expired }
enum QualityGrade { gradeA, gradeB, gradeC }

extension QualityGradeLabel on QualityGrade {
  String get label {
    switch (this) {
      case QualityGrade.gradeA: return 'Grade A';
      case QualityGrade.gradeB: return 'Grade B';
      case QualityGrade.gradeC: return 'Grade C';
    }
  }
}

extension LotStatusLabel on LotStatus {
  String get label {
    switch (this) {
      case LotStatus.active:          return 'Active';
      case LotStatus.offersReceived:  return 'Offers Received';
      case LotStatus.sold:            return 'Sold';
      case LotStatus.expired:         return 'Expired';
    }
  }
}

class LotModel {
  final String id;
  final String cropId;
  final String cropName;
  final String cropEmoji;
  final double quantityKg;
  final QualityGrade quality;
  final String location;
  final double expectedPricePerQtl;
  final DateTime harvestDate;
  final LotStatus status;
  final int offersCount;
  final double? bestOfferPrice;
  final String? imagePath;
  final DateTime createdAt;

  const LotModel({
    required this.id,
    required this.cropId,
    required this.cropName,
    required this.cropEmoji,
    required this.quantityKg,
    required this.quality,
    required this.location,
    required this.expectedPricePerQtl,
    required this.harvestDate,
    required this.status,
    this.offersCount = 0,
    this.bestOfferPrice,
    this.imagePath,
    required this.createdAt,
  });

  double get quantityQtl => quantityKg / 100;
}

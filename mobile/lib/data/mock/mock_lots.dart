import '../models/lot_model.dart';

abstract class MockLots {
  static final List<LotModel> all = [
    LotModel(
      id: 'lot_001',
      cropId: 'wheat',
      cropName: 'Wheat',
      cropEmoji: '🌾',
      quantityKg: 500,
      quality: QualityGrade.gradeA,
      location: 'Nashik, Maharashtra',
      expectedPricePerQtl: 2500,
      harvestDate: DateTime(2026, 8, 10),
      status: LotStatus.offersReceived,
      offersCount: 3,
      bestOfferPrice: 2550,
      createdAt: DateTime(2026, 8, 20),
    ),
    LotModel(
      id: 'lot_002',
      cropId: 'onion',
      cropName: 'Onion',
      cropEmoji: '🧅',
      quantityKg: 1000,
      quality: QualityGrade.gradeA,
      location: 'Nashik, Maharashtra',
      expectedPricePerQtl: 2600,
      harvestDate: DateTime(2026, 8, 5),
      status: LotStatus.active,
      offersCount: 0,
      createdAt: DateTime(2026, 8, 22),
    ),
    LotModel(
      id: 'lot_003',
      cropId: 'tomato',
      cropName: 'Tomato',
      cropEmoji: '🍅',
      quantityKg: 300,
      quality: QualityGrade.gradeB,
      location: 'Nashik, Maharashtra',
      expectedPricePerQtl: 1800,
      harvestDate: DateTime(2026, 7, 20),
      status: LotStatus.sold,
      offersCount: 2,
      bestOfferPrice: 1850,
      createdAt: DateTime(2026, 7, 25),
    ),
  ];

  static LotModel? findById(String id) {
    try {
      return all.firstWhere((l) => l.id == id);
    } catch (_) {
      return null;
    }
  }
}

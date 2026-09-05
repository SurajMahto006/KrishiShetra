import '../models/buyer_model.dart';

abstract class MockBuyers {
  static final List<BuyerModel> all = [
    BuyerModel(
      id: 'buyer_001',
      name: 'ABC Foods Pvt Ltd',
      location: 'Mumbai, Maharashtra',
      verified: true,
      reliabilityPercent: 98,
      interestedCropIds: ['wheat', 'soybean'],
      description: 'Leading food processing company sourcing wheat directly from farmers.',
      completedTransactions: 1240,
      minQtyKg: 500,
      maxQtyKg: 100000,
      paymentTerms: 'Immediate',
    ),
    BuyerModel(
      id: 'buyer_002',
      name: 'AgroFresh India',
      location: 'Pune, Maharashtra',
      verified: true,
      reliabilityPercent: 96,
      interestedCropIds: ['onion', 'tomato', 'potato'],
      description: 'Fresh produce aggregator supplying retail chains across Maharashtra.',
      completedTransactions: 872,
      minQtyKg: 200,
      maxQtyKg: 50000,
      paymentTerms: '3 Days',
    ),
    BuyerModel(
      id: 'buyer_003',
      name: 'MahaRetail Corp',
      location: 'Nashik, Maharashtra',
      verified: true,
      reliabilityPercent: 94,
      interestedCropIds: ['wheat', 'onion', 'potato'],
      description: 'Retail chain with direct farm procurement across Nashik region.',
      completedTransactions: 456,
      minQtyKg: 100,
      maxQtyKg: 20000,
      paymentTerms: '7 Days',
    ),
    BuyerModel(
      id: 'buyer_004',
      name: 'Sunrise Exports',
      location: 'Navi Mumbai, Maharashtra',
      verified: true,
      reliabilityPercent: 91,
      interestedCropIds: ['onion', 'soybean'],
      description: 'Export-oriented buyer with APEDA certification for quality produce.',
      completedTransactions: 312,
      minQtyKg: 1000,
      maxQtyKg: 200000,
      paymentTerms: '14 Days',
    ),
  ];

  static BuyerModel? findById(String id) {
    try {
      return all.firstWhere((b) => b.id == id);
    } catch (_) {
      return null;
    }
  }

  static List<BuyerModel> forCrop(String cropId) =>
      all.where((b) => b.interestedCropIds.contains(cropId)).toList();
}

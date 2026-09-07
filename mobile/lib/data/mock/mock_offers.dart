import '../models/offer_model.dart';

abstract class MockOffers {
  static final List<OfferModel> all = [
    OfferModel(
      id: 'offer_001',
      lotId: 'lot_001',
      buyerId: 'buyer_001',
      buyerName: 'ABC Foods Pvt Ltd',
      buyerVerified: true,
      cropName: 'Wheat',
      cropEmoji: '🌾',
      pricePerQtl: 2550,
      quantityKg: 500,
      distanceKm: 42,
      paymentTerms: 'Immediate',
      logisticsIncluded: false,
      logisticsCost: 1200,
      status: OfferStatus.pending,
      expiresAt: DateTime.now().add(const Duration(days: 2)),
      createdAt: DateTime.now().subtract(const Duration(hours: 4)),
    ),
    OfferModel(
      id: 'offer_002',
      lotId: 'lot_001',
      buyerId: 'buyer_003',
      buyerName: 'MahaRetail Corp',
      buyerVerified: true,
      cropName: 'Wheat',
      cropEmoji: '🌾',
      pricePerQtl: 2520,
      quantityKg: 500,
      distanceKm: 12,
      paymentTerms: '7 Days',
      logisticsIncluded: true,
      logisticsCost: 0,
      status: OfferStatus.pending,
      expiresAt: DateTime.now().add(const Duration(days: 3)),
      createdAt: DateTime.now().subtract(const Duration(hours: 6)),
    ),
    OfferModel(
      id: 'offer_003',
      lotId: 'lot_001',
      buyerId: 'buyer_002',
      buyerName: 'AgroFresh India',
      buyerVerified: true,
      cropName: 'Wheat',
      cropEmoji: '🌾',
      pricePerQtl: 2505,
      quantityKg: 500,
      distanceKm: 128,
      paymentTerms: '3 Days',
      logisticsIncluded: false,
      logisticsCost: 3200,
      status: OfferStatus.pending,
      expiresAt: DateTime.now().add(const Duration(days: 1)),
      createdAt: DateTime.now().subtract(const Duration(hours: 10)),
    ),
  ];

  static List<OfferModel> forLot(String lotId) =>
      all.where((o) => o.lotId == lotId).toList();

  static OfferModel? findById(String id) {
    try {
      return all.firstWhere((o) => o.id == id);
    } catch (_) {
      return null;
    }
  }
}

import '../mock/mock_offers.dart';
import '../models/offer_model.dart';

class OfferRepository {
  final List<OfferModel> _offers = List.from(MockOffers.all);

  List<OfferModel> getAllOffers() => List.unmodifiable(_offers);
  List<OfferModel> getOffersForLot(String lotId) => MockOffers.forLot(lotId);
  OfferModel? findById(String id) => MockOffers.findById(id);

  void acceptOffer(String offerId) {
    final idx = _offers.indexWhere((o) => o.id == offerId);
    if (idx != -1) {
      _offers[idx] = OfferModel(
        id: _offers[idx].id,
        lotId: _offers[idx].lotId,
        buyerId: _offers[idx].buyerId,
        buyerName: _offers[idx].buyerName,
        buyerVerified: _offers[idx].buyerVerified,
        cropName: _offers[idx].cropName,
        cropEmoji: _offers[idx].cropEmoji,
        pricePerQtl: _offers[idx].pricePerQtl,
        quantityKg: _offers[idx].quantityKg,
        distanceKm: _offers[idx].distanceKm,
        paymentTerms: _offers[idx].paymentTerms,
        logisticsIncluded: _offers[idx].logisticsIncluded,
        logisticsCost: _offers[idx].logisticsCost,
        status: OfferStatus.accepted,
        expiresAt: _offers[idx].expiresAt,
        createdAt: _offers[idx].createdAt,
      );
    }
  }
}

import 'package:flutter_test/flutter_test.dart';
import 'package:krishishetra_mobile/data/repositories/market_repository.dart';
import 'package:krishishetra_mobile/data/repositories/lot_repository.dart';
import 'package:krishishetra_mobile/data/repositories/offer_repository.dart';
import 'package:krishishetra_mobile/data/repositories/ai_repository.dart';

void main() {
  group('KrishiShetra Repository Tests', () {
    test('MarketRepository returns markets and finds best market', () {
      final repo = MarketRepository();
      final markets = repo.getMarkets();
      expect(markets.isNotEmpty, true);

      final best = repo.getBestMarket('wheat');
      expect(best, isNotNull);
      expect(best!.value.price > 0, true);
    });

    test('LotRepository manages active and sold lots', () {
      final repo = LotRepository();
      final allLots = repo.getLots();
      expect(allLots.isNotEmpty, true);

      final active = repo.getActiveLots();
      expect(active.isNotEmpty, true);
    });

    test('OfferRepository retrieves offers for lot', () {
      final repo = OfferRepository();
      final offers = repo.getAllOffers();
      expect(offers.isNotEmpty, true);
    });

    test('AiRepository generates valid recommendation structure', () async {
      final repo = AiRepository();
      final rec = await repo.getRecommendation(crop: 'Wheat', quantity: 50);
      expect(rec.crop, 'Wheat');
      expect(rec.confidence, greaterThan(0));
      expect(rec.reasons.isNotEmpty, true);
    });
  });
}

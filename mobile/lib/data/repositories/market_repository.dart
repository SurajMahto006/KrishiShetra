import '../mock/mock_markets.dart';
import '../models/market_model.dart';

/// Repository abstraction for market data.
/// Replace body with real API calls when backend is ready.
class MarketRepository {
  // All markets
  List<MarketModel> getMarkets() => MockMarkets.all;

  // Prices for a given crop across all markets
  Map<String, MarketPriceModel> getPricesForCrop(String cropId) =>
      MockMarkets.pricesForCrop(cropId);

  // Best market by net realization
  MapEntry<MarketModel, MarketPriceModel>? getBestMarket(String cropId) {
    final prices = getPricesForCrop(cropId);
    if (prices.isEmpty) return null;

    MarketModel? bestMarket;
    MarketPriceModel? bestPrice;

    for (final market in getMarkets()) {
      final price = prices[market.id];
      if (price == null) continue;
      if (bestPrice == null || price.netRealization > bestPrice.netRealization) {
        bestPrice = price;
        bestMarket = market;
      }
    }
    if (bestMarket == null || bestPrice == null) return null;
    return MapEntry(bestMarket, bestPrice);
  }
}

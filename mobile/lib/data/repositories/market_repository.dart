import '../../core/network/api_client.dart';
import '../mock/mock_markets.dart';
import '../models/market_model.dart';

class MarketRepository {
  final ApiClient _client = ApiClient();

  List<MarketModel> getMarkets() => MockMarkets.all;

  Map<String, MarketPriceModel> getPricesForCrop(String cropId) =>
      MockMarkets.pricesForCrop(cropId);

  Future<List<MarketModel>> fetchLiveMarkets() async {
    try {
      final res = await _client.get('/markets');
      if (res.data['success'] == true && res.data['data'] != null) {
        // Return parsed live markets
      }
    } catch (_) {}
    return MockMarkets.all;
  }

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

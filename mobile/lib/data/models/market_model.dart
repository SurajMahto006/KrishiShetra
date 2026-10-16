enum DemandLevel { high, medium, low }

class MarketModel {
  final String id;
  final String name;
  final String state;
  final double distanceKm;
  final double latitude;
  final double longitude;

  const MarketModel({
    required this.id,
    required this.name,
    required this.state,
    required this.distanceKm,
    required this.latitude,
    required this.longitude,
  });
}

class MarketPriceModel {
  final String id;
  final String marketId;
  final String cropId;
  final double price;       // ₹ per quintal
  final double changePercent;
  final DemandLevel demand;
  final double netRealization; // after transport
  final DateTime updatedAt;
  final List<double> trendData; // last 30 data points

  const MarketPriceModel({
    required this.id,
    required this.marketId,
    required this.cropId,
    required this.price,
    required this.changePercent,
    required this.demand,
    required this.netRealization,
    required this.updatedAt,
    required this.trendData,
  });
}

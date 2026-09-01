import '../models/market_model.dart';

abstract class MockMarkets {
  // Markets
  static const nashik = MarketModel(
    id: 'nashik',
    name: 'Nashik APMC',
    state: 'Maharashtra',
    distanceKm: 42,
    latitude: 19.9975,
    longitude: 73.7898,
  );
  static const pune = MarketModel(
    id: 'pune',
    name: 'Pune APMC',
    state: 'Maharashtra',
    distanceKm: 128,
    latitude: 18.5204,
    longitude: 73.8567,
  );
  static const vashi = MarketModel(
    id: 'vashi',
    name: 'Vashi APMC',
    state: 'Maharashtra',
    distanceKm: 175,
    latitude: 19.0748,
    longitude: 73.0081,
  );
  static const lasalgaon = MarketModel(
    id: 'lasalgaon',
    name: 'Lasalgaon APMC',
    state: 'Maharashtra',
    distanceKm: 58,
    latitude: 20.1222,
    longitude: 74.0833,
  );

  static const List<MarketModel> all = [nashik, pune, vashi, lasalgaon];

  // Wheat prices per market
  static final wheatPrices = <String, MarketPriceModel>{
    'nashik': MarketPriceModel(
      id: 'wp_nashik',
      marketId: 'nashik',
      cropId: 'wheat',
      price: 2490,
      changePercent: 4.2,
      demand: DemandLevel.high,
      netRealization: 2440,
      updatedAt: DateTime.now().subtract(const Duration(minutes: 12)),
      trendData: [2200, 2210, 2195, 2230, 2260, 2250, 2280, 2300, 2290, 2320,
                  2310, 2350, 2340, 2370, 2360, 2390, 2380, 2410, 2400, 2430,
                  2420, 2450, 2440, 2460, 2455, 2470, 2465, 2480, 2485, 2490],
    ),
    'pune': MarketPriceModel(
      id: 'wp_pune',
      marketId: 'pune',
      cropId: 'wheat',
      price: 2460,
      changePercent: 2.8,
      demand: DemandLevel.medium,
      netRealization: 2380,
      updatedAt: DateTime.now().subtract(const Duration(minutes: 18)),
      trendData: [2180, 2190, 2200, 2210, 2205, 2220, 2240, 2235, 2250, 2260,
                  2270, 2265, 2280, 2295, 2290, 2305, 2320, 2315, 2330, 2345,
                  2340, 2355, 2370, 2365, 2380, 2390, 2400, 2420, 2445, 2460],
    ),
    'vashi': MarketPriceModel(
      id: 'wp_vashi',
      marketId: 'vashi',
      cropId: 'wheat',
      price: 2430,
      changePercent: 1.5,
      demand: DemandLevel.high,
      netRealization: 2330,
      updatedAt: DateTime.now().subtract(const Duration(minutes: 5)),
      trendData: [2150, 2160, 2170, 2165, 2180, 2195, 2200, 2195, 2210, 2220,
                  2230, 2240, 2250, 2245, 2260, 2270, 2280, 2275, 2290, 2300,
                  2310, 2320, 2330, 2335, 2345, 2355, 2365, 2375, 2415, 2430],
    ),
    'lasalgaon': MarketPriceModel(
      id: 'wp_lasalgaon',
      marketId: 'lasalgaon',
      cropId: 'wheat',
      price: 2475,
      changePercent: 3.1,
      demand: DemandLevel.high,
      netRealization: 2420,
      updatedAt: DateTime.now().subtract(const Duration(minutes: 30)),
      trendData: [2190, 2200, 2210, 2220, 2215, 2230, 2240, 2255, 2265, 2270,
                  2280, 2290, 2300, 2310, 2305, 2320, 2330, 2340, 2350, 2360,
                  2370, 2380, 2390, 2400, 2410, 2420, 2430, 2450, 2460, 2475],
    ),
  };

  // Onion prices
  static final onionPrices = <String, MarketPriceModel>{
    'nashik': MarketPriceModel(
      id: 'op_nashik',
      marketId: 'nashik',
      cropId: 'onion',
      price: 2650,
      changePercent: 7.5,
      demand: DemandLevel.high,
      netRealization: 2580,
      updatedAt: DateTime.now().subtract(const Duration(minutes: 8)),
      trendData: [2000, 2050, 2100, 2150, 2100, 2200, 2250, 2300, 2280, 2350,
                  2380, 2400, 2420, 2440, 2460, 2480, 2500, 2520, 2530, 2540,
                  2555, 2570, 2580, 2590, 2600, 2610, 2620, 2630, 2640, 2650],
    ),
    'pune': MarketPriceModel(
      id: 'op_pune',
      marketId: 'pune',
      cropId: 'onion',
      price: 2580,
      changePercent: 5.2,
      demand: DemandLevel.medium,
      netRealization: 2480,
      updatedAt: DateTime.now().subtract(const Duration(minutes: 22)),
      trendData: [1950, 1980, 2010, 2040, 2060, 2080, 2100, 2130, 2160, 2180,
                  2200, 2220, 2240, 2260, 2280, 2300, 2330, 2360, 2380, 2400,
                  2420, 2440, 2460, 2480, 2500, 2520, 2540, 2555, 2568, 2580],
    ),
    'lasalgaon': MarketPriceModel(
      id: 'op_lasalgaon',
      marketId: 'lasalgaon',
      cropId: 'onion',
      price: 2820,
      changePercent: 9.1,
      demand: DemandLevel.high,
      netRealization: 2750,
      updatedAt: DateTime.now().subtract(const Duration(minutes: 15)),
      trendData: [2100, 2150, 2200, 2250, 2300, 2350, 2380, 2420, 2450, 2480,
                  2510, 2540, 2560, 2580, 2600, 2620, 2640, 2660, 2680, 2700,
                  2720, 2740, 2760, 2770, 2780, 2790, 2800, 2808, 2815, 2820],
    ),
  };

  static Map<String, MarketPriceModel> pricesForCrop(String cropId) {
    switch (cropId) {
      case 'onion': return onionPrices;
      default:      return wheatPrices;
    }
  }
}

import '../../core/network/api_client.dart';
import '../mock/mock_lots.dart';
import '../models/lot_model.dart';

class LotRepository {
  final ApiClient _client = ApiClient();
  final List<LotModel> _lots = List.from(MockLots.all);

  List<LotModel> getLots() => List.unmodifiable(_lots);

  List<LotModel> getActiveLots() =>
      _lots.where((l) => l.status == LotStatus.active || l.status == LotStatus.offersReceived).toList();

  List<LotModel> getSoldLots() =>
      _lots.where((l) => l.status == LotStatus.sold).toList();

  LotModel? findById(String id) {
    try {
      return _lots.firstWhere((l) => l.id == id);
    } catch (_) {
      return null;
    }
  }

  Future<void> addLot(LotModel lot) async {
    _lots.insert(0, lot);
    try {
      await _client.post('/lots', data: {
        'cropName': lot.cropName,
        'variety': 'Sharbati Premium',
        'quantity': lot.quantityKg / 100,
        'quantityUnit': 'quintal',
        'askingPrice': lot.expectedPricePerQtl,
        'priceUnit': 'quintal',
        'qualityGrade': lot.quality.label,
        'locationVillage': lot.location,
        'harvestDate': lot.harvestDate.toIso8601String(),
      });
    } catch (_) {
      // Offline fallback: lot is already added to local list
    }
  }
}

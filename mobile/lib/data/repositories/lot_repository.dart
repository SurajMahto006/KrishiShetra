import '../mock/mock_lots.dart';
import '../models/lot_model.dart';

class LotRepository {
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

  void addLot(LotModel lot) => _lots.insert(0, lot);
}

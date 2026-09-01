import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/models/crop_model.dart';
import '../data/models/lot_model.dart';
import '../data/mock/mock_crops.dart';
import '../data/repositories/market_repository.dart';
import '../data/repositories/lot_repository.dart';
import '../data/repositories/buyer_repository.dart';
import '../data/repositories/offer_repository.dart';
import '../data/repositories/order_repository.dart';
import '../data/repositories/notification_repository.dart';
import '../data/repositories/transaction_repository.dart';

// ── Repositories ──────────────────────────────────────────────
final marketRepositoryProvider = Provider((_) => MarketRepository());
final lotRepositoryProvider    = Provider((_) => LotRepository());
final buyerRepositoryProvider  = Provider((_) => BuyerRepository());
final offerRepositoryProvider  = Provider((_) => OfferRepository());
final orderRepositoryProvider  = Provider((_) => OrderRepository());
final notifRepositoryProvider  = Provider((_) => NotificationRepository());
final txnRepositoryProvider    = Provider((_) => TransactionRepository());

// ── Selected crop (shared across Market / AI screens) ─────────
final selectedCropProvider = StateProvider<CropModel>((_) => MockCrops.wheat);

// ── Bottom nav index ──────────────────────────────────────────
final navIndexProvider = StateProvider<int>((_) => 0);

// ── Notifications unread count ────────────────────────────────
final notifUnreadProvider = StateProvider<int>((ref) {
  return ref.read(notifRepositoryProvider).unreadCount;
});

// ── Lots state ────────────────────────────────────────────────
final lotsProvider = StateNotifierProvider<LotsNotifier, List<LotModel>>(
  (ref) => LotsNotifier(ref.read(lotRepositoryProvider)),
);

class LotsNotifier extends StateNotifier<List<LotModel>> {
  final LotRepository _repo;
  LotsNotifier(this._repo) : super(_repo.getLots());

  void addLot(LotModel lot) {
    _repo.addLot(lot);
    state = _repo.getLots();
  }

  void refresh() => state = _repo.getLots();
}

// ── Offer acceptance ─────────────────────────────────────────
final acceptedOfferIdProvider = StateProvider<String?>((_) => null);

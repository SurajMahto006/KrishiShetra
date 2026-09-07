import '../mock/mock_buyers.dart';
import '../models/buyer_model.dart';

class BuyerRepository {
  List<BuyerModel> getBuyers() => MockBuyers.all;
  List<BuyerModel> getBuyersForCrop(String cropId) => MockBuyers.forCrop(cropId);
  BuyerModel? findById(String id) => MockBuyers.findById(id);
}

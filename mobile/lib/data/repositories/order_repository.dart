import '../mock/mock_orders.dart';
import '../models/order_model.dart';

class OrderRepository {
  List<OrderModel> getOrders() => MockOrders.all;
  OrderModel? findById(String id) {
    try {
      return MockOrders.all.firstWhere((o) => o.id == id);
    } catch (_) {
      return null;
    }
  }
}

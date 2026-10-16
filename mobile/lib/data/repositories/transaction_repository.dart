import '../mock/mock_transactions.dart';
import '../models/transaction_model.dart';

class TransactionRepository {
  List<TransactionModel> getAll() => MockTransactions.all;
}

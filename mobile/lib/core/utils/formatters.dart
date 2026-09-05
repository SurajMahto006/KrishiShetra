import 'package:intl/intl.dart';
import '../constants/app_constants.dart';

abstract class Formatters {
  static final _priceFormat = NumberFormat('#,##0', 'en_IN');
  static final _dateFormat  = DateFormat('dd MMM yyyy');
  static final _shortDate   = DateFormat('dd MMM');
  static final _timeFormat  = DateFormat('h:mm a');

  static String price(double value, {String unit = AppConstants.unitQuintal}) =>
      '${AppConstants.rupeeSymbol}${_priceFormat.format(value)}/$unit';

  static String priceRaw(double value) =>
      '${AppConstants.rupeeSymbol}${_priceFormat.format(value)}';

  static String weight(double kg) {
    if (kg >= 100) {
      final qtl = kg / 100;
      return '${qtl.toStringAsFixed(qtl % 1 == 0 ? 0 : 1)} Qtl';
    }
    return '${kg.toStringAsFixed(0)} KG';
  }

  static String distance(double km) => '${km.toStringAsFixed(0)} KM';

  static String date(DateTime d) => _dateFormat.format(d);
  static String shortDate(DateTime d) => _shortDate.format(d);
  static String time(DateTime d) => _timeFormat.format(d);

  static String percentage(double p, {bool showSign = true}) {
    final sign = (showSign && p > 0) ? '+' : '';
    return '$sign${p.toStringAsFixed(1)}%';
  }

  static String trend(double changePercent) {
    final arrow = changePercent >= 0 ? '↑' : '↓';
    return '$arrow ${changePercent.abs().toStringAsFixed(1)}%';
  }
}

import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../app/theme/app_colors.dart';

class PriceTrendChart extends StatefulWidget {
  final List<double> data;
  final Color lineColor;
  final bool showGradient;

  const PriceTrendChart({
    super.key,
    required this.data,
    this.lineColor = AppColors.sage,
    this.showGradient = true,
  });

  @override
  State<PriceTrendChart> createState() => _PriceTrendChartState();
}

class _PriceTrendChartState extends State<PriceTrendChart> {
  int _periodIndex = 2; // 0=5D, 1=10D, 2=30D
  final _periods = ['5D', '10D', '30D'];

  List<double> get _displayData {
    final d = widget.data;
    switch (_periodIndex) {
      case 0: return d.length >= 5  ? d.sublist(d.length - 5)  : d;
      case 1: return d.length >= 10 ? d.sublist(d.length - 10) : d;
      default: return d;
    }
  }

  @override
  Widget build(BuildContext context) {
    final data = _displayData;
    final minY = data.reduce((a, b) => a < b ? a : b) * 0.995;
    final maxY = data.reduce((a, b) => a > b ? a : b) * 1.005;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Period selector
        Row(
          children: List.generate(_periods.length, (i) {
            final selected = _periodIndex == i;
            return GestureDetector(
              onTap: () => setState(() => _periodIndex = i),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                decoration: BoxDecoration(
                  color: selected ? AppColors.evergreen : Colors.transparent,
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(
                    color: selected ? AppColors.evergreen : AppColors.borderDash,
                  ),
                ),
                child: Text(
                  _periods[i],
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: selected ? Colors.white : AppColors.textMutedDash,
                  ),
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 120,
          child: LineChart(
            LineChartData(
              gridData: const FlGridData(show: false),
              titlesData: const FlTitlesData(show: false),
              borderData: FlBorderData(show: false),
              minY: minY,
              maxY: maxY,
              lineTouchData: LineTouchData(
                enabled: true,
                touchTooltipData: LineTouchTooltipData(
                  getTooltipColor: (_) => AppColors.evergreen,
                  getTooltipItems: (spots) => spots.map((s) => LineTooltipItem(
                    '₹${s.y.toStringAsFixed(0)}',
                    const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                  )).toList(),
                ),
              ),
              lineBarsData: [
                LineChartBarData(
                  spots: List.generate(
                    data.length,
                    (i) => FlSpot(i.toDouble(), data[i]),
                  ),
                  isCurved: true,
                  curveSmoothness: 0.35,
                  color: widget.lineColor,
                  barWidth: 2.5,
                  isStrokeCapRound: true,
                  dotData: const FlDotData(show: false),
                  belowBarData: widget.showGradient
                      ? BarAreaData(
                          show: true,
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              widget.lineColor.withOpacity(0.2),
                              widget.lineColor.withOpacity(0.0),
                            ],
                          ),
                        )
                      : BarAreaData(show: false),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

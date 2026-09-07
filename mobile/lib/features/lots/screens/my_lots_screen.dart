import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../app/providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../data/models/lot_model.dart';
import '../../../shared/components/lot_card.dart';
import '../../../shared/components/empty_state.dart';
import '../../../shared/widgets/agricultural_background.dart';

class MyLotsScreen extends ConsumerStatefulWidget {
  const MyLotsScreen({super.key});

  @override
  ConsumerState<MyLotsScreen> createState() => _MyLotsScreenState();
}

class _MyLotsScreenState extends ConsumerState<MyLotsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lots = ref.watch(lotsProvider);
    final active = lots.where((l) => l.status == LotStatus.active).toList();
    final offers = lots.where((l) => l.status == LotStatus.offersReceived).toList();
    final sold   = lots.where((l) => l.status == LotStatus.sold).toList();

    return Scaffold(
      backgroundColor: AppColors.ivoryBg,
      body: AgriculturalBackground(
        child: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Row(
                  children: [
                    const Expanded(
                      child: Text('My Lots',
                          style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
                    ),
                    GestureDetector(
                      onTap: () => context.push('/create-lot'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          gradient: AppColors.evergreenGradient,
                          borderRadius: BorderRadius.circular(999),
                          boxShadow: [AppTheme.shadowGreen],
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.add, color: Colors.white, size: 16),
                            SizedBox(width: 4),
                            Text('New Lot', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Tab bar
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20),
                decoration: BoxDecoration(
                  color: AppColors.cardWhite,
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  border: Border.all(color: AppColors.borderDash),
                ),
                child: TabBar(
                  controller: _tabCtrl,
                  labelColor: Colors.white,
                  unselectedLabelColor: AppColors.textMutedDash,
                  indicator: BoxDecoration(
                    gradient: AppColors.evergreenGradient,
                    borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  ),
                  indicatorSize: TabBarIndicatorSize.tab,
                  dividerColor: Colors.transparent,
                  padding: const EdgeInsets.all(4),
                  tabs: [
                    Tab(text: 'Active (${active.length})'),
                    Tab(text: 'Offers (${offers.length})'),
                    Tab(text: 'Sold (${sold.length})'),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: TabBarView(
                  controller: _tabCtrl,
                  children: [
                    _LotList(lots: active, emptyMsg: 'No active lots', onCreateTap: () => context.push('/create-lot')),
                    _LotList(lots: offers, emptyMsg: 'No lots with offers yet'),
                    _LotList(lots: sold,   emptyMsg: 'No completed sales yet'),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LotList extends StatelessWidget {
  final List<LotModel> lots;
  final String emptyMsg;
  final VoidCallback? onCreateTap;

  const _LotList({required this.lots, required this.emptyMsg, this.onCreateTap});

  @override
  Widget build(BuildContext context) {
    if (lots.isEmpty) {
      return EmptyState(
        emoji: '🌾',
        title: 'No lots here',
        message: emptyMsg,
        ctaLabel: onCreateTap != null ? 'Create Your First Lot' : null,
        onCta: onCreateTap,
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: lots.length,
      itemBuilder: (_, i) => LotCard(
        lot: lots[i],
        onTap: () => context.push('/lot/${lots[i].id}'),
      ),
    );
  }
}

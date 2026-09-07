import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../app/providers.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../data/mock/mock_crops.dart';
import '../../../data/models/lot_model.dart';
import '../../../shared/components/ks_button.dart';

class CreateLotScreen extends ConsumerStatefulWidget {
  const CreateLotScreen({super.key});

  @override
  ConsumerState<CreateLotScreen> createState() => _CreateLotScreenState();
}

class _CreateLotScreenState extends ConsumerState<CreateLotScreen> with SingleTickerProviderStateMixin {
  int _step = 0;
  static const int _totalSteps = 7;

  // Form data
  String? _selectedCropId;
  String? _selectedCropEmoji;
  String? _selectedCropName;
  final _quantityCtrl   = TextEditingController();
  QualityGrade _quality = QualityGrade.gradeA;
  final _locationCtrl   = TextEditingController(text: 'Nashik, Maharashtra');
  final _priceCtrl      = TextEditingController();
  DateTime _harvestDate = DateTime.now().subtract(const Duration(days: 7));
  bool _imageSelected   = false;
  bool _creating = false;
  bool _created  = false;

  late AnimationController _successCtrl;
  late Animation<double> _successScale;

  @override
  void initState() {
    super.initState();
    _successCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _successScale = CurvedAnimation(parent: _successCtrl, curve: Curves.easeOutBack)
        .drive(Tween(begin: 0.0, end: 1.0));
  }

  @override
  void dispose() {
    _quantityCtrl.dispose();
    _locationCtrl.dispose();
    _priceCtrl.dispose();
    _successCtrl.dispose();
    super.dispose();
  }

  bool _canProceed() {
    switch (_step) {
      case 0: return _selectedCropId != null;
      case 1: return _quantityCtrl.text.isNotEmpty;
      case 2: return true;
      case 3: return _locationCtrl.text.isNotEmpty;
      case 4: return _priceCtrl.text.isNotEmpty;
      case 5: return true;
      case 6: return true;
      default: return true;
    }
  }

  void _next() {
    if (!_canProceed()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in the required field.')),
      );
      return;
    }
    if (_step < _totalSteps - 1) {
      setState(() => _step++);
    }
  }

  Future<void> _createLot() async {
    setState(() => _creating = true);
    await Future.delayed(const Duration(milliseconds: 1500));

    final lot = LotModel(
      id: 'lot_new_${DateTime.now().millisecondsSinceEpoch}',
      cropId: _selectedCropId!,
      cropName: _selectedCropName!,
      cropEmoji: _selectedCropEmoji!,
      quantityKg: double.tryParse(_quantityCtrl.text) ?? 500,
      quality: _quality,
      location: _locationCtrl.text,
      expectedPricePerQtl: double.tryParse(_priceCtrl.text) ?? 2500,
      harvestDate: _harvestDate,
      status: LotStatus.active,
      createdAt: DateTime.now(),
    );

    ref.read(lotsProvider.notifier).addLot(lot);
    setState(() { _creating = false; _created = true; });
    _successCtrl.forward();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.ivoryBg,
      appBar: _created
          ? null
          : AppBar(
              title: Text('Create Lot — Step ${_step + 1} of $_totalSteps'),
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_ios_new, size: 18),
                onPressed: () {
                  if (_step > 0) setState(() => _step--);
                  else context.pop();
                },
              ),
            ),
      body: _created ? _buildSuccess() : _buildForm(),
    );
  }

  Widget _buildForm() {
    return Column(
      children: [
        // Progress bar
        LinearProgressIndicator(
          value: (_step + 1) / _totalSteps,
          backgroundColor: AppColors.borderDash,
          valueColor: const AlwaysStoppedAnimation<Color>(AppColors.sage),
          minHeight: 3,
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: AnimatedSwitcher(
              duration: AppTheme.durationMedium,
              child: KeyedSubtree(
                key: ValueKey(_step),
                child: _buildStep(_step),
              ),
            ),
          ),
        ),
        // Bottom action
        Padding(
          padding: EdgeInsets.fromLTRB(24, 0, 24, MediaQuery.of(context).padding.bottom + 16),
          child: _step == _totalSteps - 1
              ? KsButton(label: 'Create Lot', onTap: _creating ? null : _createLot, loading: _creating)
              : KsButton(label: 'Continue →', onTap: _next),
        ),
      ],
    );
  }

  Widget _buildStep(int step) {
    switch (step) {
      case 0: return _stepSelectCrop();
      case 1: return _stepQuantity();
      case 2: return _stepQuality();
      case 3: return _stepLocation();
      case 4: return _stepPrice();
      case 5: return _stepHarvestDate();
      case 6: return _stepReview();
      default: return const SizedBox();
    }
  }

  Widget _stepSelectCrop() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _stepHeader('Select Crop', 'Which crop are you selling?'),
        const SizedBox(height: 24),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: MockCrops.all.map((crop) {
            final isSelected = _selectedCropId == crop.id;
            return GestureDetector(
              onTap: () => setState(() {
                _selectedCropId   = crop.id;
                _selectedCropEmoji = crop.emoji;
                _selectedCropName  = crop.name;
              }),
              child: AnimatedContainer(
                duration: AppTheme.durationFast,
                width: (MediaQuery.of(context).size.width - 60) / 2,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.paleSage : AppColors.cardWhite,
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                  border: Border.all(color: isSelected ? AppColors.sage : AppColors.borderDash, width: isSelected ? 2 : 1),
                ),
                child: Row(
                  children: [
                    Text(crop.emoji, style: const TextStyle(fontSize: 28)),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(crop.name,
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700,
                                color: isSelected ? AppColors.evergreen : AppColors.charcoal)),
                        Text(crop.category, style: const TextStyle(fontSize: 11, color: AppColors.textMutedDash)),
                      ],
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _stepQuantity() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _stepHeader('Quantity', 'How many KG do you want to sell?'),
        const SizedBox(height: 24),
        TextField(
          controller: _quantityCtrl,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.evergreen),
          decoration: const InputDecoration(
            hintText: '500',
            suffixText: 'KG',
            suffixStyle: TextStyle(fontSize: 16, color: AppColors.textMutedDash, fontWeight: FontWeight.w600),
          ),
          autofocus: true,
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 8,
          children: ['100', '250', '500', '1000'].map((v) {
            return GestureDetector(
              onTap: () { _quantityCtrl.text = v; setState(() {}); },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                decoration: BoxDecoration(
                  color: _quantityCtrl.text == v ? AppColors.paleSage : AppColors.cardWhite,
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: _quantityCtrl.text == v ? AppColors.sage : AppColors.borderDash),
                ),
                child: Text('$v KG', style: TextStyle(
                    fontSize: 13, fontWeight: FontWeight.w600,
                    color: _quantityCtrl.text == v ? AppColors.evergreen : AppColors.charcoal)),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _stepQuality() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _stepHeader('Quality Grade', 'Select the quality of your crop.'),
        const SizedBox(height: 24),
        ...QualityGrade.values.map((grade) {
          final isSelected = _quality == grade;
          return GestureDetector(
            onTap: () => setState(() => _quality = grade),
            child: AnimatedContainer(
              duration: AppTheme.durationFast,
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.paleSage : AppColors.cardWhite,
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                border: Border.all(color: isSelected ? AppColors.sage : AppColors.borderDash, width: isSelected ? 2 : 1),
              ),
              child: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.sage : AppColors.borderDash,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        isSelected ? '●' : '○',
                        style: TextStyle(color: isSelected ? Colors.white : AppColors.textMutedDash, fontSize: 16),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(grade.label,
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700,
                                color: isSelected ? AppColors.evergreen : AppColors.charcoal)),
                        Text(_gradeDesc(grade), style: const TextStyle(fontSize: 12, color: AppColors.textMutedDash)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  String _gradeDesc(QualityGrade g) {
    switch (g) {
      case QualityGrade.gradeA: return 'Premium quality — highest price';
      case QualityGrade.gradeB: return 'Good quality — standard market rate';
      case QualityGrade.gradeC: return 'Average quality — discounted price';
    }
  }

  Widget _stepLocation() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _stepHeader('Location', 'Where is your crop available for pickup?'),
        const SizedBox(height: 24),
        TextField(
          controller: _locationCtrl,
          decoration: const InputDecoration(
            labelText: 'Village / District / State',
            prefixIcon: Icon(Icons.location_on_outlined, color: AppColors.sage),
          ),
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 8,
          children: ['Nashik, Maharashtra', 'Pune, Maharashtra', 'Aurangabad, Maharashtra'].map((loc) {
            return GestureDetector(
              onTap: () => setState(() => _locationCtrl.text = loc),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.cardWhite,
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: AppColors.borderDash),
                ),
                child: Text(loc, style: const TextStyle(fontSize: 12, color: AppColors.charcoal)),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _stepPrice() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _stepHeader('Expected Price', 'What price per quintal do you expect?'),
        const SizedBox(height: 24),
        TextField(
          controller: _priceCtrl,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.evergreen),
          decoration: const InputDecoration(
            prefixText: '₹ ',
            prefixStyle: TextStyle(fontSize: 20, color: AppColors.textMutedDash),
            hintText: '2500',
            suffixText: '/ Qtl',
            suffixStyle: TextStyle(fontSize: 14, color: AppColors.textMutedDash),
          ),
          autofocus: true,
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.paleSage,
            borderRadius: BorderRadius.circular(AppTheme.radiusSm),
          ),
          child: const Row(
            children: [
              Icon(Icons.info_outline, size: 16, color: AppColors.sage),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Current Nashik market rate: ₹2,490/Qtl. Set a realistic expected price.',
                  style: TextStyle(fontSize: 12, color: AppColors.textMutedDash),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _stepHarvestDate() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _stepHeader('Harvest Date', 'When was this crop harvested?'),
        const SizedBox(height: 24),
        GestureDetector(
          onTap: () async {
            final picked = await showDatePicker(
              context: context,
              initialDate: _harvestDate,
              firstDate: DateTime.now().subtract(const Duration(days: 180)),
              lastDate: DateTime.now(),
              builder: (context, child) => Theme(
                data: Theme.of(context).copyWith(
                  colorScheme: const ColorScheme.light(primary: AppColors.evergreen, onPrimary: Colors.white),
                ),
                child: child!,
              ),
            );
            if (picked != null) setState(() => _harvestDate = picked);
          },
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.cardWhite,
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              border: Border.all(color: AppColors.borderSage),
            ),
            child: Row(
              children: [
                const Icon(Icons.calendar_today_outlined, color: AppColors.sage, size: 22),
                const SizedBox(width: 12),
                Text(
                  '${_harvestDate.day} ${_monthName(_harvestDate.month)} ${_harvestDate.year}',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.charcoal),
                ),
                const Spacer(),
                const Text('Change', style: TextStyle(color: AppColors.sage, fontSize: 13, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        _stepHeader('Crop Image', 'Add an optional photo of your crop.'),
        const SizedBox(height: 12),
        GestureDetector(
          onTap: () => setState(() => _imageSelected = !_imageSelected),
          child: AnimatedContainer(
            duration: AppTheme.durationFast,
            height: 120,
            decoration: BoxDecoration(
              color: _imageSelected ? AppColors.paleSage : AppColors.cardWhite,
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              border: Border.all(
                color: _imageSelected ? AppColors.sage : AppColors.borderDash,
                style: _imageSelected ? BorderStyle.solid : BorderStyle.solid,
              ),
            ),
            child: Center(
              child: _imageSelected
                  ? Column(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(Icons.check_circle, color: AppColors.sage, size: 32),
                        SizedBox(height: 6),
                        Text('Image selected (mock)', style: TextStyle(color: AppColors.sage, fontSize: 13, fontWeight: FontWeight.w600)),
                      ],
                    )
                  : Column(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(Icons.add_photo_alternate_outlined, color: AppColors.textMutedDash, size: 32),
                        SizedBox(height: 6),
                        Text('Tap to add crop photo', style: TextStyle(color: AppColors.textMutedDash, fontSize: 13)),
                      ],
                    ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _stepReview() {
    final qty = double.tryParse(_quantityCtrl.text) ?? 0;
    final price = double.tryParse(_priceCtrl.text) ?? 0;
    final total = (price * qty) / 100;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _stepHeader('Review Your Lot', 'Confirm the details before creating.'),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardWhite,
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
            border: Border.all(color: AppColors.borderSage),
            boxShadow: [AppTheme.shadowMd],
          ),
          child: Column(
            children: [
              _reviewRow('Crop', '$_selectedCropEmoji $_selectedCropName'),
              _reviewRow('Quantity', '${_quantityCtrl.text} KG'),
              _reviewRow('Quality', _quality.label),
              _reviewRow('Location', _locationCtrl.text),
              _reviewRow('Expected Price', '₹${_priceCtrl.text}/Qtl'),
              _reviewRow('Harvest Date', '${_harvestDate.day} ${_monthName(_harvestDate.month)} ${_harvestDate.year}'),
              const Divider(height: 20, color: AppColors.borderDash),
              _reviewRow('Estimated Value', '₹${total.toStringAsFixed(0)}', highlight: true),
            ],
          ),
        ),
      ],
    );
  }

  Widget _reviewRow(String label, String value, {bool highlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textMutedDash)),
          const Spacer(),
          Text(value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: highlight ? AppColors.sage : AppColors.charcoal,
              )),
        ],
      ),
    );
  }

  Widget _stepHeader(String title, String subtitle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title,
            style: const TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.evergreen)),
        const SizedBox(height: 6),
        Text(subtitle, style: const TextStyle(fontSize: 14, color: AppColors.textMutedDash, height: 1.4)),
      ],
    );
  }

  Widget _buildSuccess() {
    return SafeArea(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ScaleTransition(
                scale: _successScale,
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: const BoxDecoration(
                    color: AppColors.paleSage,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check_circle, size: 52, color: AppColors.sage),
                ),
              ),
              const SizedBox(height: 24),
              const Text('Lot Created Successfully!',
                  style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 26, fontWeight: FontWeight.w700, color: AppColors.evergreen),
                  textAlign: TextAlign.center),
              const SizedBox(height: 12),
              Text(
                'Your $_selectedCropEmoji $_selectedCropName lot is now live. Verified buyers can see it.',
                style: const TextStyle(fontSize: 14, color: AppColors.textMutedDash, height: 1.5),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              KsButton(
                label: 'View My Lots',
                onTap: () => context.go('/sell'),
              ),
              const SizedBox(height: 12),
              KsButton(
                label: 'Go to Dashboard',
                variant: KsButtonVariant.outlined,
                onTap: () => context.go('/home'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _monthName(int month) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[month - 1];
  }
}

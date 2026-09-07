import '../models/crop_model.dart';

abstract class MockCrops {
  static const wheat = CropModel(
    id: 'wheat',
    name: 'Wheat',
    nameHi: 'गेहूं',
    nameMr: 'गहू',
    emoji: '🌾',
    imageAsset: 'assets/images/crop_wheat.png',
    category: 'Grain',
  );
  static const onion = CropModel(
    id: 'onion',
    name: 'Onion',
    nameHi: 'प्याज',
    nameMr: 'कांदा',
    emoji: '🧅',
    imageAsset: 'assets/images/crop_onion.png',
    category: 'Vegetable',
  );
  static const tomato = CropModel(
    id: 'tomato',
    name: 'Tomato',
    nameHi: 'टमाटर',
    nameMr: 'टोमॅटो',
    emoji: '🍅',
    imageAsset: 'assets/images/crop_tomato.png',
    category: 'Vegetable',
  );
  static const potato = CropModel(
    id: 'potato',
    name: 'Potato',
    nameHi: 'आलू',
    nameMr: 'बटाटा',
    emoji: '🥔',
    imageAsset: 'assets/images/crop_potato.png',
    category: 'Vegetable',
  );
  static const soybean = CropModel(
    id: 'soybean',
    name: 'Soybean',
    nameHi: 'सोयाबीन',
    nameMr: 'सोयाबीन',
    emoji: '🫘',
    imageAsset: 'assets/images/crop_soybean.png',
    category: 'Oilseed',
  );

  static const List<CropModel> all = [wheat, onion, tomato, potato, soybean];
}

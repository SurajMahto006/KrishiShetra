class CropModel {
  final String id;
  final String name;
  final String nameHi;   // Hindi
  final String nameMr;   // Marathi
  final String emoji;
  final String imageAsset;
  final String category;

  const CropModel({
    required this.id,
    required this.name,
    required this.nameHi,
    required this.nameMr,
    required this.emoji,
    required this.imageAsset,
    required this.category,
  });
}

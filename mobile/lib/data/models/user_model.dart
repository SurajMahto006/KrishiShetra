class UserModel {
  final String id;
  final String name;
  final String phone;
  final String email;
  final String village;
  final String district;
  final String state;
  final bool kycVerified;
  final String avatarInitials;
  final DateTime createdAt;

  const UserModel({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
    required this.village,
    required this.district,
    required this.state,
    this.kycVerified = true,
    required this.avatarInitials,
    required this.createdAt,
  });

  String get location => '$district, $state';
}

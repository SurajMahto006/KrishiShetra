import '../models/user_model.dart';

abstract class MockUsers {
  static final UserModel currentFarmer = UserModel(
    id: 'farmer_001',
    name: 'Rajesh Patil',
    phone: '+91 98765 43210',
    email: 'rajesh.patil@example.com',
    village: 'Sinnar',
    district: 'Nashik',
    state: 'Maharashtra',
    kycVerified: true,
    avatarInitials: 'RP',
    createdAt: DateTime(2024, 3, 15),
  );
}

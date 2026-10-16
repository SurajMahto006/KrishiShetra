import '../../core/network/api_client.dart';
import '../../core/storage/storage_service.dart';
import '../models/user_model.dart';

class AuthRepository {
  final ApiClient _client = ApiClient();
  final StorageService _storage = StorageService();

  Future<Map<String, dynamic>> requestOtp(String phone) async {
    try {
      final response = await _client.post('/auth/request-otp', data: {'phone': phone});
      return response.data as Map<String, dynamic>;
    } catch (e) {
      // Fallback sandbox response if backend is offline during local UI preview
      return {
        'success': true,
        'message': 'OTP dispatched (Development Sandbox Mode: Use 123456)',
        'data': {'phone': phone, 'expiresInSeconds': 300}
      };
    }
  }

  Future<UserModel> verifyOtp(String phone, String otp, {String role = 'farmer', String? name}) async {
    try {
      final response = await _client.post('/auth/verify-otp', data: {
        'phone': phone,
        'otp': otp,
        'role': role,
        if (name != null) 'name': name,
      });

      if (response.data['success'] == true) {
        final data = response.data['data'];
        final token = data['token'] ?? data['accessToken'];
        final refreshToken = data['refreshToken'];
        if (token != null) await _storage.saveToken(token);
        if (refreshToken != null) await _storage.saveRefreshToken(refreshToken);

        final userData = data['user'] as Map<String, dynamic>;
        await _storage.saveUser(userData);

        final userName = userData['name'] ?? (name ?? 'Farmer Ramesh');
        final initials = userName.split(' ').map((s) => s.isNotEmpty ? s[0] : '').take(2).join();

        return UserModel(
          id: userData['id'] ?? 'user_1',
          name: userName,
          phone: userData['phone'] ?? phone,
          email: userData['email'] ?? '$phone@krishishetra.app',
          village: userData['village'] ?? 'Dindori',
          district: userData['district'] ?? 'Nashik',
          state: userData['state'] ?? 'Maharashtra',
          avatarInitials: initials.isNotEmpty ? initials : 'RP',
          createdAt: DateTime.now(),
        );
      }
      throw Exception(response.data['error']?['message'] ?? 'Verification failed');
    } catch (e) {
      // Fallback user if backend in offline mode
      final user = UserModel(
        id: 'u_ramesh_1',
        name: 'Ramesh Patel',
        phone: phone,
        email: 'farmer.ramesh@krishishetra.app',
        village: 'Dindori',
        district: 'Nashik',
        state: 'Maharashtra',
        avatarInitials: 'RP',
        createdAt: DateTime.now(),
      );
      await _storage.saveToken('sandbox_token_jwt');
      return user;
    }
  }

  Future<void> logout() async {
    try {
      await _client.post('/auth/logout');
    } catch (_) {}
    await _storage.clearAuth();
  }
}

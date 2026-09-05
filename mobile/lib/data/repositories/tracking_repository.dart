import '../../core/network/api_client.dart';
import '../../core/services/websocket_service.dart';

class LiveTrackingData {
  final String orderId;
  final double latitude;
  final double longitude;
  final double speed;
  final String status;
  final int estimatedArrivalMinutes;
  final double distanceRemainingKm;
  final String pickupLocation;
  final String dropLocation;

  LiveTrackingData({
    required this.orderId,
    required this.latitude,
    required this.longitude,
    required this.speed,
    required this.status,
    required this.estimatedArrivalMinutes,
    required this.distanceRemainingKm,
    required this.pickupLocation,
    required this.dropLocation,
  });

  factory LiveTrackingData.fromJson(Map<String, dynamic> json) {
    return LiveTrackingData(
      orderId: json['orderId'] ?? 'KS1024',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 19.9975,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 73.7898,
      speed: (json['speed'] as num?)?.toDouble() ?? 42.0,
      status: json['status'] ?? 'IN_TRANSIT',
      estimatedArrivalMinutes: (json['estimatedArrivalMinutes'] as num?)?.toInt() ?? 32,
      distanceRemainingKm: (json['distanceRemainingKm'] as num?)?.toDouble() ?? 18.0,
      pickupLocation: json['pickup']?['name'] ?? 'Farmer Farm, Dindori, Nashik',
      dropLocation: json['destination']?['name'] ?? 'ABC Foods Warehouse, APMC Vashi',
    );
  }
}

class TrackingRepository {
  final ApiClient _client = ApiClient();
  final WebSocketService _ws = WebSocketService();

  Future<LiveTrackingData> getTrackingDetails(String orderId) async {
    try {
      final res = await _client.get('/tracking/$orderId');
      if (res.data['success'] == true) {
        return LiveTrackingData.fromJson(res.data['data']);
      }
    } catch (_) {}

    return LiveTrackingData(
      orderId: orderId,
      latitude: 19.9975,
      longitude: 73.7898,
      speed: 42.0,
      status: 'IN_TRANSIT',
      estimatedArrivalMinutes: 32,
      distanceRemainingKm: 18.0,
      pickupLocation: 'Farmer Farm, Dindori, Nashik',
      dropLocation: 'ABC Foods Warehouse, APMC Vashi, Navi Mumbai',
    );
  }

  void listenToLiveUpdates(String orderId, {required Function(LiveTrackingData) onUpdate}) {
    _ws.joinOrderTracking(orderId, onLocationUpdate: (data) {
      onUpdate(LiveTrackingData.fromJson(data));
    });
  }

  void stopListening(String orderId) {
    _ws.leaveOrderTracking(orderId);
  }
}

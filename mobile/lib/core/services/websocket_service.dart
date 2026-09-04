import 'package:socket_io_client/socket_io_client.dart' as socket_io;
import '../network/api_client.dart';

class WebSocketService {
  static final WebSocketService _instance = WebSocketService._internal();
  factory WebSocketService() => _instance;

  socket_io.Socket? _socket;
  bool _isConnected = false;

  bool get isConnected => _isConnected;

  WebSocketService._internal();

  void connect({String? userId, String role = 'farmer'}) {
    if (_socket != null && _socket!.connected) return;

    final url = '${ApiClient.rootUrl}/tracking';
    _socket = socket_io.io(
      url,
      socket_io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .enableAutoConnect()
          .enableReconnection()
          .setQuery({'userId': userId ?? 'farmer_user', 'role': role})
          .build(),
    );

    _socket!.onConnect((_) {
      _isConnected = true;
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
    });

    _socket!.onConnectError((_) {
      _isConnected = false;
    });
  }

  void joinOrderTracking(String orderId, {required Function(Map<String, dynamic>) onLocationUpdate}) {
    if (_socket == null) connect();

    _socket?.emit('join_order_tracking', {'orderId': orderId});
    _socket?.on('tracking_location_updated', (data) {
      if (data is Map<String, dynamic>) {
        onLocationUpdate(data);
      } else if (data is Map) {
        onLocationUpdate(Map<String, dynamic>.from(data));
      }
    });
  }

  void leaveOrderTracking(String orderId) {
    _socket?.emit('leave_order_tracking', {'orderId': orderId});
    _socket?.off('tracking_location_updated');
  }

  void sendDriverLocation({
    required String orderId,
    required double latitude,
    required double longitude,
    double? speed,
    double? heading,
    String? status,
  }) {
    if (_socket == null) connect(role: 'driver');

    _socket?.emit('driver_location_update', {
      'orderId': orderId,
      'latitude': latitude,
      'longitude': longitude,
      'speed': speed ?? 0,
      'heading': heading ?? 0,
      'status': status ?? 'IN_TRANSIT',
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
    _isConnected = false;
  }
}

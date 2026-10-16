import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../storage/storage_service.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio dio;

  // Configure appropriate default host for Emulator vs Web vs Device
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:5000/api/v1';
    } else if (Platform.isAndroid) {
      return 'http://10.0.2.2:5000/api/v1';
    } else {
      return 'http://localhost:5000/api/v1';
    }
  }

  static String get rootUrl {
    if (kIsWeb) {
      return 'http://localhost:5000';
    } else if (Platform.isAndroid) {
      return 'http://10.0.2.2:5000';
    } else {
      return 'http://localhost:5000';
    }
  }

  ApiClient._internal() {
    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await StorageService().getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          if (error.response?.statusCode == 401) {
            // Attempt token refresh if available
            final refreshToken = await StorageService().getRefreshToken();
            if (refreshToken != null && refreshToken.isNotEmpty) {
              try {
                final refreshDio = Dio(BaseOptions(baseUrl: baseUrl));
                final res = await refreshDio.post('/auth/refresh', data: {
                  'refreshToken': refreshToken,
                });
                if (res.statusCode == 200 && res.data['success'] == true) {
                  final newToken = res.data['data']['accessToken'] ?? res.data['data']['token'];
                  if (newToken != null) {
                    await StorageService().saveToken(newToken);
                    // Retry original request
                    error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
                    final retryRes = await dio.fetch(error.requestOptions);
                    return handler.resolve(retryRes);
                  }
                }
              } catch (_) {
                await StorageService().clearAuth();
              }
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    return await dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data}) async {
    return await dio.post(path, data: data);
  }

  Future<Response> put(String path, {dynamic data}) async {
    return await dio.put(path, data: data);
  }

  Future<Response> delete(String path, {dynamic data}) async {
    return await dio.delete(path, data: data);
  }
}

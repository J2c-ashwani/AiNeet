import 'dart:async';
import 'package:dio/dio.dart';
import '../security/secure_storage.dart';
import '../cache/offline_cache.dart';

/// Central API Client with Exponential Backoff Retries, Token Refresh & Offline Fallback
class NeetApiClient {
  late final Dio dio;

  static const String defaultBaseUrl = String.fromEnvironment(
    'NEET_WEB_URL',
    defaultValue: 'https://ai-neet.vercel.app',
  );

  NeetApiClient({String? baseUrl}) {
    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl ?? defaultBaseUrl,
        connectTimeout: const Duration(seconds: 8),
        receiveTimeout: const Duration(seconds: 12),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Auth & Token Interceptor
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await SecureStorageService.getAuthToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          // Handle 401 Token Refresh / Purge
          if (error.response?.statusCode == 401) {
            await SecureStorageService.clearSession();
            await OfflineCacheService.clearAll();
          }
          return handler.next(error);
        },
      ),
    );

    // Exponential Backoff Retry Interceptor for Network/5xx Errors
    dio.interceptors.add(
      InterceptorsWrapper(
        onError: (DioException error, handler) async {
          final isNetworkError = error.type == DioExceptionType.connectionTimeout ||
              error.type == DioExceptionType.sendTimeout ||
              error.type == DioExceptionType.receiveTimeout ||
              error.type == DioExceptionType.connectionError;

          final isServerError = (error.response?.statusCode ?? 0) >= 500;

          final retryCount = error.requestOptions.extra['retry_count'] as int? ?? 0;
          const maxRetries = 3;

          if ((isNetworkError || isServerError) && retryCount < maxRetries) {
            error.requestOptions.extra['retry_count'] = retryCount + 1;
            final delayMs = 1000 * (1 << retryCount); // Exponential: 1s, 2s, 4s

            await Future.delayed(Duration(milliseconds: delayMs));

            try {
              final response = await dio.fetch(error.requestOptions);
              return handler.resolve(response);
            } catch (e) {
              if (e is DioException) return handler.next(e);
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  // ── Auth Operations ─────────────────────────────────────────
  Future<Response> login(String email, String password) async {
    return await dio.post('/api/auth/login', data: {
      'email': email,
      'password': password,
    });
  }

  Future<Response> register({
    required String name,
    required String email,
    required String password,
    required String targetYear,
    String? referralCode,
  }) async {
    return await dio.post('/api/auth/register', data: {
      'name': name,
      'email': email,
      'password': password,
      'targetYear': targetYear,
      if (referralCode != null) 'referralCode': referralCode,
    });
  }

  Future<Response> verifyOtp(String email, String otp) async {
    return await dio.post('/api/auth/verify-otp', data: {
      'email': email,
      'otp': otp,
      'type': 'signup',
    });
  }

  Future<Response> getMe() async {
    return await dio.get('/api/auth/me');
  }

  // ── AI Doubt Solver & RAG Pipeline ──────────────────────────
  Future<Response> solveDoubt(String questionText, {String? imageBase64}) async {
    return await dio.post('/api/doubts/solve', data: {
      'questionText': questionText,
      if (imageBase64 != null) 'imageBase64': imageBase64,
      'model': 'gemini-1.5-flash',
    });
  }

  // ── Performance & Stats ─────────────────────────────────────
  Future<Response> getPerformance() async {
    try {
      final res = await dio.get('/api/performance');
      if (res.statusCode == 200 && res.data != null) {
        // Cache user performance locally for offline access
        await OfflineCacheService.cacheUserData('performance', res.data);
      }
      return res;
    } catch (e) {
      // Offline fallback: try reading from local cache
      final cached = await OfflineCacheService.getCachedUserData('performance');
      if (cached != null) {
        return Response(
          requestOptions: RequestOptions(path: '/api/performance'),
          statusCode: 200,
          data: cached,
        );
      }
      rethrow;
    }
  }
}

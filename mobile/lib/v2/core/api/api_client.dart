import 'dart:async';
import 'package:dio/dio.dart';
import '../security/secure_storage.dart';
import '../cache/offline_cache.dart';

/// Central API Client with Exponential Backoff Retries, Token Refresh & Offline Fallback
class NeetApiClient {
  late final Dio dio;

  static const String defaultBaseUrl = String.fromEnvironment(
    'NEET_API_URL',
    defaultValue: 'https://aineet.onrender.com',
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
            try {
              final refreshResponse = await refreshToken();
              if (refreshResponse.statusCode == 200 && refreshResponse.data != null) {
                final newToken = refreshResponse.data['token'] ?? refreshResponse.data['access_token'];
                if (newToken != null) {
                  await SecureStorageService.saveSession(
                    token: newToken,
                    refreshToken: refreshResponse.data['refreshToken'] ?? await SecureStorageService.getRefreshToken(),
                    userId: await SecureStorageService.getUserId() ?? '',
                    email: await SecureStorageService.getUserEmail() ?? '',
                  );
                  // Retry the request with new token
                  error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
                  final retryResponse = await dio.fetch(error.requestOptions);
                  return handler.resolve(retryResponse);
                }
              }
            } catch (_) {
              // Ignore refresh errors and proceed to clear session
            }
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

  Future<Response> refreshToken() async {
    final refreshTkn = await SecureStorageService.getRefreshToken();
    if (refreshTkn == null) throw Exception('No refresh token');
    return await dio.post('/api/auth/refresh-token', data: {'refresh_token': refreshTkn});
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
      'referralCode': ?referralCode,
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
      'imageBase64': ?imageBase64,
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

  // ── Tests ───────────────────────────────────────────────────
  Future<Response> generateTest({required String subject, required String topic, int count = 30}) async {
    return await dio.post('/api/tests/generate', data: {'subject': subject, 'topic': topic, 'count': count});
  }

  Future<Response> submitTest({required String testId, required Map<String, dynamic> answers, required int timeTakenSeconds}) async {
    return await dio.post('/api/tests/submit', data: {'testId': testId, 'answers': answers, 'timeTakenSeconds': timeTakenSeconds});
  }

  Future<Response> getTestResult(String testId) async {
    return await dio.get('/api/tests/result', queryParameters: {'testId': testId});
  }

  // ── Dashboard / home stats ──────────────────────────────────
  Future<Response> getHomeStats() async {
    try {
      final res = await dio.get('/api/home/stats');
      if (res.statusCode == 200 && res.data != null) {
        await OfflineCacheService.cacheUserData('home_stats', res.data);
      }
      return res;
    } catch (e) {
      final cached = await OfflineCacheService.getCachedUserData('home_stats');
      if (cached != null) {
        return Response(requestOptions: RequestOptions(path: '/api/home/stats'), statusCode: 200, data: cached);
      }
      rethrow;
    }
  }

  // ── OMR ─────────────────────────────────────────────────────
  Future<Response> gradeOmr({required String imageBase64, required String mimeType}) async {
    return await dio.post('/api/omr/grade', data: {'imageBase64': imageBase64, 'mimeType': mimeType});
  }

  // ── Revision ────────────────────────────────────────────────
  Future<Response> getRevisionDue() async {
    try {
      final res = await dio.get('/api/revision/due');
      if (res.statusCode == 200 && res.data != null) {
        await OfflineCacheService.cacheUserData('revision_queue', res.data);
      }
      return res;
    } catch (e) {
      final cached = await OfflineCacheService.getCachedUserData('revision_queue');
      if (cached != null) {
        return Response(requestOptions: RequestOptions(path: '/api/revision/due'), statusCode: 200, data: cached);
      }
      rethrow;
    }
  }

  Future<Response> logRevision({required String cardId, required String quality}) async {
    return await dio.post('/api/revision/log', data: {'cardId': cardId, 'quality': quality});
  }

  // ── Blueprint / Study Plan ──────────────────────────────────
  Future<Response> getBlueprint() async {
    try {
      final res = await dio.get('/api/blueprint');
      if (res.statusCode == 200 && res.data != null) {
        await OfflineCacheService.cacheUserData('blueprint', res.data);
      }
      return res;
    } catch (e) {
      final cached = await OfflineCacheService.getCachedUserData('blueprint');
      if (cached != null) {
        return Response(requestOptions: RequestOptions(path: '/api/blueprint'), statusCode: 200, data: cached);
      }
      rethrow;
    }
  }

  Future<Response> getStudyPlan() async {
    try {
      final res = await dio.get('/api/study-plan');
      if (res.statusCode == 200 && res.data != null) {
        await OfflineCacheService.cacheUserData('study_plan', res.data);
      }
      return res;
    } catch (e) {
      final cached = await OfflineCacheService.getCachedUserData('study_plan');
      if (cached != null) {
        return Response(requestOptions: RequestOptions(path: '/api/study-plan'), statusCode: 200, data: cached);
      }
      rethrow;
    }
  }

  // ── Leaderboard ─────────────────────────────────────────────
  Future<Response> getLeaderboard() async {
    return await dio.get('/api/leaderboard');
  }

  // ── Subscription / Billing ──────────────────────────────────
  Future<Response> verifyPlayPurchase({required String purchaseToken, required String productId}) async {
    return await dio.post('/api/subscription/play/verify', data: {'purchaseToken': purchaseToken, 'productId': productId});
  }

  Future<Response> getSubscriptionStatus() async {
    try {
      final res = await dio.get('/api/subscription/status');
      if (res.statusCode == 200 && res.data != null) {
        await OfflineCacheService.cacheUserData('subscription_status', res.data, ttlSeconds: 300);
      }
      return res;
    } catch (e) {
      final cached = await OfflineCacheService.getCachedUserData('subscription_status');
      if (cached != null) {
        return Response(requestOptions: RequestOptions(path: '/api/subscription/status'), statusCode: 200, data: cached);
      }
      rethrow;
    }
  }

  // ── Profile ─────────────────────────────────────────────────
  Future<Response> getProfile() async {
    try {
      final res = await dio.get('/api/auth/me');
      if (res.statusCode == 200 && res.data != null) {
        await OfflineCacheService.cacheUserData('profile', res.data);
      }
      return res;
    } catch (e) {
      final cached = await OfflineCacheService.getCachedUserData('profile');
      if (cached != null) {
        return Response(requestOptions: RequestOptions(path: '/api/auth/me'), statusCode: 200, data: cached);
      }
      rethrow;
    }
  }

  // ── Telemetry ───────────────────────────────────────────────
  Future<Response> trackEvent({required String event, Map<String, dynamic>? properties}) async {
    try {
      return await dio.post('/api/telemetry/mobile-events', data: {
        'event': event,
        'timestamp': DateTime.now().toIso8601String(),
        ...?properties,
      });
    } catch (_) {
      // Telemetry failures must never crash the app
      return Response(requestOptions: RequestOptions(path: '/api/telemetry/mobile-events'), statusCode: 204);
    }
  }
}

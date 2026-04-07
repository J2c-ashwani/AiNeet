/// API client singleton using Dio with auth interceptors, retry, and Sentry error reporting.
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'secure_storage.dart';

class ApiException implements Exception {
  final int statusCode;
  final String message;
  ApiException(this.statusCode, this.message);

  @override
  String toString() => 'ApiException($statusCode): $message';
}

class ApiClient {
  static const _baseUrl = 'https://ai-neet.vercel.app';
  static const _timeout = Duration(seconds: 30);

  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  late final Dio _dio;

  void init() {
    _dio = Dio(BaseOptions(
      baseUrl: _baseUrl,
      connectTimeout: _timeout,
      receiveTimeout: _timeout,
      sendTimeout: _timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client': 'android-native',
      },
    ));

    // Auth interceptor
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await SecureStorage().getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (DioException e, handler) async {
        // Report to Sentry (non-blocking)
        if (e.response?.statusCode != 401 && e.response?.statusCode != 404) {
          Sentry.captureException(e, stackTrace: e.stackTrace);
        }
        handler.next(e);
      },
    ));

    // Retry interceptor (3 retries for 5xx errors)
    _dio.interceptors.add(InterceptorsWrapper(
      onError: (DioException e, handler) async {
        final extra = e.requestOptions.extra;
        final retries = (extra['retries'] as int?) ?? 0;
        final isServerError = e.response?.statusCode != null &&
            e.response!.statusCode! >= 500;
        final isNetworkError = e.type == DioExceptionType.connectionError ||
            e.type == DioExceptionType.receiveTimeout;

        if (retries < 2 && (isServerError || isNetworkError)) {
          await Future.delayed(Duration(seconds: retries + 1));
          e.requestOptions.extra['retries'] = retries + 1;
          try {
            final response = await _dio.fetch(e.requestOptions);
            return handler.resolve(response);
          } catch (_) {}
        }
        handler.next(e);
      },
    ));
  }

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

  Future<Map<String, dynamic>> login(String email, String password) async {
    return _post('/api/auth/login', {'email': email, 'password': password});
  }

  Future<Map<String, dynamic>> register(String name, String email, String password) async {
    return _post('/api/auth/register', {'name': name, 'email': email, 'password': password});
  }

  Future<Map<String, dynamic>> getMe() async {
    return _get('/api/auth/me');
  }

  Future<void> logout() async {
    await _post('/api/auth/logout', {});
  }

  // ---------------------------------------------------------------------------
  // Tests
  // ---------------------------------------------------------------------------

  Future<Map<String, dynamic>> generateTest({
    required String subject,
    required int count,
    String difficulty = 'mixed',
    List<String> chapters = const [],
    bool isPYQ = false,
    int? year,
  }) async {
    return _post('/api/tests/generate', {
      'subject': subject,
      'count': count,
      'difficulty': difficulty,
      'chapters': chapters,
      'isPYQ': isPYQ,
      if (year != null) 'year': year,
    });
  }

  Future<Map<String, dynamic>> submitTest({
    required String testId,
    required Map<String, String> answers,
    required int timeSpentSeconds,
  }) async {
    return _post('/api/tests/submit', {
      'testId': testId,
      'answers': answers,
      'timeSpent': timeSpentSeconds,
    });
  }

  Future<Map<String, dynamic>> getResults(String testId) async {
    return _get('/api/tests/scorecard?testId=$testId');
  }

  // ---------------------------------------------------------------------------
  // Doubts
  // ---------------------------------------------------------------------------

  Future<Map<String, dynamic>> solveDoubt(String question, {String? context}) async {
    return _post('/api/doubt', {'question': question, if (context != null) 'context': context});
  }

  // ---------------------------------------------------------------------------
  // Leaderboard
  // ---------------------------------------------------------------------------

  Future<Map<String, dynamic>> getLeaderboard() async {
    return _get('/api/leaderboard');
  }

  // ---------------------------------------------------------------------------
  // Study Plan
  // ---------------------------------------------------------------------------

  Future<Map<String, dynamic>> getStudyPlan() async {
    return _get('/api/study-plan');
  }

  // ---------------------------------------------------------------------------
  // Battleground
  // ---------------------------------------------------------------------------

  Future<Map<String, dynamic>> createBattle(int questionCount, int timeLimitSeconds) async {
    return _post('/api/battleground/create', {
      'questionCount': questionCount,
      'timeLimitSeconds': timeLimitSeconds,
    });
  }

  Future<Map<String, dynamic>> joinBattle(String inviteCode) async {
    return _post('/api/battleground/join', {'inviteCode': inviteCode});
  }

  Future<Map<String, dynamic>> getBattleState(String battleId) async {
    return _get('/api/battleground/state?battleId=$battleId');
  }

  Future<void> startBattle(String battleId) async {
    await _post('/api/battleground/start', {'battleId': battleId});
  }

  Future<Map<String, dynamic>> submitBattle({
    required String battleId,
    required Map<String, String> answers,
    required int timeSpentSeconds,
  }) async {
    return _post('/api/battleground/submit', {
      'battleId': battleId,
      'answers': answers,
      'timeSpent': timeSpentSeconds,
    });
  }

  // ---------------------------------------------------------------------------
  // Profile
  // ---------------------------------------------------------------------------

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    return _put('/api/auth/me', data);
  }

  Future<Map<String, dynamic>> getPerformance() async {
    return _get('/api/performance');
  }

  // ---------------------------------------------------------------------------
  // FCM
  // ---------------------------------------------------------------------------

  Future<void> updateFcmToken(String token) async {
    try {
      await _post('/api/user/update-fcm-token', {'token': token});
    } catch (e) {
      debugPrint('FCM token update failed: $e');
    }
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  Future<Map<String, dynamic>> _get(String path) async {
    try {
      final res = await _dio.get(path);
      return res.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _toApiException(e);
    }
  }

  Future<Map<String, dynamic>> _post(String path, Map<String, dynamic> body) async {
    try {
      final res = await _dio.post(path, data: body);
      return res.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _toApiException(e);
    }
  }

  Future<Map<String, dynamic>> _put(String path, Map<String, dynamic> body) async {
    try {
      final res = await _dio.put(path, data: body);
      return res.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _toApiException(e);
    }
  }

  ApiException _toApiException(DioException e) {
    final code = e.response?.statusCode ?? 0;
    final msg = e.response?.data?['error'] ??
        e.response?.data?['message'] ??
        e.message ??
        'Unknown error';
    return ApiException(code, msg.toString());
  }
}

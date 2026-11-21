import 'dart:async';
import 'package:dio/dio.dart';
import '../security/secure_storage.dart';
import '../cache/offline_cache.dart';

/// Central API Client with Exponential Backoff Retries, Token Refresh & Offline Fallback
class NeetApiClient {
  late final Dio dio;
  late final Dio _tokenRefreshDio;

  static final StreamController<bool> _sessionExpiredController = StreamController<bool>.broadcast();
  static Stream<bool> get onSessionExpired => _sessionExpiredController.stream;

  static const String defaultBaseUrl = String.fromEnvironment(
    'NEET_API_URL',
    defaultValue: 'https://aineet.onrender.com',
  );

  NeetApiClient({String? baseUrl}) {
    final effectiveBaseUrl = baseUrl ?? defaultBaseUrl;
    
    dio = Dio(
      BaseOptions(
        baseUrl: effectiveBaseUrl,
        connectTimeout: const Duration(seconds: 8),
        receiveTimeout: const Duration(seconds: 12),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Dedicated isolated Dio instance strictly for token refreshes (no auth interceptor to avoid recursion loops)
    _tokenRefreshDio = Dio(
      BaseOptions(
        baseUrl: effectiveBaseUrl,
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
            // Guard 1: Never attempt refresh on auth endpoints (login, register, refresh) to prevent infinite loops
            final path = error.requestOptions.path;
            if (path.contains('/api/auth/')) {
              return handler.next(error);
            }

            // Guard 2: Attempt refresh once using isolated _tokenRefreshDio
            try {
              final refreshResponse = await refreshToken();
              if (refreshResponse.statusCode == 200 && refreshResponse.data != null) {
                final newToken = refreshResponse.data['token'] ?? refreshResponse.data['access_token'];
                if (newToken != null) {
                  await SecureStorageService.saveSession(
                    token: newToken,
                    refreshToken: refreshResponse.data['refresh_token'] ?? refreshResponse.data['refreshToken'] ?? await SecureStorageService.getRefreshToken(),
                    userId: await SecureStorageService.getUserId() ?? '',
                    email: await SecureStorageService.getUserEmail() ?? '',
                    name: await SecureStorageService.getUserName(),
                  );
                  // Retry the original request with the fresh token
                  error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
                  final retryResponse = await dio.fetch(error.requestOptions);
                  return handler.resolve(retryResponse);
                }
              }
            } catch (_) {
              // Refresh failed or refresh token expired
            }

            // Both token and refreshToken are dead. Purge storage and notify app router
            await SecureStorageService.clearSession();
            await OfflineCacheService.clearAll();
            _sessionExpiredController.add(true);
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
    return await _tokenRefreshDio.post('/api/auth/refresh-token', data: {'refresh_token': refreshTkn});
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

  Future<Response> verifyOtp(String email, String otp, {String type = 'signup'}) async {
    return await dio.post('/api/auth/verify-otp', data: {
      'email': email,
      'otp': otp,
      'type': type,
    });
  }

  Future<Response> resetPassword(String email) async {
    return await dio.post('/api/auth/reset-password', data: {
      'email': email,
    });
  }

  Future<Response> updatePassword(String newPassword) async {
    return await dio.post('/api/auth/update-password', data: {
      'password': newPassword,
    });
  }

  Future<Response> resendOtp(String email) async {
    return await dio.post('/api/auth/register', data: {
      'email': email,
      'resend': true,
    });
  }

  Future<Response> getMe() async {
    return await dio.get('/api/auth/me');
  }

  // ── AI Doubt Solver & RAG Pipeline ──────────────────────────
  Future<Response> solveDoubt(String questionText, {String? imageBase64, String? mimeType}) async {
    final Map<String, dynamic> payload = {
      'questionText': questionText,
      'model': 'gemini-1.5-flash',
    };
    if (imageBase64 != null) payload['imageBase64'] = imageBase64;
    if (mimeType != null) payload['mimeType'] = mimeType;
    return await dio.post('/api/doubts/solve', data: payload);
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

  // ── NCERT Library ──────────────────────────────────────────
  Future<Response> getNcertLibrary({String? subject, int? classNum}) async {
    final query = <String, dynamic>{};
    if (subject != null && subject != 'all') query['subject'] = subject.toLowerCase();
    if (classNum != null) query['class'] = classNum;
    try {
      final res = await dio.get('/api/ncert/library', queryParameters: query);
      if (res.statusCode == 200 && res.data != null) {
        await OfflineCacheService.cacheUserData(
          'ncert_lib_${subject ?? "all"}_${classNum ?? "all"}',
          res.data,
          ttlSeconds: 86400 * 7,
        );
      }
      return res;
    } catch (e) {
      final cached = await OfflineCacheService.getCachedUserData(
        'ncert_lib_${subject ?? "all"}_${classNum ?? "all"}',
      );
      if (cached != null) {
        return Response(
          requestOptions: RequestOptions(path: '/api/ncert/library'),
          statusCode: 200,
          data: cached,
        );
      }
      rethrow;
    }
  }

  // ── Syllabus & PYQ Metadata ─────────────────────────────────
  Future<Response> getSyllabus() async {
    try {
      final res = await dio.get('/api/syllabus');
      if (res.statusCode == 200 && res.data != null) {
        await OfflineCacheService.cacheUserData('syllabus_data', res.data, ttlSeconds: 86400 * 7);
      }
      return res;
    } catch (e) {
      final cached = await OfflineCacheService.getCachedUserData('syllabus_data');
      if (cached != null) {
        return Response(requestOptions: RequestOptions(path: '/api/syllabus'), statusCode: 200, data: cached);
      }
      rethrow;
    }
  }

  Future<Response> getPyqYears() async {
    try {
      final res = await dio.get('/api/pyq/years');
      if (res.statusCode == 200 && res.data != null) {
        await OfflineCacheService.cacheUserData('pyq_years', res.data, ttlSeconds: 86400 * 7);
      }
      return res;
    } catch (e) {
      final cached = await OfflineCacheService.getCachedUserData('pyq_years');
      if (cached != null) {
        return Response(requestOptions: RequestOptions(path: '/api/pyq/years'), statusCode: 200, data: cached);
      }
      rethrow;
    }
  }

  // ── Tests ───────────────────────────────────────────────────
  Future<Response> generateTest({
    List<dynamic>? subjects,
    List<dynamic>? chapters,
    List<dynamic>? topics,
    String? difficulty,
    int? questionCount,
    String type = 'custom',
    String? year,
    String? subject,
    String? topic,
    dynamic subjectId,
    dynamic topicId,
  }) async {
    if (type == 'adaptive') {
      final payload = <String, dynamic>{
        'count': questionCount ?? 15,
      };
      if (subjectId != null) {
        payload['subjectId'] = subjectId;
      } else if (subject != null) {
        payload['subjectId'] = subject;
      } else if (subjects != null && subjects.isNotEmpty) {
        payload['subjectId'] = subjects.first;
      }
      if (topicId != null) {
        payload['topicId'] = topicId;
      } else if (topic != null) {
        payload['topicId'] = topic;
      }
      return await dio.post('/api/tests/adaptive', data: payload);
    }

    if (type == 'pyq') {
      final payload = <String, dynamic>{
        'questionCount': questionCount ?? 20,
      };
      if (subjects != null && subjects.isNotEmpty) payload['subjects'] = subjects;
      if (chapters != null && chapters.isNotEmpty) payload['chapters'] = chapters;
      if (topics != null && topics.isNotEmpty) payload['topics'] = topics;
      return await dio.post('/api/tests/pyq', data: payload);
    }

    final payload = <String, dynamic>{
      'type': type,
    };
    if (subjects != null && subjects.isNotEmpty) {
      payload['subjects'] = subjects;
    } else if (subject != null && subject.isNotEmpty) {
      payload['subjects'] = [subject.toLowerCase()];
    }
    if (chapters != null && chapters.isNotEmpty) payload['chapters'] = chapters;
    if (topics != null && topics.isNotEmpty) {
      payload['topics'] = topics;
    } else if (topic != null && topic.isNotEmpty) {
      payload['topics'] = [topic];
    }
    if (difficulty != null && difficulty != 'all') {
      payload['difficulty'] = difficulty.toLowerCase();
    }
    if (questionCount != null) {
      payload['questionCount'] = questionCount;
    }
    if (year != null && year.isNotEmpty) {
      payload['year'] = year;
    }

    return await dio.post('/api/tests/generate', data: payload);
  }

  Future<Response> generatePyqTest({required String chapterName, int questionCount = 20}) async {
    return await dio.post('/api/tests/pyq', data: {
      'chapter_name': chapterName,
      'questionCount': questionCount,
    });
  }

  Future<Response> submitTest({
    required String testId,
    required List<Map<String, dynamic>> answers,
    required int timeTakenSeconds,
  }) async {
    return await dio.post('/api/tests/submit', data: {
      'testId': testId,
      'answers': answers,
      'timeTaken': timeTakenSeconds,
    });
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
  Future<Response> scanOmr({
    required String imageBase64,
    required String mimeType,
    required String testId,
  }) async {
    return await dio.post('/api/omr/scan', data: {
      'imageBase64': imageBase64,
      'mimeType': mimeType,
      'testId': testId,
    });
  }

  Future<Response> gradeOmr({
    required Map<String, dynamic> verifiedAnswers,
    required String testId,
  }) async {
    return await dio.post('/api/omr/grade', data: {
      'verifiedAnswers': verifiedAnswers,
      'testId': testId,
    });
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

  Future<Response> logRevision({required String questionId, required int quality}) async {
    return await dio.post('/api/revision/log', data: {'questionId': questionId, 'quality': quality});
  }

  // ── Blueprint / Study Plan ──────────────────────────────────
  Future<Response> getBlueprint({String viewType = 'chapter'}) async {
    try {
      final res = await dio.get('/api/blueprint', queryParameters: {'viewType': viewType});
      if (res.statusCode == 200 && res.data != null) {
        await OfflineCacheService.cacheUserData('blueprint_$viewType', res.data);
      }
      return res;
    } catch (e) {
      final cached = await OfflineCacheService.getCachedUserData('blueprint_$viewType');
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
    try {
      final res = await dio.get('/api/leaderboard');
      if (res.statusCode == 200 && res.data != null) {
        await OfflineCacheService.cacheUserData('leaderboard', res.data, ttlSeconds: 300);
      }
      return res;
    } catch (e) {
      final cached = await OfflineCacheService.getCachedUserData('leaderboard');
      if (cached != null) {
        return Response(requestOptions: RequestOptions(path: '/api/leaderboard'), statusCode: 200, data: cached);
      }
      rethrow;
    }
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

  // ── Push Notifications (FCM) ────────────────────────────────
  Future<Response> updateFcmToken({
    required String token,
    String? deviceId,
    String timezone = 'Asia/Kolkata',
  }) async {
    try {
      final payload = <String, dynamic>{
        'token': token,
        'timezone': timezone,
      };
      if (deviceId != null) payload['deviceId'] = deviceId;
      return await dio.post('/api/user/update-fcm-token', data: payload);
    } catch (_) {
      return Response(requestOptions: RequestOptions(path: '/api/user/update-fcm-token'), statusCode: 200);
    }
  }

  // ── AI Daily Coach ──────────────────────────────────────────
  Future<Response> getDailyCoach() async {
    try {
      final res = await dio.get('/api/coach/daily');
      if (res.statusCode == 200 && res.data != null) {
        await OfflineCacheService.cacheUserData('daily_coach', res.data, ttlSeconds: 14400);
      }
      return res;
    } catch (e) {
      final cached = await OfflineCacheService.getCachedUserData('daily_coach');
      if (cached != null) {
        return Response(requestOptions: RequestOptions(path: '/api/coach/daily'), statusCode: 200, data: cached);
      }
      rethrow;
    }
  }

  // ── Peer Challenges (1v1 WhatsApp Duels) ─────────────────────
  Future<Response> createChallenge() async {
    return await dio.post('/api/challenge/create');
  }

  Future<Response> getChallengeDetails(String challengeId) async {
    return await dio.get('/api/challenge/details', queryParameters: {'id': challengeId});
  }

  // ── Multiplayer Battleground (Live Rooms) ───────────────────
  Future<Response> createBattlegroundRoom({int questionCount = 10, int timeLimitMinutes = 10}) async {
    return await dio.post('/api/battleground/create', data: {
      'questionCount': questionCount,
      'timeLimitMinutes': timeLimitMinutes,
    });
  }

  Future<Response> joinBattlegroundRoom(String inviteCode) async {
    return await dio.post('/api/battleground/join', data: {
      'inviteCode': inviteCode.trim().toUpperCase(),
    });
  }

  Future<Response> startBattlegroundRoom(String battleId) async {
    return await dio.post('/api/battleground/start', data: {
      'battleId': battleId,
    });
  }

  Future<Response> getBattlegroundState(String battleId) async {
    return await dio.get('/api/battleground/state', queryParameters: {'battleId': battleId});
  }

  Future<Response> submitBattleground({
    required String battleId,
    required Map<String, dynamic> answers,
    required int timeTaken,
  }) async {
    return await dio.post('/api/battleground/submit', data: {
      'battleId': battleId,
      'answers': answers,
      'timeTaken': timeTaken,
    });
  }

  // ── Parental Controls & Summary Reports ─────────────────────
  Future<Response> getParentSettings() async {
    try {
      final res = await dio.get('/api/user/parent-settings');
      if (res.statusCode == 200 && res.data != null) {
        await OfflineCacheService.cacheUserData('parent_settings', res.data, ttlSeconds: 86400);
      }
      return res;
    } catch (e) {
      final cached = await OfflineCacheService.getCachedUserData('parent_settings');
      if (cached != null) {
        return Response(requestOptions: RequestOptions(path: '/api/user/parent-settings'), statusCode: 200, data: cached);
      }
      rethrow;
    }
  }

  Future<Response> updateParentSettings({
    required String parentEmail,
    required String parentPhone,
    bool consentGiven = true,
  }) async {
    return await dio.post('/api/user/parent-settings', data: {
      'parent_email': parentEmail.trim(),
      'parent_phone': parentPhone.trim(),
      'consent_given': consentGiven,
    });
  }

  // ── Achievements & Trophy Cabinet ───────────────────────────
  Future<Response> getAchievements() async {
    try {
      final res = await dio.get('/api/achievements');
      if (res.statusCode == 200 && res.data != null) {
        await OfflineCacheService.cacheUserData('achievements', res.data, ttlSeconds: 86400);
      }
      return res;
    } catch (e) {
      final cached = await OfflineCacheService.getCachedUserData('achievements');
      if (cached != null) {
        return Response(requestOptions: RequestOptions(path: '/api/achievements'), statusCode: 200, data: cached);
      }
      rethrow;
    }
  }
}

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/models.dart';
import '../core/api_client.dart';
import '../core/secure_storage.dart';

/// --------------------------------------------------------------------------
/// Auth State
/// --------------------------------------------------------------------------

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthState {
  final AuthStatus status;
  final UserModel? user;
  final String? error;

  const AuthState({
    required this.status,
    this.user,
    this.error,
  });

  const AuthState.unknown() : status = AuthStatus.unknown, user = null, error = null;
  const AuthState.unauthenticated({String? error})
      : status = AuthStatus.unauthenticated, user = null, error = error;
  const AuthState.authenticated(UserModel user)
      : status = AuthStatus.authenticated, user = user, error = null;

  bool get isAuthenticated => status == AuthStatus.authenticated;
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _api;
  final SecureStorage _storage;

  AuthNotifier(this._api, this._storage) : super(const AuthState.unknown());

  Future<void> initialize() async {
    try {
      final hasSession = await _storage.hasSession();
      if (!hasSession) {
        state = const AuthState.unauthenticated();
        return;
      }
      final data = await _api.getMe();
      final user = UserModel.fromJson(data['user'] ?? data);
      state = AuthState.authenticated(user);
    } catch (_) {
      await _storage.clearSession();
      state = const AuthState.unauthenticated();
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      final data = await _api.login(email, password);
      final token = data['token']?.toString() ?? '';
      final user = UserModel.fromJson(data['user'] ?? data);
      await _storage.saveSession(
        token: token,
        userId: user.id,
        email: user.email,
      );
      state = AuthState.authenticated(user);
      return true;
    } on ApiException catch (e) {
      state = AuthState.unauthenticated(error: e.message);
      return false;
    }
  }

  Future<bool> register(String name, String email, String password) async {
    try {
      final data = await _api.register(name, email, password);
      final token = data['token']?.toString() ?? '';
      final user = UserModel.fromJson(data['user'] ?? data);
      await _storage.saveSession(
        token: token,
        userId: user.id,
        email: user.email,
      );
      state = AuthState.authenticated(user);
      return true;
    } on ApiException catch (e) {
      state = AuthState.unauthenticated(error: e.message);
      return false;
    }
  }

  Future<void> logout() async {
    await _api.logout();
    await _storage.clearSession();
    state = const AuthState.unauthenticated();
  }
}

// Providers
final secureStorageProvider = Provider<SecureStorage>((ref) => SecureStorage());
final apiClientProvider = Provider<ApiClient>((ref) {
  final client = ApiClient();
  client.init();
  return client;
});

final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.read(apiClientProvider),
    ref.read(secureStorageProvider),
  );
});

/// --------------------------------------------------------------------------
/// Connectivity State
/// --------------------------------------------------------------------------

final connectivityProvider = StreamProvider<bool>((ref) async* {
  // Simple periodic connectivity check
  while (true) {
    try {
      final client = ApiClient();
      await client.getMe();
      yield true;
    } catch (_) {
      yield false;
    }
    await Future.delayed(const Duration(seconds: 15));
  }
});

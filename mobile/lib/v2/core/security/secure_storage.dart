import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Secure Storage wrapper for Auth Tokens and Sensitive User Session data
class SecureStorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const String _keyAuthToken = 'v2_auth_token';
  static const String _keyRefreshToken = 'v2_refresh_token';
  static const String _keyUserId = 'v2_user_id';
  static const String _keyUserEmail = 'v2_user_email';

  static Future<void> saveSession({
    required String token,
    String? refreshToken,
    required String userId,
    required String email,
  }) async {
    await _storage.write(key: _keyAuthToken, value: token);
    if (refreshToken != null) {
      await _storage.write(key: _keyRefreshToken, value: refreshToken);
    }
    await _storage.write(key: _keyUserId, value: userId);
    await _storage.write(key: _keyUserEmail, value: email);
  }

  static Future<String?> getAuthToken() async {
    return await _storage.read(key: _keyAuthToken);
  }

  static Future<String?> getRefreshToken() async {
    return await _storage.read(key: _keyRefreshToken);
  }

  static Future<String?> getUserId() async {
    return await _storage.read(key: _keyUserId);
  }

  static Future<String?> getUserEmail() async {
    return await _storage.read(key: _keyUserEmail);
  }

  static Future<void> clearSession() async {
    await _storage.deleteAll();
  }
}

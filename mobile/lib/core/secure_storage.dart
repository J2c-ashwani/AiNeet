import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Encrypted key-value storage using the OS keystore (Android Keystore / iOS Keychain).
class SecureStorage {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
  );

  static const _keyToken = 'auth_token';
  static const _keyUserId = 'user_id';
  static const _keyEmail = 'user_email';
  static const _keyFcmToken = 'fcm_token';

  Future<void> saveSession({
    required String token,
    required String userId,
    required String email,
  }) async {
    await Future.wait([
      _storage.write(key: _keyToken, value: token),
      _storage.write(key: _keyUserId, value: userId),
      _storage.write(key: _keyEmail, value: email),
    ]);
  }

  Future<String?> getToken() => _storage.read(key: _keyToken);
  Future<String?> getUserId() => _storage.read(key: _keyUserId);
  Future<String?> getEmail() => _storage.read(key: _keyEmail);

  Future<void> saveFcmToken(String token) =>
      _storage.write(key: _keyFcmToken, value: token);
  Future<String?> getFcmToken() => _storage.read(key: _keyFcmToken);

  Future<bool> hasSession() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> clearSession() async {
    await Future.wait([
      _storage.delete(key: _keyToken),
      _storage.delete(key: _keyUserId),
      _storage.delete(key: _keyEmail),
    ]);
  }

  Future<void> clearAll() => _storage.deleteAll();
}

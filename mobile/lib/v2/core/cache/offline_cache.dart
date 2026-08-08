import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';

/// Offline Cache Service powering V2 offline resilience
class OfflineCacheService {
  static const String _boxName = 'v2_neet_cache';
  static Box? _box;
  static final Map<String, String> _memoryStore = {};

  static Future<void> initialize() async {
    try {
      await Hive.initFlutter();
      _box = await Hive.openBox(_boxName);
      debugPrint('✅ [V2 OfflineCache] Hive initialized successfully');
    } catch (e) {
      debugPrint('⚠️ [V2 OfflineCache] Hive fallback to memory: $e');
    }
  }

  static Future<void> cacheUserData(String key, dynamic data) async {
    final encoded = jsonEncode(data);
    if (_box != null && _box!.isOpen) {
      await _box!.put(key, encoded);
    } else {
      _memoryStore[key] = encoded;
    }
  }

  static Future<dynamic> getCachedUserData(String key) async {
    String? raw;
    if (_box != null && _box!.isOpen) {
      raw = _box!.get(key) as String?;
    } else {
      raw = _memoryStore[key];
    }
    if (raw == null) return null;
    try {
      return jsonDecode(raw);
    } catch (_) {
      return null;
    }
  }

  static Future<void> clearAll() async {
    if (_box != null && _box!.isOpen) {
      await _box!.clear();
    }
    _memoryStore.clear();
  }
}

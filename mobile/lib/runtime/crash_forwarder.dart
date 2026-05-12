// mobile/lib/runtime/crash_forwarder.dart
// Bridges JS runtime errors from the WebView into Firebase Crashlytics.

import 'dart:convert';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:flutter/foundation.dart';

class CrashForwarder {
  static WebViewController? _controller;

  static void attachController(WebViewController controller) {
    _controller = controller;
  }

  /// Called directly from main.dart's JS channel callback
  static Future<void> handleJsCrashMessage(String rawMessage) async {
    try {
      final Map<String, dynamic> event = jsonDecode(rawMessage);
      final String type    = event['type']    as String? ?? 'non_fatal';
      final String message = event['message'] as String? ?? 'Unknown JS error';
      final String stack   = event['stack']   as String? ?? '';

      final exception = Exception('JS[$type]: $message');
      final trace     = StackTrace.fromString(
          stack.isNotEmpty ? stack : '#0 JavaScript (WebView)');

      if (type == 'fatal') {
        await FirebaseCrashlytics.instance.recordError(exception, trace, fatal: true);
      } else {
        await FirebaseCrashlytics.instance.recordError(exception, trace, fatal: false);
      }

      if (kDebugMode) {
        debugPrint('[CrashForwarder] Recorded $type: $message');
      }
    } catch (e) {
      // Crash forwarder must never crash the app
      debugPrint('[CrashForwarder] Failed to forward error: $e');
    }
  }
}

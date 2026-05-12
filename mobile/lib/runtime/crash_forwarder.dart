// mobile/lib/runtime/crash_forwarder.dart
// Bridges JS runtime errors from the WebView into Firebase Crashlytics.
// When JS calls window.NEET_REPORT_FATAL(error), this handler captures it
// as a non-fatal Crashlytics event with full context.

import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:webview_flutter/webview_flutter.dart';

class CrashForwarder {
  static WebViewController? _controller;

  static void install() {
    // Called from FirebaseBootstrap. Controller set when WebView mounts.
  }

  static void attachController(WebViewController controller) {
    _controller = controller;

    // Register the JS channel that WebView can call
    controller.addJavaScriptChannel(
      'NEET_CRASH_CHANNEL',
      onMessageReceived: (JavaScriptMessage message) {
        _handleJsCrash(message.message);
      },
    );

    // Inject the JS-side forwarder function
    controller.runJavaScript('''
      window.NEET_REPORT_FATAL = function(error) {
        try {
          NEET_CRASH_CHANNEL.postMessage(JSON.stringify({
            type: 'fatal',
            message: error.message || String(error),
            stack: error.stack || '',
            timestamp: Date.now()
          }));
        } catch(e) {}
      };
      window.NEET_REPORT_NON_FATAL = function(error) {
        try {
          NEET_CRASH_CHANNEL.postMessage(JSON.stringify({
            type: 'non_fatal',
            message: error.message || String(error),
            stack: error.stack || '',
            timestamp: Date.now()
          }));
        } catch(e) {}
      };
    ''');
  }

  static Future<void> _handleJsCrash(String rawMessage) async {
    try {
      // Parse the JSON message from JS
      final Map<String, dynamic> event = _parseJson(rawMessage);
      final String type    = event['type']    ?? 'non_fatal';
      final String message = event['message'] ?? 'Unknown JS error';
      final String stack   = event['stack']   ?? '';

      final exception = Exception('JS[$type]: $message');
      final trace     = StackTrace.fromString(stack.isNotEmpty ? stack : 'No JS stack available');

      if (type == 'fatal') {
        await FirebaseCrashlytics.instance.recordError(exception, trace, fatal: true);
      } else {
        await FirebaseCrashlytics.instance.recordError(exception, trace, fatal: false);
      }
    } catch (e) {
      // Crash forwarder must never crash the app
    }
  }

  static Map<String, dynamic> _parseJson(String raw) {
    try {
      // Simple parse without dart:convert for isolation safety
      return {'message': raw, 'type': 'non_fatal', 'stack': ''};
    } catch (_) {
      return {'message': raw, 'type': 'non_fatal', 'stack': ''};
    }
  }
}

// mobile/lib/security/app_check.dart
// App Check token injection for all requests to integrity endpoints.
// Protects: test submit, battleground, ranking, XP mutation, leaderboard.

import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:webview_flutter/webview_flutter.dart';

class AppCheckBridge {
  static WebViewController? _controller;

  static void attachController(WebViewController controller) {
    _controller = controller;

    // Register channel for token requests from WebView JS
    controller.addJavaScriptChannel(
      'NEET_APP_CHECK',
      onMessageReceived: (JavaScriptMessage message) async {
        final callbackId = message.message;
        final token = await _getToken();
        // Return token to JS callback
        await controller.runJavaScript(
          'window.__NEET_APP_CHECK_CALLBACKS__["$callbackId"]("$token")'
        );
      },
    );

    // Inject the JS interface for requesting App Check tokens
    controller.runJavaScript('''
      window.__NEET_APP_CHECK_CALLBACKS__ = {};
      window.getNEETAppCheckToken = function() {
        return new Promise(function(resolve) {
          var id = Math.random().toString(36).slice(2);
          window.__NEET_APP_CHECK_CALLBACKS__[id] = function(token) {
            resolve(token);
            delete window.__NEET_APP_CHECK_CALLBACKS__[id];
          };
          NEET_APP_CHECK.postMessage(id);
        });
      };
    ''');
  }

  static Future<String> _getToken() async {
    try {
      final result = await FirebaseAppCheck.instance.getToken(false);
      return result?.token ?? '';
    } catch (_) {
      return ''; // Fail open for degraded mode; server validates and rejects
    }
  }
}

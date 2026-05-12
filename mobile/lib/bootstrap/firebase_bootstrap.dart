// mobile/lib/bootstrap/firebase_bootstrap.dart
// Firebase initialization for NEETCoach Flutter shell.
// Initializes Crashlytics, App Check, and crash forwarding bridge.

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:flutter/foundation.dart';

import 'package:neet_coach/runtime/crash_forwarder.dart';

class FirebaseBootstrap {
  static bool _initialized = false;

  static Future<void> initialize() async {
    if (_initialized) return;
    _initialized = true;

    await Firebase.initializeApp();

    // ── Crashlytics ────────────────────────────────────────
    if (!kDebugMode) {
      // Enable in release builds only
      await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(true);
    } else {
      await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(false);
    }

    // Capture all Flutter framework errors
    FlutterError.onError = (errorDetails) {
      FirebaseCrashlytics.instance.recordFlutterFatalError(errorDetails);
    };

    // Capture all async errors not caught by Flutter
    PlatformDispatcher.instance.onError = (error, stack) {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
      return true;
    };

    // ── App Check ──────────────────────────────────────────
    await FirebaseAppCheck.instance.activate(
      // Play Integrity on Android (requires Play Store distribution)
      androidProvider: AndroidProvider.playIntegrity,
      // DeviceCheck on iOS if/when iOS is added
      appleProvider: AppleProvider.deviceCheck,
    );

    // Install JS crash forwarder bridge
    CrashForwarder.install();
  }
}

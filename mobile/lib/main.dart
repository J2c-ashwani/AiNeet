import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'core/ad_service.dart';
import 'v2/app.dart';
import 'v2/core/cache/offline_cache.dart';
import 'v2/core/telemetry/frame_observer.dart';

const String kAppVersion = '1.1.0';

// Background message handler (must be top-level function)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    await Firebase.initializeApp();
    debugPrint('Background message received: ${message.notification?.title}');
  } catch (e) {
    debugPrint('Error in background message handler: $e');
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system navigation and status bar style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF080C18),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  // Initialize Firebase Core
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('⚠️ Firebase.initializeApp warning: $e');
  }

  // Parallelize secondary SDK initializations
  await Future.wait([
    // 1. Crashlytics
    (() async {
      try {
        if (!kDebugMode) {
          await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(true);
        } else {
          await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(false);
        }
      } catch (e) {
        debugPrint('⚠️ Crashlytics init skipped: $e');
      }
    })(),

    // 2. App Check
    (() async {
      try {
        await FirebaseAppCheck.instance.activate(
          providerAndroid: kDebugMode
              ? const AndroidDebugProvider()
              : const AndroidPlayIntegrityProvider(),
          providerApple: const AppleDeviceCheckProvider(),
        );
      } catch (e) {
        debugPrint('⚠️ AppCheck init skipped: $e');
      }
    })(),

    // 3. Offline Hive Cache Box Initialization (P0 Fix)
    (() async {
      try {
        await OfflineCacheService.initialize();
      } catch (e) {
        debugPrint('⚠️ OfflineCacheService init failed: $e');
      }
    })(),

    // 4. AdMob
    (() async {
      try {
        await AdService().initialize();
      } catch (e) {
        debugPrint('⚠️ AdMob init failed: $e');
      }
    })(),
  ]);

  // Initialize V2 Frame and Telemetry Observer (P2 Fix)
  V2FrameObserver.initialize();

  // Catch all Flutter framework errors
  FlutterError.onError = (errorDetails) {
    try {
      FirebaseCrashlytics.instance.recordFlutterFatalError(errorDetails);
    } catch (_) {}
  };

  // Catch all async errors not caught by Flutter
  PlatformDispatcher.instance.onError = (error, stack) {
    try {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
    } catch (_) {}
    return true;
  };

  // Register background message handler
  try {
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  } catch (e) {
    debugPrint('⚠️ FCM background handler registration skipped: $e');
  }

  runApp(const NeetV2App());
}

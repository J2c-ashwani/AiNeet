import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:io';
import 'providers/providers.dart';
import 'router/app_router.dart';
import 'core/api_client.dart';
import 'core/secure_storage.dart';

// Background FCM handler (top-level)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // System UI: force dark navigation bar
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF0a0e1a),
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  // Lock to portrait
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

  // Firebase — wrapped in try-catch with a timeout so the app launches even if Firebase hangs
  try {
    // Add a 3-second timeout to prevent infinite hanging on devices with broken Play Services
    await Firebase.initializeApp().timeout(const Duration(seconds: 3));
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  } catch (e) {
    debugPrint('⚠️ Firebase init failed or timed out: $e — app will continue without push notifications');
  }

  // Sentry crash reporting
  await SentryFlutter.init(
    (options) {
      options.dsn = const String.fromEnvironment(
        'SENTRY_DSN',
        defaultValue: '',
      );
      options.tracesSampleRate = 0.3;
      options.attachScreenshot = true;
      options.enableAutoSessionTracking = true;
    },
    appRunner: () => runApp(
      const ProviderScope(
        child: NeetCoachApp(),
      ),
    ),
  );
}

class NeetCoachApp extends ConsumerStatefulWidget {
  const NeetCoachApp({super.key});

  @override
  ConsumerState<NeetCoachApp> createState() => _NeetCoachAppState();
}

class _NeetCoachAppState extends ConsumerState<NeetCoachApp> {
  late GoRouter _router;
  bool _isJailbroken = false;
  bool _jailbreakCheckDone = false;

  @override
  void initState() {
    super.initState();
    _checkJailbreak();
    // Initialize auth state from secure storage
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(authNotifierProvider.notifier).initialize();
      _setupFCM();
    });
  }

  Future<void> _checkJailbreak() async {
    try {
      // Pure Dart root detection — checks for common root binaries
      final rootPaths = [
        '/system/app/Superuser.apk',
        '/sbin/su',
        '/system/bin/su',
        '/system/xbin/su',
        '/data/local/xbin/su',
        '/data/local/bin/su',
        '/system/sd/xbin/su',
        '/system/bin/failsafe/su',
        '/data/local/su',
        '/su/bin/su',
      ];
      bool jailbroken = false;
      for (final path in rootPaths) {
        if (await File(path).exists()) {
          jailbroken = true;
          break;
        }
      }
      if (mounted) setState(() {
        _isJailbroken = jailbroken;
        _jailbreakCheckDone = true;
      });
    } catch (_) {
      if (mounted) setState(() => _jailbreakCheckDone = true);
    }
  }

  Future<void> _setupFCM() async {
    try {
      final messaging = FirebaseMessaging.instance;

      await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      await messaging.subscribeToTopic('all_users');
      await messaging.subscribeToTopic('daily_reminders');

      // Get and sync FCM token
      final token = await messaging.getToken();
      if (token != null) {
        await SecureStorage().saveFcmToken(token);
        await ApiClient().updateFcmToken(token);
      }

      // Token refresh
      messaging.onTokenRefresh.listen((newToken) async {
        await SecureStorage().saveFcmToken(newToken);
        await ApiClient().updateFcmToken(newToken);
      });

      // Foreground notifications
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        // Show in-app snackbar
        final ctx = _router.routerDelegate.navigatorKey.currentContext;
        if (ctx != null && message.notification != null) {
          ScaffoldMessenger.of(ctx).showSnackBar(
            SnackBar(
              content: Text(message.notification!.title ?? 'Notification'),
              behavior: SnackBarBehavior.floating,
              backgroundColor: const Color(0xFF6366f1),
              action: SnackBarAction(
                label: 'View',
                textColor: Colors.white,
                onPressed: () => _handleNotificationTap(message),
              ),
            ),
          );
        }
      });

      // Notification tap when app is in background
      FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

      // Notification tap when app was terminated
      final initialMessage = await messaging.getInitialMessage();
      if (initialMessage != null) _handleNotificationTap(initialMessage);
    } catch (e) {
      debugPrint('⚠️ FCM setup failed: $e — push notifications disabled');
    }
  }

  void _handleNotificationTap(RemoteMessage message) {
    final route = message.data['route'] as String?;
    if (route != null && mounted) {
      _router.go(route);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_jailbreakCheckDone) {
      return const MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Scaffold(
          backgroundColor: Color(0xFF0a0e1a),
          body: Center(child: CircularProgressIndicator(color: Color(0xFF6366f1))),
        ),
      );
    }

    if (_isJailbroken) {
      return const MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Scaffold(
          backgroundColor: Color(0xFF0a0e1a),
          body: Center(
            child: Padding(
              padding: EdgeInsets.all(30),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.gpp_bad, color: Color(0xFFef4444), size: 72),
                  SizedBox(height: 24),
                  Text('Security Risk Detected', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                  SizedBox(height: 16),
                  Text('This application cannot run on rooted or jailbroken devices to protect your data and ensure fair testing.',
                    textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF94a3b8), height: 1.5)),
                  SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ),
      );
    }

    _router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'AI NEET Coach',
      debugShowCheckedModeBanner: false,
      routerConfig: _router,

      // --- App Theme ---
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366f1),
          brightness: Brightness.dark,
          surface: const Color(0xFF0a0e1a),
          primary: const Color(0xFF6366f1),
          secondary: const Color(0xFF10b981),
          error: const Color(0xFFef4444),
        ),
        scaffoldBackgroundColor: const Color(0xFF0a0e1a),
        textTheme: GoogleFonts.interTextTheme(
          ThemeData.dark().textTheme,
        ).apply(bodyColor: const Color(0xFFe2e8f0)),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0a0e1a),
          elevation: 0,
          scrolledUnderElevation: 0,
          titleTextStyle: TextStyle(
            color: Color(0xFFf1f5f9),
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
          iconTheme: IconThemeData(color: Color(0xFFe2e8f0)),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Color(0xFF111827),
          selectedItemColor: Color(0xFF6366f1),
          unselectedItemColor: Color(0xFF475569),
          type: BottomNavigationBarType.fixed,
          elevation: 0,
        ),
        cardTheme: CardThemeData(
          color: const Color(0xFF1e293b),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: Color(0x14FFFFFF)),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFF1e293b),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0x30FFFFFF)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0x20FFFFFF)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFF6366f1), width: 2),
          ),
          hintStyle: const TextStyle(color: Color(0xFF64748b)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF6366f1),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
          ),
        ),
      ),

      // Global error widget
      builder: (context, child) {
        ErrorWidget.builder = (FlutterErrorDetails details) {
          Sentry.captureException(details.exception, stackTrace: details.stack);
          return Container(
            color: const Color(0xFF0a0e1a),
            alignment: Alignment.center,
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('🧠', style: TextStyle(fontSize: 48)),
                const SizedBox(height: 16),
                const Text('Something went wrong', style: TextStyle(color: Color(0xFFf1f5f9), fontSize: 18, fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                const Text('Please restart the app. Our team has been notified.', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF94a3b8))),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => (child as dynamic).reassemble(),
                  child: const Text('Try Again'),
                ),
              ],
            ),
          );
        };
        return child ?? const SizedBox.shrink();
      },
    );
  }
}

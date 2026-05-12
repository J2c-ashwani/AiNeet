import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'core/ad_service.dart';
import 'runtime/crash_forwarder.dart';
import 'security/app_check.dart';

// Background message handler (must be top-level function)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('Background message received: ${message.notification?.title}');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  // ── Crashlytics ────────────────────────────────────────────
  if (!kDebugMode) {
    await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(true);
  } else {
    await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(false);
  }

  // Catch all Flutter framework errors
  FlutterError.onError = (errorDetails) {
    FirebaseCrashlytics.instance.recordFlutterFatalError(errorDetails);
  };

  // Catch all async errors not caught by Flutter
  PlatformDispatcher.instance.onError = (error, stack) {
    FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
    return true;
  };

  // ── App Check ──────────────────────────────────────────────
  await FirebaseAppCheck.instance.activate(
    androidProvider: kDebugMode
        ? AndroidProvider.debug
        : AndroidProvider.playIntegrity,
    appleProvider: AppleProvider.deviceCheck,
  );

  // Register background message handler
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  // AdMob — initialize after Firebase
  try {
    await AdService().initialize();
  } catch (e) {
    debugPrint('⚠️ AdMob init failed: $e — app will continue without ads');
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AI NEET Coach',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.deepPurple,
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF080c18),
        useMaterial3: true,
      ),
      home: const WebViewScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> with WidgetsBindingObserver {
  late final WebViewController controller;
  String? _fcmToken;
  final AdService _adService = AdService();
  BannerAd? _bannerAd;
  bool _isBannerReady = false;
  bool _hideAdsOnCurrentPage = false;

  // Pages where ads should NOT show (sacred UX)
  final List<String> _noAdPages = [
    '/test/',        // During live tests
    '/battleground', // Real-time multiplayer
    '/ncert/',       // PDF reader
    '/battle/',      // 1v1 battles
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initNotifications();
    _initWebView();
    _loadBannerAd();
    _adService.loadInterstitialAd();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _adService.dispose();
    super.dispose();
  }

  // ── App Lifecycle → forward to JS lifecycle manager ─────────
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.paused:
        controller.runJavaScript(
          'if (window.NEET_LIFECYCLE) window.NEET_LIFECYCLE("PAUSE");'
        );
        break;
      case AppLifecycleState.resumed:
        controller.runJavaScript(
          'if (window.NEET_LIFECYCLE) window.NEET_LIFECYCLE("RESUME");'
        );
        break;
      case AppLifecycleState.detached:
        controller.runJavaScript(
          'if (window.NEET_LIFECYCLE) window.NEET_LIFECYCLE("PAUSE");'
        );
        break;
      default:
        break;
    }
  }

  void _loadBannerAd() {
    _adService.loadBannerAd(
      onLoaded: (ad) {
        if (mounted) {
          setState(() {
            _bannerAd = ad;
            _isBannerReady = true;
          });
        }
      },
    );
  }

  void _checkAdVisibility(String url) {
    bool shouldHide = false;
    for (final page in _noAdPages) {
      if (url.contains(page)) {
        shouldHide = true;
        break;
      }
    }
    if (mounted && shouldHide != _hideAdsOnCurrentPage) {
      setState(() {
        _hideAdsOnCurrentPage = shouldHide;
      });
    }
  }

  Future<void> _initNotifications() async {
    final messaging = FirebaseMessaging.instance;

    final settings = await messaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );
    debugPrint('Notification permission: ${settings.authorizationStatus}');

    final token = await messaging.getToken();
    setState(() { _fcmToken = token; });
    debugPrint('FCM Token: $token');

    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      final notification = message.notification;
      if (notification != null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(notification.title ?? 'New Notification'),
            duration: const Duration(seconds: 4),
            behavior: SnackBarBehavior.floating,
            action: SnackBarAction(
              label: 'View',
              onPressed: () {},
            ),
          ),
        );
      }
    });

    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('Notification tapped: ${message.notification?.title}');
    });

    await messaging.subscribeToTopic('daily_reminders');
    await messaging.subscribeToTopic('all_users');
  }

  void _initWebView() {
    const url = 'https://ai-neet.vercel.app/login';

    late final PlatformWebViewControllerCreationParams params;
    if (WebViewPlatform.instance is AndroidWebViewPlatform) {
      params = AndroidWebViewControllerCreationParams();
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }

    controller = WebViewController.fromPlatformCreationParams(params)
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF080c18))
      ..setUserAgent(
        'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 '
        '(KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 '
        'NEETCoachApp/1.1'
      )
      // ── Ad channel ───────────────────────────────────────
      ..addJavaScriptChannel(
        'NeetCoachAds',
        onMessageReceived: (JavaScriptMessage message) {
          _handleAdCommand(message.message);
        },
      )
      // ── Native Bridge (NEETCoachNativeBridge contract) ────
      ..addJavaScriptChannel(
        'NEETCoachNativeBridge',
        onMessageReceived: (JavaScriptMessage message) {
          _handleNativeBridgeMessage(message.message);
        },
      )
      // ── Crash Forwarder (JS → Crashlytics) ────────────────
      ..addJavaScriptChannel(
        'NEET_CRASH_CHANNEL',
        onMessageReceived: (JavaScriptMessage message) {
          CrashForwarder.handleJsCrashMessage(message.message);
        },
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (NavigationRequest request) {
            if (!request.url.startsWith('https://ai-neet.vercel.app') &&
                !request.url.startsWith('https://aineetcoach.com')) {
              launchUrl(Uri.parse(request.url), mode: LaunchMode.externalApplication);
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
          onProgress: (int progress) {},
          onPageStarted: (String url) {
            _checkAdVisibility(url);
          },
          onPageFinished: (String url) {
            _checkAdVisibility(url);
            _injectBridgeScripts();
          },
          onWebResourceError: (WebResourceError error) {
            FirebaseCrashlytics.instance.recordError(
              Exception('WebView error: ${error.description}'),
              null,
              fatal: false,
            );
          },
        ),
      )
      ..loadRequest(Uri.parse(url));

    // Attach Wave 6 bridges
    CrashForwarder.attachController(controller);
    AppCheckBridge.attachController(controller);

    if (controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(kDebugMode);
      (controller.platform as AndroidWebViewController)
          .setOnShowFileSelector((FileSelectorParams params) async {
        final FilePickerResult? result = await FilePicker.pickFiles(
          allowMultiple: params.mode == FileSelectorMode.openMultiple,
        );
        if (result != null && result.files.isNotEmpty) {
          return result.files
              .where((f) => f.path != null)
              .map((f) => f.path!)
              .toList();
        }
        return [];
      });
    }
  }

  /// Inject all bridge scripts after each page load
  void _injectBridgeScripts() {
    // 1. FCM token
    if (_fcmToken != null) {
      controller.runJavaScript(
        'window.__FCM_TOKEN__ = "$_fcmToken"; '
        'if (window.onFCMToken) window.onFCMToken("$_fcmToken");',
      );
    }

    // 2. App version for recovery manager snapshots
    controller.runJavaScript('window.__NEET_APP_VERSION__ = "1.1.0";');

    // 3. Native capability injection (NEETCoachNativeCapabilities contract)
    controller.runJavaScript('''
      window.NEETCoachNativeCapabilities = {
        version: 2,
        platform: "android",
        appVersion: "1.1.0",
        canShare: true,
        canCopyToClipboard: true,
        canOpenWhatsApp: true,
        canVibrate: true,
        crashReporting: true,
        appCheckEnabled: true
      };
    ''');

    // 4. Ad bridge
    controller.runJavaScript('''
      window.showInterstitialAd = function() {
        if (window.NeetCoachAds) NeetCoachAds.postMessage('show_interstitial');
      };
      window.setPremiumUser = function(isPremium) {
        if (window.NeetCoachAds) NeetCoachAds.postMessage('set_premium:' + (isPremium ? '1' : '0'));
      };
    ''');

    // 5. Crash forwarder bridge
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

  /// Handle NEETCoachNativeBridge messages from JS
  void _handleNativeBridgeMessage(String rawMessage) {
    try {
      // Parse intent type from message
      if (rawMessage.contains('"type":"SHARE"')) {
        // Native share handled by web layer; ACK back
        controller.runJavaScript('if (window.NEET_NATIVE_ACK) window.NEET_NATIVE_ACK("SHARE_OK");');
      } else if (rawMessage.contains('"type":"COPY"')) {
        controller.runJavaScript('if (window.NEET_NATIVE_ACK) window.NEET_NATIVE_ACK("COPY_OK");');
      }
    } catch (e) {
      debugPrint('[NativeBridge] Error handling message: $e');
    }
  }

  void _handleAdCommand(String command) {
    if (command == 'show_interstitial') {
      _adService.showInterstitialAd(
        onDismissed: () {
          debugPrint('📢 Interstitial dismissed — preloading next');
        },
      );
    } else if (command.startsWith('set_premium:')) {
      final isPremium = command.endsWith(':1');
      _adService.setPremiumUser(isPremium);
      if (isPremium && mounted) {
        setState(() {
          _isBannerReady = false;
          _bannerAd = null;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080c18),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: WebViewWidget(controller: controller),
            ),
            if (_isBannerReady && _bannerAd != null && !_hideAdsOnCurrentPage && !_adService.isPremiumUser)
              Builder(
                builder: (context) {
                  final ad = _bannerAd!;
                  return Container(
                    color: const Color(0xFF0a0e1a),
                    width: double.infinity,
                    height: ad.size.height.toDouble(),
                    alignment: Alignment.center,
                    child: AdWidget(ad: ad),
                  );
                }
              ),
          ],
        ),
      ),
    );
  }
}

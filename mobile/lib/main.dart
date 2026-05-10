import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'core/ad_service.dart';

// Background message handler (must be top-level function)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('Background message received: ${message.notification?.title}');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

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

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController controller;
  String? _fcmToken;
  final AdService _adService = AdService();
  BannerAd? _bannerAd;
  bool _isBannerReady = false;
  bool _hideAdsOnCurrentPage = false;

  // Pages where ads should NOT show (sacred UX)
  final List<String> _noAdPages = [
    '/test/',       // During live tests
    '/battleground', // Real-time multiplayer
    '/ncert/',      // PDF reader
    '/battle/',     // 1v1 battles
  ];

  @override
  void initState() {
    super.initState();
    _initNotifications();
    _initWebView();
    _loadBannerAd();
    // Pre-load interstitial for post-test-results
    _adService.loadInterstitialAd();
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

  /// Check if the current URL is a page where ads should be hidden
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

    // Request notification permissions
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

    // Get the FCM token for this device
    final token = await messaging.getToken();
    setState(() {
      _fcmToken = token;
    });
    debugPrint('FCM Token: $token');

    // Listen for foreground messages and show a snackbar
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
              onPressed: () {
                // Could navigate to a specific page inside the webview
              },
            ),
          ),
        );
      }
    });

    // Handle notification tap when app is in background/terminated
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('Notification tapped: ${message.notification?.title}');
      // Could navigate the WebView to a specific route
    });

    // Subscribe to a daily reminders topic (for sending bulk daily notifications)
    await messaging.subscribeToTopic('daily_reminders');
    await messaging.subscribeToTopic('all_users');
    debugPrint('Subscribed to daily_reminders and all_users topics');
  }

  void _initWebView() {
    // Testing deployment on Vercel. Update when custom domain goes live.
    // Pointing to /login to bypass the desktop landing page for mobile users
    const url = 'https://ai-neet.vercel.app/login';

    // Configure specific Android features
    late final PlatformWebViewControllerCreationParams params;
    if (WebViewPlatform.instance is AndroidWebViewPlatform) {
      params = AndroidWebViewControllerCreationParams();
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }

    controller = WebViewController.fromPlatformCreationParams(params)
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF080c18))
      ..addJavaScriptChannel(
        'NeetCoachAds',
        onMessageReceived: (JavaScriptMessage message) {
          _handleAdCommand(message.message);
        },
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (NavigationRequest request) {
            // Allow launching external URLs outside the webview
            if (!request.url.startsWith('https://ai-neet.vercel.app') &&
                !request.url.startsWith('https://aineetcoach.com')) {
              launchUrl(Uri.parse(request.url),
                  mode: LaunchMode.externalApplication);
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
            // Inject the FCM token into the web app so your Next.js backend
            // can store it and use it to send targeted notifications
            if (_fcmToken != null) {
              controller.runJavaScript(
                'window.__FCM_TOKEN__ = "$_fcmToken"; '
                'if (window.onFCMToken) window.onFCMToken("$_fcmToken");',
              );
            }
            // Inject ad bridge so the web app can trigger interstitials
            controller.runJavaScript('''
              window.showInterstitialAd = function() {
                if (window.NeetCoachAds) {
                  NeetCoachAds.postMessage('show_interstitial');
                }
              };
              window.setPremiumUser = function(isPremium) {
                if (window.NeetCoachAds) {
                  NeetCoachAds.postMessage('set_premium:' + (isPremium ? '1' : '0'));
                }
              };
            ''');
          },
          onWebResourceError: (WebResourceError error) {},
        ),
      )
      ..loadRequest(Uri.parse(url));

    // Handle Android file uploads for AI Doubt solver
    if (controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(true);
      (controller.platform as AndroidWebViewController)
          .setOnShowFileSelector((FileSelectorParams params) async {
        final result = await FilePicker.platform.pickFiles(
          allowMultiple: params.mode == FileSelectorMode.openMultiple,
          type: FileType.any,
        );

        if (result != null && result.files.isNotEmpty) {
          return result.files.map((file) => file.path!).toList();
        }
        return [];
      });
    }
  }

  /// Handle commands from the web app via the NeetCoachAds JS channel
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
  void dispose() {
    _adService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080c18),
      body: SafeArea(
        child: Column(
          children: [
            // WebView takes all available space
            Expanded(
              child: WebViewWidget(controller: controller),
            ),
            // Banner Ad at bottom (only for free tier, hidden on sacred pages)
            if (_isBannerReady && _bannerAd != null && !_hideAdsOnCurrentPage && !_adService.isPremiumUser)
              Builder(
                builder: (context) {
                  final ad = _bannerAd!;
                  return Container(
                    color: const Color(0xFF0a0e1a), // Match app dark theme
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

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

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

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AI NEET Coach',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
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

  @override
  void initState() {
    super.initState();
    _initNotifications();
    _initWebView();
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
    // 10.0.2.2 is the special alias to your host loopback interface (localhost) for Android emulators.
    // Replace with your deployed URL for production builds.
    const url = 'http://10.0.2.2:3000';

    // Configure specific Android features
    late final PlatformWebViewControllerCreationParams params;
    if (WebViewPlatform.instance is AndroidWebViewPlatform) {
      params = AndroidWebViewControllerCreationParams();
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }

    controller = WebViewController.fromPlatformCreationParams(params)
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (NavigationRequest request) {
            // Allow launching external URLs outside the webview
            if (!request.url.startsWith('http://10.0.2.2') &&
                !request.url.startsWith('http://localhost') &&
                !request.url.startsWith('http://192.168.')) {
              launchUrl(Uri.parse(request.url),
                  mode: LaunchMode.externalApplication);
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
          onProgress: (int progress) {},
          onPageStarted: (String url) {},
          onPageFinished: (String url) {
            // Inject the FCM token into the web app so your Next.js backend
            // can store it and use it to send targeted notifications
            if (_fcmToken != null) {
              controller.runJavaScript(
                'window.__FCM_TOKEN__ = "$_fcmToken"; '
                'if (window.onFCMToken) window.onFCMToken("$_fcmToken");',
              );
            }
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: WebViewWidget(controller: controller),
      ),
    );
  }
}

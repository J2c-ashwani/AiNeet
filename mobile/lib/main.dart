import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:file_picker/file_picker.dart' as file_picker;
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'core/ad_service.dart';
import 'runtime/crash_forwarder.dart';
import 'security/app_check.dart';

const String kAppVersion = '1.1.0';
const String kInitialWebUrl = String.fromEnvironment(
  'NEET_WEB_URL',
  defaultValue: 'https://ai-neet.vercel.app',
);
const Map<String, String> kPlaySubscriptionProducts = {
  'pro': 'neet_pro_monthly',
  'premium': 'neet_premium_monthly',
};
const List<String> kOmrAllowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
];

// Background message handler (must be top-level function)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('Background message received: ${message.notification?.title}');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  // Parallelize secondary SDK initializations post-Firebase.initializeApp
  await Future.wait([
    // 1. Crashlytics
    (() async {
      if (!kDebugMode) {
        await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(true);
      } else {
        await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(false);
      }
    })(),

    // 2. App Check
    FirebaseAppCheck.instance.activate(
      providerAndroid: kDebugMode
          ? const AndroidDebugProvider()
          : const AndroidPlayIntegrityProvider(),
      providerApple: const AppleDeviceCheckProvider(),
    ),

    // 3. AdMob
    AdService().initialize().catchError((e) {
      debugPrint('⚠️ AdMob init failed: $e — app will continue without ads');
    }),
  ]);

  // Catch all Flutter framework errors
  FlutterError.onError = (errorDetails) {
    FirebaseCrashlytics.instance.recordFlutterFatalError(errorDetails);
  };

  // Catch all async errors not caught by Flutter
  PlatformDispatcher.instance.onError = (error, stack) {
    FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
    return true;
  };

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

class _WebViewScreenState extends State<WebViewScreen>
    with WidgetsBindingObserver {
  late final WebViewController controller;
  String? _fcmToken;
  final AdService _adService = AdService();
  final ImagePicker _imagePicker = ImagePicker();
  final Map<String, PurchaseDetails> _pendingPurchases = {};
  BannerAd? _bannerAd;
  bool _isBannerReady = false;
  bool _hideAdsOnCurrentPage = false;

  // Pages where ads should NOT show (sacred UX)
  final List<String> _noAdPages = [
    '/test/', // During live tests
    '/battleground', // Real-time multiplayer
    '/ncert/', // PDF reader
    '/battle/', // 1v1 battles
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initNotifications();
    _initWebView();
    _loadBannerAd();
    _adService.loadInterstitialAd();
    _adService.loadRewardedAd();
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
          'if (window.NEET_LIFECYCLE) window.NEET_LIFECYCLE("PAUSE");',
        );
        break;
      case AppLifecycleState.resumed:
        controller.runJavaScript(
          'if (window.NEET_LIFECYCLE) window.NEET_LIFECYCLE("RESUME");',
        );
        break;
      case AppLifecycleState.detached:
        controller.runJavaScript(
          'if (window.NEET_LIFECYCLE) window.NEET_LIFECYCLE("PAUSE");',
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
    setState(() {
      _fcmToken = token;
    });
    if (kDebugMode) {
      debugPrint('FCM token acquired for this install.');
    }

    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      final notification = message.notification;
      if (notification != null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(notification.title ?? 'New Notification'),
            duration: const Duration(seconds: 4),
            behavior: SnackBarBehavior.floating,
            action: SnackBarAction(label: 'View', onPressed: () {}),
          ),
        );
      }
    });

    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('Notification tapped: ${message.notification?.title}');
    });

    // Topic subscription is owned by the backend device registry after user consent.
  }

  void _initWebView() {
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
        'NEETCoachApp/1.1',
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
              launchUrl(
                Uri.parse(request.url),
                mode: LaunchMode.externalApplication,
              );
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
      ..loadRequest(Uri.parse(kInitialWebUrl));

    // Attach Wave 6 bridges
    CrashForwarder.attachController(controller);
    AppCheckBridge.attachController(controller);

    if (controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(kDebugMode);
      (controller.platform as AndroidWebViewController).setOnShowFileSelector((
        FileSelectorParams params,
      ) async {
        final file_picker.FilePickerResult? result =
            await file_picker.FilePicker.pickFiles(
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
    controller.runJavaScript('window.__NEET_APP_VERSION__ = "$kAppVersion";');

    // 3. Native capability injection (NEETCoachNativeCapabilities contract)
    controller.runJavaScript('''
      window.NEETCoachNativeCapabilities = {
        version: 4,
        platform: "android",
        appVersion: "$kAppVersion",
        share: false,
        clipboard: true,
        externalIntent: true,
        haptic: true,
        fcmRegistration: true,
        cameraCapture: true,
        adsInterstitial: true,
        adsRewarded: true,
        purchaseSubscription: true,
        purchaseRestore: true,
        fileDownload: false,
        crashReporting: true,
        appCheckEnabled: true,
        canShare: false,
        canCopyToClipboard: true,
        canOpenWhatsApp: true,
        canVibrate: true
      };
    ''');

    // 4. Ad bridge
    controller.runJavaScript('''
      window.showInterstitialAd = function() {
        if (window.NeetCoachAds) NeetCoachAds.postMessage('show_interstitial');
      };
      window.showRewardedAd = function() {
        if (window.NeetCoachAds) NeetCoachAds.postMessage('show_rewarded');
      };
      window.NeetCoachAds.restorePurchases = function() {
        if (window.NEETCoachNativeBridge) {
          NEETCoachNativeBridge.postMessage(JSON.stringify({
            id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
            type: 'RESTORE_PURCHASES',
            payload: {}
          }));
        }
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

    // 6. App Check bridge must be re-injected after every WebView navigation.
    AppCheckBridge.injectScript(controller);
  }

  /// Handle NEETCoachNativeBridge v4 messages from JS.
  void _handleNativeBridgeMessage(String rawMessage) {
    _handleNativeBridgeMessageAsync(rawMessage);
  }

  Future<void> _handleNativeBridgeMessageAsync(String rawMessage) async {
    String? id;
    try {
      final decoded = jsonDecode(rawMessage);
      if (decoded is! Map<String, dynamic>) {
        throw const FormatException('Bridge envelope must be a JSON object');
      }

      id = decoded['id']?.toString();
      final type = decoded['type']?.toString();
      final payload = _asStringKeyedMap(decoded['payload']);

      if (id == null || id.isEmpty || type == null || type.isEmpty) {
        throw const FormatException('Bridge envelope missing id or type');
      }

      switch (type) {
        case 'COPY':
          await Clipboard.setData(
            ClipboardData(text: payload['text']?.toString() ?? ''),
          );
          await _ackNativeIntent(id);
          break;
        case 'OPEN_URL':
          await _openExternalUrl(payload['url']?.toString());
          await _ackNativeIntent(id);
          break;
        case 'HAPTIC':
          await _triggerHaptic(payload['style']?.toString());
          await _ackNativeIntent(id);
          break;
        case 'REGISTER_FCM':
          await _ackNativeIntent(
            id,
            payload: await _buildFcmRegistrationPayload(),
          );
          break;
        case 'CAPTURE_IMAGE':
          await _ackNativeIntent(id, payload: await _captureImage(payload));
          break;
        case 'SHOW_INTERSTITIAL':
          final shown = _showInterstitial(
            payload['placement']?.toString() ?? 'default',
          );
          await _ackNativeIntent(
            id,
            payload: {
              'shown': shown,
              'placement': payload['placement'] ?? 'default',
            },
          );
          break;
        case 'SHOW_REWARDED':
          final reward = await _showRewarded(
            payload['placement']?.toString() ?? 'default',
          );
          await _ackNativeIntent(id, payload: reward);
          break;
        case 'RESTORE_PURCHASES':
          await _ackNativeIntent(id, payload: await _restorePurchases());
          break;
        case 'PURCHASE_SUBSCRIPTION':
          await _ackNativeIntent(
            id,
            payload: await _purchaseSubscription(payload['planId']?.toString()),
          );
          break;
        case 'ACKNOWLEDGE_PURCHASE':
          await _ackNativeIntent(
            id,
            payload: await _acknowledgePurchase(
              payload['purchaseToken']?.toString(),
            ),
          );
          break;
        case 'SHARE':
          await _ackNativeIntent(
            id,
            status: 'error',
            reason: 'Native share is not packaged in this build',
          );
          break;
        default:
          await _ackNativeIntent(
            id,
            status: 'error',
            reason: 'Unsupported native intent: $type',
          );
      }
    } catch (e, stack) {
      debugPrint('[NativeBridge] Error handling message: $e');
      FirebaseCrashlytics.instance.recordError(e, stack, fatal: false);
      if (id != null && id.isNotEmpty) {
        await _ackNativeIntent(id, status: 'error', reason: e.toString());
      }
    }
  }

  Map<String, dynamic> _asStringKeyedMap(Object? value) {
    if (value is Map) {
      return value.map((key, val) => MapEntry(key.toString(), val));
    }
    return <String, dynamic>{};
  }

  Future<void> _ackNativeIntent(
    String id, {
    String status = 'ok',
    Map<String, dynamic>? payload,
    String? reason,
  }) {
    final ack = <String, dynamic>{
      'id': id,
      'status': status,
      ...?payload == null ? null : {'payload': payload},
      ...?reason == null ? null : {'reason': reason},
    };
    final jsArgument = jsonEncode(jsonEncode(ack));
    return controller.runJavaScript(
      'if (window.NEET_NATIVE_ACK) window.NEET_NATIVE_ACK($jsArgument);',
    );
  }

  Future<void> _openExternalUrl(String? value) async {
    final uri = Uri.tryParse(value ?? '');
    if (uri == null) {
      throw const FormatException('Invalid URL');
    }
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!opened) {
      throw Exception('Could not open URL');
    }
  }

  Future<void> _triggerHaptic(String? style) async {
    switch (style) {
      case 'heavy':
        await HapticFeedback.heavyImpact();
        break;
      case 'medium':
        await HapticFeedback.mediumImpact();
        break;
      default:
        await HapticFeedback.lightImpact();
    }
  }

  Future<Map<String, dynamic>> _buildFcmRegistrationPayload() async {
    final messaging = FirebaseMessaging.instance;
    final settings = await messaging.getNotificationSettings();
    final token = _fcmToken ?? await messaging.getToken();
    if (token == null || token.isEmpty) {
      throw Exception('FCM token unavailable');
    }

    _fcmToken = token;

    return {
      'token': token,
      'deviceId': 'android-${_stableTokenDigest(token)}',
      'platform': 'android',
      'appVersion': kAppVersion,
      'androidVersion': Platform.operatingSystemVersion,
      'webviewVersion': 'webview_flutter_android',
      'permission': _permissionName(settings.authorizationStatus),
    };
  }

  String _permissionName(AuthorizationStatus status) {
    switch (status) {
      case AuthorizationStatus.authorized:
      case AuthorizationStatus.provisional:
        return 'granted';
      case AuthorizationStatus.denied:
        return 'denied';
      case AuthorizationStatus.notDetermined:
        return 'prompt';
    }
  }

  String _stableTokenDigest(String token) {
    var hash = 2166136261;
    for (final unit in token.codeUnits) {
      hash ^= unit;
      hash = (hash * 16777619) & 0xffffffff;
    }
    return hash.toRadixString(16).padLeft(8, '0');
  }

  Future<Map<String, dynamic>> _captureImage(
    Map<String, dynamic> payload,
  ) async {
    final source = payload['source']?.toString() ?? 'camera';
    final maxBytes = _readInt(payload['maxBytes'], 15 * 1024 * 1024);
    final allowedMimeTypes = _readStringList(payload['allowedMimeTypes']);
    final allowed = allowedMimeTypes.isEmpty
        ? kOmrAllowedMimeTypes
        : allowedMimeTypes;

    late String fileName;
    late Uint8List bytes;
    String? mimeType;

    if (source == 'document') {
      final result = await file_picker.FilePicker.pickFiles(
        type: file_picker.FileType.custom,
        allowedExtensions: const [
          'jpg',
          'jpeg',
          'png',
          'webp',
          'heic',
          'heif',
          'pdf',
        ],
        withData: true,
      );
      if (result == null || result.files.isEmpty) {
        throw Exception('Capture cancelled');
      }
      final file = result.files.first;
      fileName = file.name;
      final pickedBytes = file.bytes;
      if (pickedBytes != null) {
        bytes = pickedBytes;
      } else if (file.path != null) {
        bytes = await File(file.path!).readAsBytes();
      } else {
        throw Exception('Captured file is empty');
      }
      mimeType = _inferMimeType(fileName, bytes);
    } else {
      final imageSource = source == 'gallery'
          ? ImageSource.gallery
          : ImageSource.camera;
      final picked = await _imagePicker.pickImage(
        source: imageSource,
        imageQuality: 92,
        maxWidth: 2400,
      );
      if (picked == null) {
        throw Exception('Capture cancelled');
      }
      fileName = picked.name;
      bytes = await picked.readAsBytes();
      mimeType = picked.mimeType ?? _inferMimeType(fileName, bytes);
    }

    if (bytes.isEmpty) {
      throw Exception('Captured file is empty');
    }
    if (bytes.length > maxBytes) {
      throw Exception('Captured file exceeds maxBytes');
    }
    if (mimeType == null || !allowed.contains(mimeType)) {
      throw Exception('Captured file type is not allowed');
    }

    return {
      'imageBase64': base64Encode(bytes),
      'mimeType': mimeType,
      'fileName': fileName,
      'sizeBytes': bytes.length,
    };
  }

  Future<Map<String, dynamic>> _restorePurchases() async {
    final iap = InAppPurchase.instance;
    final available = await iap.isAvailable();
    if (!available) {
      return {
        'restored': false,
        'products': <String>[],
        'purchases': <Map<String, dynamic>>[],
        'reason': 'billing_unavailable',
      };
    }

    final purchases = <Map<String, dynamic>>[];
    Object? streamError;
    late final StreamSubscription<List<PurchaseDetails>> subscription;

    subscription = iap.purchaseStream.listen(
      (details) async {
        for (final purchase in details) {
          if (purchase.status == PurchaseStatus.restored ||
              purchase.status == PurchaseStatus.purchased) {
            final payload = _purchasePayload(purchase);
            purchases.add(payload);
            final token = payload['purchaseToken']?.toString();
            if (purchase.pendingCompletePurchase &&
                token != null &&
                token.isNotEmpty) {
              _pendingPurchases[token] = purchase;
            }
          }
        }
      },
      onError: (Object error) {
        streamError = error;
      },
    );

    try {
      await iap.restorePurchases();
      await Future<void>.delayed(const Duration(seconds: 4));
    } finally {
      await subscription.cancel();
    }

    if (streamError != null) {
      throw Exception('Purchase restore failed: $streamError');
    }

    return {
      'restored': purchases.isNotEmpty,
      'products': purchases
          .map((purchase) => purchase['productId'])
          .toSet()
          .toList(),
      'purchases': purchases,
    };
  }

  Map<String, dynamic> _purchasePayload(PurchaseDetails purchase) {
    return {
      'productId': purchase.productID,
      'purchaseId': purchase.purchaseID,
      'purchaseToken': purchase.verificationData.serverVerificationData,
      'source': purchase.verificationData.source,
      'status': purchase.status.name,
      'pendingCompletePurchase': purchase.pendingCompletePurchase,
    };
  }

  Future<Map<String, dynamic>> _purchaseSubscription(String? planId) async {
    final productId = kPlaySubscriptionProducts[planId];
    if (productId == null) {
      throw Exception('Unsupported subscription plan');
    }

    final iap = InAppPurchase.instance;
    if (!await iap.isAvailable()) {
      throw Exception('Google Play Billing is unavailable');
    }

    final productResponse = await iap.queryProductDetails({productId});
    if (productResponse.error != null) {
      throw Exception(
        'Unable to load Google Play subscription: ${productResponse.error!.message}',
      );
    }
    if (productResponse.productDetails.isEmpty) {
      throw Exception('Google Play subscription product is not configured');
    }

    final completer = Completer<Map<String, dynamic>>();
    late final StreamSubscription<List<PurchaseDetails>> subscription;
    subscription = iap.purchaseStream.listen(
      (details) {
        for (final purchase in details.where(
          (detail) => detail.productID == productId,
        )) {
          final payload = _purchasePayload(purchase);
          final token = payload['purchaseToken']?.toString();
          if (purchase.pendingCompletePurchase &&
              token != null &&
              token.isNotEmpty) {
            _pendingPurchases[token] = purchase;
          }

          if ((purchase.status == PurchaseStatus.purchased ||
                  purchase.status == PurchaseStatus.restored) &&
              !completer.isCompleted) {
            completer.complete(payload);
          } else if (purchase.status == PurchaseStatus.canceled &&
              !completer.isCompleted) {
            completer.completeError(Exception('Purchase canceled'));
          } else if (purchase.status == PurchaseStatus.error &&
              !completer.isCompleted) {
            completer.completeError(
              Exception(purchase.error?.message ?? 'Google Play purchase failed'),
            );
          }
        }
      },
      onError: (Object error) {
        if (!completer.isCompleted) completer.completeError(error);
      },
    );

    try {
      final started = await iap.buyNonConsumable(
        purchaseParam: PurchaseParam(
          productDetails: productResponse.productDetails.first,
        ),
      );
      if (!started) {
        throw Exception('Google Play purchase could not be started');
      }
      return await completer.future.timeout(
        const Duration(minutes: 5),
        onTimeout: () => throw TimeoutException(
          'Google Play purchase confirmation timed out',
        ),
      );
    } finally {
      await subscription.cancel();
    }
  }

  Future<Map<String, dynamic>> _acknowledgePurchase(
    String? purchaseToken,
  ) async {
    if (purchaseToken == null || purchaseToken.isEmpty) {
      throw Exception('Purchase token is required');
    }

    final purchase = _pendingPurchases[purchaseToken];
    if (purchase == null) {
      throw Exception('Purchase must be restored before acknowledgement');
    }

    if (purchase.pendingCompletePurchase) {
      await InAppPurchase.instance.completePurchase(purchase);
    }
    _pendingPurchases.remove(purchaseToken);

    return {
      'acknowledged': true,
      'productId': purchase.productID,
    };
  }

  bool _showInterstitial(String placement) {
    return _adService.showInterstitialAd(
      onDismissed: () {
        debugPrint(
          '📢 Interstitial dismissed at placement=$placement — preloading next',
        );
      },
    );
  }

  Future<Map<String, dynamic>> _showRewarded(String placement) async {
    RewardItem? earnedReward;
    final completer = Completer<Map<String, dynamic>>();
    final shown = _adService.showRewardedAd(
      onRewarded: (reward) {
        earnedReward = reward;
      },
      onDismissed: () {
        debugPrint('📢 Rewarded ad dismissed at placement=$placement');
        if (!completer.isCompleted) {
          completer.complete({
            'shown': true,
            'rewarded': earnedReward != null,
            'placement': placement,
            if (earnedReward != null) 'rewardType': earnedReward!.type,
            if (earnedReward != null) 'rewardAmount': earnedReward!.amount,
          });
        }
      },
    );

    if (!shown) {
      return {'shown': false, 'rewarded': false, 'placement': placement};
    }

    return completer.future.timeout(
      const Duration(seconds: 90),
      onTimeout: () => {
        'shown': true,
        'rewarded': earnedReward != null,
        'placement': placement,
        if (earnedReward != null) 'rewardType': earnedReward!.type,
        if (earnedReward != null) 'rewardAmount': earnedReward!.amount,
        'timeout': true,
      },
    );
  }

  List<String> _readStringList(Object? value) {
    if (value is List) {
      return value.map((item) => item.toString()).toList();
    }
    return <String>[];
  }

  int _readInt(Object? value, int fallback) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value) ?? fallback;
    return fallback;
  }

  String? _inferMimeType(String? fileName, Uint8List? bytes) {
    final lower = (fileName ?? '').toLowerCase();
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.heic')) return 'image/heic';
    if (lower.endsWith('.heif')) return 'image/heif';
    if (lower.endsWith('.pdf')) return 'application/pdf';

    if (bytes != null && bytes.length >= 4) {
      if (bytes[0] == 0xff && bytes[1] == 0xd8 && bytes[2] == 0xff) {
        return 'image/jpeg';
      }
      if (bytes[0] == 0x89 &&
          bytes[1] == 0x50 &&
          bytes[2] == 0x4e &&
          bytes[3] == 0x47) {
        return 'image/png';
      }
      if (bytes.length >= 12 &&
          ascii.decode(bytes.sublist(0, 4), allowInvalid: true) == 'RIFF' &&
          ascii.decode(bytes.sublist(8, 12), allowInvalid: true) == 'WEBP') {
        return 'image/webp';
      }
      if (bytes.length >= 5 &&
          ascii.decode(bytes.sublist(0, 5), allowInvalid: true) == '%PDF-') {
        return 'application/pdf';
      }
      if (bytes.length >= 12 &&
          ascii.decode(bytes.sublist(4, 8), allowInvalid: true) == 'ftyp') {
        final brand = ascii.decode(bytes.sublist(8, 12), allowInvalid: true);
        if (['heic', 'heix', 'hevc', 'hevx'].contains(brand)) {
          return 'image/heic';
        }
        if (['mif1', 'msf1', 'heif'].contains(brand)) return 'image/heif';
      }
    }

    return null;
  }

  void _handleAdCommand(String command) {
    if (command == 'show_interstitial') {
      _adService.showInterstitialAd(
        onDismissed: () {
          debugPrint('📢 Interstitial dismissed — preloading next');
        },
      );
    } else if (command == 'show_rewarded') {
      _adService.showRewardedAd(
        onRewarded: (reward) {
          debugPrint('📢 Reward earned: ${reward.amount} ${reward.type}');
        },
        onDismissed: () {
          debugPrint('📢 Rewarded ad dismissed — preloading next');
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
            Expanded(child: WebViewWidget(controller: controller)),
            if (_isBannerReady &&
                _bannerAd != null &&
                !_hideAdsOnCurrentPage &&
                !_adService.isPremiumUser)
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
                },
              ),
          ],
        ),
      ),
    );
  }
}

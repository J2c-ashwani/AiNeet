import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'dart:io';

/// Strategic AdMob service for AI NEET Coach.
///
/// Ad placements (free tier only):
///   - Banner: Bottom of screen, below WebView
///   - Interstitial: After test results (triggered via JS bridge)
///
/// NO ads shown:
///   - During live tests (sacred UX)
///   - In Battleground (real-time multiplayer)
///   - In NCERT PDF reader
///   - For Pro/Premium users
class AdService {
  static final AdService _instance = AdService._internal();
  factory AdService() => _instance;
  AdService._internal();

  bool _initialized = false;
  BannerAd? _bannerAd;
  InterstitialAd? _interstitialAd;
  bool _isBannerLoaded = false;
  bool _isInterstitialLoaded = false;
  bool _isPremiumUser = false;

  // Test Ad Unit IDs (replace with real ones before production)
  // These are Google's official test ad unit IDs
  static String get _bannerAdUnitId {
    if (Platform.isAndroid) {
      return kDebugMode
          ? 'ca-app-pub-3940256099942544/6300978111' // Google test banner
          : 'ca-app-pub-XXXXXXXXXXXX/XXXXXXXXXX'; // TODO: Replace with real ID
    }
    return 'ca-app-pub-3940256099942544/2934735716'; // iOS test
  }

  static String get _interstitialAdUnitId {
    if (Platform.isAndroid) {
      return kDebugMode
          ? 'ca-app-pub-3940256099942544/1033173712' // Google test interstitial
          : 'ca-app-pub-XXXXXXXXXXXX/XXXXXXXXXX'; // TODO: Replace with real ID
    }
    return 'ca-app-pub-3940256099942544/4411468910'; // iOS test
  }

  /// Initialize AdMob SDK. Call once in main().
  Future<void> initialize() async {
    if (_initialized) return;
    try {
      await MobileAds.instance.initialize();
      _initialized = true;
      debugPrint('✅ AdMob initialized');
    } catch (e) {
      debugPrint('⚠️ AdMob init failed: $e — app will continue without ads');
    }
  }

  /// Set premium status — premium users see zero ads
  void setPremiumUser(bool isPremium) {
    _isPremiumUser = isPremium;
    if (_isPremiumUser) {
      disposeBanner();
      _interstitialAd?.dispose();
      _interstitialAd = null;
      _isInterstitialLoaded = false;
      debugPrint('👑 Premium user — all ads disabled');
    }
  }

  bool get isPremiumUser => _isPremiumUser;

  // ─── Banner Ad ───────────────────────────────────────────────────────

  /// Load a banner ad (320x50, standard size).
  void loadBannerAd({required Function(BannerAd) onLoaded}) {
    if (_isPremiumUser) return;

    _bannerAd = BannerAd(
      adUnitId: _bannerAdUnitId,
      size: AdSize.banner,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (ad) {
          _isBannerLoaded = true;
          onLoaded(ad as BannerAd);
          debugPrint('📢 Banner ad loaded');
        },
        onAdFailedToLoad: (ad, error) {
          _isBannerLoaded = false;
          ad.dispose();
          debugPrint('⚠️ Banner ad failed: ${error.message}');
        },
        onAdClicked: (ad) => debugPrint('📢 Banner clicked'),
      ),
    )..load();
  }

  bool get isBannerLoaded => _isBannerLoaded;

  void disposeBanner() {
    _bannerAd?.dispose();
    _bannerAd = null;
    _isBannerLoaded = false;
  }

  // ─── Interstitial Ad ─────────────────────────────────────────────────

  /// Pre-load an interstitial ad (call early, show later).
  void loadInterstitialAd() {
    if (_isPremiumUser) return;

    InterstitialAd.load(
      adUnitId: _interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialAd = ad;
          _isInterstitialLoaded = true;
          debugPrint('📢 Interstitial ad loaded');
        },
        onAdFailedToLoad: (error) {
          _isInterstitialLoaded = false;
          debugPrint('⚠️ Interstitial ad failed: ${error.message}');
        },
      ),
    );
  }

  /// Show the interstitial ad (e.g. after test results).
  /// Returns true if shown, false if not available.
  bool showInterstitialAd({VoidCallback? onDismissed}) {
    if (_isPremiumUser) return false;
    if (!_isInterstitialLoaded || _interstitialAd == null) return false;

    _interstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        _interstitialAd = null;
        _isInterstitialLoaded = false;
        onDismissed?.call();
        // Pre-load next one immediately
        loadInterstitialAd();
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        ad.dispose();
        _interstitialAd = null;
        _isInterstitialLoaded = false;
        debugPrint('⚠️ Interstitial failed to show: ${error.message}');
      },
    );

    _interstitialAd!.show();
    return true;
  }

  bool get isInterstitialLoaded => _isInterstitialLoaded;

  /// Clean up all ads
  void dispose() {
    disposeBanner();
    _interstitialAd?.dispose();
    _interstitialAd = null;
  }
}

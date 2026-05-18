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
  RewardedAd? _rewardedAd;
  bool _isBannerLoaded = false;
  bool _isInterstitialLoaded = false;
  bool _isRewardedLoaded = false;
  bool _isPremiumUser = false;

  static const String _prodBannerAndroid = String.fromEnvironment(
    'ADMOB_BANNER_ANDROID',
  );
  static const String _prodInterstitialAndroid = String.fromEnvironment(
    'ADMOB_INTERSTITIAL_ANDROID',
  );
  static const String _prodRewardedAndroid = String.fromEnvironment(
    'ADMOB_REWARDED_ANDROID',
  );

  static String? get _bannerAdUnitId {
    if (Platform.isAndroid) {
      if (kDebugMode) return 'ca-app-pub-3940256099942544/6300978111';
      return _prodBannerAndroid.isNotEmpty ? _prodBannerAndroid : null;
    }
    return kDebugMode ? 'ca-app-pub-3940256099942544/2934735716' : null;
  }

  static String? get _interstitialAdUnitId {
    if (Platform.isAndroid) {
      if (kDebugMode) return 'ca-app-pub-3940256099942544/1033173712';
      return _prodInterstitialAndroid.isNotEmpty
          ? _prodInterstitialAndroid
          : null;
    }
    return kDebugMode ? 'ca-app-pub-3940256099942544/4411468910' : null;
  }

  static String? get _rewardedAdUnitId {
    if (Platform.isAndroid) {
      if (kDebugMode) return 'ca-app-pub-3940256099942544/5224354917';
      return _prodRewardedAndroid.isNotEmpty ? _prodRewardedAndroid : null;
    }
    return kDebugMode ? 'ca-app-pub-3940256099942544/1712485313' : null;
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
      _rewardedAd?.dispose();
      _rewardedAd = null;
      _isRewardedLoaded = false;
      debugPrint('👑 Premium user — all ads disabled');
    }
  }

  bool get isPremiumUser => _isPremiumUser;

  // ─── Banner Ad ───────────────────────────────────────────────────────

  /// Load a banner ad (320x50, standard size).
  void loadBannerAd({required Function(BannerAd) onLoaded}) {
    if (_isPremiumUser) return;
    final adUnitId = _bannerAdUnitId;
    if (adUnitId == null) {
      _logMissingAdUnit('banner');
      return;
    }

    _bannerAd = BannerAd(
      adUnitId: adUnitId,
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
    final adUnitId = _interstitialAdUnitId;
    if (adUnitId == null) {
      _logMissingAdUnit('interstitial');
      return;
    }

    InterstitialAd.load(
      adUnitId: adUnitId,
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

  // ─── Rewarded Ad ─────────────────────────────────────────────────────

  void loadRewardedAd() {
    if (_isPremiumUser) return;
    final adUnitId = _rewardedAdUnitId;
    if (adUnitId == null) {
      _logMissingAdUnit('rewarded');
      return;
    }

    RewardedAd.load(
      adUnitId: adUnitId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) {
          _rewardedAd = ad;
          _isRewardedLoaded = true;
          debugPrint('📢 Rewarded ad loaded');
        },
        onAdFailedToLoad: (error) {
          _isRewardedLoaded = false;
          debugPrint('⚠️ Rewarded ad failed: ${error.message}');
        },
      ),
    );
  }

  bool showRewardedAd({
    required void Function(RewardItem reward) onRewarded,
    VoidCallback? onDismissed,
  }) {
    if (_isPremiumUser) return false;
    if (!_isRewardedLoaded || _rewardedAd == null) return false;

    _rewardedAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        _rewardedAd = null;
        _isRewardedLoaded = false;
        onDismissed?.call();
        loadRewardedAd();
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        ad.dispose();
        _rewardedAd = null;
        _isRewardedLoaded = false;
        debugPrint('⚠️ Rewarded ad failed to show: ${error.message}');
        onDismissed?.call();
        loadRewardedAd();
      },
    );

    _rewardedAd!.show(onUserEarnedReward: (_, reward) => onRewarded(reward));
    return true;
  }

  bool get isRewardedLoaded => _isRewardedLoaded;

  /// Clean up all ads
  void dispose() {
    disposeBanner();
    _interstitialAd?.dispose();
    _interstitialAd = null;
    _rewardedAd?.dispose();
    _rewardedAd = null;
  }

  void _logMissingAdUnit(String placement) {
    debugPrint('AdMob $placement ad unit is not configured; skipping ad load.');
  }
}

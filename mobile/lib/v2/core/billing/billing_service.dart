import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import '../api/api_client.dart';

/// AI NEET Coach Native Billing Service
/// Wraps Google Play Billing with server-side verification.
/// Gracefully handles unconfigured Play Console products.
class NativeBillingService {
  static final NativeBillingService _instance = NativeBillingService._();
  factory NativeBillingService() => _instance;
  NativeBillingService._();

  final InAppPurchase _iap = InAppPurchase.instance;
  final NeetApiClient _api = NeetApiClient();
  StreamSubscription<List<PurchaseDetails>>? _purchaseSubscription;

  // Product IDs — loaded from dart-define so they can be activated without code changes
  static const String _proProductId = String.fromEnvironment(
    'PLAY_PRODUCT_PRO',
    defaultValue: 'neet_pro_monthly',
  );
  static const String _premiumProductId = String.fromEnvironment(
    'PLAY_PRODUCT_PREMIUM',
    defaultValue: 'neet_premium_monthly',
  );

  bool _billingAvailable = false;
  bool _productsConfigured = false;
  List<ProductDetails> _availableProducts = [];

  // Initialize billing — call from app startup or pricing screen
  Future<BillingInitResult> initialize() async {
    try {
      _billingAvailable = await _iap.isAvailable();
      if (!_billingAvailable) {
        return BillingInitResult.unavailable;
      }
      final response = await _iap.queryProductDetails({_proProductId, _premiumProductId});
      _availableProducts = response.productDetails;
      _productsConfigured = _availableProducts.isNotEmpty;
      if (!_productsConfigured) {
        debugPrint('[Billing] Play Console products not yet configured.');
        return BillingInitResult.productsNotConfigured;
      }
      return BillingInitResult.ready;
    } catch (e) {
      debugPrint('[Billing] Init error: $e');
      return BillingInitResult.unavailable;
    }
  }

  bool get isReady => _billingAvailable && _productsConfigured;
  List<ProductDetails> get availableProducts => List.unmodifiable(_availableProducts);

  // Start a subscription purchase
  Future<BillingPurchaseResult> purchaseSubscription(String planId) async {
    if (!isReady) return BillingPurchaseResult.notConfigured;
    final productId = planId == 'premium' ? _premiumProductId : _proProductId;
    final product = _availableProducts.firstWhere(
      (p) => p.id == productId,
      orElse: () => throw Exception('Product $productId not found'),
    );
    
    try {
      final PurchaseParam purchaseParam = PurchaseParam(productDetails: product);
      await _iap.buyNonConsumable(purchaseParam: purchaseParam);
      return BillingPurchaseResult.success;
    } catch (e) {
      debugPrint('[Billing] Purchase error: $e');
      return BillingPurchaseResult.error;
    }
  }

  // Restore purchases — for reinstall / second device
  Future<List<Map<String, dynamic>>> restorePurchases() async {
    if (!_billingAvailable) return [];
    final purchases = <Map<String, dynamic>>[];
    await _iap.restorePurchases();
    return purchases;
  }

  // Server-side verify + entitlement
  Future<bool> verifyAndActivate(PurchaseDetails purchase) async {
    try {
      final token = purchase.verificationData.serverVerificationData;
      final res = await _api.verifyPlayPurchase(
        purchaseToken: token,
        productId: purchase.productID,
      );
      if (res.statusCode == 200) {
        if (purchase.pendingCompletePurchase) {
          await _iap.completePurchase(purchase);
        }
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('[Billing] Verify error: $e');
      return false;
    }
  }

  void dispose() {
    _purchaseSubscription?.cancel();
  }
}

enum BillingInitResult { ready, unavailable, productsNotConfigured }
enum BillingPurchaseResult { success, cancelled, error, notConfigured }

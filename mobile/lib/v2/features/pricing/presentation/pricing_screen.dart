import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/billing/billing_service.dart';

class NativePricingScreen extends StatefulWidget {
  const NativePricingScreen({super.key});

  @override
  State<NativePricingScreen> createState() => _NativePricingScreenState();
}

class _NativePricingScreenState extends State<NativePricingScreen> {
  final NativeBillingService _billingService = NativeBillingService();
  BillingInitResult _initStatus = BillingInitResult.unavailable;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeBilling();
  }

  Future<void> _initializeBilling() async {
    setState(() => _isLoading = true);
    final result = await _billingService.initialize();
    if (mounted) {
      setState(() {
        _initStatus = result;
        _isLoading = false;
      });
    }
  }

  Future<void> _handleSubscribe() async {
    NeetTokens.hapticSelection();
    if (_initStatus == BillingInitResult.ready) {
      final result = await _billingService.purchaseSubscription('pro');
      if (result == BillingPurchaseResult.error && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to initiate purchase. Please try again.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        title: Text(
          'NEET Coach Premium',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: NeetTokens.textPrimary,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildPricingCard(),
              const SizedBox(height: 24),
              Text('Included in Pro Pass:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary)),
              const SizedBox(height: 12),
              _buildFeatureRow('Unlimited AI Doubt Solving with camera OCR'),
              _buildFeatureRow('Full-length 720-Mark NTA Pattern Mock Tests'),
              _buildFeatureRow('OMR Sheet Instant Camera Grading'),
              _buildFeatureRow('1v1 Multiplayer Battleground Access'),
              const SizedBox(height: 28),
              
              if (_initStatus == BillingInitResult.ready)
                ElevatedButton(
                  onPressed: _handleSubscribe,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: NeetTokens.accentGlow,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusMd)),
                  ),
                  child: Text('Subscribe via Google Play →', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPricingCard() {
    if (_isLoading) {
      return Container(
        height: 150,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: NeetTokens.bgCard,
          borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
        ),
        child: const Center(
          child: CircularProgressIndicator(color: NeetTokens.accentGlow),
        ),
      );
    }

    if (_initStatus == BillingInitResult.unavailable) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: NeetTokens.error.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
          border: Border.all(color: NeetTokens.error.withValues(alpha: 0.5)),
        ),
        child: Column(
          children: const [
            Icon(Icons.error_outline, color: NeetTokens.error, size: 32),
            SizedBox(height: 12),
            Text(
              'Google Play Billing is not available on this device.',
              textAlign: TextAlign.center,
              style: TextStyle(color: NeetTokens.error),
            ),
          ],
        ),
      );
    }

    if (_initStatus == BillingInitResult.productsNotConfigured) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: NeetTokens.bgCard,
          borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
          border: Border.all(color: NeetTokens.border),
        ),
        child: Column(
          children: [
            Icon(Icons.info_outline, color: NeetTokens.info, size: 32),
            const SizedBox(height: 12),
            Text(
              'Premium subscriptions coming soon to Play Store. Check back shortly.',
              textAlign: TextAlign.center,
              style: TextStyle(color: NeetTokens.textPrimary),
            ),
            const SizedBox(height: 16),
            TextButton.icon(
              onPressed: _initializeBilling,
              icon: Icon(Icons.refresh),
              label: Text('Refresh'),
            ),
          ],
        ),
      );
    }

    // Ready State
    final proProduct = _billingService.availableProducts.firstWhere(
      (p) => p.id.contains('pro'),
      orElse: () => _billingService.availableProducts.first,
    );

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: NeetTokens.primaryGradient,
        borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
      ),
      child: Column(
        children: [
          Text(proProduct.title.toUpperCase(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 1.2)),
          const SizedBox(height: 8),
          Text(proProduct.price, style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white)),
          const SizedBox(height: 4),
          Text('Billed via Google Play Billing', style: TextStyle(fontSize: 12, color: Colors.white70)),
        ],
      ),
    );
  }

  Widget _buildFeatureRow(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Icon(Icons.check_circle, color: NeetTokens.biologyColor, size: 20),
          const SizedBox(width: 12),
          Expanded(child: Text(text, style: TextStyle(fontSize: 14, color: NeetTokens.textSecondary))),
        ],
      ),
    );
  }
}

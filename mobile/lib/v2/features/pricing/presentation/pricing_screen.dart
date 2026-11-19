import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
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

  Future<void> _handleWebUpiCheckout() async {
    NeetTokens.hapticMedium();
    final url = Uri.parse('https://aineetcoach.com/pricing');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open checkout. Please visit aineetcoach.com/pricing')),
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
        title: const Text(
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
              const Text(
                'Included in Pro Pass:',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary),
              ),
              const SizedBox(height: 12),
              _buildFeatureRow('Unlimited AI Doubt Solving with camera OCR & step-by-step logic'),
              _buildFeatureRow('Full-length 720-Mark NTA Pattern Mock Tests with rank predictor'),
              _buildFeatureRow('OMR Sheet Instant Camera Grading (<1.5 sec processing)'),
              _buildFeatureRow('Multiplayer Live Battleground Room & 1v1 WhatsApp Duels'),
              _buildFeatureRow('Parent Connect with weekly WhatsApp & email scorecards'),
              _buildFeatureRow('150-Day Strategic NEET Study Plan & Spaced Revision'),
              const SizedBox(height: 28),

              // Google Play Button (if ready)
              if (_initStatus == BillingInitResult.ready) ...[
                ElevatedButton(
                  onPressed: _handleSubscribe,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: NeetTokens.accentGlow,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusMd)),
                  ),
                  child: const Text(
                    'Subscribe via Google Play →',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: const [
                    Expanded(child: Divider(color: NeetTokens.border)),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 12),
                      child: Text('OR', style: TextStyle(fontSize: 12, color: NeetTokens.textMuted)),
                    ),
                    Expanded(child: Divider(color: NeetTokens.border)),
                  ],
                ),
                const SizedBox(height: 14),
              ],

              // Instant UPI / Net Banking Option (GPay, PhonePe, Paytm, Cards)
              ElevatedButton.icon(
                onPressed: _handleWebUpiCheckout,
                icon: const Icon(Icons.account_balance_wallet_outlined, color: Colors.white, size: 20),
                label: const Text(
                  'Pay via UPI (GPay / PhonePe / Paytm) ⚡',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F9D58), // UPI Green
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusMd)),
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'Instant activation. Safe and encrypted 256-bit checkout via Cashfree / UPI.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 11, color: NeetTokens.textMuted),
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

    if (_initStatus == BillingInitResult.ready) {
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
            Text(
              proProduct.title.toUpperCase(),
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 1.2),
            ),
            const SizedBox(height: 8),
            Text(
              proProduct.price,
              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            const SizedBox(height: 4),
            const Text('Billed via Google Play or Direct UPI', style: TextStyle(fontSize: 12, color: Colors.white70)),
          ],
        ),
      );
    }

    // Direct UPI / Web Fallback Card
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            NeetTokens.bgCard,
            NeetTokens.accentPrimary.withValues(alpha: 0.18),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
        border: Border.all(color: NeetTokens.accentPrimary.withValues(alpha: 0.4)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: NeetTokens.accentPrimary.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'ALL-INCLUSIVE NEET 2027 PASS',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: NeetTokens.accentPrimary),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            '₹999 / Season',
            style: TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: NeetTokens.textPrimary),
          ),
          const SizedBox(height: 4),
          const Text(
            'Full access until NEET exam day • Also ₹199/month available',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: NeetTokens.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureRow(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          const Icon(Icons.check_circle, color: NeetTokens.biologyColor, size: 20),
          const SizedBox(width: 12),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 14, color: NeetTokens.textSecondary))),
        ],
      ),
    );
  }
}

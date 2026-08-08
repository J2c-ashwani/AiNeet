import 'package:flutter/material.dart';
import '../../../../core/constants/tokens.dart';

class NativePricingScreen extends StatelessWidget {
  const NativePricingScreen({super.key});

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
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: NeetTokens.primaryGradient,
                  borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
                ),
                child: Column(
                  children: const [
                    Text('PRO TARGET 2026', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 1.2)),
                    SizedBox(height: 8),
                    Text('₹499 / month', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white)),
                    SizedBox(height: 4),
                    Text('Billed via Google Play Billing', style: TextStyle(fontSize: 12, color: Colors.white70)),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text('Included in Pro Pass:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary)),
              const SizedBox(height: 12),
              _buildFeatureRow('Unlimited AI Doubt Solving with camera OCR'),
              _buildFeatureRow('Full-length 720-Mark NTA Pattern Mock Tests'),
              _buildFeatureRow('OMR Sheet Instant Camera Grading'),
              _buildFeatureRow('1v1 Multiplayer Battleground Access'),
              const SizedBox(height: 28),
              ElevatedButton(
                onPressed: () {
                  NeetTokens.hapticSuccess();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Launching Google Play Billing Checkout...')),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: NeetTokens.accentGlow,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusMd)),
                ),
                child: const Text('Subscribe via Google Play →', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
              ),
            ],
          ),
        ),
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

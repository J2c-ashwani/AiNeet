import 'package:flutter/material.dart';
import '../../../../core/constants/tokens.dart';

class NativeOmrScannerScreen extends StatefulWidget {
  const NativeOmrScannerScreen({super.key});

  @override
  State<NativeOmrScannerScreen> createState() => _NativeOmrScannerScreenState();
}

class _NativeOmrScannerScreenState extends State<NativeOmrScannerScreen> {
  bool _isScanning = false;
  Map<String, dynamic>? _scanResult;

  void _handleScanOMR() {
    setState(() => _isScanning = true);
    NeetTokens.hapticMedium();

    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isScanning = false;
          _scanResult = {
            'totalScanned': 180,
            'correct': 142,
            'incorrect': 28,
            'unattempted': 10,
            'calculatedScore': 540,
          };
        });
        NeetTokens.hapticSuccess();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        title: Row(
          children: const [
            Icon(Icons.camera_alt_outlined, color: NeetTokens.chemistryColor),
            SizedBox(width: 8),
            Text(
              'OMR Sheet Scanner',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: NeetTokens.textPrimary,
              ),
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Scanner Viewfinder Card
              Container(
                height: 280,
                decoration: BoxDecoration(
                  color: NeetTokens.bgCard,
                  borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
                  border: Border.all(color: NeetTokens.chemistryColor.withOpacity(0.4)),
                ),
                alignment: Alignment.center,
                child: _isScanning
                    ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          CircularProgressIndicator(color: NeetTokens.chemistryColor),
                          SizedBox(height: 16),
                          Text(
                            'Aligning corner markers & grading...',
                            style: TextStyle(color: NeetTokens.textSecondary, fontSize: 13),
                          ),
                        ],
                      )
                    : Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.document_scanner_outlined,
                            size: 64,
                            color: NeetTokens.chemistryColor.withOpacity(0.6),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Align OMR Sheet inside camera frame',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: NeetTokens.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Supports 180 & 200 Question NEET OMR Sheets',
                            style: TextStyle(fontSize: 12, color: NeetTokens.textMuted),
                          ),
                        ],
                      ),
              ),
              const SizedBox(height: 24),

              ElevatedButton.icon(
                onPressed: _isScanning ? null : _handleScanOMR,
                icon: const Icon(Icons.camera_sharp, color: Colors.black),
                label: const Text(
                  'Scan OMR Sheet with Camera',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Colors.black),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: NeetTokens.chemistryColor,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              if (_scanResult != null) ...[
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: NeetTokens.bgSecondary,
                    borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                    border: Border.all(color: NeetTokens.biologyColor),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'GRADED OMR RESULTS',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: NeetTokens.biologyColor,
                          letterSpacing: 1.1,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Score: ${_scanResult!['calculatedScore']} / 720',
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          color: NeetTokens.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Correct: ${_scanResult!['correct']}', style: const TextStyle(color: NeetTokens.biologyColor, fontWeight: FontWeight.w700)),
                          Text('Incorrect: ${_scanResult!['incorrect']}', style: const TextStyle(color: NeetTokens.error, fontWeight: FontWeight.w700)),
                          Text('Unattempted: ${_scanResult!['unattempted']}', style: const TextStyle(color: NeetTokens.textMuted, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

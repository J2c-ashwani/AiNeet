import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';

class NativeOmrScannerScreen extends StatefulWidget {
  const NativeOmrScannerScreen({super.key});

  @override
  State<NativeOmrScannerScreen> createState() => _NativeOmrScannerScreenState();
}

class _NativeOmrScannerScreenState extends State<NativeOmrScannerScreen> {
  bool _isScanning = false;
  Map<String, dynamic>? _scanResult;
  String? _errorMessage;
  final NeetApiClient _apiClient = NeetApiClient();
  final ImagePicker _picker = ImagePicker();

  Future<void> _handleScan(ImageSource source) async {
    setState(() {
      _errorMessage = null;
      _scanResult = null;
    });

    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        imageQuality: 90,
        maxWidth: 2400,
      );

      if (image == null) return; // User cancelled

      setState(() => _isScanning = true);
      NeetTokens.hapticMedium();

      final bytes = await image.readAsBytes();
      final base64String = base64Encode(bytes);
      
      // Determine mime type from path extension roughly, or default to jpeg
      String mimeType = 'image/jpeg';
      if (image.name.toLowerCase().endsWith('.png')) {
        mimeType = 'image/png';
      }

      final response = await _apiClient.gradeOmr(
        imageBase64: base64String,
        mimeType: mimeType,
      );

      if (!mounted) return;

      if (response.statusCode == 200 && response.data != null) {
        setState(() {
          _isScanning = false;
          _scanResult = {
            'score': response.data['score'] ?? 0,
            'correct': response.data['correct'] ?? 0,
            'incorrect': response.data['incorrect'] ?? 0,
            'unattempted': response.data['unattempted'] ?? 0,
          };
        });
        NeetTokens.hapticSuccess();
      } else {
        throw Exception(response.data?['message'] ?? 'Failed to grade OMR.');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isScanning = false;
        if (e.toString().contains('permission')) {
          _errorMessage = 'Camera permission denied. Please enable it in settings.';
        } else {
          _errorMessage = 'OMR grading requires internet connection or service is unavailable. Please try again.';
        }
      });
      NeetTokens.hapticLight();
    }
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
                  border: Border.all(color: NeetTokens.chemistryColor.withValues(alpha: 0.4)),
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
                            color: NeetTokens.chemistryColor.withValues(alpha: 0.6),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Align OMR Sheet inside camera frame',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: NeetTokens.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Supports 180 & 200 Question NEET OMR Sheets',
                            style: TextStyle(fontSize: 12, color: NeetTokens.textMuted),
                          ),
                        ],
                      ),
              ),
              const SizedBox(height: 24),

              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: NeetTokens.error.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                    border: Border.all(color: NeetTokens.error.withValues(alpha: 0.5)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Icon(Icons.error_outline, color: NeetTokens.error),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: TextStyle(color: NeetTokens.error),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () => _handleScan(ImageSource.camera),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: NeetTokens.error.withValues(alpha: 0.2),
                          foregroundColor: NeetTokens.error,
                        ),
                        child: Text('Retry Scan'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
              ],

              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _isScanning ? null : () => _handleScan(ImageSource.camera),
                      icon: Icon(Icons.camera_sharp, color: Colors.black),
                      label: Text(
                        'Scan with Camera',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.black),
                        textAlign: TextAlign.center,
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: NeetTokens.chemistryColor,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _isScanning ? null : () => _handleScan(ImageSource.gallery),
                      icon: Icon(Icons.image, color: Colors.white),
                      label: Text(
                        'Upload from Gallery',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white),
                        textAlign: TextAlign.center,
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: NeetTokens.bgCardHover,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                        ),
                      ),
                    ),
                  ),
                ],
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
                      Text(
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
                        'Score: ${_scanResult!['score']} / 720',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          color: NeetTokens.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Correct: ${_scanResult!['correct']}', style: TextStyle(color: NeetTokens.biologyColor, fontWeight: FontWeight.w700)),
                          Text('Incorrect: ${_scanResult!['incorrect']}', style: TextStyle(color: NeetTokens.error, fontWeight: FontWeight.w700)),
                          Text('Unattempted: ${_scanResult!['unattempted']}', style: TextStyle(color: NeetTokens.textMuted, fontWeight: FontWeight.w700)),
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

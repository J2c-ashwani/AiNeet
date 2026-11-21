import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';

class NativeOmrScannerScreen extends StatefulWidget {
  const NativeOmrScannerScreen({super.key});

  @override
  State<NativeOmrScannerScreen> createState() => _NativeOmrScannerScreenState();
}

class _NativeOmrScannerScreenState extends State<NativeOmrScannerScreen> {
  final NeetApiClient _apiClient = NeetApiClient();
  final ImagePicker _picker = ImagePicker();

  String _selectedTestId = 'pyq_2024';
  bool _isScanning = false;
  bool _isGrading = false;
  Map<String, dynamic>? _scannedAnswers;
  Map<String, dynamic>? _gradedResult;
  String? _errorMessage;

  static const List<Map<String, String>> _availableTests = [
    {'id': 'pyq_2024', 'label': 'NEET UG 2024 (Official PYQ - 720 Marks)'},
    {'id': 'pyq_2023', 'label': 'NEET UG 2023 (Official PYQ - 720 Marks)'},
    {'id': 'pyq_2022', 'label': 'NEET UG 2022 (Official PYQ - 720 Marks)'},
    {'id': 'pyq_2021', 'label': 'NEET UG 2021 (Official PYQ - 720 Marks)'},
  ];

  Future<void> _handleScan(ImageSource source) async {
    setState(() {
      _errorMessage = null;
      _scannedAnswers = null;
      _gradedResult = null;
    });

    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        imageQuality: 92,
        maxWidth: 2400,
      );

      if (image == null) return; // User cancelled

      setState(() => _isScanning = true);
      NeetTokens.hapticMedium();

      final bytes = await image.readAsBytes();
      final base64String = base64Encode(bytes);

      String mimeType = 'image/jpeg';
      if (image.name.toLowerCase().endsWith('.png')) {
        mimeType = 'image/png';
      }

      // Stage 1: AI Vision Extraction from /api/omr/scan
      final response = await _apiClient.scanOmr(
        imageBase64: base64String,
        mimeType: mimeType,
        testId: _selectedTestId,
      );

      if (!mounted) return;

      if (response.statusCode == 200 && response.data != null) {
        final rawAnswers = response.data['answers'];
        if (rawAnswers is Map) {
          setState(() {
            _isScanning = false;
            _scannedAnswers = Map<String, dynamic>.from(rawAnswers);
          });
          NeetTokens.hapticSuccess();
        } else {
          throw Exception('Invalid answers payload returned by scanner.');
        }
      } else {
        final serverErr = response.data?['reason'] ?? response.data?['error'] ?? 'Failed to read OMR sheet.';
        throw Exception(serverErr);
      }
    } catch (e) {
      if (!mounted) return;
      String friendlyMessage = 'Failed to scan OMR sheet. Please try again.';
      if (e is DioException) {
        friendlyMessage = e.response?.data?['reason']?.toString() ??
            e.response?.data?['error']?.toString() ??
            e.message ??
            'Connection issue while scanning OMR sheet.';
      } else if (e.toString().contains('permission')) {
        friendlyMessage = 'Camera/Photo permission denied. Please grant permission in settings.';
      } else {
        friendlyMessage = e.toString().replaceFirst('Exception: ', '');
      }

      setState(() {
        _isScanning = false;
        _errorMessage = friendlyMessage;
      });
      NeetTokens.hapticLight();
    }
  }

  Future<void> _handleConfirmAndGrade() async {
    if (_scannedAnswers == null) return;

    setState(() {
      _isGrading = true;
      _errorMessage = null;
    });
    NeetTokens.hapticMedium();

    try {
      // Stage 2: Authoritative Database Grading from /api/omr/grade
      final response = await _apiClient.gradeOmr(
        verifiedAnswers: _scannedAnswers!,
        testId: _selectedTestId,
      );

      if (!mounted) return;

      if (response.statusCode == 200 && response.data != null) {
        setState(() {
          _isGrading = false;
          _gradedResult = Map<String, dynamic>.from(response.data);
        });
        NeetTokens.hapticSuccess();
      } else {
        final serverErr = response.data?['error'] ?? 'Grading failed. Please try again.';
        throw Exception(serverErr);
      }
    } catch (e) {
      if (!mounted) return;
      String friendlyMessage = 'Failed to grade OMR sheet.';
      if (e is DioException) {
        friendlyMessage = e.response?.data?['error']?.toString() ??
            e.message ??
            'Connection issue while grading OMR sheet.';
      } else {
        friendlyMessage = e.toString().replaceFirst('Exception: ', '');
      }

      setState(() {
        _isGrading = false;
        _errorMessage = friendlyMessage;
      });
      NeetTokens.hapticLight();
    }
  }

  void _resetScanner() {
    setState(() {
      _scannedAnswers = null;
      _gradedResult = null;
      _errorMessage = null;
    });
    NeetTokens.hapticLight();
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
        actions: [
          if (_scannedAnswers != null || _gradedResult != null)
            IconButton(
              icon: const Icon(Icons.refresh, color: NeetTokens.textSecondary),
              tooltip: 'New Scan',
              onPressed: _resetScanner,
            ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Test Target Selector
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                decoration: BoxDecoration(
                  color: NeetTokens.bgCard,
                  borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                  border: Border.all(color: NeetTokens.border),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedTestId,
                    dropdownColor: NeetTokens.bgCard,
                    isExpanded: true,
                    icon: const Icon(Icons.arrow_drop_down, color: NeetTokens.chemistryColor),
                    items: _availableTests.map((test) {
                      return DropdownMenuItem<String>(
                        value: test['id'],
                        child: Text(
                          test['label']!,
                          style: const TextStyle(
                            color: NeetTokens.textPrimary,
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                          ),
                        ),
                      );
                    }).toList(),
                    onChanged: (_isScanning || _isGrading)
                        ? null
                        : (val) {
                            if (val != null) {
                              setState(() {
                                _selectedTestId = val;
                                _scannedAnswers = null;
                                _gradedResult = null;
                              });
                            }
                          },
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Viewfinder / Status Display
              Container(
                height: 240,
                decoration: BoxDecoration(
                  color: NeetTokens.bgCard,
                  borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
                  border: Border.all(
                    color: _gradedResult != null
                        ? NeetTokens.biologyColor
                        : _scannedAnswers != null
                            ? NeetTokens.physicsColor
                            : NeetTokens.chemistryColor.withValues(alpha: 0.4),
                  ),
                ),
                alignment: Alignment.center,
                child: _isScanning
                    ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          CircularProgressIndicator(color: NeetTokens.chemistryColor),
                          SizedBox(height: 16),
                          Text(
                            'Step 1/2: Gemini Vision reading bubble grid...',
                            style: TextStyle(color: NeetTokens.textSecondary, fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                        ],
                      )
                    : _isGrading
                        ? Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              CircularProgressIndicator(color: NeetTokens.physicsColor),
                              SizedBox(height: 16),
                              Text(
                                'Step 2/2: Grading against official NEET answer key...',
                                style: TextStyle(color: NeetTokens.textSecondary, fontSize: 13, fontWeight: FontWeight.w600),
                              ),
                            ],
                          )
                        : _gradedResult != null
                            ? Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.check_circle_outline, size: 56, color: NeetTokens.biologyColor),
                                  const SizedBox(height: 12),
                                  Text(
                                    '${_gradedResult!['score'] ?? 0} / 720',
                                    style: const TextStyle(
                                      fontSize: 34,
                                      fontWeight: FontWeight.w900,
                                      color: NeetTokens.textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Accuracy: ${_gradedResult!['accuracy'] ?? 0}% • Est. Rank: ${_gradedResult!['rankEstimate'] ?? 'N/A'}',
                                    style: const TextStyle(fontSize: 13, color: NeetTokens.biologyColor, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              )
                            : _scannedAnswers != null
                                ? Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(Icons.fact_check_outlined, size: 56, color: NeetTokens.physicsColor),
                                      const SizedBox(height: 12),
                                      Text(
                                        '${_scannedAnswers!.values.where((v) => v != null).length} Bubbles Detected',
                                        style: const TextStyle(
                                          fontSize: 20,
                                          fontWeight: FontWeight.w800,
                                          color: NeetTokens.textPrimary,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      const Text(
                                        'Review below and tap Confirm to grade against official key',
                                        style: TextStyle(fontSize: 12, color: NeetTokens.textMuted),
                                        textAlign: TextAlign.center,
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
                                        'Supports full 180 & 200 question NEET bubble sheets',
                                        style: TextStyle(fontSize: 12, color: NeetTokens.textMuted),
                                      ),
                                    ],
                                  ),
              ),
              const SizedBox(height: 20),

              // Error Banner
              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: NeetTokens.error.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                    border: Border.all(color: NeetTokens.error.withValues(alpha: 0.5)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: NeetTokens.error),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(color: NeetTokens.error, fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // Action Buttons: Capture / Upload
              if (_scannedAnswers == null && _gradedResult == null)
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: (_isScanning || _isGrading) ? null : () => _handleScan(ImageSource.camera),
                        icon: const Icon(Icons.camera_alt, color: Colors.black),
                        label: const Text(
                          'Scan with Camera',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.black),
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
                        onPressed: (_isScanning || _isGrading) ? null : () => _handleScan(ImageSource.gallery),
                        icon: const Icon(Icons.photo_library, color: Colors.white),
                        label: const Text(
                          'Upload Gallery',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white),
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

              // Stage 1 -> Stage 2 Confirmation Action
              if (_scannedAnswers != null && _gradedResult == null) ...[
                ElevatedButton.icon(
                  onPressed: _isGrading ? null : _handleConfirmAndGrade,
                  icon: const Icon(Icons.verified, color: Colors.black),
                  label: Text(
                    _isGrading ? 'Grading Official Key...' : 'Confirm & Grade Official Score →',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Colors.black),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: NeetTokens.physicsColor,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: _isGrading ? null : _resetScanner,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: NeetTokens.textSecondary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    side: const BorderSide(color: NeetTokens.border),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                    ),
                  ),
                  child: const Text('Retake Photo'),
                ),
                const SizedBox(height: 20),
                // Bubble Summary Grid Preview
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: NeetTokens.bgSecondary,
                    borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                    border: Border.all(color: NeetTokens.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'DETECTED BUBBLES SUMMARY',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: NeetTokens.physicsColor,
                          letterSpacing: 1.1,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _scannedAnswers!.entries.take(40).map((e) {
                          final hasAns = e.value != null;
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: hasAns ? NeetTokens.bgCard : NeetTokens.bgPrimary,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(
                                color: hasAns ? NeetTokens.chemistryColor : NeetTokens.border,
                              ),
                            ),
                            child: Text(
                              'Q${e.key}: ${e.value ?? '-'}',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: hasAns ? NeetTokens.textPrimary : NeetTokens.textMuted,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      if (_scannedAnswers!.length > 40) ...[
                        const SizedBox(height: 8),
                        Text(
                          '+ ${_scannedAnswers!.length - 40} more questions recognized',
                          style: const TextStyle(fontSize: 11, color: NeetTokens.textMuted),
                        ),
                      ],
                    ],
                  ),
                ),
              ],

              // Graded Scorecard Display
              if (_gradedResult != null) ...[
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
                        'OFFICIAL NEET SCORECARD',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: NeetTokens.biologyColor,
                          letterSpacing: 1.1,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Score: ${_gradedResult!['score'] ?? 0} / 720',
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
                          Text(
                            'Correct: ${_gradedResult!['correct'] ?? 0}',
                            style: const TextStyle(color: NeetTokens.biologyColor, fontWeight: FontWeight.w700),
                          ),
                          Text(
                            'Incorrect: ${_gradedResult!['incorrect'] ?? 0}',
                            style: const TextStyle(color: NeetTokens.error, fontWeight: FontWeight.w700),
                          ),
                          Text(
                            'Skipped: ${_gradedResult!['unattempted'] ?? 0}',
                            style: const TextStyle(color: NeetTokens.textMuted, fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: _resetScanner,
                  icon: const Icon(Icons.camera_alt, color: Colors.white),
                  label: const Text('Scan Another OMR Sheet', style: TextStyle(fontWeight: FontWeight.w800)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: NeetTokens.bgCardHover,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusMd)),
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

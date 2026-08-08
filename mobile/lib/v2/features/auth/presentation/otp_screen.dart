import 'dart:async';
import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';
import '../../../core/security/secure_storage.dart';

class NativeOtpScreen extends StatefulWidget {
  final String email;
  final VoidCallback onOtpSuccess;

  const NativeOtpScreen({
    super.key,
    required this.email,
    required this.onOtpSuccess,
  });

  @override
  State<NativeOtpScreen> createState() => _NativeOtpScreenState();
}

class _NativeOtpScreenState extends State<NativeOtpScreen> {
  final _otpController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;
  int _cooldown = 60;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startCooldown();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _otpController.dispose();
    super.dispose();
  }

  void _startCooldown() {
    setState(() => _cooldown = 60);
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_cooldown > 0) {
        setState(() => _cooldown--);
      } else {
        timer.cancel();
      }
    });
  }

  Future<void> _handleVerify() async {
    final otp = _otpController.text.trim();
    if (otp.length != 6) {
      setState(() => _errorMessage = 'Please enter a 6-digit code');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await NeetApiClient().verifyOtp(widget.email, otp);
      if (res.statusCode == 200) {
        final data = res.data;
        final token = data['token'] ?? data['access_token'];
        if (token != null) {
          await SecureStorageService.saveSession(
            token: token,
            refreshToken: data['refreshToken'],
            userId: data['user']?['id']?.toString() ?? '',
            email: widget.email,
          );
          widget.onOtpSuccess();
          return;
        }
      }
      setState(() {
        _errorMessage = res.data['error'] ?? 'Invalid OTP';
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Verification failed. Please try again.';
      });
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: NeetTokens.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Verify Email',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: NeetTokens.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'We sent a 6-digit code to ${widget.email}',
                style: TextStyle(fontSize: 16, color: NeetTokens.textMuted),
              ),
              const SizedBox(height: 32),

              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 24),
                  decoration: BoxDecoration(
                    color: NeetTokens.error.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: NeetTokens.error.withOpacity(0.5)),
                  ),
                  child: Text(
                    _errorMessage!,
                    style: TextStyle(color: NeetTokens.error),
                  ),
                ),

              TextField(
                controller: _otpController,
                keyboardType: TextInputType.number,
                maxLength: 6,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 24, letterSpacing: 8),
                decoration: InputDecoration(
                  counterText: '',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  filled: true,
                  fillColor: NeetTokens.bgSecondary,
                ),
                onChanged: (v) {
                  if (v.length == 6) _handleVerify();
                },
              ),
              const SizedBox(height: 32),

              ElevatedButton(
                onPressed: _isLoading ? null : _handleVerify,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: NeetTokens.accentPrimary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isLoading
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text('Verify', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),

              const Spacer(),

              TextButton(
                onPressed: _cooldown > 0 ? null : _startCooldown,
                child: Text(
                  _cooldown > 0 ? 'Resend code in $_cooldown\s' : 'Resend Code',
                  style: TextStyle(
                    color: _cooldown > 0 ? NeetTokens.textMuted : NeetTokens.accentPrimary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';

class NativeForgotPasswordScreen extends StatefulWidget {
  final void Function(String email) onResetCodeSent;

  const NativeForgotPasswordScreen({
    super.key,
    required this.onResetCodeSent,
  });

  @override
  State<NativeForgotPasswordScreen> createState() => _NativeForgotPasswordScreenState();
}

class _NativeForgotPasswordScreenState extends State<NativeForgotPasswordScreen> {
  final _emailController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleSendReset() async {
    final email = _emailController.text.trim();
    if (email.isEmpty || !email.contains('@')) {
      setState(() => _errorMessage = 'Please enter a valid email address.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await NeetApiClient().resetPassword(email);
      if (res.statusCode == 200) {
        widget.onResetCodeSent(email);
      } else {
        setState(() => _errorMessage = res.data?['error']?.toString() ?? 'Failed to send reset code.');
      }
    } catch (e) {
      String msg = 'Failed to send reset code. Please try again.';
      if (e is DioException && e.response?.data is Map && e.response?.data['error'] != null) {
        msg = e.response!.data['error'].toString();
      }
      setState(() => _errorMessage = msg);
    } finally {
      if (mounted) setState(() => _isLoading = false);
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
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Text(
                'Forgot Password?',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: NeetTokens.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                "Enter your email address and we'll send you a verification code to reset your password.",
                style: TextStyle(
                  fontSize: 14,
                  color: NeetTokens.textMuted,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 32),

              // Error alert
              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: NeetTokens.error.withValues(alpha: 0.15),
                    border: Border.all(color: NeetTokens.error.withValues(alpha: 0.4)),
                    borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.error_outline, color: NeetTokens.error, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: TextStyle(color: NeetTokens.error, fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // Email input
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                style: TextStyle(color: NeetTokens.textPrimary),
                decoration: InputDecoration(
                  labelText: 'Email Address',
                  labelStyle: TextStyle(color: NeetTokens.textMuted),
                  filled: true,
                  fillColor: NeetTokens.bgSecondary,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                    borderSide: BorderSide(color: NeetTokens.border),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                    borderSide: BorderSide(color: NeetTokens.border),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                    borderSide: BorderSide(color: NeetTokens.accentPrimary),
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // Send Reset Code button
              ElevatedButton(
                onPressed: _isLoading ? null : _handleSendReset,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: NeetTokens.accentGlow,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                  ),
                  elevation: 4,
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : Text(
                        'Send Reset Code →',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
              ),
              const SizedBox(height: 24),

              // Back to sign in
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text(
                  'Back to Sign In',
                  style: TextStyle(
                    color: NeetTokens.accentSecondary,
                    fontWeight: FontWeight.w600,
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

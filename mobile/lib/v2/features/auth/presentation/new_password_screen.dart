import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';

class NativeNewPasswordScreen extends StatefulWidget {
  final VoidCallback onPasswordReset;

  const NativeNewPasswordScreen({
    super.key,
    required this.onPasswordReset,
  });

  @override
  State<NativeNewPasswordScreen> createState() => _NativeNewPasswordScreenState();
}

class _NativeNewPasswordScreenState extends State<NativeNewPasswordScreen> {
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  String? _errorMessage;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  Future<void> _handleSetPassword() async {
    final password = _passwordController.text;
    final confirm = _confirmController.text;

    if (password.isEmpty) {
      setState(() => _errorMessage = 'Please enter a new password.');
      return;
    }
    if (password.length < 8) {
      setState(() => _errorMessage = 'Password must be at least 8 characters.');
      return;
    }
    if (!RegExp(r'[a-zA-Z]').hasMatch(password) || !RegExp(r'[0-9]').hasMatch(password)) {
      setState(() => _errorMessage = 'Password must contain both letters and numbers.');
      return;
    }
    if (password != confirm) {
      setState(() => _errorMessage = 'Passwords do not match.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await NeetApiClient().updatePassword(password);
      if (res.statusCode == 200) {
        NeetTokens.hapticSuccess();
        widget.onPasswordReset();
      } else {
        setState(() => _errorMessage = res.data?['error']?.toString() ?? 'Failed to update password.');
      }
    } catch (e) {
      String msg = 'Failed to update password. Please try again.';
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
              Text(
                'Set New Password',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: NeetTokens.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Your identity has been verified. Create a new password for your account.',
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

              // New password field
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                style: TextStyle(color: NeetTokens.textPrimary),
                decoration: InputDecoration(
                  labelText: 'New Password',
                  labelStyle: TextStyle(color: NeetTokens.textMuted),
                  filled: true,
                  fillColor: NeetTokens.bgSecondary,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility_off : Icons.visibility,
                      color: NeetTokens.textMuted,
                    ),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
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
              const SizedBox(height: 16),

              // Confirm password field
              TextField(
                controller: _confirmController,
                obscureText: _obscureConfirm,
                style: TextStyle(color: NeetTokens.textPrimary),
                decoration: InputDecoration(
                  labelText: 'Confirm Password',
                  labelStyle: TextStyle(color: NeetTokens.textMuted),
                  filled: true,
                  fillColor: NeetTokens.bgSecondary,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscureConfirm ? Icons.visibility_off : Icons.visibility,
                      color: NeetTokens.textMuted,
                    ),
                    onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
                  ),
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
              const SizedBox(height: 8),
              Text(
                'Minimum 8 characters with both letters and numbers.',
                style: TextStyle(fontSize: 12, color: NeetTokens.textMuted),
              ),
              const SizedBox(height: 28),

              // Submit button
              ElevatedButton(
                onPressed: _isLoading ? null : _handleSetPassword,
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
                        'Set New Password →',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
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

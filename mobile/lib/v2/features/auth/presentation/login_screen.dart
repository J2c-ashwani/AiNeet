import 'dart:async';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';
import '../../../core/security/secure_storage.dart';

class NativeLoginScreen extends StatefulWidget {
  final VoidCallback onLoginSuccess;
  final VoidCallback onNavigateToRegister;

  const NativeLoginScreen({
    super.key,
    required onLoginSuccess,
    required onNavigateToRegister,
  })  : onLoginSuccess = onLoginSuccess,
        onNavigateToRegister = onNavigateToRegister;

  @override
  State<NativeLoginScreen> createState() => _NativeLoginScreenState();
}

class _NativeLoginScreenState extends State<NativeLoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _apiClient = NeetApiClient();

  bool _isLoading = false;
  String? _errorMessage;
  String? _loadingHint;
  Timer? _slowTimer;

  @override
  void dispose() {
    _slowTimer?.cancel();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = 'Please enter your email and password.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _loadingHint = null;
    });

    _slowTimer?.cancel();
    _slowTimer = Timer(const Duration(seconds: 4), () {
      if (mounted && _isLoading) {
        setState(() {
          _loadingHint = 'Connecting to server... (Render API waking up, please wait)';
        });
      }
    });

    NeetTokens.hapticMedium();

    try {
      final res = await _apiClient.login(email, password);
      if (res.statusCode == 200 && res.data != null) {
        final data = res.data;
        final token = data['token'] ?? data['access_token'] ?? data['session']?['access_token'] ?? '';
        final userId = data['user']?['id'] ?? '';

        if (token.toString().isNotEmpty) {
          await SecureStorageService.saveSession(
            token: token.toString(),
            userId: userId.toString(),
            email: email,
          );
          NeetTokens.hapticSuccess();
          widget.onLoginSuccess();
        } else {
          setState(() => _errorMessage = 'Login succeeded but session token was missing.');
        }
      } else {
        setState(() => _errorMessage = res.data?['error']?.toString() ?? 'Sign in failed. Check your credentials.');
      }
    } catch (e) {
      String msg = 'Sign in failed. Check your credentials.';
      if (e is DioException) {
        if (e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.receiveTimeout) {
          msg = 'Connection timed out while server was waking up. Please tap Sign In again.';
        } else if (e.response?.data is Map && e.response?.data['error'] != null) {
          msg = e.response!.data['error'].toString();
        } else if (e.response?.statusCode == 401) {
          msg = 'Invalid email or password. Please check your details.';
        }
      }
      setState(() => _errorMessage = msg);
    } finally {
      _slowTimer?.cancel();
      if (mounted) {
        setState(() {
          _isLoading = false;
          _loadingHint = null;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Logo & Header
                Center(
                  child: Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      gradient: NeetTokens.primaryGradient,
                      borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      'AI',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Welcome Back',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: NeetTokens.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Sign in to resume your NEET preparation',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: NeetTokens.textMuted,
                  ),
                ),
                const SizedBox(height: 36),

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

                if (_loadingHint != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: NeetTokens.warning.withValues(alpha: 0.15),
                      border: Border.all(color: NeetTokens.warning.withValues(alpha: 0.4)),
                      borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                    ),
                    child: Row(
                      children: [
                        SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: NeetTokens.warning)),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            _loadingHint!,
                            style: TextStyle(color: NeetTokens.warning, fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // Input fields
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
                const SizedBox(height: 16),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  style: TextStyle(color: NeetTokens.textPrimary),
                  decoration: InputDecoration(
                    labelText: 'Password',
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

                // Submit Button
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
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
                          'Sign In →',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                ),
                const SizedBox(height: 24),

                // Register Link
                TextButton(
                  onPressed: widget.onNavigateToRegister,
                  child: Text(
                    "Don't have an account? Register Free",
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
      ),
    );
  }
}

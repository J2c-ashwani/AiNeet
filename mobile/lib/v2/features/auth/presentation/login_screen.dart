import 'package:flutter/material.dart';
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
    });

    NeetTokens.hapticMedium();

    try {
      final res = await _apiClient.login(email, password);
      if (res.statusCode == 200 && res.data != null) {
        final data = res.data;
        final token = data['token'] ?? data['session']?['access_token'] ?? '';
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
          setState(() => _errorMessage = 'Login succeeded but token was missing.');
        }
      } else {
        setState(() => _errorMessage = res.data['error'] ?? 'Sign in failed.');
      }
    } catch (e) {
      setState(() => _errorMessage = 'Sign in failed. Check your credentials.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
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
                      color: NeetTokens.error.withOpacity(0.15),
                      border: Border.all(color: NeetTokens.error.withOpacity(0.4)),
                      borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                    ),
                    child: Text(
                      _errorMessage!,
                      style: TextStyle(color: NeetTokens.error, fontSize: 13),
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

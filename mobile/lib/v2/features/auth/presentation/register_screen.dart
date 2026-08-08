import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';

class NativeRegisterScreen extends StatefulWidget {
  final void Function(String email) onRegistered;
  final VoidCallback onNavigateToLogin;

  const NativeRegisterScreen({
    super.key,
    required this.onRegistered,
    required this.onNavigateToLogin,
  });

  @override
  State<NativeRegisterScreen> createState() => _NativeRegisterScreenState();
}

class _NativeRegisterScreenState extends State<NativeRegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _referralController = TextEditingController();

  String _targetYear = '2025';
  bool _obscurePassword = true;
  bool _isLoading = false;
  String? _errorMessage;
  bool _showReferral = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _referralController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await NeetApiClient().register(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
        targetYear: _targetYear,
        referralCode: _referralController.text.trim().isNotEmpty ? _referralController.text.trim() : null,
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        widget.onRegistered(_emailController.text.trim());
      } else {
        setState(() {
          _errorMessage = res.data['error'] ?? 'Registration failed';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'An error occurred. Please try again.';
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
          icon: const Icon(Icons.arrow_back, color: NeetTokens.textPrimary),
          onPressed: widget.onNavigateToLogin,
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Create Account',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: NeetTokens.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Join AI NEET Coach and start your journey.',
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
                      style: const TextStyle(color: NeetTokens.error),
                    ),
                  ),

                TextFormField(
                  controller: _nameController,
                  decoration: InputDecoration(
                    labelText: 'Full Name',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    filled: true,
                    fillColor: NeetTokens.bgSecondary,
                  ),
                  validator: (v) => v == null || v.isEmpty ? 'Enter your full name' : null,
                ),
                const SizedBox(height: 16),
                
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    labelText: 'Email Address',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    filled: true,
                    fillColor: NeetTokens.bgSecondary,
                  ),
                  validator: (v) => v == null || !v.contains('@') ? 'Enter a valid email' : null,
                ),
                const SizedBox(height: 16),

                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: 'Password',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    filled: true,
                    fillColor: NeetTokens.bgSecondary,
                    suffixIcon: IconButton(
                      icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                    ),
                  ),
                  validator: (v) => v == null || v.length < 6 ? 'Password must be at least 6 characters' : null,
                ),
                const SizedBox(height: 16),

                DropdownButtonFormField<String>(
                  value: _targetYear,
                  decoration: InputDecoration(
                    labelText: 'Target Year',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    filled: true,
                    fillColor: NeetTokens.bgSecondary,
                  ),
                  items: ['2025', '2026', '2027', '2028'].map((year) {
                    return DropdownMenuItem(value: year, child: Text(year));
                  }).toList(),
                  onChanged: (v) {
                    if (v != null) setState(() => _targetYear = v);
                  },
                ),
                const SizedBox(height: 16),

                if (!_showReferral)
                  TextButton(
                    onPressed: () => setState(() => _showReferral = true),
                    child: const Text('Have a referral code?', style: TextStyle(color: NeetTokens.accentPrimary)),
                  )
                else
                  TextFormField(
                    controller: _referralController,
                    decoration: InputDecoration(
                      labelText: 'Referral Code (Optional)',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      filled: true,
                      fillColor: NeetTokens.bgSecondary,
                    ),
                  ),
                
                const SizedBox(height: 32),

                ElevatedButton(
                  onPressed: _isLoading ? null : _handleRegister,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: NeetTokens.accentPrimary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isLoading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Create Account', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
                
                const SizedBox(height: 16),

                TextButton(
                  onPressed: widget.onNavigateToLogin,
                  child: const Text('Already have an account? Sign in', style: TextStyle(color: NeetTokens.textMuted)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

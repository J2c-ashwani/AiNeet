import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/security/secure_storage.dart';
import '../../auth/presentation/settings_screen.dart';

class NativeProfileScreen extends StatefulWidget {
  final VoidCallback onLogout;

  const NativeProfileScreen({super.key, required this.onLogout});

  @override
  State<NativeProfileScreen> createState() => _NativeProfileScreenState();
}

class _NativeProfileScreenState extends State<NativeProfileScreen> {
  String _userEmail = 'student@neet.ac.in';

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final email = await SecureStorageService.getUserEmail();
    if (email != null && mounted) {
      setState(() => _userEmail = email);
    }
  }

  Future<void> _handleLogout() async {
    NeetTokens.hapticMedium();
    await SecureStorageService.clearSession();
    widget.onLogout();
  }

  void _openSettings() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => NativeSettingsScreen(onLogout: _handleLogout),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        title: Text(
          'Profile & Settings',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: NeetTokens.textPrimary,
          ),
        ),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // Profile Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: NeetTokens.bgSecondary,
                borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                border: Border.all(color: NeetTokens.border),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: NeetTokens.accentPrimary,
                    child: Text(
                      _userEmail.isNotEmpty ? _userEmail[0].toUpperCase() : 'S',
                      style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('NEET Student', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary)),
                        Text(_userEmail, style: TextStyle(fontSize: 12, color: NeetTokens.textMuted)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Text('Account Controls', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: NeetTokens.textMuted)),
            const SizedBox(height: 12),

            _buildSettingsItem(Icons.settings, 'Account & Security Settings', _openSettings),
            _buildSettingsItem(Icons.security, 'Parental Controls & Summary Emails', () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Weekly progress summaries are sent to your registered email.')),
              );
            }),
            _buildSettingsItem(Icons.lock_reset, 'Change Password', _openSettings),
            _buildSettingsItem(Icons.delete_forever, 'Delete Account Data', _openSettings, isDestructive: true),
            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: _handleLogout,
              style: ElevatedButton.styleFrom(
                backgroundColor: NeetTokens.error.withOpacity(0.15),
                foregroundColor: NeetTokens.error,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusMd)),
              ),
              child: Text('Sign Out', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingsItem(IconData icon, String title, VoidCallback onTap, {bool isDestructive = false}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: NeetTokens.bgSecondary,
        borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
        border: Border.all(color: NeetTokens.border),
      ),
      child: ListTile(
        leading: Icon(icon, color: isDestructive ? NeetTokens.error : NeetTokens.accentPrimary),
        title: Text(title, style: TextStyle(fontSize: 14, color: isDestructive ? NeetTokens.error : NeetTokens.textPrimary, fontWeight: FontWeight.w600)),
        trailing: Icon(Icons.chevron_right, color: NeetTokens.textMuted),
        onTap: onTap,
      ),
    );
  }
}

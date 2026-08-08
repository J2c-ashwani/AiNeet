import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';

const kAppVersion = '1.1.0';

class NativeSettingsScreen extends StatefulWidget {
  final VoidCallback onLogout;
  const NativeSettingsScreen({super.key, required this.onLogout});

  @override
  State<NativeSettingsScreen> createState() => _NativeSettingsScreenState();
}

class _NativeSettingsScreenState extends State<NativeSettingsScreen> {
  bool _notificationsEnabled = true;

  Future<void> _launchUrl(String urlString) async {
    final url = Uri.parse(urlString);
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open link')),
        );
      }
    }
  }

  void _showChangePasswordDialog() {
    final pwdController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: NeetTokens.bgSecondary,
        title: const Text('Change Password'),
        content: TextField(
          controller: pwdController,
          obscureText: true,
          decoration: const InputDecoration(hintText: 'New Password'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: NeetTokens.accentPrimary),
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await NeetApiClient().dio.post('/api/auth/update-password', data: {
                  'password': pwdController.text,
                });
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Password updated successfully')),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Failed to update password')),
                  );
                }
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: NeetTokens.bgSecondary,
        title: const Text('Delete Account'),
        content: const Text('Are you sure? This action cannot be undone and all your data will be permanently deleted.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: NeetTokens.error),
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await NeetApiClient().dio.delete('/api/auth/delete-account');
                widget.onLogout();
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Failed to delete account')),
                  );
                }
              }
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: NeetTokens.bgPrimary,
        elevation: 0,
      ),
      body: ListView(
        children: [
          _buildSectionHeader('Account'),
          ListTile(
            leading: const Icon(Icons.lock_outline),
            title: const Text('Change Password'),
            onTap: _showChangePasswordDialog,
          ),
          ListTile(
            leading: const Icon(Icons.delete_outline, color: NeetTokens.error),
            title: const Text('Delete Account', style: TextStyle(color: NeetTokens.error)),
            onTap: _showDeleteAccountDialog,
          ),

          _buildSectionHeader('Notifications'),
          SwitchListTile(
            secondary: const Icon(Icons.notifications_none),
            title: const Text('Push Notifications'),
            subtitle: const Text('Coming Soon', style: TextStyle(color: NeetTokens.accentPrimary)),
            value: _notificationsEnabled,
            onChanged: (v) => setState(() => _notificationsEnabled = v),
            activeColor: NeetTokens.accentPrimary,
          ),

          _buildSectionHeader('About'),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('App Version'),
            trailing: const Text(kAppVersion, style: TextStyle(color: NeetTokens.textMuted)),
          ),
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined),
            title: const Text('Privacy Policy'),
            onTap: () => _launchUrl('https://aineetcoach.com/privacy'),
            trailing: const Icon(Icons.open_in_new, size: 16),
          ),
          ListTile(
            leading: const Icon(Icons.description_outlined),
            title: const Text('Terms of Service'),
            onTap: () => _launchUrl('https://aineetcoach.com/terms'),
            trailing: const Icon(Icons.open_in_new, size: 16),
          ),

          _buildSectionHeader('Danger Zone'),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: NeetTokens.bgSecondary,
                foregroundColor: NeetTokens.error,
                padding: const EdgeInsets.symmetric(vertical: 16),
                side: const BorderSide(color: NeetTokens.error),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.logout),
              label: const Text('Log Out'),
              onPressed: widget.onLogout,
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.bold,
          color: NeetTokens.textMuted,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}

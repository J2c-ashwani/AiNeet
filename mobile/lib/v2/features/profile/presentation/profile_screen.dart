import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/security/secure_storage.dart';
import '../../../core/api/api_client.dart';
import '../../../core/cache/offline_cache.dart';
import '../../auth/presentation/settings_screen.dart';

class NativeProfileScreen extends StatefulWidget {
  final VoidCallback onLogout;
  final VoidCallback? onOpenAnalytics;
  final VoidCallback? onOpenLeaderboard;

  const NativeProfileScreen({
    super.key,
    required this.onLogout,
    this.onOpenAnalytics,
    this.onOpenLeaderboard,
  });

  @override
  State<NativeProfileScreen> createState() => _NativeProfileScreenState();
}

class _NativeProfileScreenState extends State<NativeProfileScreen> {
  final NeetApiClient _apiClient = NeetApiClient();
  String _userEmail = 'student@neet.ac.in';
  String _userName = 'NEET Aspirant';
  int _userXp = 450;
  int _userStreak = 7;
  List<dynamic> _achievements = [];

  static const List<Map<String, dynamic>> _defaultBadges = [
    {
      'id': 'first_test',
      'title': 'First Drill',
      'icon': '🎯',
      'desc': 'Completed your first practice test',
      'unlocked': true,
    },
    {
      'id': 'streak_7',
      'title': '7-Day Streak',
      'icon': '🔥',
      'desc': 'Studied 7 consecutive days',
      'unlocked': true,
    },
    {
      'id': 'duel_victor',
      'title': 'Duel Victor',
      'icon': '⚔️',
      'desc': 'Challenged a peer in 1v1 Battleground',
      'unlocked': true,
    },
    {
      'id': 'accuracy_90',
      'title': 'Sniper Accuracy',
      'icon': '⚡',
      'desc': 'Achieved >90% accuracy in a test',
      'unlocked': false,
    },
    {
      'id': 'mock_champion',
      'title': '720 Mock Ace',
      'icon': '🏆',
      'desc': 'Completed a full-length NTA mock test',
      'unlocked': false,
    },
    {
      'id': 'ncert_reader',
      'title': 'NCERT Explorer',
      'icon': '📚',
      'desc': 'Read all biology chapter notes',
      'unlocked': false,
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final email = await SecureStorageService.getUserEmail();
    final cachedAchievements = await OfflineCacheService.getCachedUserData('achievements');
    final cachedProfile = await OfflineCacheService.getCachedUserData('user_profile');

    if (mounted) {
      setState(() {
        if (email != null) _userEmail = email;
        if (cachedProfile is Map<String, dynamic>) {
          _userName = cachedProfile['name'] as String? ?? 'NEET Aspirant';
          _userXp = cachedProfile['xp'] as int? ?? 450;
          _userStreak = cachedProfile['streak'] as int? ?? 7;
        }
        if (cachedAchievements is Map<String, dynamic>) {
          _achievements = (cachedAchievements['badges'] as List<dynamic>?) ?? [];
        }
      });
    }

    try {
      final results = await Future.wait([
        _apiClient.getMe(),
        _apiClient.getAchievements(),
      ]);

      final profileRes = results[0];
      final achRes = results[1];

      if (mounted) {
        setState(() {
          if (profileRes.statusCode == 200 && profileRes.data?['user'] is Map<String, dynamic>) {
            final u = profileRes.data['user'] as Map<String, dynamic>;
            _userName = u['name'] as String? ?? _userName;
            _userEmail = u['email'] as String? ?? _userEmail;
            _userXp = u['xp'] as int? ?? _userXp;
            _userStreak = u['streak'] as int? ?? _userStreak;
          }
          if (achRes.statusCode == 200 && achRes.data?['badges'] is List) {
            _achievements = achRes.data['badges'] as List<dynamic>;
            OfflineCacheService.cacheUserData('achievements', achRes.data, ttlSeconds: 86400);
          }
        });
      }
    } catch (_) {}
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

  // ── Parental Controls Bottom Sheet ─────────────────────────────
  Future<void> _openParentalControlsSheet() async {
    NeetTokens.hapticSelection();

    String currentEmail = '';
    String currentPhone = '';
    bool consent = true;
    bool isLoading = true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: NeetTokens.bgSecondary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(NeetTokens.radiusLg)),
      ),
      builder: (modalCtx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            // Load initial parent settings if first open
            if (isLoading) {
              _apiClient.getParentSettings().then((res) {
                if (res.statusCode == 200 && res.data != null) {
                  setModalState(() {
                    currentEmail = res.data['parent_email']?.toString() ?? '';
                    currentPhone = res.data['parent_phone']?.toString() ?? '';
                    consent = res.data['parent_consent_given_at'] != null;
                    isLoading = false;
                  });
                } else {
                  setModalState(() => isLoading = false);
                }
              }).catchError((_) {
                setModalState(() => isLoading = false);
              });
            }

            final emailController = TextEditingController(text: currentEmail);
            final phoneController = TextEditingController(text: currentPhone);

            return Padding(
              padding: EdgeInsets.only(
                left: 24,
                right: 24,
                top: 24,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: NeetTokens.accentPrimary.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.security, color: NeetTokens.accentPrimary, size: 22),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Text(
                            'Parent Connect & Reports',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: NeetTokens.textPrimary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    const Text(
                      'Empower your parents with weekly WhatsApp & email summaries of your tests, accuracy trends, and study streak. Builds accountability and trust.',
                      style: TextStyle(fontSize: 13, color: NeetTokens.textSecondary, height: 1.4),
                    ),
                    const SizedBox(height: 20),

                    if (isLoading)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(24),
                          child: CircularProgressIndicator(color: NeetTokens.accentPrimary),
                        ),
                      )
                    else ...[
                      // Parent Email Input
                      const Text(
                        'Parent Email Address',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: NeetTokens.textSecondary),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: emailController,
                        keyboardType: TextInputType.emailAddress,
                        style: const TextStyle(color: NeetTokens.textPrimary, fontSize: 14),
                        decoration: InputDecoration(
                          hintText: 'parent@example.com',
                          hintStyle: const TextStyle(color: NeetTokens.textMuted),
                          filled: true,
                          fillColor: NeetTokens.bgCard,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                            borderSide: const BorderSide(color: NeetTokens.border),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                            borderSide: const BorderSide(color: NeetTokens.accentPrimary),
                          ),
                        ),
                        onChanged: (val) => currentEmail = val,
                      ),
                      const SizedBox(height: 14),

                      // Parent Phone Input
                      const Text(
                        'Parent WhatsApp Number',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: NeetTokens.textSecondary),
                      ),
                      const SizedBox(height: 6),
                      TextField(
                        controller: phoneController,
                        keyboardType: TextInputType.phone,
                        style: const TextStyle(color: NeetTokens.textPrimary, fontSize: 14),
                        decoration: InputDecoration(
                          hintText: '+91 98765 43210',
                          hintStyle: const TextStyle(color: NeetTokens.textMuted),
                          filled: true,
                          fillColor: NeetTokens.bgCard,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                            borderSide: const BorderSide(color: NeetTokens.border),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                            borderSide: const BorderSide(color: NeetTokens.accentPrimary),
                          ),
                        ),
                        onChanged: (val) => currentPhone = val,
                      ),
                      const SizedBox(height: 16),

                      // Consent Checkbox
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Checkbox(
                            value: consent,
                            activeColor: NeetTokens.accentPrimary,
                            onChanged: (val) {
                              setModalState(() => consent = val ?? false);
                            },
                          ),
                          const Expanded(
                            child: Padding(
                              padding: EdgeInsets.only(top: 8),
                              child: Text(
                                'I agree to automatically share my weekly mock test scores and study analytics with my parents.',
                                style: TextStyle(fontSize: 12, color: NeetTokens.textMuted, height: 1.3),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Save Button
                      ElevatedButton(
                        onPressed: () async {
                          NeetTokens.hapticMedium();
                          final messenger = ScaffoldMessenger.of(context);
                          final nav = Navigator.of(ctx);
                          try {
                            final saveRes = await _apiClient.updateParentSettings(
                              parentEmail: currentEmail,
                              parentPhone: currentPhone,
                              consentGiven: consent,
                            );
                            if (ctx.mounted) {
                              nav.pop();
                              if (saveRes.statusCode == 200) {
                                messenger.showSnackBar(
                                  const SnackBar(
                                    content: Text('Parent settings updated successfully!'),
                                    backgroundColor: NeetTokens.biologyColor,
                                  ),
                                );
                              } else {
                                messenger.showSnackBar(
                                  SnackBar(
                                    content: Text(saveRes.data?['error']?.toString() ?? 'Failed to update settings.'),
                                    backgroundColor: NeetTokens.warning,
                                  ),
                                );
                              }
                            }
                          } catch (_) {
                            if (ctx.mounted) {
                              nav.pop();
                              messenger.showSnackBar(
                                const SnackBar(
                                  content: Text('Could not save settings. Please retry.'),
                                  backgroundColor: NeetTokens.warning,
                                ),
                              );
                            }
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: NeetTokens.accentGlow,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusSm)),
                        ),
                        child: const Text(
                          'Save Parent Settings',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        title: const Text(
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
                      _userName.isNotEmpty ? _userName[0].toUpperCase() : 'S',
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_userName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary)),
                        const SizedBox(height: 2),
                        Text(_userEmail, style: const TextStyle(fontSize: 12, color: NeetTokens.textMuted)),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: NeetTokens.chemistryColor.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text('⭐ $_userXp XP', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: NeetTokens.chemistryColor)),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: NeetTokens.physicsColor.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text('🔥 $_userStreak Days', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: NeetTokens.physicsColor)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Trophy Cabinet & Achievements
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Trophy Cabinet & Badges 🏆',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: NeetTokens.textMuted),
                ),
                Text(
                  '${_achievements.isNotEmpty ? _achievements.length : 3}/6 Unlocked',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: NeetTokens.accentPrimary),
                ),
              ],
            ),
            const SizedBox(height: 12),

            _buildTrophyCabinet(),
            const SizedBox(height: 24),

            if (widget.onOpenAnalytics != null || widget.onOpenLeaderboard != null) ...[
              const Text('Performance & Ranking', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: NeetTokens.textMuted)),
              const SizedBox(height: 12),
              if (widget.onOpenAnalytics != null)
                _buildSettingsItem(Icons.insights_rounded, 'Performance Analytics', widget.onOpenAnalytics!),
              if (widget.onOpenLeaderboard != null)
                _buildSettingsItem(Icons.emoji_events_outlined, 'All-India Leaderboard', widget.onOpenLeaderboard!),
              const SizedBox(height: 16),
            ],

            const Text('Account Controls', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: NeetTokens.textMuted)),
            const SizedBox(height: 12),

            _buildSettingsItem(Icons.settings, 'Account & Security Settings', _openSettings),
            _buildSettingsItem(
              Icons.family_restroom_rounded,
              'Parental Controls & Summary Reports',
              _openParentalControlsSheet,
            ),
            _buildSettingsItem(Icons.lock_reset, 'Change Password', _openSettings),
            _buildSettingsItem(Icons.delete_forever, 'Delete Account Data', _openSettings, isDestructive: true),
            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: _handleLogout,
              style: ElevatedButton.styleFrom(
                backgroundColor: NeetTokens.error.withValues(alpha: 0.15),
                foregroundColor: NeetTokens.error,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusMd)),
              ),
              child: const Text('Sign Out', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTrophyCabinet() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: NeetTokens.bgSecondary,
        borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
        border: Border.all(color: NeetTokens.border),
      ),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 0.85,
        ),
        itemCount: _defaultBadges.length,
        itemBuilder: (context, index) {
          final b = _defaultBadges[index];
          final isUnlocked = (b['unlocked'] as bool) ||
              _achievements.any((a) => a['achievement_id'] == b['id'] || a['badge_name'] == b['title']);

          return Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isUnlocked ? NeetTokens.bgCard : NeetTokens.bgCard.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
              border: Border.all(
                color: isUnlocked ? NeetTokens.accentPrimary.withValues(alpha: 0.5) : NeetTokens.border.withValues(alpha: 0.5),
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  b['icon'] as String,
                  style: TextStyle(
                    fontSize: 26,
                    color: isUnlocked ? null : Colors.grey,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  b['title'] as String,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: isUnlocked ? NeetTokens.textPrimary : NeetTokens.textMuted,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  isUnlocked ? 'Unlocked' : 'Locked',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w600,
                    color: isUnlocked ? NeetTokens.biologyColor : NeetTokens.textMuted,
                  ),
                ),
              ],
            ),
          );
        },
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
        trailing: const Icon(Icons.chevron_right, color: NeetTokens.textMuted),
        onTap: onTap,
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/providers.dart';
import '../router/app_router.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});
  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _loggingOut = false;

  Future<void> _logout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1e293b),
        title: const Text('Log Out?', style: TextStyle(color: Color(0xFFf1f5f9))),
        content: const Text('You will be returned to the login screen.', style: TextStyle(color: Color(0xFF94a3b8))),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel', style: TextStyle(color: Color(0xFF94a3b8)))),
          ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Log Out')),
        ],
      ),
    );
    if (confirm != true) return;
    setState(() => _loggingOut = true);
    await ref.read(authNotifierProvider.notifier).logout();
    if (mounted) context.go(AppRoutes.login);
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authNotifierProvider).user;
    if (user == null) return const SizedBox.shrink();

    final planBadge = user.isPremium ? ('⭐ Premium', const Color(0xFFf59e0b)) : user.isPro ? ('🔷 Pro', const Color(0xFF6366f1)) : ('🆓 Free', const Color(0xFF64748b));

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Profile header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(28),
              decoration: const BoxDecoration(
                gradient: LinearGradient(colors: [Color(0xFF1a1040), Color(0xFF0a0e1a)], begin: Alignment.topCenter, end: Alignment.bottomCenter),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 44,
                    backgroundColor: const Color(0xFF6366f1),
                    child: Text(user.name.isNotEmpty ? user.name[0].toUpperCase() : '?', style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w800)),
                  ),
                  const SizedBox(height: 14),
                  Text(user.name, style: const TextStyle(color: Color(0xFFf1f5f9), fontSize: 20, fontWeight: FontWeight.w800)),
                  Text(user.email, style: const TextStyle(color: Color(0xFF94a3b8), fontSize: 13)),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(color: planBadge.$2.withOpacity(0.15), borderRadius: BorderRadius.circular(20), border: Border.all(color: planBadge.$2.withOpacity(0.4))),
                    child: Text(planBadge.$1, style: TextStyle(color: planBadge.$2, fontWeight: FontWeight.w700)),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _InfoBadge('🔥', '${user.streak}', 'Streak'),
                      const SizedBox(width: 20),
                      _InfoBadge('⭐', '${user.xp}', 'XP'),
                      const SizedBox(width: 20),
                      _InfoBadge('🏅', 'Lvl ${user.level}', 'Level'),
                    ],
                  ),
                ],
              ),
            ),

            // Menu items
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _MenuItem(Icons.insights_rounded, 'Performance Analytics', () => context.go(AppRoutes.studyPlan)),
                  _MenuItem(Icons.self_improvement_rounded, 'Revision Cards', () => context.go(AppRoutes.revision)),
                  _MenuItem(Icons.menu_book_rounded, 'NCERT Library', () => context.go(AppRoutes.ncert)),
                  _MenuItem(Icons.workspace_premium_rounded, 'Upgrade Plan', () {}),
                  _MenuItem(Icons.notifications_outlined, 'Notification Settings', () {}),
                  _MenuItem(Icons.privacy_tip_outlined, 'Privacy Policy', () {}),
                  _MenuItem(Icons.info_outline_rounded, 'About', () {}),
                  const SizedBox(height: 8),
                  ListTile(
                    leading: const Icon(Icons.logout_rounded, color: Color(0xFFef4444)),
                    title: const Text('Log Out', style: TextStyle(color: Color(0xFFef4444), fontWeight: FontWeight.w600)),
                    onTap: _loggingOut ? null : _logout,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    tileColor: const Color(0x10ef4444),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoBadge extends StatelessWidget {
  final String emoji;
  final String value;
  final String label;
  const _InfoBadge(this.emoji, this.value, this.label);
  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Text(emoji, style: const TextStyle(fontSize: 20)),
      Text(value, style: const TextStyle(color: Color(0xFFf1f5f9), fontWeight: FontWeight.w800, fontSize: 16)),
      Text(label, style: const TextStyle(color: Color(0xFF64748b), fontSize: 11)),
    ]);
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  const _MenuItem(this.icon, this.title, this.onTap);
  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: const Color(0xFF94a3b8)),
      title: Text(title, style: const TextStyle(color: Color(0xFFe2e8f0), fontWeight: FontWeight.w500)),
      trailing: const Icon(Icons.chevron_right, color: Color(0xFF475569)),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    );
  }
}

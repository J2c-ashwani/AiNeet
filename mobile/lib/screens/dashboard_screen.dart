import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/providers.dart';
import '../router/app_router.dart';
import '../core/api_client.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});
  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  Map<String, dynamic>? _performance;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await ApiClient().getPerformance();
      if (mounted) setState(() { _performance = data; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authNotifierProvider).user;
    final hour = DateTime.now().hour;
    final greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          color: const Color(0xFF6366f1),
          onRefresh: _load,
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Greeting Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('$greeting 👋', style: const TextStyle(color: Color(0xFF94a3b8), fontSize: 14)),
                              Text(user?.name ?? 'NEET Aspirant',
                                  style: const TextStyle(color: Color(0xFFf1f5f9), fontSize: 22, fontWeight: FontWeight.w800)),
                            ],
                          ),
                          // Streak badge
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(colors: [Color(0xFFf59e0b), Color(0xFFef4444)]),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              children: [
                                const Text('🔥', style: TextStyle(fontSize: 16)),
                                const SizedBox(width: 4),
                                Text('${user?.streak ?? 0} day streak',
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // XP / Level card
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF4338ca), Color(0xFF7c3aed)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [BoxShadow(color: const Color(0xFF6366f1).withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 8))],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('Level ${user?.level ?? 1}', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                                Text('${user?.xp ?? 0} XP', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                              ],
                            ),
                            const SizedBox(height: 8),
                            LinearProgressIndicator(
                              value: ((user?.xp ?? 0) % 1000) / 1000,
                              color: Colors.white,
                              backgroundColor: Colors.white24,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            const SizedBox(height: 12),
                            const Text('Keep studying to level up! 💪',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Quick Actions grid
                      const Text('Quick Actions', style: TextStyle(color: Color(0xFFf1f5f9), fontWeight: FontWeight.w700, fontSize: 16)),
                      const SizedBox(height: 12),
                      GridView.count(
                        crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
                        mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 1.4,
                        children: [
                          _QuickAction(emoji: '📝', label: 'Take a Test', color: const Color(0xFF6366f1), onTap: () => context.go(AppRoutes.testConfig)),
                          _QuickAction(emoji: '🤔', label: 'Solve a Doubt', color: const Color(0xFF10b981), onTap: () => context.go(AppRoutes.doubts)),
                          _QuickAction(emoji: '⚔️', label: 'Battleground', color: const Color(0xFFef4444), onTap: () => context.go(AppRoutes.battleground)),
                          _QuickAction(emoji: '📚', label: 'Study Plan', color: const Color(0xFFf59e0b), onTap: () => context.go(AppRoutes.studyPlan)),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Performance snapshot
                      if (!_loading && _performance != null) ...[
                        const Text('Performance Snapshot', style: TextStyle(color: Color(0xFFf1f5f9), fontWeight: FontWeight.w700, fontSize: 16)),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(child: _StatCard(label: 'Tests Taken', value: '${_performance!['totalTests'] ?? 0}', icon: '📋')),
                            const SizedBox(width: 12),
                            Expanded(child: _StatCard(label: 'Avg Score', value: '${_performance!['averageScore']?.toStringAsFixed(0) ?? 0}', icon: '🎯')),
                            const SizedBox(width: 12),
                            Expanded(child: _StatCard(label: 'Accuracy', value: '${_performance!['accuracy']?.toStringAsFixed(1) ?? 0}%', icon: '✅')),
                          ],
                        ),
                      ],
                      if (_loading) const Center(child: Padding(
                        padding: EdgeInsets.all(24),
                        child: CircularProgressIndicator(color: Color(0xFF6366f1)),
                      )),
                    ],
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

class _QuickAction extends StatelessWidget {
  final String emoji;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _QuickAction({required this.emoji, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(emoji, style: const TextStyle(fontSize: 24)),
            Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final String icon;
  const _StatCard({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: const Color(0xFF1e293b), borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0x20FFFFFF))),
      child: Column(
        children: [
          Text(icon, style: const TextStyle(fontSize: 20)),
          const SizedBox(height: 6),
          Text(value, style: const TextStyle(color: Color(0xFFf1f5f9), fontWeight: FontWeight.w800, fontSize: 18)),
          Text(label, style: const TextStyle(color: Color(0xFF94a3b8), fontSize: 11), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

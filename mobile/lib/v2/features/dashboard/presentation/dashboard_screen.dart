import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';
import '../../../core/cache/offline_cache.dart';

/// Native V2 Home Dashboard
/// Fast first paint using local cached data before network revalidation.
class NativeDashboardScreen extends StatefulWidget {
  final Function(String topic) onStartPractice;
  final VoidCallback onOpenMistakes;
  final VoidCallback onOpenRevision;
  final VoidCallback onOpenStudyPlan;
  final VoidCallback onOpenBlueprint;
  final VoidCallback onOpenProfile;
  final VoidCallback onOpenPricing;

  const NativeDashboardScreen({
    super.key,
    required this.onStartPractice,
    required this.onOpenMistakes,
    required this.onOpenRevision,
    required this.onOpenStudyPlan,
    required this.onOpenBlueprint,
    required this.onOpenProfile,
    required this.onOpenPricing,
  });

  @override
  State<NativeDashboardScreen> createState() => _NativeDashboardScreenState();
}

class _NativeDashboardScreenState extends State<NativeDashboardScreen> {
  final NeetApiClient _apiClient = NeetApiClient();

  Map<String, dynamic>? _performanceData;
  Map<String, dynamic>? _userProfile;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    // 1. Instant First Paint from Offline Cache
    final cached = await OfflineCacheService.getCachedUserData('performance');
    final cachedProfile = await OfflineCacheService.getCachedUserData('user_profile');
    if (mounted) {
      setState(() {
        if (cached is Map<String, dynamic>) _performanceData = cached;
        if (cachedProfile is Map<String, dynamic>) _userProfile = cachedProfile;
      });
    }

    // 2. Revalidate over Network
    try {
      final results = await Future.wait([
        _apiClient.getPerformance(),
        _apiClient.getMe(),
      ]);

      final perfRes = results[0];
      final profileRes = results[1];

      if (mounted) {
        setState(() {
          if (perfRes.statusCode == 200 && perfRes.data is Map<String, dynamic>) {
            _performanceData = perfRes.data as Map<String, dynamic>;
            OfflineCacheService.cacheUserData('performance', perfRes.data, ttlSeconds: 86400);
          }
          if (profileRes.statusCode == 200 && profileRes.data?['user'] is Map<String, dynamic>) {
            _userProfile = profileRes.data['user'] as Map<String, dynamic>;
            OfflineCacheService.cacheUserData('user_profile', _userProfile, ttlSeconds: 86400);
          }
        });
      }
    } catch (_) {
      // Offline fallback already active
    }
  }

  @override
  Widget build(BuildContext context) {
    final overallStats = _performanceData?['overallStats'] as Map<String, dynamic>? ?? {};
    final rankPrediction = _performanceData?['rankPrediction'] as Map<String, dynamic>? ?? {};
    final weakAreas = (_performanceData?['weakAreas'] as List<dynamic>?) ?? [];
    final totalTests = overallStats['total_tests'] as int? ?? 0;
    final avgAccuracy = overallStats['avg_accuracy'] as num? ?? 0;

    final userName = _userProfile?['name'] as String? ?? 'NEET Aspirant';
    final streak = _userProfile?['streak'] as int? ?? 7;
    final xp = _userProfile?['xp'] as int? ?? 450;
    final targetYear = _userProfile?['target_year']?.toString() ?? '2026';

    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadDashboardData,
          color: NeetTokens.accentPrimary,
          backgroundColor: NeetTokens.bgSecondary,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Row with Profile Action
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        GestureDetector(
                          onTap: () {
                            NeetTokens.hapticSelection();
                            widget.onOpenProfile();
                          },
                          child: Container(
                            width: 52,
                            height: 52,
                            decoration: BoxDecoration(
                              gradient: NeetTokens.primaryGradient,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: NeetTokens.accentPrimary.withValues(alpha: 0.35),
                                  blurRadius: 12,
                                ),
                              ],
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              userName.isNotEmpty ? userName[0].toUpperCase() : 'A',
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Hi, $userName! 👋',
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                                color: NeetTokens.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'NEET $targetYear Target Standard',
                              style: const TextStyle(
                                fontSize: 13,
                                color: NeetTokens.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    IconButton(
                      onPressed: widget.onOpenProfile,
                      icon: const Icon(Icons.settings_outlined, color: NeetTokens.textSecondary),
                      tooltip: 'Profile & Settings',
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // KPI Row (Streak / XP / Est. Rank)
                Row(
                  children: [
                    Expanded(
                      child: _buildKpiCard(
                        icon: '🔥',
                        value: '$streak',
                        label: 'Day Streak',
                        accentColor: NeetTokens.physicsColor,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildKpiCard(
                        icon: '⭐',
                        value: '$xp',
                        label: 'Total XP',
                        accentColor: NeetTokens.chemistryColor,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildKpiCard(
                        icon: '🏆',
                        value: rankPrediction['predictedRank'] != null
                            ? '#${(rankPrediction['predictedRank'] / 1000).toStringAsFixed(1)}k'
                            : 'Top 5%',
                        label: 'Est. Rank',
                        accentColor: NeetTokens.accentSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Stat Cards Grid
                Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        title: 'Tests Taken',
                        value: '$totalTests',
                        icon: Icons.track_changes_outlined,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildStatCard(
                        title: 'Avg Accuracy',
                        value: '$avgAccuracy%',
                        icon: Icons.check_circle_outline,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Quick Navigation Grid
                const Text(
                  'Quick Study Tools',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: NeetTokens.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),

                Row(
                  children: [
                    Expanded(
                      child: _buildToolCard(
                        title: 'Mistake Notebook',
                        subtitle: 'Review weak Qs',
                        icon: Icons.auto_stories_outlined,
                        color: NeetTokens.physicsColor,
                        onTap: widget.onOpenMistakes,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildToolCard(
                        title: 'Spaced Revision',
                        subtitle: 'Memory retention',
                        icon: Icons.replay_circle_filled_outlined,
                        color: NeetTokens.chemistryColor,
                        onTap: widget.onOpenRevision,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                Row(
                  children: [
                    Expanded(
                      child: _buildToolCard(
                        title: '150-Day Plan',
                        subtitle: 'Daily roadmap',
                        icon: Icons.calendar_month_outlined,
                        color: NeetTokens.biologyColor,
                        onTap: widget.onOpenStudyPlan,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildToolCard(
                        title: 'NEET Blueprint',
                        subtitle: 'High-yield topics',
                        icon: Icons.pie_chart_outline_rounded,
                        color: NeetTokens.accentSecondary,
                        onTap: widget.onOpenBlueprint,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Recommended Practice Card
                _buildWeakAreaCard(weakAreas),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildKpiCard({
    required String icon,
    required String value,
    required String label,
    required Color accentColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      decoration: BoxDecoration(
        color: NeetTokens.bgSecondary,
        borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
        border: Border.all(color: NeetTokens.border),
      ),
      child: Column(
        children: [
          Text(icon, style: const TextStyle(fontSize: 22)),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: accentColor,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: NeetTokens.textMuted,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: NeetTokens.bgSecondary,
        borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
        border: Border.all(color: NeetTokens.border),
      ),
      child: Row(
        children: [
          Icon(icon, color: NeetTokens.accentPrimary, size: 28),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: NeetTokens.textPrimary,
                ),
              ),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 12,
                  color: NeetTokens.textMuted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildToolCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: () {
        NeetTokens.hapticSelection();
        onTap();
      },
      borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: NeetTokens.bgSecondary,
          borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
          border: Border.all(color: NeetTokens.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(height: 10),
            Text(
              title,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: NeetTokens.textPrimary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(
                fontSize: 11,
                color: NeetTokens.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWeakAreaCard(List<dynamic> weakAreas) {
    final topWeak = weakAreas.isNotEmpty ? weakAreas.first as Map<String, dynamic> : null;
    final topicName = topWeak?['topic_name'] as String? ?? 'Thermodynamics & Heat Transfer';
    final accuracy = topWeak?['accuracy'] != null ? (topWeak!['accuracy'] as num).round() : 42;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            NeetTokens.bgCard,
            NeetTokens.accentPrimary.withValues(alpha: 0.12),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
        border: Border.all(color: NeetTokens.accentPrimary.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.bolt, color: NeetTokens.physicsColor, size: 20),
              SizedBox(width: 6),
              Text(
                'RECOMMENDED PRACTICE',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: NeetTokens.physicsColor,
                  letterSpacing: 1.1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            topicName,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: NeetTokens.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Your accuracy in this topic is currently $accuracy%. Practice 10 targeted questions to boost your mastery.',
            style: const TextStyle(
              fontSize: 13,
              color: NeetTokens.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              NeetTokens.hapticMedium();
              widget.onStartPractice(topicName);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: NeetTokens.accentGlow,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
              ),
            ),
            child: const Text(
              'Practice Weak Area →',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

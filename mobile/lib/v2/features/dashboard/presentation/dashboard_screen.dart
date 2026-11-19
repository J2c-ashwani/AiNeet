import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';
import '../../../core/cache/offline_cache.dart';

/// Native V2 Home Dashboard
/// Fast first paint using local cached data before network revalidation.
class NativeDashboardScreen extends StatefulWidget {
  final Function(String topic) onStartPractice;
  final VoidCallback onOpenCustomTest;
  final VoidCallback onOpenMistakes;
  final VoidCallback onOpenRevision;
  final VoidCallback onOpenStudyPlan;
  final VoidCallback onOpenBlueprint;
  final VoidCallback onOpenProfile;
  final VoidCallback onOpenPricing;
  final VoidCallback onOpenAnalytics;
  final VoidCallback onOpenLeaderboard;

  const NativeDashboardScreen({
    super.key,
    required this.onStartPractice,
    required this.onOpenCustomTest,
    required this.onOpenMistakes,
    required this.onOpenRevision,
    required this.onOpenStudyPlan,
    required this.onOpenBlueprint,
    required this.onOpenProfile,
    required this.onOpenPricing,
    this.onOpenAnalytics = _defaultVoidCallback,
    this.onOpenLeaderboard = _defaultVoidCallback,
  });

  static void _defaultVoidCallback() {}

  @override
  State<NativeDashboardScreen> createState() => _NativeDashboardScreenState();
}

class _NativeDashboardScreenState extends State<NativeDashboardScreen> {
  final NeetApiClient _apiClient = NeetApiClient();

  Map<String, dynamic>? _performanceData;
  Map<String, dynamic>? _userProfile;
  Map<String, dynamic>? _dailyCoachData;
  String _selectedDreamCollege = 'AIIMS New Delhi';

  static const Map<String, int> _dreamCollegeCutoffs = {
    'AIIMS New Delhi': 710,
    'MAMC New Delhi': 690,
    'KGMU Lucknow': 665,
    'Grant Medical College Mumbai': 655,
    'Madras Medical College Chennai': 645,
    'Govt. Medical College (General)': 610,
  };

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    // 1. Instant First Paint from Offline Cache
    final cached = await OfflineCacheService.getCachedUserData('performance');
    final cachedProfile = await OfflineCacheService.getCachedUserData('user_profile');
    final cachedCoach = await OfflineCacheService.getCachedUserData('daily_coach');
    if (mounted) {
      setState(() {
        if (cached is Map<String, dynamic>) _performanceData = cached;
        if (cachedProfile is Map<String, dynamic>) _userProfile = cachedProfile;
        if (cachedCoach is Map<String, dynamic>) _dailyCoachData = cachedCoach;
      });
    }

    // 2. Revalidate over Network
    try {
      final results = await Future.wait([
        _apiClient.getPerformance(),
        _apiClient.getMe(),
        _apiClient.getDailyCoach(),
      ]);

      final perfRes = results[0];
      final profileRes = results[1];
      final coachRes = results[2];

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
          if (coachRes.statusCode == 200 && coachRes.data is Map<String, dynamic>) {
            _dailyCoachData = coachRes.data as Map<String, dynamic>;
            OfflineCacheService.cacheUserData('daily_coach', _dailyCoachData, ttlSeconds: 14400);
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

                // AI Daily Coach Morning Briefing
                _buildDailyCoachBanner(),
                const SizedBox(height: 24),

                // Primary Custom Test Generator Banner
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        NeetTokens.bgCard,
                        NeetTokens.accentPrimary.withValues(alpha: 0.16),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
                    border: Border.all(color: NeetTokens.accentPrimary.withValues(alpha: 0.4)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: NeetTokens.accentPrimary.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.tune_rounded, color: NeetTokens.accentPrimary, size: 20),
                          ),
                          const SizedBox(width: 10),
                          const Text(
                            'CUSTOM TEST GENERATOR',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: NeetTokens.accentPrimary,
                              letterSpacing: 1.1,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Practice Exactly What You Need',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: NeetTokens.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Configure chapter-wise tests, 180-Q full mocks, year-wise PYQs, or AI-adaptive tests tailored to your preparation.',
                        style: TextStyle(
                          fontSize: 13,
                          color: NeetTokens.textSecondary,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: () {
                          NeetTokens.hapticMedium();
                          widget.onOpenCustomTest();
                        },
                        icon: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 20),
                        label: const Text(
                          'Configure Custom Test →',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: NeetTokens.accentGlow,
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                          ),
                        ),
                      ),
                    ],
                  ),
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
                        title: 'Custom Test',
                        subtitle: 'Full & Chapter Mocks',
                        icon: Icons.tune_rounded,
                        color: NeetTokens.accentPrimary,
                        onTap: widget.onOpenCustomTest,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildToolCard(
                        title: 'Mistake Notebook',
                        subtitle: 'Review weak Qs',
                        icon: Icons.auto_stories_outlined,
                        color: NeetTokens.physicsColor,
                        onTap: widget.onOpenMistakes,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                Row(
                  children: [
                    Expanded(
                      child: _buildToolCard(
                        title: 'Spaced Revision',
                        subtitle: 'Memory retention',
                        icon: Icons.replay_circle_filled_outlined,
                        color: NeetTokens.chemistryColor,
                        onTap: widget.onOpenRevision,
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
                        title: 'Pro Upgrade',
                        subtitle: 'Unlock all features',
                        icon: Icons.workspace_premium_outlined,
                        color: NeetTokens.warning,
                        onTap: widget.onOpenPricing,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                Row(
                  children: [
                    Expanded(
                      child: _buildToolCard(
                        title: 'Analytics',
                        subtitle: 'Score & accuracy',
                        icon: Icons.insights_rounded,
                        color: NeetTokens.accentPrimary,
                        onTap: widget.onOpenAnalytics,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildToolCard(
                        title: 'Leaderboard',
                        subtitle: 'All-India ranks',
                        icon: Icons.emoji_events_outlined,
                        color: NeetTokens.chemistryColor,
                        onTap: widget.onOpenLeaderboard,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Dream Medical College Cutoff Simulator (Growth Add-on)
                _buildCutoffSimulatorCard(avgAccuracy),
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

  Widget _buildDailyCoachBanner() {
    final greeting = _dailyCoachData?['greeting'] as String? ?? 'Good day, Doctor in the making! 🩺';
    final message = _dailyCoachData?['message'] as String? ??
        'Consistency beats intensity. Tackle today\'s high-yield drill to maintain your edge for NEET.';
    final tip = _dailyCoachData?['tip'] as String? ??
        'Focus on NCERT diagrams and line-by-line concept clarity in Biology & Inorganic Chemistry.';
    final actionItem = _dailyCoachData?['actionItem'] as Map<String, dynamic>?;
    final actionText = actionItem?['text'] as String? ?? 'Start Daily Drill →';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            NeetTokens.bgCard,
            NeetTokens.chemistryColor.withValues(alpha: 0.16),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
        border: Border.all(color: NeetTokens.chemistryColor.withValues(alpha: 0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: NeetTokens.chemistryColor.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.auto_awesome, color: NeetTokens.chemistryColor, size: 20),
              ),
              const SizedBox(width: 10),
              const Text(
                'AI DAILY COACH BRIEFING',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: NeetTokens.chemistryColor,
                  letterSpacing: 1.1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            greeting,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: NeetTokens.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            message,
            style: const TextStyle(
              fontSize: 13,
              color: NeetTokens.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: NeetTokens.bgSecondary.withValues(alpha: 0.6),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: NeetTokens.border),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('💡', style: TextStyle(fontSize: 14)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    tip,
                    style: const TextStyle(
                      fontSize: 12,
                      fontStyle: FontStyle.italic,
                      color: NeetTokens.textMuted,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () {
              NeetTokens.hapticMedium();
              final link = actionItem?['link'] as String? ?? '';
              if (link.contains('mock') || link.contains('diagnostic')) {
                widget.onOpenCustomTest();
              } else if (link.contains('topic=')) {
                final topic = Uri.tryParse(link)?.queryParameters['topic'] ?? 'Thermodynamics';
                widget.onStartPractice(topic);
              } else {
                widget.onStartPractice('Thermodynamics');
              }
            },
            icon: const Icon(Icons.bolt, color: Colors.black, size: 18),
            label: Text(
              actionText,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: Colors.black,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: NeetTokens.chemistryColor,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCutoffSimulatorCard(num avgAccuracy) {
    final estimatedScore = (avgAccuracy > 0 ? (avgAccuracy / 100 * 720).round() : 520).clamp(180, 720);
    final targetCutoff = _dreamCollegeCutoffs[_selectedDreamCollege] ?? 710;
    final marksGap = targetCutoff - estimatedScore;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: NeetTokens.bgSecondary,
        borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
        border: Border.all(color: NeetTokens.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: NeetTokens.accentPrimary.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.school_outlined, color: NeetTokens.accentPrimary, size: 20),
                  ),
                  const SizedBox(width: 10),
                  const Text(
                    'DREAM COLLEGE CUTOFF SIMULATOR',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: NeetTokens.accentPrimary,
                      letterSpacing: 1.1,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Text(
            'Select Target Medical College:',
            style: TextStyle(fontSize: 12, color: NeetTokens.textMuted, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
            decoration: BoxDecoration(
              color: NeetTokens.bgCard,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: NeetTokens.border),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedDreamCollege,
                isExpanded: true,
                dropdownColor: NeetTokens.bgCard,
                icon: const Icon(Icons.arrow_drop_down, color: NeetTokens.accentPrimary),
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: NeetTokens.textPrimary),
                onChanged: (val) {
                  if (val != null) {
                    setState(() => _selectedDreamCollege = val);
                  }
                },
                items: _dreamCollegeCutoffs.keys.map((name) {
                  final cutoff = _dreamCollegeCutoffs[name]!;
                  return DropdownMenuItem(
                    value: name,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Flexible(child: Text(name, overflow: TextOverflow.ellipsis)),
                        Text('$cutoff Marks', style: const TextStyle(fontSize: 12, color: NeetTokens.accentPrimary)),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Est. Score', style: TextStyle(fontSize: 11, color: NeetTokens.textMuted)),
                    const SizedBox(height: 2),
                    Text('$estimatedScore / 720', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text('Target Cutoff', style: TextStyle(fontSize: 11, color: NeetTokens.textMuted)),
                    const SizedBox(height: 2),
                    Text('$targetCutoff Marks', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: NeetTokens.accentPrimary)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: (estimatedScore / targetCutoff).clamp(0.0, 1.0),
              minHeight: 8,
              backgroundColor: NeetTokens.bgCard,
              color: marksGap <= 0 ? NeetTokens.biologyColor : NeetTokens.accentPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: NeetTokens.bgCard,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: NeetTokens.border),
            ),
            child: Row(
              children: [
                Icon(
                  marksGap <= 0 ? Icons.check_circle : Icons.trending_up,
                  color: marksGap <= 0 ? NeetTokens.biologyColor : NeetTokens.physicsColor,
                  size: 20,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    marksGap <= 0
                        ? 'Congratulations! You are on track to clear the cutoff for $_selectedDreamCollege.'
                        : 'Bridge the +$marksGap mark gap by mastering high-weightage chapters.',
                    style: const TextStyle(fontSize: 12, color: NeetTokens.textSecondary, height: 1.3),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          OutlinedButton.icon(
            onPressed: () {
              NeetTokens.hapticMedium();
              widget.onStartPractice('Genetics and Evolution');
            },
            icon: const Icon(Icons.rocket_launch_outlined, color: NeetTokens.accentPrimary, size: 18),
            label: const Text(
              'Practice High-Yield Chapters →',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: NeetTokens.accentPrimary),
            ),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: NeetTokens.accentPrimary),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusSm)),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            ),
          ),
        ],
      ),
    );
  }
}

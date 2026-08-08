import 'package:flutter/material.dart';
import '../../../../core/constants/tokens.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/cache/offline_cache.dart';

/// Native V2 Home Dashboard
/// Fast first paint using local cached data before network revalidation.
class NativeDashboardScreen extends StatefulWidget {
  final Function(String topic) onStartPractice;
  final VoidCallback onOpenTools;

  const NativeDashboardScreen({
    super.key,
    required this.onStartPractice,
    required this.onOpenTools,
  });

  @override
  State<NativeDashboardScreen> createState() => _NativeDashboardScreenState();
}

class _NativeDashboardScreenState extends State<NativeDashboardScreen> {
  final NeetApiClient _apiClient = NeetApiClient();

  Map<String, dynamic>? _performanceData;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    // 1. Instant First Paint from Offline Cache
    final cached = await OfflineCacheService.getCachedUserData('performance');
    if (cached != null && mounted) {
      setState(() {
        _performanceData = cached as Map<String, dynamic>;
        _isLoading = false;
      });
    }

    // 2. Revalidate over Network
    try {
      final res = await _apiClient.getPerformance();
      if (res.statusCode == 200 && res.data != null && mounted) {
        setState(() {
          _performanceData = res.data as Map<String, dynamic>;
          _isLoading = false;
          _error = null;
        });
      }
    } catch (e) {
      if (_performanceData == null && mounted) {
        setState(() {
          _error = 'Unable to load performance data. Check network connection.';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final overallStats = _performanceData?['overallStats'] as Map<String, dynamic>? ?? {};
    final rankPrediction = _performanceData?['rankPrediction'] as Map<String, dynamic>? ?? {};
    final weakAreas = (_performanceData?['weakAreas'] as List<dynamic>?) ?? [];
    final totalTests = overallStats['total_tests'] as int? ?? 0;
    final avgAccuracy = overallStats['avg_accuracy'] as num? ?? 0;

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
                // Header Row
                Row(
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        gradient: NeetTokens.primaryGradient,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: NeetTokens.accentPrimary.withOpacity(0.35),
                            blurRadius: 12,
                          ),
                        ],
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        'A',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Welcome back!',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            color: NeetTokens.textPrimary,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'NEET 2026 Target Standard',
                          style: TextStyle(
                            fontSize: 13,
                            color: NeetTokens.textMuted,
                          ),
                        ),
                      ],
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
                        value: '7',
                        label: 'Day Streak',
                        accentColor: NeetTokens.physicsColor,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildKpiCard(
                        icon: '⭐',
                        value: '450',
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
                            : 'N/A',
                        label: 'Est. Rank',
                        accentColor: NeetTokens.accentSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

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

                // Continue Learning / Weak Area Card
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

  Widget _buildWeakAreaCard(List<dynamic> weakAreas) {
    final topWeak = weakAreas.isNotEmpty ? weakAreas.first as Map<String, dynamic> : null;
    final topicName = topWeak?['topic_name'] ?? 'Thermodynamics & Heat Transfer';
    final accuracy = topWeak?['accuracy'] != null ? (topWeak!['accuracy'] as num).round() : 42;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            NeetTokens.bgCard,
            NeetTokens.accentPrimary.withOpacity(0.12),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
        border: Border.all(color: NeetTokens.accentPrimary.withOpacity(0.3)),
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

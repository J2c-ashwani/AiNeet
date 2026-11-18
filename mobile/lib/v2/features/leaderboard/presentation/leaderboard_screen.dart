import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';
import '../../../core/cache/offline_cache.dart';

class NativeLeaderboardScreen extends StatefulWidget {
  const NativeLeaderboardScreen({super.key});

  @override
  State<NativeLeaderboardScreen> createState() => _NativeLeaderboardScreenState();
}

class _NativeLeaderboardScreenState extends State<NativeLeaderboardScreen> {
  final NeetApiClient _apiClient = NeetApiClient();
  bool _isLoading = false;
  List<Map<String, dynamic>> _leaderboard = [];

  @override
  void initState() {
    super.initState();
    _setFallbackLeaderboard();
    _loadCachedLeaderboard();
    _loadLeaderboard();
  }

  Future<void> _loadCachedLeaderboard() async {
    final cached = await OfflineCacheService.getCachedUserData('leaderboard');
    if (cached is Map<String, dynamic> && mounted) {
      _applyLeaderboardData(cached);
    }
  }

  void _applyLeaderboardData(Map<String, dynamic> data) {
    if (data['leaderboard'] is List) {
      final list = (data['leaderboard'] as List).whereType<Map<String, dynamic>>().toList();
      if (list.isNotEmpty) {
        setState(() {
          _leaderboard = list;
          _isLoading = false;
        });
        return;
      }
    }
    if (_leaderboard.isEmpty) {
      _setFallbackLeaderboard();
    }
  }

  Future<void> _loadLeaderboard() async {
    try {
      final res = await _apiClient.getLeaderboard();
      if (mounted) {
        setState(() {
          _isLoading = false;
          if (res.data != null && res.data is Map<String, dynamic>) {
            _applyLeaderboardData(res.data as Map<String, dynamic>);
          } else {
            if (_leaderboard.isEmpty) _setFallbackLeaderboard();
          }
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          if (_leaderboard.isEmpty) _setFallbackLeaderboard();
        });
      }
    }
  }

  void _setFallbackLeaderboard() {
    _leaderboard = [
      {
        'rank': 1,
        'name': 'Aarav Sharma',
        'xp': 4850,
        'level': {'level': 9, 'name': 'NEET Prodigy'},
        'streak': 28,
        'testCount': 42,
        'avgScore': 685,
        'initial': 'A',
      },
      {
        'rank': 2,
        'name': 'Diya Patel',
        'xp': 4320,
        'level': {'level': 8, 'name': 'Master Scholar'},
        'streak': 21,
        'testCount': 38,
        'avgScore': 662,
        'initial': 'D',
      },
      {
        'rank': 3,
        'name': 'Rohan Iyer',
        'xp': 3910,
        'level': {'level': 7, 'name': 'Senior Scholar'},
        'streak': 17,
        'testCount': 34,
        'avgScore': 640,
        'initial': 'R',
      },
      {
        'rank': 4,
        'name': 'Ananya Reddy',
        'xp': 3420,
        'level': {'level': 6, 'name': 'Junior Scholar'},
        'streak': 14,
        'testCount': 29,
        'avgScore': 615,
        'initial': 'A',
      },
      {
        'rank': 5,
        'name': 'Kabir Verma',
        'xp': 2980,
        'level': {'level': 5, 'name': 'Dedicated Aspirant'},
        'streak': 11,
        'testCount': 25,
        'avgScore': 590,
        'initial': 'K',
      },
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        title: Text(
          'NEET All-India Leaderboard',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: NeetTokens.textPrimary,
          ),
        ),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadLeaderboard,
          color: NeetTokens.accentPrimary,
          child: _isLoading && _leaderboard.isEmpty
              ? Center(child: CircularProgressIndicator(color: NeetTokens.accentGlow))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _leaderboard.length,
                  itemBuilder: (context, idx) {
                    final user = _leaderboard[idx];
                    return _buildLeaderboardTile(user, idx);
                  },
                ),
        ),
      ),
    );
  }

  Widget _buildLeaderboardTile(Map<String, dynamic> user, int index) {
    final rank = user['rank'] as int? ?? (index + 1);
    final name = user['name']?.toString() ?? 'Student';
    final xp = user['xp'] as int? ?? 0;
    final streak = user['streak'] as int? ?? 0;
    final testCount = user['testCount'] as int? ?? 0;
    final avgScore = user['avgScore'] as int? ?? 0;
    final initial = user['initial']?.toString() ?? (name.isNotEmpty ? name[0].toUpperCase() : 'S');

    final levelObj = user['level'];
    final levelNum = levelObj is Map ? levelObj['level'] : null;
    final levelName = levelObj is Map ? levelObj['name'] : 'Scholar';

    String rankIcon = '#$rank';
    Color rankColor = NeetTokens.textMuted;
    if (rank == 1) {
      rankIcon = '🥇';
      rankColor = const Color(0xFFFFD700);
    } else if (rank == 2) {
      rankIcon = '🥈';
      rankColor = const Color(0xFFC0C0C0);
    } else if (rank == 3) {
      rankIcon = '🥉';
      rankColor = const Color(0xFFCD7F32);
    }

    final isTopThree = rank <= 3;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: NeetTokens.bgSecondary,
        borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
        border: Border.all(
          color: isTopThree ? rankColor.withValues(alpha: 0.4) : NeetTokens.border,
          width: isTopThree ? 1.5 : 1.0,
        ),
      ),
      child: Row(
        children: [
          // Rank Badge
          SizedBox(
            width: 36,
            child: Center(
              child: Text(
                rankIcon,
                style: TextStyle(
                  fontSize: isTopThree ? 22 : 14,
                  fontWeight: FontWeight.w900,
                  color: rankColor,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),

          // Avatar
          CircleAvatar(
            radius: 20,
            backgroundColor: isTopThree ? rankColor.withValues(alpha: 0.2) : NeetTokens.accentPrimary.withValues(alpha: 0.2),
            child: Text(
              initial,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: isTopThree ? rankColor : NeetTokens.accentPrimary,
              ),
            ),
          ),
          const SizedBox(width: 12),

          // User info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: NeetTokens.textPrimary),
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    if (levelNum != null) ...[
                      Text('Lvl $levelNum • ', style: TextStyle(fontSize: 11, color: NeetTokens.textMuted)),
                    ],
                    Text('$levelName', style: TextStyle(fontSize: 11, color: NeetTokens.textMuted)),
                    if (streak > 0) ...[
                      const SizedBox(width: 6),
                      Text('🔥$streak', style: const TextStyle(fontSize: 11)),
                    ],
                  ],
                ),
              ],
            ),
          ),

          // Score & Stats
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '$xp XP',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: NeetTokens.accentPrimary),
              ),
              const SizedBox(height: 2),
              Text(
                '$testCount tests • Avg $avgScore/720',
                style: TextStyle(fontSize: 11, color: NeetTokens.textMuted),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

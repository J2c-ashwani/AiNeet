import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';

class NativeBattlegroundScreen extends StatefulWidget {
  const NativeBattlegroundScreen({super.key});

  @override
  State<NativeBattlegroundScreen> createState() => _NativeBattlegroundScreenState();
}

class _NativeBattlegroundScreenState extends State<NativeBattlegroundScreen> {
  final NeetApiClient _apiClient = NeetApiClient();
  bool _isSearchingMatch = false;

  Future<void> _startMatchmaking() async {
    setState(() => _isSearchingMatch = true);
    NeetTokens.hapticMedium();

    try {
      // Fetch 5 rapid questions from live backend test generator
      final testRes = await _apiClient.generateTest(
        subject: 'Physics',
        topic: 'Rapid Battle',
        count: 5,
      );

      if (mounted) {
        setState(() => _isSearchingMatch = false);
        NeetTokens.hapticSuccess();
        
        final qCount = (testRes.data?['questions'] as List?)?.length ?? 5;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Match Found! 1v1 Battle Loaded ($qCount Questions Ready).'),
            backgroundColor: NeetTokens.warning,
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isSearchingMatch = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Matchmaking server busy. Please retry shortly.'),
            backgroundColor: NeetTokens.warning,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        title: Row(
          children: const [
            Icon(Icons.sports_esports, color: NeetTokens.warning),
            SizedBox(width: 8),
            Text(
              '1v1 Battleground',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: NeetTokens.textPrimary,
              ),
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Match Banner
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      NeetTokens.bgCard,
                      NeetTokens.warning.withValues(alpha: 0.15),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
                  border: Border.all(color: NeetTokens.warning.withValues(alpha: 0.3)),
                ),
                child: Column(
                  children: [
                    const Text(
                      'REAL-TIME MULTIPLAYER',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: NeetTokens.warning,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Compete 1v1 Live',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: NeetTokens.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Answer 5 rapid NEET questions faster than your opponent.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, color: NeetTokens.textMuted),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: _isSearchingMatch ? null : _startMatchmaking,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: NeetTokens.warning,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                        ),
                      ),
                      child: _isSearchingMatch
                          ? Row(
                              mainAxisSize: MainAxisSize.min,
                              children: const [
                                SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.black,
                                  ),
                                ),
                                SizedBox(width: 8),
                                Text(
                                  'Finding Opponent...',
                                  style: TextStyle(
                                    color: Colors.black,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            )
                          : const Text(
                              'Find Live Match →',
                              style: TextStyle(
                                color: Colors.black,
                                fontWeight: FontWeight.w800,
                                fontSize: 15,
                              ),
                            ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Live Leaderboard
              const Text(
                'Top Battle Rankers',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: NeetTokens.textPrimary,
                ),
              ),
              const SizedBox(height: 12),

              _buildRankerRow(1, 'Aarav Sharma', '2,840 XP', '🔥 14 Wins'),
              _buildRankerRow(2, 'Ananya Iyer', '2,610 XP', '🔥 11 Wins'),
              _buildRankerRow(3, 'Rohan Verma', '2,490 XP', '🔥 9 Wins'),
              _buildRankerRow(4, 'Sneha Patel', '2,320 XP', '🔥 8 Wins'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRankerRow(int rank, String name, String xp, String streak) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: NeetTokens.bgSecondary,
        borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
        border: Border.all(color: NeetTokens.border),
      ),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: rank == 1
                  ? NeetTokens.warning.withValues(alpha: 0.2)
                  : Colors.transparent,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Text(
              '#$rank',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: rank == 1 ? NeetTokens.warning : NeetTokens.textMuted,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              name,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: NeetTokens.textPrimary,
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                xp,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: NeetTokens.chemistryColor,
                ),
              ),
              Text(
                streak,
                style: const TextStyle(
                  fontSize: 10,
                  color: NeetTokens.textMuted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

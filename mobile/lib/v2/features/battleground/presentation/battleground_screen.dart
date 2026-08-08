import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';

class NativeBattlegroundScreen extends StatefulWidget {
  const NativeBattlegroundScreen({super.key});

  @override
  State<NativeBattlegroundScreen> createState() => _NativeBattlegroundScreenState();
}

class _NativeBattlegroundScreenState extends State<NativeBattlegroundScreen> {
  bool _isSearchingMatch = false;

  void _startMatchmaking() {
    setState(() => _isSearchingMatch = true);
    NeetTokens.hapticMedium();

    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _isSearchingMatch = false);
        NeetTokens.hapticSuccess();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Match Found! Live 1v1 Battle Opponent: Rahul M.'),
            backgroundColor: NeetTokens.warning,
          ),
        );
      }
    });
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
                      NeetTokens.warning.withOpacity(0.15),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
                  border: Border.all(color: NeetTokens.warning.withOpacity(0.3)),
                ),
                child: Column(
                  children: [
                    Text(
                      'REAL-TIME MULTIPLAYER',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: NeetTokens.warning,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Compete 1v1 Live',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: NeetTokens.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
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
                                SizedBox(width: 10),
                                Text(
                                  'Searching Opponent...',
                                  style: TextStyle(color: Colors.black, fontWeight: FontWeight.w800),
                                ),
                              ],
                            )
                          : Text(
                              'Find Live Match ⚔️',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w900,
                                color: Colors.black,
                              ),
                            ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Global Leaderboard
              Text(
                'Top NEET Champions',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: NeetTokens.textPrimary,
                ),
              ),
              const SizedBox(height: 12),

              _buildLeaderboardRow('#1', 'Ananya Sharma', '710/720', 'Delhi'),
              _buildLeaderboardRow('#2', 'Vikram Patel', '705/720', 'Kota'),
              _buildLeaderboardRow('#3', 'Siddharth Rao', '700/720', 'Bengaluru'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLeaderboardRow(String rank, String name, String score, String city) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: NeetTokens.bgSecondary,
        borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
        border: Border.all(color: NeetTokens.border),
      ),
      child: Row(
        children: [
          Text(
            rank,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: NeetTokens.warning,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: NeetTokens.textPrimary,
                  ),
                ),
                Text(
                  city,
                  style: TextStyle(fontSize: 11, color: NeetTokens.textMuted),
                ),
              ],
            ),
          ),
          Text(
            score,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: NeetTokens.biologyColor,
            ),
          ),
        ],
      ),
    );
  }
}

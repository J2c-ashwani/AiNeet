import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/api_client.dart';
import '../models/models.dart';
import '../providers/providers.dart';

class LeaderboardScreen extends ConsumerStatefulWidget {
  const LeaderboardScreen({super.key});
  @override
  ConsumerState<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends ConsumerState<LeaderboardScreen> {
  List<LeaderboardEntry> _entries = [];
  bool _loading = true;
  int? _myRank;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await ApiClient().getLeaderboard();
      final list = (data['leaderboard'] as List<dynamic>? ?? [])
          .asMap()
          .entries
          .map((e) => LeaderboardEntry.fromJson(e.value as Map<String, dynamic>, e.key + 1))
          .toList();
      final myId = ref.read(authNotifierProvider).user?.id;
      if (mounted) {
        setState(() {
          _entries = list;
          _myRank = list.firstWhere((e) => e.userId == myId, orElse: () => list.last).rank;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('🏆 Leaderboard'), actions: [
        IconButton(icon: const Icon(Icons.refresh), onPressed: _load),
      ]),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6366f1)))
          : Column(
              children: [
                if (_myRank != null)
                  Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF4338ca), Color(0xFF7c3aed)]),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        const Text('👤', style: TextStyle(fontSize: 28)),
                        const SizedBox(width: 12),
                        const Text('Your Rank:', style: TextStyle(color: Colors.white70)),
                        const SizedBox(width: 8),
                        Text('#$_myRank', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                      ],
                    ),
                  ),
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _entries.length,
                    itemBuilder: (context, i) {
                      final e = _entries[i];
                      final isTop3 = e.rank <= 3;
                      final medal = e.rank == 1 ? '🥇' : e.rank == 2 ? '🥈' : e.rank == 3 ? '🥉' : '#${e.rank}';
                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: isTop3 ? const Color(0xFF1a2040) : const Color(0xFF1e293b),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: isTop3 ? const Color(0x406366f1) : const Color(0x20FFFFFF)),
                        ),
                        child: Row(
                          children: [
                            SizedBox(width: 36, child: Text(medal, style: TextStyle(fontSize: isTop3 ? 22 : 14, fontWeight: FontWeight.w700, color: const Color(0xFF94a3b8)))),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(e.name, style: const TextStyle(color: Color(0xFFf1f5f9), fontWeight: FontWeight.w700)),
                                  Text('Lvl ${e.level} · 🔥 ${e.streak} streak', style: const TextStyle(color: Color(0xFF94a3b8), fontSize: 12)),
                                ],
                              ),
                            ),
                            Text('${e.xp} XP', style: const TextStyle(color: Color(0xFF6366f1), fontWeight: FontWeight.w700)),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
    );
  }
}

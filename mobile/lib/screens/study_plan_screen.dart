import 'package:flutter/material.dart';
import '../core/api_client.dart';

class StudyPlanScreen extends StatefulWidget {
  const StudyPlanScreen({super.key});
  @override
  State<StudyPlanScreen> createState() => _StudyPlanScreenState();
}

class _StudyPlanScreenState extends State<StudyPlanScreen> {
  List<dynamic> _sessions = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final data = await ApiClient().getStudyPlan();
      if (mounted) setState(() { _sessions = data['sessions'] ?? data['plan'] ?? []; _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('📚 Study Plan')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6366f1)))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _sessions.length,
              itemBuilder: (ctx, i) {
                final s = _sessions[i] as Map<String, dynamic>;
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(color: const Color(0xFF1e293b), borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0x20FFFFFF))),
                  child: Row(
                    children: [
                      Container(width: 4, height: 50, decoration: BoxDecoration(color: const Color(0xFF6366f1), borderRadius: BorderRadius.circular(4))),
                      const SizedBox(width: 14),
                      Expanded(child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(s['topic']?.toString() ?? 'Study Session', style: const TextStyle(color: Color(0xFFf1f5f9), fontWeight: FontWeight.w700)),
                          Text(s['subject']?.toString() ?? '', style: const TextStyle(color: Color(0xFF94a3b8), fontSize: 12)),
                        ],
                      )),
                      Text(s['duration']?.toString() ?? '45 min', style: const TextStyle(color: Color(0xFF6366f1), fontWeight: FontWeight.w600)),
                    ],
                  ),
                );
              },
            ),
    );
  }
}

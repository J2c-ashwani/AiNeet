import 'package:flutter/material.dart';
import '../core/api_client.dart';

/// Flashcard-style spaced repetition revision screen
class RevisionScreen extends StatefulWidget {
  const RevisionScreen({super.key});
  @override
  State<RevisionScreen> createState() => _RevisionScreenState();
}

class _RevisionScreenState extends State<RevisionScreen> {
  List<dynamic> _due = [];
  int _index = 0;
  bool _loading = true;
  bool _flipped = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await ApiClient().getStudyPlan();
      if (mounted) setState(() { _due = data['due'] ?? []; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('🔁 Spaced Repetition')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF6366f1)))
          : _due.isEmpty
              ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Text('🎉', style: TextStyle(fontSize: 48)),
                  SizedBox(height: 12),
                  Text("You're all caught up!", style: TextStyle(color: Color(0xFFf1f5f9), fontSize: 18, fontWeight: FontWeight.w700)),
                  Text('No cards due for review today.', style: TextStyle(color: Color(0xFF94a3b8))),
                ]))
              : Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      Text('Card ${_index + 1} of ${_due.length}', style: const TextStyle(color: Color(0xFF94a3b8))),
                      const SizedBox(height: 20),
                      GestureDetector(
                        onTap: () => setState(() => _flipped = !_flipped),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          height: 260,
                          width: double.infinity,
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: _flipped
                                  ? [const Color(0xFF064e3b), const Color(0xFF065f46)]
                                  : [const Color(0xFF1e293b), const Color(0xFF1e3a5f)],
                            ),
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(
                                color: (_flipped ? const Color(0xFF10b981) : const Color(0xFF6366f1)).withAlpha(51),
                                blurRadius: 20,
                              ),
                            ],
                          ),
                          child: Center(
                            child: Text(
                              _flipped
                                  ? (_due[_index] as Map)['answer']?.toString() ?? 'Answer'
                                  : (_due[_index] as Map)['question']?.toString() ?? 'Question',
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: Colors.white, fontSize: 18, height: 1.5),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        _flipped ? '✅ Tap to see question' : '👆 Tap to reveal answer',
                        style: const TextStyle(color: Color(0xFF64748b), fontSize: 12),
                      ),
                      const Spacer(),
                      if (_flipped)
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () => setState(() { _flipped = false; if (_index < _due.length - 1) _index++; }),
                                style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFFef4444))),
                                child: const Text('Hard 😓', style: TextStyle(color: Color(0xFFef4444))),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () => setState(() { _flipped = false; if (_index < _due.length - 1) _index++; }),
                                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10b981)),
                                child: const Text('Got it! 🎯'),
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
    );
  }
}

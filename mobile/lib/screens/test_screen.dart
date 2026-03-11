import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/models.dart';
import '../core/api_client.dart';
import '../router/app_router.dart';

class TestScreen extends StatefulWidget {
  final TestSession session;
  const TestScreen({super.key, required this.session});
  @override
  State<TestScreen> createState() => _TestScreenState();
}

class _TestScreenState extends State<TestScreen> {
  late TestSession _session;
  int _timeLeft = 0;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _session = widget.session;
    _timeLeft = 90 * 60; // 90 minutes default
    _startTimer();
  }

  void _startTimer() {
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return false;
      setState(() => _timeLeft = _timeLeft > 0 ? _timeLeft - 1 : 0);
      if (_timeLeft == 0) {
        _submitTest();
        return false;
      }
      return true;
    });
  }

  String get _timerDisplay {
    final h = _timeLeft ~/ 3600;
    final m = (_timeLeft % 3600) ~/ 60;
    final s = _timeLeft % 60;
    if (h > 0) return '${h}h ${m.toString().padLeft(2, '0')}m';
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  Color get _timerColor =>
      _timeLeft < 300 ? const Color(0xFFef4444) : _timeLeft < 600 ? const Color(0xFFf59e0b) : const Color(0xFF10b981);

  void _selectAnswer(String questionId, String option) {
    setState(() => _session.answer(questionId, option));
  }

  void _toggleMark(String questionId) {
    setState(() => _session.toggleMark(questionId));
  }

  Future<void> _submitTest() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1e293b),
        title: const Text('Submit Test?', style: TextStyle(color: Color(0xFFf1f5f9))),
        content: Text(
          '${_session.answeredCount}/${_session.questions.length} answered.\n${_session.unansweredCount > 0 ? "${_session.unansweredCount} questions unanswered." : "All answered!"}',
          style: const TextStyle(color: Color(0xFF94a3b8)),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel', style: TextStyle(color: Color(0xFF94a3b8)))),
          ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Submit')),
        ],
      ),
    );
    if (confirm != true || !mounted) return;

    setState(() => _submitting = true);
    try {
      final data = await ApiClient().submitTest(
        testId: _session.testId,
        answers: _session.answers,
        timeSpentSeconds: _session.timeSpentSeconds,
      );
      final result = TestResult.fromJson(data);
      if (mounted) {
        context.go(AppRoutes.results, extra: result);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Submission failed: $e'), backgroundColor: const Color(0xFFef4444)),
        );
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final q = _session.questions[_session.currentIndex];
    final answered = _session.answers[q.id];
    final marked = _session.markedForReview.contains(q.id);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (_, __) async {
        final leave = await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            backgroundColor: const Color(0xFF1e293b),
            title: const Text('Leave Test?', style: TextStyle(color: Color(0xFFf1f5f9))),
            content: const Text('Your progress will be lost.', style: TextStyle(color: Color(0xFF94a3b8))),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Stay', style: TextStyle(color: Color(0xFF6366f1)))),
              ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Leave')),
            ],
          ),
        );
        if (leave == true && mounted) context.go(AppRoutes.testConfig);
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text('Q ${_session.currentIndex + 1}/${_session.questions.length}'),
          leading: IconButton(icon: const Icon(Icons.close), onPressed: () => context.pop()),
          actions: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(color: _timerColor.withOpacity(0.15), borderRadius: BorderRadius.circular(20), border: Border.all(color: _timerColor.withOpacity(0.4))),
                child: Text(_timerDisplay, style: TextStyle(color: _timerColor, fontWeight: FontWeight.w700, fontSize: 13)),
              ),
            ),
          ],
        ),
        body: Column(
          children: [
            LinearProgressIndicator(
              value: _session.currentIndex / _session.questions.length,
              color: const Color(0xFF6366f1),
              backgroundColor: const Color(0xFF1e293b),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Question text
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(color: const Color(0xFF1e293b), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0x20FFFFFF))),
                      child: Text(q.text, style: const TextStyle(color: Color(0xFFf1f5f9), fontSize: 16, height: 1.6)),
                    ),
                    const SizedBox(height: 20),

                    // Options
                    ...q.optionKeys.asMap().entries.map((e) {
                      final key = e.value;
                      final text = q.options[e.key];
                      final isSelected = answered == key;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: GestureDetector(
                          onTap: () => _selectAnswer(q.id, key),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFF6366f1).withOpacity(0.15) : const Color(0xFF1e293b),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: isSelected ? const Color(0xFF6366f1) : const Color(0x20FFFFFF), width: isSelected ? 2 : 1),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 32, height: 32,
                                  decoration: BoxDecoration(
                                    color: isSelected ? const Color(0xFF6366f1) : const Color(0x20FFFFFF),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Center(child: Text(key, style: TextStyle(color: isSelected ? Colors.white : const Color(0xFF94a3b8), fontWeight: FontWeight.w700))),
                                ),
                                const SizedBox(width: 14),
                                Expanded(child: Text(text, style: TextStyle(color: isSelected ? const Color(0xFFf1f5f9) : const Color(0xFFcbd5e1), fontSize: 15, height: 1.4))),
                              ],
                            ),
                          ),
                        ),
                      );
                    }),
                    const SizedBox(height: 16),

                    // Mark for review
                    GestureDetector(
                      onTap: () => _toggleMark(q.id),
                      child: Row(
                        children: [
                          Icon(marked ? Icons.bookmark : Icons.bookmark_border, color: const Color(0xFFf59e0b), size: 20),
                          const SizedBox(width: 8),
                          Text(marked ? 'Marked for Review' : 'Mark for Review', style: const TextStyle(color: Color(0xFFf59e0b), fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Bottom navigation
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  if (_session.currentIndex > 0)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => setState(() => _session.currentIndex--),
                        style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0x30FFFFFF))),
                        child: const Text('Previous', style: TextStyle(color: Color(0xFF94a3b8))),
                      ),
                    ),
                  if (_session.currentIndex > 0) const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: _session.currentIndex < _session.questions.length - 1
                        ? ElevatedButton(
                            onPressed: () => setState(() => _session.currentIndex++),
                            child: const Text('Next'),
                          )
                        : ElevatedButton(
                            onPressed: _submitting ? null : _submitTest,
                            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10b981)),
                            child: _submitting
                                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : const Text('Submit', style: TextStyle(fontWeight: FontWeight.w700)),
                          ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

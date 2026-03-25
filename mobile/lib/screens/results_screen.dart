import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/models.dart';
import '../router/app_router.dart';

import 'package:in_app_review/in_app_review.dart';

class ResultsScreen extends StatefulWidget {
  final TestResult result;
  const ResultsScreen({super.key, required this.result});

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> {
  final InAppReview _inAppReview = InAppReview.instance;

  @override
  void initState() {
    super.initState();
    _triggerReviewIfExcellent();
  }

  Future<void> _triggerReviewIfExcellent() async {
    // 💥 Dopamine Trigger: Only ask for 5 stars when they get >80% accuracy!
    if (widget.result.accuracy >= 80) {
      if (await _inAppReview.isAvailable()) {
        // Add a slight delay so they can see their awesome score first
        Future.delayed(const Duration(seconds: 2), () {
          _inAppReview.requestReview();
        });
      }
    }
  }

  Color get _scoreColor {
    final pct = widget.result.score / widget.result.maxScore;
    if (pct >= 0.8) return const Color(0xFF10b981);
    if (pct >= 0.6) return const Color(0xFFf59e0b);
    return const Color(0xFFef4444);
  }

  @override
  Widget build(BuildContext context) {
    final result = widget.result;
    final grade = result.accuracy >= 80 ? 'Excellent! 🏆' : result.accuracy >= 60 ? 'Good Work! 👍' : 'Keep Practicing 💪';

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Score header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [_scoreColor.withOpacity(0.2), Colors.transparent], begin: Alignment.topCenter, end: Alignment.bottomCenter),
              ),
              child: Column(
                children: [
                  Text(grade, style: const TextStyle(color: Color(0xFFf1f5f9), fontSize: 22, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 16),
                  Text('${result.score}', style: TextStyle(color: _scoreColor, fontSize: 64, fontWeight: FontWeight.w900)),
                  Text('out of ${result.maxScore}', style: const TextStyle(color: Color(0xFF94a3b8))),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _ResultStat('✅', '${result.correct}', 'Correct', const Color(0xFF10b981)),
                      _ResultStat('❌', '${result.incorrect}', 'Wrong', const Color(0xFFef4444)),
                      _ResultStat('⏭️', '${result.unattempted}', 'Skipped', const Color(0xFF94a3b8)),
                      _ResultStat('🎯', '${result.accuracy.toStringAsFixed(1)}%', 'Accuracy', const Color(0xFF6366f1)),
                    ],
                  ),
                ],
              ),
            ),

            // Review questions
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Align(alignment: Alignment.centerLeft, child: Text('Question Review', style: TextStyle(color: Color(0xFFf1f5f9), fontWeight: FontWeight.w700, fontSize: 16))),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: result.questions.length,
                itemBuilder: (context, i) {
                  final q = result.questions[i];
                  final userAns = result.userAnswers[q.id];
                  final correct = q.correctAnswer;
                  final isCorrect = userAns == correct;
                  final isSkipped = userAns == null;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1e293b),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: isCorrect ? const Color(0x4010b981) : isSkipped ? const Color(0x20FFFFFF) : const Color(0x40ef4444)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(isCorrect ? '✅' : isSkipped ? '⏭️' : '❌', style: const TextStyle(fontSize: 16)),
                            const SizedBox(width: 8),
                            Expanded(child: Text('Q${i + 1}: ${q.text}', style: const TextStyle(color: Color(0xFFe2e8f0), fontSize: 13), maxLines: 2, overflow: TextOverflow.ellipsis)),
                          ],
                        ),
                        if (!isSkipped) ...[
                          const SizedBox(height: 8),
                          Text('Your answer: $userAns', style: TextStyle(color: isCorrect ? const Color(0xFF10b981) : const Color(0xFFef4444), fontSize: 12)),
                          if (!isCorrect && correct != null) Text('Correct: $correct', style: const TextStyle(color: Color(0xFF10b981), fontSize: 12)),
                        ],
                      ],
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => context.go(AppRoutes.testConfig),
                      style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0x30FFFFFF)), padding: const EdgeInsets.symmetric(vertical: 14)),
                      child: const Text('New Test', style: TextStyle(color: Color(0xFF94a3b8))),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => context.go(AppRoutes.dashboard),
                      child: const Text('Dashboard'),
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

class _ResultStat extends StatelessWidget {
  final String emoji;
  final String value;
  final String label;
  final Color color;
  const _ResultStat(this.emoji, this.value, this.label, this.color);
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(emoji),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 18)),
        Text(label, style: const TextStyle(color: Color(0xFF64748b), fontSize: 11)),
      ],
    );
  }
}

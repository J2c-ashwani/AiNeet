import 'package:flutter/material.dart';
import '../../../../core/constants/tokens.dart';

class NativeTestResultsScreen extends StatelessWidget {
  final int totalQuestions;
  final int correctAnswers;
  final int score;
  final VoidCallback onReturnHome;

  const NativeTestResultsScreen({
    super.key,
    required this.totalQuestions,
    required this.correctAnswers,
    required this.score,
    required this.onReturnHome,
  });

  @override
  Widget build(BuildContext context) {
    final accuracy = totalQuestions > 0
        ? ((correctAnswers / totalQuestions) * 100).round()
        : 0;

    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: const Text(
          'Test Performance Analysis',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: NeetTokens.textPrimary,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top Score Banner
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: NeetTokens.cardGradient,
                borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
                border: Border.all(color: NeetTokens.accentPrimary.withOpacity(0.3)),
              ),
              child: Column(
                children: [
                  const Text(
                    'TOTAL SCORE',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: NeetTokens.textMuted,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '$score / 720',
                    style: const TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.w900,
                      color: NeetTokens.accentPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildMiniStat('Accuracy', '$accuracy%'),
                      _buildMiniStat('Correct', '$correctAnswers'),
                      _buildMiniStat('Total Qs', '$totalQuestions'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Verified PYQ Explanations Section
            const Text(
              'Question Explanations',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: NeetTokens.textPrimary,
              ),
            ),
            const SizedBox(height: 12),

            _buildExplanationCard(
              qNum: 1,
              question: 'A body of mass 2 kg is accelerated from rest to a speed of 10 m/s in 2 seconds. Calculate work done.',
              userAnswer: 'A) 50 J',
              correctAnswer: 'B) 100 J',
              explanation: 'Work done = Change in Kinetic Energy = (1/2) * m * v^2 = (1/2) * 2 * (10)^2 = 100 Joules.',
              isCorrect: false,
              pyqTag: 'NEET 2023 Authentic PYQ',
            ),
            const SizedBox(height: 24),

            // Action Buttons
            ElevatedButton(
              onPressed: onReturnHome,
              style: ElevatedButton.styleFrom(
                backgroundColor: NeetTokens.accentGlow,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                ),
              ),
              child: const Text(
                'Return to Home Dashboard →',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniStat(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: NeetTokens.textPrimary,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: NeetTokens.textMuted,
          ),
        ),
      ],
    );
  }

  Widget _buildExplanationCard({
    required int qNum,
    required String question,
    required String userAnswer,
    required String correctAnswer,
    required String explanation,
    required bool isCorrect,
    required String pyqTag,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: NeetTokens.bgSecondary,
        borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
        border: Border.all(
          color: isCorrect
              ? NeetTokens.biologyColor.withOpacity(0.4)
              : NeetTokens.error.withOpacity(0.4),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Question $qNum',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: NeetTokens.textPrimary,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: NeetTokens.chemistryColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                ),
                child: Text(
                  pyqTag,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: NeetTokens.chemistryColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            question,
            style: const TextStyle(fontSize: 13, color: NeetTokens.textSecondary),
          ),
          const SizedBox(height: 12),
          Text(
            'Your Answer: $userAnswer',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: isCorrect ? NeetTokens.biologyColor : NeetTokens.error,
            ),
          ),
          Text(
            'Correct Answer: $correctAnswer',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: NeetTokens.biologyColor,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: NeetTokens.bgCard,
              borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
            ),
            child: Text(
              'Explanation: $explanation',
              style: const TextStyle(
                fontSize: 12,
                color: NeetTokens.textMuted,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

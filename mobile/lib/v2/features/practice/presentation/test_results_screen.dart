import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';

class NativeTestResultsScreen extends StatelessWidget {
  final Map<String, dynamic> resultData;
  final VoidCallback onReturnHome;

  const NativeTestResultsScreen({
    super.key,
    required this.resultData,
    required this.onReturnHome,
  });

  @override
  Widget build(BuildContext context) {
    final int totalQuestions = resultData['totalQuestions'] ?? 0;
    final int correctAnswers = resultData['correct'] ?? 0;
    final int score = resultData['score'] ?? 0;
    final int incorrect = resultData['incorrect'] ?? 0;
    final int unattempted = resultData['unattempted'] ?? 0;
    final List<dynamic> explanations = resultData['explanations'] ?? [];

    final accuracy = totalQuestions > 0
        ? ((correctAnswers / totalQuestions) * 100).round()
        : 0;

    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: Text(
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
                border: Border.all(color: NeetTokens.accentPrimary.withValues(alpha: 0.3)),
              ),
              child: Column(
                children: [
                  Text(
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
                    '$score / ${totalQuestions * 4}', // Assuming 4 marks per question for max score calc
                    style: TextStyle(
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
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildMiniStat('Incorrect', '$incorrect', color: NeetTokens.error),
                      _buildMiniStat('Unattempted', '$unattempted', color: NeetTokens.textMuted),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            if (explanations.isNotEmpty) ...[
              Text(
                'Question Explanations',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: NeetTokens.textPrimary,
                ),
              ),
              const SizedBox(height: 12),

              ...List.generate(explanations.length, (index) {
                final exp = explanations[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: _buildExplanationCard(
                    qNum: index + 1,
                    question: exp['question'] ?? '',
                    userAnswer: exp['userAnswer'] ?? 'Unattempted',
                    correctAnswer: exp['correctAnswer'] ?? '',
                    explanation: exp['explanation'] ?? '',
                    isCorrect: exp['isCorrect'] ?? false,
                    pyqTag: exp['pyqTag'] ?? 'Practice Question',
                  ),
                );
              }),
              const SizedBox(height: 24),
            ],

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
              child: Text(
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

  Widget _buildMiniStat(String label, String value, {Color color = NeetTokens.textPrimary}) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: color,
          ),
        ),
        Text(
          label,
          style: TextStyle(
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
              ? NeetTokens.biologyColor.withValues(alpha: 0.4)
              : NeetTokens.error.withValues(alpha: 0.4),
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
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: NeetTokens.textPrimary,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: NeetTokens.chemistryColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                ),
                child: Text(
                  pyqTag,
                  style: TextStyle(
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
            style: TextStyle(fontSize: 13, color: NeetTokens.textSecondary),
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
            style: TextStyle(
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
              style: TextStyle(
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

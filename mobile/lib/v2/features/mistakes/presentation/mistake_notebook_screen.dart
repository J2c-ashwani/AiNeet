import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';

class NativeMistakeNotebookScreen extends StatelessWidget {
  const NativeMistakeNotebookScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        title: Text(
          'Mistake Notebook',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: NeetTokens.textPrimary,
          ),
        ),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text(
              'Recorded Question Errors',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: NeetTokens.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            _buildMistakeCard(
              subject: 'Physics',
              topic: 'Thermodynamics & Kinetic Theory',
              question: 'A gas expands adiabatically from V to 2V. Calculate work done.',
              mistakeReason: 'Forgot minus sign in formula W = -(P2V2 - P1V1)/(gamma - 1)',
            ),
            _buildMistakeCard(
              subject: 'Chemistry',
              topic: 'Chemical Bonding & Hybridization',
              question: 'Determine the hybridization of XeF4 molecule.',
              mistakeReason: 'Counted lone pairs incorrectly. Xe has 2 lone pairs -> sp3d2 geometry.',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMistakeCard({
    required String subject,
    required String topic,
    required String question,
    required String mistakeReason,
  }) {
    final color = subject == 'Physics'
        ? NeetTokens.physicsColor
        : subject == 'Chemistry'
            ? NeetTokens.chemistryColor
            : NeetTokens.biologyColor;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: NeetTokens.bgSecondary,
        borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
        border: Border.all(color: NeetTokens.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                subject.toUpperCase(),
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: color),
              ),
              Text(
                topic,
                style: TextStyle(fontSize: 11, color: NeetTokens.textMuted),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            question,
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: NeetTokens.textPrimary),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: NeetTokens.error.withOpacity(0.12),
              borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
            ),
            child: Text(
              '💡 Key Error: $mistakeReason',
              style: TextStyle(fontSize: 12, color: NeetTokens.textSecondary),
            ),
          ),
        ],
      ),
    );
  }
}

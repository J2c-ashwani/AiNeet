import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';

class NativeRevisionManagerScreen extends StatelessWidget {
  const NativeRevisionManagerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        title: Text(
          'Spaced Repetition Revision',
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
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: NeetTokens.bgSecondary,
                borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                border: Border.all(color: NeetTokens.accentPrimary.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'DUE FOR REVISION TODAY',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: NeetTokens.accentPrimary,
                      letterSpacing: 1.1,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    '3 Core Topics Recommended',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            _buildRevisionCard('Electrostatics & Gauss Law', 'Physics', 'Interval: 3 Days'),
            _buildRevisionCard('Coordination Compounds & Ligands', 'Chemistry', 'Interval: 7 Days'),
            _buildRevisionCard('Genetics & Molecular Basis of Inheritance', 'Biology', 'Interval: 1 Day'),
          ],
        ),
      ),
    );
  }

  Widget _buildRevisionCard(String title, String subject, String interval) {
    final color = subject == 'Physics'
        ? NeetTokens.physicsColor
        : subject == 'Chemistry'
            ? NeetTokens.chemistryColor
            : NeetTokens.biologyColor;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: NeetTokens.bgSecondary,
        borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
        border: Border.all(color: NeetTokens.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(subject.toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: color)),
                const SizedBox(height: 4),
                Text(title, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: NeetTokens.textPrimary)),
                const SizedBox(height: 2),
                Text(interval, style: TextStyle(fontSize: 11, color: NeetTokens.textMuted)),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () {
              NeetTokens.hapticMedium();
            },
            style: ElevatedButton.styleFrom(backgroundColor: NeetTokens.accentGlow),
            child: Text('Revise Now', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../../../../core/constants/tokens.dart';

class NativeBlueprintScreen extends StatelessWidget {
  const NativeBlueprintScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        title: const Text(
          'NEET Weightage Blueprint',
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
            const Text(
              'High-Weightage Chapter Breakdown',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary),
            ),
            const SizedBox(height: 12),
            _buildBlueprintCard('Human Physiology', 'Biology', '14-16 Questions (56-64 Marks)', 'High Priority'),
            _buildBlueprintCard('Current Electricity & Magnetism', 'Physics', '8-10 Questions (32-40 Marks)', 'High Priority'),
            _buildBlueprintCard('Organic Chemistry - Reaction Mechanisms', 'Chemistry', '10-12 Questions (40-48 Marks)', 'High Priority'),
            _buildBlueprintCard('Optics & Wave Optics', 'Physics', '6-8 Questions (24-32 Marks)', 'Medium Priority'),
          ],
        ),
      ),
    );
  }

  Widget _buildBlueprintCard(String chapter, String subject, String marks, String priority) {
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(subject.toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: color)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(color: NeetTokens.warning.withOpacity(0.2), borderRadius: BorderRadius.circular(4)),
                child: Text(priority, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: NeetTokens.warning)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(chapter, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary)),
          const SizedBox(height: 4),
          Text(marks, style: const TextStyle(fontSize: 12, color: NeetTokens.textMuted)),
        ],
      ),
    );
  }
}

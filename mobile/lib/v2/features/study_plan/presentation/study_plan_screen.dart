import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';

class NativeStudyPlanScreen extends StatelessWidget {
  const NativeStudyPlanScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        title: Text(
          'AI Personal Study Plan',
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
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: NeetTokens.cardGradient,
                borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
                border: Border.all(color: NeetTokens.accentPrimary.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'STUDY SCHEDULE - TODAY',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: NeetTokens.accentPrimary, letterSpacing: 1.1),
                  ),
                  SizedBox(height: 8),
                  Text('Daily Goal: 3.5 Hours', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: NeetTokens.textPrimary)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            _buildScheduleTask('09:00 AM - 10:30 AM', 'Physics: Thermodynamics Problem Solving', 'Completed', true),
            _buildScheduleTask('11:00 AM - 12:30 PM', 'Biology: Cell Division NCERT Reading', 'In Progress', false),
            _buildScheduleTask('04:00 PM - 05:00 PM', 'Chemistry: 30-Question Custom Mock Test', 'Pending', false),
          ],
        ),
      ),
    );
  }

  Widget _buildScheduleTask(String time, String title, String status, bool isDone) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: NeetTokens.bgSecondary,
        borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
        border: Border.all(color: isDone ? NeetTokens.biologyColor : NeetTokens.border),
      ),
      child: Row(
        children: [
          Icon(
            isDone ? Icons.check_circle : Icons.radio_button_unchecked,
            color: isDone ? NeetTokens.biologyColor : NeetTokens.textMuted,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(time, style: TextStyle(fontSize: 11, color: NeetTokens.textMuted)),
                const SizedBox(height: 2),
                Text(title, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: isDone ? NeetTokens.textMuted : NeetTokens.textPrimary)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

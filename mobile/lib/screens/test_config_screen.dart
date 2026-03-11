import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/api_client.dart';
import '../models/models.dart';
import '../router/app_router.dart';

class TestConfigScreen extends StatefulWidget {
  const TestConfigScreen({super.key});
  @override
  State<TestConfigScreen> createState() => _TestConfigScreenState();
}

class _TestConfigScreenState extends State<TestConfigScreen> {
  String _subject = 'Physics';
  int _count = 30;
  String _difficulty = 'mixed';
  bool _isPYQ = false;
  bool _loading = false;

  final _subjects = ['Physics', 'Chemistry', 'Biology', 'Mixed'];
  final _difficulties = ['easy', 'medium', 'hard', 'mixed'];

  Future<void> _startTest() async {
    setState(() => _loading = true);
    try {
      final data = await ApiClient().generateTest(
        subject: _subject,
        count: _count,
        difficulty: _difficulty,
        isPYQ: _isPYQ,
      );
      final questions = (data['questions'] as List<dynamic>)
          .map((q) => QuestionModel.fromJson(q as Map<String, dynamic>))
          .toList();
      final testId = data['testId']?.toString() ?? '';
      final session = TestSession(testId: testId, questions: questions);
      if (mounted) context.push(AppRoutes.test, extra: session);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to generate test: $e'), backgroundColor: const Color(0xFFef4444)),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Configure Test')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _section('Subject', ToggleButtons(
              isSelected: _subjects.map((s) => s == _subject).toList(),
              onPressed: (i) => setState(() => _subject = _subjects[i]),
              borderRadius: BorderRadius.circular(10),
              selectedColor: Colors.white,
              selectedBorderColor: const Color(0xFF6366f1),
              fillColor: const Color(0xFF6366f1),
              color: const Color(0xFF94a3b8),
              borderColor: const Color(0x30FFFFFF),
              children: _subjects.map((s) => Padding(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8), child: Text(s, style: const TextStyle(fontWeight: FontWeight.w600)))).toList(),
            )),
            _section('Questions: $_count', Slider(
              value: _count.toDouble(),
              min: 10,
              max: 90,
              divisions: 8,
              label: '$_count',
              activeColor: const Color(0xFF6366f1),
              onChanged: (v) => setState(() => _count = v.toInt()),
            )),
            _section('Difficulty', ToggleButtons(
              isSelected: _difficulties.map((d) => d == _difficulty).toList(),
              onPressed: (i) => setState(() => _difficulty = _difficulties[i]),
              borderRadius: BorderRadius.circular(10),
              selectedColor: Colors.white,
              selectedBorderColor: const Color(0xFF6366f1),
              fillColor: const Color(0xFF6366f1),
              color: const Color(0xFF94a3b8),
              borderColor: const Color(0x30FFFFFF),
              children: _difficulties.map((d) => Padding(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8), child: Text(d[0].toUpperCase() + d.substring(1)))).toList(),
            )),
            SwitchListTile(
              value: _isPYQ,
              onChanged: (v) => setState(() => _isPYQ = v),
              title: const Text('Previous Year Questions Only', style: TextStyle(color: Color(0xFFe2e8f0))),
              subtitle: const Text('Use real NEET exam questions', style: TextStyle(color: Color(0xFF94a3b8))),
              activeThumbColor: const Color(0xFF6366f1),
              activeTrackColor: const Color(0xFF6366f140),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton.icon(
                onPressed: _loading ? null : _startTest,
                icon: _loading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.play_arrow_rounded),
                label: Text(_loading ? 'Generating...' : 'Start Test', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _section(String title, Widget child) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 20),
        Text(title, style: const TextStyle(color: Color(0xFF94a3b8), fontWeight: FontWeight.w600, fontSize: 13)),
        const SizedBox(height: 10),
        child,
      ],
    );
  }
}

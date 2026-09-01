import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';

class NativeStudyPlanScreen extends StatefulWidget {
  const NativeStudyPlanScreen({super.key});

  @override
  State<NativeStudyPlanScreen> createState() => _NativeStudyPlanScreenState();
}

class _NativeStudyPlanScreenState extends State<NativeStudyPlanScreen> {
  final NeetApiClient _apiClient = NeetApiClient();
  bool _isLoading = true;
  List<dynamic> _tasks = [];
  String _totalHours = '3.5 Hours';

  @override
  void initState() {
    super.initState();
    _loadStudyPlan();
  }

  Future<void> _loadStudyPlan() async {
    setState(() => _isLoading = true);
    try {
      final res = await _apiClient.getStudyPlan();
      if (mounted) {
        setState(() {
          _isLoading = false;
          if (res.data != null && res.data['plan'] is List) {
            _tasks = res.data['plan'];
            if (res.data['totalStudyHours'] != null) {
              _totalHours = '${res.data['totalStudyHours']} Hours';
            }
          } else {
            _setFallbackPlan();
          }
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _setFallbackPlan();
        });
      }
    }
  }

  void _setFallbackPlan() {
    _tasks = [
      {'time': '09:00 AM - 10:30 AM', 'activity': 'Physics: Thermodynamics Problem Solving', 'status': 'Completed', 'isDone': true},
      {'time': '11:00 AM - 12:30 PM', 'activity': 'Biology: Cell Division NCERT Reading', 'status': 'In Progress', 'isDone': false},
      {'time': '04:00 PM - 05:00 PM', 'activity': 'Chemistry: 30-Question Custom Mock Test', 'status': 'Pending', 'isDone': false},
    ];
  }

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
        child: RefreshIndicator(
          onRefresh: _loadStudyPlan,
          child: _isLoading
              ? Center(child: CircularProgressIndicator(color: NeetTokens.accentGlow))
              : ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: NeetTokens.cardGradient,
                        borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
                        border: Border.all(color: NeetTokens.accentPrimary.withValues(alpha: 0.3)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'STUDY SCHEDULE - TODAY',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: NeetTokens.accentPrimary, letterSpacing: 1.1),
                          ),
                          const SizedBox(height: 8),
                          Text('Daily Goal: $_totalHours', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: NeetTokens.textPrimary)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    ..._tasks.map((task) => _buildScheduleTask(
                          task['time'] ?? '10:00 AM',
                          task['activity'] ?? task['title'] ?? 'Study Session',
                          task['status'] ?? 'Pending',
                          task['isDone'] == true,
                        )),
                  ],
                ),
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

import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';
import '../../../core/cache/offline_cache.dart';
import '../../practice/presentation/test_configure_screen.dart';

class NativeStudyPlanScreen extends StatefulWidget {
  const NativeStudyPlanScreen({super.key});

  @override
  State<NativeStudyPlanScreen> createState() => _NativeStudyPlanScreenState();
}

class _NativeStudyPlanScreenState extends State<NativeStudyPlanScreen> {
  final NeetApiClient _apiClient = NeetApiClient();
  bool _isLoading = false;
  List<dynamic> _tasks = [];
  List<String> _recommendations = [];
  String _totalHours = '11 Hours';
  String _planDate = 'Today';

  @override
  void initState() {
    super.initState();
    _setFallbackPlan();
    _loadCachedPlan();
    _loadStudyPlan();
  }

  Future<void> _loadCachedPlan() async {
    final cached = await OfflineCacheService.getCachedUserData('study_plan');
    if (cached is Map<String, dynamic> && mounted) {
      _applyPlanData(cached);
    }
  }

  void _applyPlanData(Map<String, dynamic> data) {
    dynamic planObj = data['plan'];
    if (planObj is Map) {
      if (planObj['plan'] is List) {
        _tasks = List.from(planObj['plan']);
      }
      if (planObj['totalStudyHours'] != null) {
        _totalHours = '${planObj['totalStudyHours']} Hours';
      }
      if (planObj['date'] != null) {
        _planDate = planObj['date'].toString();
      }
      if (planObj['recommendations'] is List) {
        _recommendations = (planObj['recommendations'] as List).map((e) => e.toString()).toList();
      }
    } else if (planObj is List) {
      _tasks = List.from(planObj);
    }

    if (_tasks.isEmpty) {
      _setFallbackPlan();
    }
  }

  Future<void> _loadStudyPlan() async {
    try {
      final res = await _apiClient.getStudyPlan();
      if (mounted) {
        setState(() {
          _isLoading = false;
          if (res.data != null && res.data is Map<String, dynamic>) {
            _applyPlanData(res.data as Map<String, dynamic>);
          } else {
            _setFallbackPlan();
          }
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          if (_tasks.isEmpty) {
            _setFallbackPlan();
          }
        });
      }
    }
  }

  void _setFallbackPlan() {
    _tasks = [
      {'time': '6:00 AM - 8:00 AM', 'activity': 'Physics: Thermodynamics & Thermal Properties', 'type': 'study', 'subject': 'Physics', 'duration': 120},
      {'time': '8:30 AM - 10:00 AM', 'activity': 'Custom Practice Test — 30 High-Yield Questions', 'type': 'test', 'subject': 'Mixed', 'duration': 90},
      {'time': '10:30 AM - 12:30 PM', 'activity': 'Chemistry: Organic Reactions & Mechanisms', 'type': 'study', 'subject': 'Chemistry', 'duration': 120},
      {'time': '2:00 PM - 4:00 PM', 'activity': 'Biology: Cell Division & Genetics NCERT Reading', 'type': 'study', 'subject': 'Biology', 'duration': 120},
      {'time': '4:30 PM - 6:00 PM', 'activity': 'Spaced Revision: Review Weak Areas & Flashcards', 'type': 'revision', 'subject': 'Mixed', 'duration': 90},
      {'time': '7:00 PM - 9:00 PM', 'activity': 'Previous Year Questions (PYQs) Solving & Analysis', 'type': 'practice', 'subject': 'Mixed', 'duration': 120},
    ];
    _recommendations = [
      '⚠️ Priority: Strengthen your lowest accuracy topics early in the morning.',
      'Take 10-minute micro-breaks every hour to retain maximum focus.',
      'Active recall via NCERT flashcards boosts exam-day retention by 40%.',
      'Solve full 3-hour mock tests every Sunday in NEET simulation mode.',
    ];
  }

  Color _getSubjectColor(String? subject) {
    switch (subject?.toLowerCase()) {
      case 'physics':
        return NeetTokens.physicsColor;
      case 'chemistry':
        return NeetTokens.chemistryColor;
      case 'biology':
        return NeetTokens.biologyColor;
      default:
        return NeetTokens.accentPrimary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        title: Text(
          'AI Study Plan',
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
          color: NeetTokens.accentPrimary,
          child: _isLoading && _tasks.isEmpty
              ? Center(child: CircularProgressIndicator(color: NeetTokens.accentGlow))
              : ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    // Header Card
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
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'STUDY SCHEDULE',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  color: NeetTokens.accentPrimary,
                                  letterSpacing: 1.1,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: NeetTokens.accentPrimary.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(NeetTokens.radiusFull),
                                ),
                                child: Text(
                                  _planDate,
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: NeetTokens.accentPrimary),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Daily Goal: $_totalHours',
                            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: NeetTokens.textPrimary),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'AI-tailored schedule based on your NEET weak areas and accuracy trends',
                            style: TextStyle(fontSize: 12, color: NeetTokens.textMuted),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Timeline Items
                    Text(
                      'Daily Timeline',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary),
                    ),
                    const SizedBox(height: 12),
                    ..._tasks.map((task) => _buildScheduleTask(task)),

                    // AI Recommendations
                    if (_recommendations.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: NeetTokens.bgSecondary,
                          borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                          border: Border.all(color: NeetTokens.warning.withValues(alpha: 0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.auto_awesome, color: NeetTokens.warning, size: 18),
                                const SizedBox(width: 8),
                                Text(
                                  'AI Recommendations',
                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            ..._recommendations.map((rec) => Padding(
                                  padding: const EdgeInsets.only(bottom: 8),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('• ', style: TextStyle(color: NeetTokens.warning, fontWeight: FontWeight.bold, fontSize: 16)),
                                      Expanded(
                                        child: Text(
                                          rec,
                                          style: TextStyle(fontSize: 13, color: NeetTokens.textSecondary, height: 1.4),
                                        ),
                                      ),
                                    ],
                                  ),
                                )),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: 24),

                    // Quick Practice Action
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          NeetTokens.hapticSelection();
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const NativeTestConfigureScreen()),
                          );
                        },
                        icon: const Icon(Icons.assignment_outlined, color: Colors.white),
                        label: const Text(
                          'Start Practice Test',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: NeetTokens.accentPrimary,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusMd)),
                        ),
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildScheduleTask(dynamic task) {
    final time = task['time']?.toString() ?? 'Session';
    final activity = task['activity']?.toString() ?? task['title']?.toString() ?? 'Study Session';
    final type = task['type']?.toString().toUpperCase() ?? 'STUDY';
    final subject = task['subject']?.toString() ?? 'General';
    final duration = task['duration'] != null ? '${task['duration']} min' : null;
    final subjectColor = _getSubjectColor(subject);

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
              Text(
                time,
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: NeetTokens.textMuted),
              ),
              Row(
                children: [
                  if (duration != null) ...[
                    Text(
                      duration,
                      style: TextStyle(fontSize: 11, color: NeetTokens.textMuted),
                    ),
                    const SizedBox(width: 8),
                  ],
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: subjectColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: subjectColor.withValues(alpha: 0.3)),
                    ),
                    child: Text(
                      subject,
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: subjectColor),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            activity,
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: NeetTokens.textPrimary),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: NeetTokens.bgTertiary,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              type,
              style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: NeetTokens.textMuted, letterSpacing: 0.5),
            ),
          ),
        ],
      ),
    );
  }
}

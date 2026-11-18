import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';
import '../../practice/presentation/test_configure_screen.dart';

class NativeMistakeNotebookScreen extends StatefulWidget {
  const NativeMistakeNotebookScreen({super.key});

  @override
  State<NativeMistakeNotebookScreen> createState() => _NativeMistakeNotebookScreenState();
}

class _NativeMistakeNotebookScreenState extends State<NativeMistakeNotebookScreen> {
  final NeetApiClient _apiClient = NeetApiClient();
  bool _isLoading = true;
  List<dynamic> _weakAreas = [];

  @override
  void initState() {
    super.initState();
    _loadMistakes();
  }

  Future<void> _loadMistakes() async {
    setState(() => _isLoading = true);
    try {
      final res = await _apiClient.getPerformance();
      if (mounted) {
        setState(() {
          _isLoading = false;
          if (res.statusCode == 200 && res.data != null) {
            _weakAreas = (res.data['weakAreas'] as List<dynamic>?) ?? [];
          }
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        title: Row(
          children: const [
            Icon(Icons.auto_stories_rounded, color: NeetTokens.physicsColor),
            SizedBox(width: 8),
            Text(
              'Mistake Notebook',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: NeetTokens.textPrimary,
              ),
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: _isLoading
            ? Center(child: CircularProgressIndicator(color: NeetTokens.accentGlow))
            : RefreshIndicator(
                onRefresh: _loadMistakes,
                color: NeetTokens.accentPrimary,
                backgroundColor: NeetTokens.bgSecondary,
                child: ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: NeetTokens.bgSecondary,
                        borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                        border: Border.all(color: NeetTokens.border),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.info_outline, color: NeetTokens.physicsColor, size: 22),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text(
                                  'AI Weak Area Identification',
                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  'Topics where your historical test accuracy is below 50%. Practice targeted questions to eliminate recurring mistakes.',
                                  style: TextStyle(fontSize: 12, color: NeetTokens.textMuted, height: 1.3),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    if (_weakAreas.isEmpty)
                      _buildEmptyState()
                    else
                      ..._weakAreas.map((item) {
                        final weak = item as Map<String, dynamic>;
                        final topic = weak['topic_name']?.toString() ?? 'Topic';
                        final chapter = weak['chapter_name']?.toString() ?? 'Chapter';
                        final subject = weak['subject_name']?.toString() ?? 'Physics';
                        final accuracy = (weak['accuracy'] as num?)?.round() ?? 0;
                        final attempted = weak['total_attempted'] as int? ?? 0;

                        return _buildWeakAreaCard(
                          subject: subject,
                          chapter: chapter,
                          topic: topic,
                          accuracy: accuracy,
                          attempted: attempted,
                        );
                      }),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      margin: const EdgeInsets.only(top: 20),
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: NeetTokens.bgSecondary,
        borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
        border: Border.all(color: NeetTokens.border),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: NeetTokens.biologyColor.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_circle_outline, color: NeetTokens.biologyColor, size: 36),
          ),
          const SizedBox(height: 16),
          const Text(
            'No Persistent Weak Areas!',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary),
          ),
          const SizedBox(height: 6),
          const Text(
            'Take a custom test or full mock test to analyze your knowledge gaps and populate your mistake notebook.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: NeetTokens.textMuted, height: 1.4),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NativeTestConfigureScreen()),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: NeetTokens.accentGlow,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Configure a Test Now →', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  Widget _buildWeakAreaCard({
    required String subject,
    required String chapter,
    required String topic,
    required int accuracy,
    required int attempted,
  }) {
    Color subjectColor = NeetTokens.physicsColor;
    if (subject.toLowerCase().contains('chem')) subjectColor = NeetTokens.chemistryColor;
    if (subject.toLowerCase().contains('bio')) subjectColor = NeetTokens.biologyColor;

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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: subjectColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  subject.toUpperCase(),
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: subjectColor),
                ),
              ),
              Text(
                '$attempted Questions Attempted',
                style: const TextStyle(fontSize: 11, color: NeetTokens.textMuted),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            topic,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: NeetTokens.textPrimary),
          ),
          const SizedBox(height: 4),
          Text(
            chapter,
            style: const TextStyle(fontSize: 12, color: NeetTokens.textSecondary),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: (accuracy / 100).clamp(0.0, 1.0),
                    backgroundColor: NeetTokens.border,
                    valueColor: AlwaysStoppedAnimation(
                      accuracy < 40 ? NeetTokens.error : NeetTokens.warning,
                    ),
                    minHeight: 6,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                '$accuracy% Accuracy',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: accuracy < 40 ? NeetTokens.error : NeetTokens.warning,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => NativeTestConfigureScreen(
                      initialType: 'custom',
                      initialTopic: topic,
                    ),
                  ),
                );
              },
              icon: const Icon(Icons.refresh_rounded, size: 16),
              label: const Text('Practice Weak Area →', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
              style: OutlinedButton.styleFrom(
                foregroundColor: NeetTokens.accentPrimary,
                side: const BorderSide(color: NeetTokens.accentPrimary),
                padding: const EdgeInsets.symmetric(vertical: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

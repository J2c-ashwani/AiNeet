import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';
import '../../../core/cache/offline_cache.dart';

class NativeRevisionManagerScreen extends StatefulWidget {
  const NativeRevisionManagerScreen({super.key});

  @override
  State<NativeRevisionManagerScreen> createState() => _NativeRevisionManagerScreenState();
}

class _NativeRevisionManagerScreenState extends State<NativeRevisionManagerScreen> {
  final NeetApiClient _apiClient = NeetApiClient();
  bool _isLoading = false;
  List<Map<String, dynamic>> _reviews = [];
  int _currentIndex = 0;
  bool _showAnswer = false;
  bool _isLogging = false;

  @override
  void initState() {
    super.initState();
    _setFallbackReviews();
    _loadCachedReviews();
    _loadRevisionQueue();
  }

  Future<void> _loadCachedReviews() async {
    final cached = await OfflineCacheService.getCachedUserData('revision_queue');
    if (cached is Map<String, dynamic> && mounted) {
      _applyReviewsData(cached);
    }
  }

  void _applyReviewsData(Map<String, dynamic> data) {
    if (data['reviews'] is List) {
      final list = (data['reviews'] as List).whereType<Map<String, dynamic>>().toList();
      if (list.isNotEmpty) {
        setState(() {
          _reviews = list;
          _isLoading = false;
        });
        return;
      }
    }
    if (_reviews.isEmpty) {
      _setFallbackReviews();
    }
  }

  Future<void> _loadRevisionQueue() async {
    try {
      final res = await _apiClient.getRevisionDue();
      if (mounted) {
        setState(() {
          _isLoading = false;
          if (res.data != null && res.data is Map<String, dynamic>) {
            _applyReviewsData(res.data as Map<String, dynamic>);
          } else {
            if (_reviews.isEmpty) _setFallbackReviews();
          }
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          if (_reviews.isEmpty) _setFallbackReviews();
        });
      }
    }
  }

  void _setFallbackReviews() {
    _reviews = [
      {
        'question_id': 'rev_1',
        'text': 'Which of the following cellular organelles is bound by a single membrane?',
        'subject_name': 'Biology',
        'correct_option': 'B',
        'explanation': 'Lysosomes and peroxisomes are single-membrane bound organelles, whereas mitochondria and chloroplasts have double membranes.',
      },
      {
        'question_id': 'rev_2',
        'text': 'In a uniform electric field, the work done in moving a charge across an equipotential surface is:',
        'subject_name': 'Physics',
        'correct_option': 'C',
        'explanation': 'Work done W = q * deltaV. Since potential difference deltaV across an equipotential surface is 0, the work done is zero.',
      },
      {
        'question_id': 'rev_3',
        'text': 'Which of the following compounds exhibits optical isomerism without containing a chiral carbon?',
        'subject_name': 'Chemistry',
        'correct_option': 'A',
        'explanation': 'Properly substituted allenes and biphenyls lack chiral carbon centers but exhibit molecular chirality due to restricted rotation and enantiomeric axis.',
      },
    ];
  }

  Future<void> _handleRate(int quality) async {
    if (_isLogging || _reviews.isEmpty || _currentIndex >= _reviews.length) return;
    NeetTokens.hapticMedium();

    final currentCard = _reviews[_currentIndex];
    final qId = currentCard['question_id']?.toString() ?? 'rev_$_currentIndex';

    setState(() => _isLogging = true);

    try {
      await _apiClient.logRevision(questionId: qId, quality: quality);
    } catch (_) {
      // Local progression even if offline
    }

    if (mounted) {
      setState(() {
        _isLogging = false;
        _showAnswer = false;
        _currentIndex++;
      });
    }
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
    final isDone = _currentIndex >= _reviews.length;

    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        title: Text(
          'Spaced Repetition Flashcards',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: NeetTokens.textPrimary,
          ),
        ),
      ),
      body: SafeArea(
        child: _isLoading
            ? Center(child: CircularProgressIndicator(color: NeetTokens.accentGlow))
            : isDone
                ? _buildSessionCompleteView()
                : _buildCardView(),
      ),
    );
  }

  Widget _buildSessionCompleteView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: NeetTokens.bgSecondary,
            borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
            border: Border.all(color: NeetTokens.biologyColor.withValues(alpha: 0.3)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: NeetTokens.biologyColor.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle_rounded, color: NeetTokens.biologyColor, size: 40),
              ),
              const SizedBox(height: 16),
              Text(
                'All Caught Up!',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: NeetTokens.textPrimary),
              ),
              const SizedBox(height: 8),
              Text(
                'You have reviewed all scheduled revision cards for today. High-yield memory retention active!',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: NeetTokens.textMuted, height: 1.4),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    NeetTokens.hapticSelection();
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: NeetTokens.accentPrimary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusMd)),
                  ),
                  child: const Text('Back to Dashboard', style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCardView() {
    final currentCard = _reviews[_currentIndex];
    final subject = currentCard['subject_name']?.toString() ?? 'General';
    final subjectColor = _getSubjectColor(subject);
    final text = currentCard['text']?.toString() ?? 'Question';
    final correctOption = currentCard['correct_option']?.toString() ?? 'A';
    final explanation = currentCard['explanation']?.toString();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Top Progress Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Card ${_currentIndex + 1} of ${_reviews.length}',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: subjectColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(NeetTokens.radiusFull),
                  border: Border.all(color: subjectColor.withValues(alpha: 0.3)),
                ),
                child: Text(
                  subject,
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: subjectColor),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: (_currentIndex + 1) / _reviews.length,
              backgroundColor: NeetTokens.bgSecondary,
              valueColor: AlwaysStoppedAnimation<Color>(NeetTokens.accentPrimary),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 24),

          // Flashcard Container
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: NeetTokens.bgSecondary,
              borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
              border: Border.all(color: NeetTokens.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'QUESTION',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: NeetTokens.textMuted, letterSpacing: 1.0),
                ),
                const SizedBox(height: 12),
                Text(
                  text,
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: NeetTokens.textPrimary, height: 1.5),
                ),
                const SizedBox(height: 24),

                if (!_showAnswer) ...[
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        NeetTokens.hapticSelection();
                        setState(() => _showAnswer = true);
                      },
                      icon: const Icon(Icons.visibility_outlined, color: Colors.white),
                      label: const Text('Show Answer & Solution', style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: NeetTokens.accentPrimary,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusMd)),
                      ),
                    ),
                  ),
                ] else ...[
                  // Revealed Answer
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: NeetTokens.biologyColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                      border: Border.all(color: NeetTokens.biologyColor.withValues(alpha: 0.4)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'CORRECT ANSWER: OPTION $correctOption',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: NeetTokens.biologyColor),
                        ),
                        if (explanation != null && explanation.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Text(
                            explanation,
                            style: TextStyle(fontSize: 13, color: NeetTokens.textSecondary, height: 1.4),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  Text(
                    'HOW WELL DID YOU KNOW THIS?',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: NeetTokens.textMuted, letterSpacing: 1.0),
                  ),
                  const SizedBox(height: 12),

                  // Rating Buttons: Hard (1), Good (3), Easy (5)
                  Row(
                    children: [
                      Expanded(
                        child: _buildRateButton(
                          label: 'Hard',
                          sublabel: 'Repeat tomorrow',
                          color: NeetTokens.error,
                          quality: 1,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildRateButton(
                          label: 'Good',
                          sublabel: 'In 3 days',
                          color: NeetTokens.accentPrimary,
                          quality: 3,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildRateButton(
                          label: 'Easy',
                          sublabel: 'In 7 days',
                          color: NeetTokens.biologyColor,
                          quality: 5,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRateButton({
    required String label,
    required String sublabel,
    required Color color,
    required int quality,
  }) {
    return InkWell(
      onTap: _isLogging ? null : () => _handleRate(quality),
      borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
          border: Border.all(color: color.withValues(alpha: 0.4)),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: color),
            ),
            const SizedBox(height: 2),
            Text(
              sublabel,
              style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: NeetTokens.textMuted),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

import 'dart:async';
import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/cache/offline_cache.dart';
import '../../../core/api/api_client.dart';

class NativeTestEngineScreen extends StatefulWidget {
  final String testTitle;
  final Map<String, dynamic>? initialTestData;
  final Map<String, dynamic>? testConfig;
  final Function(Map<String, dynamic> resultData) onSubmitTest;

  const NativeTestEngineScreen({
    super.key,
    required this.testTitle,
    this.initialTestData,
    this.testConfig,
    required this.onSubmitTest,
  });

  @override
  State<NativeTestEngineScreen> createState() => _NativeTestEngineScreenState();
}

class _NativeTestEngineScreenState extends State<NativeTestEngineScreen> {
  late final PageController _pageController;
  int _currentIndex = 0;
  final Map<int, String> _selectedAnswers = {};
  final Set<int> _markedForReview = {};

  int _remainingSeconds = 20 * 60; // Default 20 minutes
  int _elapsedSeconds = 0;
  Timer? _timer;

  List<Map<String, dynamic>> _questions = [];
  bool _isLoading = true;
  String? _testId;

  final NeetApiClient _apiClient = NeetApiClient();

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _loadQuestions();
  }

  Future<void> _loadQuestions() async {
    setState(() {
      _isLoading = true;
    });

    try {
      if (widget.initialTestData != null) {
        final data = widget.initialTestData!;
        final rawQuestions = (data['questions'] as List<dynamic>?) ?? [];
        _questions = rawQuestions.map((q) => Map<String, dynamic>.from(q as Map)).toList();
        _testId = data['testId']?.toString() ?? data['id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString();
        if (data['timeLimit'] is int) {
          _remainingSeconds = data['timeLimit'] as int;
        } else if (_questions.isNotEmpty) {
          _remainingSeconds = _questions.length * 90;
        }

        await OfflineCacheService.cacheUserData('questions_current', {'questions': _questions, 'testId': _testId});
      } else if (widget.testConfig != null) {
        final cfg = widget.testConfig!;
        final res = await _apiClient.generateTest(
          type: cfg['type'] ?? 'custom',
          subject: cfg['subject']?.toString(),
          topic: cfg['topic']?.toString(),
          difficulty: cfg['difficulty']?.toString(),
          questionCount: cfg['count'] as int? ?? cfg['questionCount'] as int? ?? 15,
        );

        if (res.statusCode == 200 && res.data != null) {
          final data = res.data as Map;
          final rawQuestions = (data['questions'] as List<dynamic>?) ?? [];
          _questions = rawQuestions.map((q) => Map<String, dynamic>.from(q as Map)).toList();
          _testId = data['testId']?.toString() ?? data['id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString();
          if (data['timeLimit'] is int) {
            _remainingSeconds = data['timeLimit'] as int;
          } else if (_questions.isNotEmpty) {
            _remainingSeconds = _questions.length * 90;
          }

          await OfflineCacheService.cacheUserData('questions_current', {'questions': _questions, 'testId': _testId});
        } else {
          throw Exception('Failed to generate test questions');
        }
      } else {
        final cached = await OfflineCacheService.getCachedUserData('questions_current');
        if (cached != null && cached['questions'] != null) {
          final List<dynamic> cachedQ = cached['questions'];
          _questions = cachedQ.map((q) => Map<String, dynamic>.from(q as Map)).toList();
          _testId = cached['testId']?.toString();
        } else {
          // Fallback demo questions if opened directly without prior configuration
          _questions = _getFallbackQuestions();
          _testId = 'demo_${DateTime.now().millisecondsSinceEpoch}';
        }
      }

      await _restoreTestState();

      if (mounted) {
        setState(() => _isLoading = false);
        _startTimer();
      }
    } catch (e) {
      if (mounted) {
        final cached = await OfflineCacheService.getCachedUserData('questions_current');
        if (cached != null && cached['questions'] != null) {
          final List<dynamic> cachedQ = cached['questions'];
          setState(() {
            _questions = cachedQ.map((q) => Map<String, dynamic>.from(q as Map)).toList();
            _testId = cached['testId']?.toString();
            _isLoading = false;
          });
          await _restoreTestState();
          _startTimer();
        } else {
          setState(() {
            _questions = _getFallbackQuestions();
            _testId = 'demo_${DateTime.now().millisecondsSinceEpoch}';
            _isLoading = false;
          });
          _startTimer();
        }
      }
    }
  }

  List<Map<String, dynamic>> _getFallbackQuestions() {
    return [
      {
        'id': 'demo_1',
        'text': 'A thermodynamic system undergoes an isothermal expansion. Which of the following remains constant?',
        'option_a': 'Internal Energy',
        'option_b': 'Volume',
        'option_c': 'Pressure',
        'option_d': 'Work Done',
        'subject': 'physics',
        'correct_option': 'A',
        'explanation': 'In an isothermal process for an ideal gas, temperature remains constant, so change in internal energy dU = 0.',
      },
      {
        'id': 'demo_2',
        'text': 'Which of the following molecules has a square planar geometry according to VSEPR theory?',
        'option_a': 'CH4',
        'option_b': 'XeF4',
        'option_c': 'SF4',
        'option_d': 'NH3',
        'subject': 'chemistry',
        'correct_option': 'B',
        'explanation': 'XeF4 has 4 bond pairs and 2 lone pairs on Xenon (sp3d2 hybridization), leading to a square planar geometry.',
      },
      {
        'id': 'demo_3',
        'text': 'The powerhouse of the eukaryotic cell responsible for ATP production through oxidative phosphorylation is:',
        'option_a': 'Endoplasmic Reticulum',
        'option_b': 'Ribosome',
        'option_c': 'Mitochondria',
        'option_d': 'Golgi Apparatus',
        'subject': 'biology',
        'correct_option': 'C',
        'explanation': 'Mitochondria are the primary site of aerobic cellular respiration and ATP generation.',
      },
    ];
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds <= 1) {
        timer.cancel();
        _handleAutoSubmit();
      } else {
        setState(() {
          _remainingSeconds--;
          _elapsedSeconds++;
        });
      }
    });
  }

  Future<void> _restoreTestState() async {
    final saved = await OfflineCacheService.getCachedUserData('active_test_answers');
    if (saved != null && saved is Map<String, dynamic> && mounted) {
      setState(() {
        saved.forEach((key, value) {
          final idx = int.tryParse(key);
          if (idx != null) {
            _selectedAnswers[idx] = value.toString();
          }
        });
      });
    }
  }

  Future<void> _persistAnswer(int index, String optionKey) async {
    setState(() => _selectedAnswers[index] = optionKey);
    NeetTokens.hapticSelection();

    final mapToSave = _selectedAnswers.map((k, v) => MapEntry(k.toString(), v));
    await OfflineCacheService.cacheUserData('active_test_answers', mapToSave);
  }

  void _toggleMarkForReview(int index) {
    setState(() {
      if (_markedForReview.contains(index)) {
        _markedForReview.remove(index);
      } else {
        _markedForReview.add(index);
      }
    });
    NeetTokens.hapticLight();
  }

  Future<void> _handleAutoSubmit() async {
    _timer?.cancel();
    NeetTokens.hapticMedium();

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Center(
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: NeetTokens.bgSecondary,
            borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
            border: Border.all(color: NeetTokens.border),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: const [
              CircularProgressIndicator(color: NeetTokens.accentGlow),
              SizedBox(height: 16),
              Text(
                'Submitting & Grading Test...',
                style: TextStyle(color: NeetTokens.textPrimary, fontWeight: FontWeight.w700),
              ),
            ],
          ),
        ),
      ),
    );

    // Format answers array according to API contract: [{ questionId, selectedOption, timeSpent }]
    final List<Map<String, dynamic>> answerPayload = [];
    for (int i = 0; i < _questions.length; i++) {
      final q = _questions[i];
      final selected = _selectedAnswers[i];
      answerPayload.add({
        'questionId': q['id']?.toString() ?? '',
        'selectedOption': selected,
        'timeSpent': _questions.isNotEmpty ? (_elapsedSeconds ~/ _questions.length) : 30,
      });
    }

    try {
      final res = await _apiClient.submitTest(
        testId: _testId ?? DateTime.now().millisecondsSinceEpoch.toString(),
        answers: answerPayload,
        timeTakenSeconds: _elapsedSeconds,
      );

      await OfflineCacheService.removeKey('active_test_answers');
      await OfflineCacheService.removeKey('questions_current');

      if (mounted) {
        Navigator.pop(context); // pop dialog
        final scorecard = _buildScorecard(res.data);
        widget.onSubmitTest(scorecard);
      }
    } catch (_) {
      if (mounted) {
        Navigator.pop(context); // pop dialog
        final scorecard = _buildScorecard(null);
        widget.onSubmitTest(scorecard);
      }
    }
  }

  Map<String, dynamic> _buildScorecard(dynamic apiData) {
    if (apiData is Map<String, dynamic> &&
        apiData.containsKey('score') &&
        apiData.containsKey('explanations') &&
        (apiData['explanations'] as List).isNotEmpty) {
      return apiData;
    }

    int correct = 0;
    int incorrect = 0;
    int unattempted = 0;
    final List<Map<String, dynamic>> explanations = [];

    for (int i = 0; i < _questions.length; i++) {
      final q = _questions[i];
      final userAnswer = _selectedAnswers[i];
      final correctAnswer = q['correct_option']?.toString().toUpperCase() ?? 'A';
      final isCorrect = userAnswer != null && userAnswer.toUpperCase() == correctAnswer;

      if (userAnswer == null) {
        unattempted++;
      } else if (isCorrect) {
        correct++;
      } else {
        incorrect++;
      }

      explanations.add({
        'question': q['text'] ?? 'Question ${i + 1}',
        'userAnswer': userAnswer ?? 'Unattempted',
        'correctAnswer': correctAnswer,
        'explanation': q['explanation'] ?? 'Official NCERT step-by-step conceptual breakdown.',
        'isCorrect': isCorrect,
      });
    }

    final score = (correct * 4) - (incorrect * 1);

    return {
      'score': score,
      'totalQuestions': _questions.length,
      'correct': correct,
      'incorrect': incorrect,
      'unattempted': unattempted,
      'accuracy': _questions.isNotEmpty ? ((correct / _questions.length) * 100).round() : 0,
      'timeTakenSeconds': _elapsedSeconds,
      'explanations': explanations,
    };
  }

  void _showQuestionPalette() {
    NeetTokens.hapticLight();
    showModalBottomSheet(
      context: context,
      backgroundColor: NeetTokens.bgSecondary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Question Palette',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: NeetTokens.textMuted),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: List.generate(_questions.length, (idx) {
                    final isAnswered = _selectedAnswers.containsKey(idx);
                    final isMarked = _markedForReview.contains(idx);
                    final isCurrent = idx == _currentIndex;

                    Color bgColor = NeetTokens.bgCard;
                    Color textColor = NeetTokens.textSecondary;
                    if (isCurrent) {
                      bgColor = NeetTokens.accentPrimary;
                      textColor = Colors.white;
                    } else if (isMarked) {
                      bgColor = NeetTokens.warning;
                      textColor = Colors.black;
                    } else if (isAnswered) {
                      bgColor = NeetTokens.biologyColor;
                      textColor = Colors.white;
                    }

                    return InkWell(
                      onTap: () {
                        Navigator.pop(ctx);
                        _pageController.jumpToPage(idx);
                      },
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: bgColor,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isCurrent ? Colors.white : NeetTokens.border,
                            width: isCurrent ? 2 : 1,
                          ),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          '${idx + 1}',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: textColor),
                        ),
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  String _formatTimer(int seconds) {
    final mins = (seconds ~/ 60).toString().padLeft(2, '0');
    final secs = (seconds % 60).toString().padLeft(2, '0');
    return '$mins:$secs';
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: NeetTokens.bgPrimary,
        appBar: AppBar(backgroundColor: NeetTokens.bgSecondary, title: Text(widget.testTitle)),
        body: Center(child: CircularProgressIndicator(color: NeetTokens.accentGlow)),
      );
    }

    if (_questions.isEmpty) {
      return Scaffold(
        backgroundColor: NeetTokens.bgPrimary,
        appBar: AppBar(backgroundColor: NeetTokens.bgSecondary, title: Text(widget.testTitle)),
        body: const Center(
          child: Text('No questions available for this configuration.', style: TextStyle(color: NeetTokens.textPrimary)),
        ),
      );
    }

    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.testTitle,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: NeetTokens.textPrimary),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            Text(
              'Q ${_currentIndex + 1} of ${_questions.length} • ${_selectedAnswers.length} Answered',
              style: const TextStyle(fontSize: 12, color: NeetTokens.textMuted),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: _remainingSeconds < 180 ? NeetTokens.error.withValues(alpha: 0.2) : NeetTokens.bgCard,
              borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
              border: Border.all(color: _remainingSeconds < 180 ? NeetTokens.error : NeetTokens.border),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.timer_outlined,
                  size: 16,
                  color: _remainingSeconds < 180 ? NeetTokens.error : NeetTokens.physicsColor,
                ),
                const SizedBox(width: 6),
                Text(
                  _formatTimer(_remainingSeconds),
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: _remainingSeconds < 180 ? NeetTokens.error : NeetTokens.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Question Pages
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (index) => setState(() => _currentIndex = index),
                itemCount: _questions.length,
                itemBuilder: (context, qIndex) {
                  final q = _questions[qIndex];
                  final selectedAnswer = _selectedAnswers[qIndex];
                  final isMarked = _markedForReview.contains(qIndex);
                  final subject = q['subject']?.toString() ?? 'physics';

                  // Options parser (handles option_a, option_b, option_c, option_d)
                  final options = [
                    {'key': 'A', 'text': q['option_a']?.toString() ?? ''},
                    {'key': 'B', 'text': q['option_b']?.toString() ?? ''},
                    {'key': 'C', 'text': q['option_c']?.toString() ?? ''},
                    {'key': 'D', 'text': q['option_d']?.toString() ?? ''},
                  ].where((opt) => opt['text']!.trim().isNotEmpty).toList();

                  return SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Subject & Bookmark Row
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: NeetTokens.physicsColor.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                              ),
                              child: Text(
                                subject.toUpperCase(),
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  color: NeetTokens.physicsColor,
                                ),
                              ),
                            ),
                            IconButton(
                              icon: Icon(
                                isMarked ? Icons.bookmark : Icons.bookmark_outline,
                                color: isMarked ? NeetTokens.warning : NeetTokens.textMuted,
                              ),
                              onPressed: () => _toggleMarkForReview(qIndex),
                              tooltip: 'Mark for Review',
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Question Text
                        Text(
                          q['text']?.toString() ?? 'Question prompt missing',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: NeetTokens.textPrimary,
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Options List
                        ...options.map((opt) {
                          final key = opt['key']!;
                          final text = opt['text']!;
                          final isSelected = selectedAnswer == key;

                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: InkWell(
                              onTap: () => _persistAnswer(qIndex, key),
                              borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                              child: Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? NeetTokens.accentGlow.withValues(alpha: 0.15)
                                      : NeetTokens.bgSecondary,
                                  borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                                  border: Border.all(
                                    color: isSelected ? NeetTokens.accentGlow : NeetTokens.border,
                                    width: isSelected ? 2 : 1,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 28,
                                      height: 28,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: isSelected ? NeetTokens.accentGlow : NeetTokens.bgCard,
                                        border: Border.all(
                                          color: isSelected ? NeetTokens.accentGlow : NeetTokens.textMuted,
                                        ),
                                      ),
                                      alignment: Alignment.center,
                                      child: Text(
                                        key,
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w800,
                                          color: isSelected ? Colors.white : NeetTokens.textSecondary,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Text(
                                        text,
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                          color: isSelected ? NeetTokens.textPrimary : NeetTokens.textSecondary,
                                          height: 1.4,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  );
                },
              ),
            ),

            // Bottom Navigation & Submit Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: NeetTokens.bgSecondary,
                border: Border(top: BorderSide(color: NeetTokens.border)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.grid_view_rounded, color: NeetTokens.accentSecondary),
                    onPressed: _showQuestionPalette,
                    tooltip: 'Question Palette',
                  ),
                  Row(
                    children: [
                      OutlinedButton(
                        onPressed: _currentIndex > 0
                            ? () => _pageController.previousPage(
                                  duration: const Duration(milliseconds: 250),
                                  curve: Curves.easeInOut,
                                )
                            : null,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: NeetTokens.textSecondary,
                          side: BorderSide(color: NeetTokens.border),
                        ),
                        child: const Text('Prev'),
                      ),
                      const SizedBox(width: 8),
                      if (_currentIndex < _questions.length - 1)
                        ElevatedButton(
                          onPressed: () => _pageController.nextPage(
                            duration: const Duration(milliseconds: 250),
                            curve: Curves.easeInOut,
                          ),
                          style: ElevatedButton.styleFrom(backgroundColor: NeetTokens.accentPrimary),
                          child: const Text('Next', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                        )
                      else
                        ElevatedButton(
                          onPressed: _handleAutoSubmit,
                          style: ElevatedButton.styleFrom(backgroundColor: NeetTokens.biologyColor),
                          child: const Text('Submit Test', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

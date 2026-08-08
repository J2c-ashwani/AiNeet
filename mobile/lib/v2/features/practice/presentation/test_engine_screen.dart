import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/constants/tokens.dart';
import '../../../../core/cache/offline_cache.dart';
import '../../../../core/api/api_client.dart';
import 'package:uuid/uuid.dart';

class NativeTestEngineScreen extends StatefulWidget {
  final String testTitle;
  final Map<String, dynamic>? testConfig;
  final Function(Map<String, dynamic> resultData) onSubmitTest;

  const NativeTestEngineScreen({
    super.key,
    required this.testTitle,
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

  int _remainingSeconds = 15 * 60; // 15-minute mock test default
  int _elapsedSeconds = 0;
  Timer? _timer;

  List<Map<String, dynamic>> _questions = [];
  bool _isLoading = true;
  String? _errorMessage;
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
      _errorMessage = null;
    });

    try {
      // Fetch or generate questions
      if (widget.testConfig != null) {
        final res = await _apiClient.generateTest(
          subject: widget.testConfig!['subject'],
          topic: widget.testConfig!['topic'],
        );
        
        if (res.statusCode == 200 && res.data != null) {
          final List<dynamic> fetchedQuestions = res.data['questions'] ?? [];
          _questions = fetchedQuestions.cast<Map<String, dynamic>>();
          _testId = res.data['id'] ?? const Uuid().v4();
          
          await OfflineCacheService.cacheUserData('questions_current', {'questions': _questions, 'testId': _testId});
        } else {
          throw Exception('Failed to generate test');
        }
      } else {
         final cached = await OfflineCacheService.getCachedUserData('questions_current');
         if (cached != null && cached['questions'] != null) {
           final List<dynamic> cachedQ = cached['questions'];
           _questions = cachedQ.cast<Map<String, dynamic>>();
           _testId = cached['testId'];
         } else {
            throw Exception('No configuration and no cached questions available.');
         }
      }
      
      await _restoreTestState();
      
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        _startTimer();
      }
    } catch (e) {
      if (mounted) {
        // Try to load from cache
        final cached = await OfflineCacheService.getCachedUserData('questions_current');
        if (cached != null && cached['questions'] != null) {
           setState(() {
             final List<dynamic> cachedQ = cached['questions'];
             _questions = cachedQ.cast<Map<String, dynamic>>();
             _testId = cached['testId'];
             _isLoading = false;
           });
           await _restoreTestState();
           _startTimer();
        } else {
          setState(() {
            _isLoading = false;
            _errorMessage = 'Failed to load test questions. Please check your connection and try again.';
          });
        }
      }
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _startTimer() {
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
          _selectedAnswers[int.parse(key)] = value.toString();
        });
      });
    }
  }

  Future<void> _persistAnswer(int index, String option) async {
    setState(() => _selectedAnswers[index] = option);
    NeetTokens.hapticSelection();

    // Persist immediately for offline interruption recovery
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
    NeetTokens.hapticSuccess();
    
    // Show submitting overlay
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(color: NeetTokens.accentGlow),
      ),
    );

    try {
      final res = await _apiClient.submitTest(
        testId: _testId ?? const Uuid().v4(),
        answers: _selectedAnswers,
        timeTakenSeconds: _elapsedSeconds,
      );

      // Clear cached answers on success
      await OfflineCacheService.clearUserData('active_test_answers');
      await OfflineCacheService.clearUserData('questions_current');

      if (mounted) {
        Navigator.pop(context); // pop dialog
        widget.onSubmitTest(res.data ?? {
          'score': 0,
          'correct': 0,
          'incorrect': 0,
          'unattempted': _questions.length,
          'totalQuestions': _questions.length,
        });
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // pop dialog
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to submit test. Answers are saved locally.')),
        );
      }
    }
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
        appBar: AppBar(
          backgroundColor: NeetTokens.bgSecondary,
          title: Text(widget.testTitle),
        ),
        body: const Center(
          child: CircularProgressIndicator(color: NeetTokens.accentGlow),
        ),
      );
    }

    if (_errorMessage != null) {
      return Scaffold(
        backgroundColor: NeetTokens.bgPrimary,
        appBar: AppBar(
          backgroundColor: NeetTokens.bgSecondary,
          title: Text(widget.testTitle),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 64, color: NeetTokens.error),
                const SizedBox(height: 16),
                Text(
                  _errorMessage!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: NeetTokens.textPrimary, fontSize: 16),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _loadQuestions,
                  style: ElevatedButton.styleFrom(backgroundColor: NeetTokens.accentGlow),
                  child: const Text('Retry'),
                )
              ],
            ),
          ),
        ),
      );
    }

    if (_questions.isEmpty) {
       return Scaffold(
        backgroundColor: NeetTokens.bgPrimary,
        appBar: AppBar(
          backgroundColor: NeetTokens.bgSecondary,
          title: Text(widget.testTitle),
        ),
        body: const Center(
          child: Text('No questions available.', style: TextStyle(color: NeetTokens.textPrimary)),
        ),
      );
    }

    final currentQ = _questions[_currentIndex];
    final options = (currentQ['options'] as List<dynamic>?) ?? ['A', 'B', 'C', 'D'];

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
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: NeetTokens.textPrimary,
              ),
            ),
            Text(
              'Q ${_currentIndex + 1} of ${_questions.length}',
              style: const TextStyle(fontSize: 12, color: NeetTokens.textMuted),
            ),
          ],
        ),
        actions: [
          // Timer Widget
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: _remainingSeconds < 180
                  ? NeetTokens.error.withOpacity(0.2)
                  : NeetTokens.bgCard,
              borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
              border: Border.all(
                color: _remainingSeconds < 180
                    ? NeetTokens.error
                    : NeetTokens.border,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.timer_outlined,
                  size: 16,
                  color: _remainingSeconds < 180
                      ? NeetTokens.error
                      : NeetTokens.physicsColor,
                ),
                const SizedBox(width: 6),
                Text(
                  _formatTimer(_remainingSeconds),
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: _remainingSeconds < 180
                        ? NeetTokens.error
                        : NeetTokens.textPrimary,
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
            // Main Question Card View
          Expanded(
            child: PageView.builder(
              controller: _pageController,
              onPageChanged: (index) {
                setState(() => _currentIndex = index);
              },
              itemCount: _questions.length,
              itemBuilder: (context, index) {
                final selectedOption = _selectedAnswers[index];
                final isMarked = _markedForReview.contains(index);

                return SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Subject Badge
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: NeetTokens.physicsColor.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                            ),
                            child: Text(
                              (currentQ['subject'] ?? 'PHYSICS').toString().toUpperCase(),
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: NeetTokens.physicsColor,
                              ),
                            ),
                          ),

                          // Bookmark Button
                          IconButton(
                            icon: Icon(
                              isMarked ? Icons.bookmark : Icons.bookmark_outline,
                              color: isMarked
                                  ? NeetTokens.warning
                                  : NeetTokens.textMuted,
                            ),
                            onPressed: () => _toggleMarkForReview(index),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Question Text
                      Text(
                        currentQ['text']?.toString() ?? '',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: NeetTokens.textPrimary,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Options
                      ...List.generate(options.length, (optIdx) {
                        final optionText = options[optIdx].toString();
                        final isSelected = selectedOption == optionText;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: InkWell(
                            onTap: () => _persistAnswer(index, optionText),
                            borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? NeetTokens.accentGlow.withOpacity(0.15)
                                    : NeetTokens.bgSecondary,
                                borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                                border: Border.all(
                                  color: isSelected
                                      ? NeetTokens.accentGlow
                                      : NeetTokens.border,
                                  width: isSelected ? 2 : 1,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 24,
                                    height: 24,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: isSelected
                                          ? NeetTokens.accentGlow
                                          : Colors.transparent,
                                      border: Border.all(
                                        color: isSelected
                                            ? NeetTokens.accentGlow
                                            : NeetTokens.textMuted,
                                      ),
                                    ),
                                    alignment: Alignment.center,
                                    child: isSelected
                                        ? const Icon(
                                            Icons.check,
                                            size: 14,
                                            color: Colors.white,
                                          )
                                        : null,
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      optionText,
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: isSelected
                                            ? FontWeight.w700
                                            : FontWeight.w500,
                                        color: isSelected
                                            ? NeetTokens.textPrimary
                                            : NeetTokens.textSecondary,
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

          // Bottom Bar (Palette + Navigation)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: NeetTokens.bgSecondary,
              border: Border(top: BorderSide(color: NeetTokens.border)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.grid_view_rounded, color: NeetTokens.accentSecondary),
                  onPressed: _showQuestionPalette,
                ),
                Row(
                  children: [
                    if (_currentIndex > 0)
                      TextButton(
                        onPressed: () {
                          _pageController.previousPage(
                            duration: const Duration(milliseconds: 250),
                            curve: Curves.easeOut,
                          );
                        },
                        child: const Text('← Prev', style: TextStyle(color: NeetTokens.textMuted)),
                      ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () {
                        if (_currentIndex < _questions.length - 1) {
                          _pageController.nextPage(
                            duration: const Duration(milliseconds: 250),
                            curve: Curves.easeOut,
                          );
                        } else {
                          _showSubmitConfirmation();
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: NeetTokens.accentGlow,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                        ),
                      ),
                      child: Text(
                        _currentIndex == _questions.length - 1
                            ? 'Submit Test'
                            : 'Next →',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showQuestionPalette() {
    showModalBottomSheet(
      context: context,
      backgroundColor: NeetTokens.bgSecondary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Question Palette',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: NeetTokens.textPrimary,
                ),
              ),
              const SizedBox(height: 16),
              GridView.builder(
                shrinkWrap: true,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 5,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                ),
                itemCount: _questions.length,
                itemBuilder: (context, idx) {
                  final isAnswered = _selectedAnswers.containsKey(idx);
                  final isCurrent = _currentIndex == idx;

                  return InkWell(
                    onTap: () {
                      Navigator.pop(context);
                      _pageController.jumpToPage(idx);
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: isAnswered
                            ? NeetTokens.biologyColor.withOpacity(0.2)
                            : NeetTokens.bgCard,
                        borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                        border: Border.all(
                          color: isCurrent
                              ? NeetTokens.accentPrimary
                              : isAnswered
                                  ? NeetTokens.biologyColor
                                  : NeetTokens.border,
                          width: isCurrent ? 2 : 1,
                        ),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '${idx + 1}',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: isAnswered
                              ? NeetTokens.biologyColor
                              : NeetTokens.textPrimary,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _showSubmitConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: NeetTokens.bgSecondary,
        title: const Text('Submit Test?', style: TextStyle(color: NeetTokens.textPrimary)),
        content: Text(
          'You have answered ${_selectedAnswers.length} of ${_questions.length} questions. Are you sure you want to submit?',
          style: const TextStyle(color: NeetTokens.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: NeetTokens.textMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _handleAutoSubmit();
            },
            style: ElevatedButton.styleFrom(backgroundColor: NeetTokens.accentGlow),
            child: const Text('Submit Now', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

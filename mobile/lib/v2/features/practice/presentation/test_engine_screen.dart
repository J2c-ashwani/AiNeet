import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../core/constants/tokens.dart';
import '../../../../core/cache/offline_cache.dart';

class NativeTestEngineScreen extends StatefulWidget {
  final String testTitle;
  final List<Map<String, dynamic>> questions;
  final VoidCallback onSubmitTest;

  const NativeTestEngineScreen({
    super.key,
    required this.testTitle,
    required this.questions,
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
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _startTimer();
    _restoreTestState();
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
        setState(() => _remainingSeconds--);
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

  void _handleAutoSubmit() {
    NeetTokens.hapticSuccess();
    widget.onSubmitTest();
  }

  String _formatTimer(int seconds) {
    final mins = (seconds ~/ 60).toString().padLeft(2, '0');
    final secs = (seconds % 60).toString().padLeft(2, '0');
    return '$mins:$secs';
  }

  @override
  Widget build(BuildContext context) {
    final currentQ = widget.questions.isNotEmpty
        ? widget.questions[_currentIndex]
        : {
            'text': 'A body of mass 2 kg is accelerated from rest to a speed of 10 m/s in 2 seconds. Calculate the work done by the force.',
            'options': ['A) 50 J', 'B) 100 J', 'C) 200 J', 'D) 25 J'],
            'subject': 'Physics',
          };

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
              'Q ${_currentIndex + 1} of ${widget.questions.isEmpty ? 15 : widget.questions.length}',
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
              itemCount: widget.questions.isEmpty ? 15 : widget.questions.length,
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
                        if (_currentIndex < (widget.questions.isEmpty ? 14 : widget.questions.length - 1)) {
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
                        _currentIndex == (widget.questions.isEmpty ? 14 : widget.questions.length - 1)
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
                itemCount: widget.questions.isEmpty ? 15 : widget.questions.length,
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
          'You have answered ${_selectedAnswers.length} of ${widget.questions.isEmpty ? 15 : widget.questions.length} questions. Are you sure you want to submit?',
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

import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';
import 'test_engine_screen.dart';
import 'test_results_screen.dart';

class NativeTestConfigureScreen extends StatefulWidget {
  final String initialType;
  final String? initialTopic;

  const NativeTestConfigureScreen({
    super.key,
    this.initialType = 'custom',
    this.initialTopic,
  });

  @override
  State<NativeTestConfigureScreen> createState() => _NativeTestConfigureScreenState();
}

class _NativeTestConfigureScreenState extends State<NativeTestConfigureScreen> {
  final NeetApiClient _apiClient = NeetApiClient();

  late String _testType;
  final Set<int> _selectedSubjectIds = {1, 2, 3}; // 1: Physics, 2: Chemistry, 3: Biology
  final Set<int> _selectedChapterIds = {};
  final Set<int> _selectedTopicIds = {};

  final Set<int> _expandedSubjectAccordions = {};
  final Set<int> _expandedChapterAccordions = {};

  String _difficulty = 'all';
  int _questionCount = 20;

  List<dynamic> _syllabus = [];
  List<String> _availableYears = [];
  String _selectedYear = '2024';

  bool _isLoadingSyllabus = true;
  bool _isGenerating = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _testType = widget.initialType;
    _loadMetadata();
  }

  Future<void> _loadMetadata() async {
    try {
      final results = await Future.wait([
        _apiClient.getSyllabus(),
        _apiClient.getPyqYears(),
      ]);

      final syllabusRes = results[0];
      final yearsRes = results[1];

      if (mounted) {
        setState(() {
          if (syllabusRes.statusCode == 200 && syllabusRes.data != null) {
            _syllabus = (syllabusRes.data['subjects'] as List<dynamic>?) ?? [];
          }
          if (yearsRes.statusCode == 200 && yearsRes.data != null) {
            final years = (yearsRes.data['years'] as List<dynamic>?)?.map((y) => y.toString()).toList() ?? [];
            if (years.isNotEmpty) {
              _availableYears = years;
              _selectedYear = years.first;
            }
          }
          _isLoadingSyllabus = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _availableYears = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];
          _isLoadingSyllabus = false;
        });
      }
    }
  }

  void _toggleSubject(int subjectId) {
    NeetTokens.hapticSelection();
    setState(() {
      if (_selectedSubjectIds.contains(subjectId)) {
        if (_selectedSubjectIds.length > 1) {
          _selectedSubjectIds.remove(subjectId);
          // Remove chapters and topics under this subject
          final sub = _syllabus.firstWhere((s) => s['id'] == subjectId, orElse: () => null);
          if (sub != null && sub['chapters'] is List) {
            for (var ch in sub['chapters']) {
              final chId = ch['id'] as int?;
              if (chId != null) {
                _selectedChapterIds.remove(chId);
                if (ch['topics'] is List) {
                  for (var top in ch['topics']) {
                    final topId = top['id'] as int?;
                    if (topId != null) _selectedTopicIds.remove(topId);
                  }
                }
              }
            }
          }
        }
      } else {
        _selectedSubjectIds.add(subjectId);
      }
    });
  }

  void _toggleChapter(int chapterId, int subjectId) {
    NeetTokens.hapticSelection();
    setState(() {
      _selectedSubjectIds.add(subjectId);
      final ch = _findChapter(chapterId);
      final chTopics = (ch?['topics'] as List<dynamic>?) ?? [];

      if (_selectedChapterIds.contains(chapterId)) {
        _selectedChapterIds.remove(chapterId);
        for (var t in chTopics) {
          final tId = t['id'] as int?;
          if (tId != null) _selectedTopicIds.remove(tId);
        }
      } else {
        _selectedChapterIds.add(chapterId);
        for (var t in chTopics) {
          final tId = t['id'] as int?;
          if (tId != null) _selectedTopicIds.add(tId);
        }
      }
    });
  }

  void _toggleTopic(int topicId, int chapterId, int subjectId) {
    NeetTokens.hapticSelection();
    setState(() {
      _selectedSubjectIds.add(subjectId);
      _selectedChapterIds.add(chapterId);

      if (_selectedTopicIds.contains(topicId)) {
        _selectedTopicIds.remove(topicId);
        // Check if any topics left in chapter
        final ch = _findChapter(chapterId);
        final chTopics = (ch?['topics'] as List<dynamic>?) ?? [];
        final hasOtherSelected = chTopics.any((t) => _selectedTopicIds.contains(t['id']));
        if (!hasOtherSelected) {
          _selectedChapterIds.remove(chapterId);
        }
      } else {
        _selectedTopicIds.add(topicId);
      }
    });
  }

  Map<String, dynamic>? _findChapter(int chapterId) {
    for (var sub in _syllabus) {
      if (sub['chapters'] is List) {
        for (var ch in sub['chapters']) {
          if (ch['id'] == chapterId) return ch as Map<String, dynamic>;
        }
      }
    }
    return null;
  }

  void _selectAllTopicsInSubject(int subjectId) {
    NeetTokens.hapticSelection();
    setState(() {
      _selectedSubjectIds.add(subjectId);
      final sub = _syllabus.firstWhere((s) => s['id'] == subjectId, orElse: () => null);
      if (sub != null && sub['chapters'] is List) {
        for (var ch in sub['chapters']) {
          final chId = ch['id'] as int?;
          if (chId != null) {
            _selectedChapterIds.add(chId);
            if (ch['topics'] is List) {
              for (var t in ch['topics']) {
                final tId = t['id'] as int?;
                if (tId != null) _selectedTopicIds.add(tId);
              }
            }
          }
        }
      }
    });
  }

  void _clearAllSelections() {
    NeetTokens.hapticMedium();
    setState(() {
      _selectedChapterIds.clear();
      _selectedTopicIds.clear();
      _selectedSubjectIds.clear();
      _selectedSubjectIds.addAll([1, 2, 3]);
    });
  }

  Future<void> _handleStartTest() async {
    setState(() {
      _isGenerating = true;
      _errorMessage = null;
    });
    NeetTokens.hapticMedium();

    try {
      final count = (_testType == 'mock' || _testType == 'yearly_pyq') ? 180 : _questionCount;

      final res = await _apiClient.generateTest(
        type: _testType,
        subjects: _selectedSubjectIds.map((id) => id.toString()).toList(),
        chapters: _selectedChapterIds.isNotEmpty ? _selectedChapterIds.map((id) => id.toString()).toList() : null,
        topics: _selectedTopicIds.isNotEmpty ? _selectedTopicIds.map((id) => id.toString()).toList() : null,
        difficulty: (_testType != 'pyq' && _testType != 'yearly_pyq' && _difficulty != 'all') ? _difficulty : null,
        questionCount: count,
        year: _testType == 'yearly_pyq' ? _selectedYear : null,
        topic: widget.initialTopic,
      );

      if (!mounted) return;

      if (res.statusCode == 200 && res.data != null) {
        setState(() => _isGenerating = false);
        NeetTokens.hapticSuccess();

        final testData = Map<String, dynamic>.from(res.data as Map);
        final title = _getTestTitle();

        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (testCtx) => NativeTestEngineScreen(
              testTitle: title,
              initialTestData: testData,
              onSubmitTest: (resultData) {
                Navigator.pushReplacement(
                  testCtx,
                  MaterialPageRoute(
                    builder: (resCtx) => NativeTestResultsScreen(
                      resultData: resultData,
                      onReturnHome: () => Navigator.pop(resCtx),
                    ),
                  ),
                );
              },
            ),
          ),
        );
      } else {
        setState(() {
          _isGenerating = false;
          _errorMessage = res.data?['error']?.toString() ?? 'Failed to generate test. Please try again.';
        });
      }
    } on DioException catch (dioErr) {
      if (!mounted) return;
      setState(() {
        _isGenerating = false;
        final status = dioErr.response?.statusCode;
        final serverMsg = dioErr.response?.data?['error']?.toString();

        if (status == 401) {
          _errorMessage = 'Session expired or not logged in. Please sign in to generate tests.';
        } else if (status == 403) {
          _errorMessage = serverMsg ?? 'This test format is locked. Refer friends or upgrade your plan.';
        } else if (status == 404) {
          _errorMessage = serverMsg ?? 'No questions found for the selected topics. Try selecting more topics or chapters.';
        } else if (status == 429) {
          _errorMessage = serverMsg ?? 'Hourly limit reached. Please wait before generating another test.';
        } else if (dioErr.type == DioExceptionType.connectionTimeout || dioErr.type == DioExceptionType.receiveTimeout) {
          _errorMessage = 'Connection timed out. Please check your internet connection.';
        } else {
          _errorMessage = serverMsg ?? 'Failed to generate test (HTTP $status). Please try again.';
        }
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _isGenerating = false;
          _errorMessage = 'Unexpected error: $e';
        });
      }
    }
  }

  String _getTestTitle() {
    switch (_testType) {
      case 'mock':
        return 'NEET Full Mock Test (180 Qs • 720 Marks)';
      case 'adaptive':
        return 'AI Adaptive Practice Test';
      case 'ai_generated':
        return 'AI-Generated Practice Test';
      case 'yearly_pyq':
        return 'NEET $_selectedYear Official Paper';
      case 'pyq':
        return 'Past Year Question Practice';
      default:
        if (_selectedTopicIds.isNotEmpty) {
          return 'NEET Custom Test (${_selectedTopicIds.length} Topics • $_questionCount Qs)';
        }
        return 'NEET Custom Test ($_questionCount Qs)';
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
            Icon(Icons.tune_rounded, color: NeetTokens.accentPrimary),
            SizedBox(width: 8),
            Text(
              'Configure Test',
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
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (_errorMessage != null)
                Container(
                  margin: const EdgeInsets.only(bottom: 20),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: NeetTokens.error.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                    border: Border.all(color: NeetTokens.error),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.error_outline, color: NeetTokens.error, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(fontSize: 13, color: NeetTokens.error, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),

              // Section 1: Test Type
              const Text(
                'TEST FORMAT',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: NeetTokens.textMuted,
                  letterSpacing: 1.1,
                ),
              ),
              const SizedBox(height: 12),
              _buildTypeGrid(),
              const SizedBox(height: 24),

              // Section 2: Year Selector (if yearly_pyq)
              if (_testType == 'yearly_pyq') ...[
                const Text(
                  'SELECT EXAM YEAR',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: NeetTokens.textMuted,
                    letterSpacing: 1.1,
                  ),
                ),
                const SizedBox(height: 12),
                _buildYearChips(),
                const SizedBox(height: 24),
              ],

              // Section 3: Subject Selection (if not yearly_pyq)
              if (_testType != 'yearly_pyq') ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'SUBJECTS',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: NeetTokens.textMuted,
                        letterSpacing: 1.1,
                      ),
                    ),
                    if (_selectedTopicIds.isNotEmpty || _selectedChapterIds.isNotEmpty)
                      GestureDetector(
                        onTap: _clearAllSelections,
                        child: const Text('Reset All', style: TextStyle(fontSize: 12, color: NeetTokens.accentPrimary, fontWeight: FontWeight.w700)),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _buildSubjectCard('Physics', 1, '⚡', NeetTokens.physicsColor)),
                    const SizedBox(width: 10),
                    Expanded(child: _buildSubjectCard('Chemistry', 2, '🧪', NeetTokens.chemistryColor)),
                    const SizedBox(width: 10),
                    Expanded(child: _buildSubjectCard('Biology', 3, '🧬', NeetTokens.biologyColor)),
                  ],
                ),
                const SizedBox(height: 24),
              ],

              // Section 4: Multi-Topic & Chapter Tree (For Custom, Chapter PYQ, AI Generated)
              if (_testType != 'yearly_pyq' && _testType != 'mock' && _testType != 'adaptive') ...[
                _buildTopicTreeSection(),
                const SizedBox(height: 24),
              ],

              // Section 5: Difficulty (if custom / ai_generated)
              if (_testType == 'custom' || _testType == 'ai_generated') ...[
                const Text(
                  'DIFFICULTY LEVEL',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: NeetTokens.textMuted,
                    letterSpacing: 1.1,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _buildDifficultyChip('All Levels', 'all')),
                    const SizedBox(width: 8),
                    Expanded(child: _buildDifficultyChip('Easy', 'easy')),
                    const SizedBox(width: 8),
                    Expanded(child: _buildDifficultyChip('Medium', 'medium')),
                    const SizedBox(width: 8),
                    Expanded(child: _buildDifficultyChip('Hard', 'hard')),
                  ],
                ),
                const SizedBox(height: 24),
              ],

              // Section 6: Question Count & Total Marks (includes 180 Qs = 720 Marks!)
              if (_testType != 'mock' && _testType != 'yearly_pyq') ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'QUESTION COUNT & MARKS',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: NeetTokens.textMuted,
                        letterSpacing: 1.1,
                      ),
                    ),
                    Text(
                      '${_questionCount * 4} Marks • ${_calculateDuration(_questionCount)}',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: NeetTokens.accentPrimary),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _buildQuestionCountSelector(),
                const SizedBox(height: 32),
              ],

              // Start Button
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: _isGenerating ? null : _handleStartTest,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: NeetTokens.accentGlow,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                    ),
                    elevation: 4,
                  ),
                  child: _isGenerating
                      ? Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
                            SizedBox(width: 12),
                            Text('Generating NEET Test...', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
                          ],
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 24),
                            const SizedBox(width: 8),
                            Text(
                              (_testType == 'mock' || _testType == 'yearly_pyq')
                                  ? 'Start Full Mock (180 Qs • 720 Marks) →'
                                  : 'Start Test ($_questionCount Qs • ${_questionCount * 4} Marks) →',
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                            ),
                          ],
                        ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  String _calculateDuration(int count) {
    if (count == 180) return '180 Mins (3 Hrs)';
    if (count == 200) return '200 Mins';
    return '${(count * 1.5).round()} Mins';
  }

  Widget _buildTypeGrid() {
    final types = [
      {'id': 'custom', 'name': 'Custom Test', 'desc': 'Select custom topics & Qs', 'icon': Icons.tune_rounded, 'color': NeetTokens.accentPrimary},
      {'id': 'adaptive', 'name': 'Adaptive Practice', 'desc': 'AI adjusts difficulty', 'icon': Icons.psychology_outlined, 'color': NeetTokens.accentSecondary},
      {'id': 'ai_generated', 'name': 'AI Generated', 'desc': 'Fresh novel questions', 'icon': Icons.bolt, 'color': NeetTokens.physicsColor},
      {'id': 'pyq', 'name': 'Chapter PYQ', 'desc': 'Past questions by topic', 'icon': Icons.auto_stories_outlined, 'color': NeetTokens.chemistryColor},
      {'id': 'yearly_pyq', 'name': 'Year-wise PYQ', 'desc': 'Official exam papers', 'icon': Icons.calendar_today_outlined, 'color': NeetTokens.biologyColor},
      {'id': 'mock', 'name': 'Full Mock Test', 'desc': '180 Qs • 720 Marks', 'icon': Icons.timer_outlined, 'color': NeetTokens.warning},
    ];

    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: types.map((t) {
        final id = t['id'] as String;
        final name = t['name'] as String;
        final desc = t['desc'] as String;
        final icon = t['icon'] as IconData;
        final color = t['color'] as Color;
        final isSelected = _testType == id;

        return InkWell(
          onTap: () {
            NeetTokens.hapticSelection();
            setState(() {
              _testType = id;
            });
          },
          borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
          child: Container(
            width: (MediaQuery.of(context).size.width - 50) / 2,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isSelected ? color.withValues(alpha: 0.15) : NeetTokens.bgSecondary,
              borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
              border: Border.all(
                color: isSelected ? color : NeetTokens.border,
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, color: color, size: 20),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: isSelected ? color : NeetTokens.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        desc,
                        style: const TextStyle(fontSize: 10, color: NeetTokens.textMuted),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildSubjectCard(String title, int id, String emoji, Color color) {
    final isSelected = _selectedSubjectIds.contains(id);
    return InkWell(
      onTap: () => _toggleSubject(id),
      borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
        decoration: BoxDecoration(
          color: isSelected ? color.withValues(alpha: 0.15) : NeetTokens.bgSecondary,
          borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
          border: Border.all(
            color: isSelected ? color : NeetTokens.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 22)),
            const SizedBox(height: 6),
            Text(
              title,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected ? color : NeetTokens.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopicTreeSection() {
    if (_isLoadingSyllabus) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: NeetTokens.bgSecondary,
          borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
        ),
        alignment: Alignment.center,
        child: const CircularProgressIndicator(color: NeetTokens.accentPrimary, strokeWidth: 2),
      );
    }

    final matchingSubjects = _syllabus.where((s) {
      final sId = s['id'];
      if (sId is int) return _selectedSubjectIds.contains(sId);
      final parsed = int.tryParse(sId.toString());
      return parsed != null && _selectedSubjectIds.contains(parsed);
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'CUSTOM TOPIC & CHAPTER SELECTION',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: NeetTokens.textMuted,
                letterSpacing: 1.1,
              ),
            ),
            if (_selectedTopicIds.isNotEmpty)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: NeetTokens.accentPrimary.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: NeetTokens.accentPrimary),
                ),
                child: Text(
                  '${_selectedTopicIds.length} Topics Selected',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: NeetTokens.accentPrimary),
                ),
              ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          _selectedTopicIds.isEmpty && _selectedChapterIds.isEmpty
              ? 'Currently all chapters in selected subjects are included. Tap below to pick specific topics (e.g. 10 Physics, 20 Chemistry, 40 Biology).'
              : 'Test will strictly generate questions from your ${_selectedTopicIds.length} chosen topics across ${_selectedChapterIds.length} chapters.',
          style: const TextStyle(fontSize: 12, color: NeetTokens.textSecondary, height: 1.3),
        ),
        const SizedBox(height: 14),

        // Accordion for each subject
        ...matchingSubjects.map((sub) {
          final sId = (sub['id'] is int) ? sub['id'] as int : int.parse(sub['id'].toString());
          final sName = sub['name']?.toString() ?? 'Subject';
          final sIcon = sub['icon']?.toString() ?? '📚';
          final sChapters = (sub['chapters'] as List<dynamic>?) ?? [];
          final isExpanded = _expandedSubjectAccordions.contains(sId);

          // Calculate selected topic count in this subject
          int topicCountInSub = 0;
          for (var ch in sChapters) {
            final tList = (ch['topics'] as List<dynamic>?) ?? [];
            for (var t in tList) {
              if (_selectedTopicIds.contains(t['id'])) topicCountInSub++;
            }
          }

          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: NeetTokens.bgSecondary,
              borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
              border: Border.all(
                color: topicCountInSub > 0 ? NeetTokens.accentPrimary : NeetTokens.border,
                width: topicCountInSub > 0 ? 1.5 : 1,
              ),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: Text(sIcon, style: const TextStyle(fontSize: 20)),
                  title: Text(
                    sName,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary),
                  ),
                  subtitle: Text(
                    topicCountInSub > 0
                        ? '$topicCountInSub topics selected'
                        : '${sChapters.length} chapters available',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: topicCountInSub > 0 ? FontWeight.w700 : FontWeight.w400,
                      color: topicCountInSub > 0 ? NeetTokens.accentPrimary : NeetTokens.textMuted,
                    ),
                  ),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextButton(
                        onPressed: () => _selectAllTopicsInSubject(sId),
                        child: const Text('Select All', style: TextStyle(fontSize: 11, color: NeetTokens.accentPrimary)),
                      ),
                      IconButton(
                        icon: Icon(isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, color: NeetTokens.textSecondary),
                        onPressed: () {
                          setState(() {
                            if (isExpanded) {
                              _expandedSubjectAccordions.remove(sId);
                            } else {
                              _expandedSubjectAccordions.add(sId);
                            }
                          });
                        },
                      ),
                    ],
                  ),
                  onTap: () {
                    setState(() {
                      if (isExpanded) {
                        _expandedSubjectAccordions.remove(sId);
                      } else {
                        _expandedSubjectAccordions.add(sId);
                      }
                    });
                  },
                ),

                if (isExpanded)
                  Container(
                    padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                    child: Column(
                      children: sChapters.map((ch) {
                        final chId = ch['id'] as int;
                        final chName = ch['name']?.toString() ?? 'Chapter';
                        final chTopics = (ch['topics'] as List<dynamic>?) ?? [];
                        final isChSelected = _selectedChapterIds.contains(chId);
                        final isChExpanded = _expandedChapterAccordions.contains(chId);

                        // Topic count selected in this chapter
                        final selTopicsInCh = chTopics.where((t) => _selectedTopicIds.contains(t['id'])).length;

                        return Container(
                          margin: const EdgeInsets.only(top: 8),
                          decoration: BoxDecoration(
                            color: NeetTokens.bgPrimary.withValues(alpha: 0.6),
                            borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                            border: Border.all(
                              color: selTopicsInCh > 0 ? NeetTokens.accentPrimary.withValues(alpha: 0.5) : NeetTokens.border.withValues(alpha: 0.5),
                            ),
                          ),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  Checkbox(
                                    value: isChSelected || (selTopicsInCh > 0 && selTopicsInCh == chTopics.length),
                                    activeColor: NeetTokens.accentPrimary,
                                    onChanged: (_) => _toggleChapter(chId, sId),
                                  ),
                                  Expanded(
                                    child: GestureDetector(
                                      onTap: () {
                                        setState(() {
                                          if (isChExpanded) {
                                            _expandedChapterAccordions.remove(chId);
                                          } else {
                                            _expandedChapterAccordions.add(chId);
                                          }
                                        });
                                      },
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            chName,
                                            style: TextStyle(
                                              fontSize: 13,
                                              fontWeight: isChSelected ? FontWeight.w700 : FontWeight.w600,
                                              color: isChSelected ? NeetTokens.accentPrimary : NeetTokens.textPrimary,
                                            ),
                                          ),
                                          if (chTopics.isNotEmpty)
                                            Text(
                                              '$selTopicsInCh/${chTopics.length} topics',
                                              style: const TextStyle(fontSize: 10, color: NeetTokens.textMuted),
                                            ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  if (chTopics.isNotEmpty)
                                    IconButton(
                                      icon: Icon(
                                        isChExpanded ? Icons.expand_less : Icons.expand_more,
                                        color: NeetTokens.textMuted,
                                        size: 20,
                                      ),
                                      onPressed: () {
                                        setState(() {
                                          if (isChExpanded) {
                                            _expandedChapterAccordions.remove(chId);
                                          } else {
                                            _expandedChapterAccordions.add(chId);
                                          }
                                        });
                                      },
                                    ),
                                ],
                              ),

                              // Topics List when expanded
                              if (isChExpanded && chTopics.isNotEmpty)
                                Container(
                                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
                                  child: Wrap(
                                    spacing: 6,
                                    runSpacing: 6,
                                    children: chTopics.map((top) {
                                      final topId = top['id'] as int;
                                      final topName = top['name']?.toString() ?? 'Topic';
                                      final isTopSelected = _selectedTopicIds.contains(topId);

                                      return InkWell(
                                        onTap: () => _toggleTopic(topId, chId, sId),
                                        borderRadius: BorderRadius.circular(16),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                          decoration: BoxDecoration(
                                            color: isTopSelected ? NeetTokens.accentPrimary.withValues(alpha: 0.2) : NeetTokens.bgSecondary,
                                            borderRadius: BorderRadius.circular(16),
                                            border: Border.all(
                                              color: isTopSelected ? NeetTokens.accentPrimary : NeetTokens.border,
                                              width: isTopSelected ? 1.5 : 1,
                                            ),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              if (isTopSelected) ...[
                                                const Icon(Icons.check, size: 12, color: NeetTokens.accentPrimary),
                                                const SizedBox(width: 4),
                                              ],
                                              Flexible(
                                                child: Text(
                                                  topName,
                                                  style: TextStyle(
                                                    fontSize: 11,
                                                    fontWeight: isTopSelected ? FontWeight.w700 : FontWeight.w500,
                                                    color: isTopSelected ? NeetTokens.accentPrimary : NeetTokens.textSecondary,
                                                  ),
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      );
                                    }).toList(),
                                  ),
                                ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildDifficultyChip(String label, String value) {
    final isSelected = _difficulty == value;
    return InkWell(
      onTap: () {
        NeetTokens.hapticSelection();
        setState(() => _difficulty = value);
      },
      borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? NeetTokens.accentPrimary.withValues(alpha: 0.2) : NeetTokens.bgSecondary,
          borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
          border: Border.all(
            color: isSelected ? NeetTokens.accentPrimary : NeetTokens.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            color: isSelected ? NeetTokens.accentPrimary : NeetTokens.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildYearChips() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _availableYears.map((year) {
        final isSelected = _selectedYear == year;
        return InkWell(
          onTap: () {
            NeetTokens.hapticSelection();
            setState(() => _selectedYear = year);
          },
          borderRadius: BorderRadius.circular(20),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: isSelected ? NeetTokens.biologyColor.withValues(alpha: 0.2) : NeetTokens.bgSecondary,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected ? NeetTokens.biologyColor : NeetTokens.border,
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Text(
              'NEET $year',
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected ? NeetTokens.biologyColor : NeetTokens.textSecondary,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildQuestionCountSelector() {
    final options = [
      {'count': 10, 'label': '10 Qs', 'sub': '40 Marks • 15m'},
      {'count': 20, 'label': '20 Qs', 'sub': '80 Marks • 30m'},
      {'count': 45, 'label': '45 Qs', 'sub': '180 Marks • 45m'},
      {'count': 90, 'label': '90 Qs', 'sub': '360 Marks • 90m'},
      {'count': 180, 'label': '180 Qs', 'sub': '720 Marks • 180m (Full NEET)'},
      {'count': 200, 'label': '200 Qs', 'sub': '720 Marks • 200m (NTA Pattern)'},
    ];

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: options.map((opt) {
        final count = opt['count'] as int;
        final label = opt['label'] as String;
        final sub = opt['sub'] as String;
        final isSelected = _questionCount == count;

        return InkWell(
          onTap: () {
            NeetTokens.hapticSelection();
            setState(() => _questionCount = count);
          },
          borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
          child: Container(
            width: (MediaQuery.of(context).size.width - 56) / 2,
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
            decoration: BoxDecoration(
              color: isSelected ? NeetTokens.accentPrimary.withValues(alpha: 0.2) : NeetTokens.bgSecondary,
              borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
              border: Border.all(
                color: isSelected ? NeetTokens.accentPrimary : NeetTokens.border,
                width: isSelected ? 2 : 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      label,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: isSelected ? NeetTokens.accentPrimary : NeetTokens.textPrimary,
                      ),
                    ),
                    if (count >= 180) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                        decoration: BoxDecoration(
                          color: NeetTokens.warning.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('720M', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: NeetTokens.warning)),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  sub,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                    color: isSelected ? NeetTokens.accentPrimary : NeetTokens.textMuted,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

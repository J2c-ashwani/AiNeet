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
    _syllabus = _getFallbackSyllabus();
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
          if (syllabusRes.statusCode == 200 && syllabusRes.data != null && syllabusRes.data['subjects'] is List) {
            final subs = syllabusRes.data['subjects'] as List<dynamic>;
            if (subs.isNotEmpty) {
              _syllabus = subs;
            }
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
          if (_syllabus.isEmpty) _syllabus = _getFallbackSyllabus();
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

  static List<Map<String, dynamic>> _getFallbackSyllabus() {
    return [
      {
        'id': 1,
        'name': 'Physics',
        'icon': '⚡',
        'chapters': [
          {
            'id': 101,
            'name': 'Physical World & Measurement',
            'topics': [
              {'id': 1001, 'name': 'Physical quantities & SI Units'},
              {'id': 1002, 'name': 'Dimensional analysis & Applications'},
              {'id': 1003, 'name': 'Errors in measurement & Significant figures'},
            ],
          },
          {
            'id': 102,
            'name': 'Kinematics',
            'topics': [
              {'id': 1004, 'name': 'Motion in a straight line & Graphs'},
              {'id': 1005, 'name': 'Relative velocity & Vectors'},
              {'id': 1006, 'name': 'Projectile motion & Trajectory'},
              {'id': 1007, 'name': 'Uniform circular motion'},
            ],
          },
          {
            'id': 103,
            'name': 'Laws of Motion',
            'topics': [
              {'id': 1008, 'name': "Newton's laws of motion & Momentum"},
              {'id': 1009, 'name': 'Friction & Dynamics of circular motion'},
              {'id': 1010, 'name': 'Free body diagrams & Equilibrium'},
            ],
          },
          {
            'id': 104,
            'name': 'Work, Energy & Power',
            'topics': [
              {'id': 1011, 'name': 'Work-energy theorem & Kinetic energy'},
              {'id': 1012, 'name': 'Potential energy & Conservative forces'},
              {'id': 1013, 'name': 'Collisions (Elastic & Inelastic)'},
            ],
          },
          {
            'id': 105,
            'name': 'Rotational Motion',
            'topics': [
              {'id': 1014, 'name': 'Centre of mass & Rigid bodies'},
              {'id': 1015, 'name': 'Moment of inertia & Parallel axes'},
              {'id': 1016, 'name': 'Torque & Angular momentum conservation'},
              {'id': 1017, 'name': 'Rolling motion & Dynamics'},
            ],
          },
          {
            'id': 106,
            'name': 'Gravitation',
            'topics': [
              {'id': 1018, 'name': "Kepler's laws & Gravitational potential"},
              {'id': 1019, 'name': 'Escape velocity & Orbital velocity'},
            ],
          },
          {
            'id': 107,
            'name': 'Thermodynamics & Kinetic Theory',
            'topics': [
              {'id': 1020, 'name': 'Zeroth & First law of thermodynamics'},
              {'id': 1021, 'name': 'Carnot engine, Efficiency & Second law'},
              {'id': 1022, 'name': 'Kinetic theory of gases & Degrees of freedom'},
            ],
          },
          {
            'id': 108,
            'name': 'Oscillations & Waves',
            'topics': [
              {'id': 1023, 'name': 'Simple harmonic motion (SHM) & Springs'},
              {'id': 1024, 'name': 'Wave motion, Superposition & Standing waves'},
              {'id': 1025, 'name': 'Doppler effect & Resonance'},
            ],
          },
          {
            'id': 109,
            'name': 'Electrostatics',
            'topics': [
              {'id': 1026, 'name': "Coulomb's law & Electric field"},
              {'id': 1027, 'name': "Gauss's theorem & Applications"},
              {'id': 1028, 'name': 'Electric potential & Capacitors/Dielectrics'},
            ],
          },
          {
            'id': 110,
            'name': 'Current Electricity',
            'topics': [
              {'id': 1029, 'name': "Ohm's law, Resistance & Temperature"},
              {'id': 1030, 'name': "Kirchhoff's laws & Wheatstone bridge"},
              {'id': 1031, 'name': 'Potentiometer & Cell EMF combinations'},
            ],
          },
          {
            'id': 111,
            'name': 'Magnetic Effects of Current & Magnetism',
            'topics': [
              {'id': 1032, 'name': "Biot-Savart law & Ampere's law"},
              {'id': 1033, 'name': 'Moving coil galvanometer & Conversion'},
              {'id': 1034, 'name': 'Earth magnetism & Magnetic materials'},
            ],
          },
          {
            'id': 112,
            'name': 'Electromagnetic Induction & AC',
            'topics': [
              {'id': 1035, 'name': "Faraday's & Lenz's laws of induction"},
              {'id': 1036, 'name': 'LCR series circuits, Resonance & AC Power'},
              {'id': 1037, 'name': 'Transformers & AC generators'},
            ],
          },
          {
            'id': 113,
            'name': 'Optics (Ray & Wave)',
            'topics': [
              {'id': 1038, 'name': 'Reflection, Refraction, Lenses & Prisms'},
              {'id': 1039, 'name': 'Microscopes & Astronomical telescopes'},
              {'id': 1040, 'name': "Wavefronts, Young's double slit interference"},
              {'id': 1041, 'name': 'Diffraction & Polarisation'},
            ],
          },
          {
            'id': 114,
            'name': 'Modern Physics & Semiconductors',
            'topics': [
              {'id': 1042, 'name': 'Photoelectric effect & de Broglie wavelength'},
              {'id': 1043, 'name': 'Bohr atom model & Hydrogen spectrum'},
              {'id': 1044, 'name': 'Radioactivity, Nuclear fission & fusion'},
              {'id': 1045, 'name': 'p-n junction diodes, Rectifiers & Logic gates'},
            ],
          },
        ],
      },
      {
        'id': 2,
        'name': 'Chemistry',
        'icon': '🧪',
        'chapters': [
          {
            'id': 201,
            'name': 'Some Basic Concepts of Chemistry',
            'topics': [
              {'id': 2001, 'name': 'Mole concept & Molar masses'},
              {'id': 2002, 'name': 'Stoichiometry & Limiting reagent'},
              {'id': 2003, 'name': 'Empirical & Molecular formula'},
            ],
          },
          {
            'id': 202,
            'name': 'Structure of Atom',
            'topics': [
              {'id': 2004, 'name': 'Bohr model & Quantum numbers'},
              {'id': 2005, 'name': 'Electronic configurations & Orbitals'},
            ],
          },
          {
            'id': 203,
            'name': 'Chemical Bonding & Molecular Structure',
            'topics': [
              {'id': 2006, 'name': 'VSEPR theory & Hybridization'},
              {'id': 2007, 'name': 'Molecular orbital theory (MOT)'},
              {'id': 2008, 'name': 'Dipole moment & Hydrogen bonding'},
            ],
          },
          {
            'id': 204,
            'name': 'Chemical Thermodynamics',
            'topics': [
              {'id': 2009, 'name': 'Enthalpy, Entropy & Gibbs free energy'},
              {'id': 2010, 'name': "Hess's law & Spontaneity criteria"},
            ],
          },
          {
            'id': 205,
            'name': 'Equilibrium (Chemical & Ionic)',
            'topics': [
              {'id': 2011, 'name': 'Equilibrium constants (Kp, Kc) & Le Chatelier'},
              {'id': 2012, 'name': 'pH, Buffer solutions & Henderson equation'},
              {'id': 2013, 'name': 'Solubility product (Ksp) & Common ion effect'},
            ],
          },
          {
            'id': 206,
            'name': 'Redox Reactions & Electrochemistry',
            'topics': [
              {'id': 2014, 'name': 'Nernst equation & Electrochemical cells'},
              {'id': 2015, 'name': "Kohlrausch's law & Electrolytic conductance"},
            ],
          },
          {
            'id': 207,
            'name': 'Solutions',
            'topics': [
              {'id': 2016, 'name': "Raoult's law & Colligative properties"},
              {'id': 2017, 'name': "van 't Hoff factor & Abnormal molar mass"},
            ],
          },
          {
            'id': 208,
            'name': 'Chemical Kinetics',
            'topics': [
              {'id': 2018, 'name': 'Rate law, Order & Molecularity of reaction'},
              {'id': 2019, 'name': 'Arrhenius equation & Activation energy'},
            ],
          },
          {
            'id': 209,
            'name': 'Coordination Compounds',
            'topics': [
              {'id': 2020, 'name': 'IUPAC nomenclature of complex compounds'},
              {'id': 2021, 'name': 'Werner theory, CFT & Isomerism'},
            ],
          },
          {
            'id': 210,
            'name': 'Organic Chemistry: Basic Principles & Techniques',
            'topics': [
              {'id': 2022, 'name': 'IUPAC nomenclature & Isomerism'},
              {'id': 2023, 'name': 'Inductive, Electromeric & Hyperconjugation effects'},
              {'id': 2024, 'name': 'Carbocations, Free radicals & Intermediates'},
            ],
          },
          {
            'id': 211,
            'name': 'Hydrocarbons',
            'topics': [
              {'id': 2025, 'name': 'Alkanes, Alkenes & Markownikoff addition'},
              {'id': 2026, 'name': 'Aromatic hydrocarbons & Electrophilic substitution'},
            ],
          },
          {
            'id': 212,
            'name': 'Organic Functional Groups (Haloalkanes to Amines)',
            'topics': [
              {'id': 2027, 'name': 'SN1 & SN2 reaction mechanisms'},
              {'id': 2028, 'name': 'Alcohols, Phenols & Ethers'},
              {'id': 2029, 'name': 'Aldehydes & Ketones (Aldol, Cannizzaro)'},
              {'id': 2030, 'name': 'Carboxylic acids & Amines (Diazonium)'},
            ],
          },
          {
            'id': 213,
            'name': 'Biomolecules',
            'topics': [
              {'id': 2031, 'name': 'Carbohydrates & Glucose structures'},
              {'id': 2032, 'name': 'Proteins, Amino acids & Nucleic acids'},
            ],
          },
        ],
      },
      {
        'id': 3,
        'name': 'Biology',
        'icon': '🧬',
        'chapters': [
          {
            'id': 301,
            'name': 'The Living World & Biological Classification',
            'topics': [
              {'id': 3001, 'name': 'Taxonomy, Binomial nomenclature & Keys'},
              {'id': 3002, 'name': 'Five Kingdom system: Monera, Protista, Fungi'},
              {'id': 3003, 'name': 'Viruses, Viroids & Prions'},
            ],
          },
          {
            'id': 302,
            'name': 'Plant Kingdom & Animal Kingdom',
            'topics': [
              {'id': 3004, 'name': 'Algae, Bryophytes, Pteridophytes & Gymnosperms'},
              {'id': 3005, 'name': 'Non-chordates (Porifera to Echinodermata)'},
              {'id': 3006, 'name': 'Chordates classification & Characteristics'},
            ],
          },
          {
            'id': 303,
            'name': 'Morphology & Anatomy of Flowering Plants',
            'topics': [
              {'id': 3007, 'name': 'Root, Stem & Leaf modifications'},
              {'id': 3008, 'name': 'Inflorescence, Flower structure & Fruits'},
              {'id': 3009, 'name': 'Meristematic & Permanent tissues, Secondary growth'},
            ],
          },
          {
            'id': 304,
            'name': 'Cell: The Unit of Life & Cell Cycle',
            'topics': [
              {'id': 3010, 'name': 'Prokaryotic vs Eukaryotic cells & Organelles'},
              {'id': 3011, 'name': 'Plasma membrane, Endomembrane & Mitochondria'},
              {'id': 3012, 'name': 'Mitosis, Meiosis stages & Significance'},
            ],
          },
          {
            'id': 305,
            'name': 'Plant Physiology',
            'topics': [
              {'id': 3013, 'name': 'Photosynthesis: Light & Dark reactions (C3, C4)'},
              {'id': 3014, 'name': 'Respiration: Glycolysis, Krebs cycle & ETS'},
              {'id': 3015, 'name': 'Plant growth regulators: Auxins, Gibberellins'},
            ],
          },
          {
            'id': 306,
            'name': 'Human Physiology',
            'topics': [
              {'id': 3016, 'name': 'Breathing & Exchange of gases'},
              {'id': 3017, 'name': 'Body fluids, Cardiac cycle & ECG'},
              {'id': 3018, 'name': 'Excretory products & Nephron function'},
              {'id': 3019, 'name': 'Locomotion: Muscle contraction & Skeleton'},
              {'id': 3020, 'name': 'Neural control & Coordination (Eye, Ear)'},
              {'id': 3021, 'name': 'Chemical coordination: Endocrine glands'},
            ],
          },
          {
            'id': 307,
            'name': 'Reproduction (Plants & Humans)',
            'topics': [
              {'id': 3022, 'name': 'Microsporogenesis, Megasporogenesis & Pollination'},
              {'id': 3023, 'name': 'Double fertilization & Endosperm development'},
              {'id': 3024, 'name': 'Male & Female reproductive systems'},
              {'id': 3025, 'name': 'Menstrual cycle & Fertilization'},
              {'id': 3026, 'name': 'Reproductive health, Contraception & ART'},
            ],
          },
          {
            'id': 308,
            'name': 'Genetics & Molecular Basis of Inheritance',
            'topics': [
              {'id': 3027, 'name': "Mendelian inheritance & Linkage"},
              {'id': 3028, 'name': 'Sex determination & Genetic disorders'},
              {'id': 3029, 'name': 'DNA structure, Replication & Central Dogma'},
              {'id': 3030, 'name': 'Transcription, Genetic code & Translation'},
              {'id': 3031, 'name': 'Lac operon regulation & HGP'},
            ],
          },
          {
            'id': 309,
            'name': 'Evolution',
            'topics': [
              {'id': 3032, 'name': 'Origin of life, Homology & Analogy'},
              {'id': 3033, 'name': 'Darwinian natural selection & Hardy-Weinberg'},
            ],
          },
          {
            'id': 310,
            'name': 'Biotechnology: Principles & Applications',
            'topics': [
              {'id': 3034, 'name': 'Restriction enzymes & Cloning vectors'},
              {'id': 3035, 'name': 'Polymerase chain reaction (PCR) & Bioreactors'},
              {'id': 3036, 'name': 'Bt crops, Gene therapy & Transgenic animals'},
            ],
          },
          {
            'id': 311,
            'name': 'Ecology & Environment',
            'topics': [
              {'id': 3037, 'name': 'Organism & Population interactions'},
              {'id': 3038, 'name': 'Ecosystems: Food chains & Energy pyramids'},
              {'id': 3039, 'name': 'Biodiversity conservation (In-situ & Ex-situ)'},
            ],
          },
        ],
      },
    ];
  }
}

import 'package:flutter/material.dart';
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
  final Set<String> _selectedSubjects = {'physics', 'chemistry', 'biology'};
  final Set<String> _selectedChapters = {};
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

  void _toggleSubject(String subject) {
    NeetTokens.hapticSelection();
    setState(() {
      if (_selectedSubjects.contains(subject)) {
        if (_selectedSubjects.length > 1) {
          _selectedSubjects.remove(subject);
        }
      } else {
        _selectedSubjects.add(subject);
      }
      _selectedChapters.clear();
    });
  }

  void _toggleChapter(String chapterId) {
    NeetTokens.hapticSelection();
    setState(() {
      if (_selectedChapters.contains(chapterId)) {
        _selectedChapters.remove(chapterId);
      } else {
        _selectedChapters.add(chapterId);
      }
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
        subjects: _selectedChapters.isNotEmpty ? null : _selectedSubjects.toList(),
        chapters: _selectedChapters.isNotEmpty ? _selectedChapters.toList() : null,
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
    } catch (e) {
      if (mounted) {
        setState(() {
          _isGenerating = false;
          _errorMessage = 'Network error: please check connection and try again.';
        });
      }
    }
  }

  String _getTestTitle() {
    switch (_testType) {
      case 'mock':
        return 'NEET Full Mock Test (180 Qs)';
      case 'adaptive':
        return 'AI Adaptive Practice Test';
      case 'ai_generated':
        return 'AI-Generated Practice Test';
      case 'yearly_pyq':
        return 'NEET $_selectedYear Official Paper';
      case 'pyq':
        return 'Past Year Question Practice';
      default:
        return 'NEET Custom Test';
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
                const Text(
                  'SUBJECTS',
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
                    Expanded(child: _buildSubjectCard('Physics', 'physics', '⚡', NeetTokens.physicsColor)),
                    const SizedBox(width: 10),
                    Expanded(child: _buildSubjectCard('Chemistry', 'chemistry', '🧪', NeetTokens.chemistryColor)),
                    const SizedBox(width: 10),
                    Expanded(child: _buildSubjectCard('Biology', 'biology', '🧬', NeetTokens.biologyColor)),
                  ],
                ),
                const SizedBox(height: 24),
              ],

              // Section 4: Chapters (Optional filtering)
              if (_testType != 'yearly_pyq' && _testType != 'mock' && _syllabus.isNotEmpty) ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'CHAPTERS (OPTIONAL)',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: NeetTokens.textMuted,
                        letterSpacing: 1.1,
                      ),
                    ),
                    if (_selectedChapters.isNotEmpty)
                      GestureDetector(
                        onTap: () => setState(() => _selectedChapters.clear()),
                        child: const Text('Clear All', style: TextStyle(fontSize: 12, color: NeetTokens.accentPrimary, fontWeight: FontWeight.w700)),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                _buildChapterSelector(),
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
                    Expanded(child: _buildDifficultyChip('All Difficulties', 'all')),
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

              // Section 6: Question Count
              if (_testType != 'mock' && _testType != 'yearly_pyq') ...[
                const Text(
                  'QUESTION COUNT',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: NeetTokens.textMuted,
                    letterSpacing: 1.1,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [10, 20, 30, 45, 90].map((count) {
                    final isSelected = _questionCount == count;
                    return Expanded(
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        child: InkWell(
                          onTap: () {
                            NeetTokens.hapticSelection();
                            setState(() => _questionCount = count);
                          },
                          borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 12),
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
                              '$count Qs',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                color: isSelected ? NeetTokens.accentPrimary : NeetTokens.textSecondary,
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
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
                                  ? 'Start Full Mock (180 Qs • 3 Hrs) →'
                                  : 'Start Test ($_questionCount Qs • ${_questionCount * 1.5.round()} Mins) →',
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

  Widget _buildTypeGrid() {
    final types = [
      {'id': 'custom', 'name': 'Custom Test', 'desc': 'Select your own settings', 'icon': Icons.tune_rounded, 'color': NeetTokens.accentPrimary},
      {'id': 'adaptive', 'name': 'Adaptive Practice', 'desc': 'AI adjusts difficulty', 'icon': Icons.psychology_outlined, 'color': NeetTokens.accentSecondary},
      {'id': 'ai_generated', 'name': 'AI Generated', 'desc': 'Fresh novel questions', 'icon': Icons.bolt, 'color': NeetTokens.physicsColor},
      {'id': 'pyq', 'name': 'Chapter PYQ', 'desc': 'Past questions by topic', 'icon': Icons.auto_stories_outlined, 'color': NeetTokens.chemistryColor},
      {'id': 'yearly_pyq', 'name': 'Year-wise PYQ', 'desc': 'Complete official papers', 'icon': Icons.calendar_today_outlined, 'color': NeetTokens.biologyColor},
      {'id': 'mock', 'name': 'Full Mock Test', 'desc': '180 Qs • 720 marks', 'icon': Icons.timer_outlined, 'color': NeetTokens.warning},
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
              _selectedChapters.clear();
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

  Widget _buildSubjectCard(String title, String id, String emoji, Color color) {
    final isSelected = _selectedSubjects.contains(id);
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

  Widget _buildChapterSelector() {
    // Gather chapters matching selected subjects
    final matchingSubjects = _syllabus.where((s) => _selectedSubjects.contains(s['id']?.toString().toLowerCase())).toList();
    final List<dynamic> chapters = [];
    for (var s in matchingSubjects) {
      if (s['chapters'] is List) {
        chapters.addAll(s['chapters']);
      }
    }

    if (_isLoadingSyllabus) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: NeetTokens.bgSecondary,
          borderRadius: BorderRadius.circular(8),
        ),
        alignment: Alignment.center,
        child: const SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(strokeWidth: 2, color: NeetTokens.accentPrimary),
        ),
      );
    }

    if (chapters.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: NeetTokens.bgSecondary,
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Text('All chapters included for chosen subjects.', style: TextStyle(fontSize: 12, color: NeetTokens.textMuted)),
      );
    }

    return Container(
      constraints: const BoxConstraints(maxHeight: 180),
      decoration: BoxDecoration(
        color: NeetTokens.bgSecondary,
        borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
        border: Border.all(color: NeetTokens.border),
      ),
      child: ListView.separated(
        shrinkWrap: true,
        padding: const EdgeInsets.all(8),
        itemCount: chapters.length,
        separatorBuilder: (context, index) => Divider(color: NeetTokens.border.withValues(alpha: 0.4), height: 1),
        itemBuilder: (context, idx) {
          final ch = chapters[idx];
          final chId = ch['id']?.toString() ?? '';
          final chName = ch['name']?.toString() ?? 'Chapter';
          final isSelected = _selectedChapters.contains(chId);

          return CheckboxListTile(
            dense: true,
            value: isSelected,
            onChanged: (_) => _toggleChapter(chId),
            title: Text(chName, style: TextStyle(fontSize: 13, color: isSelected ? NeetTokens.accentPrimary : NeetTokens.textPrimary)),
            activeColor: NeetTokens.accentPrimary,
            contentPadding: const EdgeInsets.symmetric(horizontal: 8),
          );
        },
      ),
    );
  }
}

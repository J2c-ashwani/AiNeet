import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';
import '../../../core/cache/offline_cache.dart';
import '../../practice/presentation/test_configure_screen.dart';

class NativeBlueprintScreen extends StatefulWidget {
  const NativeBlueprintScreen({super.key});

  @override
  State<NativeBlueprintScreen> createState() => _NativeBlueprintScreenState();
}

class _NativeBlueprintScreenState extends State<NativeBlueprintScreen> {
  final NeetApiClient _apiClient = NeetApiClient();
  bool _isLoading = true;
  String _selectedSubject = 'biology';
  Map<String, dynamic>? _rawBlueprintData;
  List<String> _years = [];

  final List<Map<String, String>> _subjects = [
    {'id': 'biology', 'label': 'Biology', 'icon': '🧬'},
    {'id': 'physics', 'label': 'Physics', 'icon': '⚡'},
    {'id': 'chemistry', 'label': 'Chemistry', 'icon': '🧪'},
  ];

  @override
  void initState() {
    super.initState();
    _loadCachedBlueprint();
    _loadBlueprint();
  }

  Future<void> _loadCachedBlueprint() async {
    final cached = await OfflineCacheService.getCachedUserData('blueprint_chapter');
    if (cached is Map<String, dynamic> && mounted) {
      _applyBlueprintData(cached);
    }
  }

  void _applyBlueprintData(Map<String, dynamic> data) {
    _rawBlueprintData = data['data'] as Map<String, dynamic>?;
    if (data['years'] is List) {
      _years = (data['years'] as List).map((e) => e.toString()).toList();
    }
  }

  Future<void> _loadBlueprint() async {
    try {
      final res = await _apiClient.getBlueprint(viewType: 'chapter');
      if (mounted) {
        setState(() {
          _isLoading = false;
          if (res.data != null && res.data is Map<String, dynamic>) {
            _applyBlueprintData(res.data as Map<String, dynamic>);
          }
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  List<Map<String, dynamic>> _getProcessedChapters() {
    final subjectData = _rawBlueprintData?[_selectedSubject];
    if (subjectData is! Map) {
      return _getFallbackChapters(_selectedSubject);
    }

    final List<Map<String, dynamic>> result = [];
    final totalYearsCount = _years.isNotEmpty ? _years.length : 16;

    subjectData.forEach((chapterName, yearData) {
      if (yearData is Map) {
        int total = 0;
        final Map<String, int> recentYears = {};

        yearData.forEach((year, count) {
          final c = (count is num) ? count.toInt() : int.tryParse(count.toString()) ?? 0;
          total += c;
          final yStr = year.toString();
          if (yStr.contains('2024') || yStr.contains('2023') || yStr.contains('2022') || yStr.contains('2025')) {
            recentYears[yStr] = c;
          }
        });

        final avg = total / totalYearsCount;
        result.add({
          'chapter': chapterName.toString(),
          'total': total,
          'avg': avg,
          'recentYears': recentYears,
          'priority': avg >= 3.0
              ? 'High Weightage'
              : avg >= 1.5
                  ? 'Medium Weightage'
                  : 'Foundational',
        });
      }
    });

    result.sort((a, b) => (b['total'] as int).compareTo(a['total'] as int));
    return result.isNotEmpty ? result : _getFallbackChapters(_selectedSubject);
  }

  List<Map<String, dynamic>> _getFallbackChapters(String subject) {
    if (subject == 'physics') {
      return [
        {'chapter': 'Current Electricity & Circuits', 'total': 48, 'avg': 3.2, 'priority': 'High Weightage'},
        {'chapter': 'Optics & Wave Optics', 'total': 42, 'avg': 2.8, 'priority': 'High Weightage'},
        {'chapter': 'System of Particles & Rotational Motion', 'total': 38, 'avg': 2.5, 'priority': 'High Weightage'},
        {'chapter': 'Thermodynamics & Kinetic Theory', 'total': 34, 'avg': 2.3, 'priority': 'Medium Weightage'},
        {'chapter': 'Semiconductor Electronics & Devices', 'total': 32, 'avg': 2.1, 'priority': 'Medium Weightage'},
      ];
    } else if (subject == 'chemistry') {
      return [
        {'chapter': 'Coordination Compounds & Bonding', 'total': 44, 'avg': 2.9, 'priority': 'High Weightage'},
        {'chapter': 'Hydrocarbons & Reaction Mechanisms', 'total': 42, 'avg': 2.8, 'priority': 'High Weightage'},
        {'chapter': 'Chemical Bonding & Molecular Structure', 'total': 40, 'avg': 2.7, 'priority': 'High Weightage'},
        {'chapter': 'Electrochemistry & Solutions', 'total': 36, 'avg': 2.4, 'priority': 'Medium Weightage'},
        {'chapter': 'Aldehydes, Ketones & Carboxylic Acids', 'total': 35, 'avg': 2.3, 'priority': 'Medium Weightage'},
      ];
    } else {
      return [
        {'chapter': 'Genetics & Molecular Basis of Inheritance', 'total': 92, 'avg': 6.1, 'priority': 'High Weightage'},
        {'chapter': 'Human Physiology & Organ Systems', 'total': 86, 'avg': 5.7, 'priority': 'High Weightage'},
        {'chapter': 'Biotechnology: Principles & Applications', 'total': 64, 'avg': 4.2, 'priority': 'High Weightage'},
        {'chapter': 'Ecology & Biodiversity Conservation', 'total': 58, 'avg': 3.9, 'priority': 'High Weightage'},
        {'chapter': 'Cell: The Unit of Life & Cell Cycle', 'total': 54, 'avg': 3.6, 'priority': 'High Weightage'},
      ];
    }
  }

  Color _getSubjectColor(String subject) {
    switch (subject.toLowerCase()) {
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
    final chapters = _getProcessedChapters();
    final activeColor = _getSubjectColor(_selectedSubject);

    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        title: Text(
          'NEET Weightage Blueprint',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: NeetTokens.textPrimary,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Subject Filter Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: NeetTokens.bgSecondary,
              child: Row(
                children: _subjects.map((s) {
                  final isSelected = _selectedSubject == s['id'];
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: GestureDetector(
                        onTap: () {
                          NeetTokens.hapticSelection();
                          setState(() => _selectedSubject = s['id']!);
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? _getSubjectColor(s['id']!).withValues(alpha: 0.15) : NeetTokens.bgTertiary,
                            borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                            border: Border.all(
                              color: isSelected ? _getSubjectColor(s['id']!) : NeetTokens.border,
                              width: isSelected ? 1.5 : 1.0,
                            ),
                          ),
                          child: Center(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(s['icon']!, style: const TextStyle(fontSize: 14)),
                                const SizedBox(width: 6),
                                Text(
                                  s['label']!,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                    color: isSelected ? NeetTokens.textPrimary : NeetTokens.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            // Blueprint Header Stats
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: NeetTokens.border)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${chapters.length} Chapters Analyzed (2009-2025)',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: NeetTokens.textMuted),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: activeColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'Ranked by PYQ Yield',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: activeColor),
                    ),
                  ),
                ],
              ),
            ),

            // Chapters List
            Expanded(
              child: RefreshIndicator(
                onRefresh: _loadBlueprint,
                color: activeColor,
                child: _isLoading && chapters.isEmpty
                    ? Center(child: CircularProgressIndicator(color: activeColor))
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: chapters.length,
                        itemBuilder: (context, idx) {
                          final c = chapters[idx];
                          return _buildChapterCard(c, idx + 1, activeColor);
                        },
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChapterCard(Map<String, dynamic> c, int rank, Color accentColor) {
    final chapter = c['chapter'] as String;
    final total = c['total'] as int? ?? 0;
    final avg = (c['avg'] as num? ?? 0.0).toStringAsFixed(1);
    final priority = c['priority'] as String? ?? 'High Weightage';
    final recentYears = c['recentYears'] as Map<String, int>? ?? {};

    final isHigh = priority == 'High Weightage';
    final priorityColor = isHigh ? NeetTokens.error : (priority == 'Medium Weightage' ? NeetTokens.warning : NeetTokens.accentPrimary);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: NeetTokens.bgSecondary,
        borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
        border: Border.all(color: isHigh ? priorityColor.withValues(alpha: 0.3) : NeetTokens.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: NeetTokens.bgTertiary,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Center(
                  child: Text(
                    '#$rank',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: NeetTokens.textMuted),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      chapter,
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: NeetTokens.textPrimary),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: priorityColor.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            priority,
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: priorityColor),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '~$avg Qs/yr ($total total PYQs)',
                          style: TextStyle(fontSize: 11, color: NeetTokens.textMuted),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),

          if (recentYears.isNotEmpty) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: NeetTokens.bgTertiary,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: recentYears.entries.map((e) {
                  return Text(
                    '${e.key}: ${e.value} Qs',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: NeetTokens.textSecondary),
                  );
                }).toList(),
              ),
            ),
          ],

          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 36,
            child: OutlinedButton.icon(
              onPressed: () {
                NeetTokens.hapticSelection();
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => NativeTestConfigureScreen(
                      initialType: 'custom',
                      initialTopic: chapter,
                    ),
                  ),
                );
              },
              icon: Icon(Icons.play_arrow_rounded, size: 18, color: accentColor),
              label: Text(
                'Practice PYQs for this Chapter',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: accentColor),
              ),
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: accentColor.withValues(alpha: 0.4)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusSm)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

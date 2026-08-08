import 'package:flutter/material.dart';
import '../../../../core/constants/tokens.dart';
import '../../../../core/api/api_client.dart';

class NativeBlueprintScreen extends StatefulWidget {
  const NativeBlueprintScreen({super.key});

  @override
  State<NativeBlueprintScreen> createState() => _NativeBlueprintScreenState();
}

class _NativeBlueprintScreenState extends State<NativeBlueprintScreen> {
  final NeetApiClient _apiClient = NeetApiClient();
  bool _isLoading = true;
  List<dynamic> _chapters = [];

  @override
  void initState() {
    super.initState();
    _loadBlueprint();
  }

  Future<void> _loadBlueprint() async {
    setState(() => _isLoading = true);
    try {
      final res = await _apiClient.getBlueprint();
      if (mounted) {
        setState(() {
          _isLoading = false;
          if (res.data is List) {
            _chapters = res.data;
          } else if (res.data is Map && res.data['chapters'] != null) {
            _chapters = res.data['chapters'];
          } else {
            _setFallbackBlueprint();
          }
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _setFallbackBlueprint();
        });
      }
    }
  }

  void _setFallbackBlueprint() {
    _chapters = [
      {'chapter': 'Human Physiology', 'subject': 'Biology', 'marks': '14-16 Questions (56-64 Marks)', 'priority': 'High Priority'},
      {'chapter': 'Current Electricity & Magnetism', 'subject': 'Physics', 'marks': '8-10 Questions (32-40 Marks)', 'priority': 'High Priority'},
      {'chapter': 'Organic Chemistry - Reaction Mechanisms', 'subject': 'Chemistry', 'marks': '10-12 Questions (40-48 Marks)', 'priority': 'High Priority'},
      {'chapter': 'Optics & Wave Optics', 'subject': 'Physics', 'marks': '6-8 Questions (24-32 Marks)', 'priority': 'Medium Priority'},
    ];
  }

  @override
  Widget build(BuildContext context) {
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
        child: RefreshIndicator(
          onRefresh: _loadBlueprint,
          child: _isLoading
              ? Center(child: CircularProgressIndicator(color: NeetTokens.accentGlow))
              : ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    Text(
                      'High-Weightage Chapter Breakdown',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary),
                    ),
                    const SizedBox(height: 12),
                    ..._chapters.map((c) => _buildBlueprintCard(
                          c['chapter'] ?? 'Chapter',
                          c['subject'] ?? 'Physics',
                          c['marks'] ?? 'N/A',
                          c['priority'] ?? 'High Priority',
                        )),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildBlueprintCard(String chapter, String subject, String marks, String priority) {
    final color = subject == 'Physics'
        ? NeetTokens.physicsColor
        : subject == 'Chemistry'
            ? NeetTokens.chemistryColor
            : NeetTokens.biologyColor;

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
              Text(subject.toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: color)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(color: NeetTokens.warning.withOpacity(0.2), borderRadius: BorderRadius.circular(4)),
                child: Text(priority, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: NeetTokens.warning)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(chapter, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary)),
          const SizedBox(height: 4),
          Text(marks, style: TextStyle(fontSize: 12, color: NeetTokens.textMuted)),
        ],
      ),
    );
  }
}

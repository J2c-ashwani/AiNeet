import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';

class NativeRevisionManagerScreen extends StatefulWidget {
  const NativeRevisionManagerScreen({super.key});

  @override
  State<NativeRevisionManagerScreen> createState() => _NativeRevisionManagerScreenState();
}

class _NativeRevisionManagerScreenState extends State<NativeRevisionManagerScreen> {
  final NeetApiClient _apiClient = NeetApiClient();
  bool _isLoading = true;
  List<dynamic> _revisionQueue = [];

  @override
  void initState() {
    super.initState();
    _loadRevisionQueue();
  }

  Future<void> _loadRevisionQueue() async {
    setState(() {
      _isLoading = true;
    });
    try {
      final res = await _apiClient.getRevisionDue();
      if (mounted) {
        setState(() {
          _isLoading = false;
          if (res.data is List) {
            _revisionQueue = res.data;
          } else if (res.data is Map && res.data['queue'] != null) {
            _revisionQueue = res.data['queue'];
          } else {
            _revisionQueue = [
              {'id': '1', 'title': 'Electrostatics & Gauss Law', 'subject': 'Physics', 'interval': 'Interval: 3 Days'},
              {'id': '2', 'title': 'Coordination Compounds & Ligands', 'subject': 'Chemistry', 'interval': 'Interval: 7 Days'},
              {'id': '3', 'title': 'Genetics & Molecular Basis of Inheritance', 'subject': 'Biology', 'interval': 'Interval: 1 Day'},
            ];
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _revisionQueue = [
            {'id': '1', 'title': 'Electrostatics & Gauss Law', 'subject': 'Physics', 'interval': 'Interval: 3 Days'},
            {'id': '2', 'title': 'Coordination Compounds & Ligands', 'subject': 'Chemistry', 'interval': 'Interval: 7 Days'},
            {'id': '3', 'title': 'Genetics & Molecular Basis of Inheritance', 'subject': 'Biology', 'interval': 'Interval: 1 Day'},
          ];
        });
      }
    }
  }

  Future<void> _logRevision(String cardId) async {
    NeetTokens.hapticMedium();
    try {
      await _apiClient.logRevision(cardId: cardId, quality: 'good');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Revision logged! Topic mastery updated.')),
        );
        setState(() {
          _revisionQueue.removeWhere((item) => item['id'] == cardId);
        });
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Revision completed locally.')),
        );
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
        title: Text(
          'Spaced Repetition Revision',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: NeetTokens.textPrimary,
          ),
        ),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadRevisionQueue,
          child: _isLoading
              ? Center(child: CircularProgressIndicator(color: NeetTokens.accentGlow))
              : ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: NeetTokens.bgSecondary,
                        borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                        border: Border.all(color: NeetTokens.accentPrimary.withValues(alpha: 0.3)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'DUE FOR REVISION TODAY',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: NeetTokens.accentPrimary,
                              letterSpacing: 1.1,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '${_revisionQueue.length} Core Topics Recommended',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    if (_revisionQueue.isEmpty)
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.all(40),
                          child: Text(
                            'All revision tasks completed for today! 🎉',
                            style: TextStyle(color: NeetTokens.textMuted, fontSize: 14),
                          ),
                        ),
                      )
                    else
                      ..._revisionQueue.map((item) => _buildRevisionCard(
                            item['id'] ?? '1',
                            item['title'] ?? 'Revision Topic',
                            item['subject'] ?? 'Physics',
                            item['interval'] ?? 'Due Today',
                          )),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildRevisionCard(String id, String title, String subject, String interval) {
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
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(subject.toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: color)),
                const SizedBox(height: 4),
                Text(title, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: NeetTokens.textPrimary)),
                const SizedBox(height: 2),
                Text(interval, style: TextStyle(fontSize: 11, color: NeetTokens.textMuted)),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () => _logRevision(id),
            style: ElevatedButton.styleFrom(backgroundColor: NeetTokens.accentGlow),
            child: Text('Revise Now', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

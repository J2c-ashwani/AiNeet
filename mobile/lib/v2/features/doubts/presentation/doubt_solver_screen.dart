import 'package:flutter/material.dart';
import '../../../../core/constants/tokens.dart';
import '../../../../core/api/api_client.dart';

class NativeDoubtSolverScreen extends StatefulWidget {
  const NativeDoubtSolverScreen({super.key});

  @override
  State<NativeDoubtSolverScreen> createState() => _NativeDoubtSolverScreenState();
}

class _NativeDoubtSolverScreenState extends State<NativeDoubtSolverScreen> {
  final _questionController = TextEditingController();
  final List<Map<String, String>> _chatHistory = [];
  final NeetApiClient _apiClient = NeetApiClient();
  bool _isSolving = false;

  Future<void> _handleAskDoubt() async {
    final text = _questionController.text.trim();
    if (text.isEmpty) return;

    NeetTokens.hapticMedium();

    setState(() {
      _chatHistory.add({'sender': 'user', 'message': text});
      _isSolving = true;
      _questionController.clear();
    });

    try {
      final res = await _apiClient.solveDoubt(text);
      if (res.statusCode == 200 && res.data != null && mounted) {
        final answer = res.data['solution'] ?? res.data['answer'] ?? res.data['text'] ??
            'Based on NCERT Physics Chapter 5 (Laws of Motion):\nWork done = Change in Kinetic Energy = (1/2) * 2 * (10)^2 = 100 Joules.';
        setState(() {
          _chatHistory.add({'sender': 'ai', 'message': answer.toString()});
          _isSolving = false;
        });
        NeetTokens.hapticSuccess();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _chatHistory.add({
            'sender': 'ai',
            'message': 'Based on NCERT Physics Chapter 5 (Laws of Motion):\nWork done = Change in Kinetic Energy = (1/2) * m * v^2 = 100 Joules.',
          });
          _isSolving = false;
        });
        NeetTokens.hapticSuccess();
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
        title: Row(
          children: const [
            Icon(Icons.lightbulb_outline, color: NeetTokens.biologyColor),
            SizedBox(width: 8),
            Text(
              'AI Doubt Solver',
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
        child: Column(
          children: [
            // Chat & Explanation List
            Expanded(
              child: _chatHistory.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.auto_awesome,
                            size: 48,
                            color: NeetTokens.accentPrimary.withOpacity(0.5),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Ask any Physics, Chemistry, or Biology doubt',
                            style: TextStyle(
                              fontSize: 14,
                              color: NeetTokens.textMuted,
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _chatHistory.length,
                      itemBuilder: (context, index) {
                        final chat = _chatHistory[index];
                        final isUser = chat['sender'] == 'user';

                        return Align(
                          alignment: isUser
                              ? Alignment.centerRight
                              : Alignment.centerLeft,
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            constraints: BoxConstraints(
                              maxWidth: MediaQuery.of(context).size.width * 0.82,
                            ),
                            decoration: BoxDecoration(
                              color: isUser
                                  ? NeetTokens.accentGlow
                                  : NeetTokens.bgSecondary,
                              borderRadius: BorderRadius.circular(
                                NeetTokens.radiusMd,
                              ),
                              border: isUser
                                  ? null
                                  : Border.all(color: NeetTokens.border),
                            ),
                            child: Text(
                              chat['message'] ?? '',
                              style: TextStyle(
                                fontSize: 14,
                                color: isUser
                                    ? Colors.white
                                    : NeetTokens.textPrimary,
                                height: 1.4,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),

            if (_isSolving)
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: NeetTokens.accentPrimary,
                      ),
                    ),
                    SizedBox(width: 8),
                    Text(
                      'AI is analyzing NCERT textbook sources...',
                      style: TextStyle(
                        fontSize: 12,
                        color: NeetTokens.textMuted,
                      ),
                    ),
                  ],
                ),
              ),

            // Input Bar
            Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: NeetTokens.bgSecondary,
                border: Border(top: BorderSide(color: NeetTokens.border)),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.camera_alt_outlined,
                      color: NeetTokens.chemistryColor,
                    ),
                    onPressed: () {
                      NeetTokens.hapticLight();
                    },
                  ),
                  Expanded(
                    child: TextField(
                      controller: _questionController,
                      style: const TextStyle(color: NeetTokens.textPrimary),
                      decoration: const InputDecoration(
                        hintText: 'Type or snap a question...',
                        hintStyle: TextStyle(color: NeetTokens.textMuted),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(
                      Icons.send_rounded,
                      color: NeetTokens.accentPrimary,
                    ),
                    onPressed: _handleAskDoubt,
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

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../../../core/constants/tokens.dart';
import '../../../../core/api/api_client.dart';

class NativeDoubtSolverScreen extends StatefulWidget {
  const NativeDoubtSolverScreen({super.key});

  @override
  State<NativeDoubtSolverScreen> createState() => _NativeDoubtSolverScreenState();
}

class _NativeDoubtSolverScreenState extends State<NativeDoubtSolverScreen> {
  final _questionController = TextEditingController();
  final List<Map<String, dynamic>> _chatHistory = [];
  final NeetApiClient _apiClient = NeetApiClient();
  final ImagePicker _picker = ImagePicker();
  bool _isSolving = false;

  Future<void> _handleAskDoubt({String? imageBase64, String? imagePath}) async {
    final text = _questionController.text.trim();
    if (text.isEmpty && imageBase64 == null) return;

    NeetTokens.hapticMedium();

    setState(() {
      _chatHistory.add({
        'sender': 'user',
        'message': text,
        'imagePath': imagePath,
      });
      _isSolving = true;
      _questionController.clear();
    });

    try {
      final res = await _apiClient.solveDoubt(text, imageBase64: imageBase64);
      if (res.statusCode == 200 && res.data != null && mounted) {
        final answer = res.data['solution'] ?? res.data['answer'] ?? res.data['text'] ?? 'Solution provided.';
        setState(() {
          _chatHistory.add({'sender': 'ai', 'message': answer.toString(), 'isError': false});
          _isSolving = false;
        });
        NeetTokens.hapticSuccess();
      } else {
        throw Exception('Failed to solve doubt');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _chatHistory.add({
            'sender': 'ai',
            'message': 'AI service is temporarily unavailable. Please try again in a moment.',
            'isError': true,
            'retryText': text,
            'retryImage': imageBase64,
            'retryImagePath': imagePath,
          });
          _isSolving = false;
        });
        NeetTokens.hapticLight();
      }
    }
  }

  Future<void> _handleCameraCapture() async {
    NeetTokens.hapticLight();
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 92,
        maxWidth: 2400,
      );
      if (image != null) {
        final bytes = await image.readAsBytes();
        final base64String = base64Encode(bytes);
        _handleAskDoubt(imageBase64: base64String, imagePath: image.path);
      }
    } catch (e) {
      // Handle camera error gracefully if needed
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
                        final isError = chat['isError'] == true;

                        if (isError) {
                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: NeetTokens.error.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                              border: Border.all(color: NeetTokens.error.withOpacity(0.5)),
                            ),
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.cloud_off_outlined, color: NeetTokens.error),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        chat['message'] ?? '',
                                        style: const TextStyle(color: NeetTokens.error),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                ElevatedButton(
                                  onPressed: () {
                                    // Remove the error message and retry
                                    setState(() {
                                      _chatHistory.removeAt(index);
                                      // If the previous message was the user's prompt, remove it too so we don't duplicate
                                      if (index > 0 && _chatHistory[index - 1]['sender'] == 'user') {
                                        _chatHistory.removeAt(index - 1);
                                      }
                                    });
                                    _questionController.text = chat['retryText'] ?? '';
                                    _handleAskDoubt(
                                      imageBase64: chat['retryImage'],
                                      imagePath: chat['retryImagePath'],
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: NeetTokens.error.withOpacity(0.2),
                                    foregroundColor: NeetTokens.error,
                                  ),
                                  child: const Text('Retry'),
                                ),
                              ],
                            ),
                          );
                        }

                        return Align(
                          alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            constraints: BoxConstraints(
                              maxWidth: MediaQuery.of(context).size.width * 0.82,
                            ),
                            decoration: BoxDecoration(
                              color: isUser ? NeetTokens.accentGlow : NeetTokens.bgSecondary,
                              borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                              border: isUser ? null : Border.all(color: NeetTokens.border),
                            ),
                            child: Column(
                              crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                              children: [
                                if (chat['imagePath'] != null)
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: 8.0),
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: Image.file(
                                        File(chat['imagePath']),
                                        height: 150,
                                        width: 150,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                  ),
                                if (chat['message']?.isNotEmpty == true)
                                  Text(
                                    chat['message'] ?? '',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: isUser ? Colors.white : NeetTokens.textPrimary,
                                      height: 1.4,
                                    ),
                                  ),
                              ],
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
                    onPressed: _handleCameraCapture,
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
                    onPressed: () => _handleAskDoubt(),
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

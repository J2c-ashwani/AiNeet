import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../core/api_client.dart';

class DoubtScreen extends StatefulWidget {
  const DoubtScreen({super.key});
  @override
  State<DoubtScreen> createState() => _DoubtScreenState();
}

class _DoubtScreenState extends State<DoubtScreen> {
  final _ctrl = TextEditingController();
  String? _response;
  bool _loading = false;
  File? _image;

  Future<void> _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: source, imageQuality: 80);
    if (picked != null && mounted) {
      setState(() => _image = File(picked.path));
    }
  }

  Future<void> _submit() async {
    if (_ctrl.text.trim().isEmpty && _image == null) return;
    setState(() { _loading = true; _response = null; });
    try {
      final data = await ApiClient().solveDoubt(_ctrl.text.trim());
      if (mounted) setState(() => _response = data['answer']?.toString() ?? data['response']?.toString());
    } catch (e) {
      if (mounted) setState(() => _response = 'Failed to get response. Please check your connection.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Doubt Solver 🤔')),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Ask anything about Physics, Chemistry, or Biology', style: TextStyle(color: Color(0xFF94a3b8), fontSize: 13)),
                  const SizedBox(height: 14),
                  TextField(
                    controller: _ctrl,
                    maxLines: 4,
                    decoration: const InputDecoration(hintText: 'Type your doubt here... e.g. "Why does photosynthesis occur in chloroplasts?"'),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      OutlinedButton.icon(
                        onPressed: () => _pickImage(ImageSource.camera),
                        icon: const Icon(Icons.camera_alt_outlined, size: 18, color: Color(0xFF6366f1)),
                        label: const Text('Camera', style: TextStyle(color: Color(0xFF6366f1))),
                        style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0x40FFFFFF))),
                      ),
                      const SizedBox(width: 10),
                      OutlinedButton.icon(
                        onPressed: () => _pickImage(ImageSource.gallery),
                        icon: const Icon(Icons.image_outlined, size: 18, color: Color(0xFF6366f1)),
                        label: const Text('Gallery', style: TextStyle(color: Color(0xFF6366f1))),
                        style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0x40FFFFFF))),
                      ),
                    ],
                  ),
                  if (_image != null) ...[
                    const SizedBox(height: 10),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.file(_image!, height: 150, fit: BoxFit.cover),
                    ),
                  ],
                  if (_response != null) ...[
                    const SizedBox(height: 24),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0f2d2a),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0x4010b981)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(children: [
                            Text('🧠 ', style: TextStyle(fontSize: 18)),
                            Text('AI Response', style: TextStyle(color: Color(0xFF10b981), fontWeight: FontWeight.w700)),
                          ]),
                          const SizedBox(height: 12),
                          Text(_response!, style: const TextStyle(color: Color(0xFFe2e8f0), fontSize: 14, height: 1.7)),
                        ],
                      ),
                    ),
                  ],
                  if (_loading) const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator(color: Color(0xFF6366f1)))),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _loading ? null : _submit,
                icon: const Icon(Icons.send_rounded),
                label: const Text('Ask AI', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

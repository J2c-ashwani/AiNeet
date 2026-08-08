import 'package:flutter/material.dart';
import '../../../core/constants/tokens.dart';

class NativeNcertReaderScreen extends StatefulWidget {
  const NativeNcertReaderScreen({super.key});

  @override
  State<NativeNcertReaderScreen> createState() => _NativeNcertReaderScreenState();
}

class _NativeNcertReaderScreenState extends State<NativeNcertReaderScreen> {
  String _selectedSubject = 'Physics';
  String _selectedChapter = 'Thermodynamics & Kinetic Theory';

  final Map<String, List<String>> _chapters = {
    'Physics': [
      'Units and Measurements',
      'Laws of Motion',
      'Work, Energy and Power',
      'Thermodynamics & Kinetic Theory',
      'Electrostatics & Current Electricity',
    ],
    'Chemistry': [
      'Some Basic Concepts of Chemistry',
      'Structure of Atom',
      'Chemical Bonding & Molecular Structure',
      'Organic Chemistry - Basic Principles',
    ],
    'Biology': [
      'Cell: The Unit of Life',
      'Plant Kingdom & Physiology',
      'Human Physiology & Circulation',
      'Genetics and Evolution',
    ],
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        title: Text(
          'NCERT Textbook Library',
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
            // Subject Tabs
            Container(
              color: NeetTokens.bgSecondary,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: ['Physics', 'Chemistry', 'Biology'].map((subject) {
                  final isSelected = _selectedSubject == subject;
                  final color = subject == 'Physics'
                      ? NeetTokens.physicsColor
                      : subject == 'Chemistry'
                          ? NeetTokens.chemistryColor
                          : NeetTokens.biologyColor;

                  return Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedSubject = subject;
                          _selectedChapter = _chapters[subject]!.first;
                        });
                        NeetTokens.hapticSelection();
                      },
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? color.withOpacity(0.2)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                          border: Border.all(
                            color: isSelected ? color : NeetTokens.border,
                          ),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          subject,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                            color: isSelected ? color : NeetTokens.textMuted,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            // Chapter Content Viewer
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  Text(
                    _selectedChapter,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: NeetTokens.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'NCERT Class 11 & 12 Syllabus Aligned',
                    style: TextStyle(fontSize: 12, color: NeetTokens.textMuted),
                  ),
                  const SizedBox(height: 20),

                  // Key Concept Box
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: NeetTokens.bgSecondary,
                      borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                      border: Border.all(color: NeetTokens.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          '📌 Core NCERT Definition',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: NeetTokens.physicsColor,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'First Law of Thermodynamics: Energy can neither be created nor destroyed; it can only be transformed from one form to another. dQ = dU + dW.',
                          style: TextStyle(
                            fontSize: 14,
                            color: NeetTokens.textSecondary,
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
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

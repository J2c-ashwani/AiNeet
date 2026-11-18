import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';
import '../../practice/presentation/test_engine_screen.dart';
import '../../practice/presentation/test_results_screen.dart';

class NativeNcertReaderScreen extends StatefulWidget {
  final Function(Map<String, dynamic> testData)? onStartTest;

  const NativeNcertReaderScreen({super.key, this.onStartTest});

  @override
  State<NativeNcertReaderScreen> createState() => _NativeNcertReaderScreenState();
}

class _NativeNcertReaderScreenState extends State<NativeNcertReaderScreen> {
  final NeetApiClient _apiClient = NeetApiClient();

  String _selectedSubject = 'all'; // all, physics, chemistry, biology
  String _selectedClass = 'all'; // all, 11, 12

  bool _isLoading = false;
  List<Map<String, dynamic>> _books = [];
  String? _generatingChapter;

  @override
  void initState() {
    super.initState();
    _books = _getFallbackLibrary();
    _loadLibrary();
  }

  Future<void> _loadLibrary() async {
    if (_books.isEmpty) {
      setState(() => _isLoading = true);
    }
    try {
      final res = await _apiClient.getNcertLibrary();
      if (res.statusCode == 200 && res.data != null) {
        final List<dynamic> rawBooks = res.data['books'] ?? [];
        if (mounted) {
          setState(() {
            _books = rawBooks.map((b) => Map<String, dynamic>.from(b as Map)).toList();
          });
        }
      }
    } catch (_) {
      // Offline fallback already active
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  List<Map<String, dynamic>> _getFallbackLibrary() {
    return [
      {
        'subject': 'physics',
        'class': 11,
        'book': 'Physics Part I',
        'code': 'keph1',
        'chapters': [
          {'ch': 1, 'title': 'Units and Measurement', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/keph101.pdf', 'pyqCount': 14},
          {'ch': 2, 'title': 'Motion in a Straight Line', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/keph102.pdf', 'pyqCount': 11},
          {'ch': 3, 'title': 'Motion in a Plane', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/keph103.pdf', 'pyqCount': 16},
          {'ch': 4, 'title': 'Laws of Motion', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/keph104.pdf', 'pyqCount': 19},
          {'ch': 5, 'title': 'Work, Energy and Power', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/keph105.pdf', 'pyqCount': 22},
          {'ch': 6, 'title': 'System of Particles & Rotational Motion', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/keph106.pdf', 'pyqCount': 25},
          {'ch': 7, 'title': 'Gravitation', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/keph107.pdf', 'pyqCount': 18},
        ],
      },
      {
        'subject': 'physics',
        'class': 11,
        'book': 'Physics Part II',
        'code': 'keph2',
        'chapters': [
          {'ch': 1, 'title': 'Mechanical Properties of Solids', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/keph201.pdf', 'pyqCount': 10},
          {'ch': 2, 'title': 'Mechanical Properties of Fluids', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/keph202.pdf', 'pyqCount': 15},
          {'ch': 3, 'title': 'Thermal Properties of Matter', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/keph203.pdf', 'pyqCount': 17},
          {'ch': 4, 'title': 'Thermodynamics', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/keph204.pdf', 'pyqCount': 24},
          {'ch': 5, 'title': 'Kinetic Theory', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/keph205.pdf', 'pyqCount': 13},
          {'ch': 6, 'title': 'Oscillations', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/keph206.pdf', 'pyqCount': 16},
          {'ch': 7, 'title': 'Waves', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/keph207.pdf', 'pyqCount': 18},
        ],
      },
      {
        'subject': 'physics',
        'class': 12,
        'book': 'Physics Part I',
        'code': 'leph1',
        'chapters': [
          {'ch': 1, 'title': 'Electric Charges and Fields', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/leph101.pdf', 'pyqCount': 22},
          {'ch': 2, 'title': 'Electrostatic Potential & Capacitance', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/leph102.pdf', 'pyqCount': 26},
          {'ch': 3, 'title': 'Current Electricity', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/leph103.pdf', 'pyqCount': 35},
          {'ch': 4, 'title': 'Moving Charges and Magnetism', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/leph104.pdf', 'pyqCount': 21},
          {'ch': 5, 'title': 'Magnetism and Matter', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/leph105.pdf', 'pyqCount': 12},
          {'ch': 6, 'title': 'Electromagnetic Induction', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/leph106.pdf', 'pyqCount': 17},
          {'ch': 7, 'title': 'Alternating Current', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/leph107.pdf', 'pyqCount': 19},
          {'ch': 8, 'title': 'Electromagnetic Waves', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/leph108.pdf', 'pyqCount': 14},
        ],
      },
      {
        'subject': 'physics',
        'class': 12,
        'book': 'Physics Part II',
        'code': 'leph2',
        'chapters': [
          {'ch': 1, 'title': 'Ray Optics and Optical Instruments', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/leph201.pdf', 'pyqCount': 29},
          {'ch': 2, 'title': 'Wave Optics', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/leph202.pdf', 'pyqCount': 21},
          {'ch': 3, 'title': 'Dual Nature of Radiation & Matter', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/leph203.pdf', 'pyqCount': 25},
          {'ch': 4, 'title': 'Atoms', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/leph204.pdf', 'pyqCount': 18},
          {'ch': 5, 'title': 'Nuclei', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/leph205.pdf', 'pyqCount': 16},
          {'ch': 6, 'title': 'Semiconductor Electronics', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/leph206.pdf', 'pyqCount': 31},
        ],
      },
      {
        'subject': 'chemistry',
        'class': 11,
        'book': 'Chemistry Part I',
        'code': 'kech1',
        'chapters': [
          {'ch': 1, 'title': 'Some Basic Concepts of Chemistry', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kech101.pdf', 'pyqCount': 20},
          {'ch': 2, 'title': 'Structure of Atom', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kech102.pdf', 'pyqCount': 23},
          {'ch': 3, 'title': 'Classification of Elements & Periodicity', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kech103.pdf', 'pyqCount': 16},
          {'ch': 4, 'title': 'Chemical Bonding & Molecular Structure', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kech104.pdf', 'pyqCount': 38},
          {'ch': 5, 'title': 'Thermodynamics', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kech105.pdf', 'pyqCount': 27},
          {'ch': 6, 'title': 'Equilibrium', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kech106.pdf', 'pyqCount': 32},
        ],
      },
      {
        'subject': 'chemistry',
        'class': 11,
        'book': 'Chemistry Part II',
        'code': 'kech2',
        'chapters': [
          {'ch': 1, 'title': 'Redox Reactions', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kech201.pdf', 'pyqCount': 15},
          {'ch': 2, 'title': 'Organic Chemistry: Some Basic Principles', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kech202.pdf', 'pyqCount': 29},
          {'ch': 3, 'title': 'Hydrocarbons', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kech203.pdf', 'pyqCount': 34},
        ],
      },
      {
        'subject': 'chemistry',
        'class': 12,
        'book': 'Chemistry Part I',
        'code': 'lech1',
        'chapters': [
          {'ch': 1, 'title': 'Solutions', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lech101.pdf', 'pyqCount': 24},
          {'ch': 2, 'title': 'Electrochemistry', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lech102.pdf', 'pyqCount': 28},
          {'ch': 3, 'title': 'Chemical Kinetics', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lech103.pdf', 'pyqCount': 26},
          {'ch': 4, 'title': 'The d- and f-Block Elements', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lech104.pdf', 'pyqCount': 21},
          {'ch': 5, 'title': 'Coordination Compounds', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lech105.pdf', 'pyqCount': 33},
        ],
      },
      {
        'subject': 'chemistry',
        'class': 12,
        'book': 'Chemistry Part II',
        'code': 'lech2',
        'chapters': [
          {'ch': 1, 'title': 'Haloalkanes and Haloarenes', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lech201.pdf', 'pyqCount': 20},
          {'ch': 2, 'title': 'Alcohols, Phenols and Ethers', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lech202.pdf', 'pyqCount': 27},
          {'ch': 3, 'title': 'Aldehydes, Ketones & Carboxylic Acids', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lech203.pdf', 'pyqCount': 35},
          {'ch': 4, 'title': 'Amines', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lech204.pdf', 'pyqCount': 22},
          {'ch': 5, 'title': 'Biomolecules', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lech205.pdf', 'pyqCount': 25},
        ],
      },
      {
        'subject': 'biology',
        'class': 11,
        'book': 'Biology Class 11',
        'code': 'kebo1',
        'chapters': [
          {'ch': 1, 'title': 'The Living World', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo101.pdf', 'pyqCount': 12},
          {'ch': 2, 'title': 'Biological Classification', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo102.pdf', 'pyqCount': 28},
          {'ch': 3, 'title': 'Plant Kingdom', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo103.pdf', 'pyqCount': 32},
          {'ch': 4, 'title': 'Animal Kingdom', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo104.pdf', 'pyqCount': 36},
          {'ch': 5, 'title': 'Morphology of Flowering Plants', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo105.pdf', 'pyqCount': 30},
          {'ch': 6, 'title': 'Anatomy of Flowering Plants', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo106.pdf', 'pyqCount': 26},
          {'ch': 7, 'title': 'Structural Organisation in Animals', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo107.pdf', 'pyqCount': 22},
          {'ch': 8, 'title': 'Cell: The Unit of Life', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo108.pdf', 'pyqCount': 42},
          {'ch': 9, 'title': 'Biomolecules', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo109.pdf', 'pyqCount': 35},
          {'ch': 10, 'title': 'Cell Cycle and Cell Division', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo110.pdf', 'pyqCount': 38},
          {'ch': 11, 'title': 'Photosynthesis in Higher Plants', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo111.pdf', 'pyqCount': 29},
          {'ch': 12, 'title': 'Respiration in Plants', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo112.pdf', 'pyqCount': 24},
          {'ch': 13, 'title': 'Plant Growth and Development', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo113.pdf', 'pyqCount': 27},
          {'ch': 14, 'title': 'Breathing and Exchange of Gases', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo114.pdf', 'pyqCount': 31},
          {'ch': 15, 'title': 'Body Fluids and Circulation', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo115.pdf', 'pyqCount': 34},
          {'ch': 16, 'title': 'Excretory Products and Elimination', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo116.pdf', 'pyqCount': 28},
          {'ch': 17, 'title': 'Locomotion and Movement', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo117.pdf', 'pyqCount': 26},
          {'ch': 18, 'title': 'Neural Control and Coordination', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo118.pdf', 'pyqCount': 33},
          {'ch': 19, 'title': 'Chemical Coordination and Integration', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/kebo119.pdf', 'pyqCount': 32},
        ],
      },
      {
        'subject': 'biology',
        'class': 12,
        'book': 'Biology Class 12',
        'code': 'lebo1',
        'chapters': [
          {'ch': 1, 'title': 'Sexual Reproduction in Flowering Plants', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lebo101.pdf', 'pyqCount': 44},
          {'ch': 2, 'title': 'Human Reproduction', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lebo102.pdf', 'pyqCount': 46},
          {'ch': 3, 'title': 'Reproductive Health', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lebo103.pdf', 'pyqCount': 28},
          {'ch': 4, 'title': 'Principles of Inheritance and Variation', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lebo104.pdf', 'pyqCount': 56},
          {'ch': 5, 'title': 'Molecular Basis of Inheritance', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lebo105.pdf', 'pyqCount': 58},
          {'ch': 6, 'title': 'Evolution', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lebo106.pdf', 'pyqCount': 35},
          {'ch': 7, 'title': 'Human Health and Disease', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lebo107.pdf', 'pyqCount': 41},
          {'ch': 8, 'title': 'Microbes in Human Welfare', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lebo108.pdf', 'pyqCount': 24},
          {'ch': 9, 'title': 'Biotechnology: Principles and Processes', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lebo109.pdf', 'pyqCount': 42},
          {'ch': 10, 'title': 'Biotechnology and its Applications', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lebo110.pdf', 'pyqCount': 33},
          {'ch': 11, 'title': 'Organisms and Populations', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lebo111.pdf', 'pyqCount': 36},
          {'ch': 12, 'title': 'Ecosystem', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lebo112.pdf', 'pyqCount': 28},
          {'ch': 13, 'title': 'Biodiversity and Conservation', 'pdfUrl': 'https://ncert.nic.in/textbook/pdf/lebo113.pdf', 'pyqCount': 30},
        ],
      },
    ];
  }

  Future<void> _openPdf(String pdfUrl) async {
    NeetTokens.hapticSelection();
    try {
      final uri = Uri.parse(pdfUrl);
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not open PDF: $pdfUrl'),
            backgroundColor: NeetTokens.error,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error opening PDF viewer: $e'),
            backgroundColor: NeetTokens.error,
          ),
        );
      }
    }
  }

  Future<void> _startChapterPyq(String chapterName, int pyqCount) async {
    setState(() => _generatingChapter = chapterName);
    NeetTokens.hapticMedium();

    try {
      final res = await _apiClient.generatePyqTest(
        chapterName: chapterName,
        questionCount: pyqCount > 0 ? (pyqCount > 20 ? 20 : pyqCount) : 15,
      );

      if (mounted) {
        setState(() => _generatingChapter = null);

        if (res.statusCode == 200 && res.data != null) {
          final testData = Map<String, dynamic>.from(res.data as Map);
          NeetTokens.hapticSuccess();

          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (testCtx) => NativeTestEngineScreen(
                testTitle: '$chapterName (PYQ Practice)',
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
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(res.data?['error']?.toString() ?? 'Failed to generate PYQ test. Try another chapter.'),
              backgroundColor: NeetTokens.warning,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _generatingChapter = null);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Connection issue. Falling back to custom test: $e'),
            backgroundColor: NeetTokens.warning,
          ),
        );
      }
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
    // Filter books
    var filteredBooks = _books;
    if (_selectedSubject != 'all') {
      filteredBooks = filteredBooks.where((b) => b['subject']?.toString().toLowerCase() == _selectedSubject).toList();
    }
    if (_selectedClass != 'all') {
      final classInt = int.tryParse(_selectedClass);
      if (classInt != null) {
        filteredBooks = filteredBooks.where((b) => b['class'] == classInt).toList();
      }
    }

    return Scaffold(
      backgroundColor: NeetTokens.bgPrimary,
      appBar: AppBar(
        backgroundColor: NeetTokens.bgSecondary,
        elevation: 0,
        title: Row(
          children: const [
            Icon(Icons.menu_book_rounded, color: NeetTokens.accentPrimary),
            SizedBox(width: 8),
            Text(
              'NCERT Smart Library',
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
            // Subject Filter Bar
            Container(
              color: NeetTokens.bgSecondary,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterChip('All Subjects', 'all', _selectedSubject, (val) => setState(() => _selectedSubject = val)),
                    const SizedBox(width: 8),
                    _buildFilterChip('⚡ Physics', 'physics', _selectedSubject, (val) => setState(() => _selectedSubject = val), color: NeetTokens.physicsColor),
                    const SizedBox(width: 8),
                    _buildFilterChip('🧪 Chemistry', 'chemistry', _selectedSubject, (val) => setState(() => _selectedSubject = val), color: NeetTokens.chemistryColor),
                    const SizedBox(width: 8),
                    _buildFilterChip('🧬 Biology', 'biology', _selectedSubject, (val) => setState(() => _selectedSubject = val), color: NeetTokens.biologyColor),
                  ],
                ),
              ),
            ),

            // Class Filter Bar
            Container(
              color: NeetTokens.bgSecondary,
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: Row(
                children: [
                  const Text('Class: ', style: TextStyle(fontSize: 12, color: NeetTokens.textMuted, fontWeight: FontWeight.w600)),
                  const SizedBox(width: 6),
                  _buildClassChip('All Classes', 'all'),
                  const SizedBox(width: 8),
                  _buildClassChip('Class 11', '11'),
                  const SizedBox(width: 8),
                  _buildClassChip('Class 12', '12'),
                ],
              ),
            ),

            // Main Content List
            Expanded(
              child: _isLoading
                  ? Center(child: CircularProgressIndicator(color: NeetTokens.accentGlow))
                  : filteredBooks.isEmpty
                      ? Center(
                          child: Text(
                            'No books found matching the filter.',
                            style: TextStyle(color: NeetTokens.textMuted),
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: _loadLibrary,
                          color: NeetTokens.accentPrimary,
                          backgroundColor: NeetTokens.bgSecondary,
                          child: ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: filteredBooks.length,
                            itemBuilder: (context, bookIdx) {
                              final book = filteredBooks[bookIdx];
                              final subject = book['subject']?.toString() ?? 'physics';
                              final bookTitle = book['book']?.toString() ?? 'Book';
                              final classNum = book['class']?.toString() ?? '11';
                              final chapters = (book['chapters'] as List<dynamic>?) ?? [];
                              final color = _getSubjectColor(subject);

                              return Container(
                                margin: const EdgeInsets.only(bottom: 16),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                                  border: Border.all(color: NeetTokens.border),
                                ),
                                child: Material(
                                  color: NeetTokens.bgSecondary,
                                  borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                                  child: Theme(
                                    data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                                    child: ExpansionTile(
                                    initiallyExpanded: bookIdx == 0,
                                    tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                    leading: Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        color: color.withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Icon(Icons.book, color: color, size: 22),
                                    ),
                                    title: Text(
                                      bookTitle,
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w800,
                                        color: NeetTokens.textPrimary,
                                      ),
                                    ),
                                    subtitle: Text(
                                      'Class $classNum • ${chapters.length} Chapters • Rationalized Syllabus',
                                      style: const TextStyle(fontSize: 12, color: NeetTokens.textMuted),
                                    ),
                                    children: chapters.map<Widget>((ch) {
                                      final chNum = ch['ch']?.toString() ?? '1';
                                      final title = ch['title']?.toString() ?? '';
                                      final pdfUrl = ch['pdfUrl']?.toString() ?? '';
                                      final pyqCount = ch['pyqCount'] as int? ?? 0;
                                      final isGenerating = _generatingChapter == title;

                                      return Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                        decoration: BoxDecoration(
                                          border: Border(
                                            top: BorderSide(color: NeetTokens.border.withValues(alpha: 0.5)),
                                          ),
                                        ),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                                  decoration: BoxDecoration(
                                                    color: color.withValues(alpha: 0.2),
                                                    borderRadius: BorderRadius.circular(4),
                                                  ),
                                                  child: Text(
                                                    'Ch $chNum',
                                                    style: TextStyle(
                                                      fontSize: 11,
                                                      fontWeight: FontWeight.w800,
                                                      color: color,
                                                    ),
                                                  ),
                                                ),
                                                const SizedBox(width: 10),
                                                Expanded(
                                                  child: Text(
                                                    title,
                                                    style: const TextStyle(
                                                      fontSize: 14,
                                                      fontWeight: FontWeight.w700,
                                                      color: NeetTokens.textPrimary,
                                                    ),
                                                  ),
                                                ),
                                                if (pyqCount > 0)
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                                    decoration: BoxDecoration(
                                                      color: NeetTokens.physicsColor.withValues(alpha: 0.15),
                                                      borderRadius: BorderRadius.circular(12),
                                                    ),
                                                    child: Text(
                                                      '🔥 $pyqCount PYQs',
                                                      style: const TextStyle(
                                                        fontSize: 10,
                                                        fontWeight: FontWeight.w800,
                                                        color: NeetTokens.physicsColor,
                                                      ),
                                                    ),
                                                  ),
                                              ],
                                            ),
                                            const SizedBox(height: 10),
                                            Row(
                                              children: [
                                                Expanded(
                                                  child: OutlinedButton.icon(
                                                    onPressed: pdfUrl.isNotEmpty ? () => _openPdf(pdfUrl) : null,
                                                    icon: const Icon(Icons.picture_as_pdf_outlined, size: 16),
                                                    label: const Text('Read PDF', style: TextStyle(fontSize: 12)),
                                                    style: OutlinedButton.styleFrom(
                                                      foregroundColor: NeetTokens.textSecondary,
                                                      side: BorderSide(color: NeetTokens.border),
                                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                                      shape: RoundedRectangleBorder(
                                                        borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                                const SizedBox(width: 10),
                                                Expanded(
                                                  child: ElevatedButton.icon(
                                                    onPressed: isGenerating ? null : () => _startChapterPyq(title, pyqCount),
                                                    icon: isGenerating
                                                        ? const SizedBox(
                                                            width: 14,
                                                            height: 14,
                                                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                                          )
                                                        : const Icon(Icons.play_arrow_rounded, size: 18),
                                                    label: Text(
                                                      isGenerating ? 'Loading...' : 'Practice PYQs',
                                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                                                    ),
                                                    style: ElevatedButton.styleFrom(
                                                      backgroundColor: color,
                                                      foregroundColor: Colors.white,
                                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                                      shape: RoundedRectangleBorder(
                                                        borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      );
                                    }).toList(),
                                  ),
                                ),
                                ),
                              );
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, String value, String currentValue, Function(String) onSelect, {Color? color}) {
    final isSelected = value == currentValue;
    final activeColor = color ?? NeetTokens.accentPrimary;

    return InkWell(
      onTap: () {
        NeetTokens.hapticSelection();
        onSelect(value);
      },
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? activeColor.withValues(alpha: 0.2) : NeetTokens.bgCard,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? activeColor : NeetTokens.border,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
            color: isSelected ? activeColor : NeetTokens.textMuted,
          ),
        ),
      ),
    );
  }

  Widget _buildClassChip(String label, String value) {
    final isSelected = _selectedClass == value;
    return InkWell(
      onTap: () {
        NeetTokens.hapticSelection();
        setState(() => _selectedClass = value);
      },
      borderRadius: BorderRadius.circular(6),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? NeetTokens.accentSecondary.withValues(alpha: 0.2) : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: isSelected ? NeetTokens.accentSecondary : NeetTokens.border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
            color: isSelected ? NeetTokens.accentSecondary : NeetTokens.textMuted,
          ),
        ),
      ),
    );
  }
}

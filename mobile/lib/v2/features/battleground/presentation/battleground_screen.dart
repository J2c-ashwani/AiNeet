import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:dio/dio.dart';
import '../../../core/constants/tokens.dart';
import '../../../core/api/api_client.dart';
import '../../practice/presentation/test_engine_screen.dart';
import '../../practice/presentation/test_results_screen.dart';

class NativeBattlegroundScreen extends StatefulWidget {
  const NativeBattlegroundScreen({super.key});

  @override
  State<NativeBattlegroundScreen> createState() => _NativeBattlegroundScreenState();
}

class _NativeBattlegroundScreenState extends State<NativeBattlegroundScreen> {
  final NeetApiClient _apiClient = NeetApiClient();
  bool _isCreatingDuel = false;
  bool _isCreatingRoom = false;
  bool _isJoiningRoom = false;
  bool _isSearchingSolo = false;

  final TextEditingController _joinCodeController = TextEditingController();

  @override
  void dispose() {
    _joinCodeController.dispose();
    super.dispose();
  }

  // ── Mode 1: 1v1 Peer Duel (WhatsApp Virality) ───────────────────
  Future<void> _handleCreate1v1Duel() async {
    setState(() => _isCreatingDuel = true);
    NeetTokens.hapticMedium();

    try {
      final res = await _apiClient.createChallenge();
      if (!mounted) return;
      setState(() => _isCreatingDuel = false);

      if (res.statusCode == 200 && res.data != null) {
        final shareUrl = res.data['shareUrl']?.toString() ?? 'https://aineetcoach.com/challenge';
        final challengeId = res.data['challengeId']?.toString() ?? '';
        _showDuelShareSheet(shareUrl, challengeId);
      } else {
        final msg = res.data?['error']?.toString() ?? 'Failed to create challenge. Please retry.';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg), backgroundColor: NeetTokens.warning),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isCreatingDuel = false);
        String msg = 'Could not create duel at this time. Check your connection.';
        if (e is DioException) {
          if (e.response?.statusCode == 401) {
            msg = 'Session expired or not signed in. Please sign in to battle.';
          } else if (e.response?.data is Map && e.response?.data['error'] != null) {
            msg = e.response!.data['error'].toString();
          }
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(msg),
            backgroundColor: NeetTokens.warning,
          ),
        );
      }
    }
  }

  void _showDuelShareSheet(String shareUrl, String challengeId) {
    NeetTokens.hapticSuccess();
    showModalBottomSheet(
      context: context,
      backgroundColor: NeetTokens.bgSecondary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(NeetTokens.radiusLg)),
      ),
      builder: (sheetCtx) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: NeetTokens.accentPrimary.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.flash_on_rounded, color: NeetTokens.accentPrimary, size: 24),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      '1v1 NEET Duel Created! ⚔️',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: NeetTokens.textPrimary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Text(
                'Share this link with a friend or in your NEET WhatsApp group. Both of you get the same 10 high-yield questions to determine who ranks higher!',
                style: TextStyle(fontSize: 13, color: NeetTokens.textSecondary, height: 1.4),
              ),
              const SizedBox(height: 16),

              // URL Box
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: NeetTokens.bgCard,
                  borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                  border: Border.all(color: NeetTokens.border),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        shareUrl,
                        style: const TextStyle(fontSize: 13, color: NeetTokens.accentPrimary),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.copy, size: 18, color: NeetTokens.textMuted),
                      tooltip: 'Copy Link',
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: shareUrl));
                        NeetTokens.hapticSelection();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Challenge link copied to clipboard!')),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // WhatsApp Share Button
              ElevatedButton.icon(
                onPressed: () async {
                  NeetTokens.hapticMedium();
                  final text = '🔥 I challenge you to a 10-Question NEET Duel on AI NEET Coach! Can you beat my score? Accept here: $shareUrl';
                  final whatsappUri = Uri.parse('https://api.whatsapp.com/send?text=${Uri.encodeComponent(text)}');
                  if (await canLaunchUrl(whatsappUri)) {
                    await launchUrl(whatsappUri, mode: LaunchMode.externalApplication);
                  }
                },
                icon: const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                label: const Text(
                  'Share on WhatsApp 💬',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF25D366), // WhatsApp Green
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusMd)),
                ),
              ),
              const SizedBox(height: 12),

              // Take Your Turn Button
              OutlinedButton.icon(
                onPressed: () {
                  Navigator.pop(sheetCtx);
                  _launchDuelTest(challengeId);
                },
                icon: const Icon(Icons.play_arrow_rounded, color: NeetTokens.accentPrimary),
                label: const Text(
                  'Start My 10-Question Attempt Now →',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: NeetTokens.accentPrimary),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: NeetTokens.accentPrimary),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusMd)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _launchDuelTest(String challengeId) async {
    NeetTokens.hapticMedium();
    try {
      if (challengeId.isNotEmpty) {
        final challengeRes = await _apiClient.getChallengeDetails(challengeId);
        if (challengeRes.statusCode == 200 && challengeRes.data != null) {
          final cData = challengeRes.data;
          final questionsList = cData['questions'];
          if (questionsList is List && questionsList.isNotEmpty) {
            final testData = {
              'id': challengeId,
              'testId': challengeId,
              'title': '1v1 WhatsApp Duel (10 Qs)',
              'questions': questionsList,
              'timeLimit': 600,
              'time_limit': 600,
            };
            if (!mounted) return;
            _navigateToTestEngine('1v1 WhatsApp Duel (10 Qs)', testData);
            return;
          }
        }
      }

      final testRes = await _apiClient.generateTest(type: 'custom', questionCount: 10);
      if (!mounted) return;
      if (testRes.statusCode == 200 && testRes.data != null) {
        final testData = Map<String, dynamic>.from(testRes.data as Map);
        testData['testId'] = challengeId.isNotEmpty ? challengeId : testData['id'];
        _navigateToTestEngine('1v1 WhatsApp Duel (10 Qs)', testData);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not load duel questions. Please check connection and retry.')),
        );
      }
    }
  }

  // ── Mode 2: Multiplayer Live Room (Up to 200 Aspirants) ────────
  Future<void> _handleCreateLiveRoom() async {
    setState(() => _isCreatingRoom = true);
    NeetTokens.hapticMedium();

    try {
      final res = await _apiClient.createBattlegroundRoom(questionCount: 15, timeLimitMinutes: 15);
      if (!mounted) return;
      setState(() => _isCreatingRoom = false);

      if (res.statusCode == 200 && res.data != null) {
        final battleId = res.data['battleId']?.toString() ?? '';
        final inviteCode = res.data['inviteCode']?.toString() ?? '';
        _showRoomHostSheet(battleId, inviteCode);
      } else {
        final msg = res.data?['error']?.toString() ?? 'Failed to create room. Upgrade to Pro for unlimited rooms.';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg), backgroundColor: NeetTokens.warning),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isCreatingRoom = false);
        String msg = 'Room creation failed. Please try again.';
        if (e is DioException) {
          if (e.response?.statusCode == 401) {
            msg = 'Session expired or not signed in. Please sign in.';
          } else if (e.response?.statusCode == 403) {
            final serverMsg = e.response?.data is Map ? e.response?.data['message']?.toString() : null;
            msg = serverMsg ?? 'Multiplayer room hosting is a Pro feature. Upgrade to host live rooms!';
          } else if (e.response?.data is Map && e.response?.data['error'] != null) {
            msg = e.response!.data['error'].toString();
          }
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg), backgroundColor: NeetTokens.warning),
        );
      }
    }
  }

  void _showRoomHostSheet(String battleId, String inviteCode) {
    NeetTokens.hapticSuccess();
    showModalBottomSheet(
      context: context,
      backgroundColor: NeetTokens.bgSecondary,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(NeetTokens.radiusLg)),
      ),
      builder: (sheetCtx) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: NeetTokens.warning.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.groups_rounded, color: NeetTokens.warning, size: 24),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Live Room Hosted! (Up to 200 Users)',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: NeetTokens.textPrimary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Text(
                'Give this 6-character room code to your batchmates, coaching class, or study group to join live:',
                style: TextStyle(fontSize: 13, color: NeetTokens.textSecondary, height: 1.4),
              ),
              const SizedBox(height: 16),

              // Huge Room Code Display
              Container(
                padding: const EdgeInsets.symmetric(vertical: 18),
                decoration: BoxDecoration(
                  color: NeetTokens.bgCard,
                  borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
                  border: Border.all(color: NeetTokens.warning.withValues(alpha: 0.5)),
                ),
                alignment: Alignment.center,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      inviteCode,
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 4,
                        color: NeetTokens.warning,
                      ),
                    ),
                    const SizedBox(width: 12),
                    IconButton(
                      icon: const Icon(Icons.copy, color: NeetTokens.warning),
                      tooltip: 'Copy Code',
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: inviteCode));
                        NeetTokens.hapticSelection();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Room code copied!')),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Share Code on WhatsApp
              ElevatedButton.icon(
                onPressed: () async {
                  NeetTokens.hapticMedium();
                  final text = '🏆 Join my live NEET Battleground Room on AI NEET Coach!\nRoom Code: $inviteCode\nCompete live with up to 200 students: https://aineetcoach.com/battleground';
                  final whatsappUri = Uri.parse('https://api.whatsapp.com/send?text=${Uri.encodeComponent(text)}');
                  if (await canLaunchUrl(whatsappUri)) {
                    await launchUrl(whatsappUri, mode: LaunchMode.externalApplication);
                  }
                },
                icon: const Icon(Icons.share, color: Colors.white, size: 18),
                label: const Text(
                  'Share Code on WhatsApp 💬',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF25D366),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusMd)),
                ),
              ),
              const SizedBox(height: 12),

              // Start Battle Button
              OutlinedButton.icon(
                onPressed: () async {
                  Navigator.pop(sheetCtx);
                  await _startAndEnterRoom(battleId);
                },
                icon: const Icon(Icons.play_circle_fill, color: NeetTokens.warning),
                label: const Text(
                  'Start Room & Enter Battle →',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: NeetTokens.warning),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: NeetTokens.warning),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusMd)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _startAndEnterRoom(String battleId) async {
    NeetTokens.hapticMedium();
    try {
      await _apiClient.startBattlegroundRoom(battleId);
      final stateRes = await _apiClient.getBattlegroundState(battleId);
      if (!mounted) return;

      if (stateRes.statusCode == 200 && stateRes.data != null) {
        final battleObj = stateRes.data['battle'] as Map<String, dynamic>? ?? {};
        final rawQs = (battleObj['questions'] as List<dynamic>?) ?? [];
        if (rawQs.isNotEmpty) {
          final testData = {
            'id': battleId,
            'questions': rawQs,
            'timeLimit': (battleObj['timeLimitSeconds'] as int?) ?? 15 * 60,
          };
          _navigateToTestEngine('Multiplayer Room Battle', testData);
          return;
        }
      }

      // Fallback: generate custom 15 Qs
      final testRes = await _apiClient.generateTest(type: 'custom', questionCount: 15);
      if (mounted && testRes.statusCode == 200 && testRes.data != null) {
        _navigateToTestEngine('Multiplayer Room Battle', Map<String, dynamic>.from(testRes.data as Map));
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not start room battle. Please retry.')),
        );
      }
    }
  }

  void _showJoinRoomDialog() {
    _joinCodeController.clear();
    showDialog(
      context: context,
      builder: (dialogCtx) {
        return AlertDialog(
          backgroundColor: NeetTokens.bgSecondary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusLg)),
          title: Row(
            children: const [
              Icon(Icons.meeting_room_outlined, color: NeetTokens.warning),
              SizedBox(width: 8),
              Text(
                'Join Live Room',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Enter the 6-character room code shared by your teacher or host:',
                style: TextStyle(fontSize: 13, color: NeetTokens.textSecondary),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _joinCodeController,
                textCapitalization: TextCapitalization.characters,
                maxLength: 8,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 4,
                  color: NeetTokens.warning,
                ),
                decoration: InputDecoration(
                  counterText: '',
                  hintText: 'CODE12',
                  hintStyle: TextStyle(color: NeetTokens.textMuted.withValues(alpha: 0.4), letterSpacing: 4),
                  filled: true,
                  fillColor: NeetTokens.bgCard,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                    borderSide: const BorderSide(color: NeetTokens.border),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(NeetTokens.radiusSm),
                    borderSide: const BorderSide(color: NeetTokens.warning, width: 2),
                  ),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogCtx),
              child: const Text('Cancel', style: TextStyle(color: NeetTokens.textMuted)),
            ),
            ElevatedButton(
              onPressed: () async {
                final code = _joinCodeController.text.trim();
                if (code.length < 4) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please enter a valid room code.')),
                  );
                  return;
                }
                Navigator.pop(dialogCtx);
                await _executeJoinRoom(code);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: NeetTokens.warning,
                foregroundColor: Colors.black,
              ),
              child: const Text('Join Room →', style: TextStyle(fontWeight: FontWeight.w800)),
            ),
          ],
        );
      },
    );
  }

  Future<void> _executeJoinRoom(String inviteCode) async {
    setState(() => _isJoiningRoom = true);
    NeetTokens.hapticMedium();

    try {
      final res = await _apiClient.joinBattlegroundRoom(inviteCode);
      if (!mounted) return;
      setState(() => _isJoiningRoom = false);

      if (res.statusCode == 200 && res.data != null) {
        final battleId = res.data['battleId']?.toString() ?? '';
        final stateRes = await _apiClient.getBattlegroundState(battleId);

        if (mounted && stateRes.statusCode == 200 && stateRes.data != null) {
          final battleObj = stateRes.data['battle'] as Map<String, dynamic>? ?? {};
          final rawQs = (battleObj['questions'] as List<dynamic>?) ?? [];
          if (rawQs.isNotEmpty) {
            final testData = {
              'id': battleId,
              'questions': rawQs,
              'timeLimit': (battleObj['timeLimitSeconds'] as int?) ?? 15 * 60,
            };
            _navigateToTestEngine('Live Room Battle', testData);
            return;
          }
        }

        // Fallback: generate custom test for room
        final testRes = await _apiClient.generateTest(type: 'custom', questionCount: 15);
        if (mounted && testRes.statusCode == 200 && testRes.data != null) {
          _navigateToTestEngine('Live Room Battle', Map<String, dynamic>.from(testRes.data as Map));
        }
      } else {
        final msg = res.data?['error']?.toString() ?? 'Invalid or expired room code.';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg), backgroundColor: NeetTokens.warning),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isJoiningRoom = false);
        String msg = 'Could not join room. Check code and connection.';
        if (e is DioException) {
          if (e.response?.statusCode == 401) {
            msg = 'Session expired or not signed in. Please sign in.';
          } else if (e.response?.data is Map && e.response?.data['error'] != null) {
            msg = e.response!.data['error'].toString();
          }
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg), backgroundColor: NeetTokens.warning),
        );
      }
    }
  }

  // ── Mode 3: Solo Blitz Practice ────────────────────────────────
  Future<void> _startSoloBlitz() async {
    setState(() => _isSearchingSolo = true);
    NeetTokens.hapticMedium();

    try {
      final testRes = await _apiClient.generateTest(
        type: 'custom',
        questionCount: 5,
      );

      if (mounted) {
        setState(() => _isSearchingSolo = false);
        NeetTokens.hapticSuccess();

        if (testRes.statusCode == 200 && testRes.data != null) {
          final testData = Map<String, dynamic>.from(testRes.data as Map);
          testData['timeLimit'] = 60;
          testData['time_limit'] = 60;
          _navigateToTestEngine('Solo Speed Blitz (60s)', testData);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Matchmaking server busy. Please retry shortly.'),
              backgroundColor: NeetTokens.warning,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSearchingSolo = false);
        String msg = 'Could not start Solo Blitz. Please try again.';
        if (e is DioException) {
          if (e.response?.statusCode == 401) {
            msg = 'Session expired or not signed in. Please sign in.';
          } else if (e.response?.data is Map && e.response?.data['error'] != null) {
            msg = e.response!.data['error'].toString();
          } else if (e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.receiveTimeout) {
            msg = 'Server took too long to respond. Please tap Play again.';
          }
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(msg),
            backgroundColor: NeetTokens.warning,
          ),
        );
      }
    }
  }

  void _navigateToTestEngine(String title, Map<String, dynamic> testData) {
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
            Icon(Icons.sports_esports, color: NeetTokens.warning),
            SizedBox(width: 8),
            Text(
              'Battleground & Duels',
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
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. WhatsApp 1v1 Peer Duel Card (Virality Engine)
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      NeetTokens.bgCard,
                      NeetTokens.accentPrimary.withValues(alpha: 0.18),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
                  border: Border.all(color: NeetTokens.accentPrimary.withValues(alpha: 0.4)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: NeetTokens.accentPrimary.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.flash_on_rounded, color: NeetTokens.accentPrimary, size: 20),
                            ),
                            const SizedBox(width: 10),
                            const Text(
                              '1V1 WHATSAPP PEER DUEL',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: NeetTokens.accentPrimary,
                                letterSpacing: 1.1,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: NeetTokens.accentPrimary.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('10 Qs', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: NeetTokens.accentPrimary)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Challenge a Friend ⚔️',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: NeetTokens.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Generate a high-yield 10-question duel link and send it directly on WhatsApp. Beat their score and climb the leaderboards!',
                      style: TextStyle(fontSize: 13, color: NeetTokens.textSecondary, height: 1.4),
                    ),
                    const SizedBox(height: 18),
                    ElevatedButton.icon(
                      onPressed: _isCreatingDuel ? null : _handleCreate1v1Duel,
                      icon: _isCreatingDuel
                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Icon(Icons.share, color: Colors.white, size: 18),
                      label: Text(
                        _isCreatingDuel ? 'Generating Duel...' : 'Create 1v1 WhatsApp Duel →',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: NeetTokens.accentGlow,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusSm)),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // 2. Multiplayer Live Room (Up to 200 Users)
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      NeetTokens.bgCard,
                      NeetTokens.warning.withValues(alpha: 0.16),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
                  border: Border.all(color: NeetTokens.warning.withValues(alpha: 0.4)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: NeetTokens.warning.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.groups_rounded, color: NeetTokens.warning, size: 20),
                            ),
                            const SizedBox(width: 10),
                            const Text(
                              'LIVE MULTIPLAYER ROOM',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: NeetTokens.warning,
                                letterSpacing: 1.1,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: NeetTokens.warning.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('Up to 200 Players', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: NeetTokens.warning)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Host or Join Live Arena 🏟️',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: NeetTokens.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Compete in real time with your coaching batch or school friends using a 6-character room code.',
                      style: TextStyle(fontSize: 13, color: NeetTokens.textSecondary, height: 1.4),
                    ),
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _isCreatingRoom ? null : _handleCreateLiveRoom,
                            icon: _isCreatingRoom
                                ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                                : const Icon(Icons.add_circle_outline, color: Colors.black, size: 18),
                            label: Text(
                              _isCreatingRoom ? 'Creating...' : 'Host Room',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.black),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: NeetTokens.warning,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusSm)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _isJoiningRoom ? null : _showJoinRoomDialog,
                            icon: _isJoiningRoom
                                ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: NeetTokens.warning))
                                : const Icon(Icons.login_rounded, color: NeetTokens.warning, size: 18),
                            label: Text(
                              _isJoiningRoom ? 'Joining...' : 'Join Code',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: NeetTokens.warning),
                            ),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: NeetTokens.warning),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusSm)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // 3. Solo Rapid Blitz Match
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: NeetTokens.bgSecondary,
                  borderRadius: BorderRadius.circular(NeetTokens.radiusLg),
                  border: Border.all(color: NeetTokens.border),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: NeetTokens.physicsColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.bolt, color: NeetTokens.physicsColor, size: 24),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            'Solo Speed Blitz',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: NeetTokens.textPrimary),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Instant 5-question speed test for quick training',
                            style: TextStyle(fontSize: 12, color: NeetTokens.textMuted),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: _isSearchingSolo ? null : _startSoloBlitz,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: NeetTokens.physicsColor,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(NeetTokens.radiusSm)),
                      ),
                      child: _isSearchingSolo
                          ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Play →', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Live Leaderboard
              const Text(
                'Top Battle Rankers 🏆',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: NeetTokens.textPrimary,
                ),
              ),
              const SizedBox(height: 12),

              _buildRankerRow(1, 'Aarav Sharma', '2,840 XP', '🔥 14 Wins'),
              _buildRankerRow(2, 'Ananya Iyer', '2,610 XP', '🔥 11 Wins'),
              _buildRankerRow(3, 'Rohan Verma', '2,490 XP', '🔥 9 Wins'),
              _buildRankerRow(4, 'Sneha Patel', '2,320 XP', '🔥 8 Wins'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRankerRow(int rank, String name, String xp, String streak) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: NeetTokens.bgSecondary,
        borderRadius: BorderRadius.circular(NeetTokens.radiusMd),
        border: Border.all(color: NeetTokens.border),
      ),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: rank == 1
                  ? NeetTokens.warning.withValues(alpha: 0.2)
                  : Colors.transparent,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Text(
              '#$rank',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: rank == 1 ? NeetTokens.warning : NeetTokens.textMuted,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              name,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: NeetTokens.textPrimary,
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                xp,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: NeetTokens.chemistryColor,
                ),
              ),
              Text(
                streak,
                style: const TextStyle(
                  fontSize: 10,
                  color: NeetTokens.textMuted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/api_client.dart';

class BattlegroundScreen extends ConsumerStatefulWidget {
  const BattlegroundScreen({super.key});
  @override
  ConsumerState<BattlegroundScreen> createState() => _BattlegroundScreenState();
}

class _BattlegroundScreenState extends ConsumerState<BattlegroundScreen> {
  final _codeCtrl = TextEditingController();
  bool _loading = false;
  String? _battleId;
  String? _inviteCode;
  String _status = 'lobby'; // lobby, active, results

  Future<void> _createBattle() async {
    setState(() => _loading = true);
    try {
      final data = await ApiClient().createBattle(30, 3600);
      if (mounted) {
        setState(() {
          _battleId = data['battleId']?.toString();
          _inviteCode = data['inviteCode']?.toString();
          _status = 'lobby';
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e'), backgroundColor: const Color(0xFFef4444)));
      }
    }
  }

  Future<void> _joinBattle() async {
    if (_codeCtrl.text.trim().isEmpty) return;
    setState(() => _loading = true);
    try {
      final data = await ApiClient().joinBattle(_codeCtrl.text.trim().toUpperCase());
      if (mounted) {
        setState(() {
          _battleId = data['battleId']?.toString();
          _inviteCode = _codeCtrl.text.trim().toUpperCase();
          _status = 'lobby';
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e'), backgroundColor: const Color(0xFFef4444)));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_battleId != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('⚔️ Battle Lobby')),
        body: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF1a1040), Color(0xFF2d1b69)]),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  children: [
                    const Text('Battle Created!', style: TextStyle(color: Color(0xFFf1f5f9), fontSize: 18, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 12),
                    const Text('Share this code with your opponent:', style: TextStyle(color: Color(0xFF94a3b8))),
                    const SizedBox(height: 12),
                    GestureDetector(
                      onTap: () => Clipboard.setData(ClipboardData(text: _inviteCode ?? '')),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF6366f1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(_inviteCode ?? '', style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: 4)),
                            const SizedBox(width: 10),
                            const Icon(Icons.copy, color: Colors.white70, size: 18),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    const Text('Tap to copy', style: TextStyle(color: Color(0xFF64748b), fontSize: 12)),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text('Waiting for opponent...', style: TextStyle(color: Color(0xFF94a3b8))),
              const SizedBox(height: 12),
              const CircularProgressIndicator(color: Color(0xFF6366f1)),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => setState(() { _battleId = null; _inviteCode = null; }),
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF334155)),
                  child: const Text('Cancel'),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('⚔️ Battleground')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Hero banner
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF7f1d1d), Color(0xFF991b1b)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                children: [
                  const Text('⚔️', style: TextStyle(fontSize: 48)),
                  const SizedBox(height: 12),
                  const Text('NEET Battle Arena', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 6),
                  const Text('Challenge friends. Prove your knowledge.', textAlign: TextAlign.center, style: TextStyle(color: Colors.white70)),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Create battle
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton.icon(
                onPressed: _loading ? null : _createBattle,
                icon: const Icon(Icons.add_circle_outline),
                label: const Text('Create New Battle', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFef4444), foregroundColor: Colors.white),
              ),
            ),
            const SizedBox(height: 16),
            const Text('— or join with a code —', style: TextStyle(color: Color(0xFF64748b))),
            const SizedBox(height: 16),

            // Join battle
            TextField(
              controller: _codeCtrl,
              textCapitalization: TextCapitalization.characters,
              decoration: const InputDecoration(hintText: 'Enter invite code', prefixIcon: Icon(Icons.key, color: Color(0xFF64748b))),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: OutlinedButton(
                onPressed: _loading ? null : _joinBattle,
                style: OutlinedButton.styleFrom(side: const BorderSide(color: Color(0xFF6366f1))),
                child: const Text('Join Battle', style: TextStyle(color: Color(0xFF6366f1), fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

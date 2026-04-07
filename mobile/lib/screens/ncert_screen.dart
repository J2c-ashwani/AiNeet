import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

// NCERT uses a scoped WebView just for the PDF reader — the rest of the app is fully native.
class NcertScreen extends StatefulWidget {
  const NcertScreen({super.key});
  @override
  State<NcertScreen> createState() => _NcertScreenState();
}

class _NcertScreenState extends State<NcertScreen> {
  late final WebViewController _webCtrl;
  bool _loading = true;

  static const _ncertUrl = 'https://ai-neet.vercel.app/ncert';

  @override
  void initState() {
    super.initState();
    _webCtrl = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0a0e1a))
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (_) => setState(() => _loading = true),
        onPageFinished: (_) => setState(() => _loading = false),
      ))
      ..loadRequest(Uri.parse(_ncertUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('📖 NCERT Library')),
      body: Stack(
        children: [
          WebViewWidget(controller: _webCtrl),
          if (_loading) const Center(child: CircularProgressIndicator(color: Color(0xFF6366f1))),
        ],
      ),
    );
  }
}

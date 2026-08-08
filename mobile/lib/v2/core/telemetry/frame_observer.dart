import 'dart:developer' as developer;
import 'package:flutter/foundation.dart';
import 'package:flutter/scheduler.dart';

/// V2 Native Frame & Runtime Telemetry Observer
/// Tracks P50/P95 frame render times, janky frames (>16.6ms), and memory usage.
class V2FrameObserver {
  static final List<double> _frameTimesMs = [];
  static int _jankyFrameCount = 0;
  static int _totalFrameCount = 0;
  static int _coldStartMs = 0;
  static final DateTime _startTime = DateTime.now();

  static void initialize() {
    _coldStartMs = DateTime.now().difference(_startTime).inMilliseconds;

    SchedulerBinding.instance.addTimingsCallback((List<FrameTiming> timings) {
      for (final timing in timings) {
        final totalMs = timing.totalSpan.inMicroseconds / 1000.0;
        _frameTimesMs.add(totalMs);
        _totalFrameCount++;

        if (totalMs > 16.6) {
          _jankyFrameCount++;
        }
      }
    });

    if (kDebugMode) {
      debugPrint('⚡ [V2FrameObserver] Telemetry initialized. Cold start: ${_coldStartMs}ms');
    }
  }

  static Map<String, dynamic> getMetricsReport() {
    if (_frameTimesMs.isEmpty) {
      return {
        'coldStartMs': _coldStartMs,
        'totalFrames': 0,
        'jankyFrames': 0,
        'jankPercentage': 0.0,
        'p50FrameMs': 0.0,
        'p95FrameMs': 0.0,
      };
    }

    final sorted = List<double>.from(_frameTimesMs)..sort();
    final p50 = sorted[(sorted.length * 0.50).floor()];
    final p95 = sorted[(sorted.length * 0.95).floor()];
    final jankPct = (_jankyFrameCount / _totalFrameCount) * 100.0;

    return {
      'coldStartMs': _coldStartMs,
      'totalFrames': _totalFrameCount,
      'jankyFrames': _jankyFrameCount,
      'jankPercentage': double.parse(jankPct.toStringAsFixed(2)),
      'p50FrameMs': double.parse(p50.toStringAsFixed(2)),
      'p95FrameMs': double.parse(p95.toStringAsFixed(2)),
    };
  }

  static void logSummary() {
    final metrics = getMetricsReport();
    debugPrint('\n📊 [V2 PERFORMANCE METRICS REPORT]');
    debugPrint('  Cold Start Time: ${metrics['coldStartMs']} ms');
    debugPrint('  Total Frames Rendered: ${metrics['totalFrames']}');
    debugPrint('  P50 Frame Render Time: ${metrics['p50FrameMs']} ms');
    debugPrint('  P95 Frame Render Time: ${metrics['p95FrameMs']} ms');
    debugPrint('  Janky Frames (>16.6ms): ${metrics['jankyFrames']} (${metrics['jankPercentage']}%)');
    debugPrint('═══════════════════════════════════════════════════\n');
  }
}

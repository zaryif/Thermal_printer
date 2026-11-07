import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

class RasterResult {
  final Uint8List monoBytes;
  final int widthDots;
  final int heightDots;

  RasterResult({
    required this.monoBytes,
    required this.widthDots,
    required this.heightDots,
  });
}

class RasterizerService {
  /// Captures a RenderRepaintBoundary directly to 1-bit monochrome bytes.
  /// Uses exact Capacitor / Tiny Print reference calibration:
  /// - Luminance: 0.299*R + 0.587*G + 0.114*B
  /// - Contrast enhancement: 1.15 factor
  /// - Binarization threshold: 138
  /// - LSB-first bit packing (Bit 0 = leftmost dot, Bit 7 = rightmost dot)
  static Future<RasterResult> captureReceiptToMono(
    GlobalKey boundaryKey,
    int targetWidthDots,
  ) async {
    final RenderRepaintBoundary? boundary =
        boundaryKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;

    if (boundary == null) {
      throw Exception('RepaintBoundary not found for receipt key');
    }

    // 1. Capture live Flutter widget to uncompressed RGBA image at 1:1 pixel scale
    final ui.Image image = await boundary.toImage(pixelRatio: 1.0);
    final ByteData? byteData =
        await image.toByteData(format: ui.ImageByteFormat.rawRgba);

    if (byteData == null) {
      throw Exception('Failed to obtain raw RGBA byte data from canvas image');
    }

    final int width = image.width;
    final int height = image.height;
    final Uint8List rgba = byteData.buffer.asUint8List();

    // 2. Direct LSB-first binarization with contrast = 1.15 and threshold = 138
    final int bytesPerRow = (targetWidthDots + 7) ~/ 8;
    final Uint8List packedBytes = Uint8List(bytesPerRow * height);

    for (int y = 0; y < height; y++) {
      final int rowOffset = y * width;
      final int targetRowOffset = y * bytesPerRow;

      for (int x = 0; x < targetWidthDots; x++) {
        if (x < width) {
          final int idx = (rowOffset + x) * 4;
          final int r = rgba[idx];
          final int g = rgba[idx + 1];
          final int b = rgba[idx + 2];
          final int a = rgba[idx + 3];

          double gray;
          if (a < 255) {
            final double alpha = a / 255.0;
            final double br = r * alpha + 255 * (1 - alpha);
            final double bg = g * alpha + 255 * (1 - alpha);
            final double bb = b * alpha + 255 * (1 - alpha);
            gray = 0.299 * br + 0.587 * bg + 0.114 * bb;
          } else {
            gray = 0.299 * r + 0.587 * g + 0.114 * b;
          }

          // Contrast adjustment (1.15) matching Capacitor printEngine.ts
          final double adjusted = (gray - 128.0) * 1.15 + 128.0;

          // Pure crisp black dot if darker than threshold 138
          if (adjusted < 138.0) {
            final int byteIdx = targetRowOffset + (x ~/ 8);
            final int bitPos = x % 8; // LSB first for Tiny Print hardware
            packedBytes[byteIdx] |= (1 << bitPos);
          }
        }
      }
    }

    return RasterResult(
      monoBytes: packedBytes,
      widthDots: targetWidthDots,
      heightDots: height,
    );
  }
}

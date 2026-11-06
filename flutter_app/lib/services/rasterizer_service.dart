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
  /// Captures a RenderRepaintBoundary directly to 1-bit monochrome bytes
  /// Uses LSB-first bit packing calibrated for Tiny Print & ESC/POS thermal heads
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

    // 2. Grayscale matrix conversion with Floyd-Steinberg error diffusion
    final List<double> grayMatrix = List<double>.filled(width * height, 255.0);
    for (int i = 0; i < width * height; i++) {
      final int r = rgba[i * 4];
      final int g = rgba[i * 4 + 1];
      final int b = rgba[i * 4 + 2];
      final int a = rgba[i * 4 + 3];

      // Alpha blend onto white background (#FFFFFF)
      if (a < 255) {
        final double alpha = a / 255.0;
        final double blendedR = r * alpha + 255 * (1 - alpha);
        final double blendedG = g * alpha + 255 * (1 - alpha);
        final double blendedB = b * alpha + 255 * (1 - alpha);
        grayMatrix[i] = 0.299 * blendedR + 0.587 * blendedG + 0.114 * blendedB;
      } else {
        grayMatrix[i] = 0.299 * r + 0.587 * g + 0.114 * b;
      }
    }

    // 3. Error-diffusion binarization (Floyd-Steinberg)
    final List<int> binaryPixels = List<int>.filled(width * height, 0); // 1 = black, 0 = white

    for (int y = 0; y < height; y++) {
      for (int x = 0; x < width; x++) {
        final int idx = y * width + x;
        final double currentVal = grayMatrix[idx];
        final int binaryVal = currentVal < 138 ? 1 : 0; // 1 = Black dot, 0 = White
        binaryPixels[idx] = binaryVal;

        final double error = currentVal - (binaryVal == 1 ? 0.0 : 255.0);

        // Distribute error
        if (x + 1 < width) {
          grayMatrix[idx + 1] += error * (7.0 / 16.0);
        }
        if (y + 1 < height) {
          if (x - 1 >= 0) {
            grayMatrix[(y + 1) * width + (x - 1)] += error * (3.0 / 16.0);
          }
          grayMatrix[(y + 1) * width + x] += error * (5.0 / 16.0);
          if (x + 1 < width) {
            grayMatrix[(y + 1) * width + (x + 1)] += error * (1.0 / 16.0);
          }
        }
      }
    }

    // 4. LSB-first bit packing (8 pixels per byte, bit 0 = leftmost dot)
    final int bytesPerRow = (targetWidthDots + 7) ~/ 8;
    final Uint8List packedBytes = Uint8List(bytesPerRow * height);

    for (int y = 0; y < height; y++) {
      for (int x = 0; x < targetWidthDots; x++) {
        if (x < width) {
          final int dot = binaryPixels[y * width + x];
          if (dot == 1) {
            final int byteIdx = y * bytesPerRow + (x ~/ 8);
            final int bitPos = x % 8; // LSB first for Tiny Print
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

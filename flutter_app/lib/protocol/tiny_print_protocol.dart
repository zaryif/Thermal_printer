import 'dart:typed_data';

/// Pure Dart implementation of the Tiny Print (0x51 0x78) thermal printer hardware protocol
/// Reverse-engineered directly from com.frogtosea.tinyPrint APK (BluetoothOrder.java & PrintDataUtils.java)
/// Calibrated to match the exact Capacitor / Tiny Print reference encoder.
class TinyPrintProtocol {
  static const int headerMagic0 = 0x51;
  static const int headerMagic1 = 0x78;

  // CRC-8 Lookup Table (Polynomial 0x07) from Tiny Print BluetoothOrder.java
  static const List<int> crcTable = [
    0, 7, 14, 9, 28, 27, 18, 21, 56, 63, 54, 49, 36, 35, 42, 45,
    112, 119, 126, 121, 108, 107, 98, 101, 72, 79, 70, 65, 84, 83, 90, 93,
    224, 231, 238, 233, 252, 251, 242, 245, 216, 223, 214, 209, 196, 195, 202, 205,
    144, 151, 158, 153, 140, 139, 130, 133, 168, 175, 166, 161, 180, 179, 186, 189,
    199, 192, 201, 206, 219, 220, 213, 210, 255, 248, 241, 246, 227, 228, 237, 234,
    183, 176, 185, 190, 171, 172, 165, 162, 143, 136, 129, 134, 147, 148, 157, 154,
    39, 32, 41, 46, 59, 60, 53, 50, 31, 24, 17, 22, 3, 4, 13, 10,
    87, 80, 89, 94, 75, 76, 69, 66, 111, 104, 97, 102, 115, 116, 125, 122,
    137, 142, 135, 128, 149, 146, 155, 156, 177, 182, 191, 184, 173, 170, 163, 164,
    249, 254, 247, 240, 229, 226, 235, 236, 193, 198, 207, 200, 221, 218, 211, 212,
    105, 110, 103, 96, 117, 114, 123, 124, 81, 86, 95, 88, 77, 74, 67, 68,
    25, 30, 23, 16, 5, 2, 11, 12, 33, 38, 47, 40, 61, 58, 51, 52,
    78, 73, 64, 71, 82, 85, 92, 91, 118, 113, 120, 127, 106, 109, 100, 99,
    62, 57, 48, 55, 34, 37, 44, 43, 6, 1, 8, 15, 26, 29, 20, 19,
    174, 169, 160, 167, 178, 181, 188, 187, 150, 145, 152, 159, 138, 141, 132, 131,
    222, 217, 208, 215, 194, 197, 204, 203, 230, 225, 232, 239, 250, 253, 244, 243
  ];

  /// Calculates CRC8 checksum over slice of bytes
  static int calcCrc8(Uint8List data, int offset, int length) {
    int crc = 0;
    for (int i = offset; i < offset + length; i++) {
      crc = crcTable[(crc ^ data[i]) & 0xFF];
    }
    return crc;
  }

  /// Builds a standard Tiny Print packet envelope [0x51, 0x78, cmd, 0x00, len_lsb, len_msb, payload..., crc8, 0xFF]
  static Uint8List buildPacket(int cmd, Uint8List payload) {
    final int payloadLen = payload.length;
    final Uint8List packet = Uint8List(payloadLen + 8);

    packet[0] = headerMagic0;
    packet[1] = headerMagic1;
    packet[2] = cmd & 0xFF;
    packet[3] = 0x00;
    packet[4] = payloadLen & 0xFF;
    packet[5] = (payloadLen >> 8) & 0xFF;

    for (int i = 0; i < payloadLen; i++) {
      packet[6 + i] = payload[i];
    }

    packet[payloadLen + 6] = calcCrc8(packet, 6, payloadLen);
    packet[payloadLen + 7] = 0xFF;

    return packet;
  }

  /// Query device status (ready, out of paper, overheated)
  static Uint8List getDevState() {
    return buildPacket(0xA3, Uint8List.fromList([0x00]));
  }

  /// Sets print concentration / energy level (Level 5 = Deepen)
  static Uint8List setConcentration(int level) {
    final int safeLevel = level.clamp(1, 5);
    return buildPacket(0xA4, Uint8List.fromList([0x30 + safeLevel]));
  }

  /// Custom pulse heating energy in microseconds (9200us for rich dark blacks)
  static Uint8List setCustomEnergy(int energyUs) {
    final int lsb = energyUs & 0xFF;
    final int msb = (energyUs >> 8) & 0xFF;
    return buildPacket(0xAF, Uint8List.fromList([lsb, msb]));
  }

  /// Sets motor feed speed (10 for X5h)
  static Uint8List setFeedSpeed(int speed) {
    return buildPacket(0xBD, Uint8List.fromList([speed.clamp(1, 40)]));
  }

  /// Sets print text mode: 0x51 0x78 0xBE 0x00 0x01 0x00 0x01 0x07 0xFF
  static Uint8List setPrintTextMode() {
    return buildPacket(0xBE, Uint8List.fromList([0x01]));
  }

  /// Paper feed command (advance paper by blank steps)
  static Uint8List feedPaperSteps(int steps) {
    final int lsb = steps & 0xFF;
    final int msb = (steps >> 8) & 0xFF;
    return buildPacket(0xA1, Uint8List.fromList([lsb, msb]));
  }

  /// Encodes the entire print job into Tiny Print's byte stream.
  /// Exactly matches the Capacitor / reference tinyPrintEncoder.ts implementation.
  static Uint8List encodeTinyPrintStream(
    Uint8List monoBytes,
    int widthDots,
    int heightDots, {
    int concentration = 5,
  }) {
    final int bytesPerLine = widthDots ~/ 8;
    final BytesBuilder builder = BytesBuilder();

    // 1. Concentration / Blackening quality command (Level 5)
    final int qualityByte = 0x30 + concentration.clamp(1, 5);
    final int qualityCrc = crcTable[(0 ^ qualityByte) & 0xFF];
    builder.add([0x51, 0x78, 0xA4, 0x00, 0x01, 0x00, qualityByte, qualityCrc, 0xFF]);

    // 2. Heating Energy Command: 9200us (0x23F0) -> [0xF0, 0x23]
    final int textEnergy = concentration == 5 ? 9200 : 8000;
    final int energyLo = textEnergy & 0xFF;
    final int energyHi = (textEnergy >> 8) & 0xFF;
    int energyCrc = crcTable[(0 ^ energyLo) & 0xFF];
    energyCrc = crcTable[(energyCrc ^ energyHi) & 0xFF];
    builder.add([0x51, 0x78, 0xAF, 0x00, 0x02, 0x00, energyLo, energyHi, energyCrc, 0xFF]);

    // 3. Print Text Mode Command (0xBE)
    builder.add([0x51, 0x78, 0xBE, 0x00, 0x01, 0x00, 0x01, 0x07, 0xFF]);

    // 4. Print Speed Command (feedPaper 10 for X5h)
    builder.add([0x51, 0x78, 0xBD, 0x00, 0x01, 0x00, 0x0A, 0x36, 0xFF]);

    // 5. Uncompressed Raster Lines:
    // Each line: 0x51 0x78 0xA2 0x00 [bytesPerLine LSB] [bytesPerLine MSB] [lineBytes] [crc] 0xFF
    for (int row = 0; row < heightDots; row++) {
      final int rowOffset = row * bytesPerLine;
      if (rowOffset + bytesPerLine > monoBytes.length) break;

      final Uint8List lineBytes = monoBytes.sublist(rowOffset, rowOffset + bytesPerLine);
      int lineCrc = 0;
      for (int i = 0; i < bytesPerLine; i++) {
        lineCrc = crcTable[(lineCrc ^ lineBytes[i]) & 0xFF];
      }

      builder.add([
        0x51,
        0x78,
        0xA2,
        0x00,
        bytesPerLine & 0xFF,
        (bytesPerLine >> 8) & 0xFF,
      ]);
      builder.add(lineBytes);
      builder.add([lineCrc, 0xFF]);
    }

    // 6. Compact Bottom White Margin & Feed past tear blade
    // Feed 30 steps
    builder.add([0x51, 0x78, 0xBD, 0x00, 0x01, 0x00, 0x1E, 0x5A, 0xFF]);

    // Paper Feed (48 lines) x 2 = 12 mm advance past tear blade
    final List<int> paperCmd = [0x51, 0x78, 0xA1, 0x00, 0x02, 0x00, 0x30, 0x00, 0xF9, 0xFF];
    builder.add(paperCmd);
    builder.add(paperCmd);

    // Device status check
    builder.add([0x51, 0x78, 0xA3, 0x00, 0x01, 0x00, 0x00, 0x00, 0xFF]);

    return builder.toBytes();
  }
}

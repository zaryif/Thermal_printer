/**
 * Tiny Print (Frogtosea / X5 / X5h / WalkPrint) Hardware Protocol Encoder
 * Reverse-engineered directly from Tiny Print 1.3.87 (com.frogtosea.tinyPrint)
 * Calibrated specifically for model X5h-399A and compatible 203 DPI thermal printers.
 */

const CRC8_TABLE = new Uint8Array([
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
]);

export function calcCrc8(data: Uint8Array | number[]): number {
  let crc = 0;
  for (let i = 0; i < data.length; i++) {
    crc = CRC8_TABLE[(crc ^ data[i]) & 0xFF];
  }
  return crc;
}

/**
 * Encodes an image into Tiny Print's proprietary 0x51 0x78 stream.
 *
 * @param width Image width in pixels (typically 384 for 58mm paper)
 * @param height Image height in pixels
 * @param binaryBits 1-bit array where 1 = black dot, 0 = white dot
 * @param concentration Concentration level: 1 (lightest) to 5 (deepest black). Default is 5.
 */
export function encodeTinyPrintImage(
  width: number,
  height: number,
  binaryBits: Uint8Array | number[],
  concentration: number = 5
): Uint8Array {
  const bytesPerLine = Math.floor(width / 8); // 48 bytes for 384 dots
  const buffer: number[] = [];

  // 1. Concentration / Blackening quality command
  // Level 5: 0x51 0x78 0xA4 0x00 0x01 0x00 0x35 0x8B 0xFF
  const qualityByte = 0x30 + concentration; // ASCII '1' - '5'
  const qualityCrc = calcCrc8([qualityByte]);
  buffer.push(0x51, 0x78, 0xA4, 0x00, 0x01, 0x00, qualityByte, qualityCrc, 0xFF);

  // 2. Heating Energy Command
  // Model X5h base text energy is 8000; concentration 5 adds +15% = 9200 (0x23F0)
  // Little-endian payload: [0xF0, 0x23]
  const textEnergy = concentration === 5 ? 9200 : 8000;
  const energyLo = textEnergy & 0xFF;
  const energyHi = (textEnergy >> 8) & 0xFF;
  const energyCrc = calcCrc8([energyLo, energyHi]);
  buffer.push(0x51, 0x78, 0xAF, 0x00, 0x02, 0x00, energyLo, energyHi, energyCrc, 0xFF);

  // 3. Print Text Mode Command
  // 0x51 0x78 0xBE 0x00 0x01 0x00 0x01 0x07 0xFF
  buffer.push(0x51, 0x78, 0xBE, 0x00, 0x01, 0x00, 0x01, 0x07, 0xFF);

  // 4. Print Speed Command (feedPaper(10) for X5h)
  // 0x51 0x78 0xBD 0x00 0x01 0x00 0x0A 0x36 0xFF
  buffer.push(0x51, 0x78, 0xBD, 0x00, 0x01, 0x00, 0x0A, 0x36, 0xFF);

  // 5. Uncompressed Raster Lines
  // Each line is framed as: 0x51 0x78 0xA2 0x00 0x30 0x00 [48 bytes] [CRC] 0xFF
  // NOTE: Tiny Print bit order within each byte is LSB-first (P0 is bit 0, P7 is bit 7)!
  const isRawPixels = binaryBits.length >= width * height;

  for (let row = 0; row < height; row++) {
    const lineBytes = new Uint8Array(bytesPerLine);

    if (isRawPixels) {
      const rowOffset = row * width;
      for (let colByte = 0; colByte < bytesPerLine; colByte++) {
        const pxIdx = rowOffset + colByte * 8;
        const b =
          ((binaryBits[pxIdx + 7] ? 1 : 0) << 7) |
          ((binaryBits[pxIdx + 6] ? 1 : 0) << 6) |
          ((binaryBits[pxIdx + 5] ? 1 : 0) << 5) |
          ((binaryBits[pxIdx + 4] ? 1 : 0) << 4) |
          ((binaryBits[pxIdx + 3] ? 1 : 0) << 3) |
          ((binaryBits[pxIdx + 2] ? 1 : 0) << 2) |
          ((binaryBits[pxIdx + 1] ? 1 : 0) << 1) |
          (binaryBits[pxIdx] ? 1 : 0);

        lineBytes[colByte] = b;
      }
    } else {
      // Input is already packed bytes (1 byte per 8 pixels, MSB-first)
      // Reverse each byte so P0 becomes LSB (Bit 0) and P7 becomes MSB (Bit 7)
      const rowOffset = row * bytesPerLine;
      for (let colByte = 0; colByte < bytesPerLine; colByte++) {
        const orig = binaryBits[rowOffset + colByte] || 0;
        let rev = 0;
        for (let bit = 0; bit < 8; bit++) {
          if ((orig & (1 << (7 - bit))) !== 0) {
            rev |= 1 << bit;
          }
        }
        lineBytes[colByte] = rev;
      }
    }

    const lineCrc = calcCrc8(lineBytes);

    buffer.push(
      0x51,
      0x78,
      0xA2,
      0x00,
      bytesPerLine & 0xFF,
      (bytesPerLine >> 8) & 0xFF
    );
    for (let b = 0; b < bytesPerLine; b++) {
      buffer.push(lineBytes[b]);
    }
    buffer.push(lineCrc, 0xFF);
  }

  // 6. Compact Bottom White Margin & Feed (advances neatly past tear blade without excess waste)
  // Feed 30 steps: 0x51 0x78 0xBD 0x00 0x01 0x00 0x1E 0x5A 0xFF
  buffer.push(0x51, 0x78, 0xBD, 0x00, 0x01, 0x00, 0x1E, 0x5A, 0xFF);

  // Paper Feed (48 lines) x 2 = 12 mm advance past tear blade
  const paperCmd = [0x51, 0x78, 0xA1, 0x00, 0x02, 0x00, 0x30, 0x00, 0xF9, 0xFF];
  buffer.push(...paperCmd);
  buffer.push(...paperCmd);

  // Device status query: 0x51 0x78 0xA3 0x00 0x01 0x00 0x00 0x00 0xFF
  buffer.push(0x51, 0x78, 0xA3, 0x00, 0x01, 0x00, 0x00, 0x00, 0xFF);

  return new Uint8Array(buffer);
}


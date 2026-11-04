/**
 * ESC/POS Command Encoder for Thermal Receipt & Label Printers
 */

export class EscPosEncoder {
  private buffer: number[] = [];

  constructor() {
    this.initialize();
  }

  public initialize(): this {
    // ESC @ - Initialize printer
    this.buffer.push(0x1b, 0x40);
    return this;
  }

  public align(align: 'left' | 'center' | 'right'): this {
    // ESC a n - Select justification
    const val = align === 'left' ? 0 : align === 'center' ? 1 : 2;
    this.buffer.push(0x1b, 0x61, val);
    return this;
  }

  public bold(enable: boolean): this {
    // ESC E n - Turn emphasized mode on/off
    this.buffer.push(0x1b, 0x45, enable ? 1 : 0);
    return this;
  }

  public underline(enable: boolean): this {
    // ESC - n - Turn underline mode on/off
    this.buffer.push(0x1b, 0x2d, enable ? 1 : 0);
    return this;
  }

  public invert(enable: boolean): this {
    // GS B n - Turn white/black reverse print mode on/off
    this.buffer.push(0x1d, 0x42, enable ? 1 : 0);
    return this;
  }

  public size(widthMult: 1 | 2 | 3 | 4 = 1, heightMult: 1 | 2 | 3 | 4 = 1): this {
    // GS ! n - Select character size
    const n = ((widthMult - 1) << 4) | (heightMult - 1);
    this.buffer.push(0x1d, 0x21, n);
    return this;
  }

  public lineFeed(lines: number = 1): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0a);
    }
    return this;
  }

  public text(str: string): this {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
    return this;
  }

  public line(str: string): this {
    this.text(str);
    this.buffer.push(0x0a);
    return this;
  }

  /**
   * Adds raw raster image bytes using ESC/POS "GS v 0" command
   * @param width Pixel width (must be multiple of 8)
   * @param height Pixel height
   * @param binaryBits Packed 1-bit array (1 bit per pixel, MSB first)
   */
  public rasterImage(width: number, height: number, binaryBits: Uint8Array): this {
    const bytesPerRow = Math.ceil(width / 8);
    const xL = bytesPerRow % 256;
    const xH = Math.floor(bytesPerRow / 256);
    const yL = height % 256;
    const yH = Math.floor(height / 256);

    // GS v 0 0 xL xH yL yH [data]
    this.buffer.push(0x1d, 0x76, 0x30, 0x00, xL, xH, yL, yH);

    for (let i = 0; i < binaryBits.length; i++) {
      this.buffer.push(binaryBits[i]);
    }
    return this;
  }

  /**
   * Splits a large raster image into vertical slices of maxLines each,
   * sending line-feeds between slices. This prevents buffer overflow
   * on budget Bluetooth thermal printers with small RAM.
   */
  public chunkedRasterImage(
    width: number,
    height: number,
    binaryBits: Uint8Array,
    sliceHeight: number = 200
  ): this {
    const bytesPerRow = Math.ceil(width / 8);

    for (let startY = 0; startY < height; startY += sliceHeight) {
      const currentSliceH = Math.min(sliceHeight, height - startY);
      const sliceSize = bytesPerRow * currentSliceH;
      const sliceStart = startY * bytesPerRow;
      const sliceBits = binaryBits.subarray(sliceStart, sliceStart + sliceSize);

      this.rasterImage(width, currentSliceH, sliceBits);
      // Small pause/line feed
      this.buffer.push(0x0a);
    }

    return this;
  }

  public cut(feedLines: number = 3): this {
    // GS V A n - Feed n lines and execute full/partial cut
    this.buffer.push(0x1d, 0x56, 0x41, feedLines);
    return this;
  }

  public encode(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

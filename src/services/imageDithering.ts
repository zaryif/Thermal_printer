import { DitherAlgorithm } from '../types/printer';

export interface ProcessedImageData {
  previewDataUrl: string;
  width: number;
  height: number;
  binaryBits: Uint8Array; // 1 byte per 8 pixels (MSB first) for ESC/POS GS v 0
  monoPixels: Uint8Array; // 1 byte per pixel (0 = white, 1 = black)
}

/**
 * 4x4 Bayer Matrix for Ordered Dithering
 */
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

/**
 * Applies contrast and brightness adjustments to a grayscale value (0-255)
 */
function adjustPixel(gray: number, contrast: number, brightness: number): number {
  let val = (gray - 128) * contrast + 128 + brightness;
  return Math.max(0, Math.min(255, val));
}

/**
 * Processes an image using high-quality dithering tailored for thermal receipt heads
 */
export async function processImageForThermal(
  imageSource: string | HTMLImageElement,
  targetWidth: number,
  algorithm: DitherAlgorithm = 'floyd-steinberg',
  threshold: number = 128,
  contrast: number = 1.15,
  brightness: number = 0,
  invert: boolean = false
): Promise<ProcessedImageData> {
  const img: HTMLImageElement = await new Promise((resolve, reject) => {
    if (typeof imageSource === 'string') {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = (err) => reject(err);
      image.src = imageSource;
    } else {
      resolve(imageSource);
    }
  });

  // Scale height to preserve aspect ratio, ensuring width matches target dots
  const scale = targetWidth / img.width;
  const targetHeight = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Fill with white background first in case of transparent PNGs
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imgData.data;

  // Convert to grayscale buffer with contrast & brightness applied
  const grayBuffer = new Float32Array(targetWidth * targetHeight);
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const idx = (y * targetWidth + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      // Standard perceptual luminance formula
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      let adjusted = adjustPixel(gray, contrast, brightness);
      if (invert) adjusted = 255 - adjusted;
      grayBuffer[y * targetWidth + x] = adjusted;
    }
  }

  // Monochrome buffer (0 for white paper, 1 for black thermal burn)
  const mono = new Uint8Array(targetWidth * targetHeight);

  if (algorithm === 'threshold') {
    for (let i = 0; i < grayBuffer.length; i++) {
      mono[i] = grayBuffer[i] < threshold ? 1 : 0;
    }
  } else if (algorithm === 'bayer') {
    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const idx = y * targetWidth + x;
        const matrixVal = (BAYER_4X4[y % 4][x % 4] / 16) * 255;
        mono[idx] = grayBuffer[idx] < matrixVal ? 1 : 0;
      }
    }
  } else if (algorithm === 'atkinson') {
    // Apple Atkinson Dithering - produces ultra-crisp thermal prints
    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const idx = y * targetWidth + x;
        const oldVal = grayBuffer[idx];
        const newVal = oldVal < threshold ? 0 : 255;
        mono[idx] = newVal === 0 ? 1 : 0;
        const err = (oldVal - newVal) >> 3; // divide by 8

        // Distribute to 6 neighbors
        if (x + 1 < targetWidth) grayBuffer[idx + 1] += err;
        if (x + 2 < targetWidth) grayBuffer[idx + 2] += err;
        if (x - 1 >= 0 && y + 1 < targetHeight) grayBuffer[(y + 1) * targetWidth + (x - 1)] += err;
        if (y + 1 < targetHeight) grayBuffer[(y + 1) * targetWidth + x] += err;
        if (x + 1 < targetWidth && y + 1 < targetHeight) grayBuffer[(y + 1) * targetWidth + (x + 1)] += err;
        if (y + 2 < targetHeight) grayBuffer[(y + 2) * targetWidth + x] += err;
      }
    }
  } else {
    // Floyd-Steinberg Dithering (Default)
    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const idx = y * targetWidth + x;
        const oldVal = grayBuffer[idx];
        const newVal = oldVal < threshold ? 0 : 255;
        mono[idx] = newVal === 0 ? 1 : 0;
        const err = oldVal - newVal;

        if (x + 1 < targetWidth) {
          grayBuffer[idx + 1] += (err * 7) / 16;
        }
        if (x - 1 >= 0 && y + 1 < targetHeight) {
          grayBuffer[(y + 1) * targetWidth + (x - 1)] += (err * 3) / 16;
        }
        if (y + 1 < targetHeight) {
          grayBuffer[(y + 1) * targetWidth + x] += (err * 5) / 16;
        }
        if (x + 1 < targetWidth && y + 1 < targetHeight) {
          grayBuffer[(y + 1) * targetWidth + (x + 1)] += (err * 1) / 16;
        }
      }
    }
  }

  // Update canvas for live preview rendering
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const idx = (y * targetWidth + x) * 4;
      const isBlack = mono[y * targetWidth + x] === 1;
      const color = isBlack ? 15 : 250; // realistic thermal ink
      data[idx] = color;
      data[idx + 1] = color;
      data[idx + 2] = color;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Pack into ESC/POS binary bits: 8 pixels per byte, MSB first
  const bytesPerRow = Math.ceil(targetWidth / 8);
  const binaryBits = new Uint8Array(bytesPerRow * targetHeight);

  for (let y = 0; y < targetHeight; y++) {
    for (let byteX = 0; byteX < bytesPerRow; byteX++) {
      let byteVal = 0;
      for (let bit = 0; bit < 8; bit++) {
        const x = byteX * 8 + bit;
        if (x < targetWidth) {
          const bitVal = mono[y * targetWidth + x];
          if (bitVal === 1) {
            byteVal |= 1 << (7 - bit);
          }
        }
      }
      binaryBits[y * bytesPerRow + byteX] = byteVal;
    }
  }

  return {
    previewDataUrl: canvas.toDataURL('image/png'),
    width: targetWidth,
    height: targetHeight,
    binaryBits,
    monoPixels: mono
  };
}


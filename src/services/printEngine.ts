import html2canvas from 'html2canvas';
import { EscPosEncoder } from './escposEncoder';
import { processImageForThermal } from './imageDithering';
import { printerService } from './bluetoothService';
import { PaperWidth } from '../types/printer';

export interface PrintResult {
  success: boolean;
  message?: string;
}

/**
 * Converts the DOM receipt into an ESC/POS raster stream and prints via Bluetooth/Serial
 */
export async function printReceiptElement(
  element: HTMLElement,
  paperWidth: PaperWidth,
  onProgress?: (percent: number) => void
): Promise<PrintResult> {
  const targetWidth = paperWidth === '58mm' ? 384 : 576;

  try {
    // 1. Capture DOM element to Canvas
    const canvas = await html2canvas(element, {
      scale: 1, // exact 1:1 pixel scale
      width: element.offsetWidth,
      height: element.offsetHeight,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false
    });

    // 2. Dither and binarize the entire rendered canvas
    const processed = await processImageForThermal(
      canvas.toDataURL('image/png'),
      targetWidth,
      'atkinson', // ultra-crisp for text & graphics
      128,
      1.2,
      0,
      false
    );

    // 3. Encode into ESC/POS binary format
    const encoder = new EscPosEncoder();
    encoder.initialize();
    encoder.align('center');

    // Send chunked raster image (200-line vertical slices to avoid printer RAM buffer overflow)
    encoder.chunkedRasterImage(
      processed.width,
      processed.height,
      processed.binaryBits,
      180
    );

    // Feed lines & cut
    encoder.lineFeed(3);
    encoder.cut(3);

    const payload = encoder.encode();

    // 4. Send over connected printer connection
    if (printerService.isConnected()) {
      await printerService.sendData(payload, onProgress);
      return { success: true, message: 'Printed successfully via Bluetooth!' };
    } else {
      // Fallback: Trigger native OS print dialog
      window.print();
      return {
        success: true,
        message: 'Opened System Print dialog (AirPrint / OS driver).'
      };
    }
  } catch (err: any) {
    console.error('Print engine error:', err);
    return {
      success: false,
      message: err.message || 'An error occurred while printing.'
    };
  }
}

/**
 * Generates and downloads a PNG snapshot of the thermal receipt
 */
export async function downloadReceiptPng(
  element: HTMLElement,
  paperWidth: PaperWidth
): Promise<void> {
  const targetWidth = paperWidth === '58mm' ? 384 : 576;

  const canvas = await html2canvas(element, {
    scale: 2, // 2x for sharp export
    useCORS: true,
    backgroundColor: '#FFFFFF'
  });

  const link = document.createElement('a');
  link.download = `thermal-receipt-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

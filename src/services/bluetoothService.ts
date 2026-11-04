/**
 * Bluetooth & Serial ESC/POS Printer Communication Service
 */

// Common Bluetooth Low Energy Service & Characteristic UUIDs for POS & Thermal Printers
const PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard Printer Service
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Mini/Cat Thermal Printer Service
  '49535343-fe7d-41aa-8d12-3d79d358bac7', // Microchip ISSC Transparent UART
  '0000ffe0-0000-1000-8000-00805f9b34fb', // HM-10 / CC2541 Serial BLE
  '0000ff00-0000-1000-8000-00805f9b34fb', // Common Chinese POS BLE
  '0000af30-0000-1000-8000-00805f9b34fb', // Generic POS BLE
  '0000e0ff-3c17-d293-8e48-14fe2e4da212', // ESC/POS Direct
];

// Common writable characteristic UUIDs
const WRITE_CHARACTERISTICS = [
  '00002af1-0000-1000-8000-00805f9b34fb',
  'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f',
  '49535343-8841-43f4-a8d4-ecbe34429783',
  '49535343-1e4d-4bd9-ba61-23c647249616',
  '0000ffe1-0000-1000-8000-00805f9b34fb',
  '0000ff02-0000-1000-8000-00805f9b34fb',
  '0000af31-0000-1000-8000-00805f9b34fb',
];

export class BluetoothPrinterService {
  private bleDevice: any = null;
  private gattServer: any = null;
  private writeCharacteristic: any = null;
  private serialPort: any = null;
  private serialWriter: any = null;
  private connectionType: 'web-bluetooth' | 'web-serial' | null = null;
  private connectedDeviceName: string | null = null;

  public isSupported(): { bluetooth: boolean; serial: boolean } {
    return {
      bluetooth: typeof navigator !== 'undefined' && 'bluetooth' in navigator,
      serial: typeof navigator !== 'undefined' && 'serial' in navigator,
    };
  }

  public getConnectedDeviceName(): string | null {
    return this.connectedDeviceName;
  }

  public getConnectionType(): 'web-bluetooth' | 'web-serial' | null {
    return this.connectionType;
  }

  public isConnected(): boolean {
    if (this.connectionType === 'web-bluetooth') {
      return Boolean(this.gattServer && this.gattServer.connected && this.writeCharacteristic);
    }
    if (this.connectionType === 'web-serial') {
      return Boolean(this.serialPort && this.serialWriter);
    }
    return false;
  }

  /**
   * Scans and connects to a Bluetooth Low Energy thermal printer
   */
  public async connectBluetooth(): Promise<string> {
    const nav = navigator as any;
    if (!nav.bluetooth) {
      throw new Error(
        'Web Bluetooth is not supported on this browser. Try Chrome/Edge or use the System Print option.'
      );
    }

    try {
      // Prompt user to select printer
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: PRINTER_SERVICES,
      });

      this.bleDevice = device;
      this.connectedDeviceName = device.name || 'Bluetooth Thermal Printer';

      device.addEventListener('gattserverdisconnected', () => {
        this.writeCharacteristic = null;
        this.gattServer = null;
        this.connectedDeviceName = null;
        this.connectionType = null;
      });

      const server = await device.gatt.connect();
      this.gattServer = server;

      // Find primary service and writable characteristic
      let charFound: any = null;

      for (const serviceUuid of PRINTER_SERVICES) {
        try {
          const service = await server.getPrimaryService(serviceUuid);
          const characteristics = await service.getCharacteristics();

          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              charFound = char;
              break;
            }
          }
          if (charFound) break;
        } catch {
          // Continue searching other services
        }
      }

      // If specific services failed, query all services
      if (!charFound) {
        try {
          const services = await server.getPrimaryServices();
          for (const s of services) {
            const chars = await s.getCharacteristics();
            for (const c of chars) {
              if (c.properties.write || c.properties.writeWithoutResponse) {
                charFound = c;
                break;
              }
            }
            if (charFound) break;
          }
        } catch (e) {
          console.warn('Fallback service discovery failed:', e);
        }
      }

      if (!charFound) {
        throw new Error('Connected to Bluetooth device, but no writable printer characteristic was found.');
      }

      this.writeCharacteristic = charFound;
      this.connectionType = 'web-bluetooth';
      return this.connectedDeviceName || 'Bluetooth Thermal Printer';
    } catch (err: any) {
      this.disconnect();
      throw err;
    }
  }

  /**
   * Connects via Web Serial (for Bluetooth SPP COM ports, USB thermal printers, or desktop pairing)
   */
  public async connectSerial(): Promise<string> {
    const nav = navigator as any;
    if (!nav.serial) {
      throw new Error('Web Serial is not supported on this browser. Use Chrome/Edge on Desktop/Android.');
    }

    try {
      const port = await nav.serial.requestPort();
      await port.open({ baudRate: 9600 }); // standard ESC/POS baud rate (or 115200)

      this.serialPort = port;
      this.serialWriter = port.writable.getWriter();
      this.connectionType = 'web-serial';
      this.connectedDeviceName = 'Serial/USB Thermal Printer';
      return this.connectedDeviceName;
    } catch (err: any) {
      this.disconnect();
      throw err;
    }
  }

  /**
   * Sends raw byte buffer to connected thermal printer in throttled chunks
   * to prevent printer buffer overflow.
   */
  public async sendData(data: Uint8Array, onProgress?: (percent: number) => void): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('No printer is currently connected.');
    }

    if (this.connectionType === 'web-bluetooth') {
      const chunkSize = 100; // Safe MTU size for cheap BLE chipsets
      const total = data.length;

      for (let i = 0; i < total; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        if (this.writeCharacteristic.properties.writeWithoutResponse) {
          await this.writeCharacteristic.writeValueWithoutResponse(chunk);
        } else {
          await this.writeCharacteristic.writeValue(chunk);
        }

        if (onProgress) {
          onProgress(Math.min(100, Math.round(((i + chunk.length) / total) * 100)));
        }

        // 20ms pause between chunks to let printer print head catch up
        await new Promise((r) => setTimeout(r, 20));
      }
    } else if (this.connectionType === 'web-serial') {
      await this.serialWriter.write(data);
      if (onProgress) onProgress(100);
    }
  }

  public disconnect(): void {
    try {
      if (this.gattServer && this.gattServer.connected) {
        this.gattServer.disconnect();
      }
      if (this.serialWriter) {
        this.serialWriter.releaseLock();
      }
      if (this.serialPort) {
        this.serialPort.close();
      }
    } catch (e) {
      console.warn('Error during disconnect:', e);
    } finally {
      this.bleDevice = null;
      this.gattServer = null;
      this.writeCharacteristic = null;
      this.serialPort = null;
      this.serialWriter = null;
      this.connectionType = null;
      this.connectedDeviceName = null;
    }
  }
}

export const printerService = new BluetoothPrinterService();

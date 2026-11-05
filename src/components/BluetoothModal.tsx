import React, { useState } from 'react';
import {
  Bluetooth,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Usb,
  Printer,
  X,
  HelpCircle,
  Laptop,
  Smartphone,
  Apple
} from 'lucide-react';
import { printerService } from '../services/bluetoothService';
import { BluetoothConnectionState } from '../types/printer';

interface BluetoothModalProps {
  isOpen: boolean;
  onClose: () => void;
  btState: BluetoothConnectionState;
  setBtState: React.Dispatch<React.SetStateAction<BluetoothConnectionState>>;
}

export const BluetoothModal: React.FC<BluetoothModalProps> = ({
  isOpen,
  onClose,
  btState,
  setBtState
}) => {
  const [activeTab, setActiveTab] = useState<'bluetooth' | 'serial' | 'system' | 'help'>('bluetooth');
  const [isScanning, setIsScanning] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  if (!isOpen) return null;

  const addLog = (msg: string) => {
    setLogMessages((prev) => [...prev.slice(-6), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleConnectBluetooth = async () => {
    setIsScanning(true);
    addLog('Requesting Bluetooth device scan...');
    setBtState((prev) => ({ ...prev, status: 'connecting', errorMessage: null }));

    try {
      const name = await printerService.connectBluetooth();
      addLog(`Connected successfully to "${name}"!`);
      setBtState({
        isConnected: true,
        deviceName: name,
        status: 'connected',
        errorMessage: null,
        connectionType: 'web-bluetooth'
      });
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Failed to connect Bluetooth device';
      addLog(`Error: ${msg}`);
      setBtState((prev) => ({
        ...prev,
        isConnected: false,
        status: 'error',
        errorMessage: msg
      }));
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnectSerial = async () => {
    setIsScanning(true);
    addLog('Requesting Serial/USB port...');
    setBtState((prev) => ({ ...prev, status: 'connecting', errorMessage: null }));

    try {
      const name = await printerService.connectSerial();
      addLog(`Connected successfully via Serial: "${name}"!`);
      setBtState({
        isConnected: true,
        deviceName: name,
        status: 'connected',
        errorMessage: null,
        connectionType: 'web-serial'
      });
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Failed to open Serial port';
      addLog(`Error: ${msg}`);
      setBtState((prev) => ({
        ...prev,
        isConnected: false,
        status: 'error',
        errorMessage: msg
      }));
    } finally {
      setIsScanning(false);
    }
  };

  const handleDisconnect = () => {
    printerService.disconnect();
    setBtState({
      isConnected: false,
      deviceName: null,
      status: 'idle',
      errorMessage: null,
      connectionType: null
    });
    addLog('Disconnected from thermal printer.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Bluetooth className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Thermal Printer Connection</h2>
              <p className="text-xs text-slate-400">Bluetooth LE, Serial COM / USB, and iOS AirPrint</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('bluetooth')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'bluetooth'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bluetooth className="w-3.5 h-3.5" />
            Bluetooth (BLE)
          </button>
          <button
            onClick={() => setActiveTab('serial')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'serial'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Usb className="w-3.5 h-3.5" />
            Serial / USB
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'system'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            iOS / System
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'help'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Help
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Active Connection Status Bar */}
          {btState.isConnected ? (
            <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <p className="font-bold text-sm text-emerald-200">{btState.deviceName}</p>
                  <p className="text-[11px] text-emerald-400/80">
                    Ready to receive ESC/POS raster print stream
                  </p>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold"
              >
                Disconnect
              </button>
            </div>
          ) : btState.errorMessage ? (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Connection Issue</p>
                <p className="text-[11px] mt-0.5 text-rose-300">{btState.errorMessage}</p>
              </div>
            </div>
          ) : null}

          {/* Tab 1: Bluetooth */}
          {activeTab === 'bluetooth' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 space-y-2">
                <p className="font-semibold text-white">How to connect Bluetooth Thermal Printer:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>Power on your thermal receipt/sticker printer.</li>
                  <li>Ensure printer Bluetooth is active (blue LED blinking or steady).</li>
                  <li>Click the button below and select your printer from the browser prompt.</li>
                </ol>
              </div>

              <button
                onClick={handleConnectBluetooth}
                disabled={isScanning || btState.isConnected}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Bluetooth className="w-4 h-4" />
                <span>{isScanning ? 'Scanning for Printers...' : 'Scan & Connect Bluetooth'}</span>
              </button>
            </div>
          )}

          {/* Tab 2: Serial / USB */}
          {activeTab === 'serial' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 space-y-2">
                <p className="font-semibold text-white">Bluetooth SPP COM Port or USB OTG:</p>
                <p className="text-slate-400 text-[11px]">
                  On Windows and macOS, when a thermal printer is paired via System Bluetooth, it often appears as a virtual Serial COM port (e.g., COM3, COM4, or /dev/cu.Bluetooth-Incoming).
                </p>
              </div>

              <button
                onClick={handleConnectSerial}
                disabled={isScanning || btState.isConnected}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Usb className="w-4 h-4" />
                <span>{isScanning ? 'Opening Port...' : 'Select Serial / COM Port'}</span>
              </button>
            </div>
          )}

          {/* Tab 3: iOS / System Print */}
          {activeTab === 'system' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-slate-300">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Apple className="w-4 h-4 text-slate-200" />
                  <span>iOS (iPhone / iPad) & AirPrint Support</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  iOS Safari restricts raw Web Bluetooth access to certified WebBLE apps. To print seamlessly on iOS:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                  <li>Simply tap <strong>Print</strong> in the navbar anytime!</li>
                  <li>Our app automatically renders zero-margin 58mm/80mm roll formatting.</li>
                  <li>Select your AirPrint or Bluetooth printer in the iOS print dialog.</li>
                  <li>Or use our Capacitor iOS bundle in Xcode!</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  onClose();
                  window.print();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700"
              >
                <Printer className="w-4 h-4" /> Test System Print Dialog
              </button>
            </div>
          )}

          {/* Tab 4: Troubleshooting */}
          {activeTab === 'help' && (
            <div className="space-y-3 text-[11px] text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-amber-400">Default PIN Code:</span> Most thermal printers use <code className="text-white bg-slate-800 px-1 rounded">0000</code> or <code className="text-white bg-slate-800 px-1 rounded">1234</code>.
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-sky-400">Android Chrome Users:</span> Enable Location / Nearby Devices permissions in Chrome app settings so Android allows Bluetooth scanning.
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-bold text-emerald-400">Image Clarity:</span> Always use <strong>Atkinson</strong> or <strong>Floyd-Steinberg</strong> dithering with high contrast for photo printing.
              </div>
            </div>
          )}

          {/* Console / Diagnostics Log */}
          {logMessages.length > 0 && (
            <div className="mt-4 p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400 space-y-0.5">
              <div className="text-slate-500 uppercase font-bold text-[9px] mb-1">Activity Log</div>
              {logMessages.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


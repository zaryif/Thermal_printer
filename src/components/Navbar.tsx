import React from 'react';
import {
  Printer,
  Bluetooth,
  BluetoothConnected,
  Calendar,
  Layers,
  Download,
  RefreshCw,
  Type
} from 'lucide-react';
import { PaperWidth, BluetoothConnectionState, ReceiptFontFamily } from '../types/printer';

interface NavbarProps {
  paperWidth: PaperWidth;
  onPaperWidthChange: (width: PaperWidth) => void;
  fontFamily: ReceiptFontFamily;
  onFontFamilyChange: (font: ReceiptFontFamily) => void;
  btState: BluetoothConnectionState;
  onOpenBluetoothModal: () => void;
  onOpenCalendarModal: () => void;
  onOpenTemplatesModal: () => void;
  onPrint: () => void;
  isPrinting: boolean;
  onExportPng: () => void;
  onNewBlank: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  paperWidth,
  onPaperWidthChange,
  fontFamily,
  onFontFamilyChange,
  btState,
  onOpenBluetoothModal,
  onOpenCalendarModal,
  onOpenTemplatesModal,
  onPrint,
  isPrinting,
  onExportPng,
  onNewBlank
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-950/95 backdrop-blur-md border-b border-stone-800/90 px-3 sm:px-6 py-2 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-700/80 flex items-center justify-center shadow-inner">
            <Printer className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm sm:text-base text-stone-100 tracking-tight font-mono">
                THERMAL STUDIO
              </h1>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                OS
              </span>
            </div>
            <p className="text-[11px] text-stone-400 hidden sm:block">Tactile Thermal Typewriter</p>
          </div>
        </div>

        {/* Paper Size & Font Family Pickers */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Paper Size Selector */}
          <div className="flex items-center bg-stone-900/90 p-0.5 rounded-lg border border-stone-800 text-xs">
            <button
              onClick={() => onPaperWidthChange('58mm')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                paperWidth === '58mm'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              58mm
            </button>
            <button
              onClick={() => onPaperWidthChange('80mm')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                paperWidth === '80mm'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              80mm
            </button>
          </div>

          {/* Font Family Selector */}
          <div className="flex items-center bg-stone-900/90 px-2 py-1 rounded-lg border border-stone-800 text-xs text-stone-300 gap-1.5">
            <Type className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={fontFamily}
              onChange={(e) => onFontFamilyChange(e.target.value as ReceiptFontFamily)}
              className="bg-transparent text-xs text-stone-200 outline-none cursor-pointer pr-1"
            >
              <option value="receipt-mono" className="bg-stone-900 text-white">Mono (POS)</option>
              <option value="clean-sans" className="bg-stone-900 text-white">Clean (Sans)</option>
              <option value="classic-serif" className="bg-stone-900 text-white">Editorial (Serif)</option>
              <option value="retro-terminal" className="bg-stone-900 text-white">Retro (Arcade)</option>
              <option value="typewriter" className="bg-stone-900 text-white">Typewriter</option>
            </select>
          </div>
        </div>

        {/* Action Buttons & Integration */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Calendar Template */}
          <button
            onClick={onOpenCalendarModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-medium text-stone-200 hover:text-white transition-all shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Google Calendar</span>
            <span className="sm:hidden">Calendar</span>
          </button>

          {/* Templates Drawer */}
          <button
            onClick={onOpenTemplatesModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-medium text-stone-200 hover:text-white transition-all shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Templates</span>
          </button>

          {/* Clear & New Blank */}
          <button
            onClick={onNewBlank}
            title="Clear & New Blank"
            className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-white transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Export PNG */}
          <button
            onClick={onExportPng}
            title="Download PNG Preview"
            className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-white transition-all"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Bluetooth Connection Button */}
          <button
            onClick={onOpenBluetoothModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              btState.isConnected
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
            }`}
          >
            {btState.isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <BluetoothConnected className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[80px] sm:max-w-[120px]">
                  {btState.deviceName || 'Connected'}
                </span>
              </>
            ) : (
              <>
                <Bluetooth className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Pair Printer</span>
                <span className="sm:hidden">Pair</span>
              </>
            )}
          </button>

          {/* Master Print Button */}
          <button
            onClick={onPrint}
            disabled={isPrinting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isPrinting ? 'Printing...' : 'Print'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import {
  Printer,
  Bluetooth,
  BluetoothConnected,
  Calendar,
  Layers,
  Download,
  Share2,
  RefreshCw,
  PlusCircle,
  FileText
} from 'lucide-react';
import { PaperWidth, BluetoothConnectionState } from '../types/printer';

interface NavbarProps {
  paperWidth: PaperWidth;
  onPaperWidthChange: (width: PaperWidth) => void;
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
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-0.5 shadow-md shadow-orange-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Printer className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-white tracking-tight">Thermal Studio</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">POS & Google Calendar Thermal Designer</p>
          </div>
        </div>

        {/* Paper Size Selector */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => onPaperWidthChange('58mm')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              paperWidth === '58mm'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            58mm <span className="opacity-75 font-normal">(384px)</span>
          </button>
          <button
            onClick={() => onPaperWidthChange('80mm')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              paperWidth === '80mm'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            80mm <span className="opacity-75 font-normal">(576px)</span>
          </button>
        </div>

        {/* Center / Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Calendar Template Button */}
          <button
            onClick={onOpenCalendarModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-all shadow-sm"
          >
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>Google Calendar</span>
          </button>

          {/* Templates Drawer */}
          <button
            onClick={onOpenTemplatesModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-all shadow-sm"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Templates</span>
          </button>

          {/* New Blank */}
          <button
            onClick={onNewBlank}
            title="Clear & New Blank"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Export PNG */}
          <button
            onClick={onExportPng}
            title="Download PNG Preview"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Right side: Bluetooth Connection & Print Action */}
        <div className="flex items-center gap-2">
          {/* Bluetooth Status Button */}
          <button
            onClick={onOpenBluetoothModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
              btState.isConnected
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {btState.isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <BluetoothConnected className="w-4 h-4 text-emerald-400" />
                <span className="truncate max-w-[100px] sm:max-w-[130px]">
                  {btState.deviceName || 'Connected'}
                </span>
              </>
            ) : (
              <>
                <Bluetooth className="w-4 h-4 text-sky-400" />
                <span>Pair Printer</span>
              </>
            )}
          </button>

          {/* Master Print Button */}
          <button
            onClick={onPrint}
            disabled={isPrinting}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>{isPrinting ? 'Printing...' : 'Print'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};


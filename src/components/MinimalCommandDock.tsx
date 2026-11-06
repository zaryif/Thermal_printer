import React from 'react';
import {
  Type,
  Heading,
  Image as ImageIcon,
  Clock,
  CheckSquare,
  Table as TableIcon,
  QrCode,
  Scissors,
  ArrowDownToLine,
  Sliders
} from 'lucide-react';
import { ReceiptBlock } from '../types/printer';

interface MinimalCommandDockProps {
  onAddBlock: (type: ReceiptBlock['type']) => void;
  showInspector: boolean;
  onToggleInspector: () => void;
}

export const MinimalCommandDock: React.FC<MinimalCommandDockProps> = ({
  onAddBlock,
  showInspector,
  onToggleInspector
}) => {
  const tools = [
    { type: 'text' as const, label: 'Text', icon: Type, shortcut: 'T' },
    { type: 'header' as const, label: 'Title', icon: Heading, shortcut: 'H' },
    { type: 'image' as const, label: 'Photo', icon: ImageIcon, shortcut: 'I' },
    { type: 'schedule' as const, label: 'Agenda', icon: Clock, shortcut: 'A' },
    { type: 'tasklist' as const, label: 'Tasks', icon: CheckSquare, shortcut: 'K' },
    { type: 'table' as const, label: 'Table', icon: TableIcon, shortcut: 'B' },
    { type: 'qrcode' as const, label: 'QR Code', icon: QrCode, shortcut: 'Q' },
    { type: 'divider' as const, label: 'Cut Line', icon: Scissors, shortcut: 'C' },
    { type: 'feed' as const, label: 'Feed', icon: ArrowDownToLine, shortcut: 'F' }
  ];

  return (
    <div className="no-print w-full bg-stone-950/90 border-b border-stone-800/80 px-2 sm:px-6 py-2 backdrop-blur-md sticky top-[57px] z-20 flex items-center justify-between gap-2 overflow-x-auto shadow-sm">
      <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap shrink-0">
        <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider pl-1 hidden md:inline">
          Insert Block:
        </span>
        {tools.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              onClick={() => onAddBlock(item.type)}
              title={`Add ${item.label}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800/90 hover:border-stone-700 text-xs font-semibold tracking-tight transition-all active:scale-95 shadow-sm whitespace-nowrap"
            >
              <Icon className="w-3.5 h-3.5 text-amber-400" />
              <span>+ {item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Optional Advanced Inspector Toggle */}
      <button
        onClick={onToggleInspector}
        title="Toggle Advanced Dithering & Sliders Drawer"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all border whitespace-nowrap shrink-0 ${
          showInspector
            ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-sm'
            : 'bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border-stone-800'
        }`}
      >
        <Sliders className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Advanced Tools</span>
      </button>
    </div>
  );
};

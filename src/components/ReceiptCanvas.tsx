import React from 'react';
import QRCode from 'qrcode';
import {
  ReceiptBlock,
  PaperWidth,
  HeaderBlock,
  TextBlock,
  ImageBlock,
  ScheduleBlock,
  TaskListBlock,
  TableBlock,
  QrCodeBlock,
  DividerBlock,
  FeedBlock
} from '../types/printer';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit2,
  CheckSquare,
  Square,
  Clock,
  Sparkles
} from 'lucide-react';

interface ReceiptCanvasProps {
  blocks: ReceiptBlock[];
  paperWidth: PaperWidth;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onMoveBlock: (id: string, direction: 'up' | 'down') => void;
  onDeleteBlock: (id: string) => void;
  onToggleScheduleItem: (blockId: string, itemId: string) => void;
  onToggleTaskItem: (blockId: string, itemId: string) => void;
  receiptRef: React.RefObject<HTMLDivElement | null>;
}

export const ReceiptCanvas: React.FC<ReceiptCanvasProps> = ({
  blocks,
  paperWidth,
  selectedBlockId,
  onSelectBlock,
  onMoveBlock,
  onDeleteBlock,
  onToggleScheduleItem,
  onToggleTaskItem,
  receiptRef
}) => {
  // Width in pixels corresponding to thermal printer dots
  const widthPx = paperWidth === '58mm' ? 384 : 576;

  return (
    <div className="flex flex-col items-center justify-start p-4 sm:p-8 min-h-[calc(100vh-80px)] overflow-y-auto">
      {/* Top Paper Dispenser / Roll visual effect */}
      <div
        style={{ width: `${Math.min(widthPx, 440)}px` }}
        className="w-full h-3 bg-gradient-to-b from-slate-950 to-slate-800 rounded-t-lg border-x border-t border-slate-700/80 shadow-inner flex items-center justify-center"
      >
        <div className="w-32 h-1 bg-slate-900 rounded-full opacity-60"></div>
      </div>

      {/* Main Thermal Receipt Paper Container */}
      <div
        ref={receiptRef}
        id="printable-receipt"
        style={{ maxWidth: `${widthPx}px` }}
        className="receipt-paper tear-bottom w-full text-slate-950 px-4 sm:px-6 py-6 border-x border-stone-200/60 transition-all duration-300 font-receipt select-none"
      >
        {blocks.length === 0 ? (
          <div className="py-16 text-center text-stone-400">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-500" />
            <p className="text-sm font-bold uppercase tracking-wider">Empty Receipt</p>
            <p className="text-xs mt-1">Add blocks from the sidebar or choose a template above</p>
          </div>
        ) : (
          blocks.map((block, index) => {
            const isSelected = selectedBlockId === block.id;

            return (
              <div
                key={block.id}
                onClick={() => onSelectBlock(block.id)}
                className={`group relative rounded-md transition-all cursor-pointer my-1 p-1 ${
                  isSelected
                    ? 'ring-2 ring-amber-500 bg-amber-500/10'
                    : 'hover:bg-stone-100/80'
                }`}
              >
                {/* Floating Block Actions (Move / Edit / Delete) */}
                <div className="no-print absolute -right-2 top-0 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-slate-900 text-white rounded-lg shadow-md px-1.5 py-1 z-20">
                  <button
                    disabled={index === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveBlock(block.id, 'up');
                    }}
                    title="Move Up"
                    className="p-1 hover:text-amber-400 disabled:opacity-30"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === blocks.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveBlock(block.id, 'down');
                    }}
                    title="Move Down"
                    className="p-1 hover:text-amber-400 disabled:opacity-30"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBlock(block.id);
                    }}
                    title="Edit Block"
                    className="p-1 hover:text-sky-400"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBlock(block.id);
                    }}
                    title="Delete Block"
                    className="p-1 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Render Block Content */}
                {renderBlock(block, onToggleScheduleItem, onToggleTaskItem)}
              </div>
            );
          })
        )}
      </div>

      {/* Subtle thermal printer paper bottom shadow & hint */}
      <div className="mt-8 text-center text-xs text-slate-500 no-print flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block animate-pulse"></span>
        <span>
          Live Thermal Preview ({paperWidth === '58mm' ? '58mm / 384 dots' : '80mm / 576 dots'})
        </span>
      </div>
    </div>
  );
};

function renderBlock(
  block: ReceiptBlock,
  onToggleScheduleItem: (bId: string, sId: string) => void,
  onToggleTaskItem: (bId: string, tId: string) => void
) {
  switch (block.type) {
    case 'header': {
      const b = block as HeaderBlock;
      return (
        <div className="text-center py-1">
          <h2 className="text-base sm:text-lg font-black tracking-tight uppercase leading-snug">
            {b.title}
          </h2>
          {b.subtitle && (
            <p className="text-xs uppercase text-stone-700 font-semibold tracking-wider mt-0.5">
              {b.subtitle}
            </p>
          )}
          {b.dateStr && (
            <p className="text-[11px] text-stone-600 mt-1 uppercase tracking-wide">
              {b.dateStr}
            </p>
          )}
          {(b.metaLeft || b.metaRight) && (
            <div className="flex justify-between text-[11px] font-semibold text-stone-700 mt-1 border-t border-stone-300 pt-1">
              <span>{b.metaLeft || ''}</span>
              <span>{b.metaRight || ''}</span>
            </div>
          )}
        </div>
      );
    }

    case 'text': {
      const b = block as TextBlock;
      const sizeClasses = {
        xs: 'text-[11px]',
        sm: 'text-xs',
        base: 'text-sm',
        lg: 'text-base font-semibold',
        xl: 'text-lg font-bold',
        '2xl': 'text-xl font-black'
      };

      const alignClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
      };

      return (
        <div
          className={`py-0.5 leading-tight ${alignClasses[b.align]} ${
            sizeClasses[b.fontSize]
          } ${b.bold ? 'font-bold' : 'font-normal'} ${
            b.inverted ? 'bg-black text-white px-2 py-1 rounded-sm' : 'text-slate-950'
          }`}
        >
          {b.text}
        </div>
      );
    }

    case 'image': {
      const b = block as ImageBlock;
      return (
        <div className="flex flex-col items-center justify-center my-1 py-1">
          {b.dataUrl ? (
            <img
              src={b.dataUrl}
              alt={b.caption || 'Thermal Print Image'}
              className="w-full max-w-full object-contain image-rendering-pixelated"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="w-full py-8 border border-dashed border-stone-400 text-stone-400 text-center text-xs">
              [No Image Selected - Click to Upload]
            </div>
          )}
          {b.caption && (
            <p className="text-[11px] text-stone-700 mt-1 font-semibold uppercase tracking-wider text-center">
              {b.caption}
            </p>
          )}
        </div>
      );
    }

    case 'schedule': {
      const b = block as ScheduleBlock;
      return (
        <div className="py-1">
          <div className="flex items-center justify-between border-b-2 border-stone-900 pb-1 mb-1.5">
            <span className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 inline" /> {b.title}
            </span>
            <span className="text-[10px] font-bold text-stone-600">{b.date}</span>
          </div>

          <div className="space-y-1.5">
            {b.items.map((item) => (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleScheduleItem(b.id, item.id);
                }}
                className="flex items-start gap-2 text-xs leading-snug cursor-pointer group/item hover:bg-stone-200/50 p-0.5 rounded"
              >
                <div className="pt-0.5 text-stone-700">
                  {item.done ? (
                    <CheckSquare className="w-3.5 h-3.5 text-stone-900" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-stone-600" />
                  )}
                </div>
                <div className="flex-1 flex items-baseline justify-between gap-1 overflow-hidden">
                  <span
                    className={`font-mono text-[11px] ${
                      item.done ? 'line-through text-stone-400' : 'font-medium text-slate-900'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="text-[10px] font-bold text-stone-600 whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'tasklist': {
      const b = block as TaskListBlock;
      return (
        <div className="py-1">
          <div className="border-b border-stone-800 pb-0.5 mb-1.5 flex justify-between items-center">
            <span className="font-black text-xs uppercase tracking-wider">{b.title}</span>
            <span className="text-[10px] text-stone-600">
              {b.items.filter((i) => i.done).length}/{b.items.length}
            </span>
          </div>
          <div className="space-y-1">
            {b.items.map((task) => (
              <div
                key={task.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTaskItem(b.id, task.id);
                }}
                className="flex items-start gap-2 text-xs leading-snug cursor-pointer hover:bg-stone-200/50 p-0.5 rounded"
              >
                <div className="pt-0.5 text-stone-700">
                  {task.done ? (
                    <CheckSquare className="w-3.5 h-3.5 text-stone-900" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-stone-600" />
                  )}
                </div>
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span
                    className={`text-[11px] leading-snug pr-2 break-words ${
                      task.done ? 'line-through text-stone-400' : 'text-slate-900 font-medium'
                    }`}
                  >
                    {task.text}
                  </span>
                  {task.priority === 'high' && (
                    <span className="text-[9px] font-bold px-1 rounded bg-stone-900 text-white shrink-0">
                      HIGH
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'table': {
      const b = block as TableBlock;
      return (
        <div className="py-1 text-xs">
          <div className="flex justify-between font-bold border-b border-stone-800 pb-1 text-[11px] uppercase">
            <span className="flex-1 text-left">{b.headers[0]}</span>
            <span className="w-12 text-center">{b.headers[1]}</span>
            <span className="w-16 text-right">{b.headers[2]}</span>
          </div>

          <div className="divide-y divide-stone-200 my-1">
            {b.rows.map((row, idx) => (
              <div key={idx} className="flex justify-between py-1 text-[11px]">
                <span className="flex-1 text-left truncate pr-1">{row.col1}</span>
                <span className="w-12 text-center">{row.col2}</span>
                <span className="w-16 text-right font-medium">{row.col3}</span>
              </div>
            ))}
          </div>

          {b.totalValue && (
            <div className="border-t-2 border-stone-900 pt-1 mt-1 flex justify-between font-black text-xs uppercase">
              <span>{b.totalLabel || 'TOTAL'}</span>
              <span>{b.totalValue}</span>
            </div>
          )}
        </div>
      );
    }

    case 'qrcode': {
      const b = block as QrCodeBlock;
      const alignClasses = {
        left: 'items-start',
        center: 'items-center',
        right: 'items-end'
      };

      return (
        <div className={`flex flex-col my-2 py-1 ${alignClasses[b.align]}`}>
          <div className="p-1 bg-white inline-block">
            <QrCodeImage text={b.data} size={b.size} />
          </div>
          {b.label && (
            <p className="text-[10px] font-bold text-stone-800 mt-1 uppercase tracking-wider">
              {b.label}
            </p>
          )}
        </div>
      );
    }

    case 'divider': {
      const b = block as DividerBlock;
      return (
        <div className="py-1.5 text-center text-stone-800 overflow-hidden select-none">
          {b.style === 'dashed' && <div className="border-t border-dashed border-stone-800 w-full" />}
          {b.style === 'dotted' && <div className="border-t border-dotted border-stone-800 w-full" />}
          {b.style === 'solid' && <div className="border-t-2 border-stone-900 w-full" />}
          {b.style === 'double' && (
            <div className="border-t-4 border-double border-stone-900 w-full" />
          )}
          {b.style === 'stars' && (
            <p className="text-[10px] tracking-[0.4em] text-stone-900 font-bold">* * * * * * *</p>
          )}
          {b.style === 'cut' && (
            <div className="flex items-center justify-center gap-2 text-[10px] text-stone-700 font-mono">
              <span>-- - - - - - - - ✂ - - - - - - - --</span>
            </div>
          )}
        </div>
      );
    }

    case 'feed': {
      const b = block as FeedBlock;
      const heightPx = Math.max(24, (b.lines || 3) * 16);
      return <div style={{ height: `${heightPx}px` }} className="w-full" />;
    }

    default:
      return null;
  }
}

/**
 * Lightweight QR Code SVG Generator helper using QRCode package
 */
const QrCodeImage: React.FC<{ text: string; size: number }> = ({ text, size }) => {
  const [dataUrl, setDataUrl] = React.useState<string>('');

  React.useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(text || 'https://calendar.google.com', {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => {
        console.warn('QR code generation failed:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [text, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: `${size}px`, height: `${size}px` }}
        className="bg-stone-200 flex items-center justify-center text-[10px] text-stone-500"
      >
        QR
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="QR Code"
      style={{ width: `${size}px`, height: `${size}px` }}
      className="block"
    />
  );
};


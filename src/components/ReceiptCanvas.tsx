import React, { useRef } from 'react';
import QRCode from 'qrcode';
import {
  ReceiptBlock,
  PaperWidth,
  ReceiptFontFamily,
  HeaderBlock,
  TextBlock,
  ImageBlock,
  ScheduleBlock,
  TaskListBlock,
  TableBlock,
  QrCodeBlock,
  DividerBlock,
  FeedBlock,
  ScheduleItem,
  TaskItem,
  TableRow
} from '../types/printer';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  CheckSquare,
  Square,
  Clock,
  Sparkles,
  Plus,
  Image as ImageIcon,
  Minus,
  Scissors
} from 'lucide-react';
import { processImageForThermal } from '../services/imageDithering';

interface ReceiptCanvasProps {
  blocks: ReceiptBlock[];
  paperWidth: PaperWidth;
  fontFamily: ReceiptFontFamily;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onUpdateBlock: (updated: ReceiptBlock) => void;
  onMoveBlock: (id: string, direction: 'up' | 'down') => void;
  onDeleteBlock: (id: string) => void;
  onAddBlock?: (type: ReceiptBlock['type']) => void;
  onToggleScheduleItem: (blockId: string, itemId: string) => void;
  onToggleTaskItem: (blockId: string, itemId: string) => void;
  receiptRef: React.RefObject<HTMLDivElement | null>;
}

const FONT_CLASS_MAP: Record<ReceiptFontFamily, string> = {
  'receipt-mono': 'font-receipt-mono',
  'clean-sans': 'font-clean-sans',
  'classic-serif': 'font-classic-serif',
  'retro-terminal': 'font-retro-terminal',
  'typewriter': 'font-typewriter'
};

export const ReceiptCanvas: React.FC<ReceiptCanvasProps> = ({
  blocks,
  paperWidth,
  fontFamily,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  onMoveBlock,
  onDeleteBlock,
  onAddBlock,
  onToggleScheduleItem,
  onToggleTaskItem,
  receiptRef
}) => {
  const widthPx = paperWidth === '58mm' ? 384 : 576;
  const imageInputRef = useRef<HTMLInputElement>(null);
  const activeImageBlockRef = useRef<string | null>(null);

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeImageBlockRef.current) return;

    const blockId = activeImageBlockRef.current;
    const targetBlock = blocks.find((b) => b.id === blockId && b.type === 'image') as ImageBlock | undefined;
    if (!targetBlock) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      const targetWidth = paperWidth === '58mm' ? 384 : 576;
      try {
        const processed = await processImageForThermal(
          dataUrl,
          targetWidth,
          targetBlock.dither || 'atkinson',
          targetBlock.threshold || 128,
          targetBlock.contrast || 1.15,
          targetBlock.brightness || 0,
          targetBlock.invert || false
        );

        onUpdateBlock({
          ...targetBlock,
          originalDataUrl: dataUrl,
          dataUrl: processed.previewDataUrl
        });
      } catch (err) {
        console.error('Image processing failed:', err);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const triggerImagePicker = (blockId: string) => {
    activeImageBlockRef.current = blockId;
    imageInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-start p-3 sm:p-6 w-full min-h-[calc(100vh-80px)] overflow-y-auto">
      {/* Hidden File Input for Direct Inline Photo Upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInlineImageUpload}
      />

      {/* Top Paper Dispenser / Roll Visual Representation */}
      <div
        style={{ width: `${Math.min(widthPx, 440)}px` }}
        className="w-full h-3 bg-gradient-to-b from-stone-950 to-stone-800 rounded-t-lg border-x border-t border-stone-700/80 shadow-inner flex items-center justify-center select-none"
      >
        <div className="w-32 h-1 bg-stone-900 rounded-full opacity-60"></div>
      </div>

      {/* Main Thermal Receipt Paper Container */}
      <div
        ref={receiptRef}
        id="printable-receipt"
        style={{ maxWidth: `${widthPx}px` }}
        className={`receipt-paper tear-bottom w-full text-slate-950 px-4 sm:px-6 py-6 border-x border-stone-200/60 transition-all duration-300 select-text ${FONT_CLASS_MAP[fontFamily || 'receipt-mono']}`}
      >
        {blocks.length === 0 ? (
          <div className="py-16 text-center text-stone-400 select-none">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-500" />
            <p className="text-sm font-bold uppercase tracking-wider">Empty Receipt</p>
            <p className="text-xs mt-1">Tap a template block above to start writing directly</p>
          </div>
        ) : (
          blocks.map((block, index) => {
            const isSelected = selectedBlockId === block.id;

            return (
              <div
                key={block.id}
                onClick={() => onSelectBlock(block.id)}
                className={`group relative rounded-md transition-all my-1 p-1 ${
                  isSelected
                    ? 'ring-2 ring-amber-500/70 bg-amber-500/5'
                    : 'hover:bg-stone-100/60'
                }`}
              >
                {/* Minimal Hover / Focus Action Pill (Move, Duplicate, Delete) */}
                <div className="no-print absolute -right-2 top-0 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-stone-900 text-stone-100 rounded-lg shadow-lg px-1.5 py-1 z-20 select-none border border-stone-700/80">
                  <button
                    disabled={index === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveBlock(block.id, 'up');
                    }}
                    title="Move Up"
                    className="p-1 hover:text-amber-400 disabled:opacity-20"
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
                    className="p-1 hover:text-amber-400 disabled:opacity-20"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
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

                {/* Render Direct WYSIWYG Editable Block */}
                {renderEditableBlock(
                  block,
                  onUpdateBlock,
                  onToggleScheduleItem,
                  onToggleTaskItem,
                  triggerImagePicker
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Subtle thermal paper info indicator */}
      <div className="mt-6 text-center text-xs text-stone-500 no-print flex items-center gap-2 select-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block animate-pulse"></span>
        <span>
          WYSIWYG Thermal Canvas ({paperWidth === '58mm' ? '58mm / 384 dots' : '80mm / 576 dots'}) • Click any text to edit directly
        </span>
      </div>
    </div>
  );
};

/**
 * Direct WYSIWYG In-Place Block Renderer
 */
function renderEditableBlock(
  block: ReceiptBlock,
  onUpdateBlock: (updated: ReceiptBlock) => void,
  onToggleScheduleItem: (bId: string, sId: string) => void,
  onToggleTaskItem: (bId: string, tId: string) => void,
  onTriggerImagePicker: (blockId: string) => void
) {
  switch (block.type) {
    case 'header': {
      const b = block as HeaderBlock;
      return (
        <div className="text-center py-1">
          <input
            type="text"
            value={b.title}
            onChange={(e) => onUpdateBlock({ ...b, title: e.target.value })}
            placeholder="HEADER TITLE"
            className="receipt-input text-base sm:text-lg font-black tracking-tight uppercase text-center font-bold"
          />
          <input
            type="text"
            value={b.subtitle || ''}
            onChange={(e) => onUpdateBlock({ ...b, subtitle: e.target.value })}
            placeholder="Subtitle or tagline (optional)"
            className="receipt-input text-xs uppercase text-stone-700 font-semibold tracking-wider text-center mt-0.5"
          />
          <input
            type="text"
            value={b.dateStr || ''}
            onChange={(e) => onUpdateBlock({ ...b, dateStr: e.target.value })}
            placeholder="Date string"
            className="receipt-input text-[11px] text-stone-600 mt-0.5 uppercase tracking-wide text-center"
          />
          {(b.metaLeft !== undefined || b.metaRight !== undefined) && (
            <div className="flex justify-between text-[11px] font-semibold text-stone-700 mt-1 border-t border-stone-300 pt-1 gap-2">
              <input
                type="text"
                value={b.metaLeft || ''}
                onChange={(e) => onUpdateBlock({ ...b, metaLeft: e.target.value })}
                placeholder="Left note"
                className="receipt-input text-left"
              />
              <input
                type="text"
                value={b.metaRight || ''}
                onChange={(e) => onUpdateBlock({ ...b, metaRight: e.target.value })}
                placeholder="Right note"
                className="receipt-input text-right"
              />
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

      const lineCount = (b.text || '').split('\n').length;

      return (
        <div className="py-0.5">
          <textarea
            rows={Math.max(1, lineCount)}
            value={b.text}
            onChange={(e) => onUpdateBlock({ ...b, text: e.target.value })}
            placeholder="Click to write text, note, or quote here..."
            className={`receipt-input resize-none overflow-hidden leading-tight ${alignClasses[b.align]} ${
              sizeClasses[b.fontSize]
            } ${b.bold ? 'font-bold' : 'font-normal'} ${
              b.inverted ? 'bg-black text-white px-2 py-1 rounded-sm' : 'text-slate-950'
            }`}
          />
        </div>
      );
    }

    case 'image': {
      const b = block as ImageBlock;
      return (
        <div className="flex flex-col items-center justify-center my-1 py-1">
          {b.dataUrl ? (
            <div className="relative group/img cursor-pointer w-full text-center" onClick={() => onTriggerImagePicker(b.id)}>
              <img
                src={b.dataUrl}
                alt={b.caption || 'Thermal Print Image'}
                className="w-full max-w-full object-contain mx-auto"
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="no-print absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1 rounded">
                <ImageIcon className="w-4 h-4" /> Replace Photo
              </div>
            </div>
          ) : (
            <button
              onClick={() => onTriggerImagePicker(b.id)}
              className="w-full py-6 border-2 border-dashed border-stone-400 hover:border-amber-500 text-stone-500 hover:text-amber-600 rounded-lg text-center text-xs flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <ImageIcon className="w-6 h-6 opacity-60" />
              <span className="font-bold uppercase tracking-wider">Tap to Upload Photo</span>
              <span className="text-[10px] opacity-75">Auto-dithered for thermal print head</span>
            </button>
          )}

          <input
            type="text"
            value={b.caption || ''}
            onChange={(e) => onUpdateBlock({ ...b, caption: e.target.value })}
            placeholder="Caption (optional)"
            className="receipt-input text-[11px] text-stone-700 mt-1 font-semibold uppercase tracking-wider text-center"
          />
        </div>
      );
    }

    case 'schedule': {
      const b = block as ScheduleBlock;

      const handleAddItem = () => {
        const newItem: ScheduleItem = {
          id: 'item_' + Date.now(),
          time: '12:00 PM',
          title: 'New Agenda Event',
          done: false
        };
        onUpdateBlock({ ...b, items: [...b.items, newItem] });
      };

      const handleUpdateItem = (itemId: string, patch: Partial<ScheduleItem>) => {
        onUpdateBlock({
          ...b,
          items: b.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i))
        });
      };

      const handleDeleteItem = (itemId: string) => {
        onUpdateBlock({
          ...b,
          items: b.items.filter((i) => i.id !== itemId)
        });
      };

      return (
        <div className="py-1">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b-2 border-stone-900 pb-1 mb-1.5 gap-2">
            <div className="flex items-center gap-1 flex-1">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <input
                type="text"
                value={b.title}
                onChange={(e) => onUpdateBlock({ ...b, title: e.target.value })}
                placeholder="AGENDA TITLE"
                className="receipt-input font-black text-xs uppercase tracking-wider"
              />
            </div>
            <input
              type="text"
              value={b.date}
              onChange={(e) => onUpdateBlock({ ...b, date: e.target.value })}
              placeholder="DATE"
              className="receipt-input text-[10px] font-bold text-stone-600 text-right w-24"
            />
          </div>

          {/* Schedule Events List */}
          <div className="space-y-1">
            {b.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-1.5 text-xs group/item hover:bg-stone-200/50 p-0.5 rounded"
              >
                <button
                  type="button"
                  onClick={() => onToggleScheduleItem(b.id, item.id)}
                  className="p-0.5 text-stone-700 hover:text-black shrink-0"
                >
                  {item.done ? (
                    <CheckSquare className="w-3.5 h-3.5 text-stone-900" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-stone-600" />
                  )}
                </button>

                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                  placeholder="Event title"
                  className={`receipt-input flex-1 text-[11px] ${
                    item.done ? 'line-through text-stone-400' : 'font-medium text-slate-900'
                  }`}
                />

                <input
                  type="text"
                  value={item.time}
                  onChange={(e) => handleUpdateItem(item.id, { time: e.target.value })}
                  placeholder="09:00 AM"
                  className="receipt-input text-[10px] font-bold text-stone-600 text-right w-20"
                />

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  title="Remove event"
                  className="no-print opacity-0 group-hover/item:opacity-100 p-0.5 text-stone-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Inline Add Event Button */}
          <div className="no-print pt-1">
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1 text-[10px] text-stone-600 hover:text-stone-950 font-bold uppercase tracking-wider py-0.5 px-1 rounded hover:bg-stone-200/60"
            >
              <Plus className="w-3 h-3" /> Add Event
            </button>
          </div>
        </div>
      );
    }

    case 'tasklist': {
      const b = block as TaskListBlock;

      const handleAddTask = () => {
        const newTask: TaskItem = {
          id: 'task_' + Date.now(),
          text: 'New checklist task item',
          done: false,
          priority: 'medium'
        };
        onUpdateBlock({ ...b, items: [...b.items, newTask] });
      };

      const handleUpdateTask = (taskId: string, patch: Partial<TaskItem>) => {
        onUpdateBlock({
          ...b,
          items: b.items.map((t) => (t.id === taskId ? { ...t, ...patch } : t))
        });
      };

      const handleDeleteTask = (taskId: string) => {
        onUpdateBlock({
          ...b,
          items: b.items.filter((t) => t.id !== taskId)
        });
      };

      return (
        <div className="py-1">
          {/* Header Bar */}
          <div className="border-b border-stone-800 pb-0.5 mb-1.5 flex justify-between items-center gap-2">
            <input
              type="text"
              value={b.title}
              onChange={(e) => onUpdateBlock({ ...b, title: e.target.value })}
              placeholder="TASKS TITLE"
              className="receipt-input font-black text-xs uppercase tracking-wider flex-1"
            />
            <span className="text-[10px] text-stone-600 font-mono whitespace-nowrap">
              {b.items.filter((i) => i.done).length}/{b.items.length}
            </span>
          </div>

          {/* Tasks List */}
          <div className="space-y-1">
            {b.items.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-1.5 text-xs group/task hover:bg-stone-200/50 p-0.5 rounded"
              >
                <button
                  type="button"
                  onClick={() => onToggleTaskItem(b.id, task.id)}
                  className="p-0.5 text-stone-700 hover:text-black shrink-0"
                >
                  {task.done ? (
                    <CheckSquare className="w-3.5 h-3.5 text-stone-900" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-stone-600" />
                  )}
                </button>

                <input
                  type="text"
                  value={task.text}
                  onChange={(e) => handleUpdateTask(task.id, { text: e.target.value })}
                  placeholder="Task description..."
                  className={`receipt-input flex-1 text-[11px] ${
                    task.done ? 'line-through text-stone-400' : 'text-slate-900 font-medium'
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    handleUpdateTask(task.id, {
                      priority: task.priority === 'high' ? 'low' : 'high'
                    })
                  }
                  title="Toggle priority"
                  className={`text-[9px] font-bold px-1 rounded uppercase tracking-wider shrink-0 ${
                    task.priority === 'high'
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  {task.priority === 'high' ? 'HIGH' : 'LOW'}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  title="Remove task"
                  className="no-print opacity-0 group-hover/task:opacity-100 p-0.5 text-stone-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Inline Add Task Button */}
          <div className="no-print pt-1">
            <button
              type="button"
              onClick={handleAddTask}
              className="flex items-center gap-1 text-[10px] text-stone-600 hover:text-stone-950 font-bold uppercase tracking-wider py-0.5 px-1 rounded hover:bg-stone-200/60"
            >
              <Plus className="w-3 h-3" /> Add Task
            </button>
          </div>
        </div>
      );
    }

    case 'table': {
      const b = block as TableBlock;

      const handleAddRow = () => {
        const newRow: TableRow = { col1: 'New Item', col2: '1', col3: '$0.00' };
        onUpdateBlock({ ...b, rows: [...b.rows, newRow] });
      };

      const handleUpdateRow = (index: number, patch: Partial<TableRow>) => {
        const newRows = [...b.rows];
        newRows[index] = { ...newRows[index], ...patch };
        onUpdateBlock({ ...b, rows: newRows });
      };

      const handleDeleteRow = (index: number) => {
        onUpdateBlock({
          ...b,
          rows: b.rows.filter((_, i) => i !== index)
        });
      };

      return (
        <div className="py-1 text-xs">
          {/* Table Headers */}
          <div className="flex justify-between font-bold border-b border-stone-800 pb-1 text-[11px] uppercase gap-2">
            <input
              type="text"
              value={b.headers[0]}
              onChange={(e) =>
                onUpdateBlock({ ...b, headers: [e.target.value, b.headers[1], b.headers[2]] })
              }
              className="receipt-input flex-1 text-left"
            />
            <input
              type="text"
              value={b.headers[1]}
              onChange={(e) =>
                onUpdateBlock({ ...b, headers: [b.headers[0], e.target.value, b.headers[2]] })
              }
              className="receipt-input w-12 text-center"
            />
            <input
              type="text"
              value={b.headers[2]}
              onChange={(e) =>
                onUpdateBlock({ ...b, headers: [b.headers[0], b.headers[1], e.target.value] })
              }
              className="receipt-input w-16 text-right"
            />
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-stone-200 my-1">
            {b.rows.map((row, idx) => (
              <div key={idx} className="flex justify-between items-center py-1 text-[11px] gap-2 group/row">
                <input
                  type="text"
                  value={row.col1}
                  onChange={(e) => handleUpdateRow(idx, { col1: e.target.value })}
                  className="receipt-input flex-1 text-left"
                />
                <input
                  type="text"
                  value={row.col2}
                  onChange={(e) => handleUpdateRow(idx, { col2: e.target.value })}
                  className="receipt-input w-12 text-center"
                />
                <input
                  type="text"
                  value={row.col3}
                  onChange={(e) => handleUpdateRow(idx, { col3: e.target.value })}
                  className="receipt-input w-16 text-right font-medium"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteRow(idx)}
                  className="no-print opacity-0 group-hover/row:opacity-100 p-0.5 text-stone-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Row Button */}
          <div className="no-print pt-0.5">
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1 text-[10px] text-stone-600 hover:text-stone-950 font-bold uppercase tracking-wider py-0.5 px-1 rounded hover:bg-stone-200/60"
            >
              <Plus className="w-3 h-3" /> Add Row
            </button>
          </div>

          {/* Total Section */}
          <div className="border-t-2 border-stone-900 pt-1 mt-1 flex justify-between font-black text-xs uppercase gap-2">
            <input
              type="text"
              value={b.totalLabel || 'TOTAL'}
              onChange={(e) => onUpdateBlock({ ...b, totalLabel: e.target.value })}
              className="receipt-input text-left w-32 font-black"
            />
            <input
              type="text"
              value={b.totalValue || '$0.00'}
              onChange={(e) => onUpdateBlock({ ...b, totalValue: e.target.value })}
              className="receipt-input text-right w-24 font-black"
            />
          </div>
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
          <div className="p-1 bg-white inline-block shadow-sm">
            <QrCodeImage text={b.data} size={b.size} />
          </div>

          {/* Direct QR data editing */}
          <input
            type="text"
            value={b.data}
            onChange={(e) => onUpdateBlock({ ...b, data: e.target.value })}
            placeholder="https://..."
            className="receipt-input text-[10px] font-mono text-center max-w-xs mt-1 text-stone-600"
          />

          {/* QR Label */}
          <input
            type="text"
            value={b.label || ''}
            onChange={(e) => onUpdateBlock({ ...b, label: e.target.value })}
            placeholder="QR Label (optional)"
            className="receipt-input text-[10px] font-bold text-stone-800 mt-0.5 uppercase tracking-wider text-center"
          />
        </div>
      );
    }

    case 'divider': {
      const b = block as DividerBlock;
      const styles: DividerBlock['style'][] = ['dashed', 'dotted', 'solid', 'double', 'stars', 'cut'];

      return (
        <div className="py-1 text-center text-stone-800 group/div relative">
          {/* Quick style switcher when hovered */}
          <div className="no-print hidden group-hover/div:flex absolute -top-4 left-1/2 -translate-x-1/2 bg-stone-900 text-stone-200 text-[9px] font-mono px-1 py-0.5 rounded shadow gap-1 z-10">
            {styles.map((s) => (
              <button
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateBlock({ ...b, style: s });
                }}
                className={`px-1 rounded uppercase ${b.style === s ? 'bg-amber-500 text-black font-bold' : 'hover:text-white'}`}
              >
                {s}
              </button>
            ))}
          </div>

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
              <Scissors className="w-3 h-3 inline" />
              <span>-- - - - - - - - - - - - - - --</span>
            </div>
          )}
        </div>
      );
    }

    case 'feed': {
      const b = block as FeedBlock;
      const lines = Math.max(1, b.lines || 3);
      const heightPx = lines * 16;

      return (
        <div
          style={{ height: `${heightPx}px` }}
          className="w-full flex items-center justify-center border-t border-dashed border-stone-300 my-1 group/feed relative text-[10px] text-stone-400 font-mono uppercase"
        >
          <div className="no-print flex items-center gap-2 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
            <span>Tear Feed ({lines} lines)</span>
            <button
              type="button"
              onClick={() => onUpdateBlock({ ...b, lines: Math.max(1, lines - 1) })}
              className="p-0.5 hover:text-black font-bold"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onUpdateBlock({ ...b, lines: lines + 1 })}
              className="p-0.5 hover:text-black font-bold"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      );
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
        className="bg-stone-200 flex items-center justify-center text-[10px] text-stone-500 font-mono"
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

import React, { useRef } from 'react';
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
  DitherAlgorithm
} from '../types/printer';
import {
  Heading,
  Type,
  Image as ImageIcon,
  Clock,
  CheckSquare,
  Table as TableIcon,
  QrCode,
  Minus,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  Upload,
  Scissors
} from 'lucide-react';
import { processImageForThermal } from '../services/imageDithering';

interface BlockEditorProps {
  selectedBlock: ReceiptBlock | null;
  paperWidth: PaperWidth;
  onUpdateBlock: (updated: ReceiptBlock) => void;
  onAddBlock: (type: ReceiptBlock['type']) => void;
  onDeleteBlock: (id: string) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  selectedBlock,
  paperWidth,
  onUpdateBlock,
  onAddBlock,
  onDeleteBlock
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBlock || selectedBlock.type !== 'image') return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const targetWidth = paperWidth === '58mm' ? 384 : 576;
      try {
        const processed = await processImageForThermal(
          dataUrl,
          targetWidth,
          (selectedBlock as ImageBlock).dither || 'atkinson',
          (selectedBlock as ImageBlock).threshold || 128,
          (selectedBlock as ImageBlock).contrast || 1.15,
          (selectedBlock as ImageBlock).brightness || 0,
          (selectedBlock as ImageBlock).invert || false
        );

        onUpdateBlock({
          ...selectedBlock,
          originalDataUrl: dataUrl,
          dataUrl: processed.previewDataUrl
        } as ImageBlock);
      } catch (err) {
        console.error('Image processing failed:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const reprocessImageBlock = async (changes: Partial<ImageBlock>) => {
    if (!selectedBlock || selectedBlock.type !== 'image') return;
    const current = selectedBlock as ImageBlock;
    const merged = { ...current, ...changes };
    const sourceDataUrl = merged.originalDataUrl || merged.dataUrl;

    if (sourceDataUrl) {
      const targetWidth = paperWidth === '58mm' ? 384 : 576;
      try {
        const processed = await processImageForThermal(
          sourceDataUrl,
          targetWidth,
          merged.dither || 'atkinson',
          merged.threshold || 128,
          merged.contrast || 1.15,
          merged.brightness || 0,
          merged.invert || false
        );
        merged.dataUrl = processed.previewDataUrl;
      } catch (err) {
        console.warn('Re-dithering failed:', err);
      }
    }
    onUpdateBlock(merged);
  };

  return (
    <div className="w-full lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-y-auto p-4 select-none">
      {/* Quick Add Palette */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-amber-400" /> Insert Blocks
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onAddBlock('header')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-[11px]"
          >
            <Heading className="w-4 h-4 mb-1 text-amber-400" />
            <span>Header</span>
          </button>
          <button
            onClick={() => onAddBlock('text')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-[11px]"
          >
            <Type className="w-4 h-4 mb-1 text-sky-400" />
            <span>Text</span>
          </button>
          <button
            onClick={() => onAddBlock('image')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-[11px]"
          >
            <ImageIcon className="w-4 h-4 mb-1 text-emerald-400" />
            <span>Photo</span>
          </button>
          <button
            onClick={() => onAddBlock('schedule')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-[11px]"
          >
            <Clock className="w-4 h-4 mb-1 text-purple-400" />
            <span>Schedule</span>
          </button>
          <button
            onClick={() => onAddBlock('tasklist')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-[11px]"
          >
            <CheckSquare className="w-4 h-4 mb-1 text-rose-400" />
            <span>Tasks</span>
          </button>
          <button
            onClick={() => onAddBlock('table')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-[11px]"
          >
            <TableIcon className="w-4 h-4 mb-1 text-orange-400" />
            <span>Table</span>
          </button>
          <button
            onClick={() => onAddBlock('qrcode')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-[11px]"
          >
            <QrCode className="w-4 h-4 mb-1 text-indigo-400" />
            <span>QR Code</span>
          </button>
          <button
            onClick={() => onAddBlock('divider')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-[11px]"
          >
            <Minus className="w-4 h-4 mb-1 text-stone-400" />
            <span>Divider</span>
          </button>
          <button
            onClick={() => onAddBlock('feed')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-[11px]"
          >
            <Scissors className="w-4 h-4 mb-1 text-teal-400" />
            <span>Tear Feed</span>
          </button>
        </div>
      </div>

      {/* Inspector Section */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" /> Block Inspector
          </h3>
          {selectedBlock && (
            <button
              onClick={() => onDeleteBlock(selectedBlock.id)}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          )}
        </div>

        {!selectedBlock ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Sparkles className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
            <p className="text-sm font-medium text-slate-300">No Block Selected</p>
            <p className="text-xs mt-1">
              Click on any block in the receipt preview to customize its text, photo, schedule, or style.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Header Inspector */}
            {selectedBlock.type === 'header' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Main Title</label>
                  <input
                    type="text"
                    value={(selectedBlock as HeaderBlock).title}
                    onChange={(e) =>
                      onUpdateBlock({
                        ...selectedBlock,
                        title: e.target.value
                      } as HeaderBlock)
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Subtitle / Address</label>
                  <input
                    type="text"
                    value={(selectedBlock as HeaderBlock).subtitle || ''}
                    onChange={(e) =>
                      onUpdateBlock({
                        ...selectedBlock,
                        subtitle: e.target.value
                      } as HeaderBlock)
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Date / Time Display</label>
                  <input
                    type="text"
                    value={(selectedBlock as HeaderBlock).dateStr || ''}
                    onChange={(e) =>
                      onUpdateBlock({
                        ...selectedBlock,
                        dateStr: e.target.value
                      } as HeaderBlock)
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Meta Left</label>
                    <input
                      type="text"
                      placeholder="e.g. ORD #104"
                      value={(selectedBlock as HeaderBlock).metaLeft || ''}
                      onChange={(e) =>
                        onUpdateBlock({
                          ...selectedBlock,
                          metaLeft: e.target.value
                        } as HeaderBlock)
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Meta Right</label>
                    <input
                      type="text"
                      placeholder="e.g. CASHIER #01"
                      value={(selectedBlock as HeaderBlock).metaRight || ''}
                      onChange={(e) =>
                        onUpdateBlock({
                          ...selectedBlock,
                          metaRight: e.target.value
                        } as HeaderBlock)
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Text Inspector */}
            {selectedBlock.type === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Content</label>
                  <textarea
                    rows={3}
                    value={(selectedBlock as TextBlock).text}
                    onChange={(e) =>
                      onUpdateBlock({
                        ...selectedBlock,
                        text: e.target.value
                      } as TextBlock)
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Font Size</label>
                    <select
                      value={(selectedBlock as TextBlock).fontSize}
                      onChange={(e) =>
                        onUpdateBlock({
                          ...selectedBlock,
                          fontSize: e.target.value as any
                        } as TextBlock)
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                    >
                      <option value="xs">Tiny (xs)</option>
                      <option value="sm">Small (sm)</option>
                      <option value="base">Normal (base)</option>
                      <option value="lg">Large (lg)</option>
                      <option value="xl">Extra Large (xl)</option>
                      <option value="2xl">Huge (2xl)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Alignment</label>
                    <div className="flex bg-slate-950 border border-slate-700 rounded-lg p-0.5">
                      {(['left', 'center', 'right'] as const).map((align) => (
                        <button
                          key={align}
                          onClick={() =>
                            onUpdateBlock({
                              ...selectedBlock,
                              align
                            } as TextBlock)
                          }
                          className={`flex-1 py-1 text-center capitalize rounded ${
                            (selectedBlock as TextBlock).align === align
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'text-slate-400'
                          }`}
                        >
                          {align[0].toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={(selectedBlock as TextBlock).bold}
                      onChange={(e) =>
                        onUpdateBlock({
                          ...selectedBlock,
                          bold: e.target.checked
                        } as TextBlock)
                      }
                      className="rounded bg-slate-950 border-slate-700 text-amber-500"
                    />
                    <span>Bold Text</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={(selectedBlock as TextBlock).inverted}
                      onChange={(e) =>
                        onUpdateBlock({
                          ...selectedBlock,
                          inverted: e.target.checked
                        } as TextBlock)
                      }
                      className="rounded bg-slate-950 border-slate-700 text-amber-500"
                    />
                    <span>Inverted (White on Black)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Photo / Image Inspector */}
            {selectedBlock.type === 'image' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Upload className="w-4 h-4" /> Choose / Replace Photo
                </button>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Dithering Algorithm</label>
                  <select
                    value={(selectedBlock as ImageBlock).dither || 'atkinson'}
                    onChange={(e) =>
                      reprocessImageBlock({
                        dither: e.target.value as DitherAlgorithm
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                  >
                    <option value="atkinson">Atkinson (Mac Classic - High Sharpness)</option>
                    <option value="floyd-steinberg">Floyd-Steinberg (Smooth Shading)</option>
                    <option value="bayer">Bayer 4x4 (Retro Crosshatch)</option>
                    <option value="threshold">Pure High-Contrast Threshold</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Contrast</span>
                    <span>{(selectedBlock as ImageBlock).contrast || 1.15}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={(selectedBlock as ImageBlock).contrast || 1.15}
                    onChange={(e) =>
                      reprocessImageBlock({ contrast: parseFloat(e.target.value) })
                    }
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Brightness</span>
                    <span>{(selectedBlock as ImageBlock).brightness || 0}</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    step="5"
                    value={(selectedBlock as ImageBlock).brightness || 0}
                    onChange={(e) =>
                      reprocessImageBlock({ brightness: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={(selectedBlock as ImageBlock).invert || false}
                      onChange={(e) =>
                        reprocessImageBlock({ invert: e.target.checked })
                      }
                      className="rounded bg-slate-950 border-slate-700 text-amber-500"
                    />
                    <span>Invert Negative</span>
                  </label>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Caption (Optional)</label>
                  <input
                    type="text"
                    value={(selectedBlock as ImageBlock).caption || ''}
                    onChange={(e) =>
                      onUpdateBlock({
                        ...selectedBlock,
                        caption: e.target.value
                      } as ImageBlock)
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                  />
                </div>
              </div>
            )}

            {/* Schedule Inspector */}
            {selectedBlock.type === 'schedule' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Schedule Title</label>
                  <input
                    type="text"
                    value={(selectedBlock as ScheduleBlock).title}
                    onChange={(e) =>
                      onUpdateBlock({
                        ...selectedBlock,
                        title: e.target.value
                      } as ScheduleBlock)
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Events & Time Slots</span>
                    <button
                      onClick={() => {
                        const current = selectedBlock as ScheduleBlock;
                        onUpdateBlock({
                          ...current,
                          items: [
                            ...current.items,
                            {
                              id: 'sch_' + Math.random().toString(36).substring(2, 7),
                              time: '12:00 PM',
                              title: 'New Agenda Item',
                              done: false
                            }
                          ]
                        });
                      }}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-3 h-3" /> Add Event
                    </button>
                  </div>

                  {(selectedBlock as ScheduleBlock).items.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <input
                        type="text"
                        value={item.time}
                        onChange={(e) => {
                          const current = selectedBlock as ScheduleBlock;
                          const newItems = [...current.items];
                          newItems[idx] = { ...item, time: e.target.value };
                          onUpdateBlock({ ...current, items: newItems });
                        }}
                        className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[11px] text-amber-300 font-mono"
                      />
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const current = selectedBlock as ScheduleBlock;
                          const newItems = [...current.items];
                          newItems[idx] = { ...item, title: e.target.value };
                          onUpdateBlock({ ...current, items: newItems });
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200"
                      />
                      <button
                        onClick={() => {
                          const current = selectedBlock as ScheduleBlock;
                          onUpdateBlock({
                            ...current,
                            items: current.items.filter((i) => i.id !== item.id)
                          });
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Task List Inspector */}
            {selectedBlock.type === 'tasklist' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Task List Header</label>
                  <input
                    type="text"
                    value={(selectedBlock as TaskListBlock).title}
                    onChange={(e) =>
                      onUpdateBlock({
                        ...selectedBlock,
                        title: e.target.value
                      } as TaskListBlock)
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Task Items</span>
                    <button
                      onClick={() => {
                        const current = selectedBlock as TaskListBlock;
                        onUpdateBlock({
                          ...current,
                          items: [
                            ...current.items,
                            {
                              id: 'tsk_' + Math.random().toString(36).substring(2, 7),
                              text: 'New Checklist Task',
                              done: false,
                              priority: 'medium'
                            }
                          ]
                        });
                      }}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-3 h-3" /> Add Task
                    </button>
                  </div>

                  {(selectedBlock as TaskListBlock).items.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => {
                          const current = selectedBlock as TaskListBlock;
                          const newItems = [...current.items];
                          newItems[idx] = { ...item, text: e.target.value };
                          onUpdateBlock({ ...current, items: newItems });
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200"
                      />
                      <select
                        value={item.priority || 'medium'}
                        onChange={(e) => {
                          const current = selectedBlock as TaskListBlock;
                          const newItems = [...current.items];
                          newItems[idx] = { ...item, priority: e.target.value as any };
                          onUpdateBlock({ ...current, items: newItems });
                        }}
                        className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[10px] text-slate-300"
                      >
                        <option value="high">High</option>
                        <option value="medium">Med</option>
                        <option value="low">Low</option>
                      </select>
                      <button
                        onClick={() => {
                          const current = selectedBlock as TaskListBlock;
                          onUpdateBlock({
                            ...current,
                            items: current.items.filter((i) => i.id !== item.id)
                          });
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Table Inspector */}
            {selectedBlock.type === 'table' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-1.5">
                  {(['col1', 'col2', 'col3'] as const).map((col, idx) => (
                    <div key={col}>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Col {idx + 1}</label>
                      <input
                        type="text"
                        value={(selectedBlock as TableBlock).headers[idx]}
                        onChange={(e) => {
                          const current = selectedBlock as TableBlock;
                          const newHeaders = [...current.headers] as [string, string, string];
                          newHeaders[idx] = e.target.value;
                          onUpdateBlock({ ...current, headers: newHeaders });
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-[11px] text-slate-100 font-bold"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Rows</span>
                    <button
                      onClick={() => {
                        const current = selectedBlock as TableBlock;
                        onUpdateBlock({
                          ...current,
                          rows: [
                            ...current.rows,
                            { col1: 'Item', col2: '1', col3: '$0.00' }
                          ]
                        });
                      }}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-3 h-3" /> Add Row
                    </button>
                  </div>

                  {(selectedBlock as TableBlock).rows.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-1 items-center bg-slate-950 p-1 rounded border border-slate-800">
                      <input
                        type="text"
                        value={row.col1}
                        onChange={(e) => {
                          const current = selectedBlock as TableBlock;
                          const newRows = [...current.rows];
                          newRows[idx] = { ...row, col1: e.target.value };
                          onUpdateBlock({ ...current, rows: newRows });
                        }}
                        className="col-span-6 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[11px] text-slate-200"
                      />
                      <input
                        type="text"
                        value={row.col2}
                        onChange={(e) => {
                          const current = selectedBlock as TableBlock;
                          const newRows = [...current.rows];
                          newRows[idx] = { ...row, col2: e.target.value };
                          onUpdateBlock({ ...current, rows: newRows });
                        }}
                        className="col-span-2 bg-slate-900 border border-slate-700 rounded px-1 py-1 text-[11px] text-slate-200 text-center"
                      />
                      <input
                        type="text"
                        value={row.col3}
                        onChange={(e) => {
                          const current = selectedBlock as TableBlock;
                          const newRows = [...current.rows];
                          newRows[idx] = { ...row, col3: e.target.value };
                          onUpdateBlock({ ...current, rows: newRows });
                        }}
                        className="col-span-3 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-[11px] text-slate-200 text-right"
                      />
                      <button
                        onClick={() => {
                          const current = selectedBlock as TableBlock;
                          onUpdateBlock({
                            ...current,
                            rows: current.rows.filter((_, i) => i !== idx)
                          });
                        }}
                        className="col-span-1 text-slate-500 hover:text-rose-400 flex justify-center"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Total Label</label>
                    <input
                      type="text"
                      value={(selectedBlock as TableBlock).totalLabel || ''}
                      onChange={(e) =>
                        onUpdateBlock({
                          ...selectedBlock,
                          totalLabel: e.target.value
                        } as TableBlock)
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Total Amount</label>
                    <input
                      type="text"
                      value={(selectedBlock as TableBlock).totalValue || ''}
                      onChange={(e) =>
                        onUpdateBlock({
                          ...selectedBlock,
                          totalValue: e.target.value
                        } as TableBlock)
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[11px] font-bold text-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* QR Code Inspector */}
            {selectedBlock.type === 'qrcode' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">QR Link / Text</label>
                  <input
                    type="text"
                    value={(selectedBlock as QrCodeBlock).data}
                    onChange={(e) =>
                      onUpdateBlock({
                        ...selectedBlock,
                        data: e.target.value
                      } as QrCodeBlock)
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Caption Underneath</label>
                  <input
                    type="text"
                    value={(selectedBlock as QrCodeBlock).label || ''}
                    onChange={(e) =>
                      onUpdateBlock({
                        ...selectedBlock,
                        label: e.target.value
                      } as QrCodeBlock)
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Size (Dots)</label>
                  <input
                    type="range"
                    min="80"
                    max="220"
                    step="10"
                    value={(selectedBlock as QrCodeBlock).size}
                    onChange={(e) =>
                      onUpdateBlock({
                        ...selectedBlock,
                        size: parseInt(e.target.value, 10)
                      } as QrCodeBlock)
                    }
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Divider Inspector */}
            {selectedBlock.type === 'divider' && (
              <div className="space-y-3">
                <label className="block text-slate-400 mb-1 font-medium">Divider Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'dashed', label: 'Dashed ( - - - )' },
                      { id: 'dotted', label: 'Dotted ( . . . )' },
                      { id: 'solid', label: 'Solid Single' },
                      { id: 'double', label: 'Double Line' },
                      { id: 'stars', label: 'Stars ( * * * )' },
                      { id: 'cut', label: 'Scissors Cut ✂' }
                    ] as const
                  ).map((style) => (
                    <button
                      key={style.id}
                      onClick={() =>
                        onUpdateBlock({
                          ...selectedBlock,
                          style: style.id
                        } as DividerBlock)
                      }
                      className={`p-2 rounded-lg border text-left text-xs transition-all ${
                        (selectedBlock as DividerBlock).style === style.id
                          ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feed / Tear Space Inspector */}
            {selectedBlock.type === 'feed' && (
              <div className="space-y-3">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Feed Blank Lines</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {((selectedBlock as any).lines || 3)} lines (~{((selectedBlock as any).lines || 3) * 6}mm)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={(selectedBlock as any).lines || 3}
                  onChange={(e) =>
                    onUpdateBlock({
                      ...selectedBlock,
                      lines: parseInt(e.target.value, 10)
                    } as any)
                  }
                  className="w-full accent-amber-500"
                />
                <p className="text-[11px] text-slate-400">
                  Advances the paper cleanly past your printer's serrated tear bar so the receipt can be torn off without cutting any text.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


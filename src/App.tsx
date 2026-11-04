import React, { useState, useRef, useEffect } from 'react';
import {
  ReceiptBlock,
  PaperWidth,
  BluetoothConnectionState,
  TemplateDefinition
} from './types/printer';
import { PRESET_TEMPLATES } from './services/templates';
import { Navbar } from './components/Navbar';
import { ReceiptCanvas } from './components/ReceiptCanvas';
import { BlockEditor } from './components/BlockEditor';
import { BluetoothModal } from './components/BluetoothModal';
import { CalendarModal } from './components/CalendarModal';
import { TemplatesModal } from './components/TemplatesModal';
import { printReceiptElement, downloadReceiptPng } from './services/printEngine';
import { printerService } from './services/bluetoothService';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Load initial template or cached blocks from localStorage
  const [paperWidth, setPaperWidth] = useState<PaperWidth>(() => {
    return (localStorage.getItem('tp_paper_width') as PaperWidth) || '58mm';
  });

  const [blocks, setBlocks] = useState<ReceiptBlock[]>(() => {
    const saved = localStorage.getItem('tp_blocks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse cached blocks', e);
      }
    }
    // Default to the Google Calendar Daily Agenda template
    return PRESET_TEMPLATES[0].blocks;
  });

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  const [btState, setBtState] = useState<BluetoothConnectionState>({
    isConnected: false,
    deviceName: null,
    status: 'idle',
    errorMessage: null,
    connectionType: null
  });

  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const receiptRef = useRef<HTMLDivElement>(null);

  // Auto-save blocks to localStorage
  useEffect(() => {
    localStorage.setItem('tp_blocks', JSON.stringify(blocks));
  }, [blocks]);

  useEffect(() => {
    localStorage.setItem('tp_paper_width', paperWidth);
  }, [paperWidth]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSelectBlock = (id: string) => {
    setSelectedBlockId(id);
  };

  const handleUpdateBlock = (updated: ReceiptBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleAddBlock = (type: ReceiptBlock['type']) => {
    const newId = 'blk_' + Date.now();
    let newBlock: ReceiptBlock;

    switch (type) {
      case 'header':
        newBlock = {
          id: newId,
          type: 'header',
          title: 'CUSTOM TITLE',
          subtitle: 'SUBTITLE / NOTE',
          dateStr: new Date().toLocaleDateString()
        };
        break;
      case 'text':
        newBlock = {
          id: newId,
          type: 'text',
          text: 'New note or custom message line here',
          fontSize: 'sm',
          align: 'left',
          bold: false,
          inverted: false,
          monospace: true
        };
        break;
      case 'image':
        newBlock = {
          id: newId,
          type: 'image',
          dataUrl: '',
          dither: 'atkinson',
          threshold: 128,
          contrast: 1.15,
          brightness: 0,
          invert: false,
          caption: 'Thermal Photo'
        };
        break;
      case 'schedule':
        newBlock = {
          id: newId,
          type: 'schedule',
          title: 'DAILY AGENDA',
          date: new Date().toISOString().split('T')[0],
          items: [
            { id: 's1', time: '09:00 AM', title: 'Morning Planning', category: 'personal', done: false },
            { id: 's2', time: '11:00 AM', title: 'Deep Work Session', category: 'work', done: false }
          ]
        };
        break;
      case 'tasklist':
        newBlock = {
          id: newId,
          type: 'tasklist',
          title: 'ACTION ITEMS',
          items: [
            { id: 't1', text: 'Complete priority objective', done: false, priority: 'high' },
            { id: 't2', text: 'Follow-up on pending items', done: false, priority: 'medium' }
          ]
        };
        break;
      case 'table':
        newBlock = {
          id: newId,
          type: 'table',
          headers: ['ITEM', 'QTY', 'PRICE'],
          rows: [
            { col1: 'Product Item A', col2: '1', col3: '$10.00' },
            { col1: 'Product Item B', col2: '2', col3: '$15.00' }
          ],
          totalLabel: 'TOTAL',
          totalValue: '$25.00'
        };
        break;
      case 'qrcode':
        newBlock = {
          id: newId,
          type: 'qrcode',
          data: 'https://github.com',
          size: 130,
          align: 'center',
          label: 'SCAN FOR INFO'
        };
        break;
      case 'divider':
        newBlock = {
          id: newId,
          type: 'divider',
          style: 'dashed'
        };
        break;
      case 'feed':
      default:
        newBlock = {
          id: newId,
          type: 'feed',
          lines: 2
        };
        break;
    }

    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newId);
    showToast(`Added ${type.toUpperCase()} block`, 'info');
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const handleMoveBlock = (id: string, direction: 'up' | 'down') => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx < 0) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;

      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  const handleToggleScheduleItem = (blockId: string, itemId: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.type !== 'schedule') return b;
        return {
          ...b,
          items: b.items.map((item) =>
            item.id === itemId ? { ...item, done: !item.done } : item
          )
        };
      })
    );
  };

  const handleToggleTaskItem = (blockId: string, itemId: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.type !== 'tasklist') return b;
        return {
          ...b,
          items: b.items.map((task) =>
            task.id === itemId ? { ...task, done: !task.done } : task
          )
        };
      })
    );
  };

  const handleSelectTemplate = (tmpl: TemplateDefinition) => {
    setBlocks(tmpl.blocks);
    setPaperWidth(tmpl.paperWidth);
    setSelectedBlockId(null);
    showToast(`Loaded template: ${tmpl.name}`, 'success');
  };

  const handleApplyCalendarSchedule = (newBlocks: ReceiptBlock[]) => {
    setBlocks(newBlocks);
    setSelectedBlockId(null);
    showToast('Applied Google Calendar Schedule Template!', 'success');
  };

  const handleNewBlank = () => {
    if (confirm('Start a new blank receipt? Your current canvas will be cleared.')) {
      setBlocks([]);
      setSelectedBlockId(null);
      showToast('Cleared canvas', 'info');
    }
  };

  const handlePrint = async () => {
    if (!receiptRef.current) return;
    setIsPrinting(true);
    setPrintProgress(0);

    try {
      const res = await printReceiptElement(
        receiptRef.current,
        paperWidth,
        (percent) => setPrintProgress(percent)
      );
      if (res.success) {
        showToast(res.message || 'Printed successfully!', 'success');
      } else {
        showToast(res.message || 'Print failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Printing error', 'error');
    } finally {
      setIsPrinting(false);
      setPrintProgress(0);
    }
  };

  const handleExportPng = async () => {
    if (!receiptRef.current) return;
    try {
      await downloadReceiptPng(receiptRef.current, paperWidth);
      showToast('Downloaded receipt image!', 'success');
    } catch (err) {
      showToast('Failed to export PNG', 'error');
    }
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        paperWidth={paperWidth}
        onPaperWidthChange={setPaperWidth}
        btState={btState}
        onOpenBluetoothModal={() => setIsBluetoothModalOpen(true)}
        onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
        onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
        onPrint={handlePrint}
        isPrinting={isPrinting}
        onExportPng={handleExportPng}
        onNewBlank={handleNewBlank}
      />

      {/* Main Studio Body: Editor Drawer + Live Receipt Preview */}
      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Left Inspector & Block Tools */}
        <BlockEditor
          selectedBlock={selectedBlock}
          paperWidth={paperWidth}
          onUpdateBlock={handleUpdateBlock}
          onAddBlock={handleAddBlock}
          onDeleteBlock={handleDeleteBlock}
        />

        {/* Center / Right Canvas Area */}
        <section className="flex-1 bg-slate-950/80 overflow-y-auto relative flex flex-col items-center justify-start">
          <ReceiptCanvas
            blocks={blocks}
            paperWidth={paperWidth}
            selectedBlockId={selectedBlockId}
            onSelectBlock={handleSelectBlock}
            onMoveBlock={handleMoveBlock}
            onDeleteBlock={handleDeleteBlock}
            onToggleScheduleItem={handleToggleScheduleItem}
            onToggleTaskItem={handleToggleTaskItem}
            receiptRef={receiptRef}
          />
        </section>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md border animate-bounce-short text-xs font-semibold bg-slate-900 border-slate-700 text-white">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 text-amber-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Printing Overlay */}
      {isPrinting && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-spin">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Streaming to Thermal Printer...</h3>
              <p className="text-xs text-slate-400 mt-1">Chunking raster bits to prevent head buffer overflow</p>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-2.5 rounded-full transition-all duration-150"
                style={{ width: `${Math.max(5, printProgress)}%` }}
              ></div>
            </div>
            <p className="text-xs font-mono text-amber-400">{printProgress}% Sent</p>
          </div>
        </div>
      )}

      {/* Modals */}
      <BluetoothModal
        isOpen={isBluetoothModalOpen}
        onClose={() => setIsBluetoothModalOpen(false)}
        btState={btState}
        setBtState={setBtState}
      />

      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        onApplySchedule={handleApplyCalendarSchedule}
      />

      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
};

export default App;

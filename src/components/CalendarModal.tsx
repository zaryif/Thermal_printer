import React, { useState, useRef } from 'react';
import {
  Calendar,
  Upload,
  FileText,
  Clock,
  CheckCircle,
  Sparkles,
  X,
  ListTodo,
  ExternalLink
} from 'lucide-react';
import { parseICS, parsePlainTextAgenda } from '../services/calendarParser';
import { ReceiptBlock, ScheduleItem } from '../types/printer';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySchedule: (newBlocks: ReceiptBlock[]) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  onApplySchedule
}) => {
  const [activeTab, setActiveTab] = useState<'ics' | 'paste' | 'preset'>('ics');
  const [targetDate, setTargetDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [parsedItems, setParsedItems] = useState<ScheduleItem[]>([
    { id: '1', time: '08:30 AM', title: 'Morning Planning & Coffee', category: 'personal', done: true },
    { id: '2', time: '09:30 AM', title: 'Team Sync & Standup (Google Meet)', category: 'meeting', done: false },
    { id: '11:00 AM', time: '11:00 AM', title: 'Focus Sprint: Thermal App Polish', category: 'work', done: false },
    { id: '3', time: '01:00 PM', title: 'Healthy Lunch & Walk', category: 'health', done: false },
    { id: '4', time: '02:30 PM', title: 'Product Review & Architecture Demo', category: 'meeting', done: false },
    { id: '5', time: '05:00 PM', title: 'Daily Wrap-up & Tomorrow Prep', category: 'work', done: false },
    { id: '6', time: '06:30 PM', title: 'Workout & Fitness Routine', category: 'health', done: false }
  ]);
  const [includeTasks, setIncludeTasks] = useState(true);
  const [includeQuote, setIncludeQuote] = useState(true);
  const [includeQr, setIncludeQr] = useState(true);
  const [pasteText, setPasteText] = useState(
    `09:00 AM - 10:00 AM Engineering Standup\n11:30 AM Client Architecture Review\n01:00 PM Lunch & Walk\n02:30 PM Code Refactor & Testing\n04:30 PM Product Design Sync\n06:30 PM Gym & Fitness`
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const items = parseICS(content, targetDate);
      if (items.length > 0) {
        setParsedItems(items);
      } else {
        alert('No events found for the selected date. Showing all parsed events or sample items.');
        const allItems = parseICS(content);
        if (allItems.length > 0) setParsedItems(allItems);
      }
    };
    reader.readAsText(file);
  };

  const handleParseText = () => {
    const items = parsePlainTextAgenda(pasteText);
    if (items.length > 0) {
      setParsedItems(items);
    }
  };

  const handleApply = () => {
    const formattedDate = new Date(targetDate + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).toUpperCase();

    const blocks: ReceiptBlock[] = [];

    // Header Block
    blocks.push({
      id: 'h_' + Date.now(),
      type: 'header',
      title: 'DAILY AGENDA & FOCUS',
      subtitle: 'GOOGLE CALENDAR & TASKS',
      dateStr: formattedDate,
      metaLeft: 'GOAL: 100% FOCUS',
      metaRight: 'STATUS: ACTIVE'
    });

    // Divider
    blocks.push({
      id: 'div_1_' + Date.now(),
      type: 'divider',
      style: 'double'
    });

    // Quote Block
    if (includeQuote) {
      blocks.push({
        id: 'q_' + Date.now(),
        type: 'text',
        text: '“Win the morning, win the day.”',
        fontSize: 'xs',
        align: 'center',
        bold: false,
        inverted: false,
        monospace: true
      });
      blocks.push({
        id: 'div_q_' + Date.now(),
        type: 'divider',
        style: 'dashed'
      });
    }

    // Schedule Block
    blocks.push({
      id: 'sch_' + Date.now(),
      type: 'schedule',
      title: 'CALENDAR TIMELINE',
      date: targetDate,
      items: parsedItems
    });

    // Priority Tasks Block
    if (includeTasks) {
      blocks.push({
        id: 'div_2_' + Date.now(),
        type: 'divider',
        style: 'solid'
      });

      blocks.push({
        id: 'tsk_' + Date.now(),
        type: 'tasklist',
        title: 'TOP 3 PRIORITIES & HABITS',
        items: [
          { id: 't1', text: 'Deliver core milestone on time', done: false, priority: 'high' },
          { id: 't2', text: 'Clear key unread communications', done: false, priority: 'medium' },
          { id: 't3', text: '2.5L Water & 30 min movement', done: false, priority: 'medium' }
        ]
      });
    }

    // QR Code to Google Calendar
    if (includeQr) {
      blocks.push({
        id: 'div_3_' + Date.now(),
        type: 'divider',
        style: 'stars'
      });

      blocks.push({
        id: 'qr_' + Date.now(),
        type: 'qrcode',
        data: 'https://calendar.google.com',
        size: 130,
        align: 'center',
        label: 'SCAN TO OPEN CALENDAR'
      });
    }

    // Paper feed
    blocks.push({
      id: 'feed_' + Date.now(),
      type: 'feed',
      lines: 3
    });

    onApplySchedule(blocks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Google Calendar Schedule Template</h2>
              <p className="text-xs text-slate-400">Import your calendar and format into a crisp thermal checklist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('ics')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'ics'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Google .ICS File
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Quick Paste Agenda
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Target Date Picker */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="font-semibold text-slate-200 block">Schedule Date</span>
              <span className="text-[11px] text-slate-400">Choose which day's agenda to format</span>
            </div>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-400 font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          {activeTab === 'ics' && (
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                accept=".ics,text/calendar"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-amber-500/70 bg-slate-950/60 rounded-xl p-6 text-center cursor-pointer transition-all group"
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500 group-hover:text-amber-400 transition-colors" />
                <p className="font-semibold text-slate-200">Click to upload Google Calendar .ics file</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Export from Google Calendar (Settings &gt; Import &amp; Export) or download single event .ics
                </p>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-2">
              <label className="block text-slate-300 font-semibold">Paste Your Calendar Events / Agenda</label>
              <textarea
                rows={5}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleParseText}
                className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Parse Pasted Agenda
              </button>
            </div>
          )}

          {/* Parsed Events Preview List */}
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="font-semibold text-white">Parsed Timeline Events ({parsedItems.length})</span>
              <span className="text-[11px] text-amber-400">Ready to print on thermal paper</span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              {parsedItems.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900 border border-slate-800/80">
                  <span className="font-medium text-slate-200 truncate pr-2">{item.title}</span>
                  <span className="text-[11px] font-mono text-amber-400 font-bold whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customization Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeQuote}
                onChange={(e) => setIncludeQuote(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-amber-500"
              />
              <span>Daily Quote</span>
            </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTasks}
                onChange={(e) => setIncludeTasks(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-amber-500"
              />
              <span>Top 3 Tasks</span>
            </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeQr}
                onChange={(e) => setIncludeQr(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-amber-500"
              />
              <span>Calendar QR</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-sky-400 text-xs flex items-center gap-1"
          >
            <span>Open Google Calendar</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Apply to Designer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

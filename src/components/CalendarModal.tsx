import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Upload,
  FileText,
  Clock,
  CheckCircle,
  Sparkles,
  X,
  ListTodo,
  ExternalLink,
  LogIn,
  LogOut,
  RefreshCw,
  Key,
  Check
} from 'lucide-react';
import { parseICS, parsePlainTextAgenda } from '../services/calendarParser';
import {
  getStoredGoogleClientId,
  setStoredGoogleClientId,
  getStoredGoogleToken,
  clearGoogleSession,
  initGoogleSignIn,
  fetchGoogleCalendarEvents
} from '../services/googleCalendarService';
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
  const [activeTab, setActiveTab] = useState<'google' | 'ics' | 'paste'>('google');
  const [targetDate, setTargetDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [googleClientId, setGoogleClientId] = useState<string>(getStoredGoogleClientId());
  const [googleToken, setGoogleToken] = useState<string | null>(getStoredGoogleToken());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const [parsedItems, setParsedItems] = useState<ScheduleItem[]>([
    { id: '1', time: '04:38 AM', title: 'Fajr Prayer & Early Focus', category: 'personal', done: true },
    { id: '2', time: '08:30 AM', title: 'Morning Review & Planning', category: 'work', done: true },
    { id: '3', time: '11:47 AM', title: 'Jummah Prayer & Family Time', category: 'personal', done: false },
    { id: '4', time: '01:30 PM', title: 'Midterm Study Sprint', category: 'work', done: false },
    { id: '5', time: '03:07 PM', title: 'Asr Prayer & Problem Tracing', category: 'personal', done: false },
    { id: '6', time: '05:38 PM', title: 'Maghrib Prayer & Dinner Break', category: 'personal', done: false },
    { id: '7', time: '06:53 PM', title: 'Isha Prayer & Progress Check', category: 'personal', done: false },
    { id: '8', time: '08:30 PM', title: 'Exam Prep: AIUB Midterms Sprint', category: 'work', done: false }
  ]);
  const [includeTasks, setIncludeTasks] = useState(true);
  const [includeQuote, setIncludeQuote] = useState(true);
  const [includeQr, setIncludeQr] = useState(true);
  const [pasteText, setPasteText] = useState(
    `08:30 AM - 10:00 AM Morning Study & Review\n11:47 AM Jummah Prayer\n01:30 PM Midterm Sprint Practice\n03:07 PM Asr Prayer & Problem Sets\n05:38 PM Maghrib Prayer & Break\n08:30 PM Final Exam Prep`
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGoogleClientId(getStoredGoogleClientId());
    setGoogleToken(getStoredGoogleToken());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveClientId = (newId: string) => {
    setGoogleClientId(newId);
    setStoredGoogleClientId(newId);
  };

  const handleGoogleConnect = () => {
    setSyncStatus(null);
    initGoogleSignIn(
      googleClientId,
      async (token) => {
        setGoogleToken(token);
        setSyncStatus('Successfully authenticated with Google! Fetching events...');
        await handleFetchGoogleEvents(token);
      },
      (err) => {
        setSyncStatus(`Error: ${err}`);
      }
    );
  };

  const handleFetchGoogleEvents = async (tokenOverride?: string) => {
    const token = tokenOverride || googleToken;
    if (!token) {
      setSyncStatus('Please sign in with Google first.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus(`Fetching events for ${targetDate}...`);
    try {
      const items = await fetchGoogleCalendarEvents(token, targetDate);
      if (items.length === 0) {
        setSyncStatus(`No calendar events found for ${targetDate}.`);
      } else {
        setParsedItems(items);
        setSyncStatus(`✓ Loaded ${items.length} events from Google Calendar!`);
      }
    } catch (err: any) {
      if (err.message?.includes('expired')) {
        setGoogleToken(null);
      }
      setSyncStatus(`Sync Failed: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleSignOut = () => {
    clearGoogleSession();
    setGoogleToken(null);
    setSyncStatus('Signed out from Google Calendar.');
  };

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
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-2 gap-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('google')}
            className={`pb-2.5 px-3 font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'google'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Google Sign-In Sync
          </button>
          <button
            onClick={() => setActiveTab('ics')}
            className={`pb-2.5 px-3 font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
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
            className={`pb-2.5 px-3 font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTargetDate(new Date().toISOString().split('T')[0])}
                className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  setTargetDate(d.toISOString().split('T')[0]);
                }}
                className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-medium transition-all"
              >
                Tomorrow
              </button>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-400 font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {activeTab === 'google' && (
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              {googleToken ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="font-semibold">Connected to Google Calendar</span>
                    </div>
                    <button
                      onClick={handleGoogleSignOut}
                      className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-red-500/20 hover:text-red-300 text-slate-400 transition-all flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      Sign Out
                    </button>
                  </div>

                  <button
                    onClick={() => handleFetchGoogleEvents()}
                    disabled={isSyncing}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing from Google Calendar...' : `Sync Events for ${targetDate}`}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      Google Cloud OAuth Client ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1234567890-xxx.apps.googleusercontent.com"
                      value={googleClientId}
                      onChange={(e) => handleSaveClientId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-400">
                      Create a free OAuth 2.0 Web Client ID in Google Cloud Console with Calendar API enabled.
                    </p>
                  </div>

                  <button
                    onClick={handleGoogleConnect}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.76-2.1-6.71-4.93H1.28v3.13C3.26 21.36 7.34 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.29 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.6H1.28C.46 8.22 0 10.05 0 12s.46 3.78 1.28 5.4l4.01-3.13z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.28 6.6l4.01 3.13c.95-2.83 3.59-4.98 6.71-4.98z"
                      />
                    </svg>
                    <span>Sign In with Google</span>
                  </button>

                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90">
                    💡 <strong>Tip:</strong> Don't have a Client ID? You can also click the <strong>Upload Google .ICS File</strong> tab above to load your calendar without any configuration!
                  </div>
                </div>
              )}

              {syncStatus && (
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
                  {syncStatus}
                </div>
              )}
            </div>
          )}

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


import { TemplateDefinition, PaperWidth } from '../types/printer';

export const PRESET_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'daily-agenda-pro',
    name: 'Google Calendar Daily Agenda',
    tagline: 'Complete day breakdown, calendar timeline & priority task checkboxes',
    category: 'calendar',
    paperWidth: '58mm',
    blocks: [
      {
        id: 'h1',
        type: 'header',
        title: 'DAILY AGENDA & FOCUS',
        subtitle: 'SCHEDULE & TASK TRACKER',
        dateStr: new Date().toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).toUpperCase(),
        metaLeft: 'STATUS: ACTIVE',
        metaRight: 'GOAL: 100%'
      },
      {
        id: 'div1',
        type: 'divider',
        style: 'double'
      },
      {
        id: 'quote1',
        type: 'text',
        text: '“Focus on being productive instead of busy.”',
        fontSize: 'xs',
        align: 'center',
        bold: false,
        inverted: false,
        monospace: true
      },
      {
        id: 'div2',
        type: 'divider',
        style: 'dashed'
      },
      {
        id: 'sch1',
        type: 'schedule',
        title: 'TIME BLOCKS (GOOGLE CALENDAR)',
        date: new Date().toISOString().split('T')[0],
        items: [
          { id: 's1', time: '04:38 AM', title: 'Fajr Prayer & Early Focus', category: 'personal', done: true },
          { id: 's2', time: '08:30 AM', title: 'Morning Review & Planning', category: 'work', done: true },
          { id: 's3', time: '11:47 AM', title: 'Dhuhr Prayer & Lunch', category: 'personal', done: false },
          { id: 's4', time: '01:30 PM', title: 'Midterm Study Sprint (3 Days Left!)', category: 'work', done: false },
          { id: 's5', time: '03:07 PM', title: 'Asr Prayer & Problem Solving', category: 'personal', done: false },
          { id: 's6', time: '05:38 PM', title: 'Maghrib Prayer & Wrap-up', category: 'personal', done: false },
          { id: 's7', time: '06:53 PM', title: 'Isha Prayer & Evening Prep', category: 'personal', done: false }
        ]
      },
      {
        id: 'div3',
        type: 'divider',
        style: 'solid'
      },
      {
        id: 'tasks1',
        type: 'tasklist',
        title: 'TOP PRIORITIES & HABITS',
        items: [
          { id: 't1', text: '[NOV 8] AIUB Midterm Exams Revision', done: false, priority: 'high' },
          { id: 't2', text: 'Algorithms [Section B] Quiz Prep', done: false, priority: 'high' },
          { id: 't3', text: 'Data Comm [Section A] Lab Report Sync', done: false, priority: 'medium' },
          { id: 't4', text: 'Drink 2.5L water & 30m movement', done: false, priority: 'medium' }
        ]
      },
      {
        id: 'div4',
        type: 'divider',
        style: 'stars'
      },
      {
        id: 'qr1',
        type: 'qrcode',
        data: 'https://calendar.google.com',
        size: 140,
        align: 'center',
        label: 'SCAN TO OPEN CALENDAR'
      },
      {
        id: 'feed1',
        type: 'feed',
        lines: 6
      }
    ]
  },
  {
    id: 'pos-retail-receipt',
    name: 'Artisan Cafe & POS Receipt',
    tagline: 'Itemized sales receipt with totals, tax & QR loyalty coupon',
    category: 'pos',
    paperWidth: '58mm',
    blocks: [
      {
        id: 'ph1',
        type: 'header',
        title: 'METRO COFFEE ROASTERS',
        subtitle: '104 Silicon Blvd, Suite 200',
        dateStr: new Date().toLocaleString(),
        metaLeft: 'ORD #8942',
        metaRight: 'REG: POS-01'
      },
      {
        id: 'pdiv1',
        type: 'divider',
        style: 'dashed'
      },
      {
        id: 'ptable1',
        type: 'table',
        headers: ['ITEM', 'QTY', 'AMT'],
        rows: [
          { col1: 'Flat White (Oat)', col2: '2', col3: '$9.60' },
          { col1: 'Avocado Toast', col2: '1', col3: '$12.50' },
          { col1: 'Almond Croissant', col2: '2', col3: '$7.80' },
          { col1: 'Cold Brew 16oz', col2: '1', col3: '$5.50' }
        ],
        totalLabel: 'GRAND TOTAL',
        totalValue: '$35.40'
      },
      {
        id: 'pdiv2',
        type: 'divider',
        style: 'double'
      },
      {
        id: 'ptext1',
        type: 'text',
        text: 'PAID VIA APPLE PAY: $35.40',
        fontSize: 'sm',
        align: 'center',
        bold: true,
        inverted: false,
        monospace: true
      },
      {
        id: 'ptext2',
        type: 'text',
        text: 'THANK YOU FOR YOUR VISIT!',
        fontSize: 'xs',
        align: 'center',
        bold: false,
        inverted: false,
        monospace: true
      },
      {
        id: 'pqr1',
        type: 'qrcode',
        data: 'https://example.com/receipt/8942',
        size: 130,
        align: 'center',
        label: 'JOIN OUR VIP REWARDS'
      },
      {
        id: 'pfeed1',
        type: 'feed',
        lines: 3
      }
    ]
  },
  {
    id: 'sprint-task-checklist',
    name: 'Developer Sprint & Bug Tracker',
    tagline: 'Technical sprint priorities, release checklist & git commits',
    category: 'productivity',
    paperWidth: '58mm',
    blocks: [
      {
        id: 'th1',
        type: 'header',
        title: 'SPRINT TICKETS',
        subtitle: 'RELEASE SPRINT V2.4',
        dateStr: new Date().toLocaleDateString(),
        metaLeft: 'BRANCH: main',
        metaRight: 'STATUS: RC'
      },
      {
        id: 'tdiv1',
        type: 'divider',
        style: 'solid'
      },
      {
        id: 'ttasks1',
        type: 'tasklist',
        title: 'CRITICAL BLOCKERS',
        items: [
          { id: 'tk1', text: 'Fix Bluetooth reconnect loop', done: true, priority: 'high' },
          { id: 'tk2', text: 'Optimize Atkinson dithering', done: true, priority: 'high' },
          { id: 'tk3', text: 'Capacitor Android APK build', done: false, priority: 'high' },
          { id: 'tk4', text: 'Test iOS AirPrint margin 0mm', done: false, priority: 'medium' }
        ]
      },
      {
        id: 'tdiv2',
        type: 'divider',
        style: 'dashed'
      },
      {
        id: 'ttext1',
        type: 'text',
        text: 'BUILD TARGET: APK + IOS + MAC + WIN',
        fontSize: 'xs',
        align: 'center',
        bold: true,
        inverted: true,
        monospace: true
      },
      {
        id: 'tfeed1',
        type: 'feed',
        lines: 2
      }
    ]
  },
  {
    id: 'photo-memo-sticker',
    name: 'Photo Sticker & Pocket Memo',
    tagline: 'Upload your photo with custom Atkinson dithering & personal notes',
    category: 'notes',
    paperWidth: '58mm',
    blocks: [
      {
        id: 'pm_h1',
        type: 'header',
        title: 'POCKET MEMO & PHOTO',
        subtitle: 'CAPTURED MOMENT',
        dateStr: new Date().toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).toUpperCase()
      },
      {
        id: 'pm_div1',
        type: 'divider',
        style: 'cut'
      },
      {
        id: 'pm_img1',
        type: 'image',
        dataUrl: '',
        dither: 'atkinson',
        threshold: 128,
        contrast: 1.15,
        brightness: 0,
        invert: false,
        caption: 'Click Photo block to upload image'
      },
      {
        id: 'pm_div2',
        type: 'divider',
        style: 'dashed'
      },
      {
        id: 'pm_txt1',
        type: 'text',
        text: '“Every moment is a fresh beginning.”',
        fontSize: 'sm',
        align: 'center',
        bold: false,
        inverted: false,
        monospace: true
      },
      {
        id: 'pm_feed1',
        type: 'feed',
        lines: 3
      }
    ]
  },
  {
    id: 'midterm-study-sprint',
    name: 'Midterm & Exam Revision Sprint',
    tagline: 'Countdown checklist, problem set trackers & daily motivation',
    category: 'productivity',
    paperWidth: '58mm',
    blocks: [
      {
        id: 'ms_h1',
        type: 'header',
        title: 'MIDTERM STUDY SPRINT',
        subtitle: 'EXAM COUNTDOWN & REVISION',
        dateStr: new Date().toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).toUpperCase(),
        metaLeft: 'FOCUS: 100%',
        metaRight: 'STATUS: ACTIVE'
      },
      {
        id: 'ms_div1',
        type: 'divider',
        style: 'double'
      },
      {
        id: 'ms_q1',
        type: 'text',
        text: '“Success is the sum of small efforts, repeated day in and day out.”',
        fontSize: 'xs',
        align: 'center',
        bold: false,
        inverted: false,
        monospace: true
      },
      {
        id: 'ms_div2',
        type: 'divider',
        style: 'solid'
      },
      {
        id: 'ms_tasks1',
        type: 'tasklist',
        title: 'TODAY STUDY OBJECTIVES',
        items: [
          { id: 'm1', text: 'Data Communication (CNCS) Review', done: true, priority: 'high' },
          { id: 'm2', text: 'Algorithms: Tracing & Complexity', done: false, priority: 'high' },
          { id: 'm3', text: 'Database Management Lab Sets', done: false, priority: 'medium' },
          { id: 'm4', text: 'Drink 2.5L Water & 30m Exercise', done: false, priority: 'medium' }
        ]
      },
      {
        id: 'ms_div3',
        type: 'divider',
        style: 'stars'
      },
      {
        id: 'ms_qr1',
        type: 'qrcode',
        data: 'https://calendar.google.com',
        size: 130,
        align: 'center',
        label: 'SCAN FOR STUDY CALENDAR'
      },
      {
        id: 'ms_feed1',
        type: 'feed',
        lines: 3
      }
    ]
  }
];


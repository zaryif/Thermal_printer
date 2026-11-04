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
          { id: 's1', time: '08:30 AM', title: 'Morning Coffee & Agenda Sync', category: 'personal', done: true },
          { id: 's2', time: '09:30 AM', title: 'Engineering Standup & Sprint', category: 'meeting', done: true },
          { id: 's3', time: '11:00 AM', title: 'Deep Work: Core Architecture', category: 'work', done: false },
          { id: 's4', time: '01:00 PM', title: 'Lunch & Fresh Air Break', category: 'health', done: false },
          { id: 's5', time: '02:30 PM', title: 'Client Milestone Walkthrough', category: 'meeting', done: false },
          { id: 's6', time: '04:30 PM', title: 'Code Review & QA Testing', category: 'work', done: false },
          { id: 's7', time: '06:30 PM', title: 'Evening Workout & Cardio', category: 'health', done: false }
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
          { id: 't1', text: 'Deploy thermal print build', done: false, priority: 'high' },
          { id: 't2', text: 'Sync calendar tasks with team', done: true, priority: 'medium' },
          { id: 't3', text: 'Drink 2.5L water throughout day', done: false, priority: 'medium' },
          { id: 't4', text: 'Inbox zero before logout', done: false, priority: 'low' }
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
        lines: 3
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
  }
];

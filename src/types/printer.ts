export type PaperWidth = '58mm' | '80mm';

export type DitherAlgorithm = 'floyd-steinberg' | 'atkinson' | 'bayer' | 'threshold';

export interface HeaderBlock {
  id: string;
  type: 'header';
  title: string;
  subtitle?: string;
  dateStr?: string;
  metaLeft?: string;
  metaRight?: string;
}

export interface TextBlock {
  id: string;
  type: 'text';
  text: string;
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  align: 'left' | 'center' | 'right';
  bold: boolean;
  inverted: boolean; // White text on black background
  monospace: boolean;
}

export interface ImageBlock {
  id: string;
  type: 'image';
  dataUrl: string; // Base64 or Object URL
  dither: DitherAlgorithm;
  threshold: number; // 0 - 255
  contrast: number; // 0.5 - 2.0
  brightness: number; // -100 - 100
  invert: boolean;
  caption?: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  category?: 'work' | 'personal' | 'meeting' | 'health' | 'urgent';
  done?: boolean;
}

export interface ScheduleBlock {
  id: string;
  type: 'schedule';
  title: string;
  date: string;
  quote?: string;
  items: ScheduleItem[];
}

export interface TaskItem {
  id: string;
  text: string;
  done: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export interface TaskListBlock {
  id: string;
  type: 'tasklist';
  title: string;
  items: TaskItem[];
}

export interface TableRow {
  col1: string;
  col2: string;
  col3: string;
}

export interface TableBlock {
  id: string;
  type: 'table';
  headers: [string, string, string];
  rows: TableRow[];
  totalLabel?: string;
  totalValue?: string;
}

export interface QrCodeBlock {
  id: string;
  type: 'qrcode';
  data: string;
  size: number;
  align: 'left' | 'center' | 'right';
  label?: string;
}

export interface DividerBlock {
  id: string;
  type: 'divider';
  style: 'dashed' | 'dotted' | 'solid' | 'double' | 'stars' | 'cut';
}

export interface FeedBlock {
  id: string;
  type: 'feed';
  lines: number;
}

export type ReceiptBlock =
  | HeaderBlock
  | TextBlock
  | ImageBlock
  | ScheduleBlock
  | TaskListBlock
  | TableBlock
  | QrCodeBlock
  | DividerBlock
  | FeedBlock;

export interface BluetoothConnectionState {
  isConnected: boolean;
  deviceName: string | null;
  status: 'idle' | 'connecting' | 'connected' | 'error' | 'printing';
  errorMessage: string | null;
  connectionType: 'web-bluetooth' | 'web-serial' | 'system' | null;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  tagline: string;
  category: 'calendar' | 'productivity' | 'pos' | 'personal' | 'creative';
  paperWidth: PaperWidth;
  blocks: ReceiptBlock[];
}

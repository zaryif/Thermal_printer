import { ScheduleItem } from '../types/printer';

/**
 * Parses raw iCalendar (.ics) content from Google Calendar
 */
export function parseICS(icsContent: string, targetDateStr?: string): ScheduleItem[] {
  const lines = icsContent.split(/\r\n|\n|\r/);
  const events: ScheduleItem[] = [];

  let inEvent = false;
  let summary = '';
  let dtStart = '';
  let dtEnd = '';
  let description = '';

  const today = targetDateStr ? new Date(targetDateStr) : new Date();
  const targetYear = today.getFullYear();
  const targetMonth = today.getMonth();
  const targetDay = today.getDate();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      summary = '';
      dtStart = '';
      dtEnd = '';
      description = '';
    } else if (line === 'END:VEVENT') {
      inEvent = false;
      if (summary) {
        // Parse time if available
        let timeStr = 'All Day';
        let matchDate = true;

        if (dtStart) {
          const parsed = parseICSTime(dtStart);
          if (parsed) {
            timeStr = formatTimeString(parsed);
            // Check if matches target date
            if (
              parsed.getFullYear() !== targetYear ||
              parsed.getMonth() !== targetMonth ||
              parsed.getDate() !== targetDay
            ) {
              matchDate = false;
            }
          }
        }

        // Categorize based on keywords in title
        const lower = summary.toLowerCase();
        let category: ScheduleItem['category'] = 'work';
        if (lower.includes('meet') || lower.includes('sync') || lower.includes('call') || lower.includes('zoom')) {
          category = 'meeting';
        } else if (lower.includes('gym') || lower.includes('doctor') || lower.includes('health') || lower.includes('walk')) {
          category = 'health';
        } else if (lower.includes('personal') || lower.includes('dinner') || lower.includes('lunch') || lower.includes('family')) {
          category = 'personal';
        } else if (lower.includes('urgent') || lower.includes('deadline') || lower.includes('asap')) {
          category = 'urgent';
        }

        // If filtering by date, only add matching, otherwise if no events matched today, include them
        events.push({
          id: 'ev_' + Math.random().toString(36).substring(2, 9),
          time: timeStr,
          title: summary,
          category,
          done: false
        });
      }
    } else if (inEvent) {
      if (line.startsWith('SUMMARY:')) {
        summary = line.replace('SUMMARY:', '').trim();
      } else if (line.startsWith('DTSTART')) {
        const parts = line.split(':');
        dtStart = parts[parts.length - 1];
      } else if (line.startsWith('DTEND')) {
        const parts = line.split(':');
        dtEnd = parts[parts.length - 1];
      } else if (line.startsWith('DESCRIPTION:')) {
        description = line.replace('DESCRIPTION:', '').trim();
      }
    }
  }

  // Sort events chronologically
  return events.sort((a, b) => {
    if (a.time === 'All Day') return -1;
    if (b.time === 'All Day') return 1;
    return a.time.localeCompare(b.time);
  });
}

function parseICSTime(dtString: string): Date | null {
  // e.g. 20261105T093000Z or 20261105T093000 or 20261105
  const clean = dtString.replace(/[^0-9T]/g, '');
  if (clean.length < 8) return null;

  const year = parseInt(clean.substring(0, 4), 10);
  const month = parseInt(clean.substring(4, 6), 10) - 1;
  const day = parseInt(clean.substring(6, 8), 10);

  let hours = 0;
  let minutes = 0;
  if (clean.includes('T')) {
    const timePart = clean.split('T')[1];
    if (timePart.length >= 4) {
      hours = parseInt(timePart.substring(0, 2), 10);
      minutes = parseInt(timePart.substring(2, 4), 10);
    }
  }

  return new Date(year, month, day, hours, minutes);
}

function formatTimeString(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const minStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minStr} ${ampm}`;
}

/**
 * Parses free-form text into schedule items
 * Example lines:
 * "09:00 AM - 10:00 AM Sprint Review"
 * "14:00 Team Sync"
 * "Pick up groceries"
 */
export function parsePlainTextAgenda(text: string): ScheduleItem[] {
  const lines = text.split('\n');
  const items: ScheduleItem[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Regex matching time patterns like "9:00 AM", "14:30", "09:00 - 10:00", etc.
    const timeMatch = line.match(/^(\d{1,2}(:\d{2})?\s*(AM|PM|am|pm)?(\s*-\s*\d{1,2}(:\d{2})?\s*(AM|PM|am|pm)?)?)\s*[:-]?\s*(.*)$/);

    if (timeMatch && timeMatch[1] && timeMatch[6]) {
      const time = timeMatch[1].trim();
      const title = timeMatch[6].trim();
      items.push({
        id: 'sch_' + Math.random().toString(36).substring(2, 9),
        time,
        title: title || 'Scheduled Event',
        category: 'work',
        done: false,
      });
    } else {
      items.push({
        id: 'sch_' + Math.random().toString(36).substring(2, 9),
        time: 'Flex',
        title: line.replace(/^[-*•]\s*/, ''),
        category: 'personal',
        done: false,
      });
    }
  }

  return items;
}


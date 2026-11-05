import { ScheduleItem } from '../types/printer';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

const STORAGE_KEY_CLIENT_ID = 'thermal_studio_google_client_id';
const STORAGE_KEY_TOKEN = 'thermal_studio_google_token';

export const getStoredGoogleClientId = (): string => {
  return (
    localStorage.getItem(STORAGE_KEY_CLIENT_ID) ||
    (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
    ''
  );
};

export const setStoredGoogleClientId = (clientId: string) => {
  localStorage.setItem(STORAGE_KEY_CLIENT_ID, clientId.trim());
};

export const getStoredGoogleToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEY_TOKEN);
};

export const clearGoogleSession = () => {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
};

export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
}

export const initGoogleSignIn = (
  clientId: string,
  onSuccess: (accessToken: string) => void,
  onError: (error: string) => void
) => {
  if (!window.google?.accounts?.oauth2) {
    onError('Google Identity Services script not yet loaded. Please check your internet connection.');
    return;
  }

  if (!clientId) {
    onError('Please provide a Google OAuth Client ID to connect directly to Google Calendar.');
    return;
  }

  try {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
      callback: (response) => {
        if (response.error) {
          onError(`Google Sign-In Error: ${response.error}`);
          return;
        }
        if (response.access_token) {
          localStorage.setItem(STORAGE_KEY_TOKEN, response.access_token);
          onSuccess(response.access_token);
        }
      }
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  } catch (err: any) {
    onError(err?.message || 'Failed to initialize Google Sign-In.');
  }
};

export const fetchGoogleCalendarEvents = async (
  accessToken: string,
  dateStr: string // 'YYYY-MM-DD'
): Promise<ScheduleItem[]> => {
  const startOfDay = new Date(`${dateStr}T00:00:00`);
  const endOfDay = new Date(`${dateStr}T23:59:59`);

  const timeMin = startOfDay.toISOString();
  const timeMax = endOfDay.toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    timeMin
  )}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearGoogleSession();
      throw new Error('Google authorization token expired. Please sign in again.');
    }
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to fetch events (${response.status})`);
  }

  const data = await response.json();
  const items: GoogleCalendarEvent[] = data.items || [];

  return items.map((ev, idx) => {
    let timeFormatted = 'All Day';
    if (ev.start?.dateTime) {
      const d = new Date(ev.start.dateTime);
      timeFormatted = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }

    const title = ev.summary || '(Untitled Event)';
    const lower = title.toLowerCase();

    let category: 'work' | 'personal' | 'meeting' | 'health' = 'personal';
    if (lower.includes('meet') || lower.includes('sync') || lower.includes('call') || lower.includes('zoom')) {
      category = 'meeting';
    } else if (lower.includes('exam') || lower.includes('study') || lower.includes('lab') || lower.includes('sprint') || lower.includes('code') || lower.includes('work')) {
      category = 'work';
    } else if (lower.includes('prayer') || lower.includes('fajr') || lower.includes('jummah') || lower.includes('asr') || lower.includes('maghrib') || lower.includes('isha')) {
      category = 'personal';
    } else if (lower.includes('workout') || lower.includes('gym') || lower.includes('walk') || lower.includes('health') || lower.includes('doctor')) {
      category = 'health';
    }

    return {
      id: ev.id || `g_${idx}_${Date.now()}`,
      time: timeFormatted,
      title: title,
      category,
      done: false
    };
  });
};


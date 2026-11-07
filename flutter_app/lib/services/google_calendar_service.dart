import 'package:flutter/widgets.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:googleapis/calendar/v3.dart' as calendar;
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/receipt_models.dart';

class _GoogleAuthClient extends http.BaseClient {
  final Map<String, String> _headers;
  final http.Client _client = http.Client();

  _GoogleAuthClient(this._headers);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) {
    request.headers.addAll(_headers);
    return _client.send(request);
  }
}

class CalendarFetchResult {
  final bool success;
  final List<ScheduleItem> items;
  final String? errorMessage;
  final String? accountEmail;
  final String source; // 'google_oauth' | 'ical_url' | 'plain_text'

  CalendarFetchResult({
    required this.success,
    required this.items,
    this.errorMessage,
    this.accountEmail,
    this.source = 'google_oauth',
  });
}

class IcsCalendarParser {
  /// Parses standard RFC 5545 iCalendar content (.ics)
  static List<ScheduleItem> parse(String icsContent, {DateTime? targetDate}) {
    final target = targetDate ?? DateTime.now();
    final targetYear = target.year;
    final targetMonth = target.month;
    final targetDay = target.day;

    // Unfold lines: RFC 5545 specifies lines starting with whitespace are continued
    final unfolded = icsContent.replaceAll(RegExp(r'\r\n[ \t]|\r[ \t]|\n[ \t]'), '');
    final lines = unfolded.split(RegExp(r'\r\n|\n|\r'));

    final List<Map<String, dynamic>> rawEvents = [];
    bool inEvent = false;
    String summary = '';
    String dtStart = '';
    String dtEnd = '';
    String description = '';

    for (var rawLine in lines) {
      final line = rawLine.trim();
      if (line.isEmpty) continue;

      if (line == 'BEGIN:VEVENT') {
        inEvent = true;
        summary = '';
        dtStart = '';
        dtEnd = '';
        description = '';
      } else if (line == 'END:VEVENT') {
        inEvent = false;
        if (summary.isNotEmpty && dtStart.isNotEmpty) {
          rawEvents.add({
            'summary': summary,
            'dtStart': dtStart,
            'dtEnd': dtEnd,
            'description': description,
          });
        }
      } else if (inEvent) {
        if (line.startsWith('SUMMARY')) {
          final idx = line.indexOf(':');
          if (idx != -1) {
            summary = unescapeIcs(line.substring(idx + 1).trim());
          }
        } else if (line.startsWith('DTSTART')) {
          final idx = line.indexOf(':');
          if (idx != -1) {
            dtStart = line.substring(idx + 1).trim();
          }
        } else if (line.startsWith('DTEND')) {
          final idx = line.indexOf(':');
          if (idx != -1) {
            dtEnd = line.substring(idx + 1).trim();
          }
        } else if (line.startsWith('DESCRIPTION')) {
          final idx = line.indexOf(':');
          if (idx != -1) {
            description = unescapeIcs(line.substring(idx + 1).trim());
          }
        }
      }
    }

    final List<ScheduleItem> todayItems = [];
    final List<ScheduleItem> upcomingItems = [];
    final timeFormatter = DateFormat('hh:mm a');

    for (var ev in rawEvents) {
      final dtStartStr = ev['dtStart'] as String;
      final parsedStart = parseIcsDateTime(dtStartStr);
      if (parsedStart == null) continue;

      final title = ev['summary'] as String;
      final isAllDay = dtStartStr.length <= 8 || !dtStartStr.contains('T');
      final localStart = parsedStart.toLocal();

      final timeStr = isAllDay ? 'ALL DAY' : timeFormatter.format(localStart);

      final matchesToday = localStart.year == targetYear &&
          localStart.month == targetMonth &&
          localStart.day == targetDay;

      final item = ScheduleItem(
        id: 'ics_${DateTime.now().microsecondsSinceEpoch}_${todayItems.length + upcomingItems.length}',
        time: timeStr,
        title: title,
        done: false,
      );

      if (matchesToday) {
        todayItems.add(item);
      } else if (localStart.isAfter(target)) {
        upcomingItems.add(item);
      }
    }

    // Sort today's items: ALL DAY first, then chronological
    todayItems.sort((a, b) {
      if (a.time == 'ALL DAY' && b.time != 'ALL DAY') return -1;
      if (b.time == 'ALL DAY' && a.time != 'ALL DAY') return 1;
      return a.time.compareTo(b.time);
    });

    if (todayItems.isNotEmpty) {
      return todayItems;
    }

    // Fallback: If no events today, take up to 6 upcoming events
    upcomingItems.sort((a, b) => a.time.compareTo(b.time));
    return upcomingItems.take(6).toList();
  }

  static String unescapeIcs(String text) {
    return text
        .replaceAll(r'\n', '\n')
        .replaceAll(r'\N', '\n')
        .replaceAll(r'\,', ',')
        .replaceAll(r'\;', ';')
        .replaceAll(r'\\', r'\');
  }

  static DateTime? parseIcsDateTime(String dtStr) {
    try {
      final clean = dtStr.replaceAll(RegExp(r'[^0-9TZ]'), '');
      if (clean.length < 8) return null;

      final year = int.parse(clean.substring(0, 4));
      final month = int.parse(clean.substring(4, 6));
      final day = int.parse(clean.substring(6, 8));

      if (!clean.contains('T')) {
        return DateTime(year, month, day);
      }

      final timePart = clean.split('T')[1];
      int hour = 0;
      int min = 0;
      int sec = 0;

      if (timePart.length >= 2) hour = int.parse(timePart.substring(0, 2));
      if (timePart.length >= 4) min = int.parse(timePart.substring(2, 4));
      if (timePart.length >= 6) sec = int.parse(timePart.substring(4, 6));

      if (clean.endsWith('Z')) {
        return DateTime.utc(year, month, day, hour, min, sec).toLocal();
      }

      return DateTime(year, month, day, hour, min, sec);
    } catch (_) {
      return null;
    }
  }
}

class GoogleCalendarService {
  static final GoogleCalendarService _instance = GoogleCalendarService._internal();
  factory GoogleCalendarService() => _instance;
  GoogleCalendarService._internal();

  static const String _keyIcsUrl = 'saved_calendar_ics_url';

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: <String>[
      calendar.CalendarApi.calendarReadonlyScope,
    ],
  );

  GoogleSignInAccount? _currentUser;
  GoogleSignInAccount? get currentUser => _currentUser;
  bool get isSignedIn => _currentUser != null;

  /// Silently check existing Google sign-in
  Future<GoogleSignInAccount?> checkSignInSilently() async {
    try {
      _currentUser = await _googleSignIn.signInSilently();
      return _currentUser;
    } catch (e) {
      debugPrint('Silent Google Sign-In check: $e');
      return null;
    }
  }

  /// Initiate native Google sign-in with Calendar scope verification
  Future<bool> signIn() async {
    try {
      final account = await _googleSignIn.signIn();
      _currentUser = account;
      if (account == null) return false;

      // Verify and request calendar readonly scope
      final hasScope = await _googleSignIn.canAccessScopes([calendar.CalendarApi.calendarReadonlyScope]);
      if (!hasScope) {
        final granted = await _googleSignIn.requestScopes([calendar.CalendarApi.calendarReadonlyScope]);
        if (!granted) {
          debugPrint('Calendar scope was not granted by user.');
        }
      }
      return true;
    } catch (e) {
      debugPrint('Google Sign-In Error: $e');
      return false;
    }
  }

  /// Sign out from Google
  Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
      _currentUser = null;
    } catch (e) {
      debugPrint('Google Sign-Out Error: $e');
    }
  }

  /// Fetch today's agenda from primary Google Calendar with full diagnostic result
  Future<CalendarFetchResult> fetchGoogleEventsDetailed({DateTime? targetDate}) async {
    if (_currentUser == null) {
      final ok = await signIn();
      if (!ok || _currentUser == null) {
        return CalendarFetchResult(
          success: false,
          items: [],
          errorMessage: 'Google Sign-In was cancelled or failed.',
          accountEmail: null,
          source: 'google_oauth',
        );
      }
    }

    try {
      // 1. Check scopes before calling API
      final hasScope = await _googleSignIn.canAccessScopes([calendar.CalendarApi.calendarReadonlyScope]);
      if (!hasScope) {
        final granted = await _googleSignIn.requestScopes([calendar.CalendarApi.calendarReadonlyScope]);
        if (!granted) {
          return CalendarFetchResult(
            success: false,
            items: [],
            errorMessage: 'Calendar permission denied. Please grant calendar access to sync events.',
            accountEmail: _currentUser?.email,
            source: 'google_oauth',
          );
        }
      }

      final authHeaders = await _currentUser!.authHeaders;
      if (authHeaders.isEmpty) {
        return CalendarFetchResult(
          success: false,
          items: [],
          errorMessage: 'Authentication headers are missing. Please sign out and sign in again.',
          accountEmail: _currentUser?.email,
          source: 'google_oauth',
        );
      }

      final authClient = _GoogleAuthClient(authHeaders);
      final calendarApi = calendar.CalendarApi(authClient);

      final target = targetDate ?? DateTime.now();
      final startOfDay = DateTime(target.year, target.month, target.day, 0, 0, 0);
      final endOfDay = DateTime(target.year, target.month, target.day, 23, 59, 59);

      // Widen search window (-12h to +24h UTC) to prevent timezone boundary clipping
      final events = await calendarApi.events.list(
        'primary',
        timeMin: startOfDay.subtract(const Duration(hours: 12)).toUtc(),
        timeMax: endOfDay.add(const Duration(hours: 24)).toUtc(),
        singleEvents: true,
        orderBy: 'startTime',
      );

      final rawList = events.items ?? [];
      final List<ScheduleItem> todayItems = [];
      final timeFormatter = DateFormat('hh:mm a');

      for (var item in rawList) {
        final summary = item.summary ?? 'Scheduled Event';
        String timeStr = 'ALL DAY';
        bool isTargetDay = false;

        if (item.start?.dateTime != null) {
          final local = item.start!.dateTime!.toLocal();
          if (local.year == target.year && local.month == target.month && local.day == target.day) {
            isTargetDay = true;
            timeStr = timeFormatter.format(local);
          }
        } else if (item.start?.date != null) {
          // All-day event: EventDateTime.date is already DateTime
          final eventDate = item.start!.date!;
          if (eventDate.year == target.year && eventDate.month == target.month && eventDate.day == target.day) {
            isTargetDay = true;
            timeStr = 'ALL DAY';
          }
        }

        if (isTargetDay) {
          todayItems.add(
            ScheduleItem(
              id: item.id ?? UniqueKey().toString(),
              time: timeStr,
              title: summary,
              done: false,
            ),
          );
        }
      }

      // If no events strictly on today, take upcoming items from the query window
      if (todayItems.isEmpty && rawList.isNotEmpty) {
        for (var item in rawList.take(6)) {
          final summary = item.summary ?? 'Upcoming Event';
          String timeStr = 'ALL DAY';
          if (item.start?.dateTime != null) {
            timeStr = timeFormatter.format(item.start!.dateTime!.toLocal());
          }
          todayItems.add(
            ScheduleItem(
              id: item.id ?? UniqueKey().toString(),
              time: timeStr,
              title: summary,
              done: false,
            ),
          );
        }
      }

      return CalendarFetchResult(
        success: true,
        items: todayItems,
        accountEmail: _currentUser?.email,
        errorMessage: todayItems.isEmpty ? 'No events found on Google Calendar for today.' : null,
        source: 'google_oauth',
      );
    } catch (e) {
      debugPrint('Google Calendar API Error: $e');
      String friendlyError = e.toString();
      if (friendlyError.contains('403') || friendlyError.contains('insufficient') || friendlyError.contains('PERMISSION_DENIED')) {
        friendlyError = 'Permission Denied (403): Google Calendar scopes not authorized or SHA-1 certificate fingerprint is unregistered in Google Cloud Console.\n\nTip: Use the "⚡ iCal Link" tab for 100% reliable zero-config sync!';
      } else if (friendlyError.contains('ApiException: 10') || friendlyError.contains('12500')) {
        friendlyError = 'Google Play Services configuration error (SHA-1 fingerprint missing in Google Cloud).\n\nTip: Use the "⚡ iCal Link" tab for instant sync without Google Cloud setup!';
      }

      return CalendarFetchResult(
        success: false,
        items: [],
        errorMessage: friendlyError,
        accountEmail: _currentUser?.email,
        source: 'google_oauth',
      );
    }
  }

  /// Backward-compatible fetch
  Future<List<ScheduleItem>> fetchTodayEvents() async {
    final res = await fetchGoogleEventsDetailed();
    return res.items;
  }

  /// Sanitize calendar URLs (e.g. webcal:// to https://)
  static String sanitizeIcsUrl(String url) {
    var trimmed = url.trim();
    if (trimmed.startsWith('webcal://')) {
      trimmed = 'https://${trimmed.substring(9)}';
    } else if (trimmed.startsWith('http://')) {
      trimmed = 'https://${trimmed.substring(7)}';
    }
    return trimmed;
  }

  /// Retrieve saved iCal URL from SharedPreferences
  Future<String?> getSavedIcsUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyIcsUrl);
  }

  /// Persist iCal URL to SharedPreferences
  Future<void> saveIcsUrl(String url) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyIcsUrl, sanitizeIcsUrl(url));
  }

  /// Fetch events from iCal URL (Google Calendar Secret Address, Outlook, Apple Calendar)
  Future<CalendarFetchResult> fetchEventsFromIcsUrl(String rawUrl, {DateTime? targetDate}) async {
    final url = sanitizeIcsUrl(rawUrl);
    if (!url.startsWith('https://')) {
      return CalendarFetchResult(
        success: false,
        items: [],
        errorMessage: 'Invalid calendar URL. Link must start with https:// or webcal://',
        source: 'ical_url',
      );
    }

    try {
      final response = await http.get(Uri.parse(url)).timeout(const Duration(seconds: 12));
      if (response.statusCode != 200) {
        return CalendarFetchResult(
          success: false,
          items: [],
          errorMessage: 'Server returned HTTP ${response.statusCode}. Please verify your secret iCal link.',
          source: 'ical_url',
        );
      }

      final body = response.body;
      if (!body.contains('BEGIN:VCALENDAR')) {
        return CalendarFetchResult(
          success: false,
          items: [],
          errorMessage: 'Downloaded file does not contain valid iCalendar data (missing BEGIN:VCALENDAR).',
          source: 'ical_url',
        );
      }

      final items = IcsCalendarParser.parse(body, targetDate: targetDate);

      // Save for seamless future syncs
      await saveIcsUrl(url);

      return CalendarFetchResult(
        success: true,
        items: items,
        source: 'ical_url',
        errorMessage: items.isEmpty ? 'No scheduled events found for today in this iCal feed.' : null,
      );
    } catch (e) {
      debugPrint('iCal Fetch Error: $e');
      return CalendarFetchResult(
        success: false,
        items: [],
        errorMessage: 'Network or parsing error: $e',
        source: 'ical_url',
      );
    }
  }

  /// Parse free-form plain-text agenda
  static List<ScheduleItem> parsePlainTextAgenda(String text) {
    final lines = text.split('\n');
    final List<ScheduleItem> items = [];

    final timeRegex = RegExp(r'^(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?(?:\s*-\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)?)\s*[:-]?\s*(.*)$');

    for (var rawLine in lines) {
      final line = rawLine.trim();
      if (line.isEmpty) continue;

      final match = timeRegex.firstMatch(line);
      if (match != null && match.group(1) != null && match.group(2) != null && match.group(2)!.isNotEmpty) {
        final time = match.group(1)!.trim();
        final title = match.group(2)!.trim();
        items.add(ScheduleItem(
          id: 'txt_${DateTime.now().microsecondsSinceEpoch}_${items.length}',
          time: time,
          title: title.isEmpty ? 'Scheduled Task' : title,
          done: false,
        ));
      } else {
        items.add(ScheduleItem(
          id: 'txt_${DateTime.now().microsecondsSinceEpoch}_${items.length}',
          time: 'FLEX',
          title: line.replaceFirst(RegExp(r'^[-*•]\s*'), ''),
          done: false,
        ));
      }
    }

    return items;
  }
}

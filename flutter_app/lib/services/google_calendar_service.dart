import 'package:flutter/widgets.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:googleapis/calendar/v3.dart' as calendar;
import 'package:http/http.dart' as http;
import '../models/receipt_models.dart';
import 'package:intl/intl.dart';

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

class GoogleCalendarService {
  static final GoogleCalendarService _instance = GoogleCalendarService._internal();
  factory GoogleCalendarService() => _instance;
  GoogleCalendarService._internal();

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: <String>[
      calendar.CalendarApi.calendarReadonlyScope,
    ],
  );

  GoogleSignInAccount? _currentUser;
  GoogleSignInAccount? get currentUser => _currentUser;
  bool get isSignedIn => _currentUser != null;

  /// Initiate native Google sign-in
  Future<bool> signIn() async {
    try {
      final account = await _googleSignIn.signIn();
      _currentUser = account;
      return account != null;
    } catch (e) {
      return false;
    }
  }

  /// Sign out
  Future<void> signOut() async {
    await _googleSignIn.signOut();
    _currentUser = null;
  }

  /// Fetch today's agenda from primary Google Calendar
  Future<List<ScheduleItem>> fetchTodayEvents() async {
    if (_currentUser == null) {
      final success = await signIn();
      if (!success) return [];
    }

    try {
      final authHeaders = await _currentUser!.authHeaders;
      final authClient = _GoogleAuthClient(authHeaders);

      final calendarApi = calendar.CalendarApi(authClient);

      final now = DateTime.now();
      final startOfDay = DateTime(now.year, now.month, now.day, 0, 0, 0);
      final endOfDay = DateTime(now.year, now.month, now.day, 23, 59, 59);

      final events = await calendarApi.events.list(
        'primary',
        timeMin: startOfDay.toUtc(),
        timeMax: endOfDay.toUtc(),
        singleEvents: true,
        orderBy: 'startTime',
      );

      final items = events.items ?? [];
      final List<ScheduleItem> scheduleItems = [];
      final timeFormatter = DateFormat('hh:mm a');

      for (var item in items) {
        final summary = item.summary ?? 'Meeting';
        String timeStr = 'ALL DAY';

        if (item.start?.dateTime != null) {
          timeStr = timeFormatter.format(item.start!.dateTime!.toLocal());
        }

        scheduleItems.add(
          ScheduleItem(
            id: item.id ?? UniqueKey().toString(),
            time: timeStr,
            title: summary,
            done: false,
          ),
        );
      }

      return scheduleItems;
    } catch (e) {
      return [];
    }
  }
}

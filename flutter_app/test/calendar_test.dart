import 'package:flutter_test/flutter_test.dart';
import 'package:thermal_studio/services/google_calendar_service.dart';

void main() {
  group('IcsCalendarParser Tests', () {
    test('Parses standard timed and all-day VEVENT blocks', () {
      final now = DateTime.now();
      final yearStr = now.year.toString().padLeft(4, '0');
      final monthStr = now.month.toString().padLeft(2, '0');
      final dayStr = now.day.toString().padLeft(2, '0');

      final sampleIcs = '''
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Google Inc//Google Calendar 70.9054//EN
BEGIN:VEVENT
DTSTART:$yearStr$monthStr${dayStr}T090000Z
DTEND:$yearStr$monthStr${dayStr}T100000Z
SUMMARY:Morning Dev Standup
DESCRIPTION:Daily engineering team sync
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:$yearStr$monthStr$dayStr
SUMMARY:Hardware Testing Day
END:VEVENT
END:VCALENDAR
''';

      final items = IcsCalendarParser.parse(sampleIcs, targetDate: now);
      expect(items.length, 2);

      // All day is sorted first
      expect(items[0].time, 'ALL DAY');
      expect(items[0].title, 'Hardware Testing Day');

      expect(items[1].title, 'Morning Dev Standup');
    });

    test('Parses plain text agenda', () {
      const text = '''
09:00 AM - Morning Standup
11:30 AM Dev Review
03:00 PM Hardware Print Run
''';

      final items = GoogleCalendarService.parsePlainTextAgenda(text);
      expect(items.length, 3);
      expect(items[0].time, '09:00 AM');
      expect(items[0].title, 'Morning Standup');
      expect(items[1].time, '11:30 AM');
      expect(items[1].title, 'Dev Review');
      expect(items[2].time, '03:00 PM');
      expect(items[2].title, 'Hardware Print Run');
    });

    test('Sanitizes webcal:// and http:// URLs', () {
      expect(
        GoogleCalendarService.sanitizeIcsUrl('webcal://calendar.google.com/ical/basic.ics'),
        'https://calendar.google.com/ical/basic.ics',
      );
      expect(
        GoogleCalendarService.sanitizeIcsUrl('http://calendar.google.com/ical/basic.ics'),
        'https://calendar.google.com/ical/basic.ics',
      );
    });
  });
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/receipt_models.dart';
import '../services/google_calendar_service.dart';
import '../animations/app_motion.dart';

class CalendarSyncDialog extends StatefulWidget {
  final Function(List<ScheduleItem>, String source) onImportEvents;

  const CalendarSyncDialog({
    super.key,
    required this.onImportEvents,
  });

  @override
  State<CalendarSyncDialog> createState() => _CalendarSyncDialogState();
}

class _CalendarSyncDialogState extends State<CalendarSyncDialog> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final GoogleCalendarService _calendarService = GoogleCalendarService();
  final TextEditingController _icsUrlController = TextEditingController();
  final TextEditingController _pasteController = TextEditingController();

  bool _isLoading = false;
  String? _statusMessage;
  bool _isError = false;
  bool _showInstructions = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadSavedIcsUrl();
    _checkGoogleSignInStatus();
  }

  Future<void> _loadSavedIcsUrl() async {
    final saved = await _calendarService.getSavedIcsUrl();
    if (saved != null && saved.isNotEmpty) {
      if (mounted) {
        setState(() {
          _icsUrlController.text = saved;
        });
      }
    }
  }

  Future<void> _checkGoogleSignInStatus() async {
    await _calendarService.checkSignInSilently();
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _tabController.dispose();
    _icsUrlController.dispose();
    _pasteController.dispose();
    super.dispose();
  }

  Future<void> _handlePasteClipboard() async {
    final data = await Clipboard.getData(Clipboard.kTextPlain);
    if (data?.text != null && data!.text!.isNotEmpty) {
      setState(() {
        _icsUrlController.text = data.text!.trim();
      });
    }
  }

  Future<void> _syncIcs() async {
    final url = _icsUrlController.text.trim();
    if (url.isEmpty) {
      setState(() {
        _statusMessage = 'Please enter or paste your secret iCal link.';
        _isError = true;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _statusMessage = 'Fetching calendar feed...';
      _isError = false;
    });

    final result = await _calendarService.fetchEventsFromIcsUrl(url);

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    if (result.success && result.items.isNotEmpty) {
      widget.onImportEvents(result.items, 'iCal Link');
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Successfully imported ${result.items.length} calendar events!'),
          backgroundColor: Colors.green,
        ),
      );
    } else if (result.success && result.items.isEmpty) {
      setState(() {
        _statusMessage = 'Connected! No events found for today on this calendar.';
        _isError = false;
      });
    } else {
      setState(() {
        _statusMessage = result.errorMessage ?? 'Failed to fetch calendar events.';
        _isError = true;
      });
    }
  }

  Future<void> _signInWithGoogle() async {
    setState(() {
      _isLoading = true;
      _statusMessage = 'Signing in to Google...';
      _isError = false;
    });

    final ok = await _calendarService.signIn();
    if (!mounted) return;

    if (!ok) {
      setState(() {
        _isLoading = false;
        _statusMessage = 'Google Sign-In was cancelled or failed.\nTip: Use the "⚡ iCal Link" tab for 100% reliable zero-config sync!';
        _isError = true;
      });
      return;
    }

    await _fetchGoogleEvents();
  }

  Future<void> _fetchGoogleEvents() async {
    setState(() {
      _isLoading = true;
      _statusMessage = 'Fetching events from Google Calendar...';
      _isError = false;
    });

    final result = await _calendarService.fetchGoogleEventsDetailed();

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    if (result.success && result.items.isNotEmpty) {
      widget.onImportEvents(result.items, 'Google Calendar');
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Imported ${result.items.length} Google Calendar events!'),
          backgroundColor: Colors.green,
        ),
      );
    } else if (result.success && result.items.isEmpty) {
      setState(() {
        _statusMessage = 'Google account connected! No events found for today.';
        _isError = false;
      });
    } else {
      setState(() {
        _statusMessage = result.errorMessage ?? 'Failed to fetch Google Calendar events.';
        _isError = true;
      });
    }
  }

  Future<void> _signOutGoogle() async {
    await _calendarService.signOut();
    if (mounted) {
      setState(() {
        _statusMessage = 'Signed out from Google.';
        _isError = false;
      });
    }
  }

  void _handleQuickPaste() {
    final text = _pasteController.text.trim();
    if (text.isEmpty) {
      setState(() {
        _statusMessage = 'Please enter or paste schedule lines.';
        _isError = true;
      });
      return;
    }

    final items = GoogleCalendarService.parsePlainTextAgenda(text);
    if (items.isNotEmpty) {
      widget.onImportEvents(items, 'Quick Paste');
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Added ${items.length} schedule items!'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF121214),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFF27272A), width: 1.5),
      ),
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 440, maxHeight: 600),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.lightBlueAccent.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.lightBlueAccent.withValues(alpha: 0.3)),
                    ),
                    child: const Icon(Icons.calendar_month, color: Colors.lightBlueAccent, size: 20),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'CALENDAR SYNC',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.1,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          'Import your agenda to thermal receipt',
                          style: TextStyle(fontSize: 11, color: Colors.white54),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white54, size: 20),
                    onPressed: () => Navigator.of(context).pop(),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Tab Selector
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF27272A)),
                ),
                child: TabBar(
                  controller: _tabController,
                  indicatorSize: TabBarIndicatorSize.tab,
                  indicator: BoxDecoration(
                    color: const Color(0xFF27272A),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  labelColor: Colors.white,
                  unselectedLabelColor: Colors.white54,
                  labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                  tabs: const [
                    Tab(text: '⚡ iCal Link'),
                    Tab(text: '🌐 Google'),
                    Tab(text: '📝 Paste'),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Tab Contents
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    // Tab 0: iCal Secret Link (Recommended)
                    _buildIcalTab(),

                    // Tab 1: Google Sign-In
                    _buildGoogleTab(),

                    // Tab 2: Quick Text Paste
                    _buildQuickPasteTab(),
                  ],
                ),
              ),

              // Status / Diagnostic Banner
              if (_statusMessage != null) ...[
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: _isError
                        ? const Color(0xFFEF4444).withValues(alpha: 0.12)
                        : Colors.blueAccent.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: _isError
                          ? const Color(0xFFEF4444).withValues(alpha: 0.4)
                          : Colors.blueAccent.withValues(alpha: 0.4),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _isError ? Icons.error_outline : Icons.info_outline,
                        color: _isError ? const Color(0xFFEF4444) : Colors.lightBlueAccent,
                        size: 16,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _statusMessage!,
                          style: TextStyle(
                            fontSize: 11,
                            color: _isError ? const Color(0xFFFCA5A5) : Colors.white70,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIcalTab() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Text(
                'GOOGLE CALENDAR iCAL LINK',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.lightBlueAccent, letterSpacing: 0.8),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.greenAccent.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text(
                  '100% RELIABLE',
                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.greenAccent),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            'Paste your secret iCal link from Google Calendar, Apple Calendar, or Outlook to sync without OAuth.',
            style: TextStyle(fontSize: 11, color: Colors.white60),
          ),
          const SizedBox(height: 10),

          // iCal URL TextField
          TextField(
            controller: _icsUrlController,
            style: const TextStyle(fontSize: 12, color: Colors.white, fontFamily: 'monospace'),
            decoration: InputDecoration(
              hintText: 'https://calendar.google.com/calendar/ical/.../basic.ics',
              hintStyle: const TextStyle(fontSize: 11, color: Colors.white30),
              filled: true,
              fillColor: const Color(0xFF18181B),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Color(0xFF27272A)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Color(0xFF27272A)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Colors.lightBlueAccent),
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              suffixIcon: IconButton(
                icon: const Icon(Icons.paste_rounded, color: Colors.white70, size: 18),
                tooltip: 'Paste from clipboard',
                onPressed: _handlePasteClipboard,
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Sync Action Button
          TactilePressWidget(
            onTap: _isLoading ? () {} : _syncIcs,
            child: Container(
              height: 42,
              decoration: BoxDecoration(
                color: Colors.lightBlueAccent,
                borderRadius: BorderRadius.circular(8),
              ),
              alignment: Alignment.center,
              child: _isLoading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black87),
                    )
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.sync_rounded, color: Colors.black87, size: 18),
                        SizedBox(width: 8),
                        Text(
                          'SYNC CALENDAR NOW',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ],
                    ),
            ),
          ),
          const SizedBox(height: 12),

          // Instructions Accordion
          GestureDetector(
            onTap: () => setState(() => _showInstructions = !_showInstructions),
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF18181B),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFF27272A)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.help_outline_rounded, size: 14, color: Colors.white70),
                      const SizedBox(width: 6),
                      const Text(
                        'How to copy your secret Google iCal link',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white70),
                      ),
                      const Spacer(),
                      Icon(
                        _showInstructions ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                        color: Colors.white54,
                        size: 16,
                      ),
                    ],
                  ),
                  if (_showInstructions) ...[
                    const Divider(color: Color(0xFF27272A), height: 16),
                    const Text(
                      '1. Open calendar.google.com on your phone or computer browser.\n'
                      '2. Click Settings ⚙ (top right) -> "Settings for my calendars" -> Tap your calendar name.\n'
                      '3. Scroll down to "Integrate calendar".\n'
                      '4. Copy the "Secret address in iCal format".\n'
                      '5. Paste it above and tap SYNC. Once saved, it syncs daily with 1 tap!',
                      style: TextStyle(fontSize: 11, color: Colors.white60, height: 1.45),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGoogleTab() {
    final isSignedIn = _calendarService.isSignedIn;
    final email = _calendarService.currentUser?.email;

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'DIRECT GOOGLE SIGN-IN (OAUTH)',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.lightBlueAccent, letterSpacing: 0.8),
          ),
          const SizedBox(height: 6),
          const Text(
            'Sign in natively with your Google Account to import events from your primary calendar.',
            style: TextStyle(fontSize: 11, color: Colors.white60),
          ),
          const SizedBox(height: 14),

          // Account Status Card
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF18181B),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: isSignedIn ? Colors.greenAccent.withValues(alpha: 0.4) : const Color(0xFF27272A),
              ),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: isSignedIn ? Colors.greenAccent.withValues(alpha: 0.2) : const Color(0xFF27272A),
                  radius: 18,
                  child: Icon(
                    isSignedIn ? Icons.check_circle : Icons.account_circle,
                    color: isSignedIn ? Colors.greenAccent : Colors.white54,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isSignedIn ? 'Signed In' : 'Not Connected',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isSignedIn ? Colors.greenAccent : Colors.white70,
                        ),
                      ),
                      Text(
                        isSignedIn ? (email ?? 'Google Account') : 'Sign in to fetch Google Calendar',
                        style: const TextStyle(fontSize: 11, color: Colors.white54),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                if (isSignedIn)
                  TextButton(
                    onPressed: _signOutGoogle,
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      visualDensity: VisualDensity.compact,
                    ),
                    child: const Text('Sign Out', style: TextStyle(color: Colors.redAccent, fontSize: 11)),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Action Buttons
          if (!isSignedIn)
            TactilePressWidget(
              onTap: _isLoading ? () {} : _signInWithGoogle,
              child: Container(
                height: 42,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                ),
                alignment: Alignment.center,
                child: _isLoading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black87),
                      )
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.g_mobiledata, color: Colors.black87, size: 24),
                          SizedBox(width: 6),
                          Text(
                            'SIGN IN WITH GOOGLE',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ],
                      ),
              ),
            )
          else
            TactilePressWidget(
              onTap: _isLoading ? () {} : _fetchGoogleEvents,
              child: Container(
                height: 42,
                decoration: BoxDecoration(
                  color: Colors.lightBlueAccent,
                  borderRadius: BorderRadius.circular(8),
                ),
                alignment: Alignment.center,
                child: _isLoading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black87),
                      )
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.refresh_rounded, color: Colors.black87, size: 18),
                          SizedBox(width: 8),
                          Text(
                            'FETCH TODAY\'S EVENTS',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          const SizedBox(height: 12),

          // Diagnostic Note
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF18181B),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFF27272A)),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.info_outline, size: 14, color: Colors.white54),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Direct Google OAuth requires SHA-1 certificate registration in Google Cloud Console. If sign-in shows permission denied or fails to fetch events, use the "⚡ iCal Link" tab which works 100% reliably with zero configuration.',
                    style: TextStyle(fontSize: 10, color: Colors.white54, height: 1.4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickPasteTab() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'QUICK PASTE AGENDA',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.lightBlueAccent, letterSpacing: 0.8),
          ),
          const SizedBox(height: 6),
          const Text(
            'Paste your daily schedule or timetable from text, notes, or email.',
            style: TextStyle(fontSize: 11, color: Colors.white60),
          ),
          const SizedBox(height: 10),

          // Paste TextField
          TextField(
            controller: _pasteController,
            maxLines: 5,
            style: const TextStyle(fontSize: 12, color: Colors.white),
            decoration: InputDecoration(
              hintText: '09:00 AM Morning Standup\n11:30 AM Dev Sprint\n02:00 PM Hardware Testing\n05:00 PM Review',
              hintStyle: const TextStyle(fontSize: 11, color: Colors.white30),
              filled: true,
              fillColor: const Color(0xFF18181B),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Color(0xFF27272A)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Color(0xFF27272A)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Colors.lightBlueAccent),
              ),
              contentPadding: const EdgeInsets.all(12),
            ),
          ),
          const SizedBox(height: 12),

          TactilePressWidget(
            onTap: _handleQuickPaste,
            child: Container(
              height: 42,
              decoration: BoxDecoration(
                color: Colors.lightBlueAccent,
                borderRadius: BorderRadius.circular(8),
              ),
              alignment: Alignment.center,
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.playlist_add_rounded, color: Colors.black87, size: 18),
                  SizedBox(width: 8),
                  Text(
                    'PARSE & INSERT SCHEDULE',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

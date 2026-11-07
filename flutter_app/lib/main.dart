import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image/image.dart' as img;
import 'models/receipt_models.dart';
import 'services/bluetooth_service.dart';
import 'services/rasterizer_service.dart';
import 'ui/navbar.dart';
import 'ui/minimal_command_bar.dart';
import 'ui/receipt_canvas.dart';
import 'ui/ble_scanner_dialog.dart';
import 'ui/calendar_sync_dialog.dart';
import 'animations/app_motion.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ThermalStudioApp());
}

class ThermalStudioApp extends StatelessWidget {
  const ThermalStudioApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Thermal Printer OS',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF050505), // OLED black
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFF59E0B), // Warm amber
          surface: Color(0xFF18181B),
        ),
      ),
      home: const ThermalStudioScreen(),
    );
  }
}

class ThermalStudioScreen extends StatefulWidget {
  const ThermalStudioScreen({super.key});

  @override
  State<ThermalStudioScreen> createState() => _ThermalStudioScreenState();
}

class _ThermalStudioScreenState extends State<ThermalStudioScreen> {
  final GlobalKey _receiptKey = GlobalKey();
  final ThermalBleService _bleService = ThermalBleService();
  final ImagePicker _picker = ImagePicker();

  PaperWidth _paperWidth = PaperWidth.mm58;
  ReceiptFontFamily _fontFamily = ReceiptFontFamily.mono;
  String? _selectedBlockId;
  bool _isPrinting = false;
  double _printProgress = 0.0;

  final List<ReceiptBlock> _blocks = [];

  @override
  void initState() {
    super.initState();
    _loadDefaultTemplate();

    _bleService.progressStream.listen((progress) {
      if (mounted) {
        setState(() {
          _printProgress = progress;
        });
      }
    });

    _bleService.statusStream.listen((status) {
      if (mounted) {
        setState(() {});
      }
    });
  }

  void _loadDefaultTemplate() {
    _blocks.clear();
    _blocks.addAll([
      HeaderBlock(
        id: 'hdr_1',
        title: 'THERMAL PRINTER OS',
        subtitle: 'DAILY AGENDA & FOCUS',
        dateStr: DateTime.now().toString().split(' ')[0],
        metaLeft: 'MD. ZARIF AZFAR',
        metaRight: 'STATUS: ACTIVE',
      ),
      GapBlock(id: 'gap_1', height: 12),
      QuoteBlock(
        id: 'qt_1',
        quote: 'The obstacle in the path becomes the path. Within every obstacle is an opportunity.',
        author: 'Marcus Aurelius',
        category: 'Discipline',
      ),
      GapBlock(id: 'gap_2', height: 12),
      ScheduleBlock(
        id: 'sch_1',
        title: 'DAILY SCHEDULE',
        date: DateTime.now().toString().split(' ')[0],
        items: [
          ScheduleItem(id: 's1', time: '09:00 AM', title: 'Morning Focus & Planning'),
          ScheduleItem(id: 's2', time: '11:30 AM', title: 'System Architecture & Dev'),
          ScheduleItem(id: 's3', time: '03:00 PM', title: 'Hardware Verification & Print'),
        ],
      ),
      GapBlock(id: 'gap_3', height: 12),
      TodoListBlock(
        id: 'td_1',
        title: 'ACTION CHECKLIST',
        items: [
          TodoItem(id: 't1', text: 'Verify thermal print head saturation', isHighPriority: true),
          TodoItem(id: 't2', text: 'Calibrate Bluetooth LE pacing (50ms)'),
        ],
      ),
      GapBlock(id: 'gap_4', height: 16),
      DividerBlock(id: 'div_1', style: 'cut'),
      FeedBlock(id: 'fd_1', lines: 3),
    ]);
  }

  void _loadTemplate(String templateName) {
    setState(() {
      _blocks.clear();
      _selectedBlockId = null;
      final today = DateTime.now().toString().split(' ')[0];

      switch (templateName) {
        case 'blank':
          // Clean empty paper roll
          break;

        case 'expense':
          _blocks.addAll([
            HeaderBlock(
              id: 'hdr_exp',
              title: 'EXPENSE RECEIPT',
              subtitle: 'DAILY FINANCIAL LOG',
              dateStr: today,
              metaLeft: 'MD. ZARIF AZFAR',
              metaRight: 'STATUS: PAID',
            ),
            GapBlock(id: 'gap_e1', height: 12),
            ExpenseBlock(
              id: 'exp_1',
              title: 'PURCHASE ITEMIZED LOG',
              currency: '\$',
              date: today,
              paymentMethod: 'CASH / CARD',
              items: [
                ExpenseItem(id: 'e1', name: 'Morning Espresso & Croissant', category: 'Food', amount: 5.25),
                ExpenseItem(id: 'e2', name: 'Metro Commute Transit', category: 'Travel', amount: 2.75),
                ExpenseItem(id: 'e3', name: 'Cloud Server & Domain Sync', category: 'Tech', amount: 14.50),
                ExpenseItem(id: 'e4', name: 'Thermal Paper Roll Pack (6x)', category: 'Office', amount: 8.90),
              ],
              tax: 2.50,
            ),
            GapBlock(id: 'gap_e2', height: 12),
            TextBlock(
              id: 'txt_sign',
              text: 'Verified & Logged by MD. ZARIF AZFAR.\nKeep receipt for monthly accounts.',
              fontSize: 10,
              align: TextAlign.center,
            ),
            GapBlock(id: 'gap_e3', height: 12),
            DividerBlock(id: 'div_e', style: 'cut'),
            FeedBlock(id: 'fd_e', lines: 3),
          ]);
          break;

        case 'notes':
          _blocks.addAll([
            HeaderBlock(
              id: 'hdr_not',
              title: 'QUICK NOTES & MEMO',
              subtitle: 'BRAIN DUMP & IDEAS',
              dateStr: today,
              metaLeft: 'AUTHOR: MD. ZARIF AZFAR',
              metaRight: 'CONFIDENTIAL',
            ),
            GapBlock(id: 'gap_n1', height: 12),
            TextBlock(
              id: 'txt_n1',
              text: '1. Verified Tiny Print 0x51 0x78 BLE framing.\n2. Calibrated 50ms chunk delay prevents FIFO overflow.\n3. Floyd-Steinberg error diffusion renders crisp photos.',
              fontSize: 11,
            ),
            GapBlock(id: 'gap_n2', height: 12),
            QuoteBlock(
              id: 'qt_n',
              quote: 'Simplicity is prerequisite for reliability.',
              author: 'Edsger W. Dijkstra',
              category: 'Engineering',
            ),
            GapBlock(id: 'gap_n3', height: 14),
            DividerBlock(id: 'div_n', style: 'cut'),
            FeedBlock(id: 'fd_n', lines: 3),
          ]);
          break;

        case 'todo':
          _blocks.addAll([
            HeaderBlock(
              id: 'hdr_td',
              title: 'PRIORITY CHECKLIST',
              subtitle: 'ACTION ITEMS & EXECUTION',
              dateStr: today,
              metaLeft: 'MD. ZARIF AZFAR',
              metaRight: 'PRIORITY: HIGH',
            ),
            GapBlock(id: 'gap_t1', height: 12),
            TodoListBlock(
              id: 'td_main',
              title: 'HIGH IMPACT TASKS',
              items: [
                TodoItem(id: 't1', text: 'Thermal print head saturation test', isHighPriority: true),
                TodoItem(id: 't2', text: 'Bluetooth Low Energy scanning and auto-reconnect', isHighPriority: true),
                TodoItem(id: 't3', text: 'Review Data Comm lab report submissions'),
                TodoItem(id: 't4', text: 'Deploy release to GitHub'),
              ],
            ),
            GapBlock(id: 'gap_t2', height: 14),
            DividerBlock(id: 'div_t', style: 'cut'),
            FeedBlock(id: 'fd_t', lines: 3),
          ]);
          break;

        case 'important':
          _blocks.addAll([
            HeaderBlock(
              id: 'hdr_imp',
              title: 'SYSTEM MEMORANDUM',
              subtitle: 'OFFICIAL NOTIFICATION',
              dateStr: today,
              metaLeft: 'MD. ZARIF AZFAR',
              metaRight: 'LEVEL 1 ALERT',
            ),
            GapBlock(id: 'gap_i1', height: 12),
            ImportantBlock(
              id: 'imp_1',
              tag: 'CRITICAL / URGENT',
              title: 'LABORATORY SUBMISSION CUTOFF',
              content: 'All Data Communication engineering laboratory reports (DC_Z_LT01 through LT04) must be bundled with 100% rubrics before the midnight deadline.',
              footer: 'VERIFIED & SIGNED BY MD. ZARIF AZFAR',
            ),
            GapBlock(id: 'gap_i2', height: 12),
            QrCodeBlock(
              id: 'qr_imp',
              data: 'https://github.com/zaryif/Thermal_printer',
              label: 'SCAN FOR SYSTEM REPO',
            ),
            GapBlock(id: 'gap_i3', height: 12),
            DividerBlock(id: 'div_imp', style: 'cut'),
            FeedBlock(id: 'fd_imp', lines: 3),
          ]);
          break;

        case 'agenda':
        default:
          _loadDefaultTemplate();
          break;
      }
    });
  }

  Future<void> _handlePickImage(ImageBlock block) async {
    try {
      final XFile? file = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1024,
      );
      if (file == null) return;

      final rawBytes = await file.readAsBytes();
      final decoded = img.decodeImage(rawBytes);
      if (decoded == null) return;

      // Scale to target printer dot width (384 for 58mm, 576 for 80mm)
      final targetWidth = _paperWidth.dots;
      final scaled = img.copyResize(decoded, width: targetWidth);

      // Grayscale & high contrast adjustment
      final grayscale = img.grayscale(scaled);
      img.adjustColor(grayscale, contrast: 1.3);

      final pngBytes = Uint8List.fromList(img.encodePng(grayscale));

      setState(() {
        block.imageBytes = pngBytes;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error uploading image: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  void _handleAddBlock(String type) {
    final String newId = 'blk_${DateTime.now().millisecondsSinceEpoch}';
    ReceiptBlock newBlock;

    switch (type) {
      case 'expense':
        newBlock = ExpenseBlock(
          id: newId,
          title: 'EXPENSE ITEMIZATION',
          date: DateTime.now().toString().split(' ')[0],
          items: [
            ExpenseItem(id: 'e_${DateTime.now().millisecondsSinceEpoch}', name: 'Expense Item', category: 'General', amount: 5.00),
          ],
        );
        break;
      case 'important':
        newBlock = ImportantBlock(
          id: newId,
          tag: 'CRITICAL NOTICE',
          title: 'IMPORTANT MEMO',
          content: 'Tap to type critical instructions or high-priority notes here.',
          footer: 'VERIFIED BY MD. ZARIF AZFAR',
        );
        break;
      case 'photo':
        newBlock = ImageBlock(
          id: newId,
          caption: 'Thermal Snapshot',
        );
        _handlePickImage(newBlock as ImageBlock);
        break;
      case 'quote':
        final next = (ReceiptCanvas.curatedQuotes.toList()..shuffle()).first;
        newBlock = QuoteBlock(
          id: newId,
          quote: next['quote']!,
          author: next['author']!,
          category: next['category']!,
        );
        break;
      case 'gap':
        newBlock = GapBlock(id: newId, height: 16);
        break;
      case 'schedule':
        newBlock = ScheduleBlock(
          id: newId,
          title: 'AGENDA TIMETABLE',
          date: DateTime.now().toString().split(' ')[0],
          items: [
            ScheduleItem(id: 's_${DateTime.now().millisecondsSinceEpoch}', time: '10:00 AM', title: 'Session A'),
            ScheduleItem(id: 's_${DateTime.now().millisecondsSinceEpoch + 1}', time: '02:00 PM', title: 'Session B'),
          ],
        );
        break;
      case 'tasklist':
        newBlock = TodoListBlock(
          id: newId,
          title: 'TODO LIST',
          items: [
            TodoItem(id: 't_${DateTime.now().millisecondsSinceEpoch}', text: 'Priority task'),
          ],
        );
        break;
      case 'text':
        newBlock = TextBlock(
          id: newId,
          text: 'Tap here to write your note, thought, or reminder.',
        );
        break;
      case 'header':
        newBlock = HeaderBlock(
          id: newId,
          title: 'CUSTOM TITLE',
          subtitle: 'SUBTITLE NOTE',
          dateStr: DateTime.now().toString().split(' ')[0],
        );
        break;
      case 'table':
        newBlock = TableBlock(
          id: newId,
          headers: ['ITEM', 'QTY', 'PRICE'],
          rows: [
            ['Thermal Roll', '1', '\$4.50'],
            ['Printer Adapter', '1', '\$12.00'],
          ],
          totalLabel: 'TOTAL',
          totalValue: '\$16.50',
        );
        break;
      case 'qrcode':
        newBlock = QrCodeBlock(
          id: newId,
          data: 'https://github.com/zaryif/Thermal_printer',
          label: 'SCAN FOR INFO',
        );
        break;
      case 'divider':
        newBlock = DividerBlock(id: newId, style: 'cut');
        break;
      case 'feed':
      default:
        newBlock = FeedBlock(id: newId, lines: 3);
        break;
    }

    setState(() {
      _blocks.add(newBlock);
      _selectedBlockId = newId;
    });
  }

  void _handleMoveBlock(String id, String direction) {
    setState(() {
      final index = _blocks.indexWhere((b) => b.id == id);
      if (index < 0) return;
      final targetIndex = direction == 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= _blocks.length) return;

      final block = _blocks.removeAt(index);
      _blocks.insert(targetIndex, block);
    });
  }

  void _handleDeleteBlock(String id) {
    setState(() {
      _blocks.removeWhere((b) => b.id == id);
      if (_selectedBlockId == id) _selectedBlockId = null;
    });
  }

  Future<void> _handleSyncGoogleCalendar() async {
    showDialog(
      context: context,
      builder: (_) => CalendarSyncDialog(
        onImportEvents: (events, source) {
          setState(() {
            _blocks.removeWhere((b) => b is ScheduleBlock);
            int insertIndex = _blocks.indexWhere((b) => b is HeaderBlock);
            if (insertIndex != -1) {
              insertIndex = insertIndex + 1;
              if (insertIndex < _blocks.length && _blocks[insertIndex] is GapBlock) {
                insertIndex = insertIndex + 1;
              }
            } else {
              insertIndex = 0;
            }

            _blocks.insert(
              insertIndex,
              ScheduleBlock(
                id: 'cal_${DateTime.now().millisecondsSinceEpoch}',
                title: source == 'Google Calendar'
                    ? 'GOOGLE CALENDAR AGENDA'
                    : (source == 'iCal Link' ? 'CALENDAR AGENDA' : 'DAILY SCHEDULE'),
                date: DateTime.now().toString().split(' ')[0],
                items: events,
              ),
            );
          });
        },
      ),
    );
  }

  Future<void> _handlePrint() async {
    // 1. Hide on-screen keyboard & blinking cursors
    FocusScope.of(context).unfocus();
    await Future.delayed(const Duration(milliseconds: 150));

    // 2. If printer not connected, open BLE scanner immediately
    if (!_bleService.isConnected) {
      if (mounted) {
        showDialog(
          context: context,
          builder: (_) => const BleScannerDialog(),
        );
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please pair your thermal printer first'),
            backgroundColor: Color(0xFFF59E0B),
          ),
        );
      }
      return;
    }

    setState(() {
      _isPrinting = true;
      _printProgress = 0.0;
    });

    try {
      // 3. Capture live WYSIWYG paper to monochrome thermal raster dots
      final raster = await RasterizerService.captureReceiptToMono(
        _receiptKey,
        _paperWidth.dots,
      );

      // 4. Stream raster bitstream with 50ms pacing
      final success = await _bleService.printMonoRaster(
        raster.monoBytes,
        raster.widthDots,
        raster.heightDots,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(success ? 'Print sent successfully!' : 'Printing failed'),
            backgroundColor: success ? Colors.green : Colors.red,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isPrinting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Shortcuts(
      shortcuts: <ShortcutActivator, Intent>{
        LogicalKeySet(LogicalKeyboardKey.meta, LogicalKeyboardKey.keyP): const _PrintIntent(),
        LogicalKeySet(LogicalKeyboardKey.control, LogicalKeyboardKey.keyP): const _PrintIntent(),
        LogicalKeySet(LogicalKeyboardKey.meta, LogicalKeyboardKey.keyN): const _NewIntent(),
        LogicalKeySet(LogicalKeyboardKey.control, LogicalKeyboardKey.keyN): const _NewIntent(),
      },
      child: Actions(
        actions: <Type, Action<Intent>>{
          _PrintIntent: CallbackAction<_PrintIntent>(onInvoke: (_) => _handlePrint()),
          _NewIntent: CallbackAction<_NewIntent>(onInvoke: (_) => setState(_loadDefaultTemplate)),
        },
        child: Scaffold(
          body: SafeArea(
            child: Column(
              children: [
                // Top Header Bar
                Navbar(
                  paperWidth: _paperWidth,
                  onPaperWidthChange: (w) => setState(() => _paperWidth = w),
                  fontFamily: _fontFamily,
                  onFontFamilyChange: (f) => setState(() => _fontFamily = f),
                  bleService: _bleService,
                  onOpenBleDialog: () {
                    showDialog(
                      context: context,
                      builder: (_) => const BleScannerDialog(),
                    );
                  },
                  onOpenCalendar: _handleSyncGoogleCalendar,
                  onSelectTemplate: _loadTemplate,
                  onStartBlank: () => _loadTemplate('blank'),
                ),

                // Tactile Template Block Drops
                MinimalCommandBar(onAddBlock: _handleAddBlock),

                // Live WYSIWYG Receipt Paper Canvas
                Expanded(
                  child: Stack(
                    children: [
                      ReceiptCanvas(
                        receiptKey: _receiptKey,
                        blocks: _blocks,
                        paperWidth: _paperWidth,
                        fontFamily: _fontFamily,
                        selectedBlockId: _selectedBlockId,
                        onSelectBlock: (id) => setState(() => _selectedBlockId = id),
                        onUpdateBlock: (b) => setState(() {}),
                        onMoveBlock: _handleMoveBlock,
                        onDeleteBlock: _handleDeleteBlock,
                        onPickImage: _handlePickImage,
                        onAddEventToSchedule: () {},
                        onAddTaskToTodo: () {},
                      ),

                      // Streaming progress overlay
                      if (_isPrinting)
                        Container(
                          color: Colors.black.withValues(alpha: 0.75),
                          child: Center(
                            child: Container(
                              width: 280,
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                color: const Color(0xFF18181B),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFF27272A)),
                              ),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.print, size: 36, color: Color(0xFFF59E0B)),
                                  const SizedBox(height: 12),
                                  const Text(
                                    'Printing to Thermal Head...',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                  ),
                                  const SizedBox(height: 16),
                                  LinearProgressIndicator(
                                    value: _printProgress,
                                    color: const Color(0xFFF59E0B),
                                    backgroundColor: const Color(0xFF27272A),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    '${(_printProgress * 100).toInt()}%',
                                    style: const TextStyle(fontSize: 12, color: Color(0xFFF59E0B)),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),

                // Sticky Bottom Action Dock: ALWAYS VISIBLE PRINT BUTTON & STATUS
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: const BoxDecoration(
                    color: Color(0xFF09090B),
                    border: Border(top: BorderSide(color: Color(0xFF27272A))),
                  ),
                  child: Row(
                    children: [
                      // Bluetooth Status Indicator
                      InkWell(
                        onTap: () {
                          showDialog(
                            context: context,
                            builder: (_) => const BleScannerDialog(),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                          decoration: BoxDecoration(
                            color: const Color(0xFF18181B),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: _bleService.isConnected
                                  ? Colors.greenAccent.withValues(alpha: 0.6)
                                  : const Color(0xFF27272A),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                _bleService.isConnected ? Icons.bluetooth_connected : Icons.bluetooth,
                                size: 18,
                                color: _bleService.isConnected ? Colors.greenAccent : Colors.white54,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                _bleService.isConnected ? 'ONLINE' : 'OFFLINE',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: _bleService.isConnected ? Colors.greenAccent : Colors.white54,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(width: 10),

                      // PROMINENT MASTER PRINT BUTTON
                      Expanded(
                        child: TactilePressWidget(
                          onTap: _isPrinting ? () {} : _handlePrint,
                          child: Container(
                            height: 48,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
                              ),
                              borderRadius: BorderRadius.circular(10),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFFF59E0B).withValues(alpha: 0.3),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                if (_isPrinting)
                                  const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF09090B)),
                                    ),
                                  )
                                else
                                  const Icon(Icons.print, color: Color(0xFF09090B), size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  _isPrinting
                                      ? 'PRINTING (${(_printProgress * 100).toInt()}%)...'
                                      : 'PRINT RECEIPT',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF09090B),
                                    letterSpacing: 1.0,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _PrintIntent extends Intent {
  const _PrintIntent();
}

class _NewIntent extends Intent {
  const _NewIntent();
}

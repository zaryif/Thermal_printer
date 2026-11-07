import 'package:flutter/material.dart';
import '../models/receipt_models.dart';
import '../services/bluetooth_service.dart';
import '../animations/app_motion.dart';

class Navbar extends StatelessWidget {
  final PaperWidth paperWidth;
  final Function(PaperWidth) onPaperWidthChange;
  final ReceiptFontFamily fontFamily;
  final Function(ReceiptFontFamily) onFontFamilyChange;
  final ThermalBleService bleService;
  final VoidCallback onOpenBleDialog;
  final VoidCallback onOpenCalendar;
  final Function(String) onSelectTemplate;
  final VoidCallback onStartBlank;

  const Navbar({
    super.key,
    required this.paperWidth,
    required this.onPaperWidthChange,
    required this.fontFamily,
    required this.onFontFamilyChange,
    required this.bleService,
    required this.onOpenBleDialog,
    required this.onOpenCalendar,
    required this.onSelectTemplate,
    required this.onStartBlank,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF09090B),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFF27272A))),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Row 1: Branding & Quick Action Pills
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Branding
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: const Color(0xFF18181B),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFF27272A)),
                    ),
                    child: const Icon(Icons.print, size: 16, color: Color(0xFFF59E0B)),
                  ),
                  const SizedBox(width: 8),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: [
                          Text(
                            'THERMAL PRINTER',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              letterSpacing: 0.5,
                            ),
                          ),
                          SizedBox(width: 4),
                          Text(
                            'OS',
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFFF59E0B),
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'Direct Hardware Bitstream',
                        style: TextStyle(fontSize: 9, color: Colors.white38),
                      ),
                    ],
                  ),
                ],
              ),

              // Action Pills (BLE + Calendar + Blank)
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Start From Blank Quick Button
                  TactilePressWidget(
                    onTap: onStartBlank,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF18181B),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFF27272A)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.note_add_outlined, size: 13, color: Colors.white70),
                          SizedBox(width: 4),
                          Text(
                            'Blank',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.white70),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),

                  // Google Calendar Sync
                  TactilePressWidget(
                    onTap: onOpenCalendar,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF18181B),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFF27272A)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.calendar_month, size: 13, color: Colors.lightBlueAccent),
                          SizedBox(width: 4),
                          Text(
                            'Sync',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.white70),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),

                  // Bluetooth Pair / Status Pill
                  TactilePressWidget(
                    onTap: onOpenBleDialog,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF18181B),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: bleService.isConnected
                              ? Colors.greenAccent.withValues(alpha: 0.6)
                              : const Color(0xFFF59E0B).withValues(alpha: 0.6),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            bleService.isConnected ? Icons.bluetooth_connected : Icons.bluetooth,
                            size: 13,
                            color: bleService.isConnected ? Colors.greenAccent : const Color(0xFFF59E0B),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            bleService.isConnected
                                ? (bleService.deviceName ?? 'Ready')
                                : 'Connect',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: bleService.isConnected ? Colors.greenAccent : const Color(0xFFF59E0B),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 6),

          // Row 2: Paper Size Toggle, Template Selector & Font Picker
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Paper Width Toggle
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF27272A)),
                ),
                padding: const EdgeInsets.all(2),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildSegmentButton(
                      label: '58mm',
                      isSelected: paperWidth == PaperWidth.mm58,
                      onTap: () => onPaperWidthChange(PaperWidth.mm58),
                    ),
                    _buildSegmentButton(
                      label: '80mm',
                      isSelected: paperWidth == PaperWidth.mm80,
                      onTap: () => onPaperWidthChange(PaperWidth.mm80),
                    ),
                  ],
                ),
              ),

              // Templates Selector Dropdown
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF27272A)),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 1),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: null,
                    hint: const Text('Templates ▾', style: TextStyle(fontSize: 11, color: Color(0xFFF59E0B), fontWeight: FontWeight.bold)),
                    isDense: true,
                    dropdownColor: const Color(0xFF18181B),
                    icon: const Icon(Icons.arrow_drop_down, color: Color(0xFFF59E0B), size: 16),
                    onChanged: (val) {
                      if (val != null) onSelectTemplate(val);
                    },
                    items: const [
                      DropdownMenuItem(value: 'blank', child: Text('📄 Start from Blank')),
                      DropdownMenuItem(value: 'agenda', child: Text('📅 Daily Focus & Agenda')),
                      DropdownMenuItem(value: 'expense', child: Text('💰 Daily Expenses & Bill')),
                      DropdownMenuItem(value: 'notes', child: Text('📝 Quick Notes & Memo')),
                      DropdownMenuItem(value: 'todo', child: Text('✅ Priority Checklist')),
                      DropdownMenuItem(value: 'important', child: Text('⚠️ Important Notice')),
                    ],
                  ),
                ),
              ),

              // Font Selector Dropdown
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF27272A)),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 1),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<ReceiptFontFamily>(
                    value: fontFamily,
                    isDense: true,
                    dropdownColor: const Color(0xFF18181B),
                    icon: const Icon(Icons.arrow_drop_down, color: Color(0xFFF59E0B), size: 16),
                    style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w600),
                    onChanged: (val) {
                      if (val != null) onFontFamilyChange(val);
                    },
                    items: const [
                      DropdownMenuItem(value: ReceiptFontFamily.mono, child: Text('Mono (POS)')),
                      DropdownMenuItem(value: ReceiptFontFamily.sans, child: Text('Clean (Sans)')),
                      DropdownMenuItem(value: ReceiptFontFamily.serif, child: Text('Editorial (Serif)')),
                      DropdownMenuItem(value: ReceiptFontFamily.terminal, child: Text('Retro (Arcade)')),
                      DropdownMenuItem(value: ReceiptFontFamily.typewriter, child: Text('Typewriter')),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSegmentButton({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return TactilePressWidget(
      onTap: onTap,
      child: AnimatedContainer(
        duration: AppMotion.quickFeedback,
        curve: AppMotion.enterCurve,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF59E0B) : Colors.transparent,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: isSelected ? const Color(0xFF09090B) : Colors.white60,
          ),
        ),
      ),
    );
  }
}

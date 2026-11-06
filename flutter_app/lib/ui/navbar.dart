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
  final VoidCallback onPrint;
  final bool isPrinting;

  const Navbar({
    super.key,
    required this.paperWidth,
    required this.onPaperWidthChange,
    required this.fontFamily,
    required this.onFontFamilyChange,
    required this.bleService,
    required this.onOpenBleDialog,
    required this.onOpenCalendar,
    required this.onPrint,
    required this.isPrinting,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF09090B),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFF27272A))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Branding
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF27272A)),
                ),
                child: const Icon(Icons.print, size: 18, color: Color(0xFFF59E0B)),
              ),
              const SizedBox(width: 8),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Text(
                        'THERMAL STUDIO',
                        style: TextStyle(
                          fontSize: 13,
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
                    'Direct WYSIWYG Typewriter',
                    style: TextStyle(fontSize: 10, color: Colors.white38),
                  ),
                ],
              ),
            ],
          ),

          // Central Controls: Paper Size & Font Picker
          Row(
            children: [
              // Paper Width Segmented Button
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF27272A)),
                ),
                padding: const EdgeInsets.all(2),
                child: Row(
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
              const SizedBox(width: 8),

              // Font Selector Dropdown
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF27272A)),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<ReceiptFontFamily>(
                    value: fontFamily,
                    dropdownColor: const Color(0xFF18181B),
                    icon: const Icon(Icons.arrow_drop_down, color: Color(0xFFF59E0B), size: 18),
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

          // Action Buttons: Calendar, BLE, In-Place Print Confirm
          Row(
            children: [
              // Google Calendar Button
              TactilePressWidget(
                onTap: onOpenCalendar,
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF18181B),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF27272A)),
                  ),
                  child: const Icon(Icons.calendar_today, size: 16, color: Colors.lightBlueAccent),
                ),
              ),
              const SizedBox(width: 6),

              // Bluetooth Status / Pair Button
              TactilePressWidget(
                onTap: onOpenBleDialog,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF18181B),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: bleService.isConnected
                          ? Colors.greenAccent.withValues(alpha: 0.4)
                          : const Color(0xFF27272A),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        bleService.isConnected ? Icons.bluetooth_connected : Icons.bluetooth,
                        size: 15,
                        color: bleService.isConnected ? Colors.greenAccent : const Color(0xFFF59E0B),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        bleService.isConnected
                            ? (bleService.deviceName ?? 'Connected')
                            : 'Pair Printer',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: bleService.isConnected ? Colors.greenAccent : Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // Master Print Action with In-Place State Confirmation
              InPlaceConfirmButton(
                label: 'Print',
                loadingLabel: 'Printing...',
                icon: Icons.print,
                isLoading: isPrinting,
                onTap: onPrint,
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
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isSelected ? const Color(0xFF09090B) : Colors.white60,
          ),
        ),
      ),
    );
  }
}

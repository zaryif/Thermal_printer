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
  final bool isPreviewMode;
  final VoidCallback onTogglePreview;
  final VoidCallback onOpenSettings;

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
    required this.isPreviewMode,
    required this.onTogglePreview,
    required this.onOpenSettings,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: const BoxDecoration(
        color: Color(0xFF09090B),
        border: Border(bottom: BorderSide(color: Color(0xFF27272A))),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Row 1: Brand Typography (Clean, No Icon) & Connectivity / Action Buttons
          Row(
            children: [
              // Clean Brand Text
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'Thermi',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(width: 5),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(3),
                            border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.4)),
                          ),
                          child: const Text(
                            'OS',
                            style: TextStyle(
                              fontSize: 7.5,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFFF59E0B),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Text(
                      'Your Thermal Printer Solution',
                      style: TextStyle(
                        fontSize: 8.5,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFFA1A1AA),
                        letterSpacing: -0.1,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 4),

              // Preview Toggle Pill
              TactilePressWidget(
                onTap: onTogglePreview,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                  decoration: BoxDecoration(
                    color: isPreviewMode
                        ? const Color(0xFFF59E0B).withValues(alpha: 0.18)
                        : const Color(0xFF18181B),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: isPreviewMode
                          ? const Color(0xFFF59E0B)
                          : const Color(0xFF27272A),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isPreviewMode ? Icons.edit_note_rounded : Icons.visibility_outlined,
                        size: 13,
                        color: isPreviewMode ? const Color(0xFFF59E0B) : Colors.white70,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        isPreviewMode ? 'Edit' : 'Preview',
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                          color: isPreviewMode ? const Color(0xFFF59E0B) : Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(width: 4),

              // Calendar Sync Pill
              TactilePressWidget(
                onTap: onOpenCalendar,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF18181B),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: Colors.lightBlueAccent.withValues(alpha: 0.4)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.calendar_month_rounded, size: 12, color: Colors.lightBlueAccent),
                      SizedBox(width: 3),
                      Text(
                        'Sync',
                        style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.lightBlueAccent),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(width: 4),

              // Bluetooth Pair / Status Pill
              TactilePressWidget(
                onTap: onOpenBleDialog,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
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
                        bleService.isConnected ? Icons.bluetooth_connected_rounded : Icons.bluetooth_rounded,
                        size: 12,
                        color: bleService.isConnected ? Colors.greenAccent : const Color(0xFFF59E0B),
                      ),
                      const SizedBox(width: 3),
                      ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 55),
                        child: Text(
                          bleService.isConnected
                              ? (bleService.deviceName ?? 'Ready')
                              : 'Pair',
                          style: TextStyle(
                            fontSize: 9.5,
                            fontWeight: FontWeight.bold,
                            color: bleService.isConnected ? Colors.greenAccent : const Color(0xFFF59E0B),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(width: 4),

              // Settings Icon Button
              TactilePressWidget(
                onTap: onOpenSettings,
                child: Container(
                  padding: const EdgeInsets.all(5),
                  decoration: BoxDecoration(
                    color: const Color(0xFF18181B),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF27272A)),
                  ),
                  child: const Icon(Icons.settings_outlined, size: 13, color: Colors.white70),
                ),
              ),
            ],
          ),

          const SizedBox(height: 6),

          // Row 2: Page Setup Controls - 100% Responsive, Zero-Scroll
          Row(
            children: [
              // 1. Templates Dropdown Menu
              Expanded(
                flex: 12,
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF18181B),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF27272A)),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: null,
                      isExpanded: true,
                      hint: const Row(
                        children: [
                          Icon(Icons.auto_awesome_mosaic_outlined, size: 11, color: Color(0xFFF59E0B)),
                          SizedBox(width: 3),
                          Expanded(
                            child: Text(
                              'Templates',
                              style: TextStyle(fontSize: 9.5, color: Color(0xFFF59E0B), fontWeight: FontWeight.bold),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      isDense: true,
                      dropdownColor: const Color(0xFF18181B),
                      icon: const Icon(Icons.arrow_drop_down, color: Color(0xFFF59E0B), size: 14),
                      onChanged: (val) {
                        if (val != null) onSelectTemplate(val);
                      },
                      items: const [
                        DropdownMenuItem(value: 'agenda', child: Text('Executive Agenda', style: TextStyle(fontSize: 11))),
                        DropdownMenuItem(value: 'todo', child: Text('Project Checklist', style: TextStyle(fontSize: 11))),
                        DropdownMenuItem(value: 'notes', child: Text('Executive Memo', style: TextStyle(fontSize: 11))),
                        DropdownMenuItem(value: 'expense', child: Text('Financial Ledger', style: TextStyle(fontSize: 11))),
                        DropdownMenuItem(value: 'important', child: Text('Urgent Directive', style: TextStyle(fontSize: 11))),
                        DropdownMenuItem(value: 'blank', child: Text('Blank Document', style: TextStyle(fontSize: 11))),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(width: 4),

              // 2. Paper Width Segmented Toggle (58mm / 80mm)
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

              const SizedBox(width: 4),

              // 3. Font Family Selector
              Expanded(
                flex: 10,
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF18181B),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF27272A)),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<ReceiptFontFamily>(
                      value: fontFamily,
                      isExpanded: true,
                      isDense: true,
                      dropdownColor: const Color(0xFF18181B),
                      icon: const Icon(Icons.arrow_drop_down, color: Colors.white70, size: 14),
                      style: const TextStyle(fontSize: 9.5, color: Colors.white, fontWeight: FontWeight.bold),
                      onChanged: (val) {
                        if (val != null) onFontFamilyChange(val);
                      },
                      items: const [
                        DropdownMenuItem(value: ReceiptFontFamily.mono, child: Text('Mono', style: TextStyle(fontSize: 10))),
                        DropdownMenuItem(value: ReceiptFontFamily.sans, child: Text('Sans', style: TextStyle(fontSize: 10))),
                        DropdownMenuItem(value: ReceiptFontFamily.serif, child: Text('Serif', style: TextStyle(fontSize: 10))),
                        DropdownMenuItem(value: ReceiptFontFamily.typewriter, child: Text('Type', style: TextStyle(fontSize: 10))),
                        DropdownMenuItem(value: ReceiptFontFamily.terminal, child: Text('Retro', style: TextStyle(fontSize: 10))),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(width: 4),

              // 4. Quick Blank Button
              TactilePressWidget(
                onTap: onStartBlank,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFF18181B),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF27272A)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.add, size: 11, color: Colors.white70),
                      SizedBox(width: 2),
                      Text(
                        'New',
                        style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.white70),
                      ),
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
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF59E0B) : Colors.transparent,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.bold,
            color: isSelected ? const Color(0xFF09090B) : Colors.white60,
          ),
        ),
      ),
    );
  }
}

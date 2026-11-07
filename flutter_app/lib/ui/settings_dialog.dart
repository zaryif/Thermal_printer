import 'package:flutter/material.dart';
import '../models/receipt_models.dart';

class SettingsDialog extends StatelessWidget {
  final PaperWidth paperWidth;
  final Function(PaperWidth) onPaperWidthChange;
  final ReceiptFontFamily fontFamily;
  final Function(ReceiptFontFamily) onFontFamilyChange;
  final VoidCallback onReplayOnboarding;

  const SettingsDialog({
    super.key,
    required this.paperWidth,
    required this.onPaperWidthChange,
    required this.fontFamily,
    required this.onFontFamilyChange,
    required this.onReplayOnboarding,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF121215),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFF27272A)),
      ),
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 440, maxHeight: 600),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 18, 12, 14),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Settings & System',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 0.2,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Thermi - Your Thermal Printer OS',
                        style: TextStyle(
                          fontSize: 11,
                          color: Color(0xFFA1A1AA),
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: Colors.white70, size: 20),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: Color(0xFF27272A)),

            // Content List
            Flexible(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                children: [
                  // Section: Hardware & Calibration
                  _buildSectionHeader('HARDWARE & PRINT CALIBRATION'),
                  const SizedBox(height: 8),

                  _buildSettingCard(
                    title: 'Paper Roll Width',
                    subtitle: 'Select thermal paper width standard',
                    trailing: SegmentedButton<PaperWidth>(
                      segments: const [
                        ButtonSegment(value: PaperWidth.mm58, label: Text('58mm', style: TextStyle(fontSize: 11))),
                        ButtonSegment(value: PaperWidth.mm80, label: Text('80mm', style: TextStyle(fontSize: 11))),
                      ],
                      selected: {paperWidth},
                      onSelectionChanged: (set) {
                        if (set.isNotEmpty) onPaperWidthChange(set.first);
                      },
                      style: ButtonStyle(
                        visualDensity: VisualDensity.compact,
                        backgroundColor: WidgetStateProperty.resolveWith((states) {
                          if (states.contains(WidgetState.selected)) {
                            return const Color(0xFFF59E0B);
                          }
                          return const Color(0xFF18181B);
                        }),
                        foregroundColor: WidgetStateProperty.resolveWith((states) {
                          if (states.contains(WidgetState.selected)) {
                            return const Color(0xFF09090B);
                          }
                          return Colors.white70;
                        }),
                      ),
                    ),
                  ),

                  const SizedBox(height: 10),

                  _buildSettingCard(
                    title: 'Binarization Threshold',
                    subtitle: 'Calibrated 138 with 1.15 contrast ratio',
                    trailing: const Text(
                      'High Density',
                      style: TextStyle(fontSize: 11, color: Color(0xFF10B981), fontWeight: FontWeight.bold),
                    ),
                  ),

                  const SizedBox(height: 10),

                  _buildSettingCard(
                    title: 'BLE Packet Streaming',
                    subtitle: '177 bytes / 50ms pacing (FIFO protected)',
                    trailing: const Text(
                      'Paced',
                      style: TextStyle(fontSize: 11, color: Color(0xFF38BDF8), fontWeight: FontWeight.bold),
                    ),
                  ),

                  const SizedBox(height: 18),

                  // Section: Typography & App
                  _buildSectionHeader('TYPOGRAPHY & DISPLAY'),
                  const SizedBox(height: 8),

                  _buildSettingCard(
                    title: 'Default Font Family',
                    subtitle: 'Thermal head rendering style',
                    trailing: DropdownButton<ReceiptFontFamily>(
                      value: fontFamily,
                      dropdownColor: const Color(0xFF18181B),
                      underline: const SizedBox(),
                      style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold),
                      onChanged: (val) {
                        if (val != null) onFontFamilyChange(val);
                      },
                      items: const [
                        DropdownMenuItem(value: ReceiptFontFamily.mono, child: Text('Mono POS')),
                        DropdownMenuItem(value: ReceiptFontFamily.sans, child: Text('Clean Sans')),
                        DropdownMenuItem(value: ReceiptFontFamily.serif, child: Text('Editorial Serif')),
                        DropdownMenuItem(value: ReceiptFontFamily.typewriter, child: Text('Typewriter')),
                        DropdownMenuItem(value: ReceiptFontFamily.terminal, child: Text('Retro Arcade')),
                      ],
                    ),
                  ),

                  const SizedBox(height: 10),

                  _buildSettingCard(
                    title: 'Welcome Walkthrough',
                    subtitle: 'Replay the first-time setup guide',
                    trailing: TextButton(
                      onPressed: () {
                        Navigator.of(context).pop();
                        onReplayOnboarding();
                      },
                      style: TextButton.styleFrom(
                        visualDensity: VisualDensity.compact,
                        foregroundColor: const Color(0xFFF59E0B),
                      ),
                      child: const Text('Replay', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ),

                  const SizedBox(height: 18),

                  // Section: About Developer & System
                  _buildSectionHeader('ABOUT DEVELOPER & SYSTEM'),
                  const SizedBox(height: 8),

                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF18181B),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF27272A)),
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Thermi',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                                letterSpacing: 0.5,
                              ),
                            ),
                            Text(
                              'v1.3.0',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFF59E0B),
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Your Thermal Printer Solution',
                          style: TextStyle(fontSize: 11, color: Color(0xFFA1A1AA)),
                        ),
                        SizedBox(height: 12),
                        Divider(height: 1, color: Color(0xFF27272A)),
                        SizedBox(height: 10),
                        Row(
                          children: [
                            Text(
                              'Lead Developer: ',
                              style: TextStyle(fontSize: 11, color: Color(0xFFA1A1AA)),
                            ),
                            Text(
                              'MD. ZARIF AZFAR',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 6),
                        Row(
                          children: [
                            Text(
                              'Architecture: ',
                              style: TextStyle(fontSize: 11, color: Color(0xFFA1A1AA)),
                            ),
                            Text(
                              'Pure Flutter & Tiny Print Protocol',
                              style: TextStyle(fontSize: 11, color: Colors.white70),
                            ),
                          ],
                        ),
                        SizedBox(height: 6),
                        Row(
                          children: [
                            Text(
                              'Supported Hardware: ',
                              style: TextStyle(fontSize: 11, color: Color(0xFFA1A1AA)),
                            ),
                            Expanded(
                              child: Text(
                                'Tiny Print, Cat, PeriPage, ESC/POS 58/80mm',
                                style: TextStyle(fontSize: 11, color: Colors.white70),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.w800,
        color: Color(0xFF71717A),
        letterSpacing: 0.8,
      ),
    );
  }

  Widget _buildSettingCard({
    required String title,
    required String subtitle,
    required Widget trailing,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 10,
                    color: Color(0xFFA1A1AA),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          trailing,
        ],
      ),
    );
  }
}

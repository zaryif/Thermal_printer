import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import '../services/bluetooth_service.dart';

class BleScannerDialog extends StatefulWidget {
  const BleScannerDialog({super.key});

  @override
  State<BleScannerDialog> createState() => _BleScannerDialogState();
}

class _BleScannerDialogState extends State<BleScannerDialog> {
  final ThermalBleService _bleService = ThermalBleService();
  List<ScanResult> _devices = [];

  @override
  void initState() {
    super.initState();
    _bleService.devicesStream.listen((results) {
      if (mounted) {
        setState(() {
          _devices = results;
        });
      }
    });
    _bleService.startScan();
  }

  @override
  void dispose() {
    _bleService.stopScan();
    super.dispose();
  }

  void _showCompatibilityList(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF18181B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFF27272A)),
        ),
        title: const Row(
          children: [
            Icon(Icons.checklist_rtl_rounded, color: Color(0xFFF59E0B), size: 20),
            SizedBox(width: 8),
            Text(
              'Supported Printers & POS',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ],
        ),
        content: SizedBox(
          width: 360,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildCategory('Pocket & Mini Thermal (Tiny Print Protocol)', [
                  '• Tiny Print / Fun Print / iPrint / LuckJingle',
                  '• PeriPage: A6, A9, A9 Pro, A40, A40+',
                  '• Paperang: P1, P1S, P2, P2S, P3',
                  '• Cat Printers: C9, C13, C15, C17, C19, C20',
                  '• WalkPrint & MX Series: MX05, MX06, MX08, MX10',
                  '• Phomemo: M02, M02 Pro, T02, D30, M110',
                  '• Mini Pocket Series: GB01, GB02, GT01, X5, X6, A8, A31',
                ]),
                const SizedBox(height: 12),
                _buildCategory('Commercial POS & Receipt Printers (ESC/POS)', [
                  '• Standard ESC/POS 58mm & 80mm Bluetooth Printers',
                  '• MUNBYN Bluetooth Thermal (ITPP047, IMP001, etc.)',
                  '• GOOJPRT: PT-210, MPT-II, JP-58H, MPT-III',
                  '• Zjiang: ZJ-5802, ZJ-5805, ZJ-8250',
                  '• Netum & Rongta Mobile Bluetooth Terminals',
                  '• Sunmi POS Terminals: V1, V2, V2 Pro (BLE/SPP)',
                  '• Star Micronics & Epson (Bluetooth mobile models)',
                ]),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF27272A),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.info_outline, size: 16, color: Color(0xFFF59E0B)),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Turn printer ON and bring it within 5 meters. No PIN code required for BLE pairing.',
                          style: TextStyle(fontSize: 11, color: Colors.white70),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Close', style: TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildCategory(String title, List<String> models) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFF59E0B)),
        ),
        const SizedBox(height: 4),
        ...models.map((m) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 1.5),
              child: Text(m, style: const TextStyle(fontSize: 11, color: Colors.white70)),
            )),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF18181B),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFF27272A)),
      ),
      child: Container(
        width: 380,
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.bluetooth_searching, color: Color(0xFFF59E0B), size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Pair Thermal Printer',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white54, size: 18),
                  onPressed: () => Navigator.of(context).pop(),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
            const SizedBox(height: 6),
            const Text(
              'Scanning for X5, X6, Cat, WalkPrint, PeriPage, ESC/POS...',
              style: TextStyle(fontSize: 11, color: Colors.white60),
            ),
            const SizedBox(height: 16),
            ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 280),
              child: _devices.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 36),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFF59E0B)),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Scanning for nearby BLE devices...',
                              style: TextStyle(fontSize: 12, color: Colors.grey.shade400),
                            ),
                          ],
                        ),
                      ),
                    )
                  : ListView.separated(
                      shrinkWrap: true,
                      itemCount: _devices.length,
                      separatorBuilder: (_, _) => const Divider(color: Color(0xFF27272A), height: 1),
                      itemBuilder: (context, index) {
                        final res = _devices[index];
                        final name = res.device.platformName.isNotEmpty
                            ? res.device.platformName
                            : res.advertisementData.advName;
                        final isKnownThermal = name.toUpperCase().contains('X5') ||
                            name.toUpperCase().contains('X6') ||
                            name.toUpperCase().contains('CAT') ||
                            name.toUpperCase().contains('PRINT') ||
                            name.toUpperCase().contains('PERIPAGE') ||
                            name.toUpperCase().contains('PAPERANG') ||
                            name.toUpperCase().contains('POS') ||
                            name.toUpperCase().contains('MX');

                        return ListTile(
                          dense: true,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          leading: Icon(
                            Icons.print,
                            color: isKnownThermal ? const Color(0xFFF59E0B) : Colors.white38,
                            size: 20,
                          ),
                          title: Text(
                            name.isNotEmpty ? name : 'Unknown Device',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isKnownThermal ? FontWeight.bold : FontWeight.normal,
                              color: isKnownThermal ? Colors.white : Colors.white70,
                            ),
                          ),
                          subtitle: Text(
                            res.device.remoteId.str,
                            style: TextStyle(fontSize: 10, color: Colors.grey.shade500),
                          ),
                          trailing: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFF59E0B),
                              foregroundColor: const Color(0xFF09090B),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              minimumSize: const Size(60, 28),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                            ),
                            onPressed: () async {
                              final nav = Navigator.of(context);
                              await _bleService.connect(res.device);
                              nav.pop();
                            },
                            child: const Text('Pair', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                        );
                      },
                    ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _bleService.startScan(),
                    icon: const Icon(Icons.refresh, size: 14, color: Colors.white70),
                    label: const Text('Refresh Scan', style: TextStyle(fontSize: 11, color: Colors.white70)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFF27272A)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                OutlinedButton.icon(
                  onPressed: () => _showCompatibilityList(context),
                  icon: const Icon(Icons.help_outline, size: 14, color: Color(0xFFF59E0B)),
                  label: const Text('Supported Printers', style: TextStyle(fontSize: 11, color: Color(0xFFF59E0B))),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFF59E0B)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

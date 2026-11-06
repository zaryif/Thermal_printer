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
              'Looking for X5, X6, Cat, WalkPrint or ESC/POS devices...',
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
                            name.toUpperCase().contains('PRINT');

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
            OutlinedButton.icon(
              onPressed: () => _bleService.startScan(),
              icon: const Icon(Icons.refresh, size: 14, color: Colors.white70),
              label: const Text('Refresh Scan', style: TextStyle(fontSize: 12, color: Colors.white70)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF27272A)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

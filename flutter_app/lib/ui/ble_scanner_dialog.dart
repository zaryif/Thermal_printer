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
  List<ScanResult> _scanResults = [];
  List<BluetoothDevice> _bondedDevices = [];
  String? _connectingDeviceId;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadBondedDevices();
    _bleService.devicesStream.listen((results) {
      if (mounted) {
        setState(() {
          _scanResults = results;
        });
      }
    });
    _bleService.startScan();
  }

  Future<void> _loadBondedDevices() async {
    final bonded = await _bleService.getBondedDevices();
    if (mounted) {
      setState(() {
        _bondedDevices = bonded;
      });
    }
  }

  @override
  void dispose() {
    _bleService.stopScan();
    super.dispose();
  }

  String _resolveDeviceName(BluetoothDevice device, AdvertisementData? adv) {
    if (device.platformName.isNotEmpty) return device.platformName;
    if (adv != null && adv.advName.isNotEmpty) return adv.advName;

    if (adv != null) {
      final uuids = adv.serviceUuids.map((u) => u.toString().toUpperCase()).join(' ');
      if (uuids.contains('AE00') || uuids.contains('FF00') || uuids.contains('18F0') || uuids.contains('AB00')) {
        return 'Thermal Printer (${device.remoteId.str.length > 5 ? device.remoteId.str.substring(device.remoteId.str.length - 5) : device.remoteId.str})';
      }
    }

    final id = device.remoteId.str;
    final shortId = id.length > 5 ? id.substring(id.length - 5) : id;
    return 'Printer / Device ($shortId)';
  }

  bool _isKnownPrinterName(String name) {
    final upper = name.toUpperCase();
    return upper.contains('X5') ||
        upper.contains('X6') ||
        upper.contains('CAT') ||
        upper.contains('PRINT') ||
        upper.contains('PERIPAGE') ||
        upper.contains('PAPERANG') ||
        upper.contains('POS') ||
        upper.contains('MX') ||
        upper.contains('GB0') ||
        upper.contains('GT0') ||
        upper.contains('M02') ||
        upper.contains('T02') ||
        upper.contains('D30') ||
        upper.contains('PT-210');
  }

  Future<void> _connectToDevice(BluetoothDevice device, String name) async {
    setState(() {
      _connectingDeviceId = device.remoteId.str;
      _errorMessage = null;
    });

    final success = await _bleService.connect(device, fallbackName: name);

    if (mounted) {
      setState(() {
        _connectingDeviceId = null;
      });
      if (success) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Connected to $name!'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        setState(() {
          _errorMessage = 'Could not connect to $name. Please check printer power.';
        });
      }
    }
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
                _buildCategory('Pocket & Portable Thermal Printers', [
                  '• Portable Pocket / Cat / FunPrint / iPrint / LuckJingle',
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
        width: 390,
        padding: const EdgeInsets.all(18),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
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
            const SizedBox(height: 4),
            const Text(
              'Scanning for X5, X6, Cat, WalkPrint, PeriPage, ESC/POS...',
              style: TextStyle(fontSize: 11, color: Colors.white60),
            ),

            if (_errorMessage != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: Colors.redAccent.withValues(alpha: 0.4)),
                ),
                child: Text(
                  _errorMessage!,
                  style: const TextStyle(fontSize: 11, color: Colors.redAccent),
                ),
              ),
            ],

            const SizedBox(height: 12),

            // Devices List (Bonded + Scanned)
            ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 280),
              child: (_bondedDevices.isEmpty && _scanResults.isEmpty)
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
                  : ListView(
                      shrinkWrap: true,
                      children: [
                        // Bonded/Paired Devices Section
                        if (_bondedDevices.isNotEmpty) ...[
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 4, horizontal: 4),
                            child: Text(
                              'PAIRED SYSTEM PRINTERS',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFF59E0B)),
                            ),
                          ),
                          ..._bondedDevices.map((dev) {
                            final name = _resolveDeviceName(dev, null);
                            final isConnecting = _connectingDeviceId == dev.remoteId.str;
                            return _buildDeviceTile(
                              device: dev,
                              name: name,
                              subtitle: 'Paired in Bluetooth settings • ${dev.remoteId.str}',
                              isConnecting: isConnecting,
                              isKnownThermal: true,
                            );
                          }),
                          const Divider(color: Color(0xFF27272A), height: 16),
                        ],

                        // Nearby Scanned Devices Section
                        if (_scanResults.isNotEmpty) ...[
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 4, horizontal: 4),
                            child: Text(
                              'DISCOVERED NEARBY DEVICES',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white60),
                            ),
                          ),
                          ..._scanResults.map((res) {
                            final name = _resolveDeviceName(res.device, res.advertisementData);
                            final isKnown = _isKnownPrinterName(name);
                            final isConnecting = _connectingDeviceId == res.device.remoteId.str;
                            return _buildDeviceTile(
                              device: res.device,
                              name: name,
                              subtitle: '${res.rssi} dBm • ${res.device.remoteId.str}',
                              isConnecting: isConnecting,
                              isKnownThermal: isKnown,
                            );
                          }),
                        ],
                      ],
                    ),
            ),

            const SizedBox(height: 12),

            // Bottom Actions (Refresh + Supported Printers)
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      _loadBondedDevices();
                      _bleService.startScan();
                    },
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

  Widget _buildDeviceTile({
    required BluetoothDevice device,
    required String name,
    required String subtitle,
    required bool isConnecting,
    required bool isKnownThermal,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 3),
      decoration: BoxDecoration(
        color: const Color(0xFF1F1F23),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isKnownThermal ? const Color(0xFFF59E0B).withValues(alpha: 0.3) : const Color(0xFF27272A),
        ),
      ),
      child: ListTile(
        dense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
        leading: Icon(
          Icons.print,
          color: isKnownThermal ? const Color(0xFFF59E0B) : Colors.white38,
          size: 20,
        ),
        title: Text(
          name,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isKnownThermal ? FontWeight.bold : FontWeight.w500,
            color: isKnownThermal ? Colors.white : Colors.white70,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(fontSize: 10, color: Colors.grey.shade500),
        ),
        trailing: isConnecting
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFF59E0B)),
                ),
              )
            : ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFF59E0B),
                  foregroundColor: const Color(0xFF09090B),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  minimumSize: const Size(60, 28),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                ),
                onPressed: () => _connectToDevice(device, name),
                child: const Text('Pair', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
              ),
      ),
    );
  }
}

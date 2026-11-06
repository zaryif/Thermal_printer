import 'dart:async';
import 'dart:typed_data';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import '../protocol/tiny_print_protocol.dart';

enum BleStatus {
  idle,
  scanning,
  connecting,
  connected,
  printing,
  disconnected,
  error,
}

class ThermalBleService {
  static final ThermalBleService _instance = ThermalBleService._internal();
  factory ThermalBleService() => _instance;
  ThermalBleService._internal();

  BluetoothDevice? _connectedDevice;
  BluetoothCharacteristic? _writeCharacteristic;
  BleStatus _status = BleStatus.idle;
  String? _deviceName;
  double _printProgress = 0.0;

  final _statusController = StreamController<BleStatus>.broadcast();
  final _devicesController = StreamController<List<ScanResult>>.broadcast();
  final _progressController = StreamController<double>.broadcast();

  Stream<BleStatus> get statusStream => _statusController.stream;
  Stream<List<ScanResult>> get devicesStream => _devicesController.stream;
  Stream<double> get progressStream => _progressController.stream;

  BleStatus get status => _status;
  bool get isConnected => _connectedDevice != null && _status == BleStatus.connected;
  String? get deviceName => _deviceName;
  double get printProgress => _printProgress;

  void _setStatus(BleStatus s) {
    _status = s;
    _statusController.add(s);
  }

  /// Start scanning for nearby Bluetooth thermal printers
  Future<void> startScan() async {
    if (await FlutterBluePlus.isSupported == false) {
      _setStatus(BleStatus.error);
      return;
    }

    _setStatus(BleStatus.scanning);

    // Listen to scan results
    FlutterBluePlus.scanResults.listen((results) {
      _devicesController.add(results);
    });

    await FlutterBluePlus.startScan(
      timeout: const Duration(seconds: 8),
    );

    if (_status == BleStatus.scanning) {
      _setStatus(BleStatus.idle);
    }
  }

  /// Stop scanning
  Future<void> stopScan() async {
    await FlutterBluePlus.stopScan();
    if (_status == BleStatus.scanning) {
      _setStatus(BleStatus.idle);
    }
  }

  /// Connect to selected Bluetooth thermal printer
  Future<bool> connect(BluetoothDevice device) async {
    try {
      _setStatus(BleStatus.connecting);
      await device.connect(autoConnect: false, timeout: const Duration(seconds: 10));

      _connectedDevice = device;
      _deviceName = device.platformName.isNotEmpty ? device.platformName : 'Thermal Printer';

      // Discover GATT services & locate write characteristic
      final services = await device.discoverServices();
      BluetoothCharacteristic? foundChar;

      for (var s in services) {
        for (var c in s.characteristics) {
          final uuid = c.uuid.toString().toUpperCase();
          if (uuid.contains('AE01') ||
              uuid.contains('FF02') ||
              uuid.contains('AB01') ||
              uuid.contains('E7810002') ||
              uuid.contains('BEF2')) {
            foundChar = c;
            break;
          }
          if (c.properties.write || c.properties.writeWithoutResponse) {
            foundChar ??= c;
          }
        }
        if (foundChar != null) break;
      }

      if (foundChar == null) {
        throw Exception('No writable thermal printer characteristic discovered on device');
      }

      _writeCharacteristic = foundChar;
      _setStatus(BleStatus.connected);

      // Listen for disconnects
      device.connectionState.listen((state) {
        if (state == BluetoothConnectionState.disconnected) {
          _connectedDevice = null;
          _writeCharacteristic = null;
          _setStatus(BleStatus.disconnected);
        }
      });

      return true;
    } catch (e) {
      _setStatus(BleStatus.error);
      return false;
    }
  }

  /// Disconnect current printer
  Future<void> disconnect() async {
    if (_connectedDevice != null) {
      await _connectedDevice!.disconnect();
      _connectedDevice = null;
      _writeCharacteristic = null;
      _setStatus(BleStatus.disconnected);
    }
  }

  /// Stream packaged Tiny Print packets to printer with calibrated 50ms pacing
  Future<bool> printPackets(List<Uint8List> packets) async {
    if (_writeCharacteristic == null || !isConnected) {
      return false;
    }

    _setStatus(BleStatus.printing);
    _printProgress = 0.0;
    _progressController.add(0.0);

    try {
      final int total = packets.length;
      for (int i = 0; i < total; i++) {
        final packet = packets[i];
        final withoutResponse = _writeCharacteristic!.properties.writeWithoutResponse;

        await _writeCharacteristic!.write(packet, withoutResponse: withoutResponse);

        _printProgress = (i + 1) / total;
        _progressController.add(_printProgress);

        // Hardware chunk pacing to prevent head FIFO buffer overflow (50ms)
        await Future.delayed(const Duration(milliseconds: 50));
      }

      _setStatus(BleStatus.connected);
      return true;
    } catch (e) {
      _setStatus(BleStatus.error);
      return false;
    }
  }

  /// Helper to send mono bytes via TinyPrintProtocol
  Future<bool> printMonoRaster(Uint8List monoBytes, int widthDots, int heightDots) async {
    final packets = TinyPrintProtocol.packageRasterBitstream(
      monoBytes,
      widthDots,
      heightDots,
    );
    return await printPackets(packets);
  }
}

import 'dart:async';
import 'dart:io' show Platform;
import 'package:flutter/services.dart';
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
  BluetoothDevice? get connectedDevice => _connectedDevice;

  StreamSubscription<List<ScanResult>>? _scanSub;

  void _setStatus(BleStatus s) {
    _status = s;
    _statusController.add(s);
  }

  /// Get list of already bonded / system paired Bluetooth devices
  Future<List<BluetoothDevice>> getBondedDevices() async {
    try {
      if (await FlutterBluePlus.isSupported == false) return [];
      return await FlutterBluePlus.bondedDevices;
    } catch (_) {
      return [];
    }
  }

  /// Start scanning for nearby Bluetooth thermal printers
  Future<void> startScan() async {
    try {
      if (await FlutterBluePlus.isSupported == false) {
        _setStatus(BleStatus.error);
        return;
      }

      // Check Bluetooth power state
      if (FlutterBluePlus.adapterStateNow != BluetoothAdapterState.on) {
        try {
          if (Platform.isAndroid) {
            await FlutterBluePlus.turnOn();
          }
        } catch (_) {}
      }

      _setStatus(BleStatus.scanning);

      // Clean up previous scan subscription if any
      await _scanSub?.cancel();
      _scanSub = FlutterBluePlus.scanResults.listen((results) {
        _devicesController.add(results);
      });

      await FlutterBluePlus.startScan(
        timeout: const Duration(seconds: 12),
        androidUsesFineLocation: true,
      );

      if (_status == BleStatus.scanning) {
        _setStatus(BleStatus.idle);
      }
    } catch (e) {
      _setStatus(BleStatus.error);
    }
  }

  /// Stop scanning
  Future<void> stopScan() async {
    try {
      await FlutterBluePlus.stopScan();
      await _scanSub?.cancel();
      _scanSub = null;
      if (_status == BleStatus.scanning) {
        _setStatus(BleStatus.idle);
      }
    } catch (_) {}
  }

  /// Connect to selected Bluetooth thermal printer with priority characteristic discovery
  Future<bool> connect(BluetoothDevice device, {String? fallbackName}) async {
    try {
      _setStatus(BleStatus.connecting);

      // Stop scan before connecting for BLE stability
      await stopScan();

      await device.connect(
        autoConnect: false,
        timeout: const Duration(seconds: 12),
      );

      _connectedDevice = device;
      
      // Resolve device display name
      if (device.platformName.isNotEmpty) {
        _deviceName = device.platformName;
      } else if (fallbackName != null && fallbackName.isNotEmpty && !fallbackName.contains('Unknown')) {
        _deviceName = fallbackName;
      } else {
        _deviceName = 'Thermal Printer (${device.remoteId.str.length > 5 ? device.remoteId.str.substring(device.remoteId.str.length - 5) : device.remoteId.str})';
      }

      // Android BLE high-speed optimizations
      if (Platform.isAndroid) {
        try {
          await device.requestMtu(512);
        } catch (_) {}
        try {
          await device.requestConnectionPriority(
            connectionPriorityRequest: ConnectionPriority.high,
          );
        } catch (_) {}
      }

      // Discover GATT services & locate write characteristic
      final services = await device.discoverServices();
      BluetoothCharacteristic? targetChar;

      // Priority 1: Match known thermal printer write characteristic UUIDs
      const knownWriteUuids = [
        'AE01', // Tiny Print, GB01, Cat, WalkPrint
        'FF02', // Standard POS
        'AB01', // PeriPage / Paperang
        'BEF2', // Phomemo
        'E7810002', // Custom ESC/POS
        '49535343', // ISSC transparent UART
        '6E400002', // Nordic UART RX
      ];

      for (var s in services) {
        for (var c in s.characteristics) {
          final uuid = c.uuid.toString().toUpperCase();
          for (var known in knownWriteUuids) {
            if (uuid.contains(known)) {
              targetChar = c;
              break;
            }
          }
          if (targetChar != null) break;
        }
        if (targetChar != null) break;
      }

      // Priority 2: Custom service characteristic with write permission (exclude Bluetooth SIG 0x1800-0x180F)
      if (targetChar == null) {
        for (var s in services) {
          final sUuid = s.uuid.toString().toUpperCase();
          if (sUuid.startsWith('000018')) continue; // Skip Generic Access, Battery, Device Info

          for (var c in s.characteristics) {
            if (c.properties.writeWithoutResponse || c.properties.write) {
              targetChar = c;
              break;
            }
          }
          if (targetChar != null) break;
        }
      }

      // Priority 3: Fallback to any characteristic that supports writing
      if (targetChar == null) {
        for (var s in services) {
          for (var c in s.characteristics) {
            if (c.properties.writeWithoutResponse || c.properties.write) {
              targetChar = c;
              break;
            }
          }
          if (targetChar != null) break;
        }
      }

      if (targetChar == null) {
        throw Exception('No writable thermal printer characteristic discovered on device');
      }

      _writeCharacteristic = targetChar;
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
    try {
      if (_connectedDevice != null) {
        await _connectedDevice!.disconnect();
        _connectedDevice = null;
        _writeCharacteristic = null;
        _setStatus(BleStatus.disconnected);
      }
    } catch (_) {}
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

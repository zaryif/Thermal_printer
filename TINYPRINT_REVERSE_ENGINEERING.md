# Tiny Print APK — Complete Reverse Engineering & Architecture Report
**Package:** `com.frogtosea.tinyPrint` (v1.3.87)  
**Target Hardware:** Thermal Receipt & Mini Label Printers (X5, X6, X8, Cat Printer, GB01, WalkPrint)  
**Decompiled Artifacts Location:** `reverse_engineer_tiny_printer/decompiled_src/`  
**Assets & Resources Location:** `reverse_engineer_tiny_printer/assets_and_resources/`

---

## 1. Executive Summary & Core Mechanics
Reverse-engineering `Tiny+Print_1.3.87_APKPure.xapk` reveals that Tiny Print's simplicity and speed come from a clean, direct WYSIWYG paradigm:
1. **No Form Fields / Direct Canvas Typing:**  
   Unlike clumsy web forms or sidebar inspectors, Tiny Print's templates (`ShortNoteActivity`, `ToDoListActivity`, `TimeTableActivity`) place interactive `EditText` widgets directly inside styled canvas views (`ShortNoteView1`, `ToDoListAdapter`, `TimeTableView`). The user simply taps the paper and writes naturally.
2. **View-to-Bitmap Screen Capture Pipeline (`ViewToBitmap.java`):**  
   When the user taps **Print**, Tiny Print hides the blinking cursor (`CursorVisible(false)`), captures the live view hierarchy directly onto an uncompressed Bitmap (`ViewToBitmap.view2Bitmap`), normalizes background transparency to `#FFFFFF`, and sends the rendered image to the rasterizer.
3. **OpenCV & Custom Thermal Binarization (`ImageDisposeUtil.java`):**  
   Images and text are converted to pure 1-bit monochrome using OpenCV CLAHE contrast enhancement, Floyd-Steinberg error diffusion, or adaptive thresholding (`format_K_threshold`).
4. **Proprietary BLE Packet Protocol (`0x51 0x78` Framing):**  
   Binary bitstreams are packed into fixed-width lines (384 dots for 58mm, 576 dots for 80mm), framed with `0x51 0x78` magic bytes, CRC8 checksummed, and transmitted in paced BLE packets.

---

## 2. Bluetooth LE Hardware Communication Protocol

### 2.1 Service & Characteristic UUIDs
Tiny Print communicates over standard BLE GATT profiles:
- **Profile 1 (Primary / X5 / Cat / WalkPrint):**
  - Service UUID: `0000AE00-0000-1000-8000-00805F9B34FB`
  - Write Characteristic: `0000AE01-0000-1000-8000-00805F9B34FB`
  - Notify Characteristic: `0000AE02-0000-1000-8000-00805F9B34FB`
- **Profile 2 (Secondary / GB01):**
  - Service UUID: `0000FF00-0000-1000-8000-00805F9B34FB`
  - Write Characteristic: `0000FF02-0000-1000-8000-00805F9B34FB`
- **Profile 3 (Serial SPP):**
  - Service UUID: `0000AB00-0000-1000-8000-00805F9B34FB`
  - Write Characteristic: `0000AB01-0000-1000-8000-00805F9B34FB`

### 2.2 Packet Framing Structure (`BluetoothOrder.java`)
Every command and image raster packet adheres to the following byte envelope:

```
+------------+------------+---------+---------+---------+---------+------------------+---------+------------+
| Byte 0     | Byte 1     | Byte 2  | Byte 3  | Byte 4  | Byte 5  | Byte 6 ... N+5   | Byte N+6| Byte N+7   |
| 0x51 (81)  | 0x78 ('x') | CMD ID  | 0x00    | LEN_LSB | LEN_MSB | PAYLOAD DATA     | CRC-8   | 0xFF (-1)  |
+------------+------------+---------+---------+---------+---------+------------------+---------+------------+
```

*(Note: Certain newer firmware revisions prepend an additional `0x12` byte flag: `[0x12, 0x51, 0x78, ...]`).*

### 2.3 Hardware Command Catalog
| Command Name | CMD Byte (Hex) | Payload Length | Description & Parameters |
|---|---|---|---|
| `getDevState` | `0xA3` (`-93`) | 1 | Queries printer status (out of paper, overheating, ready) |
| `getDevInfo` | `0xA8` (`-88`) | 1 | Queries device model, firmware version, and DPI |
| `getElectricQuantity` | `0xBA` (`-70`) | 1 | Queries battery percentage (0 - 100%) |
| `quality` (Energy) | `0xA4` (`-92`) | 1 | Print concentration / energy: Level 1 (`0x31`) to Level 5 (`0x35`) |
| `customEnergy` | `0xAF` (`-81`) | 2 | Raw energy microsecond pulse (e.g., `0x23F0` = 9200 for deep black) |
| `feedPaper` / `paper` | `0xA1` (`-95`) | 2 | Feeds blank paper by N steps (e.g., `48` steps for 200 DPI, `72` for 300 DPI) |
| `print_img_gray_16` | `0xBE` (`-66`) | 2 | Initiates raster bitstream mode |
| `feed_speed` | `0xBD` (`-67`) | 1 | Sets motor stepper speed (default 10 - 20) |

### 2.4 CRC8 Polynomial & Checksum Routine
Tiny Print uses an 8-bit lookup table based on polynomial `0x07`:
```java
public static byte calcCrc8(byte[] data, int offset, int length) {
    byte crc = 0;
    for (int i = offset; i < offset + length; i++) {
        crc = CHECKSUM_TABLE[(crc ^ data[i]) & 0xFF];
    }
    return crc;
}
```

---

## 3. Image Processing & Rasterization Pipeline (`ImageDisposeUtil.java`)

Tiny Print supports two primary image modes:
1. **Text Mode (`Code.TEXT_PRINT_TYPE`):**  
   Uses high-contrast adaptive thresholding (`format_K_threshold`). Pixels are compared against local neighbourhood mean minus an offset (mean - 13) to ensure text remains crisp without fuzziness.
2. **Photo / Halftone Mode:**  
   Uses Floyd-Steinberg error-diffusion dithering (`convertGreyImgByFloydPixels`):
   ```
       X   7/16
   3/16 5/16 1/16
   ```
3. **LSB Bit-Packing:**  
   Each horizontal row of pixels (384 dots for 58mm = 48 bytes per row) is packed with bit 0 representing the leftmost dot (`LSB-first`).

---

## 4. UI Architecture & Template Editing Workflow

### 4.1 Short Notes (`com.ShortNote.ShortNoteActivity`)
- View Hierarchy: `ShortNoteActivity` -> `ShortNoteView1` (custom `LinearLayout` container).
- The template layout contains decorative thermal borders and an embedded `MyEditText`.
- The user taps anywhere to type directly.
- On Print click:
  ```kotlin
  this.noteView.CursorVisible(false) // Hide blinking cursor
  val bmp = ImageDisposeUtil.pngToWhite(ImageDisposeUtil.view2Bitmap(this.noteView))
  // Send bmp to PrintDataUtils.EightBitmapToData(...)
  ```

### 4.2 ToDo & Checklists (`com.templates.activity.ToDoListActivity`)
- Uses a `RecyclerView` containing checkable items with `EditText` fields.
- Tapping a checkbox toggles item completion.
- Tapping text allows immediate rewriting.
- Tapping `+ Add Item` appends a new row to the data list.
- Printing captures the entire `RecyclerView` / `ScrollView` into a single tall bitmap.

### 4.3 Timetable / Schedule (`com.Timetable.TimeTableActivity`)
- Grid layout with time column on left and event title blocks on right.
- Each cell is directly editable in-place.
- Auto-formats to 384px or 576px thermal head geometry.

---

## 5. Dart / Flutter Architecture Blueprint (Pure Native App)

To satisfy the user's requirement for a **pure Dart application (no Capacitor, no web app)** while matching Tiny Print's exact reverse-engineered mechanics:

### 5.1 Project Architecture
```
thermal_printer_dart/
├── lib/
│   ├── main.dart                          # App Entrypoint & Minimal OS Theme
│   ├── models/
│   │   ├── receipt_block.dart             # Header, Text, Todo, Schedule, Table, Photo, Feed
│   │   └── printer_device.dart            # BLE Device Model & RSSI
│   ├── protocol/
│   │   ├── tiny_print_protocol.dart       # 0x51 0x78 framing, CRC8, commands
│   │   └── esc_pos_protocol.dart          # Standard ESC/POS fallback
│   ├── services/
│   │   ├── bluetooth_service.dart         # Flutter reactive BLE service (flutter_blue_plus)
│   │   ├── image_rasterizer.dart          # Dithering (Floyd-Steinberg/Atkinson/Threshold)
│   │   └── google_calendar_service.dart   # Google Calendar API OAuth client
│   └── ui/
│       ├── canvas/
│       │   ├── receipt_canvas.dart        # RepaintBoundary WYSIWYG paper editor
│       │   └── editable_block_widget.dart # In-place directly rewritable text widgets
│       ├── widgets/
│       │   ├── minimal_command_bar.dart   # +Text, +Title, +Photo, +Agenda, +Todo, +Table, +Feed
│       │   └── font_selector.dart         # Multi-font switcher (Mono, Sans, Serif, Arcade)
│       └── modals/
│           ├── ble_device_dialog.dart     # Scan & Pair X5/Cat/WalkPrint dialog
│           └── calendar_dialog.dart       # Google Calendar agenda fetcher
```

### 5.2 Key Pure Dart Implementations
1. **Direct RepaintBoundary Capture (replacing `ViewToBitmap`):**
   ```dart
   RenderRepaintBoundary boundary = receiptKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
   ui.Image image = await boundary.toImage(pixelRatio: 1.0);
   ByteData? byteData = await image.toByteData(format: ui.ImageByteFormat.rawRgba);
   ```
2. **Pure Dart LSB Packing & Tiny Print CRC8:**
   Translates Tiny Print's `BluetoothOrder.java` and `PrintDataUtils.java` into high-performance Dart typed byte arrays (`Uint8List`).
3. **Reactive In-Place Text Editing:**
   Every block uses transparent `TextField` widgets with `TextEditingController` directly on the physical receipt paper widget.

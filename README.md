# 🖨️ Thermal Printer OS

<div align="center">

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/zaryif/Thermal_printer/release.yml?style=for-the-badge)
![GitHub Release](https://img.shields.io/github/v/release/zaryif/Thermal_printer?style=for-the-badge&color=orange)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Platforms](https://img.shields.io/badge/platforms-Android%20%7C%20Windows%20%7C%20Linux%20%7C%20macOS%20%7C%20Web-green?style=for-the-badge)

**The Universal Minimal OS for Pocket & POS Thermal Printers**  
*Pure Dart/Flutter Native • Calibrated Tiny Print Engine • In-Place WYSIWYG Typewriter • Photo Upload • Quotes • Calendar*

[🌐 **Web App**](https://zaryif.github.io/Thermal_printer/) • [📦 **Latest Release & APK**](https://github.com/zaryif/Thermal_printer/releases) • [🐛 **Report an Issue**](https://github.com/zaryif/Thermal_printer/issues)

</div>

---

## 🌟 Overview

**Thermal Printer OS** is a 100% native Flutter/Dart thermal printing operating system calibrated directly against pocket Bluetooth printers (X5, X6, Cat, WalkPrint, Tiny Print) and commercial POS hardware.

It gives you a direct, tactile typewriter experience: click and edit directly on the thermal receipt paper with zero lag, upload photos with automatic Floyd-Steinberg dithering, shuffle motivational focus quotes, synchronize daily schedules with Google Calendar, and print with a prominent, tactile one-tap print dock.

---

## 🚀 Key Features

### 📅 1. Google Calendar Integration
- **Direct 1-Click Google Sign-In**: Authenticate via Google Identity Services (OAuth 2.0) to fetch live events from your primary Google Calendar.
- **Automatic Smart Categorization**: Events are intelligently tagged into thematic color badges on your agenda:
  - 🕌 **Prayers**: Fajr, Dhuhr, Jummah, Asr, Maghrib, Isha
  - 📚 **Study & Exams**: Midterms, Quizzes, Lab Sprint, Code Practice
  - 💼 **Meetings & Work**: Standup, Client Review, Zoom/Meet Sync
  - 🏃 **Health & Personal**: Workout, Lunch, Break, Movement
- **Offline `.ICS` Import & Quick Paste**: Drag and drop any exported `.ics` file (from Google Calendar, Apple Calendar, or Outlook) or paste a plain text agenda—no API key required!
- **Receipt Extras**: Add a centered daily motivational quote, priority task checkboxes `[ ]`, and a high-resolution QR code linking directly to Google Calendar.

---

### ⚡ 2. Calibrated Tiny Print Protocol (Reverse-Engineered)
Reverse-engineered directly from **Tiny Print APK (v1.3.87)** (`com.frogtosea.tinyPrint`):
- **Exact Hardware Framing**: Native `0x51 0x78` packet encapsulation with CRC8 integrity verification.
- **LSB-First Bit Packing**: Native hardware mapping where `bit 0 = Pixel 0` and `bit 7 = Pixel 7`, completely eliminating horizontal segment scrambling.
- **Deep Concentration Level 5**: Heating energy calibrated to `9200` (`[0xF0, 0x23]`) and print speed set to `10` for deep, pitch-black lines without washed-out graying.
- **Hardware Pacing Flow Control (`slowInterval: 50ms`)**: Throttled packet transmission (50ms interval + 100ms breather every 25 packets) that keeps the printer's 32KB FIFO buffer completely healthy, eliminating truncated receipts.
- **Adaptive Luminance Threshold**: Uses Tiny Print's factory formula `threshold = mean_luminance - 13` for optimal thermal paper contrast.
- **Compact Tear Alignment**: Precise stepper motor feeds (`0xA1` & `0xBD`) push the receipt neatly past the serrated tear bar with only ~1.8 cm of border, preventing roll waste.

---

### 🖼️ 3. Pixel-Perfect Thermal Dithering Engine
- **Multiple Binarization Algorithms**:
  - **Floyd-Steinberg**: Smooth, gradient-rich error diffusion.
  - **Atkinson**: Classic vintage Mac high-contrast sharpness.
  - **Bayer 4x4 Matrix**: Retro crosshatch ordered dithering.
  - **Pure Adaptive Threshold**: Ultra-crisp typography and barcode readability.
- **Live Canvas Preview**: Real-time slider adjustments for contrast, brightness, negative inversion, and threshold levels.

---

### 📐 4. Dual Paper Width & Multi-Protocol Support
| Profile | Dot Width | Paper Width | Typical Hardware |
| :--- | :--- | :--- | :--- |
| **58mm Standard / Pocket** | 384 dots (48 B/line) | 58mm / 2.25 inch | X5, X5h, X6, C9, C15, PeriPage, WalkPrint, POS-58 |
| **80mm Commercial POS** | 576 dots (72 B/line) | 80mm / 3.12 inch | Epson TM-T88, Star Micronics, Munbyn, POS-80 |

---

## 🖨️ Supported Printers & POS Hardware List

Thermal Printer OS works with both reverse-engineered BLE packet protocols (Tiny Print, WalkPrint, PeriPage) and standard ESC/POS hardware:

### 1. Pocket & Mini Thermal Printers (BLE)
* **Tiny Print / Fun Print / iPrint / LuckJingle / WalkPrint**: Native `0x51 0x78` framing, CRC-8, Level 5 heating pulse (9200µs).
* **PeriPage**: A6, A9, A9 Pro, A40, A40+
* **Paperang**: P1, P1S, P2, P2S, P3
* **Cat & Bear Printers**: C9, C13, C15, C17, C19, C20
* **MX Series**: MX05, MX06, MX08, MX10
* **Phomemo**: M02, M02 Pro, T02, D30, M110
* **Mini Pocket Series**: GB01, GB02, GT01, X5, X6, A8, A31

### 2. Commercial POS & Mobile Receipt Printers (ESC/POS & BLE)
* **Standard ESC/POS 58mm & 80mm Bluetooth Printers**
* **MUNBYN Thermal Printers**: ITPP047, IMP001, ITPP130
* **GOOJPRT**: PT-210, MPT-II, JP-58H, MPT-III
* **Zjiang**: ZJ-5802, ZJ-5805, ZJ-8250
* **Netum & Rongta**: 58mm & 80mm Mobile Bluetooth Terminals
* **Sunmi Handheld POS**: V1, V2, V2 Pro (BLE/SPP)
* **Epson POS**: TM-T20, TM-T88 series (Bluetooth models)
* **Star Micronics**: TSP100, TSP650 (Bluetooth models)

---

## 📋 Built-In Preset Templates

Thermal Printer OS includes 6 instant templates selectable from the top navbar:

| Template | Description | Included Blocks |
| :--- | :--- | :--- |
| **📄 Start from Blank** | Clean empty thermal paper roll | Pure white canvas ready for custom block drops |
| **📅 Daily Focus & Agenda** | Complete day planner & Google Calendar | Header, Timetable, Focus Quote, Action Checklist, Tear line |
| **💰 Daily Expenses & Bill** | Itemized expense log & receipt | Header, Line items, Category chips, Subtotal, Tax, Total, Signature |
| **📝 Quick Notes & Memo** | Brain dump & developer reminders | Header, Multi-line notes with line-gapping, Inspiring Quote, Cut line |
| **✅ Priority Checklist** | High & Low impact task matrix | Header, Tasks with checkboxes, HIGH/LOW priority tags, Progress counter |
| **⚠️ Important Notice** | High-contrast inverted callout | Dark inverted alert banner, Critical memo text, QR verification code |

---

## 🛠️ Minimal Command Dock (Quick Drops)

Add any element anywhere on the paper with 1 tap:
* **`+ Expense`**: Line-item expense block with auto-calculated total and category tags.
* **`+ Important`**: Inverted pitch-black high-contrast notification callout.
* **`+ Note`**: Multi-line transparent text area with generous line-height (`1.45`).
* **`+ Photo`**: Image uploader with Floyd-Steinberg error diffusion and auto-resize.
* **`+ Quote`**: Curated motivational quote card with 1-tap `🎲 Shuffle`.
* **`+ Schedule`**: Time slots with checkboxes and timestamps.
* **`+ Todo`**: Action checklist items.
* **`+ Gap`**: Adjustable vertical blank space (8px to 96px).
* **`+ Header`**: Thermal receipt title, subtitle, date, and left/right metadata.
* **`+ Line`**: Dashed cut-line with scissor glyph `✂`.
* **`+ QR Code`**: High-resolution vector QR code.
* **`+ Table`**: Multi-column tabular receipt data.

---

## 📱 Multi-Platform Execution

Thermal Print Studio is engineered to run seamlessly across all modern operating systems:

```
                          ┌──────────────────────────┐
                          │   Thermal Print Studio   │
                          └────────────┬─────────────┘
                                       │
        ┌──────────────────┬───────────┴───────────┬──────────────────┐
        ▼                  ▼                       ▼                  ▼
   🌐 Web PWA        🤖 Android APK           🍎 iOS App        💻 Desktop App
 (Chrome / Edge)   (Capacitor / Play)      (Capacitor / iOS)   (macOS & Windows)
```

### 1. 🌐 Web Application (PWA)
Runs directly in modern Chromium browsers (Chrome, Edge, Opera, Android Chrome) with zero driver installation:
- Uses the **Web Bluetooth API** (`navigator.bluetooth`) to pair and stream directly to BLE printers.
- Uses the **Web Serial API** (`navigator.serial`) for paired Bluetooth SPP COM ports or USB-OTG cables.
- **Try it now**: [https://zaryif.github.io/Thermal_printer/](https://zaryif.github.io/Thermal_printer/)

### 2. 🤖 Android APK
Build a standalone APK or publish to the Google Play Store using Capacitor:
```bash
# 1. Build production web distribution
npm run build

# 2. Sync native Android assets
npm run cap:sync

# 3. Open in Android Studio
npm run cap:android
```
In Android Studio, click **Build > Build Bundle(s) / APK(s) > Build APK(s)** to produce `app-release.apk`.

### 3. 🍎 iOS (iPhone & iPad)
Deploy to iPhone or iPad with full Bluetooth permissions:
```bash
# 1. Build and sync iOS workspace
npm run build
npm run cap:sync

# 2. Open Xcode project
npm run cap:ios
```
Select your connected iPhone/iPad and press **Run (Cmd + R)**.

### 4. 💻 Desktop (macOS & Windows)
Packaged via Electron with native serial port and menu bar integration:
```bash
# Run desktop app in development
npm run electron:start

# Build macOS installer (.DMG & .ZIP)
npm run electron:mac

# Build Windows installer (.EXE & Portable)
npm run electron:win
```
Built binaries are generated in the `release/` directory.

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Chromium-based Browser**: Google Chrome or Microsoft Edge (for Web Bluetooth testing)

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/zaryif/Thermal_printer.git
cd Thermal_printer

# 2. Install dependencies
npm install

# 3. Launch Vite development server
npm run dev
```
Visit `http://localhost:5173` in your browser.

---

## 🔑 Google Calendar OAuth Configuration (Optional)

To enable 1-click Google Sign-In directly in the app:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and enable the **Google Calendar API**.
3. Under **APIs & Services > Credentials**, create an **OAuth 2.0 Web Client ID**.
4. Add your domain (e.g. `https://zaryif.github.io` or `http://localhost:5173`) to **Authorized JavaScript origins**.
5. Copy the Client ID and paste it into the app's **Calendar Modal**, or set it in your environment:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```
*(Note: If you do not wish to set up a Client ID, you can use the **Upload Google .ICS File** tab anytime without any configuration!)*

---

## 🤖 Standalone Python BLE Tool

A production Python utility for headless script printing over macOS/Linux Bluetooth is provided:
- Located at: `scratch/print_perfect_friday.py`
- Features: Direct Bleak BLE connection to `X5h-399A`, calibrated energy payload, and 50ms pacing.

Run standalone:
```bash
python3 scratch/print_perfect_friday.py
```

---

## 🔄 CI/CD & GitHub Actions

Thermal Print Studio uses automated GitHub Actions:
- **`deploy.yml`**: Automatically builds and deploys every commit pushed to `main` directly to **GitHub Pages**.
- **`release.yml`**: On tag creation (`v*`), automatically builds the web distribution zip, compiles release assets, and generates release notes.

---

## 📋 Troubleshooting & FAQ

<details>
<summary><strong>Q: Why does my pocket thermal printer print faint or washed-out lines?</strong></summary>
Pocket printers require adequate heating energy. Standard ESC/POS commands lack the Tiny Print concentration header. Thermal Print Studio automatically detects Tiny Print chipsets and injects <code>0x51 0x78 0xAF (Energy 9200)</code> and <code>0xA4 (Quality 5 Deepen)</code> to ensure deep black contrast.
</details>

<details>
<summary><strong>Q: Why does the print cut off or get messy halfway through?</strong></summary>
Mini thermal printers have small hardware FIFO buffers (~32KB). If data is streamed at 10-20ms intervals, the buffer overflows. Thermal Print Studio enforces a <strong>50ms delay per 177-byte packet</strong> plus periodic 100ms breathers, allowing 100% of receipts to print without drops.
</details>

<details>
<summary><strong>Q: Why was text scrambled before on X5h printers?</strong></summary>
Standard ESC/POS assumes MSB-first bit order. Tiny Print / WalkPrint hardware decodes pixels <strong>LSB-first</strong> (Bit 0 is Pixel 0, Bit 7 is Pixel 7). Thermal Print Studio packs bytes in exact LSB order for these devices.
</details>

---

## 📜 License & Attribution

Distributed under the **MIT License**. See `LICENSE` for more information.

Designed & Built with ❤️ by **MD. ZARIF AZFAR**.

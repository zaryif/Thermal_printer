# 🖨️ Thermi — Your Thermal Printer OS

<div align="center">

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/zaryif/Thermi_ThermalPrinterOS/release.yml?style=for-the-badge)
![GitHub Release](https://img.shields.io/github/v/release/zaryif/Thermi_ThermalPrinterOS?style=for-the-badge&color=orange)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Platforms](https://img.shields.io/badge/platforms-Android%20%7C%20Web%20%7C%20macOS%20%7C%20Windows%20%7C%20Linux-green?style=for-the-badge)

**The Universal Minimalist Operating System & Studio for Pocket & Commercial POS Thermal Printers**  
*Pure Dart/Flutter Native • Universal BLE Protocol Engine • Edge-to-Edge Responsive Canvas • True Hardware Preview • Calendar Sync*

[🌐 **Web App**](https://zaryif.github.io/Thermi_ThermalPrinterOS/) • [📦 **Latest Release & Android APK**](https://github.com/zaryif/Thermi_ThermalPrinterOS/releases) • [🐛 **Report an Issue**](https://github.com/zaryif/Thermi_ThermalPrinterOS/issues)

</div>

---

## 💡 What Problem Does Thermi Solve?

Thermal pocket printers (Cat printers, PeriPage, WalkPrint, FunPrint, Phomemo, Paperang) and commercial ESC/POS receipt machines are compact, battery-powered, inkless miracles. But the software ecosystem powering them is broken:

1. **The Vendor App Nightmare:**  
   Official companion apps are cluttered with intrusive ads, require mandatory account logins, ask for unreasonable device permissions, track user data, and frequently crash during printing.
2. **Buffer Overruns & Truncated Printouts:**  
   Mini thermal printers typically have tiny 16KB–32KB micro-controller receive buffers. When conventional apps stream large image bitstreams at full Bluetooth speed, the printer buffer overflows, producing jagged lines, corrupt garbled text, or abruptly halting halfway through.
3. **Screen Cutoffs & Paper Mismatch:**  
   Most thermal apps force fixed layouts that overflow narrow mobile screens, forcing users to horizontally pan or guess how the receipt will print. Furthermore, switching between standard 58mm (384 dots) and commercial 80mm (576 dots) rolls frequently results in cropped margins.
4. **The Physical-Digital Disconnect:**  
   There is no seamless, open-source bridge connecting modern daily workflows (Google Calendar events, action checklists, financial bookkeeping, priority directives) directly into tactile, distraction-free physical paper notes.

---

## ⚡ What Can Thermi Do?

**Thermi** is a standalone, privacy-first, zero-driver thermal printing operating system engineered in native Flutter/Dart.

* **Universal Bluetooth Pairing:** Connects instantly over Bluetooth Low Energy (BLE) to any 58mm or 80mm pocket printer, portable Cat printer, commercial POS machine, or ESC/POS terminal.
* **Edge-to-Edge Screen Fitting:** An intelligent responsive canvas that fits your phone display width with zero horizontal scrolling or clipping, while scaling at native hardware dot density (384/576 dots) upon print.
* **True-to-Life Preview Mode:** 1-tap toggle between Edit Mode and Preview Mode. Preview Mode strips away all editor boxes and controls to show exactly how the physical receipt will emerge from the printer.
* **Paced 177-Byte Buffer Streaming:** Delivers bitstreams in 177-byte chunks with 50ms pacing and a 100ms breather every 25 packets, eliminating FIFO overflows for 100% reliable, full-length receipts.
* **Hardware-Calibrated Dithering:** Uses Floyd-Steinberg error diffusion, 1.15 contrast calibration, and luminance thresholding (`138`) to produce pitch-black, razor-sharp typography and photographic graphics without graying or banding.
* **Google Calendar & iCal Sync:** Automatically imports and formats daily schedules from Google Calendar (via OAuth or zero-config private iCal links).
* **Minimal OS Design Language:** Engineered with a deep zinc/slate dark aesthetic inspired by Braun, Teenage Engineering, and Apple—free of noisy rainbow icons or distracting emojis (except the authentic ✂️ cut line).
* **Modular Executive Templates:** Instantly generates professional Agendas, Action Protocols, Financial Ledgers, Executive Memos, and Urgent Directives.

---

## 🚀 Core Features

### 📅 1. Multi-Calendar Integration
* **100% Private iCal Sync (Zero Setup):** Paste your secret iCal link from Google Calendar, Apple iCloud, or Outlook. Works offline across Android, Web, and Desktop with zero API keys.
* **Direct Google OAuth 2.0:** Securely signs in and aggregates primary and sub-calendar events with date-window queries.
* **Smart Agenda Formatting:** Automatically categorizes schedule blocks into timed entries with checkboxes and calendar QR codes.

### 🖼️ 2. Calibrated Thermal Imaging Engine
* **LSB-First Hardware Mapping:** Direct bit-packing where `Bit 0 = Leftmost dot` and `Bit 7 = Rightmost dot`, preventing horizontal scrambling.
* **High-Contrast Energy Pulse:** Configured for high-concentration heating pulses (Level 5) to guarantee rich black output on any thermal paper stock.
* **Floyd-Steinberg Error Diffusion:** Renders continuous-tone photos and graphics into crisp 1-bit monochrome thermal dots.

### 📐 3. Dual Width & Hardware Profiles
| Profile | Dot Resolution | Paper Roll Width | Common Compatible Hardware |
| :--- | :--- | :--- | :--- |
| **58mm Standard / Pocket** | 384 dots (48 bytes/line) | 58mm (2.28 in) | X5, X6, Cat C9/C15, PeriPage A6/A9, WalkPrint, POS-58 |
| **80mm Commercial POS** | 576 dots (72 bytes/line) | 80mm (3.15 in) | Epson TM-T88, Star Micronics, Munbyn, POS-80 |

---

## 🖨️ Supported Hardware Ecosystem

Thermi is tested and verified with standard Bluetooth thermal devices:
* **Portable & Pocket Series:** Cat Printers (C9, C13, C15, C17, C19, C20), PeriPage (A6, A9, A40), Paperang (P1, P2), WalkPrint, Phomemo (M02, T02), LuckJingle, iPrint, GB01, GT01, X5, X6, A8, A31.
* **Commercial POS & Receipt Printers:** Standard ESC/POS 58mm & 80mm Bluetooth printers, Munbyn, GOOJPRT, Zjiang, Netum, Rongta, Sunmi V1/V2 handheld terminals, Epson TM series, Star Micronics.

---

## 📋 Executive Built-In Templates

| Template | Purpose | Blocks Included |
| :--- | :--- | :--- |
| **Executive Agenda** | Daily focus & synchronized schedule | Header, Focus Quote (*Think & Change.*), Daily Timetable, Action Checklist, Scissor Cut |
| **Project Checklist** | High-impact deliverable tracking | Header, Prioritized Checkboxes, Verification Sign-off, Scissor Cut |
| **Financial Ledger** | Itemized purchase log & expense audit | Header, Itemized Table, Subtotal, Tax, Total, Audit Sign-off |
| **Executive Memo** | Technical dispatch & architecture notes | Header, Multi-line Monospaced Notes, Author Attribution, Scissor Cut |
| **Urgent Directive** | Critical alerts & laboratory notices | Header, Inverted Alert Callout, Verification QR Code, Sign-off |
| **Blank Document** | Clean empty paper roll | Unconstrained canvas for custom modular block drops |

---

## 🛠️ Modular Block Palette

Build custom thermal receipts with one tap from the minimal command bar:
* **`+ Note`**: Monospaced transparent text block with generous line height.
* **`+ Todo`**: Interactive checklist item with high-priority flagging.
* **`+ Schedule`**: Time-indexed agenda item.
* **`+ Expense`**: Auto-calculating financial ledger row.
* **`+ Alert`**: High-contrast inverted warning callout.
* **`+ Photo`**: Image uploader with Floyd-Steinberg dithering.
* **`+ Quote`**: Curated motivational focus quote with shuffle toolbar.
* **`+ QR Code`**: High-density vector QR code.
* **`+ Header`**: Thermal receipt title, subtitle, date, and author metadata.
* **`+ Table`**: Multi-column tabular receipt layout.
* **`+ Line`**: Dashed tear line with scissor glyph `✂`.
* **`+ Gap`**: Adjustable vertical feed space.

---

## 💻 Tech Stack & Architecture

* **Framework:** Flutter 3.x / Pure Dart Native
* **Bluetooth Engine:** `flutter_blue_plus` with 177-byte paced chunk streaming
* **Image Processing:** Custom `RasterizerService` with `toImage(pixelRatio: targetDots / actualWidth)`
* **Calendar Sync:** Google APIs Client (`googleapis`), `google_sign_in`, and native RFC 5545 iCal parser
* **Target Platforms:** Android APK (Universal ARM/x86), Web PWA (Web Bluetooth API), Desktop (macOS, Windows, Linux)

---

## 👨‍💻 Developer & Attribution

* **Lead Architect & Developer:** **MD. ZARIF AZFAR**
* **Project Repository:** [zaryif/Thermi_ThermalPrinterOS](https://github.com/zaryif/Thermi_ThermalPrinterOS)
* **Signature Quote:** *"Think & Change."* — MD. ZARIF AZFAR
* **License:** MIT Open Source License

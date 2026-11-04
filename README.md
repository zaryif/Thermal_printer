# 🖨️ Thermal Print Studio

> **Universal Thermal Paper POS & Daily Schedule Designer** for Bluetooth & Serial thermal printers (58mm / 80mm / X5h pocket printers).  
> Compatible with **Android (APK)**, **iOS (iPhone/iPad)**, **macOS**, **Windows**, and **Web PWA**.

---

## ✨ Features

- 📅 **Google Calendar Daily Schedule Template**: 
  - Import Google Calendar events via `.ics` file, copy-paste agenda, or Google Calendar plugin.
  - Generates crisp timeline blocks, priority task checklists `[ ]`, and motivational banners.
  - Interactive clickable checkboxes on the live thermal preview.
- 🖼️ **Pixel-Perfect Thermal Dithering Engine**:
  - Upload photos and preview real-time binarization for thermal print heads.
  - Supported algorithms: **Atkinson** (Mac classic sharpness), **Floyd-Steinberg** (smooth grayscale), **Bayer 4x4 Matrix** (retro crosshatch), and **Pure Threshold**.
  - Interactive contrast, brightness, and negative-inversion controls.
- 🧾 **POS Receipt & Label Designer**:
  - Itemized receipt table with automatic subtotal, tax, and grand total alignment.
  - Barcode and QR Code generator (custom URLs, WiFi, loyalty coupons).
  - Customizable dividers: dashed, dotted, double-line, stars, and tear-off cut guides `✂`.
- 📐 **Dual Paper Widths**:
  - **58mm roll** (384 dots width - pocket printers, mini receipt rolls, X5h).
  - **80mm roll** (576 dots width - commercial POS counters, kitchens).
- 📡 **Universal Hardware Connectivity**:
  - **Web Bluetooth (BLE)**: Connect directly in Chrome, Edge, and Android without drivers.
  - **Web Serial / COM Port**: Direct communication over macOS/Windows paired Bluetooth SPP or USB-OTG.
  - **System Print / AirPrint**: Zero-margin continuous thermal spooling via native OS print dialogs.

---

## 🚀 Getting Started

### 1. Install & Run Locally

```bash
# Clone the repository
git clone https://github.com/zaryif/Thermal_printer.git
cd Thermal_printer

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📱 Multi-Platform Build & Packaging

### 🤖 Android (APK & Google Play)
Built with **Capacitor Android**:

```bash
# Build production web bundle and sync native project
npm run build
npm run cap:sync

# Open in Android Studio to build APK or run on connected Android device
npm run cap:android
```
> In Android Studio, go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)** to generate the release APK.

### 🍎 iOS (iPhone & iPad)
Built with **Capacitor iOS**:

```bash
# Build and sync native iOS workspace
npm run build
npm run cap:sync

# Open in Xcode
npm run cap:ios
```
> Select your connected iPhone or iPad in Xcode and press **Run (Cmd+R)**.

### 💻 Desktop (macOS & Windows)
Built with **Electron**:

```bash
# Launch desktop app locally
npm run electron:start

# Build macOS DMG and ZIP
npm run electron:mac

# Build Windows EXE installer (NSIS & Portable)
npm run electron:win
```
Outputs are placed into the `release/` folder.

---

## 🖨️ Tested Hardware & Bluetooth Configuration

- **X5 / X5h Pocket Thermal Printer** (58mm, 200 DPI, Bluetooth SPP/BLE)
- **Generic 58mm / 80mm ESC/POS Mini Printers** (POS-58, MPT-II, Cat Printers)
- **Default Bluetooth PIN**: `0000` or `1234`
- **Default Baud Rate**: `9600` or `115200`

---

## 📄 License
MIT License. Created by MD. ZARIF AZFAR.

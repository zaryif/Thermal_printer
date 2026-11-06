# Minimal OS — Design System & Architecture Specification
**Thermal Print Studio & Hardware OS**

---

## 1. Philosophy: The Distraction-Free Physical Typewriter
Minimal OS is designed around a single immutable truth: **The digital canvas is the physical paper**.

Traditional POS and receipt designer tools force the user into a fractured two-pane cognitive loop: inspecting miniature form fields in a bloated side drawer while trying to guess how the receipt will render. 

**Minimal OS eliminates this friction entirely:**
1. **Direct Paper WYSIWYG Manipulation:** There is no "edit mode" vs "view mode". The paper receipt on your screen is an active, tactile document. Click any text, title, date, agenda item, task, or table cell, and type directly.
2. **Brutalist Monochrome Aesthetic:** Designed for high-contrast OLED displays (deep `#050505` pitch blacks, `#18181b` tactile card surfaces, surgical `#27272a` borders) paired with pure `#fafaf9` thermal receipt paper with authentic micro-perforations and tear-off edges.
3. **Instant Template Drops:** One-click tactile chips (`+ Text`, `+ Title`, `+ Photo`, `+ Agenda`, `+ Todo`, `+ Table`, `+ QR`, `+ Feed`) drop pre-formatted functional blocks straight into the paper flow.
4. **Hardware-First Fidelity:** Every dot rendered on screen matches the exact 384-dot (58mm) or 576-dot (80mm) thermal print head geometry.

---

## 2. Color Palette & Surface Tokens

| Token | Hex / Value | Description & Intent |
|---|---|---|
| `--os-bg-void` | `#050505` | Absolute pitch black background for OLED screens |
| `--os-surface-base` | `#09090b` | Base panel and command bar background |
| `--os-surface-card` | `#18181b` | Elevated cards, chip buttons, and modal dialogs |
| `--os-surface-hover` | `#27272a` | Tactile interactive hover state |
| `--os-border-subtle` | `#27272a` | 1px clean razor border |
| `--os-border-active` | `#3f3f46` | Focused or selected border |
| `--os-accent-amber` | `#f59e0b` | Primary tactile action, print trigger, BLE link |
| `--os-accent-amber-glow`| `rgba(245, 158, 11, 0.15)` | Subtle ambient glow for active state |
| `--os-paper-base` | `#fafaf9` | Ultra-matte off-white thermal paper stock |
| `--os-paper-tear` | `#f0f0ed` | Thermal roll dispenser and bottom zigzag tear edge |
| `--os-thermal-ink` | `#000000` | Saturated, unanti-aliased pure black thermal dye |

---

## 3. Typography Matrix

Minimal OS includes 5 distinct typefaces calibrated for thermal dot-matrix print heads:

1. **Receipt Mono (`font-receipt-mono`):**
   - *Family:* `'Space Mono', 'Courier New', Courier, monospace`
   - *Characteristics:* Authentic 1980s POS cash register font. Strict monospace alignment, ideal for tables, totals, and timetables.
2. **Clean Modern Sans (`font-clean-sans`):**
   - *Family:* `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
   - *Characteristics:* Crisp, highly legible modern sans-serif. Perfect for daily agendas, reminders, and corporate schedules.
3. **Classic Editorial Serif (`font-classic-serif`):**
   - *Family:* `'Playfair Display', Georgia, Cambria, serif`
   - *Characteristics:* Elegant, high-contrast serif for quotes, certificates, invitations, and special commemorative prints.
4. **Retro 80s Terminal (`font-retro-terminal`):**
   - *Family:* `'VT323', 'Press Start 2P', monospace`
   - *Characteristics:* Chunky bitmap arcade font. Evokes vintage computer terminals and GameBoy thermal printers.
5. **Vintage Typewriter (`font-typewriter`):**
   - *Family:* `'Courier Prime', 'Courier New', monospace`
   - *Characteristics:* Mechanical strike aesthetic with slight imperfections, mimicking mechanical ribbons.

---

## 4. Tactile Interaction & Direct WYSIWYG Architecture

### 4.1 In-Place Text Editing (No Inspector Overhead)
Every block on the paper canvas renders its text fields with transparent, zero-border interactive inputs:
```tsx
<input
  type="text"
  value={block.title}
  onChange={(e) => updateBlock({ ...block, title: e.target.value })}
  className="w-full bg-transparent border border-transparent hover:border-dashed hover:border-stone-300 focus:border-stone-900 focus:bg-stone-50/60 rounded px-1 -mx-1 outline-none text-inherit font-inherit"
/>
```
- **Idle State:** Text looks 100% like printed receipt ink.
- **Hover State:** A faint dashed border invites editing.
- **Focus State:** Active cursor and subtle stone tint provide immediate tactile typing feedback.
- **Print Capture:** During rasterization, focus styling is transparent, capturing crisp black ink with zero visual artifacts.

### 4.2 Inline Block Extenders
- **Schedule Block:** Features an inline `+ Add Event` button to add new time slots directly inside the block on the paper.
- **Task List Block:** Features an inline `+ Add Task` button and one-tap checkbox toggling.
- **Table Block:** Features an inline `+ Add Row` button and direct cell-by-cell editing.
- **Feed Block:** Features inline `[-]` and `[+]` lines adjusters to precisely control tear-off margin.

---

## 5. Platform Architecture & Native Packaging

| Platform | Engine | Native Capabilities & Adaptations |
|---|---|---|
| **Android** | Capacitor 8.6 + Android SDK | Native Bluetooth LE (`@capacitor-community/bluetooth-le`), custom adaptive launch icons, custom splash screen, Google Calendar OAuth sign-in. Fullscreen tactile paper mode. |
| **macOS** | Electron 45 + Chromium | `hiddenInset` traffic light styling, native application menu with `Cmd+P` shortcut to print, `Cmd+N` for new canvas, trackpad pinch zoom, drag-friendly window chrome. |
| **Windows** | Electron 45 + Chromium | Dark titlebar chrome matching Windows 11 Fluent dark mode (`#09090b`), `Ctrl+P` native keyboard shortcut, serial/COM port and BLE support. |
| **Web PWA** | Vite + React 19 | Web Bluetooth API (`navigator.bluetooth`), Web Serial API, offline ServiceWorker caching, mobile responsive viewport. |

---

## 6. Hardware Print Pipeline (Tiny Print & ESC/POS)

1. **DOM Capture:** `html2canvas` captures the rendered paper at exact physical pixel width (384px for 58mm, 576px for 80mm).
2. **Adaptive Thresholding & Dithering:**
   - Text & Graphics: Adaptive binarization (`mean - 13`) for razor-sharp edges.
   - Photos: Atkinson / Floyd-Steinberg error-diffusion dithering for rich continuous halftones.
3. **Hardware Packet Framing (Tiny Print Protocol):**
   - Magic Header: `0x51 0x78`
   - Energy Level: Deepen Level 5 (9200) for saturated thermal black
   - Print Speed: 10
   - Bit Order: LSB-first
   - CRC8 Checksum: Calibrated polynomial `0x07`
   - Chunk Pacing: 50ms pacing between 128-byte packets to prevent thermal head FIFO overflow.

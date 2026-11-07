import 'package:flutter/material.dart';
import '../animations/app_motion.dart';

class MinimalCommandBar extends StatelessWidget {
  final Function(String) onAddBlock;

  const MinimalCommandBar({super.key, required this.onAddBlock});

  @override
  Widget build(BuildContext context) {
    // 12 Tools organized into 3 logical, immediately clickable rows (Zero scrolling required)
    // Ordered as requested: First Note, then Todo, then Schedule, then Expense, etc.
    final row1 = [
      {'type': 'text', 'label': 'Note', 'icon': Icons.edit_note_rounded, 'color': const Color(0xFF38BDF8)},
      {'type': 'tasklist', 'label': 'Todo', 'icon': Icons.check_circle_outline_rounded, 'color': const Color(0xFF10B981)},
      {'type': 'schedule', 'label': 'Schedule', 'icon': Icons.calendar_today_rounded, 'color': const Color(0xFFA78BFA)},
      {'type': 'expense', 'label': 'Expense', 'icon': Icons.receipt_long_rounded, 'color': const Color(0xFFF59E0B)},
    ];

    final row2 = [
      {'type': 'important', 'label': 'Alert', 'icon': Icons.priority_high_rounded, 'color': const Color(0xFFEF4444)},
      {'type': 'photo', 'label': 'Photo', 'icon': Icons.add_photo_alternate_rounded, 'color': const Color(0xFFF472B6)},
      {'type': 'quote', 'label': 'Quote', 'icon': Icons.format_quote_rounded, 'color': const Color(0xFFFBBF24)},
      {'type': 'qrcode', 'label': 'QR Code', 'icon': Icons.qr_code_2_rounded, 'color': const Color(0xFF2DD4BF)},
    ];

    final row3 = [
      {'type': 'header', 'label': 'Header', 'icon': Icons.title_rounded, 'color': const Color(0xFFE4E4E7)},
      {'type': 'table', 'label': 'Table', 'icon': Icons.table_chart_outlined, 'color': const Color(0xFFE4E4E7)},
      {'type': 'divider', 'label': 'Line', 'icon': Icons.horizontal_rule_rounded, 'color': const Color(0xFFE4E4E7)},
      {'type': 'gap', 'label': 'Gap', 'icon': Icons.height_rounded, 'color': const Color(0xFFE4E4E7)},
    ];

    return Container(
      width: double.infinity,
      color: const Color(0xFF09090B),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Row 1: Core Content & Planning (Todo, Note, Schedule, Expense)
          Row(
            children: [
              _buildToolButton(row1[0]),
              const SizedBox(width: 6),
              _buildToolButton(row1[1]),
              const SizedBox(width: 6),
              _buildToolButton(row1[2]),
              const SizedBox(width: 6),
              _buildToolButton(row1[3]),
            ],
          ),
          const SizedBox(height: 5),

          // Row 2: Visuals & Highlights (Photo, Alert, Quote, QR Code)
          Row(
            children: [
              _buildToolButton(row2[0]),
              const SizedBox(width: 6),
              _buildToolButton(row2[1]),
              const SizedBox(width: 6),
              _buildToolButton(row2[2]),
              const SizedBox(width: 6),
              _buildToolButton(row2[3]),
            ],
          ),
          const SizedBox(height: 5),

          // Row 3: Structure & Spacing (Header, Table, Line, Gap)
          Row(
            children: [
              _buildToolButton(row3[0]),
              const SizedBox(width: 6),
              _buildToolButton(row3[1]),
              const SizedBox(width: 6),
              _buildToolButton(row3[2]),
              const SizedBox(width: 6),
              _buildToolButton(row3[3]),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildToolButton(Map<String, dynamic> tool) {
    final color = tool['color'] as Color;
    return Expanded(
      child: TactilePressWidget(
        onTap: () => onAddBlock(tool['type'] as String),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 2),
          decoration: BoxDecoration(
            color: const Color(0xFF18181B),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(
              color: color.withValues(alpha: 0.35),
              width: 1,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(tool['icon'] as IconData, size: 12, color: color),
              const SizedBox(width: 4),
              Flexible(
                child: Text(
                  '+ ${tool['label']}',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: color,
                    letterSpacing: -0.2,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

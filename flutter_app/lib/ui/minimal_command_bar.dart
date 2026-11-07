import 'package:flutter/material.dart';
import '../animations/app_motion.dart';

class MinimalCommandBar extends StatelessWidget {
  final Function(String) onAddBlock;

  const MinimalCommandBar({super.key, required this.onAddBlock});

  @override
  Widget build(BuildContext context) {
    final tools = [
      {'type': 'expense', 'label': 'Expense', 'icon': Icons.account_balance_wallet_outlined},
      {'type': 'important', 'label': 'Important', 'icon': Icons.priority_high_rounded},
      {'type': 'text', 'label': 'Note', 'icon': Icons.notes_rounded},
      {'type': 'photo', 'label': 'Photo', 'icon': Icons.add_photo_alternate_outlined},
      {'type': 'quote', 'label': 'Quote', 'icon': Icons.format_quote_rounded},
      {'type': 'schedule', 'label': 'Schedule', 'icon': Icons.calendar_month_outlined},
      {'type': 'tasklist', 'label': 'Todo', 'icon': Icons.check_circle_outline},
      {'type': 'gap', 'label': 'Gap', 'icon': Icons.height_rounded},
      {'type': 'header', 'label': 'Header', 'icon': Icons.title},
      {'type': 'divider', 'label': 'Line', 'icon': Icons.horizontal_rule_rounded},
      {'type': 'qrcode', 'label': 'QR Code', 'icon': Icons.qr_code_2_rounded},
      {'type': 'table', 'label': 'Table', 'icon': Icons.table_chart_outlined},
    ];

    return Container(
      width: double.infinity,
      color: const Color(0xFF09090B),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: Row(
          children: tools.map((t) {
            final isHighlight = t['type'] == 'expense' || t['type'] == 'important';
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: TactilePressWidget(
                onTap: () => onAddBlock(t['type'] as String),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
                  decoration: BoxDecoration(
                    color: isHighlight
                        ? const Color(0xFFF59E0B).withValues(alpha: 0.12)
                        : const Color(0xFF18181B),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isHighlight
                          ? const Color(0xFFF59E0B).withValues(alpha: 0.5)
                          : const Color(0xFF27272A),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        t['icon'] as IconData,
                        size: 14,
                        color: isHighlight ? const Color(0xFFF59E0B) : const Color(0xFFF59E0B),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '+ ${t['label']}',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isHighlight ? const Color(0xFFF59E0B) : const Color(0xFFE4E4E7),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

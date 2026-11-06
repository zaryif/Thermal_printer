import 'package:flutter/material.dart';
import '../animations/app_motion.dart';

class MinimalCommandBar extends StatelessWidget {
  final Function(String) onAddBlock;

  const MinimalCommandBar({super.key, required this.onAddBlock});

  @override
  Widget build(BuildContext context) {
    final tools = [
      {'type': 'text', 'label': 'Text', 'icon': Icons.text_fields},
      {'type': 'header', 'label': 'Title', 'icon': Icons.title},
      {'type': 'schedule', 'label': 'Agenda', 'icon': Icons.schedule},
      {'type': 'tasklist', 'label': 'Todo', 'icon': Icons.check_circle_outline},
      {'type': 'table', 'label': 'Table', 'icon': Icons.table_chart_outlined},
      {'type': 'qrcode', 'label': 'QR Code', 'icon': Icons.qr_code},
      {'type': 'divider', 'label': 'Cut', 'icon': Icons.content_cut},
      {'type': 'feed', 'label': 'Feed', 'icon': Icons.arrow_downward},
    ];

    return Container(
      width: double.infinity,
      color: const Color(0xFF09090B),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: tools.map((t) {
            return Padding(
              padding: const EdgeInsets.only(right: 6),
              child: TactilePressWidget(
                onTap: () => onAddBlock(t['type'] as String),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF18181B),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF27272A)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(t['icon'] as IconData, size: 14, color: const Color(0xFFF59E0B)),
                      const SizedBox(width: 5),
                      Text(
                        '+ ${t['label']}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFFE4E4E7),
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

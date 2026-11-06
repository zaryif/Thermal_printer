import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../models/receipt_models.dart';

class ReceiptCanvas extends StatelessWidget {
  final GlobalKey receiptKey;
  final List<ReceiptBlock> blocks;
  final PaperWidth paperWidth;
  final ReceiptFontFamily fontFamily;
  final String? selectedBlockId;
  final Function(String) onSelectBlock;
  final Function(ReceiptBlock) onUpdateBlock;
  final Function(String, String) onMoveBlock;
  final Function(String) onDeleteBlock;
  final VoidCallback onAddEventToSchedule;
  final VoidCallback onAddTaskToTodo;

  const ReceiptCanvas({
    super.key,
    required this.receiptKey,
    required this.blocks,
    required this.paperWidth,
    required this.fontFamily,
    required this.selectedBlockId,
    required this.onSelectBlock,
    required this.onUpdateBlock,
    required this.onMoveBlock,
    required this.onDeleteBlock,
    required this.onAddEventToSchedule,
    required this.onAddTaskToTodo,
  });

  TextStyle getBaseTextStyle({
    double fontSize = 13.0,
    FontWeight fontWeight = FontWeight.normal,
    Color color = const Color(0xFF09090B),
  }) {
    switch (fontFamily) {
      case ReceiptFontFamily.mono:
        return GoogleFonts.spaceMono(
          fontSize: fontSize,
          fontWeight: fontWeight,
          color: color,
        );
      case ReceiptFontFamily.sans:
        return GoogleFonts.inter(
          fontSize: fontSize,
          fontWeight: fontWeight,
          color: color,
        );
      case ReceiptFontFamily.serif:
        return GoogleFonts.playfairDisplay(
          fontSize: fontSize,
          fontWeight: fontWeight,
          color: color,
        );
      case ReceiptFontFamily.terminal:
        return GoogleFonts.vt323(
          fontSize: fontSize + 2.0,
          fontWeight: fontWeight,
          color: color,
        );
      case ReceiptFontFamily.typewriter:
        return GoogleFonts.courierPrime(
          fontSize: fontSize,
          fontWeight: fontWeight,
          color: color,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final double maxPaperWidth = paperWidth == PaperWidth.mm58 ? 384.0 : 576.0;

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
        child: Column(
          children: [
            // Top paper roll visual feed dispenser
            Container(
              width: maxPaperWidth > 420 ? 420 : maxPaperWidth,
              height: 10,
              decoration: BoxDecoration(
                color: const Color(0xFF18181B),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
                border: Border.all(color: const Color(0xFF27272A)),
              ),
              child: Center(
                child: Container(
                  width: 120,
                  height: 3,
                  decoration: BoxDecoration(
                    color: const Color(0xFF09090B),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
            ),

            // Live RepaintBoundary: Captured directly to monochrome bitmap for printing
            RepaintBoundary(
              key: receiptKey,
              child: Container(
                width: maxPaperWidth,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                decoration: BoxDecoration(
                  color: const Color(0xFFFAFAF9), // Off-white thermal stock
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.4),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (blocks.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 48),
                        child: Column(
                          children: [
                            Icon(Icons.receipt_long, size: 40, color: Colors.grey.shade400),
                            const SizedBox(height: 8),
                            Text(
                              'EMPTY RECEIPT',
                              style: getBaseTextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey.shade500,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Tap any template block below to start typing directly',
                              style: getBaseTextStyle(fontSize: 11, color: Colors.grey.shade400),
                            ),
                          ],
                        ),
                      )
                    else
                      ...blocks.asMap().entries.map((entry) {
                        final int index = entry.key;
                        final ReceiptBlock block = entry.value;
                        final bool isSelected = block.id == selectedBlockId;

                        return GestureDetector(
                          onTap: () => onSelectBlock(block.id),
                          child: Container(
                            margin: const EdgeInsets.symmetric(vertical: 3),
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? const Color(0xFFF59E0B).withValues(alpha: 0.08)
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(
                                color: isSelected
                                    ? const Color(0xFFF59E0B).withValues(alpha: 0.6)
                                    : Colors.transparent,
                              ),
                            ),
                            child: Stack(
                              clipBehavior: Clip.none,
                              children: [
                                _buildBlockContent(block),

                                // Block action overlay when selected
                                if (isSelected)
                                  Positioned(
                                    top: -12,
                                    right: 0,
                                    child: Material(
                                      color: const Color(0xFF18181B),
                                      borderRadius: BorderRadius.circular(6),
                                      elevation: 4,
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            if (index > 0)
                                              InkWell(
                                                onTap: () => onMoveBlock(block.id, 'up'),
                                                child: const Padding(
                                                  padding: EdgeInsets.all(2),
                                                  child: Icon(Icons.arrow_upward, size: 14, color: Colors.amber),
                                                ),
                                              ),
                                            if (index < blocks.length - 1)
                                              InkWell(
                                                onTap: () => onMoveBlock(block.id, 'down'),
                                                child: const Padding(
                                                  padding: EdgeInsets.all(2),
                                                  child: Icon(Icons.arrow_downward, size: 14, color: Colors.amber),
                                                ),
                                              ),
                                            InkWell(
                                              onTap: () => onDeleteBlock(block.id),
                                              child: const Padding(
                                                padding: EdgeInsets.all(2),
                                                child: Icon(Icons.delete_outline, size: 14, color: Colors.redAccent),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        );
                      }),
                  ],
                ),
              ),
            ),

            // Bottom zigzag tear-off effect
            Container(
              width: maxPaperWidth,
              height: 12,
              decoration: const BoxDecoration(
                color: Color(0xFFF0F0ED),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(4)),
              ),
              child: Center(
                child: Text(
                  '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -',
                  style: getBaseTextStyle(fontSize: 10, color: Colors.grey.shade500),
                  overflow: TextOverflow.clip,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBlockContent(ReceiptBlock block) {
    if (block is HeaderBlock) {
      return Column(
        children: [
          TextFormField(
            initialValue: block.title,
            textAlign: TextAlign.center,
            style: getBaseTextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            decoration: const InputDecoration(
              isDense: true,
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(vertical: 2),
            ),
            onChanged: (val) {
              block.title = val;
              onUpdateBlock(block);
            },
          ),
          TextFormField(
            initialValue: block.subtitle,
            textAlign: TextAlign.center,
            style: getBaseTextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.grey.shade700),
            decoration: const InputDecoration(
              isDense: true,
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(vertical: 1),
            ),
            onChanged: (val) {
              block.subtitle = val;
              onUpdateBlock(block);
            },
          ),
          TextFormField(
            initialValue: block.dateStr,
            textAlign: TextAlign.center,
            style: getBaseTextStyle(fontSize: 10, color: Colors.grey.shade600),
            decoration: const InputDecoration(
              isDense: true,
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(vertical: 1),
            ),
            onChanged: (val) {
              block.dateStr = val;
              onUpdateBlock(block);
            },
          ),
          const Divider(thickness: 1, color: Colors.black26),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: TextFormField(
                  initialValue: block.metaLeft,
                  style: getBaseTextStyle(fontSize: 10, fontWeight: FontWeight.w600),
                  decoration: const InputDecoration(
                    isDense: true,
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.zero,
                  ),
                  onChanged: (val) {
                    block.metaLeft = val;
                    onUpdateBlock(block);
                  },
                ),
              ),
              Expanded(
                child: TextFormField(
                  initialValue: block.metaRight,
                  textAlign: TextAlign.right,
                  style: getBaseTextStyle(fontSize: 10, fontWeight: FontWeight.w600),
                  decoration: const InputDecoration(
                    isDense: true,
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.zero,
                  ),
                  onChanged: (val) {
                    block.metaRight = val;
                    onUpdateBlock(block);
                  },
                ),
              ),
            ],
          ),
        ],
      );
    }

    if (block is TextBlock) {
      return Container(
        color: block.inverted ? Colors.black : Colors.transparent,
        padding: block.inverted ? const EdgeInsets.all(4) : EdgeInsets.zero,
        child: TextFormField(
          initialValue: block.text,
          maxLines: null,
          textAlign: block.align,
          style: getBaseTextStyle(
            fontSize: block.fontSize,
            fontWeight: block.bold ? FontWeight.bold : FontWeight.normal,
            color: block.inverted ? Colors.white : const Color(0xFF09090B),
          ),
          decoration: const InputDecoration(
            isDense: true,
            border: InputBorder.none,
            contentPadding: EdgeInsets.symmetric(vertical: 2),
          ),
          onChanged: (val) {
            block.text = val;
            onUpdateBlock(block);
          },
        ),
      );
    }

    if (block is ScheduleBlock) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: TextFormField(
                  initialValue: block.title,
                  style: getBaseTextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  decoration: const InputDecoration(
                    isDense: true,
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(vertical: 2),
                  ),
                  onChanged: (val) {
                    block.title = val;
                    onUpdateBlock(block);
                  },
                ),
              ),
              SizedBox(
                width: 90,
                child: TextFormField(
                  initialValue: block.date,
                  textAlign: TextAlign.right,
                  style: getBaseTextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.grey.shade700),
                  decoration: const InputDecoration(
                    isDense: true,
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(vertical: 2),
                  ),
                  onChanged: (val) {
                    block.date = val;
                    onUpdateBlock(block);
                  },
                ),
              ),
            ],
          ),
          const Divider(thickness: 1.5, color: Colors.black87),
          ...block.items.map((item) {
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 2),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      item.done = !item.done;
                      onUpdateBlock(block);
                    },
                    child: Icon(
                      item.done ? Icons.check_box : Icons.check_box_outline_blank,
                      size: 16,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: TextFormField(
                      initialValue: item.title,
                      style: getBaseTextStyle(
                        fontSize: 11,
                        color: item.done ? Colors.grey.shade400 : Colors.black87,
                      ).copyWith(
                        decoration: item.done ? TextDecoration.lineThrough : null,
                      ),
                      decoration: const InputDecoration(
                        isDense: true,
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.zero,
                      ),
                      onChanged: (val) {
                        item.title = val;
                        onUpdateBlock(block);
                      },
                    ),
                  ),
                  SizedBox(
                    width: 70,
                    child: TextFormField(
                      initialValue: item.time,
                      textAlign: TextAlign.right,
                      style: getBaseTextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey.shade700),
                      decoration: const InputDecoration(
                        isDense: true,
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.zero,
                      ),
                      onChanged: (val) {
                        item.time = val;
                        onUpdateBlock(block);
                      },
                    ),
                  ),
                ],
              ),
            );
          }),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton.icon(
              onPressed: () {
                block.items.add(
                  ScheduleItem(
                    id: DateTime.now().millisecondsSinceEpoch.toString(),
                    time: '12:00 PM',
                    title: 'New Agenda Event',
                  ),
                );
                onUpdateBlock(block);
              },
              icon: const Icon(Icons.add, size: 14, color: Colors.black54),
              label: Text('+ Add Event', style: getBaseTextStyle(fontSize: 10, color: Colors.black54)),
              style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(50, 24)),
            ),
          ),
        ],
      );
    }

    if (block is TodoListBlock) {
      final int completed = block.items.where((i) => i.done).length;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: TextFormField(
                  initialValue: block.title,
                  style: getBaseTextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  decoration: const InputDecoration(
                    isDense: true,
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(vertical: 2),
                  ),
                  onChanged: (val) {
                    block.title = val;
                    onUpdateBlock(block);
                  },
                ),
              ),
              Text(
                '$completed/${block.items.length}',
                style: getBaseTextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey.shade600),
              ),
            ],
          ),
          const Divider(thickness: 1, color: Colors.black87),
          ...block.items.map((task) {
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 2),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      task.done = !task.done;
                      onUpdateBlock(block);
                    },
                    child: Icon(
                      task.done ? Icons.check_box : Icons.check_box_outline_blank,
                      size: 16,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: TextFormField(
                      initialValue: task.text,
                      style: getBaseTextStyle(
                        fontSize: 11,
                        color: task.done ? Colors.grey.shade400 : Colors.black87,
                      ).copyWith(
                        decoration: task.done ? TextDecoration.lineThrough : null,
                      ),
                      decoration: const InputDecoration(
                        isDense: true,
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.zero,
                      ),
                      onChanged: (val) {
                        task.text = val;
                        onUpdateBlock(block);
                      },
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      task.isHighPriority = !task.isHighPriority;
                      onUpdateBlock(block);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                      decoration: BoxDecoration(
                        color: task.isHighPriority ? Colors.black : Colors.transparent,
                        borderRadius: BorderRadius.circular(2),
                        border: Border.all(color: Colors.black),
                      ),
                      child: Text(
                        task.isHighPriority ? 'HIGH' : 'LOW',
                        style: TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.bold,
                          color: task.isHighPriority ? Colors.white : Colors.black,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton.icon(
              onPressed: () {
                block.items.add(
                  TodoItem(
                    id: DateTime.now().millisecondsSinceEpoch.toString(),
                    text: 'New checklist task',
                  ),
                );
                onUpdateBlock(block);
              },
              icon: const Icon(Icons.add, size: 14, color: Colors.black54),
              label: Text('+ Add Task', style: getBaseTextStyle(fontSize: 10, color: Colors.black54)),
              style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(50, 24)),
            ),
          ),
        ],
      );
    }

    if (block is TableBlock) {
      return Column(
        children: [
          Row(
            children: [
              Expanded(
                flex: 3,
                child: TextFormField(
                  initialValue: block.headers[0],
                  style: getBaseTextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                  decoration: const InputDecoration(isDense: true, border: InputBorder.none),
                  onChanged: (val) {
                    block.headers[0] = val;
                    onUpdateBlock(block);
                  },
                ),
              ),
              Expanded(
                flex: 1,
                child: TextFormField(
                  initialValue: block.headers[1],
                  textAlign: TextAlign.center,
                  style: getBaseTextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                  decoration: const InputDecoration(isDense: true, border: InputBorder.none),
                  onChanged: (val) {
                    block.headers[1] = val;
                    onUpdateBlock(block);
                  },
                ),
              ),
              Expanded(
                flex: 2,
                child: TextFormField(
                  initialValue: block.headers[2],
                  textAlign: TextAlign.right,
                  style: getBaseTextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                  decoration: const InputDecoration(isDense: true, border: InputBorder.none),
                  onChanged: (val) {
                    block.headers[2] = val;
                    onUpdateBlock(block);
                  },
                ),
              ),
            ],
          ),
          const Divider(thickness: 1, color: Colors.black87),
          ...block.rows.map((row) {
            return Row(
              children: [
                Expanded(
                  flex: 3,
                  child: TextFormField(
                    initialValue: row[0],
                    style: getBaseTextStyle(fontSize: 11),
                    decoration: const InputDecoration(isDense: true, border: InputBorder.none),
                    onChanged: (val) {
                      row[0] = val;
                      onUpdateBlock(block);
                    },
                  ),
                ),
                Expanded(
                  flex: 1,
                  child: TextFormField(
                    initialValue: row[1],
                    textAlign: TextAlign.center,
                    style: getBaseTextStyle(fontSize: 11),
                    decoration: const InputDecoration(isDense: true, border: InputBorder.none),
                    onChanged: (val) {
                      row[1] = val;
                      onUpdateBlock(block);
                    },
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: TextFormField(
                    initialValue: row[2],
                    textAlign: TextAlign.right,
                    style: getBaseTextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                    decoration: const InputDecoration(isDense: true, border: InputBorder.none),
                    onChanged: (val) {
                      row[2] = val;
                      onUpdateBlock(block);
                    },
                  ),
                ),
              ],
            );
          }),
          const Divider(thickness: 1.5, color: Colors.black),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: TextFormField(
                  initialValue: block.totalLabel,
                  style: getBaseTextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  decoration: const InputDecoration(isDense: true, border: InputBorder.none),
                  onChanged: (val) {
                    block.totalLabel = val;
                    onUpdateBlock(block);
                  },
                ),
              ),
              SizedBox(
                width: 90,
                child: TextFormField(
                  initialValue: block.totalValue,
                  textAlign: TextAlign.right,
                  style: getBaseTextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  decoration: const InputDecoration(isDense: true, border: InputBorder.none),
                  onChanged: (val) {
                    block.totalValue = val;
                    onUpdateBlock(block);
                  },
                ),
              ),
            ],
          ),
        ],
      );
    }

    if (block is QrCodeBlock) {
      return Center(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              color: Colors.white,
              child: QrImageView(
                data: block.data,
                version: QrVersions.auto,
                size: block.size,
              ),
            ),
            const SizedBox(height: 4),
            TextFormField(
              initialValue: block.data,
              textAlign: TextAlign.center,
              style: getBaseTextStyle(fontSize: 10, color: Colors.grey.shade600),
              decoration: const InputDecoration(isDense: true, border: InputBorder.none),
              onChanged: (val) {
                block.data = val;
                onUpdateBlock(block);
              },
            ),
            TextFormField(
              initialValue: block.label,
              textAlign: TextAlign.center,
              style: getBaseTextStyle(fontSize: 10, fontWeight: FontWeight.bold),
              decoration: const InputDecoration(isDense: true, border: InputBorder.none),
              onChanged: (val) {
                block.label = val;
                onUpdateBlock(block);
              },
            ),
          ],
        ),
      );
    }

    if (block is DividerBlock) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Text(
          block.style == 'stars'
              ? '* * * * * * * * * * * * * * * * * * *'
              : '- - - - - - - - - ✂ - - - - - - - - -',
          textAlign: TextAlign.center,
          style: getBaseTextStyle(fontSize: 11, fontWeight: FontWeight.bold),
        ),
      );
    }

    if (block is FeedBlock) {
      return SizedBox(
        height: (block.lines * 16.0).clamp(24.0, 160.0),
        child: Center(
          child: Text(
            '-- FEED / TEAR SPACE (${block.lines} lines) --',
            style: getBaseTextStyle(fontSize: 9, color: Colors.grey.shade400),
          ),
        ),
      );
    }

    return const SizedBox();
  }
}

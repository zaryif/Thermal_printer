import 'package:flutter/material.dart';

enum PaperWidth {
  mm58, // 384 dots
  mm80, // 576 dots
}

extension PaperWidthExt on PaperWidth {
  int get dots => this == PaperWidth.mm58 ? 384 : 576;
  String get label => this == PaperWidth.mm58 ? '58mm' : '80mm';
}

enum ReceiptFontFamily {
  mono,
  sans,
  serif,
  terminal,
  typewriter,
}

abstract class ReceiptBlock {
  final String id;
  final String type;

  ReceiptBlock({required this.id, required this.type});

  Map<String, dynamic> toJson();
}

class HeaderBlock extends ReceiptBlock {
  String title;
  String subtitle;
  String dateStr;
  String metaLeft;
  String metaRight;

  HeaderBlock({
    required super.id,
    this.title = 'DAILY AGENDA',
    this.subtitle = 'PRODUCTIVITY & FOCUS',
    this.dateStr = '',
    this.metaLeft = 'TARGET: 100%',
    this.metaRight = 'PRIORITY: HIGH',
  }) : super(type: 'header');

  @override
  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'title': title,
        'subtitle': subtitle,
        'dateStr': dateStr,
        'metaLeft': metaLeft,
        'metaRight': metaRight,
      };
}

class TextBlock extends ReceiptBlock {
  String text;
  double fontSize;
  TextAlign align;
  bool bold;
  bool inverted;

  TextBlock({
    required super.id,
    this.text = 'Tap here to write your note, quote, or reminder directly on the paper.',
    this.fontSize = 13.0,
    this.align = TextAlign.left,
    this.bold = false,
    this.inverted = false,
  }) : super(type: 'text');

  @override
  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'text': text,
        'fontSize': fontSize,
        'align': align.name,
        'bold': bold,
        'inverted': inverted,
      };
}

class ScheduleItem {
  String id;
  String time;
  String title;
  bool done;

  ScheduleItem({
    required this.id,
    required this.time,
    required this.title,
    this.done = false,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'time': time,
        'title': title,
        'done': done,
      };
}

class ScheduleBlock extends ReceiptBlock {
  String title;
  String date;
  List<ScheduleItem> items;

  ScheduleBlock({
    required super.id,
    this.title = 'GOOGLE CALENDAR AGENDA',
    required this.date,
    required this.items,
  }) : super(type: 'schedule');

  @override
  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'title': title,
        'date': date,
        'items': items.map((e) => e.toJson()).toList(),
      };
}

class TodoItem {
  String id;
  String text;
  bool done;
  bool isHighPriority;

  TodoItem({
    required this.id,
    required this.text,
    this.done = false,
    this.isHighPriority = false,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'text': text,
        'done': done,
        'isHighPriority': isHighPriority,
      };
}

class TodoListBlock extends ReceiptBlock {
  String title;
  List<TodoItem> items;

  TodoListBlock({
    required super.id,
    this.title = 'PRIORITY CHECKLIST',
    required this.items,
  }) : super(type: 'tasklist');

  @override
  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'title': title,
        'items': items.map((e) => e.toJson()).toList(),
      };
}

class TableBlock extends ReceiptBlock {
  List<String> headers;
  List<List<String>> rows;
  String totalLabel;
  String totalValue;

  TableBlock({
    required super.id,
    required this.headers,
    required this.rows,
    this.totalLabel = 'TOTAL',
    this.totalValue = '\$0.00',
  }) : super(type: 'table');

  @override
  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'headers': headers,
        'rows': rows,
        'totalLabel': totalLabel,
        'totalValue': totalValue,
      };
}

class QrCodeBlock extends ReceiptBlock {
  String data;
  double size;
  String label;

  QrCodeBlock({
    required super.id,
    this.data = 'https://calendar.google.com',
    this.size = 120.0,
    this.label = 'SCAN FOR DETAILS',
  }) : super(type: 'qrcode');

  @override
  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'data': data,
        'size': size,
        'label': label,
      };
}

class DividerBlock extends ReceiptBlock {
  String style; // dashed, dotted, solid, double, stars, cut

  DividerBlock({
    required super.id,
    this.style = 'dashed',
  }) : super(type: 'divider');

  @override
  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'style': style,
      };
}

class FeedBlock extends ReceiptBlock {
  int lines;

  FeedBlock({
    required super.id,
    this.lines = 3,
  }) : super(type: 'feed');

  @override
  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'lines': lines,
      };
}

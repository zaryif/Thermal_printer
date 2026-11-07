import 'package:flutter_test/flutter_test.dart';
import 'package:thermal_studio/main.dart';

void main() {
  testWidgets('ThermalStudioApp basic smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const ThermalStudioApp());
    expect(find.byType(ThermalStudioApp), findsOneWidget);
  });
}

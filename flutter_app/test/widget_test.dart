import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:thermal_studio/main.dart';

void main() {
  testWidgets('ThermalStudioApp basic smoke test', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({'has_seen_onboarding_v1': true});
    await tester.pumpWidget(const ThermalStudioApp());
    expect(find.byType(ThermalStudioApp), findsOneWidget);
  });
}

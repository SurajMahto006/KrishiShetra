import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:krishishetra_mobile/app/app.dart';

void main() {
  testWidgets('App starts and renders without crashing', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: KrishiShetraApp()));
    // App renders — it starts on splash screen
    await tester.pump(const Duration(milliseconds: 100));
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}

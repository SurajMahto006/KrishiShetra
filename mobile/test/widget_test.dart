import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:krishishetra_mobile/features/auth/screens/login_screen.dart';

void main() {
  testWidgets('LoginScreen renders phone input and send OTP button', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: LoginScreen(),
        ),
      ),
    );

    await tester.pump(const Duration(milliseconds: 700));

    expect(find.text('Enter Mobile Number'), findsOneWidget);
    expect(find.text('Send OTP'), findsOneWidget);
    expect(find.byType(TextField), findsOneWidget);
  });
}

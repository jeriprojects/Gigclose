import 'package:flutter_test/flutter_test.dart';
import 'package:gigsclose_mobile/main.dart';

void main() {
  testWidgets('app renders navigation shell', (tester) async {
    await tester.pumpWidget(const GigsCloseApp());

    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Explore'), findsOneWidget);
    expect(find.text('Account'), findsOneWidget);
  });
}

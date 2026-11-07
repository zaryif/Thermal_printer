import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class OnboardingDialog extends StatelessWidget {
  const OnboardingDialog({super.key});

  static const String prefKey = 'has_seen_onboarding_v1';

  static Future<bool> shouldShow() async {
    final prefs = await SharedPreferences.getInstance();
    return !(prefs.getBool(prefKey) ?? false);
  }

  static Future<void> markCompleted() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(prefKey, true);
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF121215),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFF27272A)),
      ),
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 420),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              const Text(
                'Thermi',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Your Thermal Printer Solution',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFFA1A1AA),
                ),
              ),
              const SizedBox(height: 20),
              const Divider(height: 1, color: Color(0xFF27272A)),
              const SizedBox(height: 20),

              // Step 1
              _buildStepRow(
                icon: Icons.bluetooth_searching_rounded,
                title: 'Universal Bluetooth Connect',
                description: 'Instant zero-driver discovery and pairing for Tiny Print, Cat, and standard ESC/POS printers.',
              ),
              const SizedBox(height: 16),

              // Step 2
              _buildStepRow(
                icon: Icons.auto_awesome_mosaic_outlined,
                title: 'Executive Modular Canvas',
                description: 'Compose Daily Agendas, Action Protocols, Financial Ledgers, and Photos that fit your screen perfectly.',
              ),
              const SizedBox(height: 16),

              // Step 3
              _buildStepRow(
                icon: Icons.print_rounded,
                title: 'Calibrated High-Density Burn',
                description: 'Hardware-calibrated 1.15 contrast with 177-byte FIFO pacing for razor-sharp pitch-black output.',
              ),
              const SizedBox(height: 24),

              // Get Started Button
              ElevatedButton(
                onPressed: () async {
                  await markCompleted();
                  if (context.mounted) {
                    Navigator.of(context).pop();
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFF59E0B),
                  foregroundColor: const Color(0xFF09090B),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Get Started',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepRow({
    required IconData icon,
    required String title,
    required String description,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: const Color(0xFF18181B),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFF27272A)),
          ),
          child: Icon(icon, size: 18, color: const Color(0xFFF59E0B)),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                description,
                style: const TextStyle(
                  fontSize: 11,
                  color: Color(0xFFA1A1AA),
                  height: 1.35,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

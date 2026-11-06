import 'package:flutter/material.dart';

/// Minimal OS Motion & UI Animation System
/// Based on specifications from agent-skills/ui-animation (mblode)
class AppMotion {
  // Named Curves from ui-animation standard
  static const Curve enterCurve = Cubic(0.22, 1.0, 0.36, 1.0);
  static const Curve moveCurve = Cubic(0.25, 1.0, 0.5, 1.0);
  static const Curve pressCurve = Cubic(0.25, 0.46, 0.45, 0.94);
  static const Curve expoOut = Cubic(0.19, 1.0, 0.22, 1.0);
  static const Curve paperFeedCurve = Cubic(0.16, 1.0, 0.3, 1.0);

  // Standard Durations
  static const Duration pressDuration = Duration(milliseconds: 120);
  static const Duration quickFeedback = Duration(milliseconds: 160);
  static const Duration slideDuration = Duration(milliseconds: 240);
  static const Duration modalDuration = Duration(milliseconds: 280);
}

/// Tactile interactive button widget with physical spring press feedback
/// Follows rule: "Tappable controls press on active at 0ms and release at 120ms"
class TactilePressWidget extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final double pressScale;

  const TactilePressWidget({
    super.key,
    required this.child,
    this.onTap,
    this.pressScale = 0.96,
  });

  @override
  State<TactilePressWidget> createState() => _TactilePressWidgetState();
}

class _TactilePressWidgetState extends State<TactilePressWidget> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) {
        if (widget.onTap != null) {
          setState(() => _isPressed = true);
        }
      },
      onTapUp: (_) {
        if (widget.onTap != null) {
          setState(() => _isPressed = false);
          widget.onTap!();
        }
      },
      onTapCancel: () {
        if (_isPressed) setState(() => _isPressed = false);
      },
      child: AnimatedScale(
        scale: _isPressed ? widget.pressScale : 1.0,
        duration: AppMotion.pressDuration,
        curve: AppMotion.pressCurve,
        child: widget.child,
      ),
    );
  }
}

/// Smooth paper feed entrance animation
/// Follows rule: "Movement: transform and opacity only; skip layout and paint"
class PaperFeedEntrance extends StatefulWidget {
  final Widget child;
  final Duration delay;

  const PaperFeedEntrance({
    super.key,
    required this.child,
    this.delay = Duration.zero,
  });

  @override
  State<PaperFeedEntrance> createState() => _PaperFeedEntranceState();
}

class _PaperFeedEntranceState extends State<PaperFeedEntrance>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fadeAnimation;
  late final Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 280),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: AppMotion.enterCurve,
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, -0.05), // Natural downwards paper feed motion
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: AppMotion.paperFeedCurve,
    ));

    if (widget.delay == Duration.zero) {
      _controller.forward();
    } else {
      Future.delayed(widget.delay, () {
        if (mounted) _controller.forward();
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: widget.child,
      ),
    );
  }
}

/// In-place action confirmation button
/// Follows rule: "Confirm in place, not in a corner. The action's result belongs on the control that caused it"
class InPlaceConfirmButton extends StatelessWidget {
  final String label;
  final String successLabel;
  final String loadingLabel;
  final IconData icon;
  final IconData successIcon;
  final bool isLoading;
  final bool isSuccess;
  final VoidCallback? onTap;

  const InPlaceConfirmButton({
    super.key,
    required this.label,
    this.successLabel = 'Done ✓',
    this.loadingLabel = 'Streaming...',
    required this.icon,
    this.successIcon = Icons.check_circle_outline,
    this.isLoading = false,
    this.isSuccess = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return TactilePressWidget(
      onTap: isLoading ? null : onTap,
      child: AnimatedContainer(
        duration: AppMotion.quickFeedback,
        curve: AppMotion.enterCurve,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSuccess
              ? const Color(0xFF10B981) // Emerald success
              : (isLoading ? const Color(0xFF27272A) : const Color(0xFFF59E0B)),
          borderRadius: BorderRadius.circular(8),
          boxShadow: isSuccess || isLoading
              ? []
              : [
                  BoxShadow(
                    color: const Color(0xFFF59E0B).withValues(alpha: 0.25),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: AnimatedSwitcher(
          duration: AppMotion.quickFeedback,
          switchInCurve: AppMotion.enterCurve,
          switchOutCurve: AppMotion.pressCurve,
          child: Row(
            key: ValueKey<String>('${isLoading}_$isSuccess'),
            mainAxisSize: MainAxisSize.min,
            children: [
              if (isLoading)
                const SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                )
              else
                Icon(
                  isSuccess ? successIcon : icon,
                  size: 15,
                  color: isSuccess ? Colors.white : const Color(0xFF09090B),
                ),
              const SizedBox(width: 6),
              Text(
                isLoading ? loadingLabel : (isSuccess ? successLabel : label),
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isSuccess || isLoading ? Colors.white : const Color(0xFF09090B),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

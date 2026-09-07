import 'package:flutter/material.dart';
import '../../app/theme/app_colors.dart';

class TimelineStep {
  final String label;
  final TimelineStepStatus status;
  const TimelineStep({required this.label, required this.status});
}

enum TimelineStepStatus { completed, active, pending }

class ProgressTimeline extends StatelessWidget {
  final List<TimelineStep> steps;

  const ProgressTimeline({super.key, required this.steps});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(steps.length, (i) {
        final step = steps[i];
        final isLast = i == steps.length - 1;

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Node + connector
            SizedBox(
              width: 32,
              child: Column(
                children: [
                  _buildNode(step.status),
                  if (!isLast)
                    Container(
                      width: 2,
                      height: 36,
                      color: step.status == TimelineStepStatus.completed
                          ? AppColors.sage
                          : AppColors.borderDash,
                    ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Padding(
                padding: EdgeInsets.only(bottom: isLast ? 0 : 36, top: 2),
                child: Text(
                  step.label,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: step.status == TimelineStepStatus.active
                        ? FontWeight.w700
                        : FontWeight.w500,
                    color: switch (step.status) {
                      TimelineStepStatus.completed => AppColors.evergreen,
                      TimelineStepStatus.active    => AppColors.sage,
                      TimelineStepStatus.pending   => AppColors.textMutedDash,
                    },
                  ),
                ),
              ),
            ),
          ],
        );
      }),
    );
  }

  Widget _buildNode(TimelineStepStatus status) {
    switch (status) {
      case TimelineStepStatus.completed:
        return Container(
          width: 24,
          height: 24,
          decoration: const BoxDecoration(
            color: AppColors.sage,
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.check, size: 14, color: Colors.white),
        );
      case TimelineStepStatus.active:
        return Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.sage, width: 2.5),
          ),
          child: Center(
            child: Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: AppColors.sage,
                shape: BoxShape.circle,
              ),
            ),
          ),
        );
      case TimelineStepStatus.pending:
        return Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.borderDash, width: 2),
          ),
        );
    }
  }
}

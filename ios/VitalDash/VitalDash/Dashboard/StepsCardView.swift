import SwiftUI

// A circular progress ring toward STEPS_GOAL. Simplified from the web
// app's custom 240° SVG arc gauge (StepsDialCard.tsx) to a standard full
// SwiftUI ring — same idea (today's steps vs. goal), simpler geometry.
struct StepsCardView: View {
    let entries: [Entry]

    private var todaySteps: Int? {
        entries.first(where: { $0.date == todayISO() })?.steps
    }

    var body: some View {
        VDCard {
            VDEyebrow(text: "STEPS · TODAY")

            let steps = todaySteps ?? 0
            let hasData = todaySteps != nil
            let pct = min(1, max(0, Double(steps) / Double(stepsGoal)))
            let goalHit = hasData && steps >= stepsGoal

            HStack {
                Spacer(minLength: 0)
                ZStack {
                    Circle()
                        .stroke(VDColor.surface2, lineWidth: 14)
                    Circle()
                        .trim(from: 0, to: pct)
                        .stroke(VDColor.steps, style: StrokeStyle(lineWidth: 14, lineCap: .round))
                        .rotationEffect(.degrees(-90))

                    VStack(spacing: 3) {
                        Text(steps, format: .number)
                            .font(.system(size: 24, weight: .heavy))
                            .foregroundStyle(VDColor.ink)

                        if !hasData {
                            Text("No steps yet")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundStyle(VDColor.inkMuted)
                        } else if goalHit {
                            Label("Goal reached", systemImage: "checkmark")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundStyle(VDColor.statusGood)
                        } else {
                            Text("\(Int(pct * 100))% of goal")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundStyle(VDColor.inkMuted)
                        }
                    }
                }
                .frame(width: 150, height: 150)
                Spacer(minLength: 0)
            }
        }
    }
}

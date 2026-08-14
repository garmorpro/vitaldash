import SwiftUI
import Charts

struct WeightStatCardView: View {
    let entries: [Entry]

    private var weightEntries: [Entry] {
        entries.filter { $0.weightLbs != nil }.sorted { $0.date < $1.date }
    }

    var body: some View {
        VDCard {
            VDEyebrow(text: "WEIGHT")

            if let latest = weightEntries.last, let latestWeight = latest.weightLbs {
                HStack(alignment: .lastTextBaseline, spacing: 6) {
                    Text(latestWeight, format: .number.precision(.fractionLength(1)))
                        .font(.system(size: 32, weight: .heavy))
                        .foregroundStyle(VDColor.ink)
                    Text("lb")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(VDColor.inkMuted)
                }

                // Ongoing total change since the very first logged entry —
                // matches the web app's WeightStatCard.
                if weightEntries.count > 1, let first = weightEntries.first?.weightLbs {
                    let delta = latestWeight - first
                    VDPill(
                        text: String(format: "%.1f lb total", abs(delta)),
                        systemImage: delta <= 0 ? "arrow.down" : "arrow.up",
                        tint: VDColor.weightStrong,
                        tintSoft: VDColor.weightSoft
                    )
                }

                let sparkValues = Array(weightEntries.suffix(14).compactMap(\.weightLbs).enumerated())
                if sparkValues.count > 1 {
                    Chart(sparkValues, id: \.offset) { index, value in
                        AreaMark(x: .value("i", index), y: .value("lb", value))
                            .foregroundStyle(VDColor.weightSoft)
                            .interpolationMethod(.linear)
                        LineMark(x: .value("i", index), y: .value("lb", value))
                            .foregroundStyle(VDColor.weight)
                            .interpolationMethod(.linear)
                    }
                    .chartXAxis(.hidden)
                    .chartYAxis(.hidden)
                    .frame(height: 52)
                }
            } else {
                Text("No weight logged yet — tap + to log your first entry.")
                    .font(.system(size: 14))
                    .foregroundStyle(VDColor.inkMuted)
            }
        }
    }
}

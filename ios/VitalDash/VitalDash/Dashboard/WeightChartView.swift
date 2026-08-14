import SwiftUI
import Charts

struct WeightChartView: View {
    let entries: [Entry]

    private var weightEntries: [Entry] {
        Array(entries.filter { $0.weightLbs != nil }.sorted { $0.date < $1.date }.suffix(14))
    }

    var body: some View {
        VDCard {
            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Text("Weight")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(VDColor.ink)
                if !weightEntries.isEmpty {
                    Text("· last \(weightEntries.count) days")
                        .font(.system(size: 13))
                        .foregroundStyle(VDColor.inkFaint)
                }
            }

            if weightEntries.count < 2 {
                Text("Log a few more days to see your trend here.")
                    .font(.system(size: 14))
                    .foregroundStyle(VDColor.inkMuted)
            } else {
                Chart(weightEntries) { entry in
                    if let w = entry.weightLbs {
                        AreaMark(x: .value("Date", fmtDateShort(entry.date)), y: .value("lb", w))
                            .foregroundStyle(VDColor.weightSoft)
                            .interpolationMethod(.linear)
                        LineMark(x: .value("Date", fmtDateShort(entry.date)), y: .value("lb", w))
                            .foregroundStyle(VDColor.weight)
                            .interpolationMethod(.linear)
                    }
                    if entry.id == weightEntries.last?.id, let w = entry.weightLbs {
                        PointMark(x: .value("Date", fmtDateShort(entry.date)), y: .value("lb", w))
                            .foregroundStyle(VDColor.surface)
                            .symbolSize(130)
                        PointMark(x: .value("Date", fmtDateShort(entry.date)), y: .value("lb", w))
                            .foregroundStyle(VDColor.weight)
                            .symbolSize(55)
                    }
                }
                .chartYAxis {
                    AxisMarks(position: .leading) {
                        AxisGridLine().foregroundStyle(VDColor.border)
                        AxisValueLabel().foregroundStyle(VDColor.inkFaint)
                    }
                }
                .chartXAxis {
                    AxisMarks(values: .automatic(desiredCount: 3)) {
                        AxisValueLabel().foregroundStyle(VDColor.inkFaint)
                    }
                }
                .frame(height: 200)
            }
        }
    }
}

import SwiftUI
import Charts

struct BpStatCardView: View {
    let entries: [Entry]

    private var bpEntries: [Entry] {
        entries.filter { $0.systolic != nil && $0.diastolic != nil }.sorted { $0.date < $1.date }
    }

    var body: some View {
        VDCard {
            VDEyebrow(text: "BLOOD PRESSURE")

            if let latest = bpEntries.last, let sys = latest.systolic, let dia = latest.diastolic {
                HStack(alignment: .lastTextBaseline, spacing: 6) {
                    Text("\(sys)/\(dia)")
                        .font(.system(size: 32, weight: .heavy))
                        .foregroundStyle(VDColor.ink)
                    Text("mmHg")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(VDColor.inkMuted)
                }

                let status = bpStatus(systolic: sys, diastolic: dia)
                VDPill(
                    text: status.label,
                    systemImage: status.level == .good ? "checkmark" : "exclamationmark.circle",
                    tint: tint(for: status.level),
                    tintSoft: tintSoft(for: status.level)
                )

                if let pulse = latest.pulse {
                    Text("Pulse \(pulse) bpm")
                        .font(.system(size: 13))
                        .foregroundStyle(VDColor.inkFaint)
                }

                let recent = Array(bpEntries.suffix(14).enumerated())
                if recent.count > 1 {
                    Chart {
                        ForEach(recent, id: \.offset) { index, entry in
                            if let d = entry.diastolic {
                                LineMark(x: .value("i", index), y: .value("mmHg", d))
                                    .foregroundStyle(VDColor.bpOn)
                            }
                        }
                        ForEach(recent, id: \.offset) { index, entry in
                            if let s = entry.systolic {
                                LineMark(x: .value("i", index), y: .value("mmHg", s))
                                    .foregroundStyle(VDColor.bp)
                            }
                        }
                    }
                    .chartXAxis(.hidden)
                    .chartYAxis(.hidden)
                    .frame(height: 52)
                }
            } else {
                Text("No readings yet — tap + to log one.")
                    .font(.system(size: 14))
                    .foregroundStyle(VDColor.inkMuted)
            }
        }
    }

    private func tint(for level: BpLevel) -> Color {
        switch level {
        case .good: VDColor.statusGood
        case .warn: VDColor.statusWarn
        case .critical: VDColor.statusCritical
        }
    }

    private func tintSoft(for level: BpLevel) -> Color {
        switch level {
        case .good: VDColor.statusGoodSoft
        case .warn: VDColor.statusWarnSoft
        case .critical: VDColor.statusCriticalSoft
        }
    }
}

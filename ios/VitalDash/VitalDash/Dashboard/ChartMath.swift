import Foundation

// Mirrors src/lib/chart-math.ts and the STEPS_GOAL constant from
// StepsDialCard.tsx — keep this in sync with the web app if those change.

let stepsGoal = 8000

enum BpLevel {
    case good, warn, critical
}

struct BpStatus {
    let label: String
    let level: BpLevel
}

// Simplified AHA-style categories. Not medical advice — just enough to
// color-code a personal trend, not diagnose anything.
func bpStatus(systolic: Int, diastolic: Int) -> BpStatus {
    if systolic >= 140 || diastolic >= 90 { return BpStatus(label: "High (Stage 2)", level: .critical) }
    if systolic >= 130 || diastolic >= 80 { return BpStatus(label: "High (Stage 1)", level: .warn) }
    if systolic >= 120 { return BpStatus(label: "Elevated", level: .warn) }
    return BpStatus(label: "Normal", level: .good)
}

private let isoDateFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "yyyy-MM-dd"
    f.timeZone = .current
    f.locale = Locale(identifier: "en_US_POSIX")
    return f
}()

private let shortDateFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "MMM d"
    f.timeZone = .current
    return f
}()

private let fullDateFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "EEE, MMM d, yyyy"
    f.timeZone = .current
    return f
}()

func fmtDateShort(_ iso: String) -> String {
    guard let date = isoDateFormatter.date(from: iso) else { return iso }
    return shortDateFormatter.string(from: date)
}

func fmtDateFull(_ iso: String) -> String {
    guard let date = isoDateFormatter.date(from: iso) else { return iso }
    return fullDateFormatter.string(from: date)
}

// Local-calendar-day "today," matching the web app's todayISO() — not
// derived from a UTC timestamp, which would drift a day off in the
// evening for anyone west of UTC.
func todayISO() -> String {
    isoDateFormatter.string(from: Date())
}

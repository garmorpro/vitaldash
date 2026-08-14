import Foundation

// Matches the JSON shape serialized by src/app/api/entries/route.ts on the
// web app's backend — this native app is just another client hitting the
// same Next.js API, not a separate backend.
struct Entry: Codable, Identifiable, Hashable {
    let id: String
    let date: String // "YYYY-MM-DD" — a plain calendar day, not a timestamp
    let weightLbs: Double?
    let steps: Int?
    let systolic: Int?
    let diastolic: Int?
    let pulse: Int?
}

struct SaveEntryInput: Encodable {
    let date: String
    var weightLbs: Double?
    var steps: Int?
    var systolic: Int?
    var diastolic: Int?
    var pulse: Int?
}

struct Account: Codable {
    let id: String
    let displayName: String
    let stepsImportToken: String
    let createdAt: String
}

struct APIErrorBody: Codable {
    let error: String?
}

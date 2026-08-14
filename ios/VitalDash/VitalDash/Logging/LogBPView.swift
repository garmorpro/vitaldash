import SwiftUI

struct LogBPView: View {
    @Environment(\.dismiss) private var dismiss
    let onSaved: () -> Void

    @State private var date = Date()
    @State private var systolicText = ""
    @State private var diastolicText = ""
    @State private var pulseText = ""
    @State private var saving = false
    @State private var error: String?
    @FocusState private var systolicFocused: Bool

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    DatePicker("Date", selection: $date, in: ...Date(), displayedComponents: .date)
                    HStack {
                        Text("Systolic")
                        Spacer()
                        TextField("118", text: $systolicText)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                            .focused($systolicFocused)
                    }
                    HStack {
                        Text("Diastolic")
                        Spacer()
                        TextField("76", text: $diastolicText)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                    }
                    HStack {
                        Text("Pulse")
                        Spacer()
                        TextField("68 (optional)", text: $pulseText)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                    }
                }

                if let error {
                    Text(error).foregroundStyle(VDColor.statusCritical)
                }
            }
            .navigationTitle("Log blood pressure")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(saving ? "Saving…" : "Save") { Task { await save() } }
                        .disabled(saving || systolicText.isEmpty || diastolicText.isEmpty)
                }
            }
            .onAppear { systolicFocused = true }
        }
    }

    private func save() async {
        guard let systolic = Int(systolicText), let diastolic = Int(diastolicText) else {
            error = "Enter systolic and diastolic."
            return
        }
        error = nil
        saving = true
        defer { saving = false }
        do {
            _ = try await APIClient.shared.saveEntry(
                SaveEntryInput(
                    date: isoDate(from: date),
                    systolic: systolic,
                    diastolic: diastolic,
                    pulse: pulseText.isEmpty ? nil : Int(pulseText)
                )
            )
            onSaved()
            dismiss()
        } catch {
            self.error = error.localizedDescription
        }
    }
}

private func isoDate(from date: Date) -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    formatter.timeZone = .current
    return formatter.string(from: date)
}

import SwiftUI

struct LogWeightView: View {
    @Environment(\.dismiss) private var dismiss
    let onSaved: () -> Void

    @State private var date = Date()
    @State private var weightText = ""
    @State private var saving = false
    @State private var error: String?
    @FocusState private var weightFocused: Bool

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    DatePicker("Date", selection: $date, in: ...Date(), displayedComponents: .date)
                    HStack {
                        Text("Weight (lb)")
                        Spacer()
                        TextField("180.2", text: $weightText)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                            .focused($weightFocused)
                    }
                }

                if let error {
                    Text(error).foregroundStyle(VDColor.statusCritical)
                }
            }
            .navigationTitle("Log weight")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(saving ? "Saving…" : "Save") { Task { await save() } }
                        .disabled(saving || weightText.isEmpty)
                }
            }
            .onAppear { weightFocused = true }
        }
    }

    private func save() async {
        guard let weight = Double(weightText) else {
            error = "Enter a valid weight."
            return
        }
        error = nil
        saving = true
        defer { saving = false }
        do {
            _ = try await APIClient.shared.saveEntry(
                SaveEntryInput(date: todayISO(from: date), weightLbs: weight)
            )
            onSaved()
            dismiss()
        } catch {
            self.error = error.localizedDescription
        }
    }
}

private func todayISO(from date: Date) -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    formatter.timeZone = .current
    return formatter.string(from: date)
}

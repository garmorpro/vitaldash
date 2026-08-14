import SwiftUI

struct DashboardView: View {
    @Environment(SessionStore.self) private var session
    @State private var entries: [Entry] = []
    @State private var loading = true
    @State private var errorMessage: String?

    @State private var showingChoice = false
    @State private var showingLogWeight = false
    @State private var showingLogBP = false

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottomTrailing) {
                VDColor.ground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 14) {
                        if let errorMessage {
                            Text(errorMessage)
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundStyle(VDColor.statusCritical)
                                .padding(12)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(VDColor.statusCriticalSoft, in: RoundedRectangle(cornerRadius: 14))
                        }

                        WeightStatCardView(entries: entries)
                        BpStatCardView(entries: entries)
                        StepsCardView(entries: entries)
                        WeightChartView(entries: entries)
                    }
                    .padding(16)
                }
                .refreshable { await load() }

                Button {
                    showingChoice = true
                } label: {
                    Image(systemName: "plus")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundStyle(.white)
                        .frame(width: 56, height: 56)
                        .background(VDColor.weight, in: Circle())
                        .shadow(color: VDColor.weight.opacity(0.35), radius: 14, y: 8)
                }
                .padding(20)
            }
            .navigationTitle("VitalDash")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        if let name = session.account?.displayName {
                            Text(name)
                        }
                        Button("Log out", role: .destructive) {
                            Task { await session.logout() }
                        }
                    } label: {
                        Image(systemName: "person.circle")
                    }
                }
            }
        }
        .confirmationDialog("Log a reading", isPresented: $showingChoice, titleVisibility: .visible) {
            Button("Weight") { showingLogWeight = true }
            Button("Blood pressure") { showingLogBP = true }
            Button("Cancel", role: .cancel) {}
        }
        .sheet(isPresented: $showingLogWeight) {
            LogWeightView(onSaved: { Task { await load() } })
        }
        .sheet(isPresented: $showingLogBP) {
            LogBPView(onSaved: { Task { await load() } })
        }
        .task { await load() }
    }

    private func load() async {
        do {
            entries = try await APIClient.shared.fetchEntries()
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
        loading = false
    }
}

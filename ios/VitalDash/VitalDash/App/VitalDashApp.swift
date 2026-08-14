import SwiftUI

@main
struct VitalDashApp: App {
    @State private var session = SessionStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(session)
                .task { await session.checkSession() }
        }
    }
}

struct RootView: View {
    @Environment(SessionStore.self) private var session

    var body: some View {
        Group {
            if session.isChecking {
                ZStack {
                    VDColor.ground.ignoresSafeArea()
                    ProgressView()
                }
            } else if session.isAuthenticated {
                DashboardView()
            } else {
                LoginView()
            }
        }
        .animation(.default, value: session.isAuthenticated)
    }
}

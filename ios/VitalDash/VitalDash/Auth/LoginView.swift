import SwiftUI

struct LoginView: View {
    @Environment(SessionStore.self) private var session
    @State private var isLoading = true

    var body: some View {
        ZStack {
            VDColor.ground.ignoresSafeArea()

            LoginWebView(
                url: APIClient.shared.baseURL.appendingPathComponent("login"),
                isLoading: $isLoading,
                onSignedIn: {
                    Task { await session.checkSession() }
                }
            )
            .opacity(isLoading ? 0 : 1)
            .ignoresSafeArea()

            if isLoading {
                VStack(spacing: 10) {
                    Text("VitalDash").font(.system(size: 24, weight: .heavy))
                        .foregroundStyle(VDColor.ink)
                    ProgressView()
                }
            }
        }
    }
}

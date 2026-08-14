import Foundation
import Observation

@MainActor
@Observable
final class SessionStore {
    var isAuthenticated = false
    var isChecking = true
    var account: Account?

    // Called on launch, and after the login web view signals success —
    // GET /api/account is the source of truth for "am I actually signed
    // in," not just "did the login flow finish."
    func checkSession() async {
        isChecking = true
        defer { isChecking = false }
        do {
            account = try await APIClient.shared.fetchAccount()
            isAuthenticated = true
        } catch {
            account = nil
            isAuthenticated = false
        }
    }

    func logout() async {
        try? await APIClient.shared.logout()
        account = nil
        isAuthenticated = false
    }
}

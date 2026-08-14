import SwiftUI
import WebKit

// Native passkey auth (ASAuthorizationPlatformPublicKeyCredentialProvider)
// needs an Associated Domains entitlement, which needs a paid Apple
// Developer account — not set up yet. WKWebView's built-in WebAuthn
// support doesn't have that requirement (it's the same mechanism Safari
// uses), so the actual Face ID handshake happens by loading the existing,
// already-working /login page here. Once a paid account is in place, this
// is the one file that would get swapped for a fully-native prompt —
// nothing else in the app needs to change.
struct LoginWebView: UIViewRepresentable {
    let url: URL
    @Binding var isLoading: Bool
    let onSignedIn: () -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(isLoading: $isLoading, onSignedIn: onSignedIn)
    }

    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.navigationDelegate = context.coordinator
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    @MainActor
    final class Coordinator: NSObject, WKNavigationDelegate {
        @Binding var isLoading: Bool
        let onSignedIn: () -> Void
        private var signaled = false

        init(isLoading: Binding<Bool>, onSignedIn: @escaping () -> Void) {
            _isLoading = isLoading
            self.onSignedIn = onSignedIn
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            isLoading = true
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            isLoading = false
            guard !signaled, webView.url?.path == "/" else { return }
            signaled = true

            // A successful sign-in redirects the page to "/" — copy
            // whatever cookies WKWebView picked up (the session cookie)
            // into URLSession's shared jar so the rest of the app's
            // native network calls carry it too.
            WKWebsiteDataStore.default().httpCookieStore.getAllCookies { [onSignedIn] cookies in
                for cookie in cookies {
                    HTTPCookieStorage.shared.setCookie(cookie)
                }
                Task { @MainActor in
                    onSignedIn()
                }
            }
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            isLoading = false
        }
    }
}

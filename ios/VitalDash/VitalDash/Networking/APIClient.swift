import Foundation

enum APIError: Error, LocalizedError {
    case unauthorized
    case server(String)
    case invalidResponse

    var errorDescription: String? {
        switch self {
        case .unauthorized: return "Not signed in."
        case .server(let message): return message
        case .invalidResponse: return "Something went wrong talking to the server."
        }
    }
}

// The ONLY thing in the app that talks to the network — SwiftUI views call
// this, never URLSession directly. Auth is entirely cookie-based: the
// session cookie set during the LoginWebView handshake lives in
// HTTPCookieStorage.shared, and URLSession attaches it automatically to
// every request to the same host, same as a browser would.
final class APIClient {
    static let shared = APIClient()

    let baseURL = URL(string: "https://vitaldash.morganserver.com")!

    private let session: URLSession

    private init() {
        let config = URLSessionConfiguration.default
        config.httpCookieStorage = HTTPCookieStorage.shared
        config.httpShouldSetCookies = true
        HTTPCookieStorage.shared.cookieAcceptPolicy = .always
        session = URLSession(configuration: config)
    }

    private func send(_ request: URLRequest) async throws -> Data {
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw APIError.invalidResponse }
        if http.statusCode == 401 { throw APIError.unauthorized }
        guard (200...299).contains(http.statusCode) else {
            let body = try? JSONDecoder().decode(APIErrorBody.self, from: data)
            throw APIError.server(body?.error ?? "Something went wrong (\(http.statusCode)).")
        }
        return data
    }

    private func get(_ path: String) async throws -> Data {
        try await send(URLRequest(url: baseURL.appendingPathComponent(path)))
    }

    private func post(_ path: String, jsonBody: Data? = nil) async throws -> Data {
        var request = URLRequest(url: baseURL.appendingPathComponent(path))
        request.httpMethod = "POST"
        if let jsonBody {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = jsonBody
        }
        return try await send(request)
    }

    func fetchAccount() async throws -> Account {
        try JSONDecoder().decode(Account.self, from: try await get("/api/account"))
    }

    func fetchEntries() async throws -> [Entry] {
        try JSONDecoder().decode([Entry].self, from: try await get("/api/entries"))
    }

    func saveEntry(_ input: SaveEntryInput) async throws -> Entry {
        let body = try JSONEncoder().encode(input)
        return try JSONDecoder().decode(Entry.self, from: try await post("/api/entries", jsonBody: body))
    }

    func logout() async throws {
        _ = try await post("/api/auth/logout")
    }
}

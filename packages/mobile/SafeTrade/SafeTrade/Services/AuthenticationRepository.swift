import Foundation
import Security

// Repository Layer - handles data persistence and retrieval
// Not @MainActor - can be used from any thread
class AuthenticationRepository {
    static let shared = AuthenticationRepository()

    private let tokenKey = "auth_token"
    private let refreshTokenKey = "refresh_token"
    private let userKey = "current_user"

    private init() {}

    // MARK: - Token Management
    func getToken() -> String? {
        return getFromKeychain(key: tokenKey)
    }

    func storeToken(_ token: String) throws {
        try storeInKeychain(key: tokenKey, value: token)
    }

    func deleteToken() {
        deleteFromKeychain(key: tokenKey)
    }

    // MARK: - Refresh Token Management
    func getRefreshToken() -> String? {
        return getFromKeychain(key: refreshTokenKey)
    }

    func storeRefreshToken(_ token: String) throws {
        try storeInKeychain(key: refreshTokenKey, value: token)
    }

    func deleteRefreshToken() {
        deleteFromKeychain(key: refreshTokenKey)
    }

    // MARK: - User Management
    func getCurrentUser() -> User? {
        guard let userString = getFromKeychain(key: userKey),
              let userData = userString.data(using: .utf8) else { return nil }

        do {
            return try JSONDecoder().decode(User.self, from: userData)
        } catch {
            #if DEBUG
            print("Error decoding user: \(error)")
            #endif
            return nil
        }
    }

    func storeUser(_ user: User) throws {
        let userData = try JSONEncoder().encode(user)
        let userString = String(data: userData, encoding: .utf8) ?? ""
        try storeInKeychain(key: userKey, value: userString)
    }

    func deleteUser() {
        deleteFromKeychain(key: userKey)
    }

    // MARK: - Authentication State
    func hasValidToken() -> Bool {
        guard let token = getToken() else { return false }
        if token.isEmpty {
            return false
        }
        // Check if token is expired
        if AuthenticationModel.isTokenExpired(token) {
            // Clear expired token
            deleteToken()
            return false
        }
        return true
    }

    func clearAllData() {
        deleteToken()
        deleteRefreshToken()
        deleteUser()
    }

    // MARK: - Authorization Header
    func getAuthorizationHeader() -> [String: String] {
        guard let token = getToken() else { return [:] }
        return ["Authorization": "Bearer \(token)"]
    }

    // MARK: - Private Keychain Helpers
    private func storeInKeychain(key: String, value: String) throws {
        let data = value.data(using: .utf8) ?? Data()

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]

        // Delete existing item
        SecItemDelete(query as CFDictionary)

        // Add new item
        let status = SecItemAdd(query as CFDictionary, nil)

        if status != errSecSuccess {
            throw AuthError.keychainError
        }
    }

    private func getFromKeychain(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        if status == errSecSuccess,
           let data = result as? Data,
           let string = String(data: data, encoding: .utf8) {
            return string
        }

        return nil
    }

    private func deleteFromKeychain(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]

        SecItemDelete(query as CFDictionary)
    }
}
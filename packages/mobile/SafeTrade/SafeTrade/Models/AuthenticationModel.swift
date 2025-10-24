import Foundation

// Model Layer - contains pure business logic
// Not @MainActor - can be used from any thread
struct AuthenticationModel {

    // MARK: - Authentication Business Logic

    static func login(email: String, password: String) async throws -> AuthResponse {
        let loginRequest = LoginRequest(email: email, password: password)
        let jsonData = try JSONEncoder().encode(loginRequest)

        let authResponse = try await APIService.shared.request(
            endpoint: "/auth/login",
            method: .POST,
            body: jsonData,
            responseType: AuthResponse.self
        )

        return authResponse
    }

    static func register(email: String, password: String, name: String) async throws -> AuthResponse {
        let registerRequest = RegisterRequest(email: email, password: password, name: name)
        let jsonData = try JSONEncoder().encode(registerRequest)

        let authResponse = try await APIService.shared.request(
            endpoint: "/users/register",
            method: .POST,
            body: jsonData,
            responseType: AuthResponse.self
        )

        return authResponse
    }

    static func refreshToken(refreshToken: String) async throws -> AuthResponse {
        let refreshRequest = ["refresh_token": refreshToken]
        let jsonData = try JSONSerialization.data(withJSONObject: refreshRequest)

        let authResponse = try await APIService.shared.request(
            endpoint: "/auth/refresh",
            method: .POST,
            body: jsonData,
            responseType: AuthResponse.self
        )

        return authResponse
    }

    // MARK: - Validation Logic

    static func validateEmail(_ email: String) -> Bool {
        let emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }

    static func validatePassword(_ password: String) -> Bool {
        return password.count >= 6 // Minimum password length
    }

    static func validateName(_ name: String) -> Bool {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        return !trimmed.isEmpty && trimmed.count >= 2
    }

    // MARK: - Token Validation

    static func isTokenExpired(_ token: String) -> Bool {
        do {
            // JWT format: header.payload.signature
            let parts = token.split(separator: ".")
            guard parts.count == 3 else {
                // Invalid JWT format
                return true
            }

            // Decode payload (second part)
            var payloadString = String(parts[1])

            // Add padding if necessary (Base64 requires padding to be multiple of 4)
            let padding = 4 - (payloadString.count % 4)
            if padding != 4 {
                payloadString += String(repeating: "=", count: padding)
            }

            guard let payloadData = Data(base64Encoded: payloadString) else {
                // Invalid Base64 encoding
                return true
            }

            // Parse JSON payload
            if let json = try JSONSerialization.jsonObject(with: payloadData) as? [String: Any],
               let expiryTimestamp = json["exp"] as? TimeInterval {
                // exp is in seconds since epoch
                let expiryDate = Date(timeIntervalSince1970: expiryTimestamp)
                // Token is expired if current time is past expiry time
                return Date() > expiryDate
            }

            // If exp claim is missing, consider token valid (backend responsibility)
            return false
        } catch {
            // If we can't parse the token, consider it expired for safety
            return true
        }
    }

    // MARK: - Business Rules

    static func shouldAutoRefreshToken(lastRefresh: Date) -> Bool {
        let refreshInterval: TimeInterval = 24 * 60 * 60 // 24 hours
        return Date().timeIntervalSince(lastRefresh) > refreshInterval
    }

    static func canAttemptLogin(failedAttempts: Int, lastAttempt: Date) -> Bool {
        let maxAttempts = 5
        let lockoutDuration: TimeInterval = 15 * 60 // 15 minutes

        if failedAttempts >= maxAttempts {
            return Date().timeIntervalSince(lastAttempt) > lockoutDuration
        }

        return true
    }

    // MARK: - Profile Management

    static func changePassword(currentPassword: String, newPassword: String) async throws -> UpdateProfileResponse {
        let changePasswordRequest = ChangePasswordRequest(
            currentPassword: currentPassword,
            newPassword: newPassword
        )
        let jsonData = try JSONEncoder().encode(changePasswordRequest)

        let response = try await APIService.shared.request(
            endpoint: "/users/profile/password",
            method: .PUT,
            body: jsonData,
            responseType: UpdateProfileResponse.self
        )

        return response
    }

    static func updateEmail(newEmail: String, password: String) async throws -> UpdateProfileResponse {
        let updateEmailRequest = UpdateEmailRequest(
            newEmail: newEmail,
            password: password
        )
        let jsonData = try JSONEncoder().encode(updateEmailRequest)

        let response = try await APIService.shared.request(
            endpoint: "/users/profile/email",
            method: .PUT,
            body: jsonData,
            responseType: UpdateProfileResponse.self
        )

        return response
    }

    static func updateName(newName: String, password: String) async throws -> UpdateProfileResponse {
        let updateNameRequest = UpdateNameRequest(
            newName: newName,
            password: password
        )
        let jsonData = try JSONEncoder().encode(updateNameRequest)

        let response = try await APIService.shared.request(
            endpoint: "/users/profile/name",
            method: .PUT,
            body: jsonData,
            responseType: UpdateProfileResponse.self
        )

        return response
    }

    // MARK: - Profile Validation

    static func validateNewPassword(_ password: String) -> Bool {
        // More strict validation for new passwords
        let hasMinLength = password.count >= 8
        let hasUppercase = password.range(of: "[A-Z]", options: .regularExpression) != nil
        let hasLowercase = password.range(of: "[a-z]", options: .regularExpression) != nil
        let hasNumbers = password.range(of: "[0-9]", options: .regularExpression) != nil

        return hasMinLength && hasUppercase && hasLowercase && hasNumbers
    }

    static func validatePasswordConfirmation(_ password: String, confirmation: String) -> Bool {
        return password == confirmation && !password.isEmpty
    }
}
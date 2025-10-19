import Foundation

struct AuthResponse: Codable {
    let success: Bool
    let message: String
    let accessToken: String
    let refreshToken: String
    let user: User

    enum CodingKeys: String, CodingKey {
        case success, message, user
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
    }
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct RegisterRequest: Codable {
    let email: String
    let password: String
    let name: String
}

struct ChangePasswordRequest: Codable {
    let currentPassword: String
    let newPassword: String

    enum CodingKeys: String, CodingKey {
        case currentPassword = "current_password"
        case newPassword = "new_password"
    }
}

struct UpdateEmailRequest: Codable {
    let newEmail: String
    let password: String

    enum CodingKeys: String, CodingKey {
        case newEmail = "new_email"
        case password
    }
}

struct UpdateNameRequest: Codable {
    let newName: String
    let password: String

    enum CodingKeys: String, CodingKey {
        case newName = "new_name"
        case password
    }
}

struct UpdateProfileResponse: Codable {
    let success: Bool
    let message: String
    let user: User?
}
import Foundation

// ViewModel Layer - handles UI state and coordinates between Model and Repository
@MainActor
class AuthenticationService: ObservableObject {
    static let shared = AuthenticationService()

    // MARK: - Published Properties (UI State)
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?

    // MARK: - Dependencies
    private let repository = AuthenticationRepository.shared

    private init() {
        checkAuthenticationStatus()
    }

    // MARK: - Authentication Status
    func checkAuthenticationStatus() {
        if repository.hasValidToken() {
            // Set token in API service
            if let token = repository.getToken() {
                APIService.shared.setAuthToken(token)
            }
            self.isAuthenticated = true
            self.currentUser = repository.getCurrentUser()
        } else {
            APIService.shared.setAuthToken(nil)
            self.isAuthenticated = false
            self.currentUser = nil
        }
    }

    // MARK: - Login
    func login(email: String, password: String) async throws -> AuthResponse {
        isLoading = true
        errorMessage = nil

        do {
            // Validate inputs
            guard AuthenticationModel.validateEmail(email) else {
                throw AuthError.invalidCredentials
            }
            guard AuthenticationModel.validatePassword(password) else {
                throw AuthError.invalidCredentials
            }

            // Perform login via Model
            let authResponse = try await AuthenticationModel.login(email: email, password: password)

            // Store data via Repository
            try repository.storeToken(authResponse.accessToken)
            try repository.storeRefreshToken(authResponse.refreshToken)
            try repository.storeUser(authResponse.user)

            // Update API service token
            APIService.shared.setAuthToken(authResponse.accessToken)

            // Update UI state
            self.isAuthenticated = true
            self.currentUser = authResponse.user
            self.isLoading = false

            // Provide success haptic feedback
            HapticFeedback.shared.loginSuccess()

            return authResponse
        } catch {
            self.isLoading = false
            self.errorMessage = "Error de autenticación"

            // Provide error haptic feedback
            HapticFeedback.shared.loginError()

            throw error
        }
    }

    // MARK: - Registration
    func register(email: String, password: String, name: String) async throws -> AuthResponse {
        isLoading = true
        errorMessage = nil

        do {
            // Validate inputs
            guard AuthenticationModel.validateEmail(email) else {
                throw AuthError.invalidCredentials
            }
            guard AuthenticationModel.validatePassword(password) else {
                throw AuthError.invalidCredentials
            }
            guard AuthenticationModel.validateName(name) else {
                throw AuthError.invalidCredentials
            }

            // Perform registration via Model
            let authResponse = try await AuthenticationModel.register(email: email, password: password, name: name)

            // Reset loading state without authenticating the user
            self.isLoading = false

            return authResponse
        } catch {
            self.isLoading = false
            self.errorMessage = "Error de registro"
            throw error
        }
    }

    // MARK: - Logout
    func logout() {
        // Clear data via Repository
        repository.clearAllData()

        // Clear API service token
        APIService.shared.setAuthToken(nil)

        // Update UI state
        self.isAuthenticated = false
        self.currentUser = nil
        self.errorMessage = nil
    }

    // MARK: - Token Refresh
    func refreshToken() async throws {
        guard let refreshToken = repository.getRefreshToken() else {
            throw AuthError.noRefreshToken
        }

        do {
            // Refresh token via Model
            let authResponse = try await AuthenticationModel.refreshToken(refreshToken: refreshToken)

            // Store new tokens via Repository
            try repository.storeToken(authResponse.accessToken)
            try repository.storeRefreshToken(authResponse.refreshToken)

            // Update API service token
            APIService.shared.setAuthToken(authResponse.accessToken)
        } catch {
            // If refresh fails, logout user
            logout()
            throw error
        }
    }

    // MARK: - Profile Management
    func changePassword(currentPassword: String, newPassword: String, confirmPassword: String) async throws -> UpdateProfileResponse {
        isLoading = true
        errorMessage = nil

        do {
            // Validate inputs
            guard !currentPassword.isEmpty else {
                throw AuthError.invalidCredentials
            }
            guard AuthenticationModel.validateNewPassword(newPassword) else {
                throw ProfileError.weakPassword
            }
            guard AuthenticationModel.validatePasswordConfirmation(newPassword, confirmation: confirmPassword) else {
                throw ProfileError.passwordMismatch
            }

            // Perform password change via Model
            let response = try await AuthenticationModel.changePassword(
                currentPassword: currentPassword,
                newPassword: newPassword
            )

            self.isLoading = false

            // Provide success haptic feedback
            HapticFeedback.shared.loginSuccess()

            return response
        } catch {
            self.isLoading = false
            self.errorMessage = "Error al cambiar contraseña"

            // Provide error haptic feedback
            HapticFeedback.shared.loginError()

            throw error
        }
    }

    func updateEmail(newEmail: String, password: String) async throws -> UpdateProfileResponse {
        isLoading = true
        errorMessage = nil

        do {
            // Validate inputs
            guard AuthenticationModel.validateEmail(newEmail) else {
                throw ProfileError.invalidEmail
            }
            guard !password.isEmpty else {
                throw AuthError.invalidCredentials
            }

            // Perform email update via Model
            let response = try await AuthenticationModel.updateEmail(
                newEmail: newEmail,
                password: password
            )

            // Update current user if successful
            if let updatedUser = response.user {
                try repository.storeUser(updatedUser)
                self.currentUser = updatedUser
            }

            self.isLoading = false

            // Provide success haptic feedback
            HapticFeedback.shared.loginSuccess()

            return response
        } catch {
            self.isLoading = false
            self.errorMessage = "Error al actualizar correo"

            // Provide error haptic feedback
            HapticFeedback.shared.loginError()

            throw error
        }
    }

    func updateName(newName: String, password: String) async throws -> UpdateProfileResponse {
        isLoading = true
        errorMessage = nil

        do {
            // Validate inputs
            guard AuthenticationModel.validateName(newName) else {
                throw ProfileError.invalidName
            }
            guard !password.isEmpty else {
                throw AuthError.invalidCredentials
            }

            // Perform name update via Model
            let response = try await AuthenticationModel.updateName(
                newName: newName,
                password: password
            )

            // Update current user if successful
            if let updatedUser = response.user {
                try repository.storeUser(updatedUser)
                self.currentUser = updatedUser
            }

            self.isLoading = false

            // Provide success haptic feedback
            HapticFeedback.shared.loginSuccess()

            return response
        } catch {
            self.isLoading = false
            self.errorMessage = "Error al actualizar nombre"

            // Provide error haptic feedback
            HapticFeedback.shared.loginError()

            throw error
        }
    }

    // MARK: - Convenience Methods
    func clearError() {
        errorMessage = nil
    }

    // MARK: - Authorization Header
    func getAuthorizationHeader() -> [String: String] {
        return repository.getAuthorizationHeader()
    }
}

enum AuthError: Error, LocalizedError {
    case noRefreshToken
    case keychainError
    case invalidCredentials
    case networkError

    var errorDescription: String? {
        switch self {
        case .noRefreshToken:
            return "No hay token de actualización disponible"
        case .keychainError:
            return "Error al acceder al almacenamiento seguro"
        case .invalidCredentials:
            return "Credenciales inválidas"
        case .networkError:
            return "Error de conexión"
        }
    }
}

enum ProfileError: Error, LocalizedError {
    case weakPassword
    case passwordMismatch
    case invalidEmail
    case invalidName

    var errorDescription: String? {
        switch self {
        case .weakPassword:
            return "La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números"
        case .passwordMismatch:
            return "Las contraseñas no coinciden"
        case .invalidEmail:
            return "El formato del correo electrónico es inválido"
        case .invalidName:
            return "El nombre debe tener al menos 2 caracteres"
        }
    }
}

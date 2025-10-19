import SwiftUI

struct ChangePasswordView: View {
    @StateObject private var authService = AuthenticationService.shared
    @Environment(\.dismiss) private var dismiss

    @State private var currentPassword = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var showCurrentPassword = false
    @State private var showNewPassword = false
    @State private var showConfirmPassword = false
    @State private var showSuccessAlert = false
    @State private var showConfirmationDialog = false

    private var isFormValid: Bool {
        !currentPassword.isEmpty &&
        !newPassword.isEmpty &&
        !confirmPassword.isEmpty &&
        newPassword == confirmPassword &&
        newPassword.count >= 8
    }

    private var passwordStrengthColor: Color {
        if newPassword.isEmpty { return .clear }
        if AuthenticationModel.validateNewPassword(newPassword) { return .green }
        if newPassword.count >= 6 { return .orange }
        return .red
    }

    private var passwordStrengthText: String {
        if newPassword.isEmpty { return "" }
        if AuthenticationModel.validateNewPassword(newPassword) { return "Contraseña segura" }
        if newPassword.count >= 6 { return "Contraseña moderada" }
        return "Contraseña débil"
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header Info
                headerSection

                // Form Section
                formSection

                // Requirements Section
                requirementsSection

                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.top, 20)
        }
        .navigationTitle("Cambiar Contraseña")
        .navigationBarTitleDisplayMode(.large)
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button("Cancelar") {
                    dismiss()
                }
            }

            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Guardar") {
                    showConfirmationDialog = true
                }
                .disabled(!isFormValid || authService.isLoading)
                .fontWeight(.semibold)
            }
        }
        .alert("Contraseña Actualizada", isPresented: $showSuccessAlert) {
            Button("OK") {
                dismiss()
            }
        } message: {
            Text("Tu contraseña se ha cambiado exitosamente.")
        }
        .confirmationDialog(
            isPresented: $showConfirmationDialog,
            title: "¿Cambiar contraseña?",
            message: "Esta acción no se puede deshacer. ¿Estás seguro de que quieres cambiar tu contraseña?",
            confirmButtonText: "Sí, cambiar",
            confirmButtonColor: .orange
        ) {
            changePassword()
        }
        .disabled(authService.isLoading)
    }

    // MARK: - Header Section
    private var headerSection: some View {
        VStack(spacing: 12) {
            Image(systemName: "key.fill")
                .font(.system(size: 40))
                .foregroundColor(.orange)
                .padding(.bottom, 8)

            Text("Actualizar Contraseña")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Ingresa tu contraseña actual y luego tu nueva contraseña para actualizar tu acceso.")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }

    // MARK: - Form Section
    private var formSection: some View {
        VStack(spacing: 16) {
            // Current Password
            VStack(alignment: .leading, spacing: 8) {
                Text("Contraseña Actual")
                    .font(.subheadline)
                    .fontWeight(.medium)

                HStack {
                    if showCurrentPassword {
                        TextField("Ingresa tu contraseña actual", text: $currentPassword)
                    } else {
                        SecureField("Ingresa tu contraseña actual", text: $currentPassword)
                    }

                    Button(action: { showCurrentPassword.toggle() }) {
                        Image(systemName: showCurrentPassword ? "eye.slash" : "eye")
                            .foregroundColor(.secondary)
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(8)
            }

            // New Password
            VStack(alignment: .leading, spacing: 8) {
                Text("Nueva Contraseña")
                    .font(.subheadline)
                    .fontWeight(.medium)

                HStack {
                    if showNewPassword {
                        TextField("Ingresa tu nueva contraseña", text: $newPassword)
                    } else {
                        SecureField("Ingresa tu nueva contraseña", text: $newPassword)
                    }

                    Button(action: { showNewPassword.toggle() }) {
                        Image(systemName: showNewPassword ? "eye.slash" : "eye")
                            .foregroundColor(.secondary)
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(8)

                // Password Strength Indicator
                if !newPassword.isEmpty {
                    HStack {
                        Circle()
                            .fill(passwordStrengthColor)
                            .frame(width: 8, height: 8)

                        Text(passwordStrengthText)
                            .font(.caption)
                            .foregroundColor(passwordStrengthColor)

                        Spacer()
                    }
                }
            }

            // Confirm Password
            VStack(alignment: .leading, spacing: 8) {
                Text("Confirmar Nueva Contraseña")
                    .font(.subheadline)
                    .fontWeight(.medium)

                HStack {
                    if showConfirmPassword {
                        TextField("Confirma tu nueva contraseña", text: $confirmPassword)
                    } else {
                        SecureField("Confirma tu nueva contraseña", text: $confirmPassword)
                    }

                    Button(action: { showConfirmPassword.toggle() }) {
                        Image(systemName: showConfirmPassword ? "eye.slash" : "eye")
                            .foregroundColor(.secondary)
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(8)

                // Password Match Indicator
                if !confirmPassword.isEmpty {
                    HStack {
                        Circle()
                            .fill(newPassword == confirmPassword ? .green : .red)
                            .frame(width: 8, height: 8)

                        Text(newPassword == confirmPassword ? "Las contraseñas coinciden" : "Las contraseñas no coinciden")
                            .font(.caption)
                            .foregroundColor(newPassword == confirmPassword ? .green : .red)

                        Spacer()
                    }
                }
            }

            // Error Message
            if let errorMessage = authService.errorMessage {
                Text(errorMessage)
                    .font(.caption)
                    .foregroundColor(.red)
                    .padding(.horizontal)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }

    // MARK: - Requirements Section
    private var requirementsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Requisitos de Contraseña")
                .font(.headline)
                .fontWeight(.semibold)

            VStack(alignment: .leading, spacing: 8) {
                PasswordRequirement(
                    text: "Mínimo 8 caracteres",
                    ismet: newPassword.count >= 8
                )

                PasswordRequirement(
                    text: "Al menos una letra mayúscula",
                    ismet: newPassword.range(of: "[A-Z]", options: .regularExpression) != nil
                )

                PasswordRequirement(
                    text: "Al menos una letra minúscula",
                    ismet: newPassword.range(of: "[a-z]", options: .regularExpression) != nil
                )

                PasswordRequirement(
                    text: "Al menos un número",
                    ismet: newPassword.range(of: "[0-9]", options: .regularExpression) != nil
                )
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }

    // MARK: - Actions
    private func changePassword() {
        Task {
            do {
                _ = try await authService.changePassword(
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                    confirmPassword: confirmPassword
                )
                await MainActor.run {
                    showSuccessAlert = true
                }
            } catch {
                // Error is handled by AuthenticationService
            }
        }
    }
}

// MARK: - Supporting Views
struct PasswordRequirement: View {
    let text: String
    let ismet: Bool

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: ismet ? "checkmark.circle.fill" : "circle")
                .font(.caption)
                .foregroundColor(ismet ? .green : .secondary)

            Text(text)
                .font(.caption)
                .foregroundColor(ismet ? .primary : .secondary)

            Spacer()
        }
    }
}

#Preview {
    ChangePasswordView()
}
import SwiftUI

struct ChangeEmailView: View {
    @StateObject private var authService = AuthenticationService.shared
    @Environment(\.dismiss) private var dismiss

    @State private var newEmail = ""
    @State private var password = ""
    @State private var showPassword = false
    @State private var showSuccessAlert = false
    @State private var showConfirmationDialog = false

    private var isFormValid: Bool {
        !newEmail.isEmpty &&
        !password.isEmpty &&
        AuthenticationModel.validateEmail(newEmail) &&
        newEmail != authService.currentUser?.email
    }

    private var emailValidationColor: Color {
        if newEmail.isEmpty { return .clear }
        if AuthenticationModel.validateEmail(newEmail) { return .green }
        return .red
    }

    private var emailValidationText: String {
        if newEmail.isEmpty { return "" }
        if newEmail == authService.currentUser?.email { return "Este es tu correo actual" }
        if AuthenticationModel.validateEmail(newEmail) { return "Formato de correo válido" }
        return "Formato de correo inválido"
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header Info
                headerSection

                // Current Email Display
                currentEmailSection

                // Form Section
                formSection

                // Security Notice
                securityNoticeSection

                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.top, 20)
        }
        .navigationTitle("Cambiar Correo")
        .navigationBarTitleDisplayMode(.large)
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button("Cancelar") {
                    dismiss()
                }
            }

            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Actualizar") {
                    showConfirmationDialog = true
                }
                .disabled(!isFormValid || authService.isLoading)
                .fontWeight(.semibold)
            }
        }
        .alert("Correo Actualizado", isPresented: $showSuccessAlert) {
            Button("OK") {
                dismiss()
            }
        } message: {
            Text("Tu correo electrónico se ha actualizado exitosamente.")
        }
        .confirmationDialog(
            isPresented: $showConfirmationDialog,
            title: "¿Cambiar correo electrónico?",
            message: "Esta acción actualizará tu correo de acceso. Necesitarás usar el nuevo correo para iniciar sesión en el futuro. ¿Estás seguro?",
            confirmButtonText: "Sí, cambiar",
            confirmButtonColor: .orange
        ) {
            updateEmail()
        }
        .disabled(authService.isLoading)
    }

    // MARK: - Header Section
    private var headerSection: some View {
        VStack(spacing: 12) {
            Image(systemName: "envelope.badge")
                .font(.system(size: 40))
                .foregroundColor(.orange)
                .padding(.bottom, 8)

            Text("Actualizar Correo Electrónico")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Cambia tu dirección de correo electrónico. Necesitarás confirmar tu contraseña por seguridad.")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }

    // MARK: - Current Email Section
    private var currentEmailSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Correo Actual")
                .font(.headline)
                .fontWeight(.semibold)

            if let currentEmail = authService.currentUser?.email {
                HStack {
                    Image(systemName: "envelope")
                        .foregroundColor(.orange)

                    Text(currentEmail)
                        .font(.body)
                        .fontWeight(.medium)

                    Spacer()

                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(8)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }

    // MARK: - Form Section
    private var formSection: some View {
        VStack(spacing: 16) {
            // New Email
            VStack(alignment: .leading, spacing: 8) {
                Text("Nuevo Correo Electrónico")
                    .font(.subheadline)
                    .fontWeight(.medium)

                TextField("ejemplo@correo.com", text: $newEmail)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.emailAddress)
                    .textContentType(.emailAddress)
                    .autocapitalization(.none)
                    .autocorrectionDisabled()
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                    .background(Color(.systemGray6))
                    .cornerRadius(8)

                // Email Validation Indicator
                if !newEmail.isEmpty {
                    HStack {
                        Circle()
                            .fill(emailValidationColor)
                            .frame(width: 8, height: 8)

                        Text(emailValidationText)
                            .font(.caption)
                            .foregroundColor(emailValidationColor == .green ? .green : (emailValidationColor == .red ? .red : .secondary))

                        Spacer()
                    }
                }
            }

            // Password Confirmation
            VStack(alignment: .leading, spacing: 8) {
                Text("Confirma tu Contraseña")
                    .font(.subheadline)
                    .fontWeight(.medium)

                HStack {
                    if showPassword {
                        TextField("Ingresa tu contraseña actual", text: $password)
                            .textContentType(.password)
                            .autocorrectionDisabled()
                    } else {
                        SecureField("Ingresa tu contraseña actual", text: $password)
                            .textContentType(.password)
                            .autocorrectionDisabled()
                    }

                    Button(action: { showPassword.toggle() }) {
                        Image(systemName: showPassword ? "eye.slash" : "eye")
                            .foregroundColor(.secondary)
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(8)

                Text("Necesaria para confirmar tu identidad")
                    .font(.caption)
                    .foregroundColor(.secondary)
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

    // MARK: - Security Notice Section
    private var securityNoticeSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "shield.fill")
                    .foregroundColor(.orange)

                Text("Aviso de Seguridad")
                    .font(.headline)
                    .fontWeight(.semibold)
            }

            VStack(alignment: .leading, spacing: 8) {
                SecurityNoticeRow(
                    icon: "key.fill",
                    text: "Tu contraseña es requerida para confirmar este cambio"
                )

                SecurityNoticeRow(
                    icon: "envelope.arrow.triangle.branch",
                    text: "El nuevo correo será tu nueva dirección de acceso"
                )

                SecurityNoticeRow(
                    icon: "exclamationmark.triangle.fill",
                    text: "Asegúrate de tener acceso al nuevo correo electrónico"
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
    private func updateEmail() {
        Task {
            do {
                _ = try await authService.updateEmail(
                    newEmail: newEmail,
                    password: password
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
struct SecurityNoticeRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(.orange)
                .frame(width: 16)

            Text(text)
                .font(.caption)
                .foregroundColor(.secondary)

            Spacer()
        }
    }
}

#Preview {
    ChangeEmailView()
}

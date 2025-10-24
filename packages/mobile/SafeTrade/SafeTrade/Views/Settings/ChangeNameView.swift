import SwiftUI

struct ChangeNameView: View {
    @StateObject private var authService = AuthenticationService.shared
    @Environment(\.dismiss) private var dismiss

    @State private var newName = ""
    @State private var password = ""
    @State private var showPassword = false
    @State private var showSuccessAlert = false
    @State private var showConfirmationDialog = false

    private var isFormValid: Bool {
        !newName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !password.isEmpty &&
        AuthenticationModel.validateName(newName) &&
        newName.trimmingCharacters(in: .whitespacesAndNewlines) != authService.currentUser?.name
    }

    private var nameValidationColor: Color {
        let trimmedName = newName.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmedName.isEmpty { return .clear }
        if trimmedName == authService.currentUser?.name { return .secondary }
        if AuthenticationModel.validateName(trimmedName) { return .orange }
        return .red
    }

    private var nameValidationText: String {
        let trimmedName = newName.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmedName.isEmpty { return "" }
        if trimmedName == authService.currentUser?.name { return "Este es tu nombre actual" }
        if AuthenticationModel.validateName(trimmedName) { return "Nombre válido" }
        return "El nombre debe tener al menos 2 caracteres"
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header Info
                headerSection

                // Current Name Display
                currentNameSection

                // Form Section
                formSection

                // Guidelines Section
                guidelinesSection

                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.top, 20)
        }
        .navigationTitle("Cambiar Nombre")
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
        .alert("Nombre Actualizado", isPresented: $showSuccessAlert) {
            Button("OK") {
                dismiss()
            }
        } message: {
            Text("Tu nombre se ha actualizado exitosamente.")
        }
        .confirmationDialog(
            isPresented: $showConfirmationDialog,
            title: "¿Cambiar nombre?",
            message: "Esta acción actualizará tu nombre de usuario. ¿Estás seguro?",
            confirmButtonText: "Sí, cambiar",
            confirmButtonColor: .orange
        ) {
            updateName()
        }
        .disabled(authService.isLoading)
        .onAppear {
            // Pre-populate with current name for easier editing
            if let currentName = authService.currentUser?.name {
                newName = currentName
            }
        }
    }

    // MARK: - Header Section
    private var headerSection: some View {
        VStack(spacing: 12) {
            Image(systemName: "person.badge.plus")
                .font(.system(size: 40))
                .foregroundColor(.orange)
                .padding(.bottom, 8)

            Text("Actualizar Nombre")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Cambia tu nombre de usuario. Necesitarás confirmar tu contraseña por seguridad.")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }

    // MARK: - Current Name Section
    private var currentNameSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Nombre Actual")
                .font(.headline)
                .fontWeight(.semibold)

            if let currentName = authService.currentUser?.name {
                HStack {
                    Image(systemName: "person")
                        .foregroundColor(.orange)

                    Text(currentName)
                        .font(.body)
                        .fontWeight(.medium)

                    Spacer()

                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.orange)
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
            // New Name
            VStack(alignment: .leading, spacing: 8) {
                Text("Nuevo Nombre")
                    .font(.subheadline)
                    .fontWeight(.medium)

                TextField("Ingresa tu nuevo nombre", text: $newName)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .textContentType(.name)
                    .autocapitalization(.words)
                    .autocorrectionDisabled()
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                    .background(Color(.systemGray6))
                    .cornerRadius(8)

                // Name Validation Indicator
                if !newName.isEmpty {
                    HStack {
                        Circle()
                            .fill(nameValidationColor)
                            .frame(width: 8, height: 8)

                        Text(nameValidationText)
                            .font(.caption)
                            .foregroundColor(nameValidationColor == .orange ? .orange : (nameValidationColor == .red ? .red : .secondary))

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

    // MARK: - Guidelines Section
    private var guidelinesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "info.circle.fill")
                    .foregroundColor(.blue)

                Text("Pautas para el Nombre")
                    .font(.headline)
                    .fontWeight(.semibold)
            }

            VStack(alignment: .leading, spacing: 8) {
                NameGuidelineRow(
                    icon: "textformat.size",
                    text: "Mínimo 2 caracteres",
                    ismet: AuthenticationModel.validateName(newName.trimmingCharacters(in: .whitespacesAndNewlines))
                )

                NameGuidelineRow(
                    icon: "character",
                    text: "Puede contener letras, números y espacios",
                    ismet: !newName.isEmpty
                )

                NameGuidelineRow(
                    icon: "person.fill.questionmark",
                    text: "Será visible para otros usuarios",
                    ismet: !newName.isEmpty
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
    private func updateName() {
        let trimmedName = newName.trimmingCharacters(in: .whitespacesAndNewlines)
        Task {
            do {
                _ = try await authService.updateName(
                    newName: trimmedName,
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
struct NameGuidelineRow: View {
    let icon: String
    let text: String
    let ismet: Bool

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundColor(ismet ? .orange : .blue)
                .frame(width: 16)

            Text(text)
                .font(.caption)
                .foregroundColor(.secondary)

            Spacer()

            if ismet && !text.contains("visible") {
                Image(systemName: "checkmark")
                    .font(.caption)
                    .foregroundColor(.orange)
            }
        }
    }
}

#Preview {
    ChangeNameView()
}

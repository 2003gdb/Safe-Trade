import SwiftUI

struct AccountSettingsView: View {
    @StateObject private var authService = AuthenticationService.shared
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // User Info Section
                userInfoSection


                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.top, 20)
        }
        .navigationTitle("Configuración")
        .navigationBarTitleDisplayMode(.large)
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button("Atrás") {
                    dismiss()
                }
            }
        }
    }

    // MARK: - User Info Section
    private var userInfoSection: some View {
        VStack(spacing: 16) {
            // Section Title
            HStack {
                Text("Información Personal")
                    .font(.headline)
                    .fontWeight(.semibold)
                Spacer()
            }

            VStack(spacing: 12) {
                // Current User Info Display
                if let user = authService.currentUser {
                    VStack(spacing: 8) {
                        UserInfoRow(
                            icon: "envelope",
                            title: "Correo Electrónico",
                            value: user.email
                        )

                        UserInfoRow(
                            icon: "person",
                            title: "Nombre",
                            value: user.name
                        )
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

                    Divider()
                        .padding(.vertical, 8)

                    // Edit Actions
                    NavigationLink(destination: ChangeEmailView()) {
                        SettingsActionRow(
                            icon: "envelope.badge",
                            title: "Cambiar Correo Electrónico",
                            subtitle: "Actualizar tu dirección de correo",
                            iconColor: .blue
                        )
                    }

                    NavigationLink(destination: ChangeNameView()) {
                        SettingsActionRow(
                            icon: "person.badge.plus",
                            title: "Cambiar Nombre",
                            subtitle: "Actualizar tu nombre de usuario",
                            iconColor: .blue
                        )
                    }

                    NavigationLink(destination: ChangePasswordView()) {
                        SettingsActionRow(
                            icon: "key",
                            title: "Cambiar Contraseña",
                            subtitle: "Actualizar tu contraseña de acceso",
                            iconColor: .blue
                        )
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }

}

// MARK: - Supporting Views
struct UserInfoRow: View {
    let icon: String
    let title: String
    let value: String

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.blue)
                .frame(width: 24)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text(value)
                    .font(.body)
                    .fontWeight(.medium)
            }

            Spacer()
        }
        .padding(.vertical, 4)
    }
}

struct SettingsActionRow: View {
    let icon: String
    let title: String
    let subtitle: String
    let iconColor: Color
    let isDisabled: Bool

    init(
        icon: String,
        title: String,
        subtitle: String,
        iconColor: Color = .blue,
        isDisabled: Bool = false
    ) {
        self.icon = icon
        self.title = title
        self.subtitle = subtitle
        self.iconColor = iconColor
        self.isDisabled = isDisabled
    }

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(isDisabled ? .gray : iconColor)
                .frame(width: 24)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.body)
                    .fontWeight(.medium)
                    .foregroundColor(isDisabled ? .gray : .primary)

                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            if !isDisabled {
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 8)
        .contentShape(Rectangle())
        .opacity(isDisabled ? 0.6 : 1.0)
    }
}

#Preview {
    AccountSettingsView()
}

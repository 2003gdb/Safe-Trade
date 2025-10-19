import SwiftUI
import Combine

struct ProfileView: View {
    @StateObject private var authService = AuthenticationService.shared
    @StateObject private var reportingService = ReportingService()
    @State private var userReports: [Report] = []
    @State private var isLoadingReports = false
    @State private var cancellables = Set<AnyCancellable>()

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Profile Header
                profileHeader

                // Reports Status Card
                if authService.currentUser != nil {
                    ReportsStatusCard(
                        reports: userReports,
                        isLoading: isLoadingReports
                    )
                }

                // Profile Actions
                profileActions

                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.top, 20)
            .padding(.bottom, 20)
        }
        .onAppear {
            loadUserReports()
        }
    }

    // MARK: - Profile Header
    private var profileHeader: some View {
        VStack(spacing: 16) {
            // Profile Image
            Circle()
                .fill(Color.blue.opacity(0.1))
                .frame(width: 80, height: 80)
                .overlay(
                    Image(systemName: "person.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.blue)
                )

            // User Info
            if let user = authService.currentUser {
                VStack(spacing: 8) {
                    Text(user.email)
                        .font(.title2)
                        .fontWeight(.semibold)

                    Text("Usuario Registrado")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }

    // MARK: - Profile Actions
    private var profileActions: some View {
        VStack(spacing: 16) {
            // Section Title
            HStack {
                Text("Configuración")
                    .font(.headline)
                    .fontWeight(.semibold)
                Spacer()
            }

            VStack(spacing: 12) {
                // Account Settings
                NavigationLink(destination: AccountSettingsView()) {
                    HStack(spacing: 16) {
                        Image(systemName: "gear")
                            .font(.title2)
                            .foregroundColor(.blue)
                            .frame(width: 24)

                        VStack(alignment: .leading, spacing: 4) {
                            Text("Configuración")
                                .font(.body)
                                .fontWeight(.medium)
                                .foregroundColor(.primary)

                            Text("Cambiar contraseña, correo y nombre")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 8)
                    .contentShape(Rectangle())
                }
                .buttonStyle(PlainButtonStyle())


                Divider()
                    .padding(.vertical, 8)

                // Logout
                ProfileActionRow(
                    icon: "arrow.backward.circle",
                    title: "Cerrar Sesión",
                    subtitle: nil,
                    iconColor: .red,
                    titleColor: .red,
                    action: {
                        authService.logout()
                    }
                )
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }

    // MARK: - Reports Loading
    private func loadUserReports() {
        guard authService.currentUser != nil else { return }

        isLoadingReports = true
        reportingService.getUserReports()
            .sink(
                receiveCompletion: { completion in
                    DispatchQueue.main.async {
                        isLoadingReports = false
                    }
                    if case .failure(let error) = completion {
                        print("❌ Failed to load user reports: \(error)")
                    }
                },
                receiveValue: { reports in
                    DispatchQueue.main.async {
                        userReports = reports
                    }
                }
            )
            .store(in: &cancellables)
    }
}

// MARK: - Profile Action Row
struct ProfileActionRow: View {
    let icon: String
    let title: String
    let subtitle: String?
    let iconColor: Color
    let titleColor: Color
    let action: () -> Void

    init(
        icon: String,
        title: String,
        subtitle: String? = nil,
        iconColor: Color = .blue,
        titleColor: Color = .primary,
        action: @escaping () -> Void
    ) {
        self.icon = icon
        self.title = title
        self.subtitle = subtitle
        self.iconColor = iconColor
        self.titleColor = titleColor
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(iconColor)
                    .frame(width: 24)

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.body)
                        .fontWeight(.medium)
                        .foregroundColor(titleColor)

                    if let subtitle = subtitle {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Spacer()

                if subtitle != nil {
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding(.vertical, 8)
            .contentShape(Rectangle())
        }
        .disabled(subtitle != nil) // Disable placeholder actions
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    ProfileView()
}
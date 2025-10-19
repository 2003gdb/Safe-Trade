import SwiftUI

struct TabBarView: View {
    @StateObject private var navigationModel = TabNavigationModel()
    @State private var selectedTab: TabItem = .trends

    var body: some View {
        ZStack {
            tabContent

            VStack {
                Spacer()
                customTabBarWithCenterButton
                    .background(.ultraThinMaterial)
            }
        }
            .sheet(isPresented: $navigationModel.showingReportSelection) {
                ReportSelectionView {
                    navigationModel.hideReportSelection()
                }
                .presentationDetents([.height(300)])
                .presentationDragIndicator(.visible)
            }
    }

    // MARK: - Tab Content
    @ViewBuilder
    private var tabContent: some View {
        switch selectedTab {
        case .trends:
            NavigationView {
                TrendsView()
                    .navigationTitle("Reportes")
                    .navigationBarTitleDisplayMode(.large)
            }
        case .profile:
            NavigationView {
                ProfileView()
                    .navigationTitle("Perfil")
                    .navigationBarTitleDisplayMode(.large)
            }
        }
    }

    // MARK: - Custom Tab Bar with Center Button
    private var customTabBarWithCenterButton: some View {
        HStack(spacing: 0) {
            // Trends Tab
            CustomTabBarItem(
                tab: .trends,
                isSelected: selectedTab == .trends
            ) {
                withAnimation(.easeInOut(duration: 0.2)) {
                    selectedTab = .trends
                }
                HapticFeedback.shared.selectionChanged()
            }

            Spacer()

            // Center Report Button
            Button(action: {
                navigationModel.showReportSelection()
                HapticFeedback.shared.buttonTap()
            }) {
                ZStack {
                    Circle()
                        .fill(DesignSystem.Colors.safetradeOrange)
                        .frame(width: 48, height: 48)

                    Image(systemName: "plus")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(.white)
                }
            }
            .offset(y: -8) // Slightly elevated above tab bar

            Spacer()

            // Profile Tab
            CustomTabBarItem(
                tab: .profile,
                isSelected: selectedTab == .profile
            ) {
                withAnimation(.easeInOut(duration: 0.2)) {
                    selectedTab = .profile
                }
                HapticFeedback.shared.selectionChanged()
            }
        }
        .padding(.top, 18)
        .padding(.bottom, -12)
    }

}

// MARK: - Custom Tab Bar Item
struct CustomTabBarItem: View {
    let tab: TabItem
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: tab.icon)
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(isSelected ? DesignSystem.Colors.safetradeOrange : .gray)

                Text(tab.title)
                    .font(.caption2)
                    .fontWeight(.medium)
                    .foregroundColor(isSelected ? DesignSystem.Colors.safetradeOrange : .gray)
            }
            .frame(maxWidth: .infinity)
            .contentShape(Rectangle())
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Report Selection View
struct ReportSelectionView: View {
    let onDismiss: () -> Void
    @State private var showingIdentifiedReport = false
    @State private var showingAnonymousReport = false

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header with drag indicator
                VStack(spacing: 16) {
                    // Drag indicator
                    Rectangle()
                        .fill(Color.secondary.opacity(0.5))
                        .frame(width: 36, height: 4)
                        .cornerRadius(2)
                        .padding(.top, 8)

                    // Title
                    Text("Crear Reporte")
                        .font(.title2)
                        .fontWeight(.bold)
                        .padding(.top, 8)
                }

                // Report Type Options
                VStack(spacing: 12) {
                    // Identified Report
                    Button(action: {
                        showingIdentifiedReport = true
                    }) {
                        CompactReportTypeRow(
                            icon: "person.fill.badge.plus",
                            title: "Reporte con Identificacion",
                            subtitle: "Se asociará con tu cuenta"
                        )
                    }
                    .foregroundColor(.primary)

                    Divider()
                        .padding(.horizontal, 16)

                    // Anonymous Report
                    Button(action: {
                        showingAnonymousReport = true
                    }) {
                        CompactReportTypeRow(
                            icon: "person.fill.questionmark",
                            title: "Reporte Anónimo",
                            subtitle: "Tu identidad permanecerá privada"
                        )
                    }
                    .foregroundColor(.primary)

                }
                .padding(.top, 24)
                .padding(.bottom, 8)

                Spacer()
            }
            .background(Color(.systemBackground))
            .cornerRadius(16)
            .navigationBarHidden(true)
        }
        .navigationViewStyle(StackNavigationViewStyle())
        .fullScreenCover(isPresented:$showingIdentifiedReport) {
            ReportSubmissionView(isAnonymous: false)
        }
        .fullScreenCover(isPresented: $showingAnonymousReport) {
            ReportSubmissionView(isAnonymous: true)
        }
    }
}

struct CompactReportTypeRow: View {
    let icon: String
    let title: String
    let subtitle: String

    var body: some View {
        HStack(spacing: 16) {
            // Icon with background circle
            ZStack {
                Circle()
                    .fill(Color.secondary.opacity(0.2))
                    .frame(width: 40, height: 40)

                Image(systemName: icon)
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.primary)
            }

            // Title and subtitle
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.headline)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)

                Text(subtitle)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            Spacer()

            // Chevron
            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.secondary)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .contentShape(Rectangle())
    }
}

#Preview {
    TabBarView()
}

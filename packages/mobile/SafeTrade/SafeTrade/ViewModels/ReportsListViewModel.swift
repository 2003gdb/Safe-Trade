import Foundation
import SwiftUI
import Combine

enum ReportFilter: String, CaseIterable {
    case todos = "todos"
    case misReportes = "mis_reportes"
    case nuevo = "nuevo"
    case revisado = "revisado"
    case enInvestigacion = "en_investigacion"
    case cerrado = "cerrado"

    var displayName: String {
        switch self {
        case .todos: return "Todos"
        case .misReportes: return "Mis reportes"
        case .nuevo: return "Nuevo"
        case .revisado: return "Revisado"
        case .enInvestigacion: return "En Investigación"
        case .cerrado: return "Cerrado"
        }
    }

    var isStatusFilter: Bool {
        return ![.todos, .misReportes].contains(self)
    }
}

class ReportsListViewModel: ObservableObject {
    @Published var allReports: [Report] = []
    @Published var userReports: [Report] = []
    @Published var filteredReports: [Report] = []
    @Published var communityAlert: CommunityAlert?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var selectedFilter: ReportFilter = .todos
    @Published var searchQuery: String = ""
    @Published var showingPopup = false
    @Published var communityAlertLoading = false
    @Published var communityAlertError: String?

    private let reportingService = ReportingService()
    private let communityService = CommunityService()
    private let authService = AuthenticationService.shared
    private var cancellables = Set<AnyCancellable>()
    private var dismissTimer: Timer?

    init() {
        loadReports()
        loadCommunityAlert()
        setupSearchBinding()
    }

    // MARK: - Data Loading
    func loadReports() {
        print("🔄 ReportsListViewModel: Starting to load reports...")
        isLoading = true
        errorMessage = nil

        // Load both all reports and user reports
        let allReportsPublisher = reportingService.getAllReports()
            .catch { error -> Just<[Report]> in
                print("❌ Error loading all reports: \(error)")
                return Just([Report]())
            }
            .eraseToAnyPublisher()

        let userReportsPublisher: AnyPublisher<[Report], Never>

        if AuthenticationRepository.shared.hasValidToken() {
            print("🔐 User is authenticated, loading user reports...")
            userReportsPublisher = reportingService.getUserReports()
                .catch { error -> Just<[Report]> in
                    print("❌ Error loading user reports: \(error)")
                    return Just([Report]())
                }
                .eraseToAnyPublisher()
        } else {
            print("🔓 User not authenticated, skipping user reports")
            userReportsPublisher = Just([Report]()).eraseToAnyPublisher()
        }

        Publishers.CombineLatest(allReportsPublisher, userReportsPublisher)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    print("✅ Reports loading completed")
                    if case .failure(let error) = completion {
                        print("❌ Final completion error: \(error)")
                        self?.errorMessage = "Error al cargar reportes: \(error.localizedDescription)"
                    }
                },
                receiveValue: { [weak self] allReports, userReports in
                    print("📊 Received \(allReports.count) all reports, \(userReports.count) user reports")
                    self?.allReports = allReports
                    self?.userReports = userReports
                    self?.applyFilters()
                }
            )
            .store(in: &cancellables)
    }

    func loadCommunityAlert() {
        Task {
            await MainActor.run {
                self.communityAlertLoading = true
                self.communityAlertError = nil
            }

            do {
                print("🔔 [ReportsListViewModel] Starting to load community alert...")
                let response = try await communityService.getCommunityAlert()
                print("🔔 [ReportsListViewModel] Got response - success: \(response.success)")

                await MainActor.run {
                    self.communityAlertLoading = false

                    if response.success {
                        print("✅ [ReportsListViewModel] Alert loaded successfully: \(response.alerta.nivel)")
                        self.communityAlert = response.alerta
                        self.communityAlertError = nil

                        // Auto-show only for critical (red) alerts
                        if response.alerta.nivel.lowercased() == "rojo" {
                            self.showPopupWithAutoHide()
                        }
                    } else {
                        let errorMsg = "Error del servidor al cargar alerta comunitaria"
                        print("❌ [ReportsListViewModel] Backend returned success=false")
                        self.communityAlertError = errorMsg
                        self.communityAlert = nil
                    }
                }
            } catch {
                print("❌ [ReportsListViewModel] Error loading community alert: \(error)")
                print("❌ [ReportsListViewModel] Error details: \(error.localizedDescription)")

                await MainActor.run {
                    self.communityAlertLoading = false
                    self.communityAlertError = "No se pudo cargar la alerta comunitaria"
                    self.communityAlert = nil
                }
            }
        }
    }

    func refreshData() {
        loadReports()
        loadCommunityAlert()
    }

    // MARK: - Filtering and Search
    private func setupSearchBinding() {
        $searchQuery
            .debounce(for: .milliseconds(300), scheduler: DispatchQueue.main)
            .sink { [weak self] _ in
                self?.applyFilters()
            }
            .store(in: &cancellables)

        $selectedFilter
            .sink { [weak self] _ in
                self?.applyFilters()
            }
            .store(in: &cancellables)
    }

    func applyFilters() {
        print("🔍 Applying filters...")
        print("📊 Available data: allReports=\(allReports.count), userReports=\(userReports.count)")
        print("🎯 Current filter: \(selectedFilter.displayName)")
        print("🔍 Search query: '\(searchQuery)'")

        var reports: [Report]

        // Select base dataset
        switch selectedFilter {
        case .todos:
            reports = allReports
            print("📋 Using all reports: \(reports.count)")
        case .misReportes:
            reports = userReports
            print("👤 Using user reports: \(reports.count)")
        case .nuevo, .revisado, .enInvestigacion, .cerrado:
            reports = allReports.filter { $0.status == selectedFilter.rawValue }
            print("🏷️ Filtered by status '\(selectedFilter.rawValue)': \(reports.count)")
        }

        // Apply search filter
        if !searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            let query = searchQuery.lowercased()
            let beforeSearch = reports.count
            reports = reports.filter { report in
                report.getAttackTypeDisplayName().lowercased().contains(query) ||
                (report.attackOrigin?.lowercased().contains(query) ?? false) ||
                (report.description?.lowercased().contains(query) ?? false)
            }
            print("🔎 After search filter: \(beforeSearch) → \(reports.count)")
        }

        // Sort by creation date (newest first)
        reports = reports.sorted { $0.createdAt > $1.createdAt }

        filteredReports = reports
        print("✅ Final filtered reports: \(filteredReports.count)")
    }

    func changeFilter(to filter: ReportFilter) {
        selectedFilter = filter
    }

    // MARK: - UI Helpers
    var hasData: Bool {
        return !allReports.isEmpty || !userReports.isEmpty
    }

    var canShowMyReports: Bool {
        return AuthenticationRepository.shared.hasValidToken()
    }

    var emptyStateMessage: String {
        if isLoading {
            return "Cargando reportes..."
        }

        if !searchQuery.isEmpty {
            return "No se encontraron reportes que coincidan con '\(searchQuery)'"
        }

        switch selectedFilter {
        case .todos:
            return "No hay reportes disponibles"
        case .misReportes:
            return "No tienes reportes enviados"
        default:
            return "No hay reportes con estado '\(selectedFilter.displayName)'"
        }
    }

    // MARK: - Status Helpers
    func statusColor(for report: Report) -> Color {
        switch report.status {
        case "nuevo":
            return .blue
        case "revisado":
            return .orange
        case "en_investigacion":
            return .purple
        case "cerrado":
            return .green
        default:
            return .gray
        }
    }

    func statusIcon(for report: Report) -> String {
        switch report.status {
        case "nuevo":
            return "doc.badge.plus"
        case "revisado":
            return "eye"
        case "en_investigacion":
            return "magnifyingglass"
        case "cerrado":
            return "checkmark.circle"
        default:
            return "circle"
        }
    }

    func attackTypeIcon(for report: Report) -> String {
        switch report.attackType {
        case "email":
            return "envelope"
        case "SMS":
            return "message"
        case "whatsapp":
            return "message.fill"
        case "llamada":
            return "phone"
        case "redes_sociales":
            return "person.2"
        case "otro":
            return "questionmark.circle"
        default:
            return "exclamationmark.triangle"
        }
    }

    func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        formatter.locale = Locale(identifier: "es_ES")
        return formatter.string(from: date)
    }

    func reporterName(for report: Report) -> String {
        if report.isAnonymous == true {
            return "Anónimo"
        }
        // For now, return placeholder - in real app this would come from user data
        return "Usuario"
    }

    // MARK: - Popup Actions
    func togglePopup() {
        // Cancel any existing timer
        dismissTimer?.invalidate()
        dismissTimer = nil

        // Toggle the popup
        withAnimation {
            showingPopup.toggle()
        }
    }

    private func showPopupWithAutoHide() {
        // Cancel any existing timer
        dismissTimer?.invalidate()

        // Show popup
        withAnimation {
            showingPopup = true
        }

        // Set timer to auto-hide after 5 seconds
        dismissTimer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: false) { [weak self] _ in
            withAnimation {
                self?.showingPopup = false
            }
        }
    }

    func showPopup() {
        showPopupWithAutoHide()
    }

    func hidePopup() {
        dismissTimer?.invalidate()
        dismissTimer = nil
        withAnimation {
            showingPopup = false
        }
    }

    var mostCommonAttackMessage: String {
        guard let alert = communityAlert else {
            return "No hay datos de alerta disponibles"
        }
        return alert.mensaje
    }
}
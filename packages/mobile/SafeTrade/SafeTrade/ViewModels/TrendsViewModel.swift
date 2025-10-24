import Foundation
import SwiftUI
import Combine

class TrendsViewModel: ObservableObject {
    @Published var trendsData: CommunityTrendsData?
    @Published var communityAlert: CommunityAlert?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var selectedPeriod: TrendPeriod = .thirtyDays
    @Published var showingPeriodPicker = false
    @Published var catalogData: CatalogData?

    private let communityService = CommunityService()
    private let catalogService = CatalogService.shared

    init() {
        Task { @MainActor in
            // Subscribe to catalog updates
            catalogService.$catalogData
                .assign(to: \.catalogData, on: self)
                .store(in: &cancellables)

            await loadCatalogData()
            loadTrends()
            loadCommunityAlert()
        }
    }

    private var cancellables = Set<AnyCancellable>()

    // MARK: - Catalog Loading

    private func loadCatalogData() async {
        await catalogService.ensureCatalogsLoaded()
    }

    // MARK: - Data Loading
    func loadTrends(period: TrendPeriod? = nil) {
        let periodToUse = period ?? selectedPeriod
        isLoading = true
        errorMessage = nil

        Task {
            do {
                let response = try await communityService.getTrends(period: periodToUse)
                await MainActor.run {
                    self.isLoading = false
                    if response.success {
                        self.trendsData = response.data
                    } else {
                        self.errorMessage = response.message
                    }
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.errorMessage = "Error al cargar tendencias"
                }
            }
        }
    }

    func loadCommunityAlert() {
        Task {
            do {
                let response = try await communityService.getCommunityAlert()
                await MainActor.run {
                    if response.success {
                        self.communityAlert = response.alerta
                    }
                }
            } catch {
                #if DEBUG
                print("Error loading community alert")
                #endif
            }
        }
    }

    func refreshData() {
        loadTrends()
        loadCommunityAlert()
    }

    // MARK: - Period Selection
    func changePeriod(to period: TrendPeriod) {
        selectedPeriod = period
        loadTrends(period: period)
    }

    // MARK: - Data Processing
    var topAttackTypes: [TrendData] {
        return trendsData?.attackTrends.prefix(5).map { $0 } ?? []
    }

    var topImpactLevels: [TrendData] {
        return trendsData?.impactTrends.prefix(3).map { $0 } ?? []
    }

    var recentTimeTrends: [TimeBasedTrend] {
        return trendsData?.timeTrends.suffix(7).map { $0 } ?? []
    }

    var communityStats: CommunityStats? {
        return trendsData?.communityStats
    }

    var trendsSummary: TrendsSummary? {
        return trendsData?.summary
    }

    // MARK: - Chart Data Preparation
    var attackTypesChartData: [(String, Double)] {
        return topAttackTypes.map { ($0.attackType, $0.percentageValue) }
    }

    var impactLevelsChartData: [(String, Double)] {
        return topImpactLevels.map { ($0.attackType, $0.percentageValue) }
    }

    var timeBasedChartData: [(String, Int)] {
        return recentTimeTrends.compactMap { trend in
            guard let date = trend.displayDate else { return nil }
            let formatter = DateFormatter()
            formatter.dateFormat = "dd/MM"
            return (formatter.string(from: date), trend.count)
        }
    }

    // MARK: - UI Helpers
    var hasData: Bool {
        return trendsData != nil
    }

    var totalReports: Int {
        return communityStats?.totalReports ?? 0
    }

    var mainThreatDescription: String {
        guard let summary = trendsSummary else {
            return "No hay datos suficientes para determinar la amenaza principal"
        }
        return "La amenaza principal es: \(summary.mainThreat)"
    }

    var alertLevelDescription: String {
        guard let alert = communityAlert else {
            return "Estado de alerta no disponible"
        }
        return alert.mensaje
    }

    var periodDisplayName: String {
        return selectedPeriod.displayName
    }

    // MARK: - Color Helpers
    func colorForAttackType(_ attackType: String) -> Color {
        return CatalogHelpers.attackTypeColor(for: attackType)
    }

    func colorForImpactLevel(_ impactLevel: String) -> Color {
        return CatalogHelpers.impactColor(for: impactLevel)
    }

    func colorForStatus(_ status: String) -> Color {
        return CatalogHelpers.statusColor(for: status)
    }

    // MARK: - Display Name Helpers

    func getDisplayName(for catalogItem: String) -> String {
        return CatalogHelpers.getLocalizedName(for: catalogItem)
    }

    func getAttackTypeDisplayName(for value: String) -> String {
        return CatalogHelpers.getLocalizedName(for: value)
    }

    func getImpactDisplayName(for value: String) -> String {
        return CatalogHelpers.getLocalizedName(for: value)
    }

    func getStatusDisplayName(for value: String) -> String {
        return CatalogHelpers.getLocalizedName(for: value)
    }

    // Legacy ID-based methods (for backward compatibility if needed)
    func getAttackTypeDisplayName(for id: Int) -> String {
        guard let catalogData = catalogData,
              let attackType = catalogData.attackTypes.first(where: { $0.id == id }) else {
            return "Desconocido"
        }
        return CatalogHelpers.getLocalizedName(for: attackType.name)
    }

    func getImpactDisplayName(for id: Int) -> String {
        guard let catalogData = catalogData,
              let impact = catalogData.impacts.first(where: { $0.id == id }) else {
            return "Desconocido"
        }
        return CatalogHelpers.getLocalizedName(for: impact.name)
    }

    func getStatusDisplayName(for id: Int) -> String {
        guard let catalogData = catalogData,
              let status = catalogData.statuses.first(where: { $0.id == id }) else {
            return "Desconocido"
        }
        return CatalogHelpers.getLocalizedName(for: status.name)
    }

    // MARK: - Percentage Formatting
    func formatPercentage(_ percentage: Double) -> String {
        return String(format: "%.1f%%", percentage)
    }

    func formatCount(_ count: Int) -> String {
        if count >= 1000 {
            return String(format: "%.1fK", Double(count) / 1000.0)
        }
        return "\(count)"
    }
}
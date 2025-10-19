import Foundation
import Combine

class CommunityService: ObservableObject {
    private let apiService: APIService
    private var cancellables = Set<AnyCancellable>()

    init() {
        self.apiService = APIService.shared
    }

    // MARK: - Trends Data
    func getTrends(period: TrendPeriod = .thirtyDays) async throws -> CommunityTrendsResponse {
        let endpoint = "/comunidad/tendencias?period=\(period.rawValue)"

        return try await apiService.request(
            endpoint: endpoint,
            method: .GET,
            responseType: CommunityTrendsResponse.self
        )
    }

    // MARK: - Community Analytics
    func getAnalytics() async throws -> CommunityAnalyticsResponse {
        let endpoint = "/comunidad/analytics"

        return try await apiService.request(
            endpoint: endpoint,
            method: .GET,
            responseType: CommunityAnalyticsResponse.self
        )
    }

    // MARK: - Community Alert
    func getCommunityAlert() async throws -> CommunityAlertResponse {
        let endpoint = "/comunidad/alerta"

        return try await apiService.request(
            endpoint: endpoint,
            method: .GET,
            responseType: CommunityAlertResponse.self
        )
    }

    // MARK: - Local Recommendations
    func getRecommendation(for attackType: String) -> Recommendation? {
        return RecommendationsData.getRecommendation(for: attackType)
    }

    func getAllRecommendations(for attackType: String) -> [Recommendation] {
        return RecommendationsData.getAllRecommendations(for: attackType)
    }

    func getSecurityQuote() -> String {
        return RecommendationsData.getRandomSecurityQuote()
    }

    func getGeneralTips() -> [String] {
        return RecommendationsData.generalTips
    }

    // MARK: - Error Handling
    enum CommunityError: LocalizedError {
        case invalidURL
        case noData
        case decodingError
        case networkError(String)
        case unauthorized
        case serverError(String)

        var errorDescription: String? {
            switch self {
            case .invalidURL:
                return "URL inválida"
            case .noData:
                return "No se encontraron datos"
            case .decodingError:
                return "Error al procesar respuesta"
            case .networkError(let message):
                return "Error de red: \(message)"
            case .unauthorized:
                return "No autorizado"
            case .serverError(let message):
                return "Error del servidor: \(message)"
            }
        }
    }

    private func mapError(_ error: Error) -> CommunityError {
        // Map APIService errors to CommunityError
        return .networkError("Error de conexión")
    }
}

// MARK: - Response Models
struct CommunityAnalyticsResponse: Codable {
    let success: Bool
    let message: String
    let data: CommunityAnalyticsData
    let metadata: ResponseMetadata
}

struct CommunityAnalyticsData: Codable {
    let communityOverview: CommunityStats
    let recentTrends: [TrendData]
    let suspiciousOrigins: [SuspiciousOrigin]
    let insights: [String]

    enum CodingKeys: String, CodingKey {
        case communityOverview = "community_overview"
        case recentTrends = "recent_trends"
        case suspiciousOrigins = "suspicious_origins"
        case insights
    }
}

struct SuspiciousOrigin: Codable, Identifiable {
    let id: Int
    let attackOrigin: String
    let reportCount: Int
    let attackTypes: String

    enum CodingKeys: String, CodingKey {
        case id
        case attackOrigin = "attack_origin"
        case reportCount = "report_count"
        case attackTypes = "attack_types"
    }

    var attackTypesList: [String] {
        return attackTypes.components(separatedBy: ",").map { $0.trimmingCharacters(in: .whitespaces) }
    }
}

struct CommunityAlertResponse: Codable {
    let success: Bool
    let alerta: CommunityAlert
}

struct CommunityAlert: Codable {
    let nivel: String
    let mensaje: String
    let ultimaActualizacion: String

    enum CodingKeys: String, CodingKey {
        case nivel
        case mensaje
        case ultimaActualizacion = "ultima_actualizacion"
    }

    var alertLevelColor: String {
        switch nivel.lowercased() {
        case "rojo":
            return "red"
        case "amarillo":
            return "orange"
        default:
            return "green"
        }
    }

    var alertLevelIcon: String {
        switch nivel.lowercased() {
        case "rojo":
            return "exclamationmark.triangle.fill"
        case "amarillo":
            return "exclamationmark.circle.fill"
        default:
            return "checkmark.circle.fill"
        }
    }
}

// Note: Recommendation models are now defined in Models/Recommendation.swift

struct ResponseMetadata: Codable {
    let generatedAt: String
    let userAccess: String

    enum CodingKeys: String, CodingKey {
        case generatedAt = "generated_at"
        case userAccess = "user_access"
    }
}
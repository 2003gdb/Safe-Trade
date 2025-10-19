import Foundation

// MARK: - Trend Data Models
struct TrendData: Codable, Identifiable, Equatable {
    let attackType: String
    let count: Int
    let percentage: String // Backend returns percentage as string
    let trendDirection: TrendDirection?

    // Computed property for Identifiable conformance
    var id: String { attackType }

    enum CodingKeys: String, CodingKey {
        case attackType = "attack_type"
        case count
        case percentage
        case trendDirection = "trend_direction"
    }

    // Computed property to get percentage as Double for calculations
    var percentageValue: Double {
        return Double(percentage) ?? 0.0
    }
}

enum TrendDirection: String, Codable, CaseIterable {
    case increasing = "increasing"
    case decreasing = "decreasing"
    case stable = "stable"

    var displayName: String {
        switch self {
        case .increasing:
            return "En Aumento"
        case .decreasing:
            return "En Disminución"
        case .stable:
            return "Estable"
        }
    }

    var icon: String {
        switch self {
        case .increasing:
            return "arrow.up.circle.fill"
        case .decreasing:
            return "arrow.down.circle.fill"
        case .stable:
            return "minus.circle.fill"
        }
    }

    var color: String {
        switch self {
        case .increasing:
            return "red"
        case .decreasing:
            return "green"
        case .stable:
            return "blue"
        }
    }
}

// MARK: - Community Stats
struct CommunityStats: Codable {
    let totalReports: Int
    let activePeriod: String
    let mostCommonAttack: String
    let highestImpactCount: Int
    let anonymousPercentage: Double

    enum CodingKeys: String, CodingKey {
        case totalReports = "total_reports"
        case activePeriod = "active_period"
        case mostCommonAttack = "most_common_attack"
        case highestImpactCount = "highest_impact_count"
        case anonymousPercentage = "anonymous_percentage"
    }
}

// MARK: - Time Based Trends
struct TimeBasedTrend: Codable, Identifiable, Equatable {
    let date: String
    let count: Int

    // Computed property for Identifiable conformance
    var id: String { date }

    enum CodingKeys: String, CodingKey {
        case date
        case count
    }

    var displayDate: Date? {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.date(from: date)
    }
}

// MARK: - Trends Summary
struct TrendsSummary: Codable {
    let mainThreat: String
    let mainImpact: String
    let totalReports: Int
    let communityAlertLevel: String
    let keyInsight: String

    enum CodingKeys: String, CodingKey {
        case mainThreat = "main_threat"
        case mainImpact = "main_impact"
        case totalReports = "total_reports"
        case communityAlertLevel = "community_alert_level"
        case keyInsight = "key_insight"
    }

    var alertLevelColor: String {
        switch communityAlertLevel.lowercased() {
        case "alto":
            return "red"
        case "medio":
            return "orange"
        default:
            return "green"
        }
    }

    var alertLevelIcon: String {
        switch communityAlertLevel.lowercased() {
        case "alto":
            return "exclamationmark.triangle.fill"
        case "medio":
            return "exclamationmark.circle.fill"
        default:
            return "checkmark.circle.fill"
        }
    }
}

// MARK: - Community Trends Response
struct CommunityTrendsResponse: Codable {
    let success: Bool
    let message: String
    let data: CommunityTrendsData
    let userContext: UserContext

    enum CodingKeys: String, CodingKey {
        case success
        case message
        case data
        case userContext = "user_context"
    }
}

struct CommunityTrendsData: Codable {
    let period: String
    let communityStats: CommunityStats
    let attackTrends: [TrendData]
    let impactTrends: [TrendData]
    let timeTrends: [TimeBasedTrend]
    let summary: TrendsSummary

    enum CodingKeys: String, CodingKey {
        case period
        case communityStats = "community_stats"
        case attackTrends = "attack_trends"
        case impactTrends = "impact_trends"
        case timeTrends = "time_trends"
        case summary
    }
}

struct UserContext: Codable {
    let accessType: String
    let viewingPeriod: String

    enum CodingKeys: String, CodingKey {
        case accessType = "access_type"
        case viewingPeriod = "viewing_period"
    }
}

// MARK: - Time Period Options
enum TrendPeriod: String, CaseIterable {
    case sevenDays = "7days"
    case thirtyDays = "30days"
    case ninetyDays = "90days"

    var displayName: String {
        switch self {
        case .sevenDays:
            return "Última Semana"
        case .thirtyDays:
            return "Último Mes"
        case .ninetyDays:
            return "Últimos 3 Meses"
        }
    }

    var shortName: String {
        switch self {
        case .sevenDays:
            return "7d"
        case .thirtyDays:
            return "30d"
        case .ninetyDays:
            return "90d"
        }
    }
}
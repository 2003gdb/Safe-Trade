import Foundation

class UserPreferencesService {
    static let shared = UserPreferencesService()

    private let userDefaults = UserDefaults.standard

    // Keys for storing user preferences
    private enum Keys {
        static let recentAttackTypes = "recent_attack_types"
        static let recentAttackOrigins = "recent_attack_origins"
        static let preferredImpactLevel = "preferred_impact_level"
        static let lastUsedAttackType = "last_used_attack_type"
    }

    private init() {}

    // MARK: - Attack Type Preferences

    func recordAttackTypeUsage(_ attackType: LegacyAttackType) {
        var recentTypes = getRecentAttackTypes()

        // Remove if already exists to avoid duplicates
        recentTypes.removeAll { $0 == attackType.rawValue }

        // Add to front of list
        recentTypes.insert(attackType.rawValue, at: 0)

        // Keep only last 5 entries
        if recentTypes.count > 5 {
            recentTypes = Array(recentTypes.prefix(5))
        }

        userDefaults.set(recentTypes, forKey: Keys.recentAttackTypes)
        userDefaults.set(attackType.rawValue, forKey: Keys.lastUsedAttackType)
    }

    func getRecentAttackTypes() -> [String] {
        return userDefaults.stringArray(forKey: Keys.recentAttackTypes) ?? []
    }

    func getMostUsedAttackType() -> LegacyAttackType? {
        let recentTypes = getRecentAttackTypes()
        guard let mostRecentType = recentTypes.first,
              let attackType = LegacyAttackType(rawValue: mostRecentType) else {
            return nil
        }
        return attackType
    }

    func getSuggestedAttackTypes() -> [LegacyAttackType] {
        let recentTypes = getRecentAttackTypes()
        var suggestions: [LegacyAttackType] = []

        // Add recent types first
        for typeString in recentTypes {
            if let attackType = LegacyAttackType(rawValue: typeString) {
                suggestions.append(attackType)
            }
        }

        // Add remaining types that haven't been used recently
        let allTypes = LegacyAttackType.allCases
        for attackType in allTypes {
            if !suggestions.contains(attackType) {
                suggestions.append(attackType)
            }
        }

        return suggestions
    }

    // MARK: - Attack Origin Suggestions

    func recordAttackOriginUsage(_ origin: String) {
        var recentOrigins = getRecentAttackOrigins()

        // Clean and validate origin
        let cleanOrigin = origin.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanOrigin.isEmpty && cleanOrigin.count < 100 else { return }

        // Remove if already exists
        recentOrigins.removeAll { $0 == cleanOrigin }

        // Add to front
        recentOrigins.insert(cleanOrigin, at: 0)

        // Keep only last 10 entries
        if recentOrigins.count > 10 {
            recentOrigins = Array(recentOrigins.prefix(10))
        }

        userDefaults.set(recentOrigins, forKey: Keys.recentAttackOrigins)
    }

    func getRecentAttackOrigins() -> [String] {
        return userDefaults.stringArray(forKey: Keys.recentAttackOrigins) ?? []
    }

    func getAttackOriginSuggestions(for attackType: LegacyAttackType) -> [String] {
        let recentOrigins = getRecentAttackOrigins()

        // Filter suggestions based on attack type pattern
        return recentOrigins.filter { origin in
            switch attackType {
            case .email:
                return origin.contains("@") || origin.lowercased().contains("correo")
            case .sms, .whatsapp, .llamada:
                return origin.contains("+") || origin.contains("55") || origin.contains("52")
            case .redesSociales:
                return origin.contains("@") && !origin.contains(".")
            case .otro:
                return true // Accept any for "otro"
            }
        }
    }

    // MARK: - Impact Level Preferences

    func recordImpactLevelUsage(_ impactLevel: LegacyImpactLevel) {
        userDefaults.set(impactLevel.rawValue, forKey: Keys.preferredImpactLevel)
    }

    func getPreferredImpactLevel() -> LegacyImpactLevel? {
        guard let levelString = userDefaults.string(forKey: Keys.preferredImpactLevel),
              let impactLevel = LegacyImpactLevel(rawValue: levelString) else {
            return nil
        }
        return impactLevel
    }

    // MARK: - Clear Data

    func clearUserPreferences() {
        userDefaults.removeObject(forKey: Keys.recentAttackTypes)
        userDefaults.removeObject(forKey: Keys.recentAttackOrigins)
        userDefaults.removeObject(forKey: Keys.preferredImpactLevel)
        userDefaults.removeObject(forKey: Keys.lastUsedAttackType)
    }
}
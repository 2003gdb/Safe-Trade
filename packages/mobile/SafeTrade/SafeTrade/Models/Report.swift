import Foundation

// MARK: - Legacy Enums for Backward Compatibility
// NOTE: These are kept for DraftManager and UserPreferencesService compatibility
// New code should use CatalogHelpers and string-based values from the backend

// Legacy AttackType enum for backward compatibility (use CatalogHelpers for new code)
enum LegacyAttackType: String, Codable, CaseIterable {
    case email = "email"
    case sms = "SMS"
    case whatsapp = "whatsapp"
    case llamada = "llamada"
    case redesSociales = "redes_sociales"
    case otro = "otro"

    var displayName: String {
        switch self {
        case .email: return "Correo Electrónico"
        case .sms: return "SMS"
        case .whatsapp: return "WhatsApp"
        case .llamada: return "Llamada Telefónica"
        case .redesSociales: return "Redes Sociales"
        case .otro: return "Otro"
        }
    }

    var description: String {
        switch self {
        case .email: return "Correos de phishing, enlaces maliciosos, archivos adjuntos sospechosos"
        case .sms: return "Mensajes de texto fraudulentos con enlaces o solicitudes de información"
        case .whatsapp: return "Mensajes de WhatsApp con enlaces sospechosos o intentos de estafa"
        case .llamada: return "Llamadas telefónicas fraudulentas solicitando información personal"
        case .redesSociales: return "Ataques a través de Facebook, Instagram, Twitter u otras redes sociales"
        case .otro: return "Otros tipos de ataques cibernéticos"
        }
    }

    // Convert to string value for catalog system
    var catalogValue: String {
        return self.rawValue
    }

    // Create from catalog string value
    static func from(catalogValue: String) -> LegacyAttackType? {
        return LegacyAttackType(rawValue: catalogValue)
    }
}

// Legacy ImpactLevel enum for backward compatibility (use CatalogHelpers for new code)
enum LegacyImpactLevel: String, Codable, CaseIterable {
    case ninguno = "ninguno"
    case roboDatos = "robo_datos"
    case roboDinero = "robo_dinero"
    case cuentaComprometida = "cuenta_comprometida"

    var displayName: String {
        switch self {
        case .ninguno: return "Sin Impacto"
        case .roboDatos: return "Robo de Datos"
        case .roboDinero: return "Robo de Dinero"
        case .cuentaComprometida: return "Cuenta Comprometida"
        }
    }

    var description: String {
        switch self {
        case .ninguno: return "No sufrí ningún daño, solo quiero reportar el intento"
        case .roboDatos: return "Mis datos personales fueron robados o comprometidos"
        case .roboDinero: return "Perdí dinero debido a este ataque"
        case .cuentaComprometida: return "Una o más de mis cuentas fueron comprometidas"
        }
    }

    var severity: Int {
        switch self {
        case .ninguno: return 0
        case .roboDatos: return 2
        case .cuentaComprometida: return 3
        case .roboDinero: return 4
        }
    }

    // Convert to string value for catalog system
    var catalogValue: String {
        return self.rawValue
    }

    // Create from catalog string value
    static func from(catalogValue: String) -> LegacyImpactLevel? {
        return LegacyImpactLevel(rawValue: catalogValue)
    }
}

// Legacy ReportStatus enum for backward compatibility (use CatalogHelpers for new code)
enum LegacyReportStatus: String, Codable {
    case nuevo = "nuevo"
    case revisado = "revisado"
    case enInvestigacion = "en_investigacion"
    case cerrado = "cerrado"

    var displayName: String {
        switch self {
        case .nuevo: return "Nuevo"
        case .revisado: return "Revisado"
        case .enInvestigacion: return "En Investigación"
        case .cerrado: return "Cerrado"
        }
    }

    // Convert to string value for catalog system
    var catalogValue: String {
        return self.rawValue
    }

    // Create from catalog string value
    static func from(catalogValue: String) -> LegacyReportStatus? {
        return LegacyReportStatus(rawValue: catalogValue)
    }
}

// Request DTO for creating reports
struct CreateReportRequest: Codable {
    let isAnonymous: Bool
    let attackType: String
    let incidentDate: String
    let incidentTime: String?
    let attackOrigin: String
    let suspiciousUrl: String?
    let messageContent: String?
    let impactLevel: String
    let description: String?
    let evidenceUrl: String? // NEW: Support for evidence upload

    enum CodingKeys: String, CodingKey {
        case isAnonymous = "is_anonymous"
        case attackType = "attack_type"
        case incidentDate = "incident_date"
        case incidentTime = "incident_time"
        case attackOrigin = "attack_origin"
        case suspiciousUrl = "suspicious_url"
        case messageContent = "message_content"
        case impactLevel = "impact_level"
        case description
        case evidenceUrl = "evidence_url"
    }
}

// Response from backend after creating report
struct CreateReportResponse: Codable {
    let success: Bool
    let message: String
    let reporte: ReportSummary?
    let recommendations: [String]?
    let victimSupport: VictimSupport?
    enum CodingKeys: String, CodingKey {
        case success
        case message
        case reporte
        case recommendations
        case victimSupport = "victim_support"
    }
}

struct ReportSummary: Codable {
    let id: Int
    let attackType: String
    let incidentDate: String
    let impactLevel: String
    let status: String
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case attackType = "attack_type"
        case incidentDate = "incident_date"
        case impactLevel = "impact_level"
        case status
        case createdAt = "created_at"
    }

    // Explicit initializer for creating instances programmatically
    init(id: Int, attackType: String, incidentDate: String, impactLevel: String, status: String, createdAt: Date) {
        self.id = id
        self.attackType = attackType
        self.incidentDate = incidentDate
        self.impactLevel = impactLevel
        self.status = status
        self.createdAt = createdAt
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        attackType = try container.decode(String.self, forKey: .attackType)
        incidentDate = try container.decode(String.self, forKey: .incidentDate)
        impactLevel = try container.decode(String.self, forKey: .impactLevel)
        status = try container.decode(String.self, forKey: .status)

        let createdAtString = try container.decode(String.self, forKey: .createdAt)
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: createdAtString) {
            createdAt = date
        } else {
            throw DecodingError.dataCorrupted(DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Invalid date format"))
        }
    }
}

struct VictimSupport: Codable {
    let title: String
    let steps: [String]
    let resources: [String]
}

// MARK: - Catalog System Models

// Dynamic coding key for flexible decoding
struct DynamicCodingKeys: CodingKey {
    var stringValue: String
    var intValue: Int?

    init?(stringValue: String) {
        self.stringValue = stringValue
    }

    init?(intValue: Int) {
        return nil
    }
}

// MARK: - Catalog Data Container
struct CatalogData: Codable {
    let attackTypes: [CatalogAttackType]
    let impacts: [CatalogImpact]
    let statuses: [CatalogStatus]

    enum CodingKeys: String, CodingKey {
        case attackTypes = "attackTypes"
        case impacts
        case statuses
    }

    // Custom decoder to handle both camelCase and snake_case from backend
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: DynamicCodingKeys.self)

        // Try both possible keys for attack types
        if let attackTypesArray = try? container.decode([CatalogAttackType].self, forKey: DynamicCodingKeys(stringValue: "attackTypes")!) {
            self.attackTypes = attackTypesArray
        } else if let attackTypesArray = try? container.decode([CatalogAttackType].self, forKey: DynamicCodingKeys(stringValue: "attack_types")!) {
            self.attackTypes = attackTypesArray
        } else {
            throw DecodingError.keyNotFound(
                DynamicCodingKeys(stringValue: "attackTypes")!,
                DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Missing attackTypes or attack_types")
            )
        }

        self.impacts = try container.decode([CatalogImpact].self, forKey: DynamicCodingKeys(stringValue: "impacts")!)
        self.statuses = try container.decode([CatalogStatus].self, forKey: DynamicCodingKeys(stringValue: "statuses")!)
    }
}

// MARK: - Catalog Item Models
struct CatalogAttackType: Codable, Identifiable, Hashable {
    let id: Int
    let name: String

    enum CodingKeys: String, CodingKey {
        case id, name
    }
}

struct CatalogImpact: Codable, Identifiable, Hashable {
    let id: Int
    let name: String

    enum CodingKeys: String, CodingKey {
        case id, name
    }
}

struct CatalogStatus: Codable, Identifiable, Hashable {
    let id: Int
    let name: String

    enum CodingKeys: String, CodingKey {
        case id, name
    }
}

// MARK: - API Response Models
struct CatalogResponse: Codable {
    let success: Bool
    let data: CatalogData

    enum CodingKeys: String, CodingKey {
        case success
        case data
    }
}

struct ReportsListResponse: Codable {
    let data: [Report]
    let total: Int
    let page: Int?
    let limit: Int?
    let totalPages: Int?

    enum CodingKeys: String, CodingKey {
        case data
        case total
        case page
        case limit
        case totalPages = "total_pages"
    }
}

// MARK: - Catalog Cache Model
struct CatalogCache: Codable {
    let data: CatalogData
    let lastUpdated: Date
    let version: String

    var isExpired: Bool {
        Date().timeIntervalSince(lastUpdated) > 3600 // 1 hour
    }
}

// MARK: - Report Model (TRUE V2 - matches database TIMESTAMP schema)
struct Report: Codable, Identifiable {
    let id: Int
    let userId: Int?
    let isAnonymous: Bool?
    let attackType: String
    let incidentDate: Date // Database TIMESTAMP - combined date+time
    let evidenceUrl: String?
    let attackOrigin: String?
    let suspiciousUrl: String?
    let messageContent: String?
    let description: String?
    let impactLevel: String
    let status: String
    let adminNotes: String?
    let createdAt: Date
    let updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case isAnonymous = "is_anonymous"
        case attackType = "attack_type"
        case incidentDate = "incident_date"
        case evidenceUrl = "evidence_url"
        case attackOrigin = "attack_origin"
        case suspiciousUrl = "suspicious_url"
        case messageContent = "message_content"
        case description
        case impactLevel = "impact_level"
        case status
        case adminNotes = "admin_notes"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    // Computed properties for legacy string format (for display/API)
    var incidentDateString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: incidentDate)
    }

    var incidentTimeString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm:ss"
        return formatter.string(from: incidentDate)
    }

    // Backward compatibility alias
    var incidentDateTime: Date {
        return incidentDate
    }

    // Display helpers using catalog system
    func getAttackTypeDisplayName() -> String {
        return CatalogHelpers.getLocalizedName(for: attackType)
    }

    func getImpactLevelDisplayName() -> String {
        return CatalogHelpers.getLocalizedName(for: impactLevel)
    }

    func getStatusDisplayName() -> String {
        return CatalogHelpers.getLocalizedName(for: status)
    }

    // Explicit initializer for creating instances programmatically
    init(id: Int, userId: Int?, isAnonymous: Bool?, attackType: String, incidentDate: Date,
         evidenceUrl: String?, attackOrigin: String?, suspiciousUrl: String?,
         messageContent: String?, description: String?, impactLevel: String, status: String,
         adminNotes: String?, createdAt: Date, updatedAt: Date?) {
        self.id = id
        self.userId = userId
        self.isAnonymous = isAnonymous
        self.attackType = attackType
        self.incidentDate = incidentDate
        self.evidenceUrl = evidenceUrl
        self.attackOrigin = attackOrigin
        self.suspiciousUrl = suspiciousUrl
        self.messageContent = messageContent
        self.description = description
        self.impactLevel = impactLevel
        self.status = status
        self.adminNotes = adminNotes
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }

    // Custom decoder - handles Date/ISO8601 string from backend
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        userId = try container.decodeIfPresent(Int.self, forKey: .userId)
        isAnonymous = try container.decodeIfPresent(Bool.self, forKey: .isAnonymous)
        attackType = try container.decode(String.self, forKey: .attackType)

        // Try to decode as ISO8601 string first, then fall back to Date
        if let dateString = try? container.decode(String.self, forKey: .incidentDate) {
            let isoFormatter = ISO8601DateFormatter()
            isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = isoFormatter.date(from: dateString) {
                incidentDate = date
            } else {
                // Try without fractional seconds
                isoFormatter.formatOptions = [.withInternetDateTime]
                if let date = isoFormatter.date(from: dateString) {
                    incidentDate = date
                } else {
                    throw DecodingError.dataCorrupted(DecodingError.Context(
                        codingPath: decoder.codingPath,
                        debugDescription: "Invalid incident date format: \(dateString)"
                    ))
                }
            }
        } else if let date = try? container.decode(Date.self, forKey: .incidentDate) {
            incidentDate = date
        } else {
            throw DecodingError.dataCorrupted(DecodingError.Context(
                codingPath: decoder.codingPath,
                debugDescription: "Could not decode incident_date"
            ))
        }

        evidenceUrl = try container.decodeIfPresent(String.self, forKey: .evidenceUrl)
        attackOrigin = try container.decodeIfPresent(String.self, forKey: .attackOrigin)
        suspiciousUrl = try container.decodeIfPresent(String.self, forKey: .suspiciousUrl)
        messageContent = try container.decodeIfPresent(String.self, forKey: .messageContent)
        description = try container.decodeIfPresent(String.self, forKey: .description)
        impactLevel = try container.decode(String.self, forKey: .impactLevel)
        status = try container.decode(String.self, forKey: .status)
        adminNotes = try container.decodeIfPresent(String.self, forKey: .adminNotes)

        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        let createdAtString = try container.decode(String.self, forKey: .createdAt)
        if let date = isoFormatter.date(from: createdAtString) {
            createdAt = date
        } else {
            // Try without fractional seconds
            isoFormatter.formatOptions = [.withInternetDateTime]
            if let date = isoFormatter.date(from: createdAtString) {
                createdAt = date
            } else {
                throw DecodingError.dataCorrupted(DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Invalid createdAt date format"))
            }
        }

        if let updatedAtString = try? container.decode(String.self, forKey: .updatedAt) {
            isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = isoFormatter.date(from: updatedAtString) {
                updatedAt = date
            } else {
                isoFormatter.formatOptions = [.withInternetDateTime]
                updatedAt = isoFormatter.date(from: updatedAtString)
            }
        } else {
            updatedAt = nil
        }
    }

    // Custom encoder - sends Date as ISO8601 string to backend
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encodeIfPresent(userId, forKey: .userId)
        try container.encodeIfPresent(isAnonymous, forKey: .isAnonymous)
        try container.encode(attackType, forKey: .attackType)

        // Encode Date as ISO8601 string
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        try container.encode(isoFormatter.string(from: incidentDate), forKey: .incidentDate)

        try container.encodeIfPresent(evidenceUrl, forKey: .evidenceUrl)
        try container.encodeIfPresent(attackOrigin, forKey: .attackOrigin)
        try container.encodeIfPresent(suspiciousUrl, forKey: .suspiciousUrl)
        try container.encodeIfPresent(messageContent, forKey: .messageContent)
        try container.encodeIfPresent(description, forKey: .description)
        try container.encode(impactLevel, forKey: .impactLevel)
        try container.encode(status, forKey: .status)
        try container.encodeIfPresent(adminNotes, forKey: .adminNotes)

        try container.encode(isoFormatter.string(from: createdAt), forKey: .createdAt)
        if let updatedAt = updatedAt {
            try container.encode(isoFormatter.string(from: updatedAt), forKey: .updatedAt)
        }
    }
}

// MARK: - Report with Details (same as Report)
typealias ReportWithDetails = Report

// MARK: - Backward Compatibility Aliases
typealias NormalizedReport = Report // For backward compatibility during transition

// MARK: - Create Report V2 DTO (matches DB TIMESTAMP schema)
struct CreateReportV2: Codable {
    let userId: Int?
    let isAnonymous: Bool
    let attackType: String
    let incidentDate: Date  // Single Date field (matches DB TIMESTAMP)
    let evidenceUrl: String?
    let attackOrigin: String
    let suspiciousUrl: String?
    let messageContent: String?
    let description: String?
    let impactLevel: String

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case isAnonymous = "is_anonymous"
        case attackType = "attack_type"
        case incidentDate = "incident_date"
        case evidenceUrl = "evidence_url"
        case attackOrigin = "attack_origin"
        case suspiciousUrl = "suspicious_url"
        case messageContent = "message_content"
        case description
        case impactLevel = "impact_level"
    }

    // Standard init
    init(userId: Int?, isAnonymous: Bool, attackType: String, incidentDateTime: Date,
         evidenceUrl: String?, attackOrigin: String, suspiciousUrl: String?,
         messageContent: String?, description: String?, impactLevel: String) {
        self.userId = userId
        self.isAnonymous = isAnonymous
        self.attackType = attackType
        self.incidentDate = incidentDateTime
        self.evidenceUrl = evidenceUrl
        self.attackOrigin = attackOrigin
        self.suspiciousUrl = suspiciousUrl
        self.messageContent = messageContent
        self.description = description
        self.impactLevel = impactLevel
    }

    // Custom decoder - handles Date/ISO8601 string from backend
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        userId = try container.decodeIfPresent(Int.self, forKey: .userId)
        isAnonymous = try container.decode(Bool.self, forKey: .isAnonymous)
        attackType = try container.decode(String.self, forKey: .attackType)

        // Try to decode as ISO8601 string first, then fall back to Date
        if let dateString = try? container.decode(String.self, forKey: .incidentDate) {
            let isoFormatter = ISO8601DateFormatter()
            isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = isoFormatter.date(from: dateString) {
                incidentDate = date
            } else {
                // Try without fractional seconds
                isoFormatter.formatOptions = [.withInternetDateTime]
                if let date = isoFormatter.date(from: dateString) {
                    incidentDate = date
                } else {
                    throw DecodingError.dataCorrupted(DecodingError.Context(
                        codingPath: decoder.codingPath,
                        debugDescription: "Invalid incident date format: \(dateString)"
                    ))
                }
            }
        } else if let date = try? container.decode(Date.self, forKey: .incidentDate) {
            incidentDate = date
        } else {
            throw DecodingError.dataCorrupted(DecodingError.Context(
                codingPath: decoder.codingPath,
                debugDescription: "Could not decode incident_date"
            ))
        }

        evidenceUrl = try container.decodeIfPresent(String.self, forKey: .evidenceUrl)
        attackOrigin = try container.decode(String.self, forKey: .attackOrigin)
        suspiciousUrl = try container.decodeIfPresent(String.self, forKey: .suspiciousUrl)
        messageContent = try container.decodeIfPresent(String.self, forKey: .messageContent)
        description = try container.decodeIfPresent(String.self, forKey: .description)
        impactLevel = try container.decode(String.self, forKey: .impactLevel)
    }

    // Custom encoder - sends Date as ISO8601 string to backend
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        // DO NOT encode userId - backend extracts it from auth token
        try container.encode(isAnonymous, forKey: .isAnonymous)
        try container.encode(attackType, forKey: .attackType)

        // Encode Date as ISO8601 string
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        try container.encode(isoFormatter.string(from: incidentDate), forKey: .incidentDate)

        try container.encodeIfPresent(evidenceUrl, forKey: .evidenceUrl)
        try container.encode(attackOrigin, forKey: .attackOrigin)
        try container.encodeIfPresent(suspiciousUrl, forKey: .suspiciousUrl)
        try container.encodeIfPresent(messageContent, forKey: .messageContent)
        try container.encodeIfPresent(description, forKey: .description)
        try container.encode(impactLevel, forKey: .impactLevel)
    }
}


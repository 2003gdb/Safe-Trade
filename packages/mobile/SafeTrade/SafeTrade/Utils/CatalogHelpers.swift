import Foundation
import SwiftUI

/**
 * CatalogHelpers provides utility functions for working with catalog data
 * including validation, display formatting, and color mapping.
 */
struct CatalogHelpers {

    // MARK: - Validation

    /**
     * Validate if an attack type ID exists in catalog data
     */
    static func isValidAttackTypeId(_ id: Int, in catalogData: CatalogData) -> Bool {
        return catalogData.attackTypes.contains { $0.id == id }
    }

    /**
     * Validate if an impact ID exists in catalog data
     */
    static func isValidImpactId(_ id: Int, in catalogData: CatalogData) -> Bool {
        return catalogData.impacts.contains { $0.id == id }
    }

    /**
     * Validate if a status ID exists in catalog data
     */
    static func isValidStatusId(_ id: Int, in catalogData: CatalogData) -> Bool {
        return catalogData.statuses.contains { $0.id == id }
    }

    // MARK: - Display Formatting

    /**
     * Format display name by replacing underscores and capitalizing
     */
    static func formatDisplayName(_ name: String) -> String {
        return name.replacingOccurrences(of: "_", with: " ").capitalized
    }

    /**
     * Get localized display name for catalog items
     */
    static func getLocalizedName(for catalogItem: String) -> String {
        let localizations: [String: String] = [
            "email": "Correo Electrónico",
            "SMS": "Mensaje de Texto",
            "whatsapp": "WhatsApp",
            "llamada": "Llamada Telefónica",
            "redes_sociales": "Redes Sociales",
            "otro": "Otro",
            "ninguno": "Sin Impacto",
            "robo_datos": "Robo de Datos",
            "robo_dinero": "Robo de Dinero",
            "cuenta_comprometida": "Cuenta Comprometida",
            "nuevo": "Nuevo",
            "revisado": "Revisado",
            "en_investigacion": "En Investigación",
            "cerrado": "Cerrado"
        ]

        return localizations[catalogItem] ?? formatDisplayName(catalogItem)
    }

    /**
     * Get descriptive text for attack types
     */
    static func getAttackTypeDescription(_ name: String) -> String {
        let descriptions: [String: String] = [
            "email": "Correos de phishing, enlaces maliciosos, archivos adjuntos sospechosos",
            "SMS": "Mensajes de texto fraudulentos con enlaces o solicitudes de información",
            "whatsapp": "Mensajes de WhatsApp con enlaces sospechosos o intentos de estafa",
            "llamada": "Llamadas telefónicas fraudulentas solicitando información personal",
            "redes_sociales": "Ataques a través de Facebook, Instagram, Twitter u otras redes sociales",
            "otro": "Otros tipos de ataques cibernéticos"
        ]

        return descriptions[name] ?? "Tipo de ataque no especificado"
    }

    /**
     * Get descriptive text for impact levels
     */
    static func getImpactDescription(_ name: String) -> String {
        let descriptions: [String: String] = [
            "ninguno": "No sufrí ningún daño, solo quiero reportar el intento",
            "robo_datos": "Mis datos personales fueron robados o comprometidos",
            "robo_dinero": "Perdí dinero debido a este ataque",
            "cuenta_comprometida": "Una o más de mis cuentas fueron comprometidas"
        ]

        return descriptions[name] ?? "Descripción no disponible"
    }

    // MARK: - Color Mapping

    /**
     * Get color for status based on name
     */
    static func statusColor(for statusName: String) -> Color {
        switch statusName.lowercased() {
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

    /**
     * Get color for attack type based on name
     */
    static func attackTypeColor(for attackTypeName: String) -> Color {
        switch attackTypeName.lowercased() {
        case "email":
            return .blue
        case "sms":
            return .green
        case "whatsapp":
            return .mint
        case "llamada":
            return .orange
        case "redes_sociales":
            return .purple
        case "otro":
            return .brown
        default:
            return .gray
        }
    }

    /**
     * Get color for impact level based on severity
     */
    static func impactColor(for impactName: String) -> Color {
        switch impactName.lowercased() {
        case "ninguno":
            return .green
        case "robo_datos":
            return .orange
        case "cuenta_comprometida":
            return .red
        case "robo_dinero":
            return .red
        default:
            return .gray
        }
    }

    // MARK: - Legacy Migration Helpers

    /**
     * Convert legacy attack type string to catalog ID
     */
    static func convertLegacyAttackType(_ legacyTypeName: String, catalogData: CatalogData) -> Int? {
        return catalogData.attackTypes.first { $0.name == legacyTypeName }?.id
    }

    /**
     * Convert legacy impact level string to catalog ID
     */
    static func convertLegacyImpactLevel(_ legacyLevelName: String, catalogData: CatalogData) -> Int? {
        return catalogData.impacts.first { $0.name == legacyLevelName }?.id
    }

    /**
     * Convert legacy status string to catalog ID
     */
    static func convertLegacyReportStatus(_ legacyStatusName: String, catalogData: CatalogData) -> Int? {
        return catalogData.statuses.first { $0.name == legacyStatusName }?.id
    }

    /**
     * Convert catalog ID back to legacy attack type string
     */
    static func convertToLegacyAttackTypeName(id: Int, catalogData: CatalogData) -> String? {
        return catalogData.attackTypes.first(where: { $0.id == id })?.name
    }

    /**
     * Convert catalog ID back to legacy impact level string
     */
    static func convertToLegacyImpactLevelName(id: Int, catalogData: CatalogData) -> String? {
        return catalogData.impacts.first(where: { $0.id == id })?.name
    }

    /**
     * Convert catalog ID back to legacy status string
     */
    static func convertToLegacyReportStatusName(id: Int, catalogData: CatalogData) -> String? {
        return catalogData.statuses.first(where: { $0.id == id })?.name
    }


    // MARK: - Data Sorting and Filtering

    /**
     * Sort attack types by common usage (email first, then alphabetical, "otro" last)
     */
    static func sortedAttackTypes(_ attackTypes: [CatalogAttackType]) -> [CatalogAttackType] {
        return attackTypes.sorted { first, second in
            // Email should always be first
            if first.name == "email" && second.name != "email" {
                return true
            }
            if second.name == "email" && first.name != "email" {
                return false
            }

            // "otro" should always be last
            if first.name == "otro" && second.name != "otro" {
                return false
            }
            if second.name == "otro" && first.name != "otro" {
                return true
            }

            // For all others, sort alphabetically
            return first.name < second.name
        }
    }

    /**
     * Sort impacts by severity (no impact first, then by severity level)
     */
    static func sortedImpacts(_ impacts: [CatalogImpact]) -> [CatalogImpact] {
        let severityOrder = ["ninguno", "robo_datos", "cuenta_comprometida", "robo_dinero"]

        return impacts.sorted { first, second in
            let firstIndex = severityOrder.firstIndex(of: first.name) ?? Int.max
            let secondIndex = severityOrder.firstIndex(of: second.name) ?? Int.max

            if firstIndex != secondIndex {
                return firstIndex < secondIndex
            }

            return first.name < second.name
        }
    }

    /**
     * Sort statuses by workflow order
     */
    static func sortedStatuses(_ statuses: [CatalogStatus]) -> [CatalogStatus] {
        let workflowOrder = ["nuevo", "revisado", "en_investigacion", "cerrado"]

        return statuses.sorted { first, second in
            let firstIndex = workflowOrder.firstIndex(of: first.name) ?? Int.max
            let secondIndex = workflowOrder.firstIndex(of: second.name) ?? Int.max

            if firstIndex != secondIndex {
                return firstIndex < secondIndex
            }

            return first.name < second.name
        }
    }

    // MARK: - Picker Helpers

    /**
     * Create picker options with proper sorting and formatting
     */
    static func createAttackTypePickerOptions(from catalogData: CatalogData) -> [(id: Int, name: String, displayName: String)] {
        return sortedAttackTypes(catalogData.attackTypes).map { attackType in
            (
                id: attackType.id,
                name: attackType.name,
                displayName: getLocalizedName(for: attackType.name)
            )
        }
    }

    /**
     * Create impact picker options with proper sorting and formatting
     */
    static func createImpactPickerOptions(from catalogData: CatalogData) -> [(id: Int, name: String, displayName: String)] {
        return sortedImpacts(catalogData.impacts).map { impact in
            (
                id: impact.id,
                name: impact.name,
                displayName: getLocalizedName(for: impact.name)
            )
        }
    }

    /**
     * Create status picker options with proper sorting and formatting
     */
    static func createStatusPickerOptions(from catalogData: CatalogData) -> [(id: Int, name: String, displayName: String)] {
        return sortedStatuses(catalogData.statuses).map { status in
            (
                id: status.id,
                name: status.name,
                displayName: getLocalizedName(for: status.name)
            )
        }
    }

    // MARK: - Icon Mapping

    /**
     * Get SF Symbol icon name for attack types
     */
    static func iconForAttackType(_ name: String) -> String {
        switch name.lowercased() {
        case "email":
            return "envelope"
        case "sms":
            return "message"
        case "whatsapp":
            return "phone.bubble"
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

    /**
     * Get SF Symbol icon name for status
     */
    static func iconForStatus(_ name: String) -> String {
        switch name.lowercased() {
        case "nuevo":
            return "plus.circle"
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

    /**
     * Get SF Symbol icon name for impact level
     */
    static func iconForImpact(_ name: String) -> String {
        switch name.lowercased() {
        case "ninguno":
            return "shield"
        case "robo_datos":
            return "doc.text.image"
        case "cuenta_comprometida":
            return "person.crop.circle.badge.exclamationmark"
        case "robo_dinero":
            return "dollarsign.circle"
        default:
            return "exclamationmark.triangle"
        }
    }
}

// MARK: - CatalogHelper Class (from ReportV2)

/**
 * CatalogHelper provides catalog-aware helper methods for forms and pickers
 */
class CatalogHelper {
    private let catalogData: CatalogData

    init(catalogData: CatalogData) {
        self.catalogData = catalogData
    }

    // MARK: - Picker Options (String-based for backend compatibility)
    var attackTypeOptions: [(value: String, displayName: String)] {
        return catalogData.attackTypes.map { (value: $0.name, displayName: getAttackTypeDisplayName($0.name)) }
    }

    var impactOptions: [(value: String, displayName: String)] {
        return catalogData.impacts.map { (value: $0.name, displayName: getImpactDisplayName($0.name)) }
    }

    var statusOptions: [(value: String, displayName: String)] {
        return catalogData.statuses.map { (value: $0.name, displayName: getStatusDisplayName($0.name)) }
    }

    // MARK: - Display Name Helpers
    private func getAttackTypeDisplayName(_ name: String) -> String {
        // Convert backend values to user-friendly display names
        switch name {
        case "email": return "Correo Electrónico"
        case "SMS": return "SMS"
        case "whatsapp": return "WhatsApp"
        case "llamada": return "Llamada Telefónica"
        case "redes_sociales": return "Redes Sociales"
        case "otro": return "Otro"
        default: return name
        }
    }

    private func getImpactDisplayName(_ name: String) -> String {
        switch name {
        case "ninguno": return "Sin Impacto"
        case "robo_datos": return "Robo de Datos"
        case "robo_dinero": return "Robo de Dinero"
        case "cuenta_comprometida": return "Cuenta Comprometida"
        default: return name
        }
    }

    private func getStatusDisplayName(_ name: String) -> String {
        switch name {
        case "nuevo": return "Nuevo"
        case "revisado": return "Revisado"
        case "en_investigacion": return "En Investigación"
        case "cerrado": return "Cerrado"
        default: return name
        }
    }
}
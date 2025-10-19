import Foundation
import Combine
import SwiftUI
import UIKit

@MainActor
class ReportingViewModel: ObservableObject {
    // MARK: - Published Properties

    @Published var isAnonymous: Bool = true
    @Published var selectedAttackTypeId: Int?
    @Published var selectedImpactId: Int?
    @Published var incidentDate = Date() // Combined date+time (matches DB TIMESTAMP)
    @Published var attackOrigin: String = ""
    @Published var suspiciousUrl: String = ""
    @Published var messageContent: String = ""
    @Published var description: String = ""

    // Photo upload
    @Published var selectedPhoto: UIImage?
    @Published var uploadedPhotoUrl: String?
    @Published var isUploadingPhoto: Bool = false

    // UI State
    @Published var isSubmitting: Bool = false
    @Published var showingSuccessAlert: Bool = false
    @Published var showingErrorAlert: Bool = false
    @Published var alertMessage: String = ""
    @Published var lastSubmittedReport: NormalizedReport?
    @Published var lastSubmittedAttackType: String?
    @Published var recommendations: [String] = []
    @Published var victimSupport: VictimSupport?

    // Form validation
    @Published var showValidationErrors: Bool = false

    // Catalog state
    @Published var catalogData: CatalogData?
    @Published var catalogError: String?
    @Published var catalogLoading: Bool = false

    // MARK: - Computed Properties for DraftManager Compatibility

    var selectedAttackType: LegacyAttackType? {
        guard let attackTypeId = selectedAttackTypeId,
              let catalogData = catalogData,
              let attackTypeName = catalogData.attackTypes.first(where: { $0.id == attackTypeId })?.name else {
            return nil
        }
        return LegacyAttackType(rawValue: attackTypeName)
    }

    var selectedImpactLevel: LegacyImpactLevel? {
        guard let impactId = selectedImpactId,
              let catalogData = catalogData,
              let impactName = catalogData.impacts.first(where: { $0.id == impactId })?.name else {
            return nil
        }
        return LegacyImpactLevel(rawValue: impactName)
    }


    // MARK: - Private Properties

    private let reportingService: ReportingService
    private let authService: AuthenticationService
    private let catalogService: CatalogService
    private let userPreferencesService = UserPreferencesService.shared
    private let draftManager = DraftManager.shared
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Initialization

    init(isAnonymous: Bool? = nil,
         reportingService: ReportingService = ReportingService(),
         authService: AuthenticationService? = nil,
         catalogService: CatalogService = CatalogService.shared) {
        self.reportingService = reportingService
        self.authService = authService ?? AuthenticationService.shared
        self.catalogService = catalogService

        // Set anonymous state based on parameter or authentication status
        if let isAnonymous = isAnonymous {
            self.isAnonymous = isAnonymous
        } else {
            // Access repository directly to avoid actor isolation issues
            let repository = AuthenticationRepository.shared
            self.isAnonymous = !repository.hasValidToken()
        }

        // Subscribe to catalog updates
        catalogService.$catalogData
            .sink { [weak self] newCatalogData in
                self?.catalogData = newCatalogData
                if newCatalogData != nil {
                    self?.applySmartDefaults()
                }
            }
            .store(in: &cancellables)

        // Load catalogs and apply defaults
        Task {
            await loadCatalogsAndDefaults()
        }
    }

    // MARK: - Computed Properties

    var isFormValid: Bool {
        return selectedAttackTypeId != nil &&
               selectedImpactId != nil &&
               !attackOrigin.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var canSubmitIdentified: Bool {
        return authService.isAuthenticated
    }

    var formattedIncidentDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: incidentDate)
    }

    // MARK: - Catalog Computed Properties

    var attackTypeOptions: [(id: Int, name: String, displayName: String)] {
        guard let catalogData = catalogData else { return [] }

        let options = catalogData.attackTypes.map {
            (id: $0.id, name: $0.name, displayName: CatalogHelpers.getLocalizedName(for: $0.name))
        }

        // Sort with email first, then others alphabetically, and "otro" last
        return CatalogHelpers.sortedAttackTypes(catalogData.attackTypes).map {
            (id: $0.id, name: $0.name, displayName: CatalogHelpers.getLocalizedName(for: $0.name))
        }
    }

    var impactOptions: [(id: Int, name: String, displayName: String)] {
        return catalogData?.impacts.map {
            (id: $0.id, name: $0.name, displayName: CatalogHelpers.getLocalizedName(for: $0.name))
        } ?? []
    }

    var selectedAttackTypeName: String {
        guard let id = selectedAttackTypeId,
              let catalogData = catalogData else { return "Selecciona tipo" }
        return catalogData.attackTypes.first { $0.id == id }?.name ?? "Desconocido"
    }

    var selectedImpactName: String {
        guard let id = selectedImpactId,
              let catalogData = catalogData else { return "Selecciona impacto" }
        return catalogData.impacts.first { $0.id == id }?.name ?? "Desconocido"
    }

    var isCatalogReady: Bool {
        return catalogData != nil
    }

    // MARK: - Form Actions

    func resetForm() {
        // Note: isAnonymous is not reset as it's set during initialization
        selectedAttackTypeId = nil
        selectedImpactId = nil
        incidentDate = Date() // Reset to current date/time
        attackOrigin = ""
        suspiciousUrl = ""
        messageContent = ""
        description = ""
        selectedPhoto = nil
        uploadedPhotoUrl = nil
        isUploadingPhoto = false
        showValidationErrors = false
        recommendations = []
        victimSupport = nil
        lastSubmittedReport = nil
        lastSubmittedAttackType = nil

        // Apply smart defaults if catalog is available
        if catalogData != nil {
            applySmartDefaults()
        }
    }

    // MARK: - Photo Upload

    func uploadPhoto() async throws {
        guard let photo = selectedPhoto else { return }

        isUploadingPhoto = true

        do {
            let apiService = APIService.shared
            let url = try await apiService.uploadPhoto(image: photo)

            await MainActor.run {
                self.uploadedPhotoUrl = url
                self.isUploadingPhoto = false
            }
        } catch {
            await MainActor.run {
                self.isUploadingPhoto = false
            }
            throw error
        }
    }

    func removePhoto() {
        selectedPhoto = nil
        uploadedPhotoUrl = nil
    }

    // MARK: - Report Submission

    func submitReport() {
        guard isFormValid else {
            showValidationErrors = true
            alertMessage = "Por favor, completa todos los campos requeridos"
            showingErrorAlert = true
            HapticFeedback.shared.formValidationError()
            return
        }

        guard let attackTypeId = selectedAttackTypeId,
              let impactId = selectedImpactId,
              let catalogData = catalogData else {
            alertMessage = "Error: tipo de ataque, impacto no seleccionado o catálogos no cargados"
            showingErrorAlert = true
            return
        }

        // Convert IDs to string values
        guard let attackTypeString = catalogData.attackTypes.first(where: { $0.id == attackTypeId })?.name,
              let impactString = catalogData.impacts.first(where: { $0.id == impactId })?.name else {
            alertMessage = "Error: valores de catálogo inválidos"
            showingErrorAlert = true
            return
        }

        isSubmitting = true
        showValidationErrors = false

        Task {
            do {
                // Upload photo first if one was selected
                if selectedPhoto != nil && uploadedPhotoUrl == nil {
                    try await uploadPhoto()
                }

                let userId = isAnonymous ? nil : authService.currentUser?.id

                let report = try await reportingService.submitReportWithDateTime(
                    attackType: attackTypeString,
                    impactLevel: impactString,
                    incidentDateTime: incidentDate,
                    description: description.isEmpty ? nil : description,
                    evidenceUrl: uploadedPhotoUrl, // Photo URL from upload
                    attackOrigin: attackOrigin.trimmingCharacters(in: .whitespacesAndNewlines),
                    suspiciousUrl: suspiciousUrl.isEmpty ? nil : suspiciousUrl,
                    messageContent: messageContent.isEmpty ? nil : messageContent,
                    isAnonymous: isAnonymous,
                    userId: userId
                )

                await MainActor.run {
                    self.handleSuccessfulSubmission(report)
                }

            } catch {
                await MainActor.run {
                    self.isSubmitting = false
                    self.alertMessage = "Error al enviar el reporte: \(error.localizedDescription)"
                    self.showingErrorAlert = true
                    HapticFeedback.shared.reportSubmissionError()
                }
            }
        }
    }

    private func handleSuccessfulSubmission(_ report: NormalizedReport) {
        isSubmitting = false
        lastSubmittedReport = report
        lastSubmittedAttackType = selectedAttackTypeName

        // Create success message
        alertMessage = "Reporte enviado exitosamente"

        // Record user preferences for future suggestions
        recordUserPreferences()

        // Provide success haptic feedback
        HapticFeedback.shared.reportSubmissionSuccess()

        // Show success alert
        showingSuccessAlert = true

        // Note: resetForm() will be called when recommendations view is dismissed
    }

    private func recordUserPreferences() {
        // Record attack origin if not empty
        let cleanOrigin = attackOrigin.trimmingCharacters(in: .whitespacesAndNewlines)
        if !cleanOrigin.isEmpty {
            userPreferencesService.recordAttackOriginUsage(cleanOrigin)
        }

        // Clear draft after successful submission
        draftManager.clearDraft()
    }

    // MARK: - Catalog Loading

    private func loadCatalogsAndDefaults() async {
        catalogLoading = true
        catalogError = nil

        do {
            await catalogService.loadCatalogs()
            await MainActor.run {
                self.catalogLoading = false

                // Check if catalog data is available
                if let catalogData = self.catalogData {
                    self.applySmartDefaults()
                } else {
                    self.catalogError = "Datos de catálogo no disponibles"
                }
            }
        } catch {
            await MainActor.run {
                self.catalogLoading = false
                self.catalogError = "Error cargando opciones: \(error.localizedDescription)"
            }
        }
    }

    func refreshCatalogs() async {
        await catalogService.loadCatalogs(forceRefresh: true)
    }

    // MARK: - Draft Management

    func startAutoDraftSaving() {
        draftManager.startAutosave(for: self)
    }

    func stopAutoDraftSaving() {
        draftManager.stopAutosave()
    }

    func loadDraftIfAvailable() -> Bool {
        guard let draft = draftManager.loadDraft() else { return false }

        draftManager.applyDraft(to: self, draft: draft)
        return true
    }

    func saveDraftManually() {
        draftManager.saveDraft(from: self)
    }

    func clearDraft() {
        draftManager.clearDraft()
    }

    var hasDraft: Bool {
        return draftManager.hasDraft
    }

    // MARK: - Validation Helpers

    func validateAttackOrigin() -> String? {
        let trimmed = attackOrigin.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.isEmpty {
            return "Origen del ataque es requerido"
        }
        return nil
    }

    func validateSuspiciousUrl() -> String? {
        if !suspiciousUrl.isEmpty {
            // Length validation
            if suspiciousUrl.count > 2048 {
                return "La URL no puede exceder 2048 caracteres"
            }

            // Basic domain validation - must contain at least one dot
            if !suspiciousUrl.contains(".") {
                return "La URL sospechosa debe contener al menos un dominio (ej: sitio.com)"
            }
        }
        return nil
    }

    func validateMessageContent() -> String? {
        if messageContent.count > 5000 {
            return "El contenido del mensaje no puede exceder 5000 caracteres"
        }
        return nil
    }

    // MARK: - Smart Defaults

    func applySmartDefaults() {
        guard let catalogData = catalogData else { return }

        // Auto-populate current date and time
        incidentDate = Date()

        // Set most common attack type as default (email is most common)
        selectedAttackTypeId = getMostCommonAttackTypeId()

        // Set reasonable default for impact level (ninguno/sin impacto)
        selectedImpactId = getDefaultImpactId()
    }

    func getMostCommonAttackTypeId() -> Int? {
        guard let catalogData = catalogData else { return nil }

        // Look for email first as it's most common
        if let emailType = catalogData.attackTypes.first(where: { $0.name == "email" }) {
            return emailType.id
        }

        // Fallback to first available attack type
        return catalogData.attackTypes.first?.id
    }

    func getDefaultImpactId() -> Int? {
        guard let catalogData = catalogData else { return nil }

        // Look for "ninguno" (no impact) first
        if let noImpact = catalogData.impacts.first(where: { $0.name == "ninguno" }) {
            return noImpact.id
        }

        // Fallback to first available impact
        return catalogData.impacts.first?.id
    }

    func getAttackOriginSuggestions() -> [String] {
        guard let selectedId = selectedAttackTypeId,
              let catalogData = catalogData,
              let attackType = catalogData.attackTypes.first(where: { $0.id == selectedId }) else {
            return []
        }

        return userPreferencesService.getAttackOriginSuggestions(for: LegacyAttackType(rawValue: attackType.name) ?? .email)
    }

    func setQuickDefaults() {
        // Quick mode defaults for streamlined workflow
        applySmartDefaults()

        // Pre-fill with reasonable device defaults
        if attackOrigin.isEmpty {
            attackOrigin = getDefaultAttackOrigin()
        }
    }

    func getDefaultAttackOrigin() -> String {
        guard let selectedId = selectedAttackTypeId,
              let catalogData = catalogData,
              let attackType = catalogData.attackTypes.first(where: { $0.id == selectedId }) else {
            return "origen desconocido"
        }

        // Provide a template/placeholder for user to modify based on attack type name
        switch attackType.name {
        case "email":
            return "correo@ejemplo.com"
        case "SMS":
            return "+52 55 1234 5678"
        case "whatsapp":
            return "+52 55 1234 5678"
        case "llamada":
            return "+52 55 1234 5678"
        case "redes_sociales":
            return "usuario@redessociales"
        default:
            return "origen desconocido"
        }
    }

    // MARK: - Date/Time Helpers

    func formatTimeForDisplay(_ time: String) -> String {
        // Format time string for better display
        if time.count == 5 && time.contains(":") {
            return time
        }
        return ""
    }

    func getCurrentTimeString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: Date())
    }

}

// MARK: - Validation Error Types

enum ReportValidationError: Error, LocalizedError {
    case missingAttackOrigin
    case invalidUrl
    case invalidTime

    var errorDescription: String? {
        switch self {
        case .missingAttackOrigin:
            return "El origen del ataque es requerido"
        case .invalidUrl:
            return "URL inválida"
        case .invalidTime:
            return "Formato de tiempo inválido"
        }
    }
}
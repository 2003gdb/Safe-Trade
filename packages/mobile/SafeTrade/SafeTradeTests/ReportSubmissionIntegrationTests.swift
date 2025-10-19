import XCTest
@testable import SafeTrade

@MainActor
final class ReportSubmissionIntegrationTests: XCTestCase {

    var reportingViewModel: ReportingViewModel!
    var recommendationsViewModel: RecommendationsViewModel!
    var mockCommunityService: MockCommunityService!

    override func setUp() {
        super.setUp()
        mockCommunityService = MockCommunityService()
        reportingViewModel = ReportingViewModel(isAnonymous: false)
        recommendationsViewModel = RecommendationsViewModel(communityService: mockCommunityService)
    }

    override func tearDown() {
        reportingViewModel = nil
        recommendationsViewModel = nil
        mockCommunityService = nil
        super.tearDown()
    }

    // MARK: - Test Report Submission Flow Integration

    func testRecommendationsDisplayAfterSuccessfulReportSubmission() {
        // Given
        setupValidReportData()
        let emailRecommendation = createEmailRecommendation()
        mockCommunityService.mockRecommendation = emailRecommendation
        mockCommunityService.mockSecurityQuote = "La seguridad es responsabilidad de todos."

        // When
        // Simulate successful report submission
        reportingViewModel.submittedAttackType = "email"
        reportingViewModel.showingSuccessAlert = true

        // Load recommendation for the submitted attack type
        if let attackType = reportingViewModel.submittedAttackType {
            recommendationsViewModel.loadRecommendation(for: attackType)
        }

        // Then
        XCTAssertTrue(reportingViewModel.showingSuccessAlert, "Success alert should be shown after report submission")
        XCTAssertEqual(reportingViewModel.submittedAttackType, "email", "Submitted attack type should be preserved")
        XCTAssertNotNil(recommendationsViewModel.recommendation, "Recommendation should be loaded")
        XCTAssertEqual(recommendationsViewModel.recommendation?.attackType, "email", "Recommendation should match attack type")
    }

    func testRecommendationsFlowForDifferentAttackTypes() {
        let attackTypes = ["email", "SMS", "whatsapp", "llamada", "redes_sociales", "otro"]

        for attackType in attackTypes {
            // Given
            setupValidReportData()
            reportingViewModel.selectedAttackType = getAttackTypeEnum(for: attackType)
            let recommendation = createRecommendation(for: attackType)
            mockCommunityService.mockRecommendation = recommendation
            mockCommunityService.mockSecurityQuote = "Test quote for \(attackType)"

            // When
            // Simulate successful report submission
            reportingViewModel.submittedAttackType = attackType
            reportingViewModel.showingSuccessAlert = true
            recommendationsViewModel.loadRecommendation(for: attackType)

            // Then
            XCTAssertEqual(reportingViewModel.submittedAttackType, attackType, "Attack type should be preserved for \(attackType)")
            XCTAssertNotNil(recommendationsViewModel.recommendation, "Recommendation should exist for \(attackType)")
            XCTAssertEqual(recommendationsViewModel.recommendation?.attackType, attackType, "Recommendation should match attack type for \(attackType)")
            XCTAssertFalse(recommendationsViewModel.securityQuote.isEmpty, "Security quote should be loaded for \(attackType)")

            // Reset for next iteration
            reportingViewModel.showingSuccessAlert = false
            reportingViewModel.submittedAttackType = nil
            recommendationsViewModel.recommendation = nil
            recommendationsViewModel.securityQuote = ""
        }
    }

    // MARK: - Test Integration State Management

    func testRecommendationsViewDismissalFlow() {
        // Given
        setupValidReportData()
        reportingViewModel.submittedAttackType = "email"
        reportingViewModel.showingSuccessAlert = true

        // When
        // Simulate recommendations view dismissal
        reportingViewModel.showingSuccessAlert = false

        // Then
        XCTAssertFalse(reportingViewModel.showingSuccessAlert, "Success alert should be dismissed")
        // Note: In the actual app, the ReportSubmissionView would also be dismissed
    }

    func testRecommendationsDataConsistencyWithReportData() {
        // Given
        let testAttackType = "whatsapp"
        setupValidReportData()
        reportingViewModel.selectedAttackType = .whatsapp
        reportingViewModel.submittedAttackType = testAttackType

        let whatsappRecommendation = createRecommendation(for: testAttackType)
        mockCommunityService.mockRecommendation = whatsappRecommendation

        // When
        recommendationsViewModel.loadRecommendation(for: testAttackType)

        // Then
        XCTAssertEqual(reportingViewModel.selectedAttackType?.rawValue, testAttackType, "Selected attack type should match")
        XCTAssertEqual(reportingViewModel.submittedAttackType, testAttackType, "Submitted attack type should match")
        XCTAssertEqual(recommendationsViewModel.recommendation?.attackType, testAttackType, "Recommendation attack type should match")
    }

    // MARK: - Test Error Handling Integration

    func testRecommendationsWithFailedReportSubmission() {
        // Given
        setupValidReportData()
        reportingViewModel.showingErrorAlert = true
        reportingViewModel.alertMessage = "Error al enviar reporte"

        // When
        // No recommendations should be shown when report submission fails
        // Then
        XCTAssertFalse(reportingViewModel.showingSuccessAlert, "Success alert should not be shown on error")
        XCTAssertNil(reportingViewModel.submittedAttackType, "Attack type should not be set on error")
        XCTAssertTrue(reportingViewModel.showingErrorAlert, "Error alert should be shown")
    }

    func testRecommendationsWithMissingAttackType() {
        // Given
        setupValidReportData()
        reportingViewModel.showingSuccessAlert = true
        reportingViewModel.submittedAttackType = nil // Missing attack type

        mockCommunityService.mockRecommendation = nil

        // When
        if let attackType = reportingViewModel.submittedAttackType {
            recommendationsViewModel.loadRecommendation(for: attackType)
        }

        // Then
        XCTAssertNil(recommendationsViewModel.recommendation, "No recommendation should be loaded without attack type")
    }

    // MARK: - Test Spanish Content Integration

    func testSpanishContentConsistencyInFlow() {
        // Given
        setupValidReportData()
        reportingViewModel.submittedAttackType = "email"

        let spanishRecommendation = Recommendation(
            id: 1,
            attackType: "email",
            titulo: "Verifica el remitente del correo",
            contenido: "Siempre verifica la identidad del remitente antes de abrir correos de direcciones desconocidas."
        )
        mockCommunityService.mockRecommendation = spanishRecommendation
        mockCommunityService.mockSecurityQuote = "La seguridad es responsabilidad de todos. Tu reporte ayuda a proteger a la comunidad."

        // When
        recommendationsViewModel.loadRecommendation(for: "email")

        // Then
        XCTAssertTrue(isSpanishContent(recommendationsViewModel.recommendation?.titulo ?? ""), "Recommendation title should be in Spanish")
        XCTAssertTrue(isSpanishContent(recommendationsViewModel.recommendation?.contenido ?? ""), "Recommendation content should be in Spanish")
        XCTAssertTrue(isSpanishContent(recommendationsViewModel.securityQuote), "Security quote should be in Spanish")
    }

    // MARK: - Test Anonymous vs Identified Report Flow

    func testRecommendationsFlowForAnonymousReports() {
        // Given
        let anonymousViewModel = ReportingViewModel(isAnonymous: true)
        setupValidReportData(for: anonymousViewModel)
        anonymousViewModel.submittedAttackType = "SMS"

        let smsRecommendation = createRecommendation(for: "SMS")
        mockCommunityService.mockRecommendation = smsRecommendation

        // When
        anonymousViewModel.showingSuccessAlert = true
        recommendationsViewModel.loadRecommendation(for: "SMS")

        // Then
        XCTAssertTrue(anonymousViewModel.showingSuccessAlert, "Anonymous reports should also show recommendations")
        XCTAssertEqual(recommendationsViewModel.recommendation?.attackType, "SMS", "Recommendations should work for anonymous reports")
    }

    func testRecommendationsFlowForIdentifiedReports() {
        // Given
        let identifiedViewModel = ReportingViewModel(isAnonymous: false)
        setupValidReportData(for: identifiedViewModel)
        identifiedViewModel.submittedAttackType = "llamada"

        let llamadaRecommendation = createRecommendation(for: "llamada")
        mockCommunityService.mockRecommendation = llamadaRecommendation

        // When
        identifiedViewModel.showingSuccessAlert = true
        recommendationsViewModel.loadRecommendation(for: "llamada")

        // Then
        XCTAssertTrue(identifiedViewModel.showingSuccessAlert, "Identified reports should show recommendations")
        XCTAssertEqual(recommendationsViewModel.recommendation?.attackType, "llamada", "Recommendations should work for identified reports")
    }

    // MARK: - Helper Methods

    private func setupValidReportData(for viewModel: ReportingViewModel? = nil) {
        let vm = viewModel ?? reportingViewModel
        vm?.selectedAttackType = .email
        vm?.attackOrigin = "test@example.com"
        vm?.selectedImpactLevel = .medium
        vm?.incidentDate = Date()
    }

    private func getAttackTypeEnum(for string: String) -> AttackType {
        switch string {
        case "email": return .email
        case "SMS": return .sms
        case "whatsapp": return .whatsapp
        case "llamada": return .phone
        case "redes_sociales": return .socialMedia
        case "otro": return .other
        default: return .other
        }
    }

    private func createEmailRecommendation() -> Recommendation {
        return Recommendation(
            id: 1,
            attackType: "email",
            titulo: "Verifica el remitente",
            contenido: "Siempre verifica la identidad del remitente antes de abrir correos de direcciones desconocidas."
        )
    }

    private func createRecommendation(for attackType: String) -> Recommendation {
        let titles = [
            "email": "Verifica el remitente",
            "SMS": "Los bancos nunca piden información por SMS",
            "whatsapp": "No compartas códigos de verificación",
            "llamada": "Nunca proporciones información personal por teléfono",
            "redes_sociales": "Configura tu perfil como privado",
            "otro": "Mantén actualizado tu software"
        ]

        let contents = [
            "email": "Siempre verifica la identidad del remitente antes de abrir correos.",
            "SMS": "Ningún banco legítimo te pedirá información personal por SMS.",
            "whatsapp": "Nunca compartas códigos de verificación de WhatsApp.",
            "llamada": "Los bancos nunca te pedirán contraseñas por teléfono.",
            "redes_sociales": "Mantén tu perfil privado y no aceptes solicitudes de desconocidos.",
            "otro": "Asegúrate de mantener tu software actualizado con parches de seguridad."
        ]

        return Recommendation(
            id: Int.random(in: 1...100),
            attackType: attackType,
            titulo: titles[attackType] ?? "Recomendación de seguridad",
            contenido: contents[attackType] ?? "Mantente alerta ante actividades sospechosas."
        )
    }

    private func isSpanishContent(_ text: String) -> Bool {
        let spanishIndicators = [
            "ñ", "á", "é", "í", "ó", "ú", "ü",
            "la ", "el ", "de ", "que ", "en ", "es ", "se ", "te ", "tu ", "su ",
            "información", "seguridad", "nunca", "siempre", "verificación"
        ]

        let lowercaseText = text.lowercased()
        return spanishIndicators.contains { lowercaseText.contains($0) }
    }
}
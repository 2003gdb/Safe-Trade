import XCTest
@testable import SafeTrade

@MainActor
final class RecommendationsViewModelTests: XCTestCase {

    var viewModel: RecommendationsViewModel!
    var mockCommunityService: MockCommunityService!

    override func setUp() {
        super.setUp()
        mockCommunityService = MockCommunityService()
        viewModel = RecommendationsViewModel(communityService: mockCommunityService)
    }

    override func tearDown() {
        viewModel = nil
        mockCommunityService = nil
        super.tearDown()
    }

    // MARK: - Test Initial State

    func testInitialState() {
        XCTAssertNil(viewModel.recommendation)
        XCTAssertEqual(viewModel.securityQuote, "")
    }

    // MARK: - Test Load Recommendation for Email Attack Type

    func testLoadRecommendationForEmailAttackType() {
        // Given
        let emailRecommendation = Recommendation(
            id: 1,
            attackType: "email",
            titulo: "Verifica el remitente",
            contenido: "Siempre verifica la identidad del remitente antes de abrir correos de direcciones desconocidas."
        )
        mockCommunityService.mockRecommendation = emailRecommendation
        mockCommunityService.mockSecurityQuote = "La seguridad es responsabilidad de todos."

        // When
        viewModel.loadRecommendation(for: "email")

        // Then
        XCTAssertNotNil(viewModel.recommendation)
        XCTAssertEqual(viewModel.recommendation?.id, 1)
        XCTAssertEqual(viewModel.recommendation?.attackType, "email")
        XCTAssertEqual(viewModel.recommendation?.titulo, "Verifica el remitente")
        XCTAssertTrue(viewModel.recommendation?.contenido.contains("verifica la identidad") ?? false)
        XCTAssertEqual(viewModel.securityQuote, "La seguridad es responsabilidad de todos.")
    }

    // MARK: - Test Load Recommendation for SMS Attack Type

    func testLoadRecommendationForSMSAttackType() {
        // Given
        let smsRecommendation = Recommendation(
            id: 3,
            attackType: "SMS",
            titulo: "Los bancos nunca piden información por SMS",
            contenido: "Ningún banco legítimo te pedirá información personal por SMS."
        )
        mockCommunityService.mockRecommendation = smsRecommendation
        mockCommunityService.mockSecurityQuote = "Mantente alerta: la información es tu mejor defensa."

        // When
        viewModel.loadRecommendation(for: "SMS")

        // Then
        XCTAssertNotNil(viewModel.recommendation)
        XCTAssertEqual(viewModel.recommendation?.attackType, "SMS")
        XCTAssertEqual(viewModel.recommendation?.titulo, "Los bancos nunca piden información por SMS")
        XCTAssertTrue(viewModel.recommendation?.contenido.contains("banco legítimo") ?? false)
        XCTAssertEqual(viewModel.securityQuote, "Mantente alerta: la información es tu mejor defensa.")
    }

    // MARK: - Test Load Recommendation for WhatsApp Attack Type

    func testLoadRecommendationForWhatsAppAttackType() {
        // Given
        let whatsappRecommendation = Recommendation(
            id: 5,
            attackType: "whatsapp",
            titulo: "No compartas códigos de verificación",
            contenido: "Nunca compartas códigos de verificación de WhatsApp con nadie."
        )
        mockCommunityService.mockRecommendation = whatsappRecommendation
        mockCommunityService.mockSecurityQuote = "Cada reporte cuenta. Juntos construimos una comunidad más segura."

        // When
        viewModel.loadRecommendation(for: "whatsapp")

        // Then
        XCTAssertNotNil(viewModel.recommendation)
        XCTAssertEqual(viewModel.recommendation?.attackType, "whatsapp")
        XCTAssertEqual(viewModel.recommendation?.titulo, "No compartas códigos de verificación")
        XCTAssertTrue(viewModel.recommendation?.contenido.contains("códigos de verificación") ?? false)
    }

    // MARK: - Test Load Recommendation for Unknown Attack Type

    func testLoadRecommendationForUnknownAttackType() {
        // Given
        mockCommunityService.mockRecommendation = nil
        mockCommunityService.mockSecurityQuote = "Tu experiencia puede salvar a otros."

        // When
        viewModel.loadRecommendation(for: "unknown_type")

        // Then
        XCTAssertNil(viewModel.recommendation)
        XCTAssertEqual(viewModel.securityQuote, "Tu experiencia puede salvar a otros.")
    }

    // MARK: - Test Spanish Content Validation

    func testSpanishContentValidation() {
        // Given
        let spanishRecommendation = Recommendation(
            id: 7,
            attackType: "llamada",
            titulo: "Nunca proporciones información personal por teléfono",
            contenido: "Los bancos y empresas legítimas nunca te pedirán contraseñas por teléfono."
        )
        mockCommunityService.mockRecommendation = spanishRecommendation
        mockCommunityService.mockSecurityQuote = "La prevención es la mejor protección."

        // When
        viewModel.loadRecommendation(for: "llamada")

        // Then
        // Verify Spanish content characteristics
        XCTAssertTrue(viewModel.recommendation?.titulo.contains("Nunca") ?? false, "Title should contain Spanish text")
        XCTAssertTrue(viewModel.recommendation?.contenido.contains("empresas legítimas") ?? false, "Content should contain Spanish text")
        XCTAssertTrue(viewModel.securityQuote.contains("prevención") ?? false, "Security quote should be in Spanish")

        // Verify no English words are present in Spanish content
        XCTAssertFalse(viewModel.recommendation?.titulo.contains("Never") ?? false, "Title should not contain English")
        XCTAssertFalse(viewModel.recommendation?.contenido.contains("legitimate") ?? false, "Content should not contain English")
    }

    // MARK: - Test Security Quote Loading

    func testSecurityQuoteLoading() {
        // Given
        let testQuotes = [
            "La seguridad es responsabilidad de todos.",
            "Mantente alerta: la información es tu mejor defensa.",
            "Cada reporte cuenta. Juntos construimos una comunidad más segura."
        ]

        for quote in testQuotes {
            mockCommunityService.mockSecurityQuote = quote

            // When
            viewModel.loadRecommendation(for: "email")

            // Then
            XCTAssertEqual(viewModel.securityQuote, quote)
        }
    }

    // MARK: - Test Attack Type Enum Validation

    func testAttackTypeEnumValidation() {
        let validAttackTypes = ["email", "SMS", "whatsapp", "llamada", "redes_sociales", "otro"]

        for attackType in validAttackTypes {
            // Given
            let recommendation = Recommendation(
                id: 1,
                attackType: attackType,
                titulo: "Test Title",
                contenido: "Test Content"
            )
            mockCommunityService.mockRecommendation = recommendation

            // When
            viewModel.loadRecommendation(for: attackType)

            // Then
            XCTAssertEqual(viewModel.recommendation?.attackType, attackType)
        }
    }
}

// MARK: - Mock Community Service

class MockCommunityService: CommunityService {
    var mockRecommendation: Recommendation?
    var mockSecurityQuote: String = ""

    override func getRecommendation(for attackType: String) -> Recommendation? {
        return mockRecommendation
    }

    override func getSecurityQuote() -> String {
        return mockSecurityQuote
    }
}
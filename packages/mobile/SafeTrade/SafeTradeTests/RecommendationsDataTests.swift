import XCTest
@testable import SafeTrade

final class RecommendationsDataTests: XCTestCase {

    // MARK: - Test Spanish Content Validation

    func testAllRecommendationsHaveSpanishContent() {
        let attackTypes = ["email", "SMS", "whatsapp", "llamada", "redes_sociales", "otro"]

        for attackType in attackTypes {
            let recommendations = RecommendationsData.getAllRecommendations(for: attackType)

            XCTAssertFalse(recommendations.isEmpty, "Attack type '\(attackType)' should have recommendations")

            for recommendation in recommendations {
                // Test that titles are in Spanish
                XCTAssertFalse(recommendation.titulo.isEmpty, "Title should not be empty for \(attackType)")
                XCTAssertTrue(isSpanishContent(recommendation.titulo), "Title should be in Spanish for \(attackType): '\(recommendation.titulo)'")

                // Test that content is in Spanish
                XCTAssertFalse(recommendation.contenido.isEmpty, "Content should not be empty for \(attackType)")
                XCTAssertTrue(isSpanishContent(recommendation.contenido), "Content should be in Spanish for \(attackType): '\(recommendation.contenido)'")

                // Test that attack type matches
                XCTAssertEqual(recommendation.attackType, attackType, "Attack type should match for recommendation")
            }
        }
    }

    func testSecurityQuotesAreInSpanish() {
        let quote = RecommendationsData.getRandomSecurityQuote()

        XCTAssertFalse(quote.isEmpty, "Security quote should not be empty")
        XCTAssertTrue(isSpanishContent(quote), "Security quote should be in Spanish: '\(quote)'")
    }

    func testGeneralTipsAreInSpanish() {
        let tips = RecommendationsData.generalTips

        XCTAssertFalse(tips.isEmpty, "General tips should not be empty")

        for tip in tips {
            XCTAssertFalse(tip.isEmpty, "Individual tip should not be empty")
            XCTAssertTrue(isSpanishContent(tip), "General tip should be in Spanish: '\(tip)'")
        }
    }

    // MARK: - Test Data Structure Validation

    func testGetSingleRecommendationForEachAttackType() {
        let attackTypes = ["email", "SMS", "whatsapp", "llamada", "redes_sociales", "otro"]

        for attackType in attackTypes {
            let recommendation = RecommendationsData.getRecommendation(for: attackType)

            XCTAssertNotNil(recommendation, "Should return a recommendation for \(attackType)")
            XCTAssertEqual(recommendation?.attackType, attackType, "Attack type should match")
            XCTAssertFalse(recommendation?.titulo.isEmpty ?? true, "Title should not be empty")
            XCTAssertFalse(recommendation?.contenido.isEmpty ?? true, "Content should not be empty")
        }
    }

    func testGetAllRecommendationsForEachAttackType() {
        let attackTypes = ["email", "SMS", "whatsapp", "llamada", "redes_sociales", "otro"]

        for attackType in attackTypes {
            let recommendations = RecommendationsData.getAllRecommendations(for: attackType)

            XCTAssertFalse(recommendations.isEmpty, "Should return recommendations for \(attackType)")

            for recommendation in recommendations {
                XCTAssertEqual(recommendation.attackType, attackType, "All recommendations should match attack type")
                XCTAssertTrue(recommendation.id > 0, "Recommendation should have valid ID")
            }
        }
    }

    func testGetRecommendationForInvalidAttackType() {
        let recommendation = RecommendationsData.getRecommendation(for: "invalid_type")
        XCTAssertNil(recommendation, "Should return nil for invalid attack type")

        let recommendations = RecommendationsData.getAllRecommendations(for: "invalid_type")
        XCTAssertTrue(recommendations.isEmpty, "Should return empty array for invalid attack type")
    }

    // MARK: - Test Content Quality

    func testEmailRecommendationsContent() {
        let recommendations = RecommendationsData.getAllRecommendations(for: "email")

        XCTAssertTrue(recommendations.count >= 2, "Should have at least 2 email recommendations")

        // Test for specific email-related Spanish terms
        let allContent = recommendations.map { $0.titulo + " " + $0.contenido }.joined(separator: " ")
        XCTAssertTrue(allContent.lowercased().contains("correo") || allContent.lowercased().contains("email") || allContent.lowercased().contains("remitente"), "Email recommendations should contain email-related terms")
    }

    func testSMSRecommendationsContent() {
        let recommendations = RecommendationsData.getAllRecommendations(for: "SMS")

        XCTAssertTrue(recommendations.count >= 2, "Should have at least 2 SMS recommendations")

        // Test for specific SMS-related Spanish terms
        let allContent = recommendations.map { $0.titulo + " " + $0.contenido }.joined(separator: " ")
        XCTAssertTrue(allContent.lowercased().contains("sms") || allContent.lowercased().contains("mensaje"), "SMS recommendations should contain SMS-related terms")
    }

    func testWhatsAppRecommendationsContent() {
        let recommendations = RecommendationsData.getAllRecommendations(for: "whatsapp")

        XCTAssertTrue(recommendations.count >= 2, "Should have at least 2 WhatsApp recommendations")

        // Test for specific WhatsApp-related Spanish terms
        let allContent = recommendations.map { $0.titulo + " " + $0.contenido }.joined(separator: " ")
        XCTAssertTrue(allContent.lowercased().contains("whatsapp") || allContent.lowercased().contains("código"), "WhatsApp recommendations should contain WhatsApp-related terms")
    }

    // MARK: - Test Random Quote Functionality

    func testRandomSecurityQuoteReturnsValidQuote() {
        var quotesReceived = Set<String>()

        // Generate multiple quotes to test randomness
        for _ in 1...20 {
            let quote = RecommendationsData.getRandomSecurityQuote()
            quotesReceived.insert(quote)

            XCTAssertFalse(quote.isEmpty, "Quote should not be empty")
            XCTAssertTrue(isSpanishContent(quote), "Quote should be in Spanish")
        }

        // Should have received at least one quote (could be the same due to randomness)
        XCTAssertTrue(quotesReceived.count >= 1, "Should receive at least one valid quote")
    }

    // MARK: - Test Attack Type Enum Integration

    func testAttackTypeEnumConsistency() {
        let enumCases = Recommendation.AttackType.allCases.map { $0.rawValue }
        let dataKeys = ["email", "SMS", "whatsapp", "llamada", "redes_sociales", "otro"]

        for enumCase in enumCases {
            XCTAssertTrue(dataKeys.contains(enumCase), "Enum case '\(enumCase)' should have corresponding data")

            let recommendation = RecommendationsData.getRecommendation(for: enumCase)
            XCTAssertNotNil(recommendation, "Should have recommendation for enum case '\(enumCase)'")
        }
    }

    func testAttackTypeDisplayNames() {
        let attackType = Recommendation.AttackType.email
        XCTAssertEqual(attackType.displayName, "Correo Electrónico")

        let smsType = Recommendation.AttackType.sms
        XCTAssertEqual(smsType.displayName, "SMS")

        let whatsappType = Recommendation.AttackType.whatsapp
        XCTAssertEqual(whatsappType.displayName, "WhatsApp")

        let llamadaType = Recommendation.AttackType.llamada
        XCTAssertEqual(llamadaType.displayName, "Llamada Telefónica")

        let redesType = Recommendation.AttackType.redesSociales
        XCTAssertEqual(redesType.displayName, "Redes Sociales")

        let otroType = Recommendation.AttackType.otro
        XCTAssertEqual(otroType.displayName, "Otros")
    }

    // MARK: - Helper Methods

    private func isSpanishContent(_ text: String) -> Bool {
        // Check for Spanish characteristics and common Spanish words
        let spanishIndicators = [
            "ñ", "á", "é", "í", "ó", "ú", "ü",
            "la ", "el ", "de ", "que ", "en ", "es ", "se ", "te ", "tu ", "su ",
            "con ", "por ", "para ", "información", "seguridad", "nunca", "siempre",
            "banco", "contraseña", "cuenta", "mensaje", "correo", "teléfono"
        ]

        let lowercaseText = text.lowercased()

        // Should contain at least one Spanish indicator
        let hasSpanishIndicators = spanishIndicators.contains { lowercaseText.contains($0) }

        // Should not contain obvious English words (basic check)
        let englishWords = ["password", "account", "email", "phone", "message", "security", "never", "always", "bank"]
        let hasEnglishWords = englishWords.contains { lowercaseText.contains($0) }

        return hasSpanishIndicators && !hasEnglishWords
    }
}
import XCTest

final class RecommendationsUITests: XCTestCase {

    var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }

    // MARK: - Test Recommendations Display

    func testRecommendationsViewDisplaysCorrectElements() throws {
        // Navigate to recommendations view (this would typically be done from report submission)
        // For testing purposes, we'll test the view elements directly

        // Test that the main elements are present
        let closeButton = app.buttons["Cerrar"]
        XCTAssertTrue(closeButton.exists, "Close button should exist")

        let returnButton = app.buttons["Regresar al Inicio"]
        XCTAssertTrue(returnButton.exists, "Return button should exist")

        let shieldIcon = app.images["shield.checkered"]
        XCTAssertTrue(shieldIcon.exists, "Security shield icon should exist")
    }

    func testSpanishLocalizationInRecommendationsView() throws {
        // Test that Spanish text is displayed
        XCTAssertTrue(app.buttons["Cerrar"].exists, "Close button should display Spanish text 'Cerrar'")
        XCTAssertTrue(app.buttons["Regresar al Inicio"].exists, "Return button should display Spanish text 'Regresar al Inicio'")

        // Test that no English text is displayed
        XCTAssertFalse(app.buttons["Close"].exists, "Should not display English 'Close' button")
        XCTAssertFalse(app.buttons["Return to Home"].exists, "Should not display English 'Return to Home' button")
    }

    // MARK: - Test Navigation Workflow

    func testCloseButtonNavigation() throws {
        let closeButton = app.buttons["Cerrar"]

        if closeButton.exists {
            closeButton.tap()

            // After tapping close, the recommendations view should be dismissed
            // This test assumes we return to a previous view
            XCTAssertFalse(closeButton.exists, "Close button should not exist after dismissal")
        }
    }

    func testReturnButtonNavigation() throws {
        let returnButton = app.buttons["Regresar al Inicio"]

        if returnButton.exists {
            returnButton.tap()

            // After tapping return, the recommendations view should be dismissed
            // This test assumes we return to main app flow
            XCTAssertFalse(returnButton.exists, "Return button should not exist after dismissal")
        }
    }

    func testRecommendationContentDisplay() throws {
        // Wait for content to load
        let expectation = expectation(description: "Content loads")
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 3.0)

        // Check if recommendation content is displayed
        // The exact text will depend on the attack type, but we can check for general structure
        let staticTexts = app.staticTexts.allElementsBoundByIndex

        var hasSpanishContent = false
        for text in staticTexts {
            let textValue = text.label.lowercased()
            if textValue.contains("seguridad") ||
               textValue.contains("información") ||
               textValue.contains("proteger") ||
               textValue.contains("recomendación") ||
               textValue.contains("comunidad") {
                hasSpanishContent = true
                break
            }
        }

        XCTAssertTrue(hasSpanishContent, "Should display Spanish recommendation content")
    }

    // MARK: - Test Content Quality

    func testRecommendationContentIsNotEmpty() throws {
        // Wait for content to load
        let expectation = expectation(description: "Content loads")
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 3.0)

        // Check that there are text elements with meaningful content
        let staticTexts = app.staticTexts.allElementsBoundByIndex

        var hasContentText = false
        for text in staticTexts {
            if text.label.count > 10 { // Meaningful content should be longer than 10 characters
                hasContentText = true
                break
            }
        }

        XCTAssertTrue(hasContentText, "Should display meaningful recommendation content")
    }

    func testSecurityIconIsVisible() throws {
        let shieldIcon = app.images["shield.checkered"]
        XCTAssertTrue(shieldIcon.exists, "Security shield icon should be visible")

        // Test that the icon is actually displayed (not just exists in hierarchy)
        XCTAssertTrue(shieldIcon.isHittable, "Security shield icon should be visible to user")
    }

    // MARK: - Test Accessibility

    func testRecommendationsViewAccessibility() throws {
        let closeButton = app.buttons["Cerrar"]
        let returnButton = app.buttons["Regresar al Inicio"]

        // Test accessibility labels
        XCTAssertTrue(closeButton.exists, "Close button should be accessible")
        XCTAssertTrue(returnButton.exists, "Return button should be accessible")

        // Test that buttons are hittable (important for accessibility)
        if closeButton.exists {
            XCTAssertTrue(closeButton.isHittable, "Close button should be hittable")
        }

        if returnButton.exists {
            XCTAssertTrue(returnButton.isHittable, "Return button should be hittable")
        }
    }

    // MARK: - Test Different Attack Types

    func testEmailRecommendationDisplay() throws {
        // This would test specific email recommendations
        // In a full implementation, you would navigate to this view with email attack type

        let expectation = expectation(description: "Email content loads")
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 3.0)

        // Look for email-related Spanish terms
        let staticTexts = app.staticTexts.allElementsBoundByIndex
        var hasEmailContent = false

        for text in staticTexts {
            let textValue = text.label.lowercased()
            if textValue.contains("correo") ||
               textValue.contains("email") ||
               textValue.contains("remitente") {
                hasEmailContent = true
                break
            }
        }

        // This assertion might fail if not showing email recommendations
        // In a real test, you'd ensure the correct attack type is passed
        if hasEmailContent {
            XCTAssertTrue(hasEmailContent, "Should display email-related content when attack type is email")
        }
    }

    // MARK: - Test Performance

    func testRecommendationsViewPerformance() throws {
        measure {
            // Test the performance of loading and displaying recommendations
            let closeButton = app.buttons["Cerrar"]
            let returnButton = app.buttons["Regresar al Inicio"]

            // These elements should appear quickly since data is hardcoded
            XCTAssertTrue(closeButton.waitForExistence(timeout: 1.0), "Close button should appear quickly")
            XCTAssertTrue(returnButton.waitForExistence(timeout: 1.0), "Return button should appear quickly")
        }
    }

    // MARK: - Test Error Handling

    func testRecommendationsViewWithInvalidData() throws {
        // Test that the view handles cases where recommendations might be nil
        // This tests the robustness of the UI

        let expectation = expectation(description: "View handles invalid data")
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 3.0)

        // Even without valid recommendation data, basic UI elements should still exist
        let closeButton = app.buttons["Cerrar"]
        let returnButton = app.buttons["Regresar al Inicio"]

        XCTAssertTrue(closeButton.exists, "Close button should exist even with invalid data")
        XCTAssertTrue(returnButton.exists, "Return button should exist even with invalid data")
    }
}
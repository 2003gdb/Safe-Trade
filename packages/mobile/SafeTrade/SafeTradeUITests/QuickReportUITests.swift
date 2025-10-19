import XCTest

final class QuickReportUITests: XCTestCase {

    var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }

    override func tearDownWithError() throws {
        app = nil
    }

    // MARK: - Quick Report 3-Tap Workflow Tests

    func testQuickReport3TapWorkflow() throws {
        // Given: App is launched and user can access quick report
        // Navigate to quick report view (this depends on your app's navigation structure)
        // For this test, we assume there's a "Quick Report" button on the main screen

        let quickReportButton = app.buttons["Quick Report"] // Adjust identifier as needed
        if quickReportButton.exists {
            quickReportButton.tap()
        }

        // Step 1: Attack Type Selection
        XCTAssertTrue(app.staticTexts["1. Tipo de Ataque"].exists)
        XCTAssertTrue(app.staticTexts["Selecciona el tipo más común"].exists)

        // Tap on email attack type (most common)
        let emailButton = app.buttons["Correo Electrónico"]
        XCTAssertTrue(emailButton.exists)
        emailButton.tap()

        // Verify attack type is selected
        XCTAssertTrue(emailButton.isSelected || app.buttons["Siguiente"].isEnabled)

        // Tap next
        let nextButton = app.buttons["Siguiente"]
        XCTAssertTrue(nextButton.exists)
        nextButton.tap()

        // Step 2: Essential Details
        XCTAssertTrue(app.staticTexts["2. Detalles Esenciales"].exists)

        // Verify auto-populated date/time
        XCTAssertTrue(app.staticTexts["Auto-detectado"].exists)

        // Enter attack origin (required field)
        let attackOriginField = app.textFields["¿De dónde vino el ataque?"]
        XCTAssertTrue(attackOriginField.exists)
        attackOriginField.tap()
        attackOriginField.typeText("test@malicious.com")

        // Verify field completion indicator appears
        XCTAssertTrue(app.images["checkmark.circle.fill"].exists)

        // Tap next
        nextButton.tap()

        // Step 3: Impact and Submit
        XCTAssertTrue(app.staticTexts["3. Nivel de Impacto"].exists)
        XCTAssertTrue(app.staticTexts["¿Qué tan grave fue?"].exists)

        // Select impact level (Sin Impacto is default)
        let sinImpactoButton = app.buttons["Sin Impacto"]
        XCTAssertTrue(sinImpactoButton.exists)
        sinImpactoButton.tap()

        // Verify submit button is enabled
        let submitButton = app.buttons["Enviar Reporte"]
        XCTAssertTrue(submitButton.exists)
        XCTAssertTrue(submitButton.isEnabled)

        // This completes the 3-tap workflow test
        // Note: We don't actually submit to avoid creating test data
    }

    func testProgressIndicatorFunctionality() throws {
        // Navigate to quick report
        navigateToQuickReport()

        // Verify initial progress state
        let step1Circle = app.images.element(boundBy: 0) // First circle in progress indicator
        XCTAssertTrue(step1Circle.exists)

        // Progress through steps and verify indicators update
        selectAttackTypeAndProceed()

        // Verify step 1 shows checkmark, step 2 is active
        // Note: Specific implementation may vary based on accessibility identifiers

        fillEssentialDetailsAndProceed()

        // Verify step 2 shows checkmark, step 3 is active
        XCTAssertTrue(app.staticTexts["3"].exists) // Current step indicator
    }

    func testSwipeGestureNavigation() throws {
        navigateToQuickReport()

        // Complete step 1
        selectAttackTypeAndProceed()

        // Test swipe left to go to next step (if on step 2)
        let mainScrollView = app.scrollViews.firstMatch
        if mainScrollView.exists {
            mainScrollView.swipeLeft()
            // Verify navigation occurred (implementation specific)
        }

        // Test swipe right to go to previous step
        if mainScrollView.exists {
            mainScrollView.swipeRight()
            // Verify navigation occurred (implementation specific)
        }
    }

    func testAdvancedFieldsToggle() throws {
        navigateToQuickReport()
        selectAttackTypeAndProceed()

        // Look for "Más detalles" button
        let masDetallesButton = app.buttons["Más detalles"]
        XCTAssertTrue(masDetallesButton.exists)

        // Tap to expand advanced fields
        masDetallesButton.tap()

        // Verify advanced fields appear
        XCTAssertTrue(app.textFields["https://ejemplo-sospechoso.com"].exists)
        XCTAssertTrue(app.textFields["Describe el mensaje recibido..."].exists)

        // Tap again to collapse
        masDetallesButton.tap()

        // Verify advanced fields are hidden (this may require checking frame size or alpha)
    }

    func testFieldValidationAndCompletion() throws {
        navigateToQuickReport()
        selectAttackTypeAndProceed()

        // Test required field validation
        let nextButton = app.buttons["Siguiente"]

        // Initially, next should be disabled if required field is empty
        // (depends on your validation logic)

        // Fill required field
        let attackOriginField = app.textFields["¿De dónde vino el ataque?"]
        attackOriginField.tap()
        attackOriginField.typeText("test@example.com")

        // Verify completion indicator
        XCTAssertTrue(app.images["checkmark.circle.fill"].exists)

        // Verify next button becomes enabled
        XCTAssertTrue(nextButton.isEnabled)
    }

    func testDraftRecoveryAlert() throws {
        // This test would require setting up a draft first
        // and then relaunching the app, which is complex in UI tests

        // For now, we test the basic alert functionality
        navigateToQuickReport()

        // If a draft exists, we should see the recovery alert
        if app.alerts["Borrador Encontrado"].exists {
            let alert = app.alerts["Borrador Encontrado"]

            // Test alert buttons exist
            XCTAssertTrue(alert.buttons["Recuperar"].exists)
            XCTAssertTrue(alert.buttons["Empezar de Nuevo"].exists)
            XCTAssertTrue(alert.buttons["Cancelar"].exists)

            // Tap "Empezar de Nuevo" for this test
            alert.buttons["Empezar de Nuevo"].tap()
        }
    }

    func testLoadingStatesAndFeedback() throws {
        navigateToQuickReport()
        selectAttackTypeAndProceed()
        fillEssentialDetailsAndProceed()

        // Select impact level
        app.buttons["Sin Impacto"].tap()

        // Tap submit button
        let submitButton = app.buttons["Enviar Reporte"]
        submitButton.tap()

        // Verify loading state appears
        XCTAssertTrue(app.staticTexts["Enviando..."].exists)
        XCTAssertTrue(app.activityIndicators.firstMatch.exists)

        // Note: In a real test, you'd need to mock the network response
        // to control the loading state duration and outcome
    }

    func testOneHandedOperationOptimizations() throws {
        navigateToQuickReport()

        // Verify navigation buttons are positioned at bottom (thumb-friendly zone)
        let nextButton = app.buttons["Siguiente"]
        if nextButton.exists {
            let buttonFrame = nextButton.frame
            let screenHeight = app.frame.height

            // Button should be in bottom 40% of screen (thumb zone)
            XCTAssertGreaterThan(buttonFrame.minY, screenHeight * 0.6)
        }

        // Test touch target sizes are adequate (minimum 44pt)
        selectAttackTypeAndProceed()

        let attackTypeButtons = app.buttons.matching(identifier: "attackTypeButton")
        for i in 0..<attackTypeButtons.count {
            let button = attackTypeButtons.element(boundBy: i)
            if button.exists {
                XCTAssertGreaterThanOrEqual(button.frame.width, 44)
                XCTAssertGreaterThanOrEqual(button.frame.height, 44)
            }
        }
    }

    func testAccessibilityFeatures() throws {
        navigateToQuickReport()

        // Test VoiceOver accessibility
        XCTAssertTrue(app.staticTexts["Reporte Rápido"].isAccessibilityElement)
        XCTAssertTrue(app.staticTexts["Proceso rápido de 3 pasos"].isAccessibilityElement)

        // Test button accessibility
        let emailButton = app.buttons["Correo Electrónico"]
        if emailButton.exists {
            XCTAssertTrue(emailButton.isAccessibilityElement)
            XCTAssertNotNil(emailButton.label)
        }

        // Test form field accessibility
        selectAttackTypeAndProceed()

        let attackOriginField = app.textFields["¿De dónde vino el ataque?"]
        XCTAssertTrue(attackOriginField.isAccessibilityElement)
        XCTAssertNotNil(attackOriginField.placeholderValue)
    }

    // MARK: - Helper Methods

    private func navigateToQuickReport() {
        // Implement navigation to QuickReportView based on your app's structure
        // This is a placeholder - adjust according to your actual navigation

        let quickReportButton = app.buttons["QuickReport"] // Adjust identifier
        if quickReportButton.exists {
            quickReportButton.tap()
        }
    }

    private func selectAttackTypeAndProceed() {
        let emailButton = app.buttons["Correo Electrónico"]
        if emailButton.exists {
            emailButton.tap()
        }

        let nextButton = app.buttons["Siguiente"]
        if nextButton.exists && nextButton.isEnabled {
            nextButton.tap()
        }
    }

    private func fillEssentialDetailsAndProceed() {
        let attackOriginField = app.textFields["¿De dónde vino el ataque?"]
        if attackOriginField.exists {
            attackOriginField.tap()
            attackOriginField.typeText("test@malicious.com")
        }

        let nextButton = app.buttons["Siguiente"]
        if nextButton.exists && nextButton.isEnabled {
            nextButton.tap()
        }
    }
}
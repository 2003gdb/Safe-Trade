import XCTest
import UIKit
@testable import SafeTrade

class HapticFeedbackTests: XCTestCase {

    var hapticFeedback: HapticFeedback!

    override func setUpWithError() throws {
        super.setUp()
        hapticFeedback = HapticFeedback.shared
    }

    override func tearDownWithError() throws {
        hapticFeedback = nil
        super.tearDown()
    }

    // MARK: - Singleton Tests

    func testHapticFeedbackSingleton() {
        // Test that HapticFeedback is a singleton
        let instance1 = HapticFeedback.shared
        let instance2 = HapticFeedback.shared

        XCTAssertIdentical(instance1, instance2, "HapticFeedback should be a singleton")
    }

    // MARK: - Basic Feedback Methods Tests

    func testSuccessFeedback() {
        // Test success feedback doesn't crash and executes without error
        XCTAssertNoThrow(hapticFeedback.success(), "Success feedback should not throw")
    }

    func testErrorFeedback() {
        // Test error feedback doesn't crash and executes without error
        XCTAssertNoThrow(hapticFeedback.error(), "Error feedback should not throw")
    }

    func testWarningFeedback() {
        // Test warning feedback doesn't crash and executes without error
        XCTAssertNoThrow(hapticFeedback.warning(), "Warning feedback should not throw")
    }

    func testLightImpactFeedback() {
        // Test light impact feedback doesn't crash and executes without error
        XCTAssertNoThrow(hapticFeedback.lightImpact(), "Light impact feedback should not throw")
    }

    func testMediumImpactFeedback() {
        // Test medium impact feedback doesn't crash and executes without error
        XCTAssertNoThrow(hapticFeedback.mediumImpact(), "Medium impact feedback should not throw")
    }

    func testHeavyImpactFeedback() {
        // Test heavy impact feedback doesn't crash and executes without error
        XCTAssertNoThrow(hapticFeedback.heavyImpact(), "Heavy impact feedback should not throw")
    }

    func testSelectionChangedFeedback() {
        // Test selection changed feedback doesn't crash and executes without error
        XCTAssertNoThrow(hapticFeedback.selectionChanged(), "Selection changed feedback should not throw")
    }

    // MARK: - Convenience Methods Tests

    func testReportSubmissionSuccessFeedback() {
        // Test report submission success convenience method
        XCTAssertNoThrow(hapticFeedback.reportSubmissionSuccess(), "Report submission success feedback should not throw")
    }

    func testReportSubmissionErrorFeedback() {
        // Test report submission error convenience method
        XCTAssertNoThrow(hapticFeedback.reportSubmissionError(), "Report submission error feedback should not throw")
    }

    func testLoginSuccessFeedback() {
        // Test login success convenience method
        XCTAssertNoThrow(hapticFeedback.loginSuccess(), "Login success feedback should not throw")
    }

    func testLoginErrorFeedback() {
        // Test login error convenience method
        XCTAssertNoThrow(hapticFeedback.loginError(), "Login error feedback should not throw")
    }

    func testFormValidationErrorFeedback() {
        // Test form validation error convenience method
        XCTAssertNoThrow(hapticFeedback.formValidationError(), "Form validation error feedback should not throw")
    }

    func testButtonTapFeedback() {
        // Test button tap convenience method
        XCTAssertNoThrow(hapticFeedback.buttonTap(), "Button tap feedback should not throw")
    }

    func testCriticalActionFeedback() {
        // Test critical action convenience method
        XCTAssertNoThrow(hapticFeedback.criticalAction(), "Critical action feedback should not throw")
    }

    // MARK: - Preparation Methods Tests

    func testPrepareImpactFeedback() {
        // Test prepare impact feedback doesn't crash and executes without error
        XCTAssertNoThrow(hapticFeedback.prepareImpact(), "Prepare impact feedback should not throw")
    }

    func testPrepareNotificationFeedback() {
        // Test prepare notification feedback doesn't crash and executes without error
        XCTAssertNoThrow(hapticFeedback.prepareNotification(), "Prepare notification feedback should not throw")
    }

    // MARK: - Performance Tests

    func testHapticFeedbackPerformance() {
        // Test that haptic feedback calls complete quickly
        measure {
            hapticFeedback.success()
            hapticFeedback.error()
            hapticFeedback.lightImpact()
            hapticFeedback.mediumImpact()
            hapticFeedback.heavyImpact()
        }
    }

    // MARK: - Thread Safety Tests

    func testHapticFeedbackThreadSafety() {
        let expectation = XCTestExpectation(description: "Concurrent haptic feedback calls")
        let queue = DispatchQueue.global(qos: .userInitiated)

        // Execute multiple haptic feedback calls concurrently
        for i in 0..<10 {
            queue.async {
                switch i % 3 {
                case 0:
                    self.hapticFeedback.success()
                case 1:
                    self.hapticFeedback.error()
                default:
                    self.hapticFeedback.lightImpact()
                }

                if i == 9 {
                    expectation.fulfill()
                }
            }
        }

        wait(for: [expectation], timeout: 2.0)
    }

    // MARK: - Integration with iOS Feedback Generators

    func testHapticFeedbackIntegration() {
        // Test that our haptic feedback class properly integrates with iOS feedback generators
        // This is mainly to ensure no runtime errors occur when calling UIKit feedback methods

        let notificationGenerator = UINotificationFeedbackGenerator()
        XCTAssertNoThrow(notificationGenerator.notificationOccurred(.success))

        let impactGenerator = UIImpactFeedbackGenerator(style: .medium)
        XCTAssertNoThrow(impactGenerator.impactOccurred())

        let selectionGenerator = UISelectionFeedbackGenerator()
        XCTAssertNoThrow(selectionGenerator.selectionChanged())
    }
}
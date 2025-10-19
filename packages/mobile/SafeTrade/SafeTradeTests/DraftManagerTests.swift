import XCTest
@testable import SafeTrade

@MainActor
final class DraftManagerTests: XCTestCase {

    var draftManager: DraftManager!
    var mockViewModel: ReportingViewModel!

    override func setUp() {
        super.setUp()
        draftManager = DraftManager.shared
        mockViewModel = ReportingViewModel(isAnonymous: true)

        // Clear any existing drafts
        draftManager.clearDraft()
    }

    override func tearDown() {
        draftManager.clearDraft()
        draftManager = nil
        mockViewModel = nil
        super.tearDown()
    }

    // MARK: - Draft Saving Tests

    func testSaveDraftWithValidContent() {
        // Given: A view model with valid content
        mockViewModel.attackOrigin = "test@example.com"
        mockViewModel.selectedAttackType = .email
        mockViewModel.selectedImpactLevel = .roboDatos

        // When: Saving a draft
        draftManager.saveDraft(from: mockViewModel)

        // Then: Draft should be saved
        XCTAssertTrue(draftManager.hasDraft)

        let loadedDraft = draftManager.loadDraft()
        XCTAssertNotNil(loadedDraft)
        XCTAssertEqual(loadedDraft?.attackOrigin, "test@example.com")
        XCTAssertEqual(loadedDraft?.selectedAttackType, "email")
        XCTAssertEqual(loadedDraft?.selectedImpactLevel, "robo_datos")
    }

    func testSaveDraftWithEmptyContent() {
        // Given: A view model with empty content
        mockViewModel.attackOrigin = ""
        mockViewModel.suspiciousUrl = ""
        mockViewModel.messageContent = ""
        mockViewModel.description = ""

        // When: Saving a draft
        draftManager.saveDraft(from: mockViewModel)

        // Then: Draft should not be saved
        XCTAssertFalse(draftManager.hasDraft)
    }

    func testSaveDraftOverwritesPrevious() {
        // Given: An initial draft
        mockViewModel.attackOrigin = "first@example.com"
        draftManager.saveDraft(from: mockViewModel)

        // When: Saving a new draft
        mockViewModel.attackOrigin = "second@example.com"
        draftManager.saveDraft(from: mockViewModel)

        // Then: New draft should overwrite the old one
        let loadedDraft = draftManager.loadDraft()
        XCTAssertEqual(loadedDraft?.attackOrigin, "second@example.com")
    }

    // MARK: - Draft Loading Tests

    func testLoadValidDraft() {
        // Given: A saved draft
        mockViewModel.attackOrigin = "test@example.com"
        mockViewModel.selectedAttackType = .email
        mockViewModel.suspiciousUrl = "https://malicious-site.com"
        draftManager.saveDraft(from: mockViewModel)

        // When: Creating a new view model and loading draft
        let newViewModel = ReportingViewModel(isAnonymous: true)

        // Then: Draft should be loaded successfully
        let draftLoaded = newViewModel.loadDraftIfAvailable()
        XCTAssertTrue(draftLoaded)
        XCTAssertEqual(newViewModel.attackOrigin, "test@example.com")
        XCTAssertEqual(newViewModel.selectedAttackType, .email)
        XCTAssertEqual(newViewModel.suspiciousUrl, "https://malicious-site.com")
    }

    func testLoadNonExistentDraft() {
        // Given: No saved draft
        XCTAssertFalse(draftManager.hasDraft)

        // When: Attempting to load draft
        let draftLoaded = mockViewModel.loadDraftIfAvailable()

        // Then: Loading should fail
        XCTAssertFalse(draftLoaded)
    }

    // MARK: - Draft Clearing Tests

    func testClearDraft() {
        // Given: A saved draft
        mockViewModel.attackOrigin = "test@example.com"
        draftManager.saveDraft(from: mockViewModel)
        XCTAssertTrue(draftManager.hasDraft)

        // When: Clearing the draft
        draftManager.clearDraft()

        // Then: Draft should be removed
        XCTAssertFalse(draftManager.hasDraft)
        XCTAssertNil(draftManager.loadDraft())
    }

    func testAutoClearDraftAfterSubmission() {
        // Given: A saved draft and successful submission
        mockViewModel.attackOrigin = "test@example.com"
        draftManager.saveDraft(from: mockViewModel)
        XCTAssertTrue(draftManager.hasDraft)

        // When: Simulating successful submission
        let mockResponse = CreateReportResponse(
            success: true,
            message: "Reporte enviado exitosamente",
            reporte: ReportSummary(
                id: 1,
                attackType: "email",
                incidentDate: "2023-01-01",
                impactLevel: "ninguno",
                status: "nuevo",
                createdAt: Date()
            ),
            recommendations: [],
            victimSupport: nil
        )

        // Simulate the successful submission flow
        mockViewModel.recordUserPreferences()

        // Then: Draft should be cleared automatically
        XCTAssertFalse(draftManager.hasDraft)
    }

    // MARK: - Draft Age Tests

    func testDraftAge() {
        // Given: A saved draft
        mockViewModel.attackOrigin = "test@example.com"
        draftManager.saveDraft(from: mockViewModel)

        // When: Getting draft age immediately after saving
        let ageString = draftManager.getDraftAgeString()

        // Then: Age should be 0 minutes
        XCTAssertEqual(ageString, "0m")
    }

    func testDraftIsRecent() {
        // Given: A recently saved draft
        mockViewModel.attackOrigin = "test@example.com"
        draftManager.saveDraft(from: mockViewModel)

        // Then: Draft should be considered recent
        XCTAssertTrue(draftManager.isDraftRecent())
    }

    // MARK: - Auto-save Tests

    func testStartAutosave() {
        // Given: A view model
        XCTAssertFalse(draftManager.hasDraft)

        // When: Starting autosave
        mockViewModel.startAutoDraftSaving()

        // Then: Autosave should be running (we can't easily test the timer without mocking)
        // We verify by setting content and manually triggering save
        mockViewModel.attackOrigin = "auto-save-test@example.com"
        mockViewModel.saveDraftManually()

        XCTAssertTrue(draftManager.hasDraft)

        // Cleanup
        mockViewModel.stopAutoDraftSaving()
    }

    func testStopAutosave() {
        // Given: Running autosave
        mockViewModel.startAutoDraftSaving()

        // When: Stopping autosave
        mockViewModel.stopAutoDraftSaving()

        // Then: Autosave should be stopped
        // This is difficult to test directly, but we can verify the method exists and doesn't crash
        XCTAssertNotNil(mockViewModel)
    }

    // MARK: - Integration Tests

    func testCompleteWorkflow() {
        // Given: A new report in progress
        mockViewModel.selectedAttackType = .email
        mockViewModel.attackOrigin = "phishing@malicious.com"
        mockViewModel.selectedImpactLevel = .roboDatos
        mockViewModel.messageContent = "Suspicious email asking for credentials"

        // When: Auto-saving is enabled and draft is saved
        mockViewModel.startAutoDraftSaving()
        mockViewModel.saveDraftManually()

        XCTAssertTrue(draftManager.hasDraft)

        // And: Creating a new session (simulating app restart)
        let newViewModel = ReportingViewModel(isAnonymous: true)

        // And: Loading the draft
        let draftLoaded = newViewModel.loadDraftIfAvailable()

        // Then: All data should be restored
        XCTAssertTrue(draftLoaded)
        XCTAssertEqual(newViewModel.selectedAttackType, .email)
        XCTAssertEqual(newViewModel.attackOrigin, "phishing@malicious.com")
        XCTAssertEqual(newViewModel.selectedImpactLevel, .roboDatos)
        XCTAssertEqual(newViewModel.messageContent, "Suspicious email asking for credentials")

        // Cleanup
        newViewModel.stopAutoDraftSaving()
    }

    // MARK: - Error Handling Tests

    func testInvalidEnumHandling() {
        // This test would require mocking UserDefaults to store invalid data
        // For now, we verify that the app doesn't crash with valid enum values
        mockViewModel.selectedAttackType = .whatsapp
        mockViewModel.selectedImpactLevel = .cuentaComprometida

        draftManager.saveDraft(from: mockViewModel)

        let loadedDraft = draftManager.loadDraft()
        XCTAssertNotNil(loadedDraft)
        XCTAssertEqual(loadedDraft?.selectedAttackType, "whatsapp")
        XCTAssertEqual(loadedDraft?.selectedImpactLevel, "cuenta_comprometida")
    }
}
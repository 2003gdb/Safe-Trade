import Foundation
import Combine

// MARK: - Draft Model

struct ReportDraft: Codable {
    let id: UUID
    let createdAt: Date
    let lastModified: Date

    // Form data
    let isAnonymous: Bool
    let selectedAttackTypeId: Int?
    let selectedImpactId: Int?
    let incidentDate: Date // Combined date+time (matches DB schema)
    let attackOrigin: String
    let suspiciousUrl: String
    let messageContent: String
    let description: String

    // UI state
    let showAdvancedFields: Bool
    let currentStep: Int

    @MainActor init(from viewModel: ReportingViewModel, showAdvancedFields: Bool = false, currentStep: Int = 1) {
        self.id = UUID()
        self.createdAt = Date()
        self.lastModified = Date()

        self.isAnonymous = viewModel.isAnonymous
        self.selectedAttackTypeId = viewModel.selectedAttackTypeId
        self.selectedImpactId = viewModel.selectedImpactId
        self.incidentDate = viewModel.incidentDate
        self.attackOrigin = viewModel.attackOrigin
        self.suspiciousUrl = viewModel.suspiciousUrl
        self.messageContent = viewModel.messageContent
        self.description = viewModel.description

        self.showAdvancedFields = showAdvancedFields
        self.currentStep = currentStep
    }
}

// MARK: - Draft Manager

@MainActor
class DraftManager: ObservableObject {
    static let shared = DraftManager()

    @Published var hasDraft: Bool = false
    @Published var draftAge: TimeInterval = 0

    private let userDefaults = UserDefaults.standard
    private let draftKey = "report_draft"
    private let maxDraftAge: TimeInterval = 24 * 60 * 60 // 24 hours

    private var autosaveTimer: Timer?
    private var draftAgeTimer: Timer?

    private init() {
        checkForExistingDraft()
        startDraftAgeTimer()
    }

    deinit {
        Task { @MainActor in
            self.stopAutosave()
            self.stopDraftAgeTimer()
        }
    }

    // MARK: - Draft Management

    func startAutosave(for viewModel: ReportingViewModel, showAdvancedFields: Bool = false, currentStep: Int = 1) {
        stopAutosave() // Stop any existing timer

        autosaveTimer = Timer.scheduledTimer(withTimeInterval: 30.0, repeats: true) { [weak self, weak viewModel] _ in
            guard let self = self, let viewModel = viewModel else { return }

            Task { @MainActor in
                self.saveDraft(from: viewModel, showAdvancedFields: showAdvancedFields, currentStep: currentStep)
            }
        }
    }

    func stopAutosave() {
        autosaveTimer?.invalidate()
        autosaveTimer = nil
    }

    func saveDraft(from viewModel: ReportingViewModel, showAdvancedFields: Bool = false, currentStep: Int = 1) {
        // Only save if there's meaningful content
        guard shouldSaveDraft(from: viewModel) else { return }

        let draft = ReportDraft(from: viewModel, showAdvancedFields: showAdvancedFields, currentStep: currentStep)

        do {
            let data = try JSONEncoder().encode(draft)
            userDefaults.set(data, forKey: draftKey)
            hasDraft = true
            draftAge = 0

            print("Draft saved successfully")
        } catch {
            print("Failed to save draft: \(error)")
        }
    }

    func loadDraft() -> ReportDraft? {
        guard let data = userDefaults.data(forKey: draftKey) else { return nil }

        do {
            let draft = try JSONDecoder().decode(ReportDraft.self, from: data)

            // Check if draft is not too old
            let draftAge = Date().timeIntervalSince(draft.lastModified)
            if draftAge > maxDraftAge {
                clearDraft()
                return nil
            }

            return draft
        } catch {
            print("Failed to load draft: \(error)")
            clearDraft() // Clear corrupted draft
            return nil
        }
    }

    func clearDraft() {
        userDefaults.removeObject(forKey: draftKey)
        hasDraft = false
        draftAge = 0
        stopAutosave()

        print("Draft cleared")
    }

    func applyDraft(to viewModel: ReportingViewModel, draft: ReportDraft) {
        // Apply draft data to view model
        viewModel.selectedAttackTypeId = draft.selectedAttackTypeId
        viewModel.selectedImpactId = draft.selectedImpactId
        viewModel.incidentDate = draft.incidentDate
        viewModel.attackOrigin = draft.attackOrigin
        viewModel.suspiciousUrl = draft.suspiciousUrl
        viewModel.messageContent = draft.messageContent
        viewModel.description = draft.description

        print("Draft applied successfully")
    }

    // MARK: - Helper Methods

    private func shouldSaveDraft(from viewModel: ReportingViewModel) -> Bool {
        // Don't save if form is mostly empty
        let hasContent = !viewModel.attackOrigin.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ||
                        !viewModel.suspiciousUrl.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ||
                        !viewModel.messageContent.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ||
                        !viewModel.description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty

        return hasContent
    }

    private func checkForExistingDraft() {
        if let draft = loadDraft() {
            hasDraft = true
            draftAge = Date().timeIntervalSince(draft.lastModified)
        } else {
            hasDraft = false
            draftAge = 0
        }
    }

    private func startDraftAgeTimer() {
        draftAgeTimer = Timer.scheduledTimer(withTimeInterval: 60.0, repeats: true) { [weak self] _ in
            guard let self = self else { return }

            Task { @MainActor in
                if self.hasDraft, let draft = self.loadDraft() {
                    self.draftAge = Date().timeIntervalSince(draft.lastModified)

                    // Auto-clear old drafts
                    if self.draftAge > self.maxDraftAge {
                        self.clearDraft()
                    }
                }
            }
        }
    }

    private func stopDraftAgeTimer() {
        draftAgeTimer?.invalidate()
        draftAgeTimer = nil
    }

    // MARK: - Public Helpers

    func getDraftAgeString() -> String {
        let minutes = Int(draftAge / 60)
        let hours = minutes / 60

        if hours > 0 {
            return "\(hours)h \(minutes % 60)m"
        } else {
            return "\(minutes)m"
        }
    }

    func isDraftRecent() -> Bool {
        return draftAge < 30 * 60 // 30 minutes
    }
}
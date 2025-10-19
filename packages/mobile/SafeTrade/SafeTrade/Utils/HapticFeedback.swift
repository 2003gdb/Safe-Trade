import UIKit

class HapticFeedback {
    static let shared = HapticFeedback()

    private init() {}

    // MARK: - Success Feedback
    func success() {
        let impactFeedback = UINotificationFeedbackGenerator()
        impactFeedback.notificationOccurred(.success)
    }

    // MARK: - Error Feedback
    func error() {
        let impactFeedback = UINotificationFeedbackGenerator()
        impactFeedback.notificationOccurred(.error)
    }

    // MARK: - Warning Feedback
    func warning() {
        let impactFeedback = UINotificationFeedbackGenerator()
        impactFeedback.notificationOccurred(.warning)
    }

    // MARK: - Light Impact Feedback
    func lightImpact() {
        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
        impactFeedback.impactOccurred()
    }

    // MARK: - Medium Impact Feedback
    func mediumImpact() {
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.impactOccurred()
    }

    // MARK: - Heavy Impact Feedback
    func heavyImpact() {
        let impactFeedback = UIImpactFeedbackGenerator(style: .heavy)
        impactFeedback.impactOccurred()
    }

    // MARK: - Selection Changed Feedback
    func selectionChanged() {
        let selectionFeedback = UISelectionFeedbackGenerator()
        selectionFeedback.selectionChanged()
    }

    // MARK: - Prepare Feedback (for better responsiveness)
    func prepareImpact() {
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.prepare()
    }

    func prepareNotification() {
        let notificationFeedback = UINotificationFeedbackGenerator()
        notificationFeedback.prepare()
    }
}

// MARK: - Convenience Methods for Common Actions
extension HapticFeedback {
    func reportSubmissionSuccess() {
        success()
    }

    func reportSubmissionError() {
        error()
    }

    func loginSuccess() {
        success()
    }

    func loginError() {
        error()
    }

    func formValidationError() {
        warning()
    }

    func buttonTap() {
        lightImpact()
    }

    func criticalAction() {
        heavyImpact()
    }
}
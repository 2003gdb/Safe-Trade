import SwiftUI
import UIKit

// MARK: - One-Handed Operation Utilities

struct OneHandedOperation {

    /// Defines the thumb-friendly zone for different device sizes
    static func thumbZoneHeight(for screenHeight: CGFloat) -> CGFloat {
        // Bottom 40% of screen is generally reachable with thumb
        return screenHeight * 0.4
    }

    /// Check if a point is in the thumb-friendly zone
    static func isInThumbZone(point: CGPoint, screenSize: CGSize) -> Bool {
        let thumbZoneHeight = thumbZoneHeight(for: screenSize.height)
        let thumbZoneStart = screenSize.height - thumbZoneHeight

        // Also consider horizontal reachability
        let horizontalReachable = point.x <= screenSize.width * 0.85 // Right thumb can reach ~85% of width

        return point.y >= thumbZoneStart && horizontalReachable
    }

    // MARK: - Layout Helpers

    /// Recommended padding for thumb-friendly buttons
    static let thumbFriendlyPadding: CGFloat = 44

    /// Minimum button size for thumb-friendly interaction
    static let minimumTouchTarget: CGFloat = 44

    /// Spacing between thumb-friendly elements
    static let thumbFriendlySpacing: CGFloat = 16

    // MARK: - Device Detection

    static var isSmallDevice: Bool {
        return UIScreen.main.bounds.height <= 667 // iPhone SE, 6, 7, 8
    }

    static var isLargeDevice: Bool {
        return UIScreen.main.bounds.height >= 812 // iPhone X and later
    }

    // MARK: - Action Button Positioning

    /// Calculates optimal position for primary action button
    static func primaryActionButtonFrame(in geometry: GeometryProxy) -> CGRect {
        let screenSize = geometry.size
        let buttonHeight: CGFloat = 50
        let bottomPadding: CGFloat = geometry.safeAreaInsets.bottom + 20

        return CGRect(
            x: 20,
            y: screenSize.height - buttonHeight - bottomPadding,
            width: screenSize.width - 40,
            height: buttonHeight
        )
    }

    /// Calculates optimal position for secondary action button
    static func secondaryActionButtonFrame(in geometry: GeometryProxy, below primaryButton: CGRect) -> CGRect {
        let buttonHeight: CGFloat = 44
        let spacing: CGFloat = 12

        return CGRect(
            x: 20,
            y: primaryButton.minY - buttonHeight - spacing,
            width: geometry.size.width - 40,
            height: buttonHeight
        )
    }
}

// MARK: - SwiftUI Modifiers

extension View {
    /// Positions view in thumb-friendly zone
    func inThumbZone() -> some View {
        self.padding(.bottom, OneHandedOperation.thumbFriendlyPadding)
    }
}


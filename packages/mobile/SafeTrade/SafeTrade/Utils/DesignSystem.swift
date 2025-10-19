import SwiftUI

// MARK: - BMAD Design System
// Colors and styles inspired by /inpo React components

struct DesignSystem {

    // MARK: - Colors (Exact from /inpo)
    struct Colors {
        // Primary brand colors from /inpo
        static let safetradeBlue = Color(hex: "A1CDF4")
        static let safetradeOrange = Color(hex: "F5853F")
        static let safetradeDark = Color(hex: "25283D")

        // Background colors
        static let backgroundGradientStart = safetradeBlue.opacity(0.1)
        static let backgroundGradientEnd = Color(.systemBackground)

        // Card colors (glassmorphism effect)
        static let cardBackground = Color.white.opacity(0.7)
        static let cardBackgroundSecondary = safetradeBlue.opacity(0.1)

        // Border colors
        static let borderPrimary = safetradeBlue.opacity(0.3)
        static let borderFocused = safetradeBlue

        // Text colors
        static let textPrimary = safetradeDark
        static let textSecondary = Color(.secondaryLabel)

        // Status colors (for badges and indicators)
        static let statusAccepted = Color.green
        static let statusInProgress = Color.yellow
        static let statusRejected = Color.red
    }

    // MARK: - Spacing
    struct Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 20
        static let xxl: CGFloat = 24
        static let xxxl: CGFloat = 30
    }

    // MARK: - Corner Radius (Removed - no rounded corners)
    struct CornerRadius {
        static let none: CGFloat = 0
    }

    // MARK: - Typography
    struct Typography {
        static let buttonFont = Font.headline.weight(.semibold)
        static let labelFont = Font.subheadline.weight(.medium)
        static let captionFont = Font.caption
    }
}

// MARK: - Color Extension for Hex Support
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - View Modifiers

// Background gradient (like /inpo)
struct BMadBackgroundGradient: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(
                LinearGradient(
                    gradient: Gradient(stops: [
                        .init(color: DesignSystem.Colors.backgroundGradientStart, location: 0),
                        .init(color: DesignSystem.Colors.backgroundGradientEnd, location: 1)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
    }
}

// Glassmorphism card style (like /inpo bg-white/70 backdrop-blur-sm) - no shadows, no rounded
struct BMadCard: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(
                DesignSystem.Colors.cardBackground
                    .background(.ultraThinMaterial)
            )
    }
}

// Primary button style (safetradeOrange) - no shadows, no rounded
struct BMadPrimaryButton: ViewModifier {
    let isDisabled: Bool

    init(isDisabled: Bool = false) {
        self.isDisabled = isDisabled
    }

    func body(content: Content) -> some View {
        content
            .frame(maxWidth: .infinity)
            .padding(.vertical, DesignSystem.Spacing.lg)
            .padding(.horizontal, DesignSystem.Spacing.xl)
            .background(isDisabled ? Color.gray : DesignSystem.Colors.safetradeOrange)
            .foregroundColor(.white)
    }
}

// Input field style - with rounded corners
struct BMadInputField: ViewModifier {
    let isFocused: Bool

    init(isFocused: Bool = false) {
        self.isFocused = isFocused
    }

    func body(content: Content) -> some View {
        content
            .padding(.vertical, DesignSystem.Spacing.lg)
            .padding(.horizontal, DesignSystem.Spacing.lg)
            .background(Color.white)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(
                        isFocused ? DesignSystem.Colors.safetradeOrange : DesignSystem.Colors.borderPrimary,
                        lineWidth: 1
                    )
            )
            .cornerRadius(8)
    }
}

// Toggle/Switch background style - no rounded corners
struct BMadToggleBackground: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(.vertical, DesignSystem.Spacing.lg)
            .padding(.horizontal, DesignSystem.Spacing.xl)
            .background(DesignSystem.Colors.cardBackgroundSecondary)
    }
}

// Dropdown/Picker style - with rounded corners, full width
struct BMadPicker: ViewModifier {
    func body(content: Content) -> some View {
        content
            .pickerStyle(.menu)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.vertical, DesignSystem.Spacing.lg)
            .padding(.horizontal, DesignSystem.Spacing.lg)
            .background(Color.white)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(DesignSystem.Colors.borderPrimary, lineWidth: 1)
            )
            .cornerRadius(8)
            .accentColor(DesignSystem.Colors.safetradeOrange)
    }
}

// MARK: - View Extensions
extension View {
    func bmadBackgroundGradient() -> some View {
        modifier(BMadBackgroundGradient())
    }

    func bmadCard() -> some View {
        modifier(BMadCard())
    }

    func bmadPrimaryButton(isDisabled: Bool = false) -> some View {
        modifier(BMadPrimaryButton(isDisabled: isDisabled))
    }

    func bmadInputField(isFocused: Bool = false) -> some View {
        modifier(BMadInputField(isFocused: isFocused))
    }

    func bmadToggleBackground() -> some View {
        modifier(BMadToggleBackground())
    }

    func bmadPicker() -> some View {
        modifier(BMadPicker())
    }
}
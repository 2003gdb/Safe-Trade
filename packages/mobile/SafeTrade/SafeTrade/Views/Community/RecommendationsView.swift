import SwiftUI

struct RecommendationsView: View {
    let attackType: String
    let onReturnToMain: (() -> Void)?
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = RecommendationsViewModel()

    init(attackType: String, onReturnToMain: (() -> Void)? = nil) {
        self.attackType = attackType
        self.onReturnToMain = onReturnToMain
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header with close button
            HStack {
                Spacer()
                Button("Cerrar") {
                    if let onReturnToMain = onReturnToMain {
                        onReturnToMain()
                    } else {
                        dismiss()
                    }
                }
                .font(.headline)
                .foregroundColor(DesignSystem.Colors.safetradeOrange)
            }
            .padding()

            Spacer()

            // Main content with quote
            VStack(spacing: 32) {
                // Shield icon with circle background
                ZStack {
                    Circle()
                        .fill(DesignSystem.Colors.safetradeBlue)
                        .frame(width: 100, height: 100)

                    Image(systemName: "shield.fill")
                        .font(.system(size: 40, weight: .medium))
                        .foregroundColor(DesignSystem.Colors.safetradeDark)
                }

                // Security quote
                Text(viewModel.securityQuote)
                    .font(.title2)
                    .multilineTextAlignment(.center)
                    .foregroundColor(DesignSystem.Colors.textPrimary)
                    .padding(.horizontal, 24)

                // Recommendation tip for this attack type
                if let recommendation = viewModel.recommendation {
                    VStack(spacing: 16) {
                        Text(recommendation.titulo)
                            .font(.headline)
                            .multilineTextAlignment(.center)
                            .foregroundColor(DesignSystem.Colors.safetradeOrange)

                        Text(recommendation.contenido)
                            .font(.body)
                            .multilineTextAlignment(.center)
                            .foregroundColor(DesignSystem.Colors.textSecondary)
                            .padding(.horizontal, 16)
                    }
                    .padding()
                    .background(DesignSystem.Colors.cardBackgroundSecondary)
                    .padding(.horizontal, 24)
                }
            }

            Spacer()

            // Return button
            Button(action: {
                if let onReturnToMain = onReturnToMain {
                    onReturnToMain()
                } else {
                    dismiss()
                }
            }) {
                Text("Regresar al Inicio")
                    .font(DesignSystem.Typography.buttonFont)
                    .bmadPrimaryButton()
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
        .bmadBackgroundGradient()
        .onAppear {
            viewModel.loadRecommendation(for: attackType)
        }
    }
}

// MARK: - Preview
struct RecommendationsView_Previews: PreviewProvider {
    static var previews: some View {
        RecommendationsView(attackType: "email")
    }
}
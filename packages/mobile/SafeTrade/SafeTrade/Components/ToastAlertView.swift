import SwiftUI

struct ToastAlertView: View {
    let alert: CommunityAlert

    var body: some View {
        VStack(alignment: .leading, spacing: DesignSystem.Spacing.lg) {
            // Header con badge
            HStack {
                Image(systemName: alertIcon)
                    .font(.title2)
                    .foregroundColor(alertColor)

                Text("Estado de Alerta")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(DesignSystem.Colors.textPrimary)

                Spacer()

                // Badge con texto descriptivo
                Text(alertLevelText)
                    .font(.caption2)
                    .fontWeight(.bold)
                    .foregroundColor(alertColor)
                    .padding(.horizontal, DesignSystem.Spacing.md)
                    .padding(.vertical, DesignSystem.Spacing.xs)
                    .background(alertColor.opacity(0.1))
                    .cornerRadius(8)
            }

            // Mensaje de alerta (sin límite de líneas)
            Text(alert.mensaje)
                .font(.body)
                .foregroundColor(DesignSystem.Colors.textPrimary)
                .fixedSize(horizontal: false, vertical: true)
                .multilineTextAlignment(.leading)
        }
        .padding(DesignSystem.Spacing.xl)
        .frame(maxWidth: 340)
        .background(
            Color.white
                .background(.ultraThinMaterial)
        )
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(DesignSystem.Colors.borderPrimary, lineWidth: 1)
        )
    }

    private var alertColor: Color {
        switch alert.nivel.lowercased() {
        case "rojo": return .red
        case "amarillo": return DesignSystem.Colors.safetradeOrange
        default: return .green
        }
    }

    private var alertIcon: String {
        switch alert.nivel.lowercased() {
        case "rojo": return "exclamationmark.triangle.fill"
        case "amarillo": return "exclamationmark.circle.fill"
        default: return "checkmark.circle.fill"
        }
    }

    private var alertLevelText: String {
        switch alert.nivel.lowercased() {
        case "rojo": return "ALERTA CRÍTICA"
        case "amarillo": return "PRECAUCIÓN"
        default: return "NORMAL"
        }
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 20) {
        // Alerta Roja
        ToastAlertView(alert: CommunityAlert(
            nivel: "rojo",
            mensaje: "ALERTA ALTA: Se ha detectado un incremento significativo en ataques cibernéticos. Phishing es la amenaza predominante. Extrema precaución.",
            ultimaActualizacion: Date().ISO8601Format()
        ))

        // Alerta Amarilla
        ToastAlertView(alert: CommunityAlert(
            nivel: "amarillo",
            mensaje: "PRECAUCIÓN: Actividad cibernética elevada detectada. Phishing requiere atención. Mantente alerta.",
            ultimaActualizacion: Date().ISO8601Format()
        ))

        // Alerta Verde
        ToastAlertView(alert: CommunityAlert(
            nivel: "verde",
            mensaje: "ESTADO NORMAL: Actividad cibernética dentro de parámetros normales. Continúa con buenas prácticas de seguridad.",
            ultimaActualizacion: Date().ISO8601Format()
        ))
    }
    .padding()
    .bmadBackgroundGradient()
}
